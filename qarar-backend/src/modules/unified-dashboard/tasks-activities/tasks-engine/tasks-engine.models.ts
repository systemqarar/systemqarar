import db from '../../../../config/db';
import { CreateActivityDTO, CreateTaskDTO, Task, TaskAssignment } from './tasks-engine.types';

const pool = db.pool;

export class TasksEngineModel {

  // ==================== 1. إدارة الأنشطة البرامجية واللجان ====================

  static async createActivity(userId: string, data: CreateActivityDTO) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const actResult = await client.query(
        `INSERT INTO activities (title, description, unit_id, created_by, creation_source, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          data.title, 
          data.description || null, 
          data.unit_id || null, 
          userId, 
          data.creation_source || 'manual', 
          data.start_date || null, 
          data.end_date || null
        ]
      );
      const activity = actResult.rows[0];

      const committees = [];
      if (data.committees && data.committees.length > 0) {
        for (const comm of data.committees) {
          const commResult = await client.query(
            `INSERT INTO activity_committees (activity_id, name, leader_id, description)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [activity.id, comm.name, comm.leader_id || null, comm.description || null]
          );
          committees.push(commResult.rows[0]);
        }
      }

      await client.query('COMMIT');
      return { ...activity, committees };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getActivitiesWithTree() {
    const query = `
      SELECT 
        a.*,
        u.username as creator_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'leader_id', c.leader_id,
              'description', c.description
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as committees,
        (SELECT COUNT(*) FROM tasks t WHERE t.activity_id = a.id) as total_tasks
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN activity_committees c ON a.id = c.activity_id
      GROUP BY a.id, u.username
      ORDER BY a.created_at DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  // 🎯 جلب تفاصيل نشاط محدد بالكامل
  static async getActivityByIdWithTree(activityId: string) {
    const query = `
      SELECT 
        a.*,
        u.username as creator_name,
        -- اللجان التابعة للنشاط مع قادتها ومهامهم
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name', c.name,
                'leader_id', c.leader_id,
                'leader_name', lu.username,
                'description', c.description,
                'tasks', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', t.id,
                        'activity_id', t.activity_id,
                        'committee_id', t.committee_id,
                        'title', t.title,
                        'description', t.description,
                        'action_type', t.action_type,
                        'assignment_type', t.assignment_type,
                        'max_volunteers', t.max_volunteers,
                        'priority', t.priority,
                        'status', t.status,
                        'due_time', t.due_time,
                        'assignments', COALESCE(
                          (
                            SELECT json_agg(
                              json_build_object(
                                'assignment_id', ta.id,
                                'volunteer_id', ta.volunteer_id,
                                'status', ta.status,
                                'assigned_at', ta.assigned_at
                              )
                            ) FROM task_assignments ta WHERE ta.task_id = t.id
                          ), '[]'
                        )
                      )
                    ) FROM tasks t WHERE t.committee_id = c.id
                  ), '[]'
                )
              )
            ) FROM activity_committees c
            LEFT JOIN users lu ON c.leader_id = lu.id
            WHERE c.activity_id = a.id
          ), '[]'
        ) as committees,

        -- 🎯 المهام المباشرة التابعة للنشاط
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', dt.id,
                'activity_id', dt.activity_id,
                'committee_id', dt.committee_id,
                'title', dt.title,
                'description', dt.description,
                'action_type', dt.action_type,
                'assignment_type', dt.assignment_type,
                'max_volunteers', dt.max_volunteers,
                'priority', dt.priority,
                'status', dt.status,
                'due_time', dt.due_time,
                'assignments', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'assignment_id', ta.id,
                        'volunteer_id', ta.volunteer_id,
                        'status', ta.status,
                        'assigned_at', ta.assigned_at
                      )
                    ) FROM task_assignments ta WHERE ta.task_id = dt.id
                  ), '[]'
                )
              )
            ) FROM tasks dt WHERE dt.activity_id = a.id AND dt.committee_id IS NULL
          ), '[]'
        ) as tasks,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', dt.id,
                'activity_id', dt.activity_id,
                'committee_id', dt.committee_id,
                'title', dt.title,
                'description', dt.description,
                'action_type', dt.action_type,
                'assignment_type', dt.assignment_type,
                'max_volunteers', dt.max_volunteers,
                'priority', dt.priority,
                'status', dt.status,
                'due_time', dt.due_time,
                'assignments', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'assignment_id', ta.id,
                        'volunteer_id', ta.volunteer_id,
                        'status', ta.status,
                        'assigned_at', ta.assigned_at
                      )
                    ) FROM task_assignments ta WHERE ta.task_id = dt.id
                  ), '[]'
                )
              )
            ) FROM tasks dt WHERE dt.activity_id = a.id AND dt.committee_id IS NULL
          ), '[]'
        ) as direct_tasks

      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1;
    `;
    const res = await pool.query(query, [activityId]);
    return res.rows[0] || null;
  }

  static async addCommittee(activityId: string, name: string, leaderId?: string, description?: string) {
    const query = `
      INSERT INTO activity_committees (activity_id, name, leader_id, description)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const res = await pool.query(query, [activityId, name, leaderId || null, description || null]);
    return res.rows[0];
  }

  static async updateCommittee(committeeId: string, data: { name?: string; leader_id?: string; description?: string }) {
    const query = `
      UPDATE activity_committees
      SET 
        name = COALESCE($1, name),
        leader_id = COALESCE($2, leader_id),
        description = COALESCE($3, description)
      WHERE id = $4 RETURNING *;
    `;
    const res = await pool.query(query, [data.name || null, data.leader_id || null, data.description || null, committeeId]);
    return res.rows[0];
  }


  // ==================== 2. إدارة المهام (المستقلة والتابعة) ====================

  static async createTask(userId: string, data: CreateTaskDTO) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const taskResult = await client.query(
        `INSERT INTO tasks (
          activity_id, committee_id, title, description, created_by,
          action_type, target_form_id, assignment_type, max_volunteers,
          priority, start_time, due_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          data.activity_id || null,
          data.committee_id || null,
          data.title,
          data.description || null,
          userId,
          data.action_type || 'standard',
          data.target_form_id || null,
          data.assignment_type || 'direct',
          data.max_volunteers || 1,
          data.priority || 'normal',
          data.start_time || null,
          data.due_time
        ]
      );
      const task = taskResult.rows[0];

      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'created', $3)`,
        [task.id, userId, `تم إنشاء المهمة بنجاح: ${task.title}`]
      );

      if (data.assignee_ids && data.assignee_ids.length > 0) {
        for (const volId of data.assignee_ids) {
          await client.query(
            `INSERT INTO task_assignments (task_id, volunteer_id, assigned_by, assignment_mode)
             VALUES ($1, $2, $3, 'direct')`,
            [task.id, volId, userId]
          );
        }
      }

      await client.query('COMMIT');
      return task;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTasks(filters: { activity_id?: string; committee_id?: string; is_standalone?: boolean; status?: string }) {
    let query = `
      SELECT 
        t.*,
        u.username as creator_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'assignment_id', ta.id,
              'volunteer_id', ta.volunteer_id,
              'status', ta.status,
              'assigned_at', ta.assigned_at
            )
          ) FILTER (WHERE ta.id IS NOT NULL), '[]'
        ) as assignments
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.is_standalone) {
      query += ` AND t.activity_id IS NULL`;
    } else if (filters.activity_id) {
      params.push(filters.activity_id);
      query += ` AND t.activity_id = $${params.length}`;
    }

    if (filters.committee_id) {
      params.push(filters.committee_id);
      query += ` AND t.committee_id = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND t.status = $${params.length}`;
    }

    query += ` GROUP BY t.id, u.username ORDER BY t.due_time ASC;`;
    const res = await pool.query(query, params);
    return res.rows;
  }

  static async updateTask(taskId: string, data: Partial<CreateTaskDTO>) {
    const query = `
      UPDATE tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        max_volunteers = COALESCE($3, max_volunteers),
        priority = COALESCE($4, priority),
        due_time = COALESCE($5, due_time),
        status = COALESCE($6, status)
      WHERE id = $7 RETURNING *;
    `;
    const res = await pool.query(query, [
      data.title || null,
      data.description || null,
      data.max_volunteers || null,
      data.priority || null,
      data.due_time || null,
      (data as any).status || null,
      taskId
    ]);
    return res.rows[0];
  }


  // ==================== 3. الانضمام، الاعتذار وإدارة المتطوعين ====================

  static async applyForOpenTask(taskId: string, volunteerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const countRes = await client.query(
        `SELECT COUNT(*) FROM task_assignments 
         WHERE volunteer_id = $1 AND status IN ('assigned', 'accepted', 'in_progress')`,
        [volunteerId]
      );
      if (parseInt(countRes.rows[0].count) >= 3) {
        throw new Error('تجاوزت الحد الأقصى للمهام المفتوحة المسموح بها في نفس الوقت (3 مهام).');
      }

      const taskRes = await client.query(`SELECT max_volunteers, title FROM tasks WHERE id = $1`, [taskId]);
      if (taskRes.rows.length === 0) throw new Error('المهمة غير موجودة.');

      const currentAssigned = await client.query(
        `SELECT COUNT(*) FROM task_assignments WHERE task_id = $1 AND status != 'excused'`,
        [taskId]
      );

      if (parseInt(currentAssigned.rows[0].count) >= taskRes.rows[0].max_volunteers) {
        throw new Error('عذراً، اكتمل عدد المتطوعين المكتفين لهذه المهمة.');
      }

      const assignRes = await client.query(
        `INSERT INTO task_assignments (task_id, volunteer_id, assignment_mode, status)
         VALUES ($1, $2, 'self_applied', 'accepted') RETURNING *`,
        [taskId, volunteerId]
      );

      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'assigned', 'انضمام ذاتي للمهمة عبر سوق الفرص')`,
        [taskId, volunteerId]
      );

      await client.query('COMMIT');
      return assignRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 🎯 إضافة دالة الإسناد المباشر للمتطوع بواسطة المشرف
  static async assignVolunteerToTask(taskId: string, targetVolunteerId: string, assignedByUserId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // التحقق من وجود المهمة والطاقة الاستيعابية
      const taskRes = await client.query(`SELECT max_volunteers, title FROM tasks WHERE id = $1`, [taskId]);
      if (taskRes.rows.length === 0) throw new Error('المهمة غير موجودة.');

      const currentAssigned = await client.query(
        `SELECT COUNT(*) FROM task_assignments WHERE task_id = $1 AND status != 'excused'`,
        [taskId]
      );

      if (parseInt(currentAssigned.rows[0].count) >= taskRes.rows[0].max_volunteers) {
        throw new Error('عذراً، المهمة مكتملة العدد بالفعل.');
      }

      // التحقق مما إذا كان المتطوع مسنداً مسبقاً
      const existingAssign = await client.query(
        `SELECT id FROM task_assignments WHERE task_id = $1 AND volunteer_id = $2 AND status != 'excused'`,
        [taskId, targetVolunteerId]
      );
      if (existingAssign.rows.length > 0) {
        throw new Error('هذا المتطوع مسند مسبقاً لهذه المهمة.');
      }

      const assignRes = await client.query(
        `INSERT INTO task_assignments (task_id, volunteer_id, assigned_by, assignment_mode, status)
         VALUES ($1, $2, $3, 'direct', 'accepted') RETURNING *`,
        [taskId, targetVolunteerId, assignedByUserId]
      );

      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'assigned', $3)`,
        [taskId, assignedByUserId, `تم إسناد المهمة للمتطوع ${targetVolunteerId} بواسطة المشرف`]
      );

      await client.query('COMMIT');
      return assignRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async submitExcuse(assignmentId: string, volunteerId: string, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const assignRes = await client.query(
        `UPDATE task_assignments 
         SET status = 'excused', excuse_reason = $1 
         WHERE id = $2 AND volunteer_id = $3 RETURNING *`,
        [reason, assignmentId, volunteerId]
      );

      if (assignRes.rowCount === 0) {
        throw new Error('لم يتم العثور على التكليف، أو لا تملك الصلاحية.');
      }

      const taskAssignment = assignRes.rows[0];

      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'excused', $3)`,
        [taskAssignment.task_id, volunteerId, `طلب اعتذار: ${reason}`]
      );

      await client.query('COMMIT');
      return taskAssignment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeVolunteerFromTask(assignmentId: string, removedByUserId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const assignRes = await client.query(
        `DELETE FROM task_assignments WHERE id = $1 RETURNING *`,
        [assignmentId]
      );

      if (assignRes.rowCount === 0) {
        throw new Error('التكليف غير موجود.');
      }

      const assignment = assignRes.rows[0];

      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'removed', 'تم إلغاء تكليف المتطوع بواسطة المسؤول')`,
        [assignment.task_id, removedByUserId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

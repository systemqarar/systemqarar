import { pool } from '../../../../db'; // يفترض استخدام pool/supabase المعتمد في المشروع
import { CreateActivityDTO, CreateTaskDTO, Task, TaskAssignment } from './tasks-engine.types';

export class TasksEngineModel {

  // --- الأنشطة واللجان ---
  static async createActivity(userId: string, data: CreateActivityDTO) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const actResult = await client.query(
        `INSERT INTO activities (title, description, unit_id, created_by, creation_source, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [data.title, data.description, data.unit_id || null, userId, data.creation_source || 'manual', data.start_date, data.end_date]
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
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'leader_id', c.leader_id,
              'description', c.description
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as committees
      FROM activities a
      LEFT JOIN activity_committees c ON a.id = c.activity_id
      GROUP BY a.id
      ORDER BY a.created_at DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  // --- المهام والإسناد ---
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

      // تسجيل الحركة في سجل الشفافية
      await client.query(
        `INSERT INTO task_activity_logs (task_id, performed_by, action_type, details)
         VALUES ($1, $2, 'created', $3)`,
        [task.id, userId, `تم إنشاء المهمة بنجاح: ${task.title}`]
      );

      // إسناد مباشر إذا تم تحديد متطوعين
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

  static async getTasks(filters: { activity_id?: string; volunteer_id?: string; status?: string }) {
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

    if (filters.activity_id) {
      params.push(filters.activity_id);
      query += ` AND t.activity_id = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND t.status = $${params.length}`;
    }

    query += ` GROUP BY t.id, u.username ORDER BY t.due_time ASC;`;
    const res = await pool.query(query, params);
    return res.rows;
  }

  // التقديم على فرصة مفتوحة (سوق المهام)
  static async applyForOpenTask(taskId: string, volunteerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. التحقق من السعة الشخصية للمتطوع (حد أقصى 3 مهام قيد التنفيذ)
      const countRes = await client.query(
        `SELECT COUNT(*) FROM task_assignments 
         WHERE volunteer_id = $1 AND status IN ('assigned', 'accepted', 'in_progress')`,
        [volunteerId]
      );
      if (parseInt(countRes.rows[0].count) >= 3) {
        throw new Error('تجاوزت الحد الأقصى للمهام المفتوحة المسموح بها في نفس الوقت (3 مهام).');
      }

      // 2. التحقق من الشواغر المتاحة
      const taskRes = await client.query(`SELECT max_volunteers FROM tasks WHERE id = $1`, [taskId]);
      const currentAssigned = await client.query(
        `SELECT COUNT(*) FROM task_assignments WHERE task_id = $1 AND status != 'excused'`,
        [taskId]
      );

      if (parseInt(currentAssigned.rows[0].count) >= taskRes.rows[0].max_volunteers) {
        throw new Error('عذراً، اكتمل عدد المتطوعين المكتفين لهذه المهمة.');
      }

      // 3. الإسناد
      const assignRes = await client.query(
        `INSERT INTO task_assignments (task_id, volunteer_id, assignment_mode, status)
         VALUES ($1, $2, 'self_applied', 'accepted') RETURNING *`,
        [taskId, volunteerId]
      );

      // 4. سجل الحركة
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

  // تقديم طلب اعتذار
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
        throw new Error('لم يتم العثور على التكليف المكتوب، أو لا تملك الصلاحية.');
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
}

import { Request, Response } from 'express';
import { TasksEngineModel } from './tasks-engine.models';

export class TasksEngineController {

  private static getUserId(req: Request): string | null {
    const user = (req as any).user;
    if (!user) return null;
    return user.id || user.volunteer_id || user.userId || user.uuid || null;
  }

  // ==================== الأنشطة واللجان ====================

  static async createActivity(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'تعذر التثبت من هوية المستخدم. يرجى إعادة تسجيل الدخول.'
        });
      }

      const activity = await TasksEngineModel.createActivity(userId, req.body);
      return res.status(201).json({ success: true, data: activity });
    } catch (error: any) {
      console.error('Error creating activity:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const activities = await TasksEngineModel.getActivitiesWithTree();
      return res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getActivityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await TasksEngineModel.getActivityByIdWithTree(id);
      if (!activity) {
        return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
      }
      return res.status(200).json({ success: true, data: activity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addCommittee(req: Request, res: Response) {
    try {
      const { id: activityId } = req.params;
      const { name, leader_id, description } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'اسم اللجنة مطلوب' });
      }

      const committee = await TasksEngineModel.addCommittee(activityId, name, leader_id, description);
      return res.status(201).json({ success: true, data: committee });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateCommittee(req: Request, res: Response) {
    try {
      const { id: committeeId } = req.params;
      const committee = await TasksEngineModel.updateCommittee(committeeId, req.body);
      return res.status(200).json({ success: true, data: committee });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== المهام (المستقلة والتابعة) ====================

  static async createTask(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'تعذر التثبت من هوية المستخدم.'
        });
      }

      const task = await TasksEngineModel.createTask(userId, req.body);
      return res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      console.error('Error creating task:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getTasks(req: Request, res: Response) {
    try {
      const { activity_id, committee_id, is_standalone, status } = req.query;
      const tasks = await TasksEngineModel.getTasks({
        activity_id: activity_id as string,
        committee_id: committee_id as string,
        is_standalone: is_standalone === 'true',
        status: status as string
      });
      return res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await TasksEngineModel.updateTask(id, req.body);
      return res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== التكليف والانضمام والإزالة ====================

  static async applyForTask(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'تعذر التثبت من هوية المستخدم.'
        });
      }

      const taskId = req.params.id;
      const assignment = await TasksEngineModel.applyForOpenTask(taskId, userId);
      return res.status(200).json({ success: true, message: 'تم الانضمام للفرصة بنجاح', data: assignment });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async submitExcuse(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'تعذر التثبت من هوية المستخدم.'
        });
      }

      const assignmentId = req.params.assignmentId;
      const { excuse_reason } = req.body;
      
      if (!excuse_reason) {
        return res.status(400).json({ success: false, message: 'يتوجب إدخال سبب الاعتذار صراحة.' });
      }

      const result = await TasksEngineModel.submitExcuse(assignmentId, userId, excuse_reason);
      return res.status(200).json({ success: true, message: 'تم تسليم الاعتذار بنجاح', data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // 🎯 الدالة المطلوبة لملف المسارات (تُحيل إلى removeVolunteerFromTask مباشرة)
  static async removeVolunteer(req: Request, res: Response) {
    return TasksEngineController.removeVolunteerFromTask(req, res);
  }

  static async removeVolunteerFromTask(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: 'تعذر التثبت من هوية المستخدم.' });
      }

      const { assignmentId } = req.params;
      await TasksEngineModel.removeVolunteerFromTask(assignmentId, userId);
      return res.status(200).json({ success: true, message: 'تم إزالة المتطوع بنجاح.' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

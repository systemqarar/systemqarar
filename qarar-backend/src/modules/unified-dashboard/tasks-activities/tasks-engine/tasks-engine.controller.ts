import { Request, Response } from 'express';
import { TasksEngineModel } from './tasks-engine.models';

export class TasksEngineController {

  // دالة مساعدة لاستخراج ID المستخدم بأمان من التوكن مهما اختلفت مسمياته في الميدل وير
  private static getUserId(req: Request): string | null {
    const user = (req as any).user;
    if (!user) return null;
    return user.id || user.volunteer_id || user.userId || user.uuid || null;
  }

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

  static async createTask(req: Request, res: Response) {
    try {
      const userId = TasksEngineController.getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'تعذر التثبت من هوية المستخدم. يرجى إعادة تسجيل الدخول.'
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
      const { activity_id, status } = req.query;
      const tasks = await TasksEngineModel.getTasks({
        activity_id: activity_id as string,
        status: status as string
      });
      return res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

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
      return res.status(200).json({ success: true, message: 'تم تسليم الاعتذار وتنبيه المسؤول', data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.ts';
import { ApiResponse } from '../models/types.ts';

export class TaskController {
  public static async getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        projectId,
        assigneeId,
        reporterId,
        status,
        priority,
        type,
        sprint,
        tag,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = TaskService.getAllTasks({
        search: search as string,
        projectId: projectId as string,
        assigneeId: assigneeId as string,
        reporterId: reporterId as string,
        status: status as string,
        priority: priority as string,
        type: type as string,
        sprint: sprint as string,
        tag: tag as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      const response: ApiResponse = {
        success: true,
        data: result.tasks,
        meta: result.meta,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = TaskService.getTaskById(id);

      const response: ApiResponse = {
        success: true,
        data: task,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const createdTask = TaskService.createTask(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Task created successfully',
        data: createdTask,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedTask = TaskService.updateTask(id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Task updated successfully',
        data: updatedTask,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, changedBy, note } = req.body;

      const updatedTask = TaskService.updateTaskStatus(id, {
        status,
        changedBy,
        note,
      });

      const response: ApiResponse = {
        success: true,
        message: `Task status transitioned to '${status}' successfully`,
        data: updatedTask,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async bulkUpdateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskIds, status, changedBy, note } = req.body;

      const result = TaskService.bulkUpdateTaskStatus({
        taskIds,
        status,
        changedBy,
        note,
      });

      const response: ApiResponse = {
        success: true,
        message: `Updated status for ${result.updatedCount} task(s)`,
        data: result,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = TaskService.deleteTask(id);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

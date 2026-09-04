import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.ts';
import { ApiResponse } from '../models/types.ts';

export class UserController {
  public static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, role, team, status, page, limit, sortBy, sortOrder } = req.query;
      const result = UserService.getAllUsers({
        search: search as string,
        role: role as string,
        team: team as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      const response: ApiResponse = {
        success: true,
        data: result.users,
        meta: result.meta,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = UserService.getUserById(id);

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const createdUser = UserService.createUser(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'User created successfully',
        data: createdUser,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = UserService.updateUser(id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = UserService.deleteUser(id);

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

  public static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = UserService.getUserStats(id);

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async getUserTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tasks = UserService.getUserTasks(id);

      const response: ApiResponse = {
        success: true,
        data: tasks,
        meta: {
          total: tasks.length,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

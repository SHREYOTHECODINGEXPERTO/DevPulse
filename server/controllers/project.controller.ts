import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.ts';
import { ApiResponse } from '../models/types.ts';

export class ProjectController {
  public static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, ownerId, language, page, limit, sortBy, sortOrder } = req.query;
      const result = await ProjectService.getAllProjects({
        search: search as string,
        status: status as string,
        ownerId: ownerId as string,
        language: language as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      const response: ApiResponse = {
        success: true,
        data: result.projects,
        meta: result.meta,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id);

      const response: ApiResponse = {
        success: true,
        data: project,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const createdProject = await ProjectService.createProject(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Project created successfully',
        data: createdProject,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedProject = await ProjectService.updateProject(id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Project updated successfully',
        data: updatedProject,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProjectService.deleteProject(id);

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

  public static async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const tasks = await ProjectService.getProjectTasks(id, status as string);

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

  public static async getProjectMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const members = await ProjectService.getProjectMembers(id);

      const response: ApiResponse = {
        success: true,
        data: members,
        meta: {
          total: members.length,
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

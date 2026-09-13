import { Request, Response, NextFunction } from 'express';
import { openApiSpec } from '../docs/openapi.ts';
import { renderSwaggerHtml } from '../docs/swaggerHtml.ts';
import { db } from '../data/store.ts';
import { config } from '../config/index.ts';
import { getDatabaseHealth } from '../config/database.ts';

export class DocsController {
  public static async getSwaggerUi(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Content-Type', 'text/html');
      res.send(renderSwaggerHtml());
    } catch (err) {
      next(err);
    }
  }

  public static async getOpenApiSpec(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(openApiSpec);
    } catch (err) {
      next(err);
    }
  }

  public static async getHealthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await db.getUsers();
      const projects = await db.getProjects();
      const tasks = await db.getTasks();
      const dbHealth = await getDatabaseHealth();

      res.status(200).json({
        success: true,
        message: 'DevPulse API is running healthy',
        data: {
          status: 'healthy',
          uptime: process.uptime(),
          version: config.appVersion,
          environment: config.nodeEnv,
          timestamp: new Date().toISOString(),
          database: {
            ...dbHealth,
            usersCount: users.length,
            projectsCount: projects.length,
            tasksCount: tasks.length,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

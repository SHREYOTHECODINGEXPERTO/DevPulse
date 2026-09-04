import { db } from '../data/store.ts';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  BulkUpdateTaskStatusDto,
  TaskStatus,
} from '../models/types.ts';
import {
  NotFoundError,
  BadRequestError,
  UnprocessableEntityError,
} from '../middleware/errorHandler.ts';

export interface TaskFilterOptions {
  search?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  status?: string;
  priority?: string;
  type?: string;
  sprint?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'storyPoints';
  sortOrder?: 'asc' | 'desc';
}

const VALID_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];

export class TaskService {
  public static getAllTasks(options: TaskFilterOptions = {}) {
    let tasks = db.getTasks();

    // Project filter (supports project ID or project Key)
    if (options.projectId) {
      const projQuery = options.projectId.trim();
      const proj = db.getProjectById(projQuery) || db.getProjectByKey(projQuery);
      if (proj) {
        tasks = tasks.filter((t) => t.projectId === proj.id);
      } else {
        tasks = tasks.filter((t) => t.projectId === projQuery);
      }
    }

    // Assignee filter ('unassigned' or user ID)
    if (options.assigneeId) {
      if (options.assigneeId === 'unassigned' || options.assigneeId === 'null') {
        tasks = tasks.filter((t) => t.assigneeId === null);
      } else {
        tasks = tasks.filter((t) => t.assigneeId === options.assigneeId);
      }
    }

    // Reporter filter
    if (options.reporterId) {
      tasks = tasks.filter((t) => t.reporterId === options.reporterId);
    }

    // Status filter
    if (options.status) {
      const statusQuery = options.status.toLowerCase().trim();
      tasks = tasks.filter((t) => t.status.toLowerCase() === statusQuery);
    }

    // Priority filter
    if (options.priority) {
      const priorityQuery = options.priority.toLowerCase().trim();
      tasks = tasks.filter((t) => t.priority.toLowerCase() === priorityQuery);
    }

    // Type filter
    if (options.type) {
      const typeQuery = options.type.toLowerCase().trim();
      tasks = tasks.filter((t) => t.type.toLowerCase() === typeQuery);
    }

    // Sprint filter
    if (options.sprint) {
      const sprintQuery = options.sprint.toLowerCase().trim();
      tasks = tasks.filter((t) => t.sprint && t.sprint.toLowerCase().includes(sprintQuery));
    }

    // Tag filter
    if (options.tag) {
      const tagQuery = options.tag.toLowerCase().trim();
      tasks = tasks.filter((t) => t.tags && t.tags.some((tag) => tag.toLowerCase() === tagQuery));
    }

    // Search query (title, description, key, tags)
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

    tasks.sort((a, b) => {
      const valA = (a as any)[sortBy];
      const valB = (b as any)[sortBy];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder;
      }
      return ((valA ?? 0) > (valB ?? 0) ? 1 : -1) * sortOrder;
    });

    // Pagination
    const total = tasks.length;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = tasks.slice(startIndex, startIndex + limit);

    // Populate light relation previews
    const enriched = paginated.map((t) => {
      const project = db.getProjectById(t.projectId);
      const assignee = t.assigneeId ? db.getUserById(t.assigneeId) : null;
      return {
        ...t,
        projectName: project?.name,
        projectKey: project?.key,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar,
      };
    });

    return {
      tasks: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public static getTaskById(id: string) {
    const task = db.getTaskById(id) || db.getTaskByKey(id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }

    const project = db.getProjectById(task.projectId);
    const assignee = task.assigneeId ? db.getUserById(task.assigneeId) : null;
    const reporter = db.getUserById(task.reporterId);

    return {
      ...task,
      project,
      assignee,
      reporter,
    };
  }

  public static createTask(dto: CreateTaskDto): Task {
    // Validate project existence
    const project = db.getProjectById(dto.projectId) || db.getProjectByKey(dto.projectId);
    if (!project) {
      throw new BadRequestError(`Project with ID or Key '${dto.projectId}' does not exist`);
    }

    // Validate assignee if provided
    if (dto.assigneeId) {
      const assignee = db.getUserById(dto.assigneeId);
      if (!assignee) {
        throw new BadRequestError(`Assignee user with ID '${dto.assigneeId}' does not exist`);
      }
    }

    // Validate reporter if provided
    const reporterId = dto.reporterId || project.ownerId;
    const reporter = db.getUserById(reporterId);
    if (!reporter) {
      throw new BadRequestError(`Reporter user with ID '${reporterId}' does not exist`);
    }

    const status: TaskStatus = dto.status || 'todo';
    if (!VALID_STATUSES.includes(status)) {
      throw new UnprocessableEntityError(`Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const now = new Date().toISOString();
    const existingTasksCount = db.getTasksByProjectId(project.id).length;
    const taskKey = `${project.key}-${100 + existingTasksCount + 1}`;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      key: taskKey,
      title: dto.title.trim(),
      description: dto.description ? dto.description.trim() : '',
      projectId: project.id,
      assigneeId: dto.assigneeId || null,
      reporterId,
      type: dto.type || 'Task',
      status,
      priority: dto.priority || 'Medium',
      storyPoints: dto.storyPoints !== undefined ? Number(dto.storyPoints) : 3,
      estimatedHours: dto.estimatedHours !== undefined ? Number(dto.estimatedHours) : 4,
      timeSpentHours: dto.timeSpentHours !== undefined ? Number(dto.timeSpentHours) : 0,
      tags: dto.tags || [],
      sprint: dto.sprint,
      epic: dto.epic,
      epicColor: dto.epicColor || '#3b82f6',
      linkedPR: dto.linkedPR,
      dueDate: dto.dueDate,
      completedAt: status === 'done' ? now : null,
      statusHistory: [
        {
          fromStatus: null,
          toStatus: status,
          changedAt: now,
          changedBy: reporterId,
          note: 'Task created',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    return db.createTask(newTask);
  }

  public static updateTask(id: string, dto: UpdateTaskDto): Task {
    const existing = db.getTaskById(id) || db.getTaskByKey(id);
    if (!existing) {
      throw new NotFoundError('Task', id);
    }

    // Project change check
    if (dto.projectId && dto.projectId !== existing.projectId) {
      const project = db.getProjectById(dto.projectId) || db.getProjectByKey(dto.projectId);
      if (!project) {
        throw new BadRequestError(`Project with ID '${dto.projectId}' does not exist`);
      }
      dto.projectId = project.id;
    }

    // Assignee check
    if (dto.assigneeId !== undefined && dto.assigneeId !== null && dto.assigneeId !== existing.assigneeId) {
      const assignee = db.getUserById(dto.assigneeId);
      if (!assignee) {
        throw new BadRequestError(`Assignee user with ID '${dto.assigneeId}' does not exist`);
      }
    }

    // Status transition tracking if status changed
    let statusHistory = existing.statusHistory;
    let completedAt = existing.completedAt;

    if (dto.status && dto.status !== existing.status) {
      if (!VALID_STATUSES.includes(dto.status)) {
        throw new UnprocessableEntityError(
          `Invalid status '${dto.status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
        );
      }

      const now = new Date().toISOString();
      statusHistory = [
        ...existing.statusHistory,
        {
          fromStatus: existing.status,
          toStatus: dto.status,
          changedAt: now,
          note: 'Status updated via task update',
        },
      ];

      if (dto.status === 'done' && !completedAt) {
        completedAt = now;
      } else if (dto.status !== 'done') {
        completedAt = null;
      }
    }

    const updated = db.updateTask(existing.id, {
      ...dto,
      statusHistory,
      completedAt,
    });

    if (!updated) {
      throw new NotFoundError('Task', id);
    }
    return updated;
  }

  public static updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Task {
    const existing = db.getTaskById(id) || db.getTaskByKey(id);
    if (!existing) {
      throw new NotFoundError('Task', id);
    }

    const targetStatus = dto.status.toLowerCase().trim() as TaskStatus;
    if (!VALID_STATUSES.includes(targetStatus)) {
      throw new UnprocessableEntityError(
        `Invalid status '${dto.status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`
      );
    }

    if (existing.status === targetStatus) {
      return existing; // Idempotent
    }

    const now = new Date().toISOString();
    const historyEntry = {
      fromStatus: existing.status,
      toStatus: targetStatus,
      changedAt: now,
      changedBy: dto.changedBy,
      note: dto.note || `Status transitioned from ${existing.status} to ${targetStatus}`,
    };

    let completedAt = existing.completedAt;
    if (targetStatus === 'done') {
      completedAt = now;
      // Increment user completed story points if assignee exists
      if (existing.assigneeId) {
        const user = db.getUserById(existing.assigneeId);
        if (user) {
          db.updateUser(user.id, {
            storyPointsCompleted: (user.storyPointsCompleted || 0) + existing.storyPoints,
            xpPoints: (user.xpPoints || 0) + existing.storyPoints * 20,
          });
        }
      }
    } else if (existing.status === 'done') {
      completedAt = null;
      // Decrement user completed story points if moved out of done
      if (existing.assigneeId) {
        const user = db.getUserById(existing.assigneeId);
        if (user) {
          db.updateUser(user.id, {
            storyPointsCompleted: Math.max(0, (user.storyPointsCompleted || 0) - existing.storyPoints),
          });
        }
      }
    }

    const updated = db.updateTask(existing.id, {
      status: targetStatus,
      completedAt,
      statusHistory: [...existing.statusHistory, historyEntry],
    });

    if (!updated) {
      throw new NotFoundError('Task', id);
    }
    return updated;
  }

  public static bulkUpdateTaskStatus(dto: BulkUpdateTaskStatusDto) {
    const { taskIds, status, changedBy, note } = dto;
    const targetStatus = status.toLowerCase().trim() as TaskStatus;

    if (!VALID_STATUSES.includes(targetStatus)) {
      throw new UnprocessableEntityError(
        `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`
      );
    }

    const updatedTasks: Task[] = [];
    const notFoundIds: string[] = [];

    for (const id of taskIds) {
      try {
        const updated = this.updateTaskStatus(id, { status: targetStatus, changedBy, note });
        updatedTasks.push(updated);
      } catch (err: any) {
        if (err instanceof NotFoundError) {
          notFoundIds.push(id);
        } else {
          throw err;
        }
      }
    }

    return {
      updatedCount: updatedTasks.length,
      tasks: updatedTasks,
      notFoundIds,
    };
  }

  public static deleteTask(id: string): { success: boolean; message: string } {
    const existing = db.getTaskById(id) || db.getTaskByKey(id);
    if (!existing) {
      throw new NotFoundError('Task', id);
    }

    const deleted = db.deleteTask(existing.id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete task');
    }

    return {
      success: true,
      message: `Task '${existing.key}: ${existing.title}' was deleted successfully`,
    };
  }
}

import { db } from '../data/store.ts';
import { Project, CreateProjectDto, UpdateProjectDto, Task, User } from '../models/types.ts';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/errorHandler.ts';

export interface ProjectFilterOptions {
  search?: string;
  status?: string;
  ownerId?: string;
  language?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'stars' | 'openIssues' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class ProjectService {
  public static getAllProjects(options: ProjectFilterOptions = {}) {
    let projects = db.getProjects();

    // Search filter
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.primaryLanguage.toLowerCase().includes(q) ||
          p.techStackBadges.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (options.status) {
      const statusQuery = options.status.toLowerCase().trim();
      projects = projects.filter((p) => p.status.toLowerCase() === statusQuery);
    }

    // Owner filter
    if (options.ownerId) {
      projects = projects.filter((p) => p.ownerId === options.ownerId);
    }

    // Primary language filter
    if (options.language) {
      const langQuery = options.language.toLowerCase().trim();
      projects = projects.filter((p) => p.primaryLanguage.toLowerCase() === langQuery);
    }

    // Sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

    projects.sort((a, b) => {
      const valA = (a as any)[sortBy];
      const valB = (b as any)[sortBy];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder;
      }
      return ((valA ?? 0) > (valB ?? 0) ? 1 : -1) * sortOrder;
    });

    // Pagination
    const total = projects.length;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = projects.slice(startIndex, startIndex + limit);

    return {
      projects: paginated,
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

  public static getProjectById(id: string, includeStats: boolean = true) {
    const project = db.getProjectById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }

    if (!includeStats) {
      return project;
    }

    const tasks = db.getTasksByProjectId(id);
    const owner = db.getUserById(project.ownerId);
    const members = project.memberIds.map((mId) => db.getUserById(mId)).filter(Boolean) as User[];

    const statusBreakdown = {
      backlog: tasks.filter((t) => t.status === 'backlog').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      inReview: tasks.filter((t) => t.status === 'in-review').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };

    const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter((t) => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const progressPercentage =
      totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

    return {
      ...project,
      owner,
      members,
      taskSummary: {
        totalTasks: tasks.length,
        statusBreakdown,
        totalStoryPoints,
        completedStoryPoints,
        progressPercentage,
      },
    };
  }

  public static createProject(dto: CreateProjectDto): Project {
    const normalizedKey = dto.key.toUpperCase().trim();

    // Check project key uniqueness
    if (db.getProjectByKey(normalizedKey)) {
      throw new ConflictError(`Project with key '${normalizedKey}' already exists`);
    }

    // Verify owner exists
    const owner = db.getUserById(dto.ownerId);
    if (!owner) {
      throw new BadRequestError(`Owner user with ID '${dto.ownerId}' does not exist`);
    }

    // Ensure owner is included in members
    const memberIds = Array.from(new Set([dto.ownerId, ...(dto.memberIds || [])]));

    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: dto.name.trim(),
      key: normalizedKey,
      description: dto.description.trim(),
      primaryLanguage: dto.primaryLanguage || 'TypeScript',
      languages: dto.languages || ['TypeScript', 'JavaScript'],
      frameworks: dto.frameworks || ['React', 'Node.js'],
      techStackBadges: dto.techStackBadges || [dto.primaryLanguage || 'TypeScript'],
      status: dto.status || 'Active Sprint',
      ownerId: dto.ownerId,
      memberIds,
      repoUrl: dto.repoUrl || `https://github.com/devpulse/${normalizedKey.toLowerCase()}`,
      stars: 0,
      forks: 0,
      openIssues: 0,
      defaultBranch: dto.defaultBranch || 'main',
      createdAt: now,
      updatedAt: now,
    };

    return db.createProject(newProject);
  }

  public static updateProject(id: string, dto: UpdateProjectDto): Project {
    const existing = db.getProjectById(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    // Key update conflict check
    if (dto.key) {
      const normalizedKey = dto.key.toUpperCase().trim();
      if (normalizedKey !== existing.key) {
        if (db.getProjectByKey(normalizedKey)) {
          throw new ConflictError(`Project with key '${normalizedKey}' already exists`);
        }
        dto.key = normalizedKey;
      }
    }

    // Owner check
    if (dto.ownerId && dto.ownerId !== existing.ownerId) {
      const owner = db.getUserById(dto.ownerId);
      if (!owner) {
        throw new BadRequestError(`Owner user with ID '${dto.ownerId}' does not exist`);
      }
    }

    const updated = db.updateProject(id, dto);
    if (!updated) {
      throw new NotFoundError('Project', id);
    }
    return updated;
  }

  public static deleteProject(id: string): { success: boolean; message: string } {
    const existing = db.getProjectById(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    const deleted = db.deleteProject(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete project');
    }

    return {
      success: true,
      message: `Project '${existing.name}' (${id}) and all associated tasks were deleted successfully`,
    };
  }

  public static getProjectTasks(id: string, status?: string): Task[] {
    this.getProjectById(id, false); // Validate existence
    let tasks = db.getTasksByProjectId(id);
    if (status) {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase().trim());
    }
    return tasks;
  }

  public static getProjectMembers(id: string): User[] {
    const project = db.getProjectById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }
    return project.memberIds.map((mId) => db.getUserById(mId)).filter(Boolean) as User[];
  }
}

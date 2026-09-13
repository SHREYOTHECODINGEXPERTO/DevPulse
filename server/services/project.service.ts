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
  public static async getAllProjects(options: ProjectFilterOptions = {}) {
    let projects = await db.getProjects();

    // Search filter
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.primaryLanguage.toLowerCase().includes(q) ||
          (p.techStackBadges && p.techStackBadges.some((b) => b.toLowerCase().includes(q)))
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

  public static async getProjectById(id: string, includeStats: boolean = true) {
    const project = await db.getProjectById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }

    if (!includeStats) {
      return project;
    }

    const tasks = await db.getTasksByProjectId(id);
    const owner = await db.getUserById(project.ownerId);
    const memberPromises = (project.memberIds || []).map((mId) => db.getUserById(mId));
    const resolvedMembers = await Promise.all(memberPromises);
    const members = resolvedMembers.filter(Boolean) as User[];

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

  public static async createProject(dto: CreateProjectDto): Promise<Project> {
    const normalizedKey = dto.key.toUpperCase().trim();

    // Check project key uniqueness
    if (await db.getProjectByKey(normalizedKey)) {
      throw new ConflictError(`Project with key '${normalizedKey}' already exists`);
    }

    // Verify owner exists
    const owner = await db.getUserById(dto.ownerId);
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

    return await db.createProject(newProject);
  }

  public static async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await db.getProjectById(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    // Key update conflict check
    if (dto.key) {
      const normalizedKey = dto.key.toUpperCase().trim();
      if (normalizedKey !== existing.key) {
        const conflict = await db.getProjectByKey(normalizedKey);
        if (conflict && conflict.id !== id) {
          throw new ConflictError(`Project with key '${normalizedKey}' already exists`);
        }
        dto.key = normalizedKey;
      }
    }

    // Owner check
    if (dto.ownerId && dto.ownerId !== existing.ownerId) {
      const owner = await db.getUserById(dto.ownerId);
      if (!owner) {
        throw new BadRequestError(`Owner user with ID '${dto.ownerId}' does not exist`);
      }
    }

    const updated = await db.updateProject(id, dto);
    if (!updated) {
      throw new NotFoundError('Project', id);
    }
    return updated;
  }

  public static async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await db.getProjectById(id);
    if (!existing) {
      throw new NotFoundError('Project', id);
    }

    const deleted = await db.deleteProject(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete project');
    }

    return {
      success: true,
      message: `Project '${existing.name}' (${id}) and all associated tasks were deleted successfully`,
    };
  }

  public static async getProjectTasks(id: string, status?: string): Promise<Task[]> {
    await this.getProjectById(id, false); // Validate existence
    let tasks = await db.getTasksByProjectId(id);
    if (status) {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase().trim());
    }
    return tasks;
  }

  public static async getProjectMembers(id: string): Promise<User[]> {
    const project = await db.getProjectById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }
    const memberPromises = (project.memberIds || []).map((mId) => db.getUserById(mId));
    const resolved = await Promise.all(memberPromises);
    return resolved.filter(Boolean) as User[];
  }
}

import { db } from '../data/store.ts';
import { User, CreateUserDto, UpdateUserDto, Task } from '../models/types.ts';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/errorHandler.ts';

export interface UserFilterOptions {
  search?: string;
  role?: string;
  team?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'streakDays' | 'velocityScore' | 'storyPointsCompleted' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class UserService {
  public static async getAllUsers(options: UserFilterOptions = {}) {
    let users = await db.getUsers();

    // Filter by search query (name, handle, bio, skills)
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.handle.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.bio && u.bio.toLowerCase().includes(q)) ||
          (u.skills && u.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // Filter by role
    if (options.role) {
      const roleQuery = options.role.toLowerCase().trim();
      users = users.filter((u) => u.role && u.role.toLowerCase().includes(roleQuery));
    }

    // Filter by team
    if (options.team) {
      const teamQuery = options.team.toLowerCase().trim();
      users = users.filter((u) => u.team && u.team.toLowerCase().includes(teamQuery));
    }

    // Filter by status
    if (options.status) {
      const statusQuery = options.status.toLowerCase().trim();
      users = users.filter((u) => u.status && u.status.toLowerCase() === statusQuery);
    }

    // Sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

    users.sort((a, b) => {
      const valA = (a as any)[sortBy];
      const valB = (b as any)[sortBy];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder;
      }
      return ((valA ?? 0) > (valB ?? 0) ? 1 : -1) * sortOrder;
    });

    // Pagination
    const total = users.length;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit);

    return {
      users: paginated,
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

  public static async getUserById(id: string): Promise<User> {
    const user = await db.getUserById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  public static async createUser(dto: CreateUserDto): Promise<User> {
    // Check if email already exists
    if (await db.getUserByEmail(dto.email)) {
      throw new ConflictError(`User with email '${dto.email}' already exists`);
    }

    // Check if handle already exists
    const normalizedHandle = dto.handle.startsWith('@') ? dto.handle : `@${dto.handle}`;
    if (await db.getUserByHandle(normalizedHandle)) {
      throw new ConflictError(`User with handle '${normalizedHandle}' already exists`);
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: dto.name.trim(),
      handle: normalizedHandle,
      email: dto.email.toLowerCase().trim(),
      avatar: dto.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dto.handle)}`,
      role: dto.role.trim(),
      team: dto.team.trim(),
      status: dto.status || 'In the Zone',
      statusColor: dto.statusColor || '#10b981',
      streakDays: 1,
      storyPointsCompleted: 0,
      totalCommitsToday: 0,
      prMergeRate: 100,
      velocityScore: 75,
      focusMinutesToday: 0,
      bio: dto.bio || 'Building amazing things at DevPulse.',
      skills: dto.skills || ['JavaScript', 'TypeScript'],
      peakCodingWindow: dto.peakCodingWindow || '09:00 - 17:00',
      githubUsername: dto.githubUsername || dto.handle.replace('@', ''),
      customDesignation: dto.customDesignation || 'Developer',
      xpPoints: 100,
      level: 1,
      createdAt: now,
      updatedAt: now,
    };

    return await db.createUser(newUser);
  }

  public static async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await db.getUserById(id);
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    // If changing email, ensure no duplicate
    if (dto.email && dto.email.toLowerCase().trim() !== existing.email.toLowerCase()) {
      const conflict = await db.getUserByEmail(dto.email);
      if (conflict && conflict.id !== id) {
        throw new ConflictError(`User with email '${dto.email}' already exists`);
      }
    }

    // If changing handle, ensure no duplicate
    if (dto.handle) {
      const normalizedHandle = dto.handle.startsWith('@') ? dto.handle : `@${dto.handle}`;
      if (normalizedHandle.toLowerCase() !== existing.handle.toLowerCase()) {
        const conflict = await db.getUserByHandle(normalizedHandle);
        if (conflict && conflict.id !== id) {
          throw new ConflictError(`User with handle '${normalizedHandle}' already exists`);
        }
      }
      dto.handle = normalizedHandle;
    }

    const updated = await db.updateUser(id, dto);
    if (!updated) {
      throw new NotFoundError('User', id);
    }
    return updated;
  }

  public static async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await db.getUserById(id);
    if (!existing) {
      throw new NotFoundError('User', id);
    }

    const deleted = await db.deleteUser(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete user');
    }

    return {
      success: true,
      message: `User '${existing.name}' (${id}) was deleted successfully`,
    };
  }

  public static async getUserTasks(id: string): Promise<Task[]> {
    await this.getUserById(id); // Throws if not found
    return await db.getTasksByAssigneeId(id);
  }

  public static async getUserStats(id: string) {
    const user = await this.getUserById(id);
    const tasks = await db.getTasksByAssigneeId(id);

    const tasksByStatus = {
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

    return {
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        role: user.role,
        team: user.team,
        status: user.status,
      },
      metrics: {
        streakDays: user.streakDays,
        velocityScore: user.velocityScore,
        storyPointsCompleted: user.storyPointsCompleted,
        totalCommitsToday: user.totalCommitsToday,
        focusMinutesToday: user.focusMinutesToday,
        prMergeRate: user.prMergeRate,
        level: user.level,
        xpPoints: user.xpPoints,
      },
      tasks: {
        totalAssigned: tasks.length,
        statusBreakdown: tasksByStatus,
        totalStoryPoints,
        completedStoryPoints,
        completionRate: tasks.length > 0 ? Math.round((tasksByStatus.done / tasks.length) * 100) : 0,
      },
    };
  }
}

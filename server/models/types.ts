export type UserStatus = 
  | 'In the Zone' 
  | 'Reviewing Code' 
  | 'Pairing' 
  | 'In Sprint Planning' 
  | 'AFK' 
  | 'Vibecoding' 
  | 'Debugging at 3AM';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  role: string;
  team: string;
  status: UserStatus;
  statusColor: string;
  streakDays: number;
  storyPointsCompleted: number;
  totalCommitsToday: number;
  prMergeRate: number;
  velocityScore: number;
  focusMinutesToday: number;
  bio: string;
  skills: string[];
  peakCodingWindow?: string;
  githubUsername?: string;
  customDesignation?: string;
  xpPoints?: number;
  level?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Active Sprint' | 'In Progress' | 'Completed' | 'Maintained' | 'Planning';

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  primaryLanguage: string;
  languages: string[];
  frameworks: string[];
  techStackBadges: string[];
  status: ProjectStatus;
  ownerId: string;
  memberIds: string[];
  repoUrl?: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType = 'Story' | 'Bug' | 'Task' | 'Epic' | 'Refactor';

export interface StatusHistoryItem {
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface Task {
  id: string;
  key: string; // e.g., "PULSE-101"
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number;
  estimatedHours: number;
  timeSpentHours: number;
  tags: string[];
  sprint?: string;
  epic?: string;
  epicColor?: string;
  linkedPR?: string;
  dueDate?: string;
  completedAt?: string | null;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// DTOs for Creation and Update
export interface CreateUserDto {
  name: string;
  handle: string;
  email: string;
  avatar?: string;
  role: string;
  team: string;
  status?: UserStatus;
  statusColor?: string;
  bio?: string;
  skills?: string[];
  peakCodingWindow?: string;
  githubUsername?: string;
  customDesignation?: string;
}

export interface UpdateUserDto {
  name?: string;
  handle?: string;
  email?: string;
  avatar?: string;
  role?: string;
  team?: string;
  status?: UserStatus;
  statusColor?: string;
  streakDays?: number;
  storyPointsCompleted?: number;
  totalCommitsToday?: number;
  prMergeRate?: number;
  velocityScore?: number;
  focusMinutesToday?: number;
  bio?: string;
  skills?: string[];
  peakCodingWindow?: string;
  githubUsername?: string;
  customDesignation?: string;
  xpPoints?: number;
  level?: number;
}

export interface CreateProjectDto {
  name: string;
  key: string;
  description: string;
  primaryLanguage?: string;
  languages?: string[];
  frameworks?: string[];
  techStackBadges?: string[];
  status?: ProjectStatus;
  ownerId: string;
  memberIds?: string[];
  repoUrl?: string;
  defaultBranch?: string;
}

export interface UpdateProjectDto {
  name?: string;
  key?: string;
  description?: string;
  primaryLanguage?: string;
  languages?: string[];
  frameworks?: string[];
  techStackBadges?: string[];
  status?: ProjectStatus;
  ownerId?: string;
  memberIds?: string[];
  repoUrl?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  defaultBranch?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string | null;
  reporterId?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number;
  estimatedHours?: number;
  timeSpentHours?: number;
  tags?: string[];
  sprint?: string;
  epic?: string;
  epicColor?: string;
  linkedPR?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  projectId?: string;
  assigneeId?: string | null;
  reporterId?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number;
  estimatedHours?: number;
  timeSpentHours?: number;
  tags?: string[];
  sprint?: string;
  epic?: string;
  epicColor?: string;
  linkedPR?: string;
  dueDate?: string;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  changedBy?: string;
  note?: string;
}

export interface BulkUpdateTaskStatusDto {
  taskIds: string[];
  status: TaskStatus;
  changedBy?: string;
  note?: string;
}

// API Response Schemas
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  path?: string;
}

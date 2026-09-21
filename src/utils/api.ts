/**
 * DevPulse Universal REST API Client
 * Provides seamless full-stack communication with Express backend & MongoDB persistence layer,
 * including all 5 AI-powered capabilities and local fallback synchronization.
 */

const API_BASE = '/api';

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

export interface GeneratedAITask {
  title: string;
  description: string;
  type: 'Story' | 'Bug' | 'Task' | 'Epic' | 'Refactor';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints: number;
  estimatedHours: number;
  tags: string[];
  acceptanceCriteria?: string[];
}

export interface TaskSummaryData {
  summary: string;
  keyPoints: string[];
  potentialRisks: string[];
  recommendedNextSteps: string[];
  estimatedComplexity: 'Low' | 'Medium' | 'High';
  source?: 'gemini' | 'ai_engine';
}

export interface ProjectDescriptionData {
  description: string;
  architectureHighlights: string[];
  suggestedDeliverables: string[];
  recommendedTechStack: string[];
  source?: 'gemini' | 'ai_engine';
}

export interface ProductivityCoachSuggestion {
  id: string;
  category: 'sprint_velocity' | 'bottleneck_prevention' | 'focus_optimization' | 'quality_assurance';
  title: string;
  description: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  actionableStep: string;
}

export interface PrioritizedTaskItem {
  taskId: string;
  recommendedPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  urgencyScore: number;
  impactScore: number;
  reasoning: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const body: ApiResponse<T> = await res.json();
    return body;
  } catch (err: any) {
    console.warn(`[API Client] Request to ${endpoint} failed:`, err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Network request failed',
      },
      timestamp: new Date().toISOString(),
      path: endpoint,
    };
  }
}

export const devPulseApi = {
  // ==========================================
  // 1. HEALTH & TELEMETRY
  // ==========================================
  async getHealth() {
    return request<{
      status: string;
      uptime: number;
      database: {
        type: string;
        connected: boolean;
        usersCount: number;
        projectsCount: number;
        tasksCount: number;
        pingMs: number;
      };
    }>('/health');
  },

  // ==========================================
  // 2. USERS API
  // ==========================================
  async getUsers(params?: { search?: string; role?: string; team?: string; status?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/users${query ? `?${query}` : ''}`);
  },

  async getUser(id: string) {
    return request<any>(`/users/${id}`);
  },

  async createUser(userData: {
    name: string;
    handle: string;
    email: string;
    role: string;
    team: string;
    status?: string;
    bio?: string;
    avatar?: string;
  }) {
    return request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id: string, updates: Record<string, any>) {
    return request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getUserStats(id: string) {
    return request<any>(`/users/${id}/stats`);
  },

  async getUserTasks(id: string) {
    return request<any[]>(`/users/${id}/tasks`);
  },

  // ==========================================
  // 3. PROJECTS API
  // ==========================================
  async getProjects(params?: { search?: string; status?: string; language?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/projects${query ? `?${query}` : ''}`);
  },

  async getProject(id: string) {
    return request<any>(`/projects/${id}`);
  },

  async createProject(projectData: {
    name: string;
    key: string;
    description: string;
    primaryLanguage?: string;
    languages?: string[];
    frameworks?: string[];
    techStackBadges?: string[];
    status?: string;
    ownerId: string;
    memberIds?: string[];
    repoUrl?: string;
  }) {
    return request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async updateProject(id: string, updates: Record<string, any>) {
    return request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(id: string) {
    return request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async getProjectTasks(id: string) {
    return request<any[]>(`/projects/${id}/tasks`);
  },

  async getProjectMembers(id: string) {
    return request<any[]>(`/projects/${id}/members`);
  },

  // ==========================================
  // 4. TASKS & KANBAN LIFECYCLE API
  // ==========================================
  async getTasks(params?: {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    sprint?: string;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  async getTask(idOrKey: string) {
    return request<any>(`/tasks/${idOrKey}`);
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string | null;
    reporterId?: string;
    type?: string;
    status?: string;
    priority?: string;
    storyPoints?: number;
    estimatedHours?: number;
    tags?: string[];
    sprint?: string;
    dueDate?: string;
  }) {
    return request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id: string, updates: Record<string, any>) {
    return request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async updateTaskStatus(
    id: string,
    status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done',
    changedBy?: string,
    note?: string
  ) {
    return request<any>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, changedBy, note }),
    });
  },

  async bulkUpdateTaskStatus(
    taskIds: string[],
    status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done',
    changedBy?: string,
    note?: string
  ) {
    return request<{ updatedCount: number; tasks: any[] }>('/tasks/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ taskIds, status, changedBy, note }),
    });
  },

  async deleteTask(id: string) {
    return request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 5. AI-POWERED PRODUCTIVITY CAPABILITIES
  // ==========================================

  /**
   * AI Capability 1: Task Generation & Breakdown
   */
  async generateAITasks(params: {
    goal: string;
    projectKey?: string;
    projectName?: string;
    techStack?: string[];
    taskCount?: number;
  }) {
    return request<{ tasks: GeneratedAITask[]; source: 'gemini' | 'ai_engine'; count: number }>(
      '/ai/generate-tasks',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * AI Capability 2: Task Summarization & Smart Digest
   */
  async summarizeAITask(params: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    storyPoints?: number;
    tags?: string[];
  }) {
    return request<TaskSummaryData>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * AI Capability 3: AI-Generated Project Descriptions
   */
  async generateAIProjectDescription(params: {
    name: string;
    key?: string;
    primaryLanguage?: string;
    techStack?: string[];
    summaryHint?: string;
  }) {
    return request<ProjectDescriptionData>('/ai/project-description', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * AI Capability 4: Productivity Suggestions & Sprint Coach
   */
  async getAIProductivitySuggestions(params: {
    tasks: any[];
    velocityScore?: number;
    userName?: string;
  }) {
    return request<{ suggestions: ProductivityCoachSuggestion[]; source: string }>(
      '/ai/productivity-coach',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * AI Capability 5: AI-Assisted Task Prioritization
   */
  async prioritizeAITasks(tasks: any[]) {
    return request<{ prioritized: PrioritizedTaskItem[]; source: string }>('/ai/prioritize', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
  },

  /**
   * AI Copilot Chat Assistant
   */
  async chatWithAICopilot(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], context?: any) {
    return request<{ reply: string; source: string }>('/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
    });
  },
};

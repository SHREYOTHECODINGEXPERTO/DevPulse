import fs from 'fs';
import path from 'path';
import { User, Project, Task } from '../models/types.ts';
import { SEED_USERS, SEED_PROJECTS, SEED_TASKS } from './seedData.ts';
import { config } from '../config/index.ts';

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  version: string;
  lastUpdated: string;
}

class DataStore {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, Task> = new Map();
  private filePath: string;
  private isInitialized = false;

  constructor(filePath?: string) {
    this.filePath = filePath || config.dbFilePath;
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (parsed.users && parsed.projects && parsed.tasks) {
          parsed.users.forEach((u) => this.users.set(u.id, u));
          parsed.projects.forEach((p) => this.projects.set(p.id, p));
          parsed.tasks.forEach((t) => this.tasks.set(t.id, t));
          this.isInitialized = true;
          return;
        }
      }
    } catch (e) {
      console.warn('[DataStore] Failed to load existing database file, seeding defaults:', e);
    }

    this.reseed();
  }

  public reseed() {
    this.users.clear();
    this.projects.clear();
    this.tasks.clear();

    SEED_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    SEED_PROJECTS.forEach((p) => this.projects.set(p.id, { ...p }));
    SEED_TASKS.forEach((t) => this.tasks.set(t.id, { ...t }));

    this.save();
    this.isInitialized = true;
  }

  private save() {
    try {
      const payload: DatabaseSchema = {
        users: Array.from(this.users.values()),
        projects: Array.from(this.projects.values()),
        tasks: Array.from(this.tasks.values()),
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      };
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to save DB to disk:', err);
    }
  }

  // --- Users CRUD ---
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase().trim();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase().trim() === normalized);
  }

  public getUserByHandle(handle: string): User | undefined {
    const normalized = handle.toLowerCase().trim();
    return Array.from(this.users.values()).find((u) => u.handle.toLowerCase().trim() === normalized);
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID mutation
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    this.save();
    return updated;
  }

  public deleteUser(id: string): boolean {
    const deleted = this.users.delete(id);
    if (deleted) {
      // Unassign active tasks or keep history
      for (const [taskId, task] of this.tasks.entries()) {
        if (task.assigneeId === id) {
          this.tasks.set(taskId, {
            ...task,
            assigneeId: null,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      // Remove from project members
      for (const [projId, proj] of this.projects.entries()) {
        if (proj.memberIds.includes(id)) {
          this.projects.set(projId, {
            ...proj,
            memberIds: proj.memberIds.filter((m) => m !== id),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      this.save();
    }
    return deleted;
  }

  // --- Projects CRUD ---
  public getProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public getProjectByKey(key: string): Project | undefined {
    const normalized = key.toUpperCase().trim();
    return Array.from(this.projects.values()).find((p) => p.key.toUpperCase().trim() === normalized);
  }

  public createProject(project: Project): Project {
    this.projects.set(project.id, project);
    this.save();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated: Project = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    this.save();
    return updated;
  }

  public deleteProject(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      // Cascade delete tasks belonging to this project
      for (const [taskId, task] of this.tasks.entries()) {
        if (task.projectId === id) {
          this.tasks.delete(taskId);
        }
      }
      this.save();
    }
    return deleted;
  }

  // --- Tasks CRUD ---
  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getTaskByKey(key: string): Task | undefined {
    const normalized = key.toUpperCase().trim();
    return Array.from(this.tasks.values()).find((t) => t.key.toUpperCase().trim() === normalized);
  }

  public getTasksByProjectId(projectId: string): Task[] {
    return Array.from(this.tasks.values()).filter((t) => t.projectId === projectId);
  }

  public getTasksByAssigneeId(assigneeId: string): Task[] {
    return Array.from(this.tasks.values()).filter((t) => t.assigneeId === assigneeId);
  }

  public createTask(task: Task): Task {
    this.tasks.set(task.id, task);
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated: Task = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    this.save();
    return updated;
  }

  public deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      this.save();
    }
    return deleted;
  }
}

export const db = new DataStore();

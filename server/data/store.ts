import fs from 'fs';
import path from 'path';
import { User, Project, Task } from '../models/types.ts';
import { UserModel } from '../models/user.model.ts';
import { ProjectModel } from '../models/project.model.ts';
import { TaskModel } from '../models/task.model.ts';
import { SEED_USERS, SEED_PROJECTS, SEED_TASKS } from './seedData.ts';
import { config } from '../config/index.ts';
import { mongoose } from '../config/database.ts';

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

  public isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  public async init() {
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

    await this.reseed();
  }

  public async reseed() {
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
  public async getUsers(): Promise<User[]> {
    if (this.isMongoConnected()) {
      const docs = await UserModel.find().lean();
      return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }));
    }
    return Array.from(this.users.values());
  }

  public async getUserById(id: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      const doc = await UserModel.findById(id).lean();
      return doc ? ({ ...doc, id: (doc as any)._id.toString() } as User) : undefined;
    }
    return this.users.get(id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    if (this.isMongoConnected()) {
      const doc = await UserModel.findOne({ email: normalized }).lean();
      return doc ? ({ ...doc, id: (doc as any)._id.toString() } as User) : undefined;
    }
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase().trim() === normalized);
  }

  public async getUserByHandle(handle: string): Promise<User | undefined> {
    const normalized = handle.toLowerCase().trim();
    if (this.isMongoConnected()) {
      const doc = await UserModel.findOne({ handle: normalized }).lean();
      return doc ? ({ ...doc, id: (doc as any)._id.toString() } as User) : undefined;
    }
    return Array.from(this.users.values()).find((u) => u.handle.toLowerCase().trim() === normalized);
  }

  public async createUser(user: User): Promise<User> {
    // Run schema level validation
    const userDoc = new UserModel({
      _id: user.id,
      ...user,
    });
    await userDoc.validate();

    if (this.isMongoConnected()) {
      const saved = await userDoc.save();
      return (saved.toJSON() as unknown) as User;
    }

    this.users.set(user.id, user);
    this.save();
    return user;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? ({ ...(updated as any), id: (updated as any)._id.toString() } as User) : undefined;
    }

    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    this.save();
    return updated;
  }

  public async deleteUser(id: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      const deleted = await UserModel.findByIdAndDelete(id);
      if (deleted) {
        // Relational cleanup: Unassign tasks
        await TaskModel.updateMany({ assigneeId: id }, { $set: { assigneeId: null } });
        // Relational cleanup: Remove from project members
        await ProjectModel.updateMany({ memberIds: id }, { $pull: { memberIds: id } });
        return true;
      }
      return false;
    }

    const deleted = this.users.delete(id);
    if (deleted) {
      // Unassign active tasks
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
  public async getProjects(): Promise<Project[]> {
    if (this.isMongoConnected()) {
      const docs = await ProjectModel.find().lean();
      return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }));
    }
    return Array.from(this.projects.values());
  }

  public async getProjectById(id: string): Promise<Project | undefined> {
    if (this.isMongoConnected()) {
      const doc = await ProjectModel.findById(id).lean();
      return doc ? ({ ...doc, id: (doc as any)._id.toString() } as Project) : undefined;
    }
    return this.projects.get(id);
  }

  public async getProjectByKey(key: string): Promise<Project | undefined> {
    const normalized = key.toUpperCase().trim();
    if (this.isMongoConnected()) {
      const doc = await ProjectModel.findOne({ key: normalized }).lean();
      return doc ? ({ ...doc, id: (doc as any)._id.toString() } as Project) : undefined;
    }
    return Array.from(this.projects.values()).find((p) => p.key.toUpperCase().trim() === normalized);
  }

  public async createProject(project: Project): Promise<Project> {
    // Run schema level validation
    const projectDoc = new ProjectModel({
      _id: project.id,
      ...project,
    });
    await projectDoc.validate();

    if (this.isMongoConnected()) {
      const saved = await projectDoc.save();
      return (saved.toJSON() as unknown) as Project;
    }

    this.projects.set(project.id, project);
    this.save();
    return project;
  }

  public async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    if (this.isMongoConnected()) {
      const updated = await ProjectModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? ({ ...(updated as any), id: (updated as any)._id.toString() } as Project) : undefined;
    }

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

  public async deleteProject(id: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      const deleted = await ProjectModel.findByIdAndDelete(id);
      if (deleted) {
        // Cascade delete tasks belonging to this project
        await TaskModel.deleteMany({ projectId: id });
        return true;
      }
      return false;
    }

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
  public async getTasks(): Promise<Task[]> {
    if (this.isMongoConnected()) {
      const docs = await TaskModel.find().lean();
      return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }));
    }
    return Array.from(this.tasks.values());
  }

  public async getTaskById(id: string): Promise<Task | undefined> {
    if (this.isMongoConnected()) {
      const doc = await TaskModel.findById(id).lean();
      return doc ? ({ ...(doc as any), id: (doc as any)._id.toString() } as Task) : undefined;
    }
    return this.tasks.get(id);
  }

  public async getTaskByKey(key: string): Promise<Task | undefined> {
    const normalized = key.toUpperCase().trim();
    if (this.isMongoConnected()) {
      const doc = await TaskModel.findOne({ key: normalized }).lean();
      return doc ? ({ ...(doc as any), id: (doc as any)._id.toString() } as Task) : undefined;
    }
    return Array.from(this.tasks.values()).find((t) => t.key.toUpperCase().trim() === normalized);
  }

  public async getTasksByProjectId(projectId: string): Promise<Task[]> {
    if (this.isMongoConnected()) {
      const docs = await TaskModel.find({ projectId }).lean();
      return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }));
    }
    return Array.from(this.tasks.values()).filter((t) => t.projectId === projectId);
  }

  public async getTasksByAssigneeId(assigneeId: string): Promise<Task[]> {
    if (this.isMongoConnected()) {
      const docs = await TaskModel.find({ assigneeId }).lean();
      return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }));
    }
    return Array.from(this.tasks.values()).filter((t) => t.assigneeId === assigneeId);
  }

  public async createTask(task: Task): Promise<Task> {
    // Run schema level validation
    const taskDoc = new TaskModel({
      _id: task.id,
      ...task,
    });
    await taskDoc.validate();

    if (this.isMongoConnected()) {
      const saved = await taskDoc.save();
      return (saved.toJSON() as unknown) as Task;
    }

    this.tasks.set(task.id, task);
    this.save();
    return task;
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    if (this.isMongoConnected()) {
      const updated = await TaskModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? ({ ...(updated as any), id: (updated as any)._id.toString() } as Task) : undefined;
    }

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

  public async deleteTask(id: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      const deleted = await TaskModel.findByIdAndDelete(id);
      return !!deleted;
    }

    const deleted = this.tasks.delete(id);
    if (deleted) {
      this.save();
    }
    return deleted;
  }
}

export const db = new DataStore();

import mongoose, { Schema, Document } from 'mongoose';
import { Task, TaskPriority, TaskStatus, TaskType, StatusHistoryItem } from './types.ts';

export interface ITask extends Omit<Task, 'id'> {
  _id: string;
}

const TASK_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const TASK_TYPES: TaskType[] = ['Story', 'Bug', 'Task', 'Epic', 'Refactor'];

const StatusHistorySchema = new Schema<StatusHistoryItem>(
  {
    fromStatus: {
      type: String,
      enum: [...TASK_STATUSES, null],
      default: null,
    },
    toStatus: {
      type: String,
      required: [true, 'Target status is required'],
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
    },
    changedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
    },
    changedBy: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

export const TaskSchema = new Schema<ITask>(
  {
    _id: {
      type: String,
      required: true,
      default: () => `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    key: {
      type: String,
      required: [true, 'Task key is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    projectId: {
      type: String,
      required: [true, 'Task project ID is required'],
      ref: 'Project',
    },
    assigneeId: {
      type: String,
      default: null,
      ref: 'User',
    },
    reporterId: {
      type: String,
      required: [true, 'Task reporter ID is required'],
      ref: 'User',
    },
    type: {
      type: String,
      enum: {
        values: TASK_TYPES,
        message: '{VALUE} is not a valid task type',
      },
      default: 'Task',
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid task priority',
      },
      default: 'Medium',
    },
    storyPoints: {
      type: Number,
      default: 1,
      min: [0, 'Story points cannot be negative'],
      max: [100, 'Story points cannot exceed 100'],
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    timeSpentHours: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    sprint: {
      type: String,
      trim: true,
    },
    epic: {
      type: String,
      trim: true,
    },
    epicColor: {
      type: String,
      trim: true,
    },
    linkedPR: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: String,
    },
    completedAt: {
      type: String,
      default: null,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
TaskSchema.index({ key: 1 }, { unique: true });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ reporterId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ type: 1 });
TaskSchema.index({ sprint: 1 });

export const TaskModel = (mongoose.models.Task as mongoose.Model<ITask>) || mongoose.model<ITask>('Task', TaskSchema);

import mongoose, { Schema } from 'mongoose';
import { Project, ProjectStatus } from './types.ts';

export interface IProject extends Omit<Project, 'id'> {
  _id: string;
}

const PROJECT_STATUSES: ProjectStatus[] = [
  'Active Sprint',
  'In Progress',
  'Completed',
  'Maintained',
  'Planning',
];

export const ProjectSchema = new Schema<IProject>(
  {
    _id: {
      type: String,
      required: true,
      default: () => `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      trim: true,
      uppercase: true,
      unique: true,
      match: [/^[A-Z0-9]{2,10}$/, 'Project key must be 2-10 uppercase alphanumeric characters (e.g. PULSE, CORE)'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    primaryLanguage: {
      type: String,
      default: 'TypeScript',
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    frameworks: {
      type: [String],
      default: [],
    },
    techStackBadges: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: '{VALUE} is not a valid project status',
      },
      default: 'Active Sprint',
    },
    ownerId: {
      type: String,
      required: [true, 'Project owner ID is required'],
      ref: 'User',
    },
    memberIds: [
      {
        type: String,
        ref: 'User',
      },
    ],
    repoUrl: {
      type: String,
      trim: true,
    },
    stars: {
      type: Number,
      default: 0,
      min: [0, 'Stars cannot be negative'],
    },
    forks: {
      type: Number,
      default: 0,
      min: [0, 'Forks cannot be negative'],
    },
    openIssues: {
      type: Number,
      default: 0,
      min: [0, 'Open issues cannot be negative'],
    },
    defaultBranch: {
      type: String,
      default: 'main',
      trim: true,
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
ProjectSchema.index({ key: 1 }, { unique: true });
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ primaryLanguage: 1 });

export const ProjectModel = (mongoose.models.Project as mongoose.Model<IProject>) || mongoose.model<IProject>('Project', ProjectSchema);

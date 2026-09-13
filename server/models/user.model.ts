import mongoose, { Schema } from 'mongoose';
import { User, UserStatus } from './types.ts';

export interface IUser extends Omit<User, 'id'> {
  _id: string;
}

const USER_STATUSES: UserStatus[] = [
  'In the Zone',
  'Reviewing Code',
  'Pairing',
  'In Sprint Planning',
  'AFK',
  'Vibecoding',
  'Debugging at 3AM',
];

export const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
      default: () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    handle: {
      type: String,
      required: [true, 'User handle is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^@?[a-zA-Z0-9_-]+$/, 'Handle may only contain alphanumeric characters, underscores, and hyphens with optional @ prefix'],
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'],
    },
    avatar: {
      type: String,
      default: function (this: any) {
        return `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
      },
    },
    role: {
      type: String,
      required: [true, 'User role is required'],
      trim: true,
    },
    team: {
      type: String,
      required: [true, 'User team is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: USER_STATUSES,
        message: '{VALUE} is not a supported user status',
      },
      default: 'In the Zone',
    },
    statusColor: {
      type: String,
      default: '#10B981',
    },
    streakDays: {
      type: Number,
      default: 0,
      min: [0, 'Streak days cannot be negative'],
    },
    storyPointsCompleted: {
      type: Number,
      default: 0,
      min: [0, 'Story points completed cannot be negative'],
    },
    totalCommitsToday: {
      type: Number,
      default: 0,
      min: [0, 'Total commits today cannot be negative'],
    },
    prMergeRate: {
      type: Number,
      default: 0,
      min: [0, 'PR merge rate cannot be less than 0'],
      max: [100, 'PR merge rate cannot exceed 100'],
    },
    velocityScore: {
      type: Number,
      default: 0,
      min: [0, 'Velocity score cannot be less than 0'],
      max: [100, 'Velocity score cannot exceed 100'],
    },
    focusMinutesToday: {
      type: Number,
      default: 0,
      min: [0, 'Focus minutes cannot be negative'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    peakCodingWindow: {
      type: String,
      default: '9:00 AM - 1:00 PM',
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    customDesignation: {
      type: String,
      trim: true,
    },
    xpPoints: {
      type: Number,
      default: 0,
      min: [0, 'XP points cannot be negative'],
    },
    level: {
      type: Number,
      default: 1,
      min: [1, 'Level must be at least 1'],
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

// Indexes for optimized searching and relational queries
UserSchema.index({ handle: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ team: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ velocityScore: -1 });

export const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

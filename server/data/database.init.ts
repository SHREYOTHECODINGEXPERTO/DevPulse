import { UserModel } from '../models/user.model.ts';
import { ProjectModel } from '../models/project.model.ts';
import { TaskModel } from '../models/task.model.ts';
import { SEED_USERS, SEED_PROJECTS, SEED_TASKS } from './seedData.ts';
import { connectDatabase, mongoose } from '../config/database.ts';
import { db } from './store.ts';

/**
 * Initialize database connection and seed initial collections if empty
 */
export async function initializeDatabase(): Promise<void> {
  await connectDatabase();

  if (mongoose.connection.readyState === 1) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[Database Seeder] MongoDB collections empty. Seeding initial data...');
        await seedMongoData();
        console.log('[Database Seeder] ✅ Seeded initial users, projects, and tasks to MongoDB.');
      } else {
        console.log(`[Database Seeder] MongoDB already populated with ${userCount} users.`);
      }
    } catch (err: any) {
      console.error('[Database Seeder] Error seeding MongoDB:', err.message);
    }
  } else {
    // Local persistence layer initialized
    await db.init();
  }
}

/**
 * Seed MongoDB collections with initial seed dataset
 */
export async function seedMongoData(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    await UserModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await TaskModel.deleteMany({});

    await UserModel.insertMany(
      SEED_USERS.map((u) => ({
        _id: u.id,
        ...u,
      }))
    );

    await ProjectModel.insertMany(
      SEED_PROJECTS.map((p) => ({
        _id: p.id,
        ...p,
      }))
    );

    await TaskModel.insertMany(
      SEED_TASKS.map((t) => ({
        _id: t.id,
        ...t,
      }))
    );
  } else {
    await db.reseed();
  }
}

/**
 * Reseed database for testing isolation
 */
export async function reseedDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    await seedMongoData();
  } else {
    await db.reseed();
  }
}

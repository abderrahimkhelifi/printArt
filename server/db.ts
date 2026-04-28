import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, InsertOrder, portfolioWorks, InsertPortfolioWork, services, InsertService, notifications, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Orders queries
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(id: number, status: string, adminNotes?: string, progress?: number, estimatedPrice?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (progress !== undefined) updateData.progress = progress;
  if (estimatedPrice !== undefined) updateData.estimatedPrice = estimatedPrice;
  
  return await db.update(orders).set(updateData).where(eq(orders.id, id));
}

// Portfolio Works queries
export async function createPortfolioWork(work: InsertPortfolioWork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(portfolioWorks).values(work);
}

export async function getPortfolioWorks() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(portfolioWorks).orderBy(desc(portfolioWorks.createdAt));
}

export async function deletePortfolioWork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(portfolioWorks).where(eq(portfolioWorks.id, id));
}

export async function updatePortfolioWork(id: number, data: Partial<InsertPortfolioWork>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(portfolioWorks).set(data).where(eq(portfolioWorks.id, id));
}

// Services queries
export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(services).values(service);
}

export async function getServices() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(services).where(eq(services.isActive, 1));
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(services).set(data).where(eq(services.id, id));
}

export async function toggleServiceActive(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const service = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (service.length === 0) throw new Error("Service not found");
  
  const newStatus = service[0].isActive === 1 ? 0 : 1;
  return await db.update(services).set({ isActive: newStatus }).where(eq(services.id, id));
}

// Notifications queries
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(notifications).values(notification);
}

export async function getNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

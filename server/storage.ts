import { 
  type Vehicle, type InsertVehicle,
  type ParkingSession, type InsertParkingSession,
  type User, type InsertUser,
  users, vehicles, parkingSessions
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;
  
  // Parking
  getParkingSessions(): Promise<ParkingSession[]>;
  createParkingSession(session: InsertParkingSession): Promise<ParkingSession>;
  updateParkingSession(id: number, session: Partial<ParkingSession>): Promise<ParkingSession>;
  
  // User (for completion)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updated] = await db
      .update(vehicles)
      .set(vehicle)
      .where(eq(vehicles.id, id))
      .returning();

    if (!updated) {
      throw new Error("Vehicle not found");
    }

    return updated;
  }

  async deleteVehicle(id: number): Promise<void> {
    const [deleted] = await db
      .delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning({ id: vehicles.id });

    if (!deleted) {
      throw new Error("Vehicle not found");
    }
  }

  // Parking
  async getParkingSessions(): Promise<ParkingSession[]> {
    return await db.select().from(parkingSessions);
  }

  async createParkingSession(session: InsertParkingSession): Promise<ParkingSession> {
    const [newSession] = await db.insert(parkingSessions).values(session).returning();
    return newSession;
  }

  async updateParkingSession(id: number, session: Partial<ParkingSession>): Promise<ParkingSession> {
    const [updated] = await db.update(parkingSessions)
      .set(session)
      .where(eq(parkingSessions.id, id))
      .returning();

    if (!updated) {
      throw new Error("Session not found");
    }

    return updated;
  }

  // User
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users).values({ ...user, password: hashedPassword }).returning();
    return newUser;
  }

  async verifyUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const storage = new DatabaseStorage();

// Seed real admin user on startup
export async function seedAdminUser() {
  const existing = await storage.getUserByUsername("aditya@admin.com");
  if (!existing) {
    await storage.createUser({ username: "aditya@admin.com", password: "aditya123" });
    console.log("✅ Admin user created: aditya@admin.com");
  }
}

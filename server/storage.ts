import { 
  type Vehicle, type InsertVehicle,
  type ParkingSession, type InsertParkingSession,
  type User, type InsertUser,
  users, vehicles, parkingSessions
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  
  // Parking
  getParkingSessions(): Promise<ParkingSession[]>;
  createParkingSession(session: InsertParkingSession): Promise<ParkingSession>;
  updateParkingSession(id: number, session: Partial<InsertParkingSession>): Promise<ParkingSession>;
  
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

  // Parking
  async getParkingSessions(): Promise<ParkingSession[]> {
    return await db.select().from(parkingSessions);
  }

  async createParkingSession(session: InsertParkingSession): Promise<ParkingSession> {
    const [newSession] = await db.insert(parkingSessions).values(session).returning();
    return newSession;
  }

  async updateParkingSession(id: number, session: Partial<InsertParkingSession>): Promise<ParkingSession> {
    const [updated] = await db.update(parkingSessions)
      .set(session)
      .where(eq(parkingSessions.id, id))
      .returning();
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
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
}

export const storage = new DatabaseStorage();

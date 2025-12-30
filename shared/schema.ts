import { pgTable, text, serial, timestamp, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  vehicleType: text("vehicle_type").notNull(), // 'Car' | 'Bike'
  contactNumber: text("contact_number").notNull(),
  imageUrl: text("image_url"), // Base64 or Blob URL
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingSessions = pgTable("parking_sessions", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull(), // Linked by number for simplicity
  slotNumber: text("slot_number").notNull(),
  entryTime: timestamp("entry_time").defaultNow().notNull(),
  exitTime: timestamp("exit_time"),
  entryImageUrl: text("entry_image_url"),
  status: text("status").notNull().default('PARKED'), // 'PARKED' | 'EXITED'
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertParkingSessionSchema = createInsertSchema(parkingSessions).omit({ id: true, entryTime: true, exitTime: true, status: true });

// === EXPLICIT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type ParkingSession = typeof parkingSessions.$inferSelect;
export type InsertParkingSession = z.infer<typeof insertParkingSessionSchema>;

export type LoginRequest = {
  username: string;
  password: string;
};

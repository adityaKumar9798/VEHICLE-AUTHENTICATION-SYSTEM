import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Vehicles
  app.get(api.vehicles.list.path, async (_req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });

  app.post(api.vehicles.create.path, async (req, res) => {
    try {
      const input = api.vehicles.create.input.parse(req.body);
      const vehicle = await storage.createVehicle(input);
      res.status(201).json(vehicle);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.vehicles.update.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid vehicle id" });
    }

    try {
      const input = api.vehicles.update.input.parse(req.body);
      const vehicle = await storage.updateVehicle(id, input);
      res.json(vehicle);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      if (err instanceof Error && err.message === "Vehicle not found") {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  app.delete(api.vehicles.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid vehicle id" });
    }

    try {
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (err: any) {
      if (err instanceof Error && err.message === "Vehicle not found") {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  // Parking
  app.get(api.parking.list.path, async (_req, res) => {
    const sessions = await storage.getParkingSessions();
    res.json(sessions);
  });

  app.post(api.parking.entry.path, async (req, res) => {
    try {
      const input = api.parking.entry.input.parse(req.body);
      const session = await storage.createParkingSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.parking.exit.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    try {
      // Fetch session to calculate duration
      const sessions = await storage.getParkingSessions();
      const session = sessions.find(s => s.id === id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session.exitTime) {
        return res.status(400).json({ message: "Session already exited" });
      }

      const now = new Date();
      const durationMinutes = Math.ceil((now.getTime() - session.entryTime.getTime()) / 60000);
      const blocksOf30 = Math.ceil(durationMinutes / 30);
      const totalAmountPaise = blocksOf30 * 20 * 100; // Rs 20 per 30 min, stored in paise

      const updatedSession = await storage.updateParkingSession(id, {
        status: "EXITED",
        exitTime: now,
        totalAmount: totalAmountPaise,
      });
      res.json(updatedSession);
    } catch (err: any) {
      if (err instanceof Error && err.message === "Session not found") {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  // Auth
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const user = await storage.verifyUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (err) {
      throw err;
    }
  });

  return httpServer;
}

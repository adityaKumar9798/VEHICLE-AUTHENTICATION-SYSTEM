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
  app.get(api.vehicles.list.path, async (req, res) => {
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

  // Parking
  app.get(api.parking.list.path, async (req, res) => {
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
    const id = parseInt(req.params.id);
    const session = await storage.updateParkingSession(id, { 
      status: 'EXITED', 
      exitTime: new Date() 
    });
    res.json(session);
  });

  return httpServer;
}

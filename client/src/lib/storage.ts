import { Vehicle, ParkingSession, InsertVehicle, InsertParkingSession } from "@shared/schema";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "./queryClient";

const parseVehicle = (v: any): Vehicle => ({
  ...v,
  createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
});

const parseSession = (s: any): ParkingSession => ({
  ...s,
  entryTime: new Date(s.entryTime),
  exitTime: s.exitTime ? new Date(s.exitTime) : null,
});

// --- Vehicles (server-backed) ---
export const storageVehicles = {
  list: async (): Promise<Vehicle[]> => {
    const res = await apiRequest(api.vehicles.list.method, api.vehicles.list.path);
    const data = await res.json();
    return data.map(parseVehicle);
  },

  add: async (data: InsertVehicle): Promise<Vehicle> => {
    const res = await apiRequest(api.vehicles.create.method, api.vehicles.create.path, data);
    return parseVehicle(await res.json());
  },

  update: async (id: number, data: Partial<InsertVehicle>): Promise<Vehicle> => {
    const res = await apiRequest(api.vehicles.update.method, buildUrl(api.vehicles.update.path, { id }), data);
    return parseVehicle(await res.json());
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(api.vehicles.delete.method, buildUrl(api.vehicles.delete.path, { id }));
  },
};

// --- Parking Sessions (server-backed) ---
export const storageParking = {
  list: async (): Promise<ParkingSession[]> => {
    const res = await apiRequest(api.parking.list.method, api.parking.list.path);
    const data = await res.json();
    return data.map(parseSession);
  },

  entry: async (data: InsertParkingSession): Promise<ParkingSession> => {
    const res = await apiRequest(api.parking.entry.method, api.parking.entry.path, data);
    return parseSession(await res.json());
  },

  exit: async (id: number): Promise<ParkingSession> => {
    const res = await apiRequest(api.parking.exit.method, buildUrl(api.parking.exit.path, { id }));
    return parseSession(await res.json());
  },
};

// --- Auth (server-backed) ---
const AUTH_KEY = "parking_app_auth";

export const storageAuth = {
  login: async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const user = await res.json();
    const token = "auth-" + user.id;
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem("user", JSON.stringify(user));
    return { token, user };
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("user");
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_KEY);
  },
  getUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
};

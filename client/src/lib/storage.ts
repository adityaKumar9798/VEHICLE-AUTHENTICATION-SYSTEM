/**
 * LocalStorage Simulation Layer
 * Simulates database operations strictly on the client side as requested.
 */

import { Vehicle, ParkingSession, InsertVehicle, InsertParkingSession } from "@shared/schema";

const KEYS = {
  VEHICLES: "parking_app_vehicles",
  SESSIONS: "parking_app_sessions",
  AUTH: "parking_app_auth",
};

// --- Helpers ---

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Vehicles ---

export const storageVehicles = {
  list: async (): Promise<Vehicle[]> => {
    await delay(300); // Simulate network latency
    return getStored<Vehicle[]>(KEYS.VEHICLES, []);
  },

  add: async (data: InsertVehicle): Promise<Vehicle> => {
    await delay(500);
    const vehicles = getStored<Vehicle[]>(KEYS.VEHICLES, []);
    
    // Check duplicate
    if (vehicles.some(v => v.vehicleNumber === data.vehicleNumber)) {
      throw new Error("Vehicle number already registered");
    }

    const newVehicle: Vehicle = {
      ...data,
      id: Date.now(), // Fake ID
      createdAt: new Date(),
      imageUrl: data.imageUrl || null
    };
    
    setStored(KEYS.VEHICLES, [newVehicle, ...vehicles]);
    return newVehicle;
  },
};

// --- Parking Sessions ---

export const storageParking = {
  list: async (): Promise<ParkingSession[]> => {
    await delay(300);
    const sessions = getStored<ParkingSession[]>(KEYS.SESSIONS, []);
    // Re-hydrate dates from JSON strings
    return sessions.map(s => ({
      ...s,
      entryTime: new Date(s.entryTime),
      exitTime: s.exitTime ? new Date(s.exitTime) : null
    }));
  },

  entry: async (data: InsertParkingSession): Promise<ParkingSession> => {
    await delay(500);
    const sessions = getStored<ParkingSession[]>(KEYS.SESSIONS, []);
    
    // Check if vehicle is already parked
    const isParked = sessions.some(s => s.vehicleNumber === data.vehicleNumber && s.status === 'PARKED');
    if (isParked) {
      throw new Error("Vehicle is already marked as parked");
    }

    const newSession: ParkingSession = {
      ...data,
      id: Date.now(),
      entryTime: new Date(),
      status: 'PARKED',
      exitTime: null,
      entryImageUrl: data.entryImageUrl || null
    };

    setStored(KEYS.SESSIONS, [newSession, ...sessions]);
    return newSession;
  },

  exit: async (id: number): Promise<ParkingSession> => {
    await delay(500);
    const sessions = getStored<ParkingSession[]>(KEYS.SESSIONS, []);
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) throw new Error("Session not found");
    
    const updatedSession = {
      ...sessions[index],
      status: 'EXITED',
      exitTime: new Date()
    };
    
    sessions[index] = updatedSession;
    setStored(KEYS.SESSIONS, sessions);
    return updatedSession;
  }
};

// --- Auth ---

export const storageAuth = {
  login: async () => {
    await delay(600);
    const token = "fake-jwt-token-" + Date.now();
    localStorage.setItem(KEYS.AUTH, token);
    return { token };
  },
  logout: () => {
    localStorage.removeItem(KEYS.AUTH);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(KEYS.AUTH);
  }
};

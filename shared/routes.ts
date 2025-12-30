import { z } from 'zod';
import { insertVehicleSchema, insertParkingSessionSchema, updateVehicleSchema, vehicles, parkingSessions } from './schema';

export const api = {
  vehicles: {
    list: {
      method: 'GET' as const,
      path: '/api/vehicles',
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles',
      input: insertVehicleSchema,
      responses: {
        201: z.custom<typeof vehicles.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/vehicles/:id',
      input: updateVehicleSchema,
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/vehicles/:id',
      responses: {
        204: z.null(),
      },
    },
  },
  parking: {
    list: {
      method: 'GET' as const,
      path: '/api/parking/sessions',
      responses: {
        200: z.array(z.custom<typeof parkingSessions.$inferSelect>()),
      },
    },
    entry: {
      method: 'POST' as const,
      path: '/api/parking/entry',
      input: insertParkingSessionSchema,
      responses: {
        201: z.custom<typeof parkingSessions.$inferSelect>(),
      },
    },
    exit: {
      method: 'POST' as const,
      path: '/api/parking/exit/:id',
      responses: {
        200: z.custom<typeof parkingSessions.$inferSelect>(),
      },
    },
  }
};

// Helper (required by template)
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

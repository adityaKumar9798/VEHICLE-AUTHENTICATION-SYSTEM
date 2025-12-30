import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageVehicles } from "@/lib/storage";
import { InsertVehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: storageVehicles.list,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertVehicle) => storageVehicles.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Vehicle Registered",
        description: "The vehicle has been successfully added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertVehicle> }) =>
      storageVehicles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Vehicle Updated",
        description: "Vehicle details have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => storageVehicles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Vehicle Removed",
        description: "The vehicle has been deleted from the registry.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

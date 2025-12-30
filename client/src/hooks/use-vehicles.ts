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

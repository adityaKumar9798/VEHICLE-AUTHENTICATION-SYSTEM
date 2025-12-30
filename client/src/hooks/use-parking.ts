import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageParking } from "@/lib/storage";
import { InsertParkingSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useParkingSessions() {
  return useQuery({
    queryKey: ["parking-sessions"],
    queryFn: storageParking.list,
  });
}

export function useParkingEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertParkingSession) => storageParking.entry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking-sessions"] });
      toast({
        title: "Entry Recorded",
        description: "Vehicle marked as parked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Entry Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useParkingExit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => storageParking.exit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking-sessions"] });
      toast({
        title: "Exit Recorded",
        description: "Vehicle has been marked as exited.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Exit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

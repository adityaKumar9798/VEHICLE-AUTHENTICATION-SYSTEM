import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertParkingSessionSchema } from "@shared/schema";
import { useParkingEntry } from "@/hooks/use-parking";
import { useVehicles } from "@/hooks/use-vehicles";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CameraCapture } from "@/components/camera-capture";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Search, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function EntryPage() {
  const { mutate, isPending } = useParkingEntry();
  const { data: vehicles } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const form = useForm<z.infer<typeof insertParkingSessionSchema>>({
    resolver: zodResolver(insertParkingSessionSchema),
    defaultValues: {
      slotNumber: `A-${Math.floor(Math.random() * 50) + 1}`, // Auto assign random slot
    }
  });

  const onSubmit = (data: z.infer<typeof insertParkingSessionSchema>) => {
    mutate(data, {
      onSuccess: () => {
        form.reset({
          slotNumber: `A-${Math.floor(Math.random() * 50) + 1}`,
          vehicleNumber: "",
          entryImageUrl: undefined
        });
        setSelectedVehicle(null);
      }
    });
  };

  const handleVehicleSelect = (value: string) => {
    form.setValue("vehicleNumber", value);
    setSelectedVehicle(value);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vehicle Entry</h1>
        <p className="text-muted-foreground mt-1">Record a new vehicle entry into the parking lot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Entry Form</CardTitle>
            <CardDescription>Fill in details to assign a slot</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Registered Vehicle (Optional)</label>
                    <Select onValueChange={handleVehicleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map(v => (
                          <SelectItem key={v.id} value={v.vehicleNumber}>
                            <span className="font-mono mr-2">{v.vehicleNumber}</span>
                            <span className="text-muted-foreground text-xs">({v.ownerName})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ABC-1234" 
                            className="font-mono text-lg uppercase tracking-wider" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Slot</FormLabel>
                        <FormControl>
                          <Input className="font-mono font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entryImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Camera</FormLabel>
                        <FormControl>
                          <CameraCapture 
                            onCapture={(src) => field.onChange(src)} 
                            label="Capture Entry Photo" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button size="lg" className="w-full" type="submit" disabled={isPending}>
                  {isPending ? "Processing..." : (
                    <>
                      Confirm Entry <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           {selectedVehicle && vehicles ? (
             <Card className="bg-primary/5 border-primary/20">
               <CardHeader>
                 <CardTitle className="text-primary flex items-center gap-2">
                   <CheckCircle className="w-5 h-5" />
                   Verified Vehicle
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {vehicles.find(v => v.vehicleNumber === selectedVehicle)?.imageUrl && (
                   <img 
                     src={vehicles.find(v => v.vehicleNumber === selectedVehicle)?.imageUrl!} 
                     alt="Vehicle"
                     className="w-full h-48 object-cover rounded-lg mb-4" 
                   />
                 )}
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-muted-foreground">Owner</p>
                     <p className="font-medium">{vehicles.find(v => v.vehicleNumber === selectedVehicle)?.ownerName}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Type</p>
                     <p className="font-medium">{vehicles.find(v => v.vehicleNumber === selectedVehicle)?.vehicleType}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Contact</p>
                     <p className="font-medium">{vehicles.find(v => v.vehicleNumber === selectedVehicle)?.contactNumber}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/50 text-muted-foreground">
               <Search className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-center max-w-xs">
                 Select a vehicle to view details or manually enter a new visitor number.
               </p>
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { Layout } from "@/components/layout";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/use-vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CameraCapture } from "@/components/camera-capture";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Car, Bike, User, Pencil, Trash2, QrCode } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertVehicleSchema } from "@shared/schema";
import QRCodeScanner from "@/components/qr-code-scanner";

export default function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<any>(null);

  const filteredVehicles = vehicles?.filter(v => 
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Register and manage vehicles in the system</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVehicleId ? "Edit Vehicle" : "New Vehicle Registration"}</DialogTitle>
            </DialogHeader>
            <VehicleForm 
              vehicle={vehicles?.find(v => v.id === editingVehicleId)}
              onSuccess={() => {
                setIsOpen(false);
                setEditingVehicleId(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search number or owner..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-center">QR Code</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredVehicles?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No vehicles found</td></tr>
              ) : (
                filteredVehicles?.map((vehicle) => (
                  <tr key={vehicle.id} className="bg-card hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium font-mono text-base">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      {vehicle.ownerName}
                    </td>
                    <td className="px-6 py-4">{vehicle.contactNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.vehicleType === 'Car' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {vehicle.vehicleType === 'Car' ? <Car className="w-3 h-3 mr-1" /> : <Bike className="w-3 h-3 mr-1" />}
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVehicleForQR(vehicle);
                          setShowQRGenerator(true);
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR
                      </Button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingVehicleId(vehicle.id);
                            setIsOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <DeleteVehicleButton vehicleId={vehicle.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Generator Modal */}
      {showQRGenerator && selectedVehicleForQR && (
        <QRCodeScanner
          mode="generate"
          vehicleData={{
            vehicleNumber: selectedVehicleForQR.vehicleNumber,
            ownerName: selectedVehicleForQR.ownerName,
            vehicleType: selectedVehicleForQR.vehicleType
          }}
          onQRDetected={(qrData) => {
            // Handle QR code generation success
            console.log('QR Code generated for:', selectedVehicleForQR.vehicleNumber);
            setShowQRGenerator(false);
            setSelectedVehicleForQR(null);
          }}
          onClose={() => {
            setShowQRGenerator(false);
            setSelectedVehicleForQR(null);
          }}
        />
      )}
    </Layout>
  );
}

function VehicleForm({ vehicle, onSuccess }: { vehicle?: any; onSuccess: () => void }) {
  const { mutate: createVehicle, isPending: creating } = useCreateVehicle();
  const { mutate: updateVehicle, isPending: updating } = useUpdateVehicle();
  
  const form = useForm<z.infer<typeof insertVehicleSchema>>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      vehicleType: "Car",
      ownerName: vehicle?.ownerName || "",
      vehicleNumber: vehicle?.vehicleNumber || "",
      contactNumber: vehicle?.contactNumber || "",
      imageUrl: vehicle?.imageUrl || "",
    }
  });

  const onSubmit = (data: z.infer<typeof insertVehicleSchema>) => {
    const action = vehicle
      ? updateVehicle.bind(null, { id: vehicle.id, data })
      : createVehicle.bind(null, data);

    action({
      onSuccess: () => onSuccess()
    } as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="JH01--" className="font-mono uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Car">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Car
                        </div>
                      </SelectItem>
                      <SelectItem value="Bike">
                        <div className="flex items-center gap-2">
                          <Bike className="w-4 h-4" />
                          Bike
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Image</FormLabel>
                  <FormControl>
                    <CameraCapture onCapture={(src) => field.onChange(src)} label="Capture vehicle photo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={creating || updating} className="w-full md:w-auto">
            {creating || updating ? "Creating..." : vehicle ? "Update Vehicle" : "Register Vehicle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function DeleteVehicleButton({ vehicleId }: { vehicleId: number }) {
  const { mutate, isPending } = useDeleteVehicle();

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={isPending}
      onClick={() => {
        const ok = window.confirm("Delete this vehicle? This cannot be undone.");
        if (ok) mutate(vehicleId);
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

import { useState } from "react";
import { Layout } from "@/components/layout";
import { useParkingSessions, useParkingExit } from "@/hooks/use-parking";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Clock, LogOut, CheckCircle2 } from "lucide-react";
import { differenceInMinutes, format } from "date-fns";

export default function ExitPage() {
  const { data: sessions } = useParkingSessions();
  const { mutate: exitVehicle, isPending } = useParkingExit();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const activeSessions = sessions?.filter(s => s.status === 'PARKED') || [];
  
  const filteredSessions = activeSessions.filter(s => 
    s.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSession = sessions?.find(s => s.id === selectedSessionId);

  const handleExit = () => {
    if (selectedSessionId) {
      exitVehicle(selectedSessionId, {
        onSuccess: () => {
          setSelectedSessionId(null);
          setSearchTerm("");
        }
      });
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vehicle Exit</h1>
        <p className="text-muted-foreground mt-1">Process vehicle checkout and calculate duration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search by Vehicle Number or Slot..." 
              className="pl-12 h-14 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No parked vehicles match your search.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`
                    cursor-pointer p-4 rounded-xl border transition-all duration-200
                    ${selectedSessionId === session.id 
                      ? 'bg-primary/5 border-primary shadow-md ring-1 ring-primary' 
                      : 'bg-card hover:border-primary/50 hover:shadow-sm'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-lg">{session.vehicleNumber}</span>
                    <span className="bg-secondary px-2 py-1 rounded text-xs font-mono">Slot {session.slotNumber}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Entered: {format(session.entryTime, 'h:mm a')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedSession ? (
            <Card className="sticky top-24 border-t-4 border-t-destructive shadow-lg">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-mono tracking-tight">{selectedSession.vehicleNumber}</h3>
                  <p className="text-muted-foreground">Currently at Slot {selectedSession.slotNumber}</p>
                </div>

                <div className="space-y-4 py-4 border-t border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Time</span>
                    <span className="font-medium">{format(selectedSession.entryTime, 'PP p')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Time</span>
                    <span className="font-medium">{format(new Date(), 'PP p')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary pt-2">
                    <span>Duration</span>
                    <span>{differenceInMinutes(new Date(), selectedSession.entryTime)} mins</span>
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="w-full" 
                  onClick={handleExit}
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Process Exit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="h-64 rounded-xl border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
              <p>Select a vehicle from the list to process exit.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

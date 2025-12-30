import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useParkingSessions, useParkingExit } from "@/hooks/use-parking";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, LogOut, CheckCircle2, Download, Camera, QrCode, CreditCard, Activity, Shield } from "lucide-react";
import { differenceInMinutes, format } from "date-fns";
import jsPDF from "jspdf";
import LicensePlateScanner from "@/components/license-plate-scanner";
import QRCodeScanner from "@/components/qr-code-scanner";
import VehicleAuthenticationHistory from "@/components/vehicle-authentication-history";
import MFAVerification from "@/components/mfa-verification";

export default function ExitPage() {
  const { data: sessions } = useParkingSessions();
  const { mutate: exitVehicle, isPending } = useParkingExit();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [exitedSession, setExitedSession] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPlateScanner, setShowPlateScanner] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [authMethod, setAuthMethod] = useState<'manual' | 'plate' | 'qr' | 'rfid' | 'mfa'>('manual');

  // Update current time every second for real-time duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeSessions = sessions?.filter(s => s.status === 'PARKED') || [];
  
  const filteredSessions = activeSessions.filter(s => 
    s.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());

  const selectedSession = sessions?.find(s => s.id === selectedSessionId);

  const handleExit = () => {
    if (selectedSessionId) {
      exitVehicle(selectedSessionId, {
        onSuccess: (data) => {
          setExitedSession(data);
          setSelectedSessionId(null);
          setSearchTerm("");
        }
      });
    }
  };

  const handlePlateDetected = (plateNumber: string) => {
    setSearchTerm(plateNumber);
    // Find matching session
    const matchingSession = activeSessions.find(s => 
      s.vehicleNumber.toLowerCase() === plateNumber.toLowerCase()
    );
    if (matchingSession) {
      setSelectedSessionId(matchingSession.id);
    }
  };

  const handleQRDetected = (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      if (data.type === 'VEHICLE_AUTH' && data.vehicleNumber) {
        setSearchTerm(data.vehicleNumber);
        // Find matching session
        const matchingSession = activeSessions.find(s => 
          s.vehicleNumber.toLowerCase() === data.vehicleNumber.toLowerCase()
        );
        if (matchingSession) {
          setSelectedSessionId(matchingSession.id);
        }
      }
    } catch (error) {
      console.error('Invalid QR data:', error);
    }
  };

  const handleRFIDScan = () => {
    // Simulate RFID scanning
    const simulatedRFIDData = 'MH12AB1234'; // This would come from RFID reader
    setSearchTerm(simulatedRFIDData);
    const matchingSession = activeSessions.find(s => 
      s.vehicleNumber === simulatedRFIDData
    );
    if (matchingSession) {
      setSelectedSessionId(matchingSession.id);
    }
  };

  const handleMFAVerification = () => {
    if (selectedSession) {
      setShowMFAVerification(true);
    }
  };

  const handleMFAComplete = (success: boolean, methods: string[]) => {
    setShowMFAVerification(false);
    if (success) {
      // Proceed with exit after successful MFA
      handleExit();
    }
  };

  const downloadInvoice = () => {
    if (!exitedSession) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Vehicle Authentication System', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Parking Invoice', 105, 35, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Vehicle Number: ${exitedSession.vehicleNumber}`, 20, 55);
    doc.text(`Slot Number: ${exitedSession.slotNumber}`, 20, 65);
    doc.text(`Entry: ${format(exitedSession.entryTime, 'PP p')}`, 20, 75);
    doc.text(`Exit: ${format(exitedSession.exitTime, 'PP p')}`, 20, 85);
    doc.text(`Duration: ${differenceInMinutes(exitedSession.exitTime, exitedSession.entryTime)} mins`, 20, 95);
    doc.setFontSize(14);
    doc.text(`Total Amount: Rs ${(exitedSession.totalAmount / 100).toFixed(2)}`, 20, 110);
    doc.save(`invoice-${exitedSession.vehicleNumber}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vehicle Exit</h1>
        <p className="text-muted-foreground mt-1">Process vehicle checkout with advanced authentication</p>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="manual" onClick={() => setAuthMethod('manual')}>
            Manual Search
          </TabsTrigger>
          <TabsTrigger value="plate" onClick={() => setAuthMethod('plate')}>
            <Camera className="w-4 h-4 mr-2" />
            Plate Scanner
          </TabsTrigger>
          <TabsTrigger value="qr" onClick={() => setAuthMethod('qr')}>
            <QrCode className="w-4 h-4 mr-2" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="rfid" onClick={() => setAuthMethod('rfid')}>
            <CreditCard className="w-4 h-4 mr-2" />
            RFID
          </TabsTrigger>
          <TabsTrigger value="mfa" onClick={() => setAuthMethod('mfa')}>
            <Shield className="w-4 h-4 mr-2" />
            MFA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
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
                <div className="space-y-6">
                  {exitedSession ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                          <h3 className="text-xl font-bold">Exit Processed Successfully</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Vehicle Number:</span>
                            <span className="font-medium">{exitedSession.vehicleNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slot:</span>
                            <span className="font-medium">{exitedSession.slotNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{differenceInMinutes(exitedSession.exitTime, exitedSession.entryTime)} mins</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-primary">
                            <span>Total Amount:</span>
                            <span>Rs {(exitedSession.totalAmount / 100).toFixed(2)}</span>
                          </div>
                        </div>
                        <Button onClick={downloadInvoice} className="w-full mt-4">
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
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
                            <span className="font-medium">{format(currentTime, 'PP p')}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-primary pt-2">
                            <span>Duration</span>
                            <span>{differenceInMinutes(currentTime, selectedSession.entryTime)} mins</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-primary">
                            <span>Est. Amount</span>
                            <span>Rs {(Math.ceil(differenceInMinutes(currentTime, selectedSession.entryTime) / 30) * 20).toFixed(2)}</span>
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
                  )}
                </div>
              ) : (
                <div className="h-64 rounded-xl border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                  <p>Select a vehicle from the list to process exit.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plate" className="space-y-6">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">License Plate Recognition</h3>
            <p className="text-muted-foreground mb-6">
              Use AI-powered OCR to automatically detect vehicle license plates
            </p>
            <Button size="lg" onClick={() => setShowPlateScanner(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Start Plate Scanner
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="qr" className="space-y-6">
          <div className="text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">QR Code Authentication</h3>
            <p className="text-muted-foreground mb-6">
              Scan QR codes for instant vehicle verification
            </p>
            <Button size="lg" onClick={() => setShowQRScanner(true)}>
              <QrCode className="w-4 h-4 mr-2" />
              Start QR Scanner
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="rfid" className="space-y-6">
          <div className="text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">RFID Card Authentication</h3>
            <p className="text-muted-foreground mb-6">
              Tap RFID card for quick vehicle identification
            </p>
            <Button size="lg" onClick={handleRFIDScan}>
              <CreditCard className="w-4 h-4 mr-2" />
              Simulate RFID Scan
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Multi-Factor Authentication</h3>
            <p className="text-muted-foreground mb-6">
              Use multiple verification methods for enhanced security
            </p>
            {selectedSession ? (
              <Button size="lg" onClick={handleMFAVerification}>
                <Shield className="w-4 h-4 mr-2" />
                Start MFA Verification
              </Button>
            ) : (
              <div className="text-muted-foreground">
                Please select a vehicle first to enable MFA verification
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Authentication History */}
      <div className="mt-8">
        <VehicleAuthenticationHistory limit={5} />
      </div>

      {/* Modals */}
      {showPlateScanner && (
        <LicensePlateScanner
          onPlateDetected={handlePlateDetected}
          onClose={() => setShowPlateScanner(false)}
        />
      )}

      {showQRScanner && (
        <QRCodeScanner
          onQRDetected={handleQRDetected}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {showMFAVerification && selectedSession && (
        <MFAVerification
          vehicleNumber={selectedSession.vehicleNumber}
          onVerificationComplete={handleMFAComplete}
          requiredMethods={2}
        />
      )}
    </Layout>
  );
}

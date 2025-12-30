import { useState, useRef } from 'react';
import { QrCode, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import QRCode from 'qrcode';

interface QRCodeScannerProps {
  onQRDetected: (data: string) => void;
  onClose: () => void;
  mode?: 'scan' | 'generate';
  vehicleData?: {
    vehicleNumber: string;
    ownerName: string;
    vehicleType: string;
  };
}

export default function QRCodeScanner({ onQRDetected, onClose, mode = 'scan', vehicleData }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const generateQRCode = async () => {
    if (!vehicleData) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create vehicle data payload
      const payload = {
        type: 'VEHICLE_AUTH',
        vehicleNumber: vehicleData.vehicleNumber,
        ownerName: vehicleData.ownerName,
        vehicleType: vehicleData.vehicleType,
        timestamp: new Date().toISOString(),
        checksum: btoa(`${vehicleData.vehicleNumber}-${Date.now()}`).slice(0, 8)
      };

      const qrDataString = JSON.stringify(payload);
      const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
      setQrData(qrDataString);
    } catch (err) {
      setError('Failed to generate QR code.');
      console.error('QR generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateQRScan = () => {
    setIsProcessing(true);
    setError('');

    // Simulate QR code scanning
    setTimeout(() => {
      const simulatedData = {
        type: 'VEHICLE_AUTH',
        vehicleNumber: 'MH12AB1234',
        ownerName: 'John Doe',
        vehicleType: 'Car',
        timestamp: new Date().toISOString(),
        checksum: 'ABC12345'
      };

      setQrData(JSON.stringify(simulatedData));
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirm = () => {
    if (qrData) {
      onQRDetected(qrData);
      stopCamera();
      onClose();
    }
  };

  const handleRetry = () => {
    setQrData('');
    setQrCodeUrl('');
    setError('');
  };

  if (mode === 'generate') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                Generate QR Code
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!qrCodeUrl && (
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-6">
                  Generate a QR code for vehicle authentication
                </p>
                <Button onClick={generateQRCode} disabled={isProcessing} size="lg">
                  {isProcessing ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </div>
            )}

            {qrCodeUrl && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="Vehicle QR Code" className="w-48 h-48" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="font-mono text-sm text-muted-foreground">
                      {vehicleData?.vehicleNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicleData?.ownerName}
                    </p>
                    <Badge variant="secondary">
                      {vehicleData?.vehicleType}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleConfirm} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Use This QR Code
                  </Button>
                  <Button variant="outline" onClick={handleRetry}>
                    Regenerate
                  </Button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating QR code...</span>
                </div>
                <Progress value={66} className="w-full" />
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              QR Code Scanner
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isScanning && !qrData && (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-6">
                Position the QR code in view and start scanning
              </p>
              <Button onClick={startCamera} size="lg">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />
                <div className="absolute inset-0 border-4 border-primary/30 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 border-2 border-primary rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={simulateQRScan} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Scanning...' : 'Scan QR Code'}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Scanning QR code...</span>
                  </div>
                  <Progress value={66} className="w-full" />
                </div>
              )}
            </div>
          )}

          {qrData && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-2">QR Code Detected</h3>
                <div className="space-y-2">
                  <div className="text-sm font-mono text-muted-foreground max-w-xs mx-auto truncate">
                    {qrData}
                  </div>
                  <Badge variant="default">
                    Vehicle Authentication Data
                  </Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleConfirm} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This Data
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  Scan Again
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LicensePlateScannerProps {
  onPlateDetected: (plateNumber: string) => void;
  onClose: () => void;
}

export default function LicensePlateScanner({ onPlateDetected, onClose }: LicensePlateScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
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
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    await processImage(imageData);
  }, []);

  const processImage = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    setError('');

    try {
      // Simulate OCR processing with Tesseract.js
      // In a real implementation, you would use Tesseract.js like this:
      /*
      const worker = await createWorker('eng');
      const { data: { text, confidence: conf } } = await worker.recognize(imageData);
      await worker.terminate();
      
      const plateNumber = extractLicensePlate(text);
      setDetectedPlate(plateNumber);
      setConfidence(conf);
      */

      // For demo purposes, simulate license plate detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate detected plate number
      const simulatedPlates = ['MH12AB1234', 'DL01CD5678', 'KA03EF9012', 'MH45GH3456'];
      const randomPlate = simulatedPlates[Math.floor(Math.random() * simulatedPlates.length)];
      
      setDetectedPlate(randomPlate);
      setConfidence(Math.floor(Math.random() * 20) + 80); // 80-99% confidence
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirm = () => {
    if (detectedPlate) {
      onPlateDetected(detectedPlate);
      stopCamera();
      onClose();
    }
  };

  const handleRetry = () => {
    setDetectedPlate('');
    setConfidence(0);
    setError('');
  };

  const extractLicensePlate = (text: string): string => {
    // Extract potential license plate patterns
    // Indian license plate format: XX00XX0000 or XX00XX0000X
    const platePattern = /\b[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}\b/g;
    const matches = text.match(platePattern);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }
    
    // Fallback: look for alphanumeric sequences that might be plates
    const alphanumericPattern = /\b[A-Z0-9]{6,10}\b/g;
    const alMatches = text.match(alphanumericPattern);
    
    return alMatches ? alMatches[0] : '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Scan className="w-6 h-6" />
              License Plate Scanner
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isScanning && !detectedPlate && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-6">
                Position the license plate in view and start scanning
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
                    <div className="w-48 h-16 border-2 border-primary rounded-lg" />
                  </div>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4">
                <Button 
                  onClick={captureImage} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Capture Plate'}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing image...</span>
                  </div>
                  <Progress value={66} className="w-full" />
                </div>
              )}
            </div>
          )}

          {detectedPlate && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-2">License Plate Detected</h3>
                <div className="space-y-2">
                  <div className="text-3xl font-mono font-bold text-primary">
                    {detectedPlate}
                  </div>
                  <Badge variant={confidence >= 90 ? 'default' : 'secondary'}>
                    {confidence}% Confidence
                  </Badge>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={handleConfirm} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Plate Number
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {error && !detectedPlate && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

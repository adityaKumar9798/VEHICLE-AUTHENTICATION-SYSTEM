import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Key, 
  Smartphone,
  Fingerprint,
  Camera,
  QrCode,
  CreditCard,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MFAVerificationProps {
  vehicleNumber: string;
  onVerificationComplete: (success: boolean, methods: string[]) => void;
  requiredMethods?: number;
}

interface VerificationMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  confidence?: number;
  data?: any;
}

export default function MFAVerification({ 
  vehicleNumber, 
  onVerificationComplete, 
  requiredMethods = 2 
}: MFAVerificationProps) {
  const [methods, setMethods] = useState<VerificationMethod[]>([
    {
      id: 'license_plate',
      name: 'License Plate Recognition',
      icon: <Camera className="w-5 h-5" />,
      description: 'AI-powered plate detection',
      status: 'pending'
    },
    {
      id: 'qr_code',
      name: 'QR Code Authentication',
      icon: <QrCode className="w-5 h-5" />,
      description: 'Scan vehicle QR code',
      status: 'pending'
    },
    {
      id: 'rfid',
      name: 'RFID Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Tap RFID card',
      status: 'pending'
    },
    {
      id: 'manual',
      name: 'Manual Verification',
      icon: <User className="w-5 h-5" />,
      description: 'Operator confirmation',
      status: 'pending'
    }
  ]);

  const [currentMethod, setCurrentMethod] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const completedCount = methods.filter(m => m.status === 'completed').length;
    const progress = (completedCount / requiredMethods) * 100;
    setOverallProgress(progress);

    if (completedCount >= requiredMethods && !isComplete) {
      setIsComplete(true);
      const completedMethods = methods
        .filter(m => m.status === 'completed')
        .map(m => m.name);
      setTimeout(() => {
        onVerificationComplete(true, completedMethods);
      }, 1500);
    }
  }, [methods, requiredMethods, isComplete, onVerificationComplete]);

  const simulateVerification = (methodId: string) => {
    setCurrentMethod(methodId);
    
    setMethods(prev => prev.map(m => 
      m.id === methodId 
        ? { ...m, status: 'in_progress' }
        : m
    ));

    // Simulate verification process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-99% confidence

      setMethods(prev => prev.map(m => 
        m.id === methodId 
          ? { 
              ...m, 
              status: success ? 'completed' : 'failed',
              confidence: success ? confidence : undefined,
              data: success ? {
                verifiedAt: new Date(),
                confidence,
                operator: 'System'
              } : undefined
            }
          : m
      ));

      setCurrentMethod(null);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">Verifying...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedMethods = methods.filter(m => m.status === 'completed');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Multi-Factor Vehicle Authentication
        </CardTitle>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Complete at least {requiredMethods} verification methods for vehicle: <span className="font-mono font-bold">{vehicleNumber}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <Progress value={overallProgress} className="flex-1" />
            <span className="text-sm font-medium">{completedMethods.length}/{requiredMethods}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isComplete && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Authentication Complete!</strong> Vehicle verified using {completedMethods.length} methods.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <Card 
              key={method.id}
              className={cn(
                "transition-all duration-200",
                method.status === 'completed' && "bg-green-50 border-green-200",
                method.status === 'failed' && "bg-red-50 border-red-200",
                method.status === 'in_progress' && "bg-blue-50 border-blue-200"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      method.status === 'completed' && "bg-green-100 text-green-600",
                      method.status === 'failed' && "bg-red-100 text-red-600",
                      method.status === 'in_progress' && "bg-blue-100 text-blue-600",
                      method.status === 'pending' && "bg-gray-100 text-gray-600"
                    )}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(method.status)}
                    {getStatusBadge(method.status)}
                  </div>
                </div>

                {method.confidence && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <Badge variant={method.confidence >= 90 ? 'default' : 'secondary'}>
                      {method.confidence}%
                    </Badge>
                  </div>
                )}

                {method.status === 'pending' && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => simulateVerification(method.id)}
                    disabled={currentMethod !== null}
                  >
                    {currentMethod === method.id ? 'Verifying...' : `Verify with ${method.name}`}
                  </Button>
                )}

                {method.status === 'failed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => simulateVerification(method.id)}
                    disabled={currentMethod !== null}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Retry Verification
                  </Button>
                )}

                {method.data && (
                  <div className="mt-3 p-2 bg-background rounded text-xs text-muted-foreground">
                    <div>Verified: {method.data.verifiedAt.toLocaleTimeString()}</div>
                    <div>Operator: {method.data.operator}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {completedMethods.length >= requiredMethods ? (
              <span className="text-green-600 font-medium">
                ✓ Authentication requirements met
              </span>
            ) : (
              <span>
                Need {requiredMethods - completedMethods.length} more verification{requiredMethods - completedMethods.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => onVerificationComplete(false, [])}
            disabled={isComplete}
          >
            Cancel Authentication
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

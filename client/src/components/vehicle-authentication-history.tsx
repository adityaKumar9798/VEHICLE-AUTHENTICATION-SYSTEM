import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  QrCode, 
  CreditCard,
  Shield,
  Activity,
  User,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface AuthenticationLog {
  id: string;
  timestamp: Date;
  vehicleNumber: string;
  method: 'license_plate' | 'qr_code' | 'rfid' | 'manual';
  status: 'success' | 'failed' | 'pending';
  location?: string;
  confidence?: number;
  operator?: string;
  details?: string;
}

interface VehicleAuthenticationHistoryProps {
  vehicleNumber?: string;
  limit?: number;
}

export default function VehicleAuthenticationHistory({ 
  vehicleNumber, 
  limit = 10 
}: VehicleAuthenticationHistoryProps) {
  const [logs, setLogs] = useState<AuthenticationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching authentication logs
    const fetchLogs = () => {
      setLoading(true);
      
      // Mock data for demonstration
      const mockLogs: AuthenticationLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          vehicleNumber: 'MH12AB1234',
          method: 'license_plate',
          status: 'success',
          location: 'Entry Gate 1',
          confidence: 95,
          operator: 'John Doe',
          details: 'Automatic plate recognition successful'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          vehicleNumber: 'MH12AB1234',
          method: 'qr_code',
          status: 'success',
          location: 'Exit Gate 2',
          operator: 'Jane Smith',
          details: 'QR code scanned and verified'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          vehicleNumber: 'MH12AB1234',
          method: 'rfid',
          status: 'failed',
          location: 'Entry Gate 1',
          operator: 'Mike Johnson',
          details: 'RFID card not recognized - fallback to manual'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          vehicleNumber: 'MH12AB1234',
          method: 'manual',
          status: 'success',
          location: 'Exit Gate 1',
          operator: 'Sarah Wilson',
          details: 'Manual verification by operator'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          vehicleNumber: 'MH12AB1234',
          method: 'license_plate',
          status: 'success',
          location: 'Entry Gate 2',
          confidence: 88,
          operator: 'Tom Brown',
          details: 'Plate recognition with medium confidence'
        }
      ];

      // Filter by vehicle number if provided
      const filteredLogs = vehicleNumber 
        ? mockLogs.filter(log => log.vehicleNumber === vehicleNumber)
        : mockLogs;

      // Limit results
      setLogs(filteredLogs.slice(0, limit));
      setLoading(false);
    };

    fetchLogs();
  }, [vehicleNumber, limit]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'license_plate':
        return <Camera className="w-4 h-4" />;
      case 'qr_code':
        return <QrCode className="w-4 h-4" />;
      case 'rfid':
        return <CreditCard className="w-4 h-4" />;
      case 'manual':
        return <User className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'license_plate':
        return 'License Plate';
      case 'qr_code':
        return 'QR Code';
      case 'rfid':
        return 'RFID Card';
      case 'manual':
        return 'Manual';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    if (confidence >= 90) {
      return <Badge variant="default" className="bg-green-100 text-green-800">{confidence}%</Badge>;
    } else if (confidence >= 70) {
      return <Badge variant="secondary">{confidence}%</Badge>;
    } else {
      return <Badge variant="destructive">{confidence}%</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Authentication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Authentication History
          {vehicleNumber && (
            <Badge variant="outline" className="ml-2">
              {vehicleNumber}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No authentication records found.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div className="flex items-center gap-2">
                        {getMethodIcon(log.method)}
                        <span className="font-medium">{getMethodLabel(log.method)}</span>
                      </div>
                      {getStatusBadge(log.status)}
                      {getConfidenceBadge(log.confidence)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(log.timestamp, 'PPp')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="font-mono font-medium">{log.vehicleNumber}</span>
                    </div>
                    {log.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{log.location}</span>
                      </div>
                    )}
                    {log.operator && (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{log.operator}</span>
                      </div>
                    )}
                  </div>

                  {log.details && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {log.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {logs.length} records</span>
            <Button variant="outline" size="sm">
              View All Logs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

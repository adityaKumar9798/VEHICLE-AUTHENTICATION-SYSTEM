import { useVehicles } from "@/hooks/use-vehicles";
import { useParkingSessions } from "@/hooks/use-parking";
import { StatsCard } from "@/components/stats-card";
import { Layout } from "@/components/layout";
import { Car, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: vehicles } = useVehicles();
  const { data: sessions } = useParkingSessions();

  const totalVehicles = vehicles?.length || 0;
  const activeSessions = sessions?.filter(s => s.status === 'PARKED') || [];
  const parkedCount = activeSessions.length;
  const totalSlots = 50; // Hardcoded capacity
  const availableSlots = totalSlots - parkedCount;
  const utilization = Math.round((parkedCount / totalSlots) * 100);

  // Recent activity
  const recentActivity = sessions
    ?.slice()
    .sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime())
    .slice(0, 5) || [];

  // Chart data (mock distribution by hour for today)
  const chartData = [
    { name: '8am', entries: 4, exits: 1 },
    { name: '10am', entries: 12, exits: 3 },
    { name: '12pm', entries: 8, exits: 8 },
    { name: '2pm', entries: 6, exits: 10 },
    { name: '4pm', entries: 15, exits: 5 },
    { name: '6pm', entries: 3, exits: 18 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of parking lot status and activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Capacity" 
            value={totalSlots} 
            icon={Car} 
            className="border-blue-500"
          />
          <StatsCard 
            title="Currently Parked" 
            value={parkedCount} 
            icon={Clock} 
            trend={`${utilization}% Full`}
            trendUp={utilization < 90}
            className="border-indigo-500"
          />
          <StatsCard 
            title="Available Slots" 
            value={availableSlots} 
            icon={CheckCircle2} 
            className="border-emerald-500"
          />
          <StatsCard 
            title="Registered Vehicles" 
            value={totalVehicles} 
            icon={AlertCircle} 
            className="border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Entry vs Exit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="entries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Entries" />
                    <Bar dataKey="exits" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Exits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((session) => (
                    <div key={session.id} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${session.status === 'PARKED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.vehicleNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.status === 'PARKED' ? 'Entered' : 'Exited'} at {format(session.status === 'PARKED' ? session.entryTime : session.exitTime!, 'h:mm a')}
                        </p>
                      </div>
                      <div className="text-xs font-mono font-medium bg-secondary px-2 py-1 rounded">
                        Slot {session.slotNumber}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

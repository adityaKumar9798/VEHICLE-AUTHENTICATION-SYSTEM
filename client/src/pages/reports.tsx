import { useState } from "react";
import { Layout } from "@/components/layout";
import { useParkingSessions } from "@/hooks/use-parking";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function ReportsPage() {
  const { data: sessions } = useParkingSessions();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const filteredSessions = sessions?.filter(s => {
    if (!date) return true;
    return new Date(s.entryTime).toDateString() === date.toDateString();
  }) || [];

  const handleExportCSV = () => {
    if (!filteredSessions.length) return;

    const headers = ["Vehicle Number", "Slot", "Entry Time", "Exit Time", "Status"];
    const rows = filteredSessions.map(s => [
      s.vehicleNumber,
      s.slotNumber,
      format(s.entryTime, 'yyyy-MM-dd HH:mm:ss'),
      s.exitTime ? format(s.exitTime, 'yyyy-MM-dd HH:mm:ss') : '-',
      s.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parking_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">View and export parking history</p>
        </div>
        <div className="flex gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleExportCSV} disabled={!filteredSessions.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Slot</th>
                <th className="px-6 py-4">Entry Time</th>
                <th className="px-6 py-4">Exit Time</th>
                <th className="px-6 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSessions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No records found</td></tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="bg-card hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === 'PARKED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{session.vehicleNumber}</td>
                    <td className="px-6 py-4">{session.slotNumber}</td>
                    <td className="px-6 py-4">{format(session.entryTime, 'PP p')}</td>
                    <td className="px-6 py-4">{session.exitTime ? format(session.exitTime, 'PP p') : '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                       {session.exitTime ? 
                          `${Math.round((session.exitTime.getTime() - session.entryTime.getTime()) / 60000)} mins` 
                          : 'Ongoing'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

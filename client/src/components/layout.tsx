import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Car, 
  LogIn, 
  LogOut, 
  FileText, 
  Menu,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { storageAuth } from "@/lib/storage";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Car, label: "Vehicles", href: "/vehicles" },
  { icon: LogIn, label: "Entry", href: "/entry" },
  { icon: LogOut, label: "Exit", href: "/exit" },
  { icon: FileText, label: "Reports", href: "/reports" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    storageAuth.logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <ShieldCheck className="w-8 h-8 text-primary mr-3" />
          <span className="font-bold text-xl tracking-tight">ParkGuard</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2 rotate-180" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center">
          <ShieldCheck className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">ParkGuard</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-20 px-4 pb-6 animate-in slide-in-from-top-10">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className="flex items-center gap-3 px-4 py-4 rounded-xl bg-card border mb-2 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
            <Button 
              variant="destructive" 
              className="w-full mt-8"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

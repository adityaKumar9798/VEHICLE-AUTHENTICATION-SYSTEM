import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { storageAuth } from "@/lib/storage";
import { useEffect } from "react";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import VehiclesPage from "@/pages/vehicles";
import EntryPage from "@/pages/entry";
import ExitPage from "@/pages/exit";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!storageAuth.isAuthenticated()) {
      setLocation("/login");
    }
  }, [location, setLocation]);

  if (!storageAuth.isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/vehicles">
        <ProtectedRoute component={VehiclesPage} />
      </Route>
      <Route path="/entry">
        <ProtectedRoute component={EntryPage} />
      </Route>
      <Route path="/exit">
        <ProtectedRoute component={ExitPage} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

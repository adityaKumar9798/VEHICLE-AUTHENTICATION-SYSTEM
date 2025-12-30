import { useState } from "react";
import { useLocation } from "wouter";
import { storageAuth } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await storageAuth.login();
      setLocation("/");
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary/5 -skew-y-6 transform origin-top-left z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl z-0" />

      <Card className="w-full max-w-md relative z-10 border-t-4 border-t-primary shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold">ParkGuard Admin</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                placeholder="admin" 
                className="h-11 bg-secondary/30" 
                defaultValue="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-11 bg-secondary/30" 
                defaultValue="password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 mt-2 text-base" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
            
            <div className="text-center text-xs text-muted-foreground mt-4">
              Demo Mode: Use any credentials to login
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

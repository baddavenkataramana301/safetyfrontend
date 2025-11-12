import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success("Login successful!");

      // Send notification to admin if employee logs in
      if (user.role === "employee") {
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        const newNotification = {
          id: Date.now(),
          type: "info",
          title: "New Employee Login",
          message: `${user.name} (${user.email}) has logged in and requires approval.`,
          time: new Date().toISOString(),
          read: false,
        };
        notifications.unshift(newNotification);
        localStorage.setItem("notifications", JSON.stringify(notifications));
      }


    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <ShieldAlert className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to SafetyMS
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>
              admin@company.com, manager@company.com, supervisor@company.com,
              employee@company.com
            </p>
            <p className="font-semibold mb-1">Demo password for all:</p>
            <p>1122</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

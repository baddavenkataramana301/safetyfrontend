import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Login successful!");
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          location: formData.location,
          password: formData.password,
        });
        toast.success("Registration successful!");
      }

      onClose();
      navigate("/dashboard");
    } catch (error) {
      toast.error(isLogin ? "Login failed" : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Toggle Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-accent rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              isLogin
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent-foreground/10"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              !isLogin
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent-foreground/10"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Job Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="supervisor">Team Leader</SelectItem>
                    <SelectItem value="safety_manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "employee" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Job Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </Button>

          {isLogin && (
            <div className="mt-4 p-3 bg-accent rounded-lg text-sm">
              <p className="font-medium mb-1">Demo Accounts:</p>
              <p>Admin: admin@safety.com</p>
              <p>Manager: manager@safety.com</p>
              <p>Supervisor: supervisor@safety.com</p>
              <p className="text-muted-foreground mt-1">Password: any</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

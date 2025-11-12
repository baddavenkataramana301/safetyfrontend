import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Hazards from "./pages/Hazards";
import Checklists from "./pages/Checklists";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import UserManagement from "./pages/UserManagement";
import Groups from "./pages/Groups";
import SystemSettings from "./pages/SystemSettings";
import SystemTheme from "./pages/SystemTheme";
import Training from "./pages/Training";
import Alerts from "./pages/Alerts";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={["safety_manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/supervisor-dashboard"
              element={
                <ProtectedRoute allowedRoles={["supervisor"]}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hazards"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "safety_manager",
                    "supervisor",
                    "employee",
                  ]}
                >
                  <Hazards />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checklists"
              element={
                <ProtectedRoute>
                  <Checklists />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings/theme"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SystemTheme />
                </ProtectedRoute>
              }
            />

            <Route
              path="/training"
              element={
                <ProtectedRoute>
                  <Training />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute
                  allowedRoles={["safety_manager", "supervisor", "employee"]}
                >
                  <Alerts />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

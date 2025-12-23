import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChecklistProvider } from "./contexts/ChecklistContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Hazards from "./pages/Hazards";
import Checklists from "./pages/Checklists";
import CreateList from "./pages/CreateList";
import ListSet from "./pages/ListSet";
import ChecklistPage from "./pages/ChecklistPage";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import Groups from "./pages/Groups";
import Departments from "./pages/Departments";
import SystemSettings from "./pages/SystemSettings";
import SystemTheme from "./pages/SystemTheme";
import Training from "./pages/Training";
import Alerts from "./pages/Alerts";
import Rewards from "./pages/Rewards";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <HashRouter
        basename="/"
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <ChecklistProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

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
                    <DashboardLayout>
                      <ChecklistPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-list"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CreateList />
                    </DashboardLayout>
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
                path="/list-set"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ListSet />
                    </DashboardLayout>
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
                path="/departments"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Departments />
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

              <Route
                path="/rewards"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "safety_manager", "employee"]}
                  >
                    <Rewards />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-assessment"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ChecklistProvider>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

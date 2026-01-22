import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
import { PERMISSIONS } from "@/hooks/use-permissions";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Entries from "./pages/Entries";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard"
                element={
                  <PermissionRoute permission={PERMISSIONS.DASHBOARD_SHOW}>
                    <Dashboard />
                  </PermissionRoute>
                }
              />
              <Route
                path="/entries"
                element={
                  <PermissionRoute permission={PERMISSIONS.AUDITIONS_INDEX}>
                    <Entries />
                  </PermissionRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <PermissionRoute permission={PERMISSIONS.TRANSACTIONS_INDEX}>
                    <Transactions />
                  </PermissionRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PermissionRoute permission={PERMISSIONS.USERS_INDEX}>
                    <Users />
                  </PermissionRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PermissionRoute permission={PERMISSIONS.SETTINGS_INDEX}>
                    <Settings />
                  </PermissionRoute>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

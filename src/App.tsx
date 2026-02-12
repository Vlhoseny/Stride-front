import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SettingsProvider } from "@/components/SettingsContext";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { NotificationProvider } from "@/components/NotificationSystem";
import { ProjectDataProvider } from "@/components/ProjectDataContext";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import AnalyticsPage from "./pages/Analytics";
import TeamPage from "./pages/Team";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <ProjectDataProvider>
                <SettingsProvider>
                  <Routes>
                    <Route path="/auth" element={<AuthRoute />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Index />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <ProfilePage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <AnalyticsPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/team"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <TeamPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SettingsProvider>
              </ProjectDataProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

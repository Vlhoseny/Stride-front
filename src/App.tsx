import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/components/SettingsContext";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { NotificationProvider } from "@/components/NotificationSystem";
import { ProjectDataProvider } from "@/components/ProjectDataContext";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { StealthProvider } from "@/components/StealthMode";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy-loaded pages & layout for smaller initial bundle
const DashboardLayout = lazy(() => import("@/components/DashboardLayout"));
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/Auth"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const TeamPage = lazy(() => import("./pages/Team"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <AuthPage />;
}

function LandingRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

const App = () => (
  <MotionConfig reducedMotion="user">
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <ProjectDataProvider>
                <SettingsProvider>
                  <CommandPaletteProvider>
                    <StealthProvider>
                      <ErrorBoundary>
                        <Suspense fallback={<SuspenseFallback />}>
                          <Routes>
                            <Route path="/" element={<LandingRoute />} />
                            <Route path="/auth" element={<AuthRoute />} />
                            <Route
                              path="/dashboard"
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
                        </Suspense>
                      </ErrorBoundary>
                    </StealthProvider>
                  </CommandPaletteProvider>
                </SettingsProvider>
              </ProjectDataProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </MotionConfig>
);

export default App;

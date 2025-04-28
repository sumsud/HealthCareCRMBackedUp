import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

import { queryClient } from "./lib/queryClient";
import { checkAuth } from "./store/slices/authSlice";
import { RootState } from "./store";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Patients from "./pages/patients";
import PatientDetail from "./pages/patients/[id]";
import Appointments from "./pages/appointments";
import Messages from "./pages/messages";
import Billing from "./pages/billing";
import Reports from "./pages/reports";
import AIAssistant from "./pages/ai-assistant";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import ProfileSettings from "./pages/settings/profile";
import SubscriptionSettings from "./pages/settings/subscription";
import NotFound from "./pages/not-found";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Landing} />
          
          {/* Auth routes */}
          <Route path="/auth/login">
            <AuthLayout>
              <Login />
            </AuthLayout>
          </Route>
          <Route path="/auth/register">
            <AuthLayout>
              <Register />
            </AuthLayout>
          </Route>
          <Route path="/auth/forgot-password">
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </Route>
          <Route path="/auth/reset-password">
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          </Route>
          
          {/* Protected routes */}
          {isAuthenticated ? (
            <Switch>
              <Route path="/dashboard">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </Route>
              <Route path="/patients">
                <MainLayout>
                  <Patients />
                </MainLayout>
              </Route>
              <Route path="/patients/:id">
                {(params) => (
                  <MainLayout>
                    <PatientDetail id={params.id} />
                  </MainLayout>
                )}
              </Route>
              <Route path="/appointments">
                <MainLayout>
                  <Appointments />
                </MainLayout>
              </Route>
              <Route path="/messages">
                <MainLayout>
                  <Messages />
                </MainLayout>
              </Route>
              <Route path="/billing">
                <MainLayout>
                  <Billing />
                </MainLayout>
              </Route>
              <Route path="/reports">
                <MainLayout>
                  <Reports />
                </MainLayout>
              </Route>
              <Route path="/ai-assistant">
                <MainLayout>
                  <AIAssistant />
                </MainLayout>
              </Route>
              <Route path="/settings/profile">
                <MainLayout>
                  <ProfileSettings />
                </MainLayout>
              </Route>
              <Route path="/settings/subscription">
                <MainLayout>
                  <SubscriptionSettings />
                </MainLayout>
              </Route>
              <Route>
                <MainLayout>
                  <NotFound />
                </MainLayout>
              </Route>
            </Switch>
          ) : (
            <Route>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </Route>
          )}
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Import pages
import Dashboard from "@/pages/dashboard";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import Personnel from "@/pages/personnel";
import CashFlow from "@/pages/cash-flow";
import Projections from "@/pages/projections";
import Scenarios from "@/pages/scenarios";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Payroll from "@/pages/payroll";
import AIAdvisor from "@/pages/ai-advisor";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

// Main layout component
import { Layout } from "@/components/layout";

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/revenue" component={Revenue} />
        <ProtectedRoute path="/expenses" component={Expenses} />
        <ProtectedRoute path="/personnel" component={Personnel} />
        <ProtectedRoute path="/cash-flow" component={CashFlow} />
        <ProtectedRoute path="/projections" component={Projections} />
        <ProtectedRoute path="/scenarios" component={Scenarios} />
        <ProtectedRoute path="/payroll" component={Payroll} />
        <ProtectedRoute path="/reports" component={Reports} />
        <ProtectedRoute path="/settings" component={Settings} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
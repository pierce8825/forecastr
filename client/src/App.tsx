import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinancialProvider } from "@/contexts/financial-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import Personnel from "@/pages/personnel";
import Projections from "@/pages/projections";
import Scenarios from "@/pages/scenarios";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/revenue" component={Revenue} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/personnel" component={Personnel} />
      <Route path="/projections" component={Projections} />
      <Route path="/scenarios" component={Scenarios} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/models" component={() => <Dashboard />} />
      <Route path="/integrations" component={() => <Settings />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinancialProvider>
          <Toaster />
          <Router />
        </FinancialProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

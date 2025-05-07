import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layouts/app-layout";
import Dashboard from "@/pages/dashboard";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import Personnel from "@/pages/personnel";
import CashFlow from "@/pages/cash-flow";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import QuickbooksCallback from "@/pages/settings/quickbooks-callback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/revenue" component={Revenue} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/personnel" component={Personnel} />
      <Route path="/cash-flow" component={CashFlow} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/quickbooks-callback" component={QuickbooksCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

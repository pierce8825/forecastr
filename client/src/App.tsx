import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

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
import NotFound from "@/pages/not-found";

// Main layout component
import { Layout } from "@/components/layout";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/revenue" component={Revenue} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/personnel" component={Personnel} />
          <Route path="/cash-flow" component={CashFlow} />
          <Route path="/projections" component={Projections} />
          <Route path="/scenarios" component={Scenarios} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
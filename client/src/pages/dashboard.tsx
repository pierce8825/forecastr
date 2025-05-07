import { useQuery } from "@tanstack/react-query";
import SummaryCard from "@/components/dashboard/summary-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RevenueDrivers from "@/components/dashboard/revenue-drivers";
import ExpenseManagement from "@/components/dashboard/expense-management";
import CashFlowProjection from "@/components/dashboard/cash-flow-projection";
import PersonnelPlanning from "@/components/dashboard/personnel-planning";
import QuickbooksWidget from "@/components/dashboard/quickbooks-widget";
import { Helmet } from "react-helmet";

const Dashboard = () => {
  // Demo user ID for MVP
  const userId = 1;
  
  // Fetch forecasts for the user
  const { data: forecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ["/api/forecasts", { userId }],
    queryFn: async () => {
      const res = await fetch(`/api/forecasts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  // Use the first forecast as the active one for now
  const activeForecast = forecasts?.[0];
  const forecastId = activeForecast?.id;

  // Financial summary data
  const { data: projections, isLoading: isLoadingProjections } = useQuery({
    queryKey: ["/api/financial-projections", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/financial-projections?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch financial projections");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Revenue streams data
  const { data: revenueStreams, isLoading: isLoadingRevenueStreams } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Calculate revenue totals
  const annualRevenue = revenueStreams?.reduce((sum: number, stream: any) => sum + Number(stream.amount), 0) || 0;
  
  const isLoading = isLoadingForecasts || isLoadingProjections || isLoadingRevenueStreams;

  return (
    <>
      <Helmet>
        <title>Financial Dashboard | FinanceForge</title>
        <meta name="description" content="View your key financial metrics, revenue forecasts, expenses, and cash flow projections in one comprehensive dashboard." />
      </Helmet>

      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Annual Revenue"
            value={annualRevenue}
            percentChange={12.5}
            progressValue={78}
            progressLabel="78% of annual target"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Monthly Expenses"
            value={125600}
            percentChange={4.3}
            progressValue={65}
            progressLabel="65% of monthly budget"
            isLoading={isLoading}
            valueColor="text-gray-900"
            progressColor="bg-destructive"
            changeDirection="up"
            changeColor="text-red-800"
            changeBgColor="bg-red-100"
          />
          <SummaryCard
            title="Cash Runway"
            value={16.5}
            valuePrefix=""
            valueSuffix=" months"
            percentChange={-1.2}
            percentLabel="months"
            progressValue={45}
            progressLabel="Based on current burn rate"
            isLoading={isLoading}
            progressColor="bg-primary"
            changeDirection="down"
            changeColor="text-blue-800"
            changeBgColor="bg-blue-100"
          />
          <SummaryCard
            title="Headcount"
            value={42}
            valuePrefix=""
            valueSuffix=""
            percentChange={3}
            percentPrefix="+"
            percentSuffix=""
            progressValue={84}
            progressLabel="84% of planned headcount"
            isLoading={isLoading}
            progressColor="bg-accent"
            changeDirection="up"
            changeColor="text-purple-800"
            changeBgColor="bg-purple-100"
          />
        </div>

        {/* Revenue Forecast Section */}
        <div className="mb-6">
          <RevenueChart 
            forecastId={forecastId} 
            revenueStreams={revenueStreams} 
            isLoading={isLoading} 
          />
        </div>

        {/* Revenue Drivers & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueDrivers forecastId={forecastId} isLoading={isLoading} />
          <ExpenseManagement forecastId={forecastId} isLoading={isLoading} />
        </div>

        {/* QuickBooks Integration & Cash Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CashFlowProjection forecastId={forecastId} projections={projections} isLoading={isLoading} />
          </div>
          <div>
            <QuickbooksWidget />
          </div>
        </div>
        
        {/* Personnel Planning */}
        <div className="grid grid-cols-1 gap-6">
          <PersonnelPlanning forecastId={forecastId} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
};

export default Dashboard;

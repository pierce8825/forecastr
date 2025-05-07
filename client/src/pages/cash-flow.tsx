import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from "recharts";
import { 
  Download, 
  Calendar, 
  ArrowRight, 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import { Helmet } from "react-helmet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CashFlow = () => {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [projectionPeriod, setProjectionPeriod] = useState("12");
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Get the active forecast
  const { data: forecasts } = useQuery({
    queryKey: ["/api/forecasts", { userId }],
    queryFn: async () => {
      const res = await fetch(`/api/forecasts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  const activeForecast = forecasts?.[0];
  const forecastId = activeForecast?.id;

  // Fetch financial projections
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

  // Fetch revenue streams
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

  // Fetch expenses
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["/api/expenses", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/expenses?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Process data for cash flow projections
  const baseProjections = projections || [];
  
  // Get some initial values from existing projections
  const lastProjection = baseProjections[baseProjections.length - 1];
  let lastCashBalance = lastProjection ? Number(lastProjection.cashBalance) : 1000000;
  let lastPeriod = lastProjection ? lastProjection.period : "01-2023";
  
  // Generate extended projections based on revenue streams and expenses
  const extendedProjectionCount = Number(projectionPeriod) - baseProjections.length;
  const extendedProjections = [];
  
  if (extendedProjectionCount > 0) {
    // Parse last period
    const [lastMonth, lastYear] = lastPeriod.split("-").map(Number);
    
    for (let i = 0; i < extendedProjectionCount; i++) {
      // Calculate next period
      let nextMonth = lastMonth + i + 1;
      let nextYear = lastYear;
      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }
      
      const period = `${nextMonth.toString().padStart(2, '0')}-${nextYear}`;
      
      // Calculate revenue based on streams
      let revenueTotal = 0;
      if (revenueStreams) {
        revenueStreams.forEach(stream => {
          const monthsSinceStart = (nextYear - 2023) * 12 + nextMonth - 1;
          const growthFactor = Math.pow(1 + Number(stream.growthRate || 0), monthsSinceStart / 12);
          
          let amount = 0;
          if (stream.frequency === 'monthly') {
            amount = Number(stream.amount) * growthFactor;
          } else if (stream.frequency === 'quarterly' && nextMonth % 3 === 1) {
            amount = Number(stream.amount) * growthFactor;
          } else if (stream.frequency === 'annual' && nextMonth === 1) {
            amount = Number(stream.amount) * growthFactor;
          }
          
          revenueTotal += amount;
        });
      }
      
      // Calculate expenses
      let expenseTotal = 0;
      if (expenses) {
        expenses.forEach(expense => {
          if (expense.frequency === 'monthly') {
            expenseTotal += Number(expense.amount);
          } else if (expense.frequency === 'quarterly' && nextMonth % 3 === 1) {
            expenseTotal += Number(expense.amount);
          } else if (expense.frequency === 'annual' && nextMonth === 1) {
            expenseTotal += Number(expense.amount);
          }
        });
      }
      
      // Calculate COGS (simplified as percentage of revenue)
      const cogsTotal = revenueTotal * 0.3; // Assume 30% COGS
      
      // Calculate personnel costs (simplified by extrapolating from last known value)
      const personnelTotal = baseProjections.length > 0 
        ? Number(baseProjections[baseProjections.length - 1].personnelTotal) 
        : 84250;
      
      const netProfit = revenueTotal - cogsTotal - expenseTotal - personnelTotal;
      const cashInflow = revenueTotal;
      const cashOutflow = cogsTotal + expenseTotal + personnelTotal;
      lastCashBalance += netProfit;
      
      extendedProjections.push({
        period,
        revenueTotal: revenueTotal.toString(),
        cogsTotal: cogsTotal.toString(),
        expenseTotal: expenseTotal.toString(),
        personnelTotal: personnelTotal.toString(),
        netProfit: netProfit.toString(),
        cashInflow: cashInflow.toString(),
        cashOutflow: cashOutflow.toString(),
        cashBalance: lastCashBalance.toString(),
      });
    }
  }

  // Combine base and extended projections
  const allProjections = [...baseProjections, ...extendedProjections];
  
  // Process for different time frames
  const processedProjections = allProjections.map(projection => {
    // Extract month and year from period (format: MM-YYYY)
    const [month, year] = projection.period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year}`,
      cashIn: Number(projection.cashInflow),
      cashOut: Number(projection.cashOutflow),
      balance: Number(projection.cashBalance),
      netChange: Number(projection.cashInflow) - Number(projection.cashOutflow),
      revenue: Number(projection.revenueTotal),
      expenses: Number(projection.expenseTotal) + Number(projection.personnelTotal),
      cogs: Number(projection.cogsTotal),
      profit: Number(projection.netProfit),
      month: parseInt(month),
      year: parseInt(year),
      date
    };
  });

  // Sort by date
  processedProjections.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filter based on timeframe
  let chartData = processedProjections;
  if (timeFrame === "quarterly") {
    const quarterlyData = [];
    const quarters = {};
    
    // Group by quarter
    processedProjections.forEach(item => {
      const quarter = Math.ceil(item.month / 3);
      const key = `Q${quarter}-${item.year}`;
      
      if (!quarters[key]) {
        quarters[key] = {
          name: key,
          cashIn: 0,
          cashOut: 0,
          balance: item.balance, // Use last month of quarter's balance
          netChange: 0,
          revenue: 0,
          expenses: 0,
          cogs: 0,
          profit: 0,
          quarter,
          year: item.year,
        };
      }
      
      quarters[key].cashIn += item.cashIn;
      quarters[key].cashOut += item.cashOut;
      quarters[key].netChange += item.netChange;
      quarters[key].revenue += item.revenue;
      quarters[key].expenses += item.expenses;
      quarters[key].cogs += item.cogs;
      quarters[key].profit += item.profit;
      quarters[key].balance = item.balance; // Update to last month's balance
    });
    
    // Convert to array and sort
    quarterlyData.push(...Object.values(quarters));
    quarterlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
    
    chartData = quarterlyData;
  } else if (timeFrame === "yearly") {
    const yearlyData = [];
    const years = {};
    
    // Group by year
    processedProjections.forEach(item => {
      const key = item.year.toString();
      
      if (!years[key]) {
        years[key] = {
          name: key,
          cashIn: 0,
          cashOut: 0,
          balance: item.balance, // Use December's balance
          netChange: 0,
          revenue: 0,
          expenses: 0,
          cogs: 0,
          profit: 0,
          year: item.year,
        };
      }
      
      years[key].cashIn += item.cashIn;
      years[key].cashOut += item.cashOut;
      years[key].netChange += item.netChange;
      years[key].revenue += item.revenue;
      years[key].expenses += item.expenses;
      years[key].cogs += item.cogs;
      years[key].profit += item.profit;
      
      // Update balance to December's value
      if (item.month === 12) {
        years[key].balance = item.balance;
      }
    });
    
    // Convert to array and sort
    yearlyData.push(...Object.values(years));
    yearlyData.sort((a, b) => a.year - b.year);
    
    chartData = yearlyData;
  }

  // Calculate burnrate and runway
  const lastThreeMonths = processedProjections.slice(-3);
  const averageBurn = lastThreeMonths.reduce((sum, month) => sum + month.netChange, 0) / lastThreeMonths.length;
  const lastBalance = processedProjections[processedProjections.length - 1]?.balance || 0;
  const runwayMonths = averageBurn >= 0 ? Infinity : Math.abs(lastBalance / averageBurn);
  
  // Format runway as a string
  let runwayText = "";
  if (runwayMonths === Infinity) {
    runwayText = "Infinite";
  } else {
    const years = Math.floor(runwayMonths / 12);
    const months = Math.round(runwayMonths % 12);
    
    if (years > 0) {
      runwayText = `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`;
    } else {
      runwayText = `${months} month${months !== 1 ? 's' : ''}`;
    }
  }

  const isLoading = isLoadingProjections || isLoadingRevenueStreams || isLoadingExpenses;

  return (
    <>
      <Helmet>
        <title>Cash Flow | FinanceForge</title>
        <meta name="description" content="Track and project your company's cash flow, analyze runway, and monitor burn rate to ensure financial sustainability." />
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cash Flow Projections</h1>
            <p className="text-muted-foreground">Track your cash position and runway</p>
          </div>
          <div className="flex gap-2">
            <Select
              value={projectionPeriod}
              onValueChange={setProjectionPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Projection Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cash Balance</CardTitle>
              <CardDescription>Current cash position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                ${Math.round(lastBalance).toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  As of {processedProjections[processedProjections.length - 1]?.name || 'now'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Burn Rate</CardTitle>
              <CardDescription>Average cash burn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-tabular ${averageBurn < 0 ? 'text-destructive' : 'text-success'}`}>
                {averageBurn < 0 ? '-' : '+'}${Math.abs(Math.round(averageBurn)).toLocaleString()}/mo
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  Based on last 3 months
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cash Runway</CardTitle>
              <CardDescription>Time until cash runs out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${averageBurn < 0 ? 'text-gray-900' : 'text-success'}`}>
                {runwayText}
              </div>
              <div className="flex items-center mt-1">
                <CreditCard className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">
                  {averageBurn < 0 ? 'At current burn rate' : 'Cash flow positive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cash Flow Projection</CardTitle>
                <CardDescription>
                  Projected cash inflows, outflows, and balance
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={timeFrame === "monthly" ? "default" : "outline"} 
                  onClick={() => setTimeFrame("monthly")}
                  size="sm"
                >
                  Monthly
                </Button>
                <Button 
                  variant={timeFrame === "quarterly" ? "default" : "outline"} 
                  onClick={() => setTimeFrame("quarterly")}
                  size="sm"
                >
                  Quarterly
                </Button>
                <Button 
                  variant={timeFrame === "yearly" ? "default" : "outline"} 
                  onClick={() => setTimeFrame("yearly")}
                  size="sm"
                >
                  Yearly
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading cash flow data...</p>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No cash flow data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        name="Cash Balance" 
                        fill="#e6f7ff" 
                        stroke="#3B82F6" 
                        yAxisId="right" 
                      />
                      <Bar 
                        dataKey="cashIn" 
                        name="Cash In" 
                        fill="#10B981" 
                        yAxisId="left" 
                      />
                      <Bar 
                        dataKey="cashOut" 
                        name="Cash Out" 
                        fill="#EF4444" 
                        yAxisId="left" 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              <Tabs defaultValue="cashflow" className="w-full">
                <TabsList>
                  <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                  <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
                </TabsList>
                <TabsContent value="cashflow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash In</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Out</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chartData.map((period, index) => (
                          <tr key={index} className={index >= baseProjections.length ? "bg-gray-50" : ""}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                              {period.name}
                              {index >= baseProjections.length && (
                                <span className="ml-2 text-xs text-gray-400">(Projected)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.cashIn.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.cashOut.toLocaleString()}
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                              period.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {period.netChange >= 0 ? '+' : ''}{period.netChange.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right font-tabular">
                              ${period.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="profit">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chartData.map((period, index) => (
                          <tr key={index} className={index >= baseProjections.length ? "bg-gray-50" : ""}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                              {period.name}
                              {index >= baseProjections.length && (
                                <span className="ml-2 text-xs text-gray-400">(Projected)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.revenue.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.cogs.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.expenses.toLocaleString()}
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                              period.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {period.profit >= 0 ? '+' : ''}{period.profit.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs. Expenses</CardTitle>
              <CardDescription>Monthly comparison over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading comparison data...</p>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No comparison data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue" 
                        fill="#d1e9ff" 
                        stroke="#3B82F6" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        fill="#ffe6e6" 
                        stroke="#EF4444" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Trends</CardTitle>
              <CardDescription>Net cash flow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading trend data...</p>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No trend data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="netChange" 
                        name="Net Cash Flow" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CashFlow;

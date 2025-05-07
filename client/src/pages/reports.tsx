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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Download, 
  Share2, 
  FileText,
  Calendar,
  Settings,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ClipboardList
} from "lucide-react";
import { Helmet } from "react-helmet";
import FormulaBuilder from "@/components/modals/formula-builder";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("financial");
  const [reportPeriod, setReportPeriod] = useState("12");
  const [isFormulaBuilderOpen, setIsFormulaBuilderOpen] = useState(false);
  
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

  // Fetch custom formulas
  const { data: formulas, isLoading: isLoadingFormulas } = useQuery({
    queryKey: ["/api/custom-formulas", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/custom-formulas?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch custom formulas");
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

  // Fetch personnel roles
  const { data: personnelRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["/api/personnel-roles", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/personnel-roles?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch personnel roles");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Process data for financial reports
  const financialData = projections?.map(projection => {
    // Extract month and year from period (format: MM-YYYY)
    const [month, year] = projection.period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year}`,
      revenue: Number(projection.revenueTotal),
      cogs: Number(projection.cogsTotal),
      grossProfit: Number(projection.revenueTotal) - Number(projection.cogsTotal),
      expenses: Number(projection.expenseTotal),
      personnel: Number(projection.personnelTotal),
      netProfit: Number(projection.netProfit),
      month: parseInt(month),
      year: parseInt(year),
      date
    };
  }) || [];

  // Sort by date
  financialData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Process data for revenue report
  const revenueByTypeData = [];
  if (revenueStreams) {
    const streamsByType = {};
    
    revenueStreams.forEach(stream => {
      if (!streamsByType[stream.type]) {
        streamsByType[stream.type] = {
          name: stream.type.charAt(0).toUpperCase() + stream.type.slice(1),
          value: 0
        };
      }
      
      streamsByType[stream.type].value += Number(stream.amount);
    });
    
    revenueByTypeData.push(...Object.values(streamsByType));
  }

  // Process data for expense report
  const expensesByCategoryData = [];
  if (expenses) {
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
      const category = expense.category || "Other";
      
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = {
          name: category,
          value: 0
        };
      }
      
      expensesByCategory[category].value += Number(expense.amount);
    });
    
    expensesByCategoryData.push(...Object.values(expensesByCategory));
  }

  // Process data for personnel report
  const personnelByDepartmentData = [];
  if (personnelRoles) {
    const departmentMap = {};
    
    personnelRoles.forEach(role => {
      if (!departmentMap[role.departmentId]) {
        // Fetch department name
        const department = "Department " + role.departmentId; // Simplified for demo
        
        departmentMap[role.departmentId] = {
          name: department,
          headcount: 0,
          cost: 0
        };
      }
      
      departmentMap[role.departmentId].headcount += role.count;
      departmentMap[role.departmentId].cost += Number(role.annualSalary) * role.count * (1 + Number(role.benefits || 0));
    });
    
    personnelByDepartmentData.push(...Object.values(departmentMap));
  }

  // Prepare data for KPI radar chart
  const kpiData = [
    {
      subject: 'Revenue',
      A: 120,
      B: 110,
      fullMark: 150,
    },
    {
      subject: 'Gross Margin',
      A: 98,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'Customer Acq.',
      A: 86,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'Retention',
      A: 99,
      B: 100,
      fullMark: 150,
    },
    {
      subject: 'Burn Rate',
      A: 85,
      B: 90,
      fullMark: 150,
    },
    {
      subject: 'Runway',
      A: 65,
      B: 85,
      fullMark: 150,
    },
  ];

  const isLoading = isLoadingProjections || isLoadingFormulas || 
                    isLoadingRevenueStreams || isLoadingExpenses || 
                    isLoadingRoles;

  return (
    <>
      <Helmet>
        <title>Financial Reports | FinanceForge</title>
        <meta name="description" content="Generate comprehensive financial reports, analyze key performance indicators, and create custom calculations for your business." />
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">Generate and analyze financial reports</p>
          </div>
          <div className="flex gap-2">
            <Select
              value={reportPeriod}
              onValueChange={setReportPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Report Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setIsFormulaBuilderOpen(true)}>
              <Settings className="mr-2 h-4 w-4" /> Formula Builder
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" /> Generate PDF
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial" className="flex items-center">
              <LineChartIcon className="mr-2 h-4 w-4" /> 
              Financial Performance
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center">
              <BarChartIcon className="mr-2 h-4 w-4" /> 
              Revenue Analysis
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" /> 
              Expense Analysis
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" /> 
              Key Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Revenue, expenses, and profit over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 mb-6">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading financial data...</p>
                      </div>
                    ) : financialData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No financial data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={financialData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="personnel" name="Personnel" stroke="#8B5CF6" strokeWidth={2} />
                          <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Average Revenue</div>
                        <div className="text-2xl font-bold">
                          ${financialData.length > 0
                              ? Math.round(financialData.reduce((sum, item) => sum + item.revenue, 0) / financialData.length).toLocaleString()
                              : "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Average Expenses</div>
                        <div className="text-2xl font-bold">
                          ${financialData.length > 0
                              ? Math.round(financialData.reduce((sum, item) => sum + item.expenses + item.personnel, 0) / financialData.length).toLocaleString()
                              : "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Gross Margin</div>
                        <div className="text-2xl font-bold">
                          {financialData.length > 0
                            ? `${Math.round(financialData.reduce((sum, item) => sum + item.grossProfit, 0) / 
                                financialData.reduce((sum, item) => sum + item.revenue, 0) * 100)}%`
                            : "0%"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Net Profit Margin</div>
                        <div className="text-2xl font-bold">
                          {financialData.length > 0
                            ? `${Math.round(financialData.reduce((sum, item) => sum + item.netProfit, 0) / 
                                financialData.reduce((sum, item) => sum + item.revenue, 0) * 100)}%`
                            : "0%"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>Monthly breakdown of your financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Profit</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialData.map((period, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                              {period.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.revenue.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.cogs.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.grossProfit.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.expenses.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                              ${period.personnel.toLocaleString()}
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                              period.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${period.netProfit.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Totals row */}
                        {financialData.length > 0 && (
                          <tr className="bg-gray-50 font-medium">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              Total
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-tabular">
                              ${financialData.reduce((sum, period) => sum + period.revenue, 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-tabular">
                              ${financialData.reduce((sum, period) => sum + period.cogs, 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-tabular">
                              ${financialData.reduce((sum, period) => sum + period.grossProfit, 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-tabular">
                              ${financialData.reduce((sum, period) => sum + period.expenses, 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-tabular">
                              ${financialData.reduce((sum, period) => sum + period.personnel, 0).toLocaleString()}
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                              financialData.reduce((sum, period) => sum + period.netProfit, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${financialData.reduce((sum, period) => sum + period.netProfit, 0).toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Type</CardTitle>
                  <CardDescription>Breakdown of revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading revenue data...</p>
                      </div>
                    ) : revenueByTypeData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No revenue data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {revenueByTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading revenue data...</p>
                      </div>
                    ) : financialData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No revenue data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={financialData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
                          <Bar dataKey="grossProfit" name="Gross Profit" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>Detailed breakdown of your revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center">Loading revenue streams...</td>
                          </tr>
                        ) : revenueStreams?.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center">No revenue streams found</td>
                          </tr>
                        ) : (
                          revenueStreams?.map((stream) => (
                            <tr key={stream.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{stream.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {stream.type.charAt(0).toUpperCase() + stream.type.slice(1)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{stream.category || "—"}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                                ${Number(stream.amount).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                                {stream.frequency.charAt(0).toUpperCase() + stream.frequency.slice(1)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                                {(Number(stream.growthRate) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                  <CardDescription>Breakdown of expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading expense data...</p>
                      </div>
                    ) : expensesByCategoryData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No expense data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expensesByCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {expensesByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Expense Trends</CardTitle>
                  <CardDescription>Monthly expense patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading expense data...</p>
                      </div>
                    ) : financialData.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No expense data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={financialData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="expenses" name="Operating Expenses" fill="#EF4444" />
                          <Bar dataKey="personnel" name="Personnel Costs" fill="#8B5CF6" />
                          <Bar dataKey="cogs" name="COGS" fill="#F59E0B" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Expense List</CardTitle>
                  <CardDescription>Detailed breakdown of your expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">COGS Related</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center">Loading expenses...</td>
                          </tr>
                        ) : expenses?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center">No expenses found</td>
                          </tr>
                        ) : (
                          expenses?.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{expense.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{expense.category || "Uncategorized"}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                                ${Number(expense.amount).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                                {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                                {expense.isCogsRelated ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Radar chart of main KPIs vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading KPI data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={kpiData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} />
                          <Radar
                            name="Current"
                            dataKey="A"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="Target"
                            dataKey="B"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.6}
                          />
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom Formula Calculations</CardTitle>
                  <CardDescription>Results from your custom formulas</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <p>Loading formula data...</p>
                    </div>
                  ) : formulas?.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">No custom formulas found</p>
                      <Button onClick={() => setIsFormulaBuilderOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" /> Create Formula
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formulas?.map((formula) => (
                        <div key={formula.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{formula.name}</h4>
                              <p className="text-sm text-gray-500">{formula.description || "No description"}</p>
                            </div>
                            <div className="text-sm bg-primary/10 text-primary rounded px-2 py-0.5">
                              {formula.category || "General"}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono">
                            {formula.formula}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-sm text-gray-500">Last calculated: Today</div>
                            <div className="text-lg font-bold text-gray-900">$1,234,567</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                  <CardDescription>Choose metrics to include in reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Financial Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-revenue" defaultChecked />
                          <Label htmlFor="metric-revenue">Revenue</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-gross-profit" defaultChecked />
                          <Label htmlFor="metric-gross-profit">Gross Profit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-expenses" defaultChecked />
                          <Label htmlFor="metric-expenses">Expenses</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-net-profit" defaultChecked />
                          <Label htmlFor="metric-net-profit">Net Profit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-cash-flow" defaultChecked />
                          <Label htmlFor="metric-cash-flow">Cash Flow</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Business Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-users" defaultChecked />
                          <Label htmlFor="metric-users">User Growth</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-conversion" defaultChecked />
                          <Label htmlFor="metric-conversion">Conversion Rate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-arpu" defaultChecked />
                          <Label htmlFor="metric-arpu">ARPU</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-cac" defaultChecked />
                          <Label htmlFor="metric-cac">CAC</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="metric-ltv" defaultChecked />
                          <Label htmlFor="metric-ltv">LTV</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Additional Options</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-charts" defaultChecked />
                          <Label htmlFor="option-charts">Include Charts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-tables" defaultChecked />
                          <Label htmlFor="option-tables">Include Tables</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-comparisons" defaultChecked />
                          <Label htmlFor="option-comparisons">YoY Comparisons</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-custom" defaultChecked />
                          <Label htmlFor="option-custom">Custom Formulas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-executive" defaultChecked />
                          <Label htmlFor="option-executive">Executive Summary</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button>
                      <FileText className="mr-2 h-4 w-4" /> Generate Custom Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Formula Builder Modal */}
      <FormulaBuilder
        forecastId={forecastId}
        open={isFormulaBuilderOpen}
        onOpenChange={setIsFormulaBuilderOpen}
      />
    </>
  );
};

export default Reports;

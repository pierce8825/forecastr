import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar
} from "recharts";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFinancialContext } from "@/contexts/financial-context";

const Projections: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("financials");

  // Fetch data
  const { data: projectionsData, isLoading: isLoadingProjections } = useQuery({
    queryKey: ['/api/workspaces/1/projections'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const financialProjections = [
    { month: "Jul 23", revenue: 78500, expenses: 58000, profit: 20500 },
    { month: "Aug 23", revenue: 83200, expenses: 58500, profit: 24700 },
    { month: "Sep 23", revenue: 88500, expenses: 59000, profit: 29500 },
    { month: "Oct 23", revenue: 94100, expenses: 59750, profit: 34350 },
    { month: "Nov 23", revenue: 100200, expenses: 60500, profit: 39700 },
    { month: "Dec 23", revenue: 106700, expenses: 61250, profit: 45450 },
    { month: "Jan 24", revenue: 113700, expenses: 62000, profit: 51700 },
    { month: "Feb 24", revenue: 121200, expenses: 63000, profit: 58200 },
    { month: "Mar 24", revenue: 129300, expenses: 64000, profit: 65300 },
    { month: "Apr 24", revenue: 138000, expenses: 65000, profit: 73000 },
    { month: "May 24", revenue: 147400, expenses: 66000, profit: 81400 },
    { month: "Jun 24", revenue: 157400, expenses: 67000, profit: 90400 }
  ];

  const cashFlowProjections = [
    { month: "Jul 23", cashBalance: 620000, cashFlow: 20500, cumulativeCashFlow: 20500 },
    { month: "Aug 23", cashBalance: 644700, cashFlow: 24700, cumulativeCashFlow: 45200 },
    { month: "Sep 23", cashBalance: 674200, cashFlow: 29500, cumulativeCashFlow: 74700 },
    { month: "Oct 23", cashBalance: 708550, cashFlow: 34350, cumulativeCashFlow: 109050 },
    { month: "Nov 23", cashBalance: 748250, cashFlow: 39700, cumulativeCashFlow: 148750 },
    { month: "Dec 23", cashBalance: 793700, cashFlow: 45450, cumulativeCashFlow: 194200 },
    { month: "Jan 24", cashBalance: 845400, cashFlow: 51700, cumulativeCashFlow: 245900 },
    { month: "Feb 24", cashBalance: 903600, cashFlow: 58200, cumulativeCashFlow: 304100 },
    { month: "Mar 24", cashBalance: 968900, cashFlow: 65300, cumulativeCashFlow: 369400 },
    { month: "Apr 24", cashBalance: 1041900, cashFlow: 73000, cumulativeCashFlow: 442400 },
    { month: "May 24", cashBalance: 1123300, cashFlow: 81400, cumulativeCashFlow: 523800 },
    { month: "Jun 24", cashBalance: 1213700, cashFlow: 90400, cumulativeCashFlow: 614200 }
  ];

  const metricProjections = [
    { 
      metric: "Revenue",
      current: 78500,
      threeMonth: 88500,
      sixMonth: 106700,
      twelveMonth: 157400,
      growth: "+100.5%"
    },
    { 
      metric: "Expenses",
      current: 58000,
      threeMonth: 59000,
      sixMonth: 61250,
      twelveMonth: 67000,
      growth: "+15.5%"
    },
    { 
      metric: "Profit",
      current: 20500,
      threeMonth: 29500,
      sixMonth: 45450,
      twelveMonth: 90400,
      growth: "+341.0%"
    },
    { 
      metric: "Cash Balance",
      current: 620000,
      threeMonth: 674200,
      sixMonth: 793700,
      twelveMonth: 1213700,
      growth: "+95.8%"
    },
    { 
      metric: "Runway (months)",
      current: 14.2,
      threeMonth: 16.5,
      sixMonth: 19.3,
      twelveMonth: 24.8,
      growth: "+74.6%"
    }
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeWorkspace={activeWorkspace}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-lighter">
          <ToolbarHeader 
            title="Financial Projections"
            onEdit={() => toast({ title: "Edit Projection Settings", description: "Opening projection settings" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="financials" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="financials" className="space-y-8">
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Income Projections</h3>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toast({ title: "Export Projections", description: "Exporting financial projections" })}
                        >
                          Export
                        </Button>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="chart-container" style={{ height: "400px" }}>
                      {isLoadingProjections ? (
                        <div className="h-full w-full bg-neutral-lighter rounded animate-pulse"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={projectionsData?.financials || financialProjections}
                            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar 
                              yAxisId="left" 
                              dataKey="revenue" 
                              name="Revenue" 
                              fill="#0078D4" 
                              barSize={20}
                            />
                            <Bar 
                              yAxisId="left" 
                              dataKey="expenses" 
                              name="Expenses" 
                              fill="#A19F9D" 
                              barSize={20}
                            />
                            <Line 
                              yAxisId="left" 
                              type="monotone" 
                              dataKey="profit" 
                              name="Profit" 
                              stroke="#107C10" 
                              strokeWidth={2}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <h3 className="font-medium text-neutral-darker mb-6">Projected Financials</h3>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Expenses</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead className="text-right">Profit Margin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(projectionsData?.financials || financialProjections).map((projection, index) => (
                            <TableRow key={index} className={index < 3 ? "" : "text-neutral-medium"}>
                              <TableCell>{projection.month}</TableCell>
                              <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(projection.expenses)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(projection.profit)}</TableCell>
                              <TableCell className="text-right">{((projection.profit / projection.revenue) * 100).toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => toast({ title: "Adjust Assumptions", description: "Opening financial assumptions editor" })}
                      >
                        Adjust Financial Assumptions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="cashflow" className="space-y-8">
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Cash Flow Projections</h3>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toast({ title: "Export Cash Flow", description: "Exporting cash flow projections" })}
                        >
                          Export
                        </Button>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="chart-container" style={{ height: "400px" }}>
                      {isLoadingProjections ? (
                        <div className="h-full w-full bg-neutral-lighter rounded animate-pulse"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={projectionsData?.cashFlow || cashFlowProjections}
                            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                          >
                            <defs>
                              <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#50E6FF" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#50E6FF" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" tickFormatter={(value) => `$${value/1000}k`} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar 
                              yAxisId="left" 
                              dataKey="cashFlow" 
                              name="Monthly Cash Flow" 
                              fill="#0078D4" 
                              barSize={20}
                            />
                            <Line 
                              yAxisId="right" 
                              type="monotone" 
                              dataKey="cashBalance" 
                              name="Cash Balance" 
                              stroke="#107C10" 
                              strokeWidth={2}
                            />
                            <Area 
                              yAxisId="left" 
                              type="monotone" 
                              dataKey="cumulativeCashFlow" 
                              name="Cumulative Cash Flow" 
                              stroke="#50E6FF" 
                              fill="url(#colorCashFlow)" 
                              fillOpacity={1}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <h3 className="font-medium text-neutral-darker mb-6">Cash Flow Details</h3>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Cash Flow</TableHead>
                            <TableHead className="text-right">Cumulative</TableHead>
                            <TableHead className="text-right">Cash Balance</TableHead>
                            <TableHead className="text-right">Runway</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(projectionsData?.cashFlow || cashFlowProjections).map((projection, index) => (
                            <TableRow key={index} className={index < 3 ? "" : "text-neutral-medium"}>
                              <TableCell>{projection.month}</TableCell>
                              <TableCell className="text-right">{formatCurrency(projection.cashFlow)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(projection.cumulativeCashFlow)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(projection.cashBalance)}</TableCell>
                              <TableCell className="text-right">
                                {Math.round(projection.cashBalance / Math.abs(projection.cashFlow < 0 ? projection.cashFlow : 58000))} months
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => toast({ title: "Adjust Cash Flow", description: "Opening cash flow assumptions editor" })}
                      >
                        Adjust Cash Flow Assumptions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-8">
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Key Metrics Projection</h3>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toast({ title: "Add Metric", description: "Adding new metric to projections" })}
                        >
                          Add Metric
                        </Button>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead className="text-right">Current</TableHead>
                            <TableHead className="text-right">3 Months</TableHead>
                            <TableHead className="text-right">6 Months</TableHead>
                            <TableHead className="text-right">12 Months</TableHead>
                            <TableHead className="text-right">12M Growth</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(projectionsData?.metrics || metricProjections).map((metric, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{metric.metric}</TableCell>
                              <TableCell className="text-right">
                                {metric.metric.includes("Runway") 
                                  ? `${metric.current.toFixed(1)} months`
                                  : formatCurrency(metric.current)}
                              </TableCell>
                              <TableCell className="text-right">
                                {metric.metric.includes("Runway") 
                                  ? `${metric.threeMonth.toFixed(1)} months`
                                  : formatCurrency(metric.threeMonth)}
                              </TableCell>
                              <TableCell className="text-right">
                                {metric.metric.includes("Runway") 
                                  ? `${metric.sixMonth.toFixed(1)} months`
                                  : formatCurrency(metric.sixMonth)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {metric.metric.includes("Runway") 
                                  ? `${metric.twelveMonth.toFixed(1)} months`
                                  : formatCurrency(metric.twelveMonth)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className="bg-success text-white bg-opacity-10">
                                  {metric.growth}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium text-neutral-darker">Customer Metrics</h3>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                      
                      <div className="chart-container" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { month: "Jul 23", customers: 250, cac: 124, ltv: 2780 },
                              { month: "Aug 23", customers: 270, cac: 122, ltv: 2800 },
                              { month: "Sep 23", customers: 295, cac: 120, ltv: 2820 },
                              { month: "Oct 23", customers: 325, cac: 118, ltv: 2840 },
                              { month: "Nov 23", customers: 360, cac: 115, ltv: 2860 },
                              { month: "Dec 23", customers: 400, cac: 112, ltv: 2880 },
                              { month: "Jan 24", customers: 445, cac: 110, ltv: 2900 },
                              { month: "Feb 24", customers: 495, cac: 108, ltv: 2920 },
                              { month: "Mar 24", customers: 550, cac: 105, ltv: 2940 },
                              { month: "Apr 24", customers: 610, cac: 103, ltv: 2960 },
                              { month: "May 24", customers: 675, cac: 100, ltv: 2980 },
                              { month: "Jun 24", customers: 745, cac: 98, ltv: 3000 }
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0078D4" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0078D4" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="customers" 
                              name="Active Customers" 
                              stroke="#0078D4" 
                              fill="url(#colorCustomers)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-neutral-lighter rounded-md">
                          <div className="text-sm text-neutral-dark mb-1">CAC (Current)</div>
                          <div className="text-lg font-medium text-neutral-darker">$124.50</div>
                        </div>
                        <div className="p-3 bg-neutral-lighter rounded-md">
                          <div className="text-sm text-neutral-dark mb-1">LTV (Current)</div>
                          <div className="text-lg font-medium text-neutral-darker">$2,780</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium text-neutral-darker">Revenue Mix Projection</h3>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                      
                      <div className="chart-container" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { month: "Jul 23", basic: 25200, premium: 18500, enterprise: 15000, services: 4800 },
                              { month: "Aug 23", basic: 27300, premium: 19200, enterprise: 15000, services: 3200 },
                              { month: "Sep 23", basic: 28900, premium: 21800, enterprise: 15000, services: 5300 },
                              { month: "Oct 23", basic: 30100, premium: 23400, enterprise: 15000, services: 3500 },
                              { month: "Nov 23", basic: 32500, premium: 25000, enterprise: 15000, services: 4200 },
                              { month: "Dec 23", basic: 35000, premium: 27000, enterprise: 20000, services: 3800 },
                              { month: "Jan 24", basic: 37000, premium: 29000, enterprise: 20000, services: 5500 },
                              { month: "Feb 24", basic: 39000, premium: 31000, enterprise: 20000, services: 4200 },
                              { month: "Mar 24", basic: 41000, premium: 33000, enterprise: 20000, services: 4900 },
                              { month: "Apr 24", basic: 43000, premium: 35000, enterprise: 25000, services: 5200 },
                              { month: "May 24", basic: 45000, premium: 37000, enterprise: 25000, services: 6100 },
                              { month: "Jun 24", basic: 47000, premium: 39000, enterprise: 25000, services: 5800 }
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="basic" 
                              name="Basic Subscription" 
                              stackId="1"
                              stroke="#0078D4" 
                              fill="#0078D4" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="premium" 
                              name="Premium Tier" 
                              stackId="1"
                              stroke="#2B88D8" 
                              fill="#2B88D8" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="enterprise" 
                              name="Enterprise Plans" 
                              stackId="1"
                              stroke="#50E6FF" 
                              fill="#50E6FF" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="services" 
                              name="One-time Services" 
                              stackId="1"
                              stroke="#EDEBE9" 
                              fill="#EDEBE9" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projections;

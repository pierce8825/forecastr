import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useFinancialContext } from "@/contexts/financial-context";

const Reports: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Fetch reports data
  const { data: reportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ['/api/workspaces/1/reports'],
    enabled: !!activeWorkspace
  });
  
  // Mock data for demonstration - in a real app, this would come from the API
  const revenueData = [
    { month: "Jan", value: 25200 },
    { month: "Feb", value: 27300 },
    { month: "Mar", value: 28900 },
    { month: "Apr", value: 30100 },
    { month: "May", value: 32500 },
    { month: "Jun", value: 35000 },
    { month: "Jul", value: 37000 },
    { month: "Aug", value: 39000 },
    { month: "Sep", value: 41000 },
    { month: "Oct", value: 43000 },
    { month: "Nov", value: 45000 },
    { month: "Dec", value: 47000 }
  ];
  
  const revenueByStream = [
    { name: "Basic Subscription", value: 144000 },
    { name: "Premium Tier", value: 107900 },
    { name: "Enterprise Plans", value: 85000 },
    { name: "One-time Services", value: 19700 }
  ];
  
  const expensesByCategory = [
    { name: "Personnel", value: 156000 },
    { name: "Marketing", value: 72300 },
    { name: "Software & Tools", value: 19600 },
    { name: "Office & Operations", value: 27000 }
  ];
  
  const metricsTable = [
    { metric: "Monthly Recurring Revenue (MRR)", value: "$78,500", change: "+12.4%", changeType: "positive" },
    { metric: "Annual Recurring Revenue (ARR)", value: "$942,000", change: "+12.4%", changeType: "positive" },
    { metric: "Customer Acquisition Cost (CAC)", value: "$124.50", change: "+8.2%", changeType: "negative" },
    { metric: "Lifetime Value (LTV)", value: "$2,780", change: "+5.3%", changeType: "positive" },
    { metric: "LTV:CAC Ratio", value: "22.3x", change: "-2.7%", changeType: "negative" },
    { metric: "Cash Runway", value: "14.2 months", change: "+2.3", changeType: "positive" },
    { metric: "Gross Margin", value: "68.5%", change: "+1.2%", changeType: "positive" },
    { metric: "Burn Rate", value: "$42,000", change: "+8.5%", changeType: "negative" }
  ];
  
  const cashFlowTable = [
    { month: "Jan 2023", revenue: 78500, expenses: 58000, cashFlow: 20500, balance: 620000 },
    { month: "Feb 2023", revenue: 83200, expenses: 58500, cashFlow: 24700, balance: 644700 },
    { month: "Mar 2023", revenue: 88500, expenses: 59000, cashFlow: 29500, balance: 674200 },
    { month: "Apr 2023", revenue: 94100, expenses: 59750, cashFlow: 34350, balance: 708550 },
    { month: "May 2023", revenue: 100200, expenses: 60500, cashFlow: 39700, balance: 748250 },
    { month: "Jun 2023", revenue: 106700, expenses: 61250, cashFlow: 45450, balance: 793700 }
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
            title="Financial Reports"
            onEdit={() => toast({ title: "Edit Reports", description: "Opening report settings" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-neutral-darker">Financial Reports</h2>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => toast({ title: "Generate Report", description: "Generating PDF report" })}
                >
                  <MaterialIcon name="assignment" className="mr-2" />
                  Generate PDF
                </Button>
                <Button 
                  onClick={() => toast({ title: "Export Data", description: "Exporting financial data" })}
                >
                  <MaterialIcon name="filter_list" className="mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Executive Summary */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <h3 className="font-medium text-neutral-darker mb-4">Executive Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-neutral-lighter p-4 rounded-md">
                      <h4 className="text-sm font-medium text-neutral-dark mb-2">Monthly Revenue</h4>
                      <div className="text-2xl font-semibold text-neutral-darker">$78,500</div>
                      <div className="text-sm text-success mt-1">+12.4% month-over-month</div>
                    </div>
                    <div className="bg-neutral-lighter p-4 rounded-md">
                      <h4 className="text-sm font-medium text-neutral-dark mb-2">Cash Balance</h4>
                      <div className="text-2xl font-semibold text-neutral-darker">$620,000</div>
                      <div className="text-sm text-success mt-1">+8.2% month-over-month</div>
                    </div>
                    <div className="bg-neutral-lighter p-4 rounded-md">
                      <h4 className="text-sm font-medium text-neutral-dark mb-2">Burn Rate</h4>
                      <div className="text-2xl font-semibold text-neutral-darker">$42,000</div>
                      <div className="text-sm text-error mt-1">+8.5% month-over-month</div>
                    </div>
                    <div className="bg-neutral-lighter p-4 rounded-md">
                      <h4 className="text-sm font-medium text-neutral-dark mb-2">Cash Runway</h4>
                      <div className="text-2xl font-semibold text-neutral-darker">14.2 Months</div>
                      <div className="text-sm text-success mt-1">+2.3 months</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Revenue Report */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-neutral-darker">Revenue Report</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toast({ title: "Export Revenue", description: "Exporting revenue data" })}
                    >
                      Export
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-dark mb-3">Revenue Trend</h4>
                      <div className="chart-container" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={reportsData?.revenueTrend || revenueData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              name="Revenue" 
                              stroke="#0078D4" 
                              strokeWidth={2} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-dark mb-3">Revenue by Stream</h4>
                      <div className="chart-container" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportsData?.revenueByStream || revenueByStream}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {(reportsData?.revenueByStream || revenueByStream).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={[
                                    "#0078D4", 
                                    "#2B88D8", 
                                    "#50E6FF", 
                                    "#EDEBE9"
                                  ][index % 4]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Expense Report */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-neutral-darker">Expense Report</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toast({ title: "Export Expenses", description: "Exporting expense data" })}
                    >
                      Export
                    </Button>
                  </div>
                  
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportsData?.expensesByCategory || expensesByCategory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(value) => `$${value/1000}k`} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar 
                          dataKey="value" 
                          name="Expense" 
                          fill="#A19F9D" 
                          radius={[0, 4, 4, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-neutral-dark mb-3">Expense Analysis</h4>
                    <div className="text-sm text-neutral-dark">
                      <p>
                        Personnel costs represent the largest expense category at 56.8% of total expenses,
                        followed by marketing costs at 26.3%. Software & tools and office operations account
                        for 7.1% and 9.8% respectively.
                      </p>
                      <p className="mt-2">
                        Monthly expenses are growing at an average rate of 5% month-over-month, driven
                        primarily by increases in personnel costs as the team expands.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Metrics */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <h3 className="font-medium text-neutral-darker mb-6">Key Financial Metrics</h3>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(reportsData?.metrics || metricsTable).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.metric}</TableCell>
                            <TableCell className="text-right">{row.value}</TableCell>
                            <TableCell className={`text-right ${
                              row.changeType === "positive" ? "text-success" : 
                              row.changeType === "negative" ? "text-error" : 
                              "text-neutral-dark"
                            }`}>
                              {row.change}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Cash Flow Statement */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-neutral-darker">Cash Flow Statement</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toast({ title: "Export Cash Flow", description: "Exporting cash flow data" })}
                    >
                      Export
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Expenses</TableHead>
                          <TableHead className="text-right">Net Cash Flow</TableHead>
                          <TableHead className="text-right">Ending Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(reportsData?.cashFlow || cashFlowTable).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.month}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.expenses)}</TableCell>
                            <TableCell className={`text-right ${row.cashFlow >= 0 ? "text-success" : "text-error"}`}>
                              {formatCurrency(row.cashFlow)}
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(row.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Notes */}
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                <CardContent className="p-0">
                  <h3 className="font-medium text-neutral-darker mb-4">Notes & Assumptions</h3>
                  
                  <div className="text-sm text-neutral-dark">
                    <p>
                      This report is based on the "Base Scenario" with the following key assumptions:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Monthly revenue growth rate of 10%</li>
                      <li>Customer churn rate of 3.5% monthly</li>
                      <li>Expense growth rate of 5% monthly</li>
                      <li>Headcount growth of 15% annually</li>
                      <li>Cash runway calculation assumes continuing burn rate at current levels</li>
                    </ul>
                    <p className="mt-4">
                      All projections are estimates and actual results may vary. The data in this
                      report should be used for planning purposes only and does not constitute
                      financial advice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;

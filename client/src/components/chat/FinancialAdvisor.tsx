import { useState, useEffect } from "react";
import { BrainCircuit, LineChart, ArrowRight, BadgeDollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "./ChatInterface";

interface FinancialAdvisorProps {
  forecastId: number;
  userId: number;
}

export default function FinancialAdvisor({ forecastId, userId }: FinancialAdvisorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");

  // Fetch forecast details
  const { data: forecast } = useQuery({
    queryKey: ["/api/forecasts", forecastId],
    queryFn: async () => {
      const res = await fetch(`/api/forecasts/${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
  });

  // Fetch financial data for context
  const { data: revenues = [] } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses", { forecastId }],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ["/api/personnel-roles", { forecastId }],
    queryFn: async () => {
      const res = await fetch(`/api/personnel-roles?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch personnel roles");
      return res.json();
    },
  });

  // Handle financial updates from Chad
  const handleFinancialUpdate = (changes: any) => {
    // Invalidate queries to refresh the financial data
    queryClient.invalidateQueries({ queryKey: ["/api/revenue-streams"] });
    queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    queryClient.invalidateQueries({ queryKey: ["/api/personnel-roles"] });
    queryClient.invalidateQueries({ queryKey: ["/api/financial-projections"] });
    
    // Notify the user of changes
    toast({
      title: "Financial data updated",
      description: `Chad has updated your financial data based on your conversation.`,
    });
  };

  // Calculate some basic financial metrics
  const totalRevenue = revenues.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const totalPersonnelCost = personnel.reduce(
    (sum: number, item: any) => sum + (Number(item.annualSalary) * Number(item.count)),
    0
  );
  const projectedProfit = totalRevenue - totalExpenses - totalPersonnelCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Financial Advisor - Chad
          </h1>
          <p className="text-muted-foreground">
            Get insights and recommendations from your AI financial assistant
          </p>
        </div>
        
        {forecast && (
          <Button variant="outline" className="sm:self-end">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Analyzing {forecast.name}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {revenues.length} revenue streams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {expenses.length} expense items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel Costs</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPersonnelCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {personnel.reduce((sum: number, item: any) => sum + Number(item.count), 0)} team members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Profit</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${projectedProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {projectedProfit >= 0 ? 'Profitable' : 'Loss'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat with Chad</TabsTrigger>
          <TabsTrigger value="insights">Financial Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          <div className="h-[600px]">
            <ChatInterface 
              forecastId={forecastId} 
              onFinancialUpdate={handleFinancialUpdate} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>
                AI-generated insights based on your financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Revenue Analysis</h3>
                {revenues.length > 0 ? (
                  <div className="space-y-4">
                    <p>
                      Your top revenue source is{" "}
                      <strong>
                        {
                          [...revenues].sort((a, b) => Number(b.amount) - Number(a.amount))[0]?.name
                        }
                      </strong>
                      , accounting for{" "}
                      {(
                        (Number(
                          [...revenues].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
                            ?.amount
                        ) /
                          totalRevenue) *
                        100
                      ).toFixed(1)}
                      % of total revenue.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Revenue Stability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {revenues.filter((r: any) => r.type === 'subscription').length > 0
                              ? `${(
                                  (revenues.filter((r: any) => r.type === 'subscription').reduce(
                                    (sum: number, item: any) => sum + Number(item.amount),
                                    0
                                  ) /
                                    totalRevenue) *
                                  100
                                ).toFixed(1)}% of your revenue comes from recurring subscriptions, providing stability.`
                              : 'You have no subscription-based revenue streams. Consider adding recurring revenue sources for greater stability.'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Revenue Diversification</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {revenues.length > 3
                              ? `Your revenue is well-diversified across ${revenues.length} different streams.`
                              : `With only ${revenues.length} revenue streams, your income could benefit from greater diversification.`}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No revenue streams have been added yet.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Expense Breakdown</h3>
                {expenses.length > 0 ? (
                  <div className="space-y-4">
                    <p>
                      Your largest expense category is{" "}
                      <strong>
                        {
                          Object.entries(
                            expenses.reduce((acc: any, expense: any) => {
                              const category = expense.category || 'Uncategorized';
                              if (!acc[category]) acc[category] = 0;
                              acc[category] += Number(expense.amount);
                              return acc;
                            }, {})
                          )
                            .sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
                        }
                      </strong>
                      , accounting for{" "}
                      {(
                        (Object.entries(
                          expenses.reduce((acc: any, expense: any) => {
                            const category = expense.category || 'Uncategorized';
                            if (!acc[category]) acc[category] = 0;
                            acc[category] += Number(expense.amount);
                            return acc;
                          }, {})
                        )
                          .sort((a: any, b: any) => b[1] - a[1])[0]?.[1] /
                          totalExpenses) *
                        100
                      ).toFixed(1)}
                      % of total expenses.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Expense Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {totalExpenses > 0 && totalRevenue > 0
                              ? `Your expense-to-revenue ratio is ${(
                                  (totalExpenses / totalRevenue) *
                                  100
                                ).toFixed(1)}%.`
                              : 'Add both revenue and expenses to see your expense efficiency ratio.'}
                            {totalExpenses > 0 &&
                              totalRevenue > 0 &&
                              totalExpenses / totalRevenue < 0.6 &&
                              ' This is a healthy ratio for sustainable growth.'}
                            {totalExpenses > 0 &&
                              totalRevenue > 0 &&
                              totalExpenses / totalRevenue >= 0.6 &&
                              totalExpenses / totalRevenue < 0.8 &&
                              ' This ratio is acceptable but could be improved.'}
                            {totalExpenses > 0 &&
                              totalRevenue > 0 &&
                              totalExpenses / totalRevenue >= 0.8 &&
                              ' This high ratio may indicate a need to reduce expenses or increase revenue.'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Fixed vs. Variable Costs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            Personnel costs make up{" "}
                            {totalPersonnelCost > 0 && totalExpenses > 0
                              ? `${(
                                  (totalPersonnelCost / (totalExpenses + totalPersonnelCost)) *
                                  100
                                ).toFixed(1)}% of your total operational expenses.`
                              : 'Add personnel and expenses to see your fixed vs. variable cost breakdown.'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No expenses have been added yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Recommendations</CardTitle>
              <CardDescription>
                Ask Chad for personalized recommendations or implement suggestions below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {projectedProfit < 0 ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Attention: Projected Loss</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Your current financial model shows a projected loss of ${Math.abs(projectedProfit).toLocaleString()}.
                    Chad can help you identify opportunities to increase revenue or reduce costs.
                  </p>
                  <Button 
                    onClick={() => {
                      setActiveTab("chat");
                      // You could pre-populate a message here if desired
                    }} 
                    variant="destructive"
                  >
                    Get Help from Chad <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setActiveTab("chat");
                      // Pre-populate message if desired
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Optimize Expenses</span>
                      <span className="text-xs text-muted-foreground">
                        Ask Chad to analyze your expenses and suggest cuts
                      </span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setActiveTab("chat");
                      // Pre-populate message if desired
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Identify Growth Opportunities</span>
                      <span className="text-xs text-muted-foreground">
                        Ask Chad to suggest new revenue streams
                      </span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setActiveTab("chat");
                      // Pre-populate message if desired
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Budget Planning</span>
                      <span className="text-xs text-muted-foreground">
                        Get help creating a balanced budget
                      </span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setActiveTab("chat");
                      // Pre-populate message if desired
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Cash Flow Projection</span>
                      <span className="text-xs text-muted-foreground">
                        Ask Chad to project your cash flow
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tailored Insights</h3>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <p className="text-sm mb-4">
                      Based on your current financial data, Chad recommends the following actions:
                    </p>
                    <ul className="space-y-2">
                      {revenues.length === 0 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Add your first revenue stream to start building your financial model</span>
                        </li>
                      )}
                      
                      {revenues.length > 0 && revenues.length < 3 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Diversify your revenue sources for increased stability</span>
                        </li>
                      )}
                      
                      {expenses.length === 0 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Track your business expenses to understand your cost structure</span>
                        </li>
                      )}
                      
                      {totalRevenue > 0 && totalExpenses > 0 && totalExpenses / totalRevenue > 0.7 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Your expense ratio is high at {((totalExpenses / totalRevenue) * 100).toFixed(1)}%. Consider cost-cutting measures</span>
                        </li>
                      )}
                      
                      {personnel.length > 0 && totalRevenue > 0 && (totalPersonnelCost / totalRevenue) > 0.5 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Personnel costs are {((totalPersonnelCost / totalRevenue) * 100).toFixed(1)}% of revenue, which is higher than ideal</span>
                        </li>
                      )}
                      
                      {totalRevenue > 0 && revenues.filter((r: any) => r.type === 'subscription').length === 0 && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Consider adding subscription-based revenue for more predictable income</span>
                        </li>
                      )}
                      
                      {/* Fallback if none of the above conditions are met */}
                      {!(
                        revenues.length === 0 ||
                        (revenues.length > 0 && revenues.length < 3) ||
                        expenses.length === 0 ||
                        (totalRevenue > 0 && totalExpenses > 0 && totalExpenses / totalRevenue > 0.7) ||
                        (personnel.length > 0 && totalRevenue > 0 && (totalPersonnelCost / totalRevenue) > 0.5) ||
                        (totalRevenue > 0 && revenues.filter((r: any) => r.type === 'subscription').length === 0)
                      ) && (
                        <li className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Your financial model looks balanced. Ask Chad for advanced optimization tips</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
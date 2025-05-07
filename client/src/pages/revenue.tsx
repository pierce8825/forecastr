import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevenueChart, RevenueChartData } from "@/components/dashboard/revenue-chart";
import { RevenueBreakdown, RevenueStreamData } from "@/components/dashboard/revenue-breakdown";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { Badge } from "@/components/ui/badge";
import { useFinancialContext } from "@/contexts/financial-context";

const Revenue: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['/api/workspaces/1/revenue-chart'],
    enabled: !!activeWorkspace
  });

  const { data: revenueStreamsData, isLoading: isLoadingStreams } = useQuery({
    queryKey: ['/api/workspaces/1/revenue-streams'],
    enabled: !!activeWorkspace
  });

  const { data: revenueBreakdownData, isLoading: isLoadingRevenueBreakdown } = useQuery({
    queryKey: ['/api/workspaces/1/revenue-breakdown'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const revenueChartData: RevenueChartData[] = [
    { month: "Jan", actual: 25200, projected: 28000 },
    { month: "Feb", actual: 27300, projected: 32000 },
    { month: "Mar", actual: 28900, projected: 36000 },
    { month: "Apr", actual: 30100, projected: 40000 },
    { month: "May", actual: 32500, projected: 44000 },
    { month: "Jun", actual: 0, projected: 48000 }
  ];

  const revenueStreams: RevenueStreamData[] = [
    {
      id: "basic-subscription",
      name: "Basic Subscription",
      months: {
        "May 2023": 25200,
        "Jun 2023": 27300,
        "Jul 2023": 28900,
        "Aug 2023": 30100,
        "Sep 2023": 32500
      },
      ytd: 144000
    },
    {
      id: "premium-tier",
      name: "Premium Tier",
      months: {
        "May 2023": 18500,
        "Jun 2023": 19200,
        "Jul 2023": 21800,
        "Aug 2023": 23400,
        "Sep 2023": 25000
      },
      ytd: 107900
    },
    {
      id: "enterprise-plans",
      name: "Enterprise Plans",
      months: {
        "May 2023": 15000,
        "Jun 2023": 15000,
        "Jul 2023": 15000,
        "Aug 2023": 20000,
        "Sep 2023": 20000
      },
      ytd: 85000
    },
    {
      id: "one-time-services",
      name: "One-time Services",
      months: {
        "May 2023": 4800,
        "Jun 2023": 3200,
        "Jul 2023": 5300,
        "Aug 2023": 2900,
        "Sep 2023": 3500
      },
      ytd: 19700
    }
  ];

  const months = ["May 2023", "Jun 2023", "Jul 2023", "Aug 2023", "Sep 2023"];
  const latestMonth = "Sep 2023";
  
  const totalRevenue = {
    months: {
      "May 2023": 63500,
      "Jun 2023": 64700,
      "Jul 2023": 71000,
      "Aug 2023": 76400,
      "Sep 2023": 81000
    },
    ytd: 356600
  };

  // Event handlers
  const handleAddRevenueStream = () => {
    toast({
      title: "Add Revenue Stream",
      description: "Opening revenue stream form"
    });
  };

  const handleEditDrivers = () => {
    toast({
      title: "Edit Revenue Drivers",
      description: "Opening revenue drivers editor"
    });
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
            title="Revenue Management"
            onEdit={() => toast({ title: "Edit Revenue Settings", description: "Opening revenue settings" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
                <TabsTrigger value="drivers">Revenue Drivers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <RevenueChart 
                  data={revenueData?.data || revenueChartData} 
                  isLoading={isLoadingRevenue}
                  onFilter={() => toast({ title: "Filter Revenue Chart" })}
                  onMoreOptions={() => toast({ title: "More Options", description: "Revenue chart options" })}
                />
                
                <RevenueBreakdown 
                  streams={revenueBreakdownData?.streams || revenueStreams}
                  months={months}
                  latestMonth={latestMonth}
                  total={totalRevenue}
                  isLoading={isLoadingRevenueBreakdown}
                  onEditDrivers={handleEditDrivers}
                  onMoreOptions={() => toast({ title: "More Options", description: "Revenue breakdown options" })}
                />

                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <h3 className="font-medium text-neutral-darker mb-6">Revenue Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Total Revenue YTD</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">${totalRevenue.ytd.toLocaleString()}</div>
                        <div className="text-sm text-success mt-1">+15.2% year-over-year</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Average Monthly Revenue</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">$71,320</div>
                        <div className="text-sm text-success mt-1">+7.5% vs. last quarter</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Revenue Growth Rate</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">12.4%</div>
                        <div className="text-sm text-success mt-1">+2.1% vs. target</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="streams" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Revenue Streams</h3>
                  <Button onClick={handleAddRevenueStream}>
                    <MaterialIcon name="add_circle" className="mr-2" />
                    Add Revenue Stream
                  </Button>
                </div>
                
                {isLoadingStreams ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-white rounded-lg shadow-sm border border-neutral-light"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueStreams.map((stream) => (
                      <Card key={stream.id} className="bg-white shadow-sm border border-neutral-light">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <h4 className="font-medium text-neutral-darker">{stream.name}</h4>
                                <Badge className="ml-2 bg-primary-light bg-opacity-20 text-primary">
                                  {stream.id === "basic-subscription" || stream.id === "premium-tier" || stream.id === "enterprise-plans" 
                                    ? "Subscription" 
                                    : "One-time"}
                                </Badge>
                              </div>
                              <p className="text-sm text-neutral-dark mb-4">
                                {stream.id === "basic-subscription" 
                                  ? "Monthly basic tier subscription at $49/month" 
                                  : stream.id === "premium-tier"
                                  ? "Monthly premium tier subscription at $99/month"
                                  : stream.id === "enterprise-plans"
                                  ? "Annual enterprise contracts starting at $15,000/year"
                                  : "Implementation and consulting services"}
                              </p>
                              <div className="flex space-x-6">
                                <div>
                                  <div className="text-xs text-neutral-dark">Current Month</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    ${stream.months[latestMonth].toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-dark">YTD</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    ${stream.ytd.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-dark">% of Total</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    {((stream.ytd / totalRevenue.ytd) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                              <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Stream", description: `Editing ${stream.name}` })}>
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toast({ title: "Manage Drivers", description: `Managing drivers for ${stream.name}` })}>
                                Drivers
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="drivers" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Revenue Drivers</h3>
                  <Button onClick={() => toast({ title: "Add Driver", description: "Opening new driver form" })}>
                    <MaterialIcon name="add_circle" className="mr-2" />
                    Add Driver
                  </Button>
                </div>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Basic Subscription Drivers</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Monthly New Customers
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="120" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Price Per Month ($)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="49" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Churn Rate (%)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="3.5" 
                          className="border-neutral-light"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => toast({ title: "Update Drivers", description: "Basic Subscription drivers updated" })}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Premium Tier Drivers</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Monthly New Customers
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="45" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Price Per Month ($)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="99" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Churn Rate (%)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="2.8" 
                          className="border-neutral-light"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => toast({ title: "Update Drivers", description: "Premium Tier drivers updated" })}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Revenue;

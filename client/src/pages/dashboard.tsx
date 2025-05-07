import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { KeyMetrics, Metric } from "@/components/dashboard/key-metrics";
import { RevenueChart, RevenueChartData } from "@/components/dashboard/revenue-chart";
import { CashFlowChart, CashFlowChartData } from "@/components/dashboard/cash-flow-chart";
import { RevenueBreakdown, RevenueStreamData } from "@/components/dashboard/revenue-breakdown";
import { ExpensesTable, ExpenseCategoryData } from "@/components/dashboard/expenses-table";
import { FormulaBuilder, FormulaVariable } from "@/components/dashboard/formula-builder";
import { QuickbooksIntegration, QuickbooksIntegrationData } from "@/components/dashboard/quickbooks-integration";
import { Scenarios, ScenarioData } from "@/components/dashboard/scenarios";
import { useFinancialContext } from "@/contexts/financial-context";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  const [formula, setFormula] = useState({
    name: "Customer Acquisition Cost",
    formula: "[Marketing.Total] / [Revenue.NewCustomers]",
    result: {
      value: "$124.50",
      change: {
        value: "+8.2%",
        type: "negative" as const
      },
      description: "Per new customer acquired",
      period: "September 2023"
    }
  });

  // Fetch data
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/workspaces/1/metrics'],
    enabled: !!activeWorkspace
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['/api/workspaces/1/revenue-chart'],
    enabled: !!activeWorkspace
  });

  const { data: cashFlowData, isLoading: isLoadingCashFlow } = useQuery({
    queryKey: ['/api/workspaces/1/cash-flow'],
    enabled: !!activeWorkspace
  });

  const { data: revenueBreakdownData, isLoading: isLoadingRevenueBreakdown } = useQuery({
    queryKey: ['/api/workspaces/1/revenue-breakdown'],
    enabled: !!activeWorkspace
  });

  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['/api/workspaces/1/expense-categories'],
    enabled: !!activeWorkspace
  });

  const { data: quickbooksData, isLoading: isLoadingQuickbooks } = useQuery({
    queryKey: ['/api/workspaces/1/quickbooks'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const keyMetrics: Metric[] = [
    {
      id: "cash-runway",
      title: "Cash Runway",
      value: "14.2 Months",
      change: {
        value: "+2.3",
        type: "positive"
      },
      description: "Based on current burn rate"
    },
    {
      id: "monthly-revenue",
      title: "Monthly Revenue",
      value: "$78,500",
      change: {
        value: "+12.4%",
        type: "positive"
      },
      description: "Month-over-month growth"
    },
    {
      id: "burn-rate",
      title: "Burn Rate",
      value: "$42,000",
      change: {
        value: "+8.5%",
        type: "negative"
      },
      description: "Monthly expenses"
    },
    {
      id: "cash-balance",
      title: "Cash Balance",
      value: "$620,000",
      change: {
        value: "+8.2%",
        type: "positive"
      },
      description: "Last updated today"
    }
  ];

  const revenueChartData: RevenueChartData[] = [
    { month: "Jan", actual: 25200, projected: 28000 },
    { month: "Feb", actual: 27300, projected: 32000 },
    { month: "Mar", actual: 28900, projected: 36000 },
    { month: "Apr", actual: 30100, projected: 40000 },
    { month: "May", actual: 32500, projected: 44000 },
    { month: "Jun", actual: 0, projected: 48000 }
  ];

  const cashFlowChartData: CashFlowChartData[] = [
    { month: "Jan", cashFlow: 10000 },
    { month: "Feb", cashFlow: 15000 },
    { month: "Mar", cashFlow: 20000 },
    { month: "Apr", cashFlow: 30000 },
    { month: "May", cashFlow: 25000 },
    { month: "Jun", cashFlow: 32000 }
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

  const expenseCategories: ExpenseCategoryData[] = [
    {
      id: "personnel",
      name: "Personnel",
      currentMonth: 32500,
      ytd: 156000,
      percentOfRevenue: 40.1
    },
    {
      id: "marketing",
      name: "Marketing",
      currentMonth: 15800,
      ytd: 72300,
      percentOfRevenue: 19.5
    },
    {
      id: "software",
      name: "Software & Tools",
      currentMonth: 4200,
      ytd: 19600,
      percentOfRevenue: 5.2
    },
    {
      id: "office",
      name: "Office & Operations",
      currentMonth: 5500,
      ytd: 27000,
      percentOfRevenue: 6.8
    }
  ];

  const availableVariables: FormulaVariable[] = [
    { id: "revenue-total", name: "Revenue.Total", description: "Total revenue across all streams" },
    { id: "revenue-new-customers", name: "Revenue.NewCustomers", description: "Number of new customers" },
    { id: "marketing-total", name: "Marketing.Total", description: "Total marketing expenses" },
    { id: "personnel-count", name: "Personnel.Count", description: "Total headcount" },
    { id: "expenses-total", name: "Expenses.Total", description: "Total expenses" }
  ];

  const quickbooksIntegration: QuickbooksIntegrationData = {
    isConnected: true,
    lastSynced: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    comparisonData: {
      revenue: {
        percentage: 3.2,
        isPositive: true
      },
      expenses: {
        percentage: 5.8,
        isPositive: true
      },
      netIncome: {
        percentage: -2.4,
        isPositive: false
      }
    },
    transactions: [
      {
        id: "tx1",
        description: "Adobe Creative Cloud",
        category: "Software Subscription",
        amount: 52.99,
        isIncome: false
      },
      {
        id: "tx2",
        description: "Customer Payment #10045",
        category: "Basic Plan",
        amount: 49.00,
        isIncome: true
      },
      {
        id: "tx3",
        description: "AWS Cloud Services",
        category: "Infrastructure",
        amount: 342.18,
        isIncome: false
      },
      {
        id: "tx4",
        description: "Enterprise Client #E-224",
        category: "Annual Plan",
        amount: 4800.00,
        isIncome: true
      }
    ]
  };

  const scenariosData: ScenarioData[] = [
    {
      id: "base",
      name: "Base Scenario",
      description: "Current plan",
      isActive: true,
      metrics: {
        mrrGrowth: {
          value: 10,
          label: "10% monthly",
          percentage: 60
        },
        burnRate: {
          value: 42000,
          label: "$42K monthly",
          percentage: 70
        },
        runway: {
          value: 14.2,
          label: "14.2 months",
          percentage: 80
        }
      }
    },
    {
      id: "optimistic",
      name: "Optimistic Growth",
      description: "Product-market fit",
      isActive: false,
      metrics: {
        mrrGrowth: {
          value: 18,
          label: "18% monthly",
          percentage: 85
        },
        burnRate: {
          value: 52000,
          label: "$52K monthly",
          percentage: 85
        },
        runway: {
          value: 11.9,
          label: "11.9 months",
          percentage: 65
        }
      }
    }
  ];

  // Event handlers
  const handleEditDrivers = () => {
    toast({
      title: "Edit Revenue Drivers",
      description: "Opening revenue drivers editor"
    });
  };

  const handleAddExpenseCategory = () => {
    toast({
      title: "Add Expense Category",
      description: "Opening expense category form"
    });
  };

  const handleEditExpenseCategory = (id: string) => {
    toast({
      title: "Edit Expense Category",
      description: `Opening editor for category ${id}`
    });
  };

  const handleSaveFormula = (formulaData: { name: string; formula: string }) => {
    toast({
      title: "Formula Saved",
      description: `Saved formula: ${formulaData.name}`
    });
  };

  const handleFormulaNameChange = (name: string) => {
    setFormula(prev => ({ ...prev, name }));
  };

  const handleFormulaChange = (formulaStr: string) => {
    setFormula(prev => ({ ...prev, formula: formulaStr }));
  };

  const handleVariableClick = (variable: FormulaVariable) => {
    setFormula(prev => ({
      ...prev,
      formula: prev.formula + ` [${variable.name}]`
    }));
  };

  const handleRefreshQuickbooksData = () => {
    toast({
      title: "Refreshing Data",
      description: "Syncing data from QuickBooks"
    });
  };

  const handleViewScenarioDetails = (id: string) => {
    toast({
      title: "View Scenario",
      description: `Opening details for scenario ${id}`
    });
  };

  const handleEditScenario = (id: string) => {
    toast({
      title: "Edit Scenario",
      description: `Opening editor for scenario ${id}`
    });
  };

  const handleCreateScenario = () => {
    toast({
      title: "Create Scenario",
      description: "Opening new scenario form"
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeWorkspace={activeWorkspace}
          lastSynced={quickbooksIntegration.lastSynced}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-lighter">
          <ToolbarHeader 
            title="Financial Overview"
            onEdit={() => toast({ title: "Edit Overview", description: "Opening overview editor" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <KeyMetrics 
              metrics={metricsData?.metrics || keyMetrics} 
              isLoading={isLoadingMetrics}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <RevenueChart 
                data={revenueData?.data || revenueChartData} 
                isLoading={isLoadingRevenue}
                onFilter={() => toast({ title: "Filter Revenue Chart" })}
                onMoreOptions={() => toast({ title: "More Options", description: "Revenue chart options" })}
              />
              
              <CashFlowChart 
                data={cashFlowData?.data || cashFlowChartData} 
                isLoading={isLoadingCashFlow}
                onFilter={() => toast({ title: "Filter Cash Flow Chart" })}
                onMoreOptions={() => toast({ title: "More Options", description: "Cash flow chart options" })}
              />
            </div>

            <RevenueBreakdown 
              streams={revenueBreakdownData?.streams || revenueStreams}
              months={months}
              latestMonth={latestMonth}
              total={totalRevenue}
              isLoading={isLoadingRevenueBreakdown}
              onEditDrivers={handleEditDrivers}
              onMoreOptions={() => toast({ title: "More Options", description: "Revenue breakdown options" })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
              <div className="lg:col-span-3">
                <ExpensesTable 
                  categories={expensesData?.categories || expenseCategories}
                  isLoading={isLoadingExpenses}
                  onAddCategory={handleAddExpenseCategory}
                  onEditCategory={handleEditExpenseCategory}
                  onMoreOptions={() => toast({ title: "More Options", description: "Expense category options" })}
                />
              </div>
              
              <div className="lg:col-span-2">
                <FormulaBuilder 
                  formula={formula}
                  availableVariables={availableVariables}
                  onSave={handleSaveFormula}
                  onNameChange={handleFormulaNameChange}
                  onFormulaChange={handleFormulaChange}
                  onVariableClick={handleVariableClick}
                  onMoreOptions={() => toast({ title: "More Options", description: "Formula builder options" })}
                />
              </div>
            </div>

            <QuickbooksIntegration 
              data={quickbooksData?.data || quickbooksIntegration}
              isLoading={isLoadingQuickbooks}
              onRefreshData={handleRefreshQuickbooksData}
              onSettings={() => toast({ title: "QuickBooks Settings" })}
              onViewDetailedReport={() => toast({ title: "View Detailed Report" })}
              onViewAllTransactions={() => toast({ title: "View All Transactions" })}
              onConnectService={(service) => toast({ title: `Connect ${service}`, description: `Opening integration for ${service}` })}
              onViewAllIntegrations={() => toast({ title: "View All Integrations" })}
            />

            <Scenarios 
              scenarios={scenariosData}
              onViewScenarioDetails={handleViewScenarioDetails}
              onEditScenario={handleEditScenario}
              onCreateScenario={handleCreateScenario}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

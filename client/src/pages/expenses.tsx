import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseCategories } from "@/components/dashboard/expense-categories";
import { ExpenseBudget } from "@/components/expenses/expense-budget";

const Expenses = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedForecastId, setSelectedForecastId] = useState<number | undefined>(1); // Default to first forecast

  return (
    <>
      <Helmet>
        <title>Expenses | FinanceForge</title>
        <meta name="description" content="Manage and track your business expenses" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">Track and analyze your business expenses</p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Expense Categories</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Expense Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ExpenseCategories forecastId={selectedForecastId} isLoading={false} />
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Expense Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">Expense visualization will be added here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <ExpenseCategories forecastId={selectedForecastId} isLoading={false} />
          </TabsContent>
          
          <TabsContent value="budgets">
            <ExpenseBudget forecastId={selectedForecastId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Expenses;
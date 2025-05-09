import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | FinanceForge</title>
        <meta name="description" content="Get a comprehensive overview of your financial metrics and KPIs" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Overview of your key financial metrics</p>
          </div>
          <Button asChild>
            <Link href="/forecasts/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Forecast
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No revenue data available yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No expense data available yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">$0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No cash flow data available yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">0%</div>
              <p className="text-xs text-muted-foreground mt-1">
                No profit data available yet
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-10 text-center">
          <div className="mx-auto max-w-md p-6 border border-dashed rounded-lg bg-muted/20">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to FinanceForge</h2>
            <p className="text-muted-foreground mb-6">
              Your account is ready, but you don't have any financial data yet. 
              Get started by creating your first forecast.
            </p>
            <Button asChild>
              <Link href="/forecasts/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Forecast
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
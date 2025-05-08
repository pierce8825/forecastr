import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | FinanceForge</title>
        <meta name="description" content="Get a comprehensive overview of your financial metrics and KPIs" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Overview of your key financial metrics</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue (YTD)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$542,897</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> 12.5%
                </span>
                vs last year
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$318,642</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-red-500 flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> 8.2%
                </span>
                vs last year
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$224,255</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> 5.3%
                </span>
                vs last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">41.3%</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> 2.1%
                </span>
                vs last quarter
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Revenue forecast chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Expense breakdown chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="py-3 px-4 flex justify-between items-center border-b">
                  <div>
                    <div className="font-medium">Software Subscription</div>
                    <div className="text-sm text-muted-foreground">April 12, 2023</div>
                  </div>
                  <div className="text-red-500 font-medium">-$2,499.00</div>
                </div>
                <div className="py-3 px-4 flex justify-between items-center border-b">
                  <div>
                    <div className="font-medium">Client Payment - ABC Corp</div>
                    <div className="text-sm text-muted-foreground">April 10, 2023</div>
                  </div>
                  <div className="text-green-500 font-medium">+$15,750.00</div>
                </div>
                <div className="py-3 px-4 flex justify-between items-center border-b">
                  <div>
                    <div className="font-medium">Office Rent</div>
                    <div className="text-sm text-muted-foreground">April 1, 2023</div>
                  </div>
                  <div className="text-red-500 font-medium">-$4,800.00</div>
                </div>
                <div className="py-3 px-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">Client Payment - XYZ Inc</div>
                    <div className="text-sm text-muted-foreground">March 29, 2023</div>
                  </div>
                  <div className="text-green-500 font-medium">+$8,320.00</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <a href="#" className="text-sm text-primary flex items-center">
                  View all transactions <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
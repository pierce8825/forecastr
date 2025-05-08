import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CashFlow = () => {
  return (
    <>
      <Helmet>
        <title>Cash Flow | FinanceForge</title>
        <meta name="description" content="Analyze and forecast your business cash flow" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cash Flow Analysis</h1>
          <p className="text-muted-foreground">Visualize and forecast your business cash flow</p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Cash flow analysis interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CashFlow;
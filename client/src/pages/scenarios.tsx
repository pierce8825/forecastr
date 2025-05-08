import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Scenarios = () => {
  return (
    <>
      <Helmet>
        <title>Scenarios | FinanceForge</title>
        <meta name="description" content="Create and compare different financial scenarios" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Financial Scenarios</h1>
          <p className="text-muted-foreground">Create and compare different financial scenarios for your business</p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenarios Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Financial scenarios interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Scenarios;
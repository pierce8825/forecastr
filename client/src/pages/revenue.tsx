import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Revenue = () => {
  return (
    <>
      <Helmet>
        <title>Revenue | FinanceForge</title>
        <meta name="description" content="Manage and forecast your revenue streams and drivers" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Revenue Management</h1>
          <p className="text-muted-foreground">Manage your revenue streams and drivers</p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Revenue management interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Revenue;
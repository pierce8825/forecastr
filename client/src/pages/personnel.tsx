import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Personnel = () => {
  return (
    <>
      <Helmet>
        <title>Personnel | FinanceForge</title>
        <meta name="description" content="Manage your company personnel and related expenses" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Personnel Management</h1>
          <p className="text-muted-foreground">Manage your team and associated costs</p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Personnel management interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Personnel;
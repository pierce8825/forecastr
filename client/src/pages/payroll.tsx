
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonnelRoles } from "@/components/dashboard/personnel-roles";
import { PaystubGenerator } from "@/components/dashboard/paystub-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Payroll = () => {
  return (
    <>
      <Helmet>
        <title>Payroll | FinanceForge</title>
        <meta name="description" content="Manage payroll and generate paystubs" />
      </Helmet>
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Generate paystubs and manage payroll</p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="paystubs">Paystubs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonnelRoles forecastId={1} isLoading={false} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="paystubs">
            <Card>
              <CardHeader>
                <CardTitle>Generate Paystubs</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonnelRoles forecastId={1} isLoading={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Payroll;

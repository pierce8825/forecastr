import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonnelRoles } from "@/components/dashboard/personnel-roles";
import { Departments } from "@/components/dashboard/departments";

const Personnel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedForecastId, setSelectedForecastId] = useState<number | undefined>(1); // Default to first forecast

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
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Personnel Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Departments forecastId={selectedForecastId} isLoading={false} />
                  <PersonnelRoles forecastId={selectedForecastId} isLoading={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments">
            <Departments forecastId={selectedForecastId} isLoading={false} />
          </TabsContent>
          
          <TabsContent value="roles">
            <PersonnelRoles forecastId={selectedForecastId} isLoading={false} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Personnel;
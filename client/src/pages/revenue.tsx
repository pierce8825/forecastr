import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueDrivers from "@/components/dashboard/revenue-drivers";
import { RevenueStreams } from "@/components/dashboard/revenue-streams";
import { DriverStreamMapping } from "@/components/dashboard/driver-stream-mapping";

const Revenue = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedForecastId, setSelectedForecastId] = useState<number | undefined>(1); // Default to first forecast

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
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="drivers">Revenue Drivers</TabsTrigger>
              <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <RevenueDrivers forecastId={selectedForecastId} isLoading={false} />
                  <RevenueStreams forecastId={selectedForecastId} isLoading={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="drivers">
            <RevenueDrivers forecastId={selectedForecastId} isLoading={false} />
          </TabsContent>
          
          <TabsContent value="streams">
            <RevenueStreams forecastId={selectedForecastId} isLoading={false} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Revenue;
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  BarChart2,
  BarChart as BarChartIcon,
  PieChart,
  Settings
} from "lucide-react";
import { Helmet } from "react-helmet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Revenue = () => {
  const [activeTab, setActiveTab] = useState("streams");
  const [isAddStreamDialogOpen, setIsAddStreamDialogOpen] = useState(false);
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Get the active forecast
  const { data: forecasts } = useQuery({
    queryKey: ["/api/forecasts", { userId }],
    queryFn: async () => {
      const res = await fetch(`/api/forecasts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  const activeForecast = forecasts?.[0];
  const forecastId = activeForecast?.id;

  // Fetch revenue streams
  const { data: revenueStreams, isLoading: isLoadingStreams } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Fetch revenue drivers
  const { data: revenueDrivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["/api/revenue-drivers", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-drivers?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue drivers");
      return res.json();
    },
    enabled: !!forecastId,
  });
  
  // Fetch driver-stream mappings
  const { data: driverStreamMappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ["/api/driver-stream-mappings", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/driver-stream-mappings?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch driver-stream mappings");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Mutations for revenue streams
  const addRevenueStreamMutation = useMutation({
    mutationFn: async (newStream) => {
      return await apiRequest("POST", "/api/revenue-streams", newStream);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-streams"] });
      setIsAddStreamDialogOpen(false);
      toast({
        title: "Revenue stream added",
        description: "New revenue stream has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add revenue stream: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutations for revenue drivers
  const addRevenueDriverMutation = useMutation({
    mutationFn: async (newDriver) => {
      return await apiRequest("POST", "/api/revenue-drivers", newDriver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-drivers"] });
      setIsAddDriverDialogOpen(false);
      toast({
        title: "Revenue driver added",
        description: "New revenue driver has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add revenue driver: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutations for driver-stream mappings
  const addDriverStreamMappingMutation = useMutation({
    mutationFn: async (newMapping) => {
      return await apiRequest("POST", "/api/driver-stream-mappings", newMapping);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-stream-mappings"] });
      setIsMappingDialogOpen(false);
      setSelectedDriverId(null);
      setSelectedStreamId(null);
      toast({
        title: "Mapping created",
        description: "Revenue driver has been connected to stream successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create mapping: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteDriverStreamMappingMutation = useMutation({
    mutationFn: async (id) => {
      return await apiRequest("DELETE", `/api/driver-stream-mappings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-stream-mappings"] });
      toast({
        title: "Mapping deleted",
        description: "Connection between driver and stream has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete mapping: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleAddRevenueStream = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addRevenueStreamMutation.mutate({
      forecastId,
      name: formData.get("name"),
      type: formData.get("type"),
      amount: formData.get("amount"),
      frequency: formData.get("frequency"),
      growthRate: formData.get("growthRate"),
      category: formData.get("category"),
    });
  };

  const handleAddRevenueDriver = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedStreamIds = formData.getAll("streams");
    
    // First, create the revenue driver
    const newDriver = await addRevenueDriverMutation.mutateAsync({
      forecastId,
      name: formData.get("name"),
      value: formData.get("value"),
      unit: formData.get("unit"),
      minValue: formData.get("minValue"),
      maxValue: formData.get("maxValue"),
      growthRate: formData.get("growthRate"),
      category: formData.get("category"),
    });
    
    // Then create mappings for all selected streams
    if (newDriver && selectedStreamIds.length > 0) {
      for (const streamId of selectedStreamIds) {
        await addDriverStreamMappingMutation.mutateAsync({
          driverId: newDriver.id,
          streamId: Number(streamId),
          formula: null,
          multiplier: "1"
        });
      }
    }
    
    setIsAddDriverDialogOpen(false);
  };
  
  const handleAddMapping = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addDriverStreamMappingMutation.mutate({
      driverId: selectedDriverId,
      streamId: selectedStreamId,
      formula: formData.get("formula"),
      multiplier: formData.get("multiplier"),
    });
  };

  // Chart data transformation
  const revenueChartData = revenueStreams?.map(stream => ({
    name: stream.name,
    value: Number(stream.amount),
    growthRate: Number(stream.growthRate) * 100,
  })) || [];

  const isLoading = isLoadingStreams || isLoadingDrivers || isLoadingMappings;

  return (
    <>
      <Helmet>
        <title>Revenue Management | FinanceForge</title>
        <meta name="description" content="Manage your revenue streams and drivers, forecast revenue growth, and analyze revenue patterns." />
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Revenue Management</h1>
            <p className="text-muted-foreground">Manage and forecast your revenue streams and drivers</p>
          </div>
          <div className="flex gap-2">
            {activeTab === "streams" ? (
              <Button onClick={() => setIsAddStreamDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Revenue Stream
              </Button>
            ) : (
              <Button onClick={() => setIsAddDriverDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Revenue Driver
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            <TabsTrigger value="drivers">Revenue Drivers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="streams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Visualization of your revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p>Loading revenue data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" name="Revenue Amount" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
                <CardDescription>Manage your different revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading revenue streams...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left">Name</th>
                          <th className="py-3 px-2 text-left">Type</th>
                          <th className="py-3 px-2 text-right">Amount</th>
                          <th className="py-3 px-2 text-right">Frequency</th>
                          <th className="py-3 px-2 text-right">Growth Rate</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueStreams?.map((stream) => (
                          <tr key={stream.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{stream.name}</td>
                            <td className="py-3 px-2">{stream.type}</td>
                            <td className="py-3 px-2 text-right">${Number(stream.amount).toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">{stream.frequency}</td>
                            <td className="py-3 px-2 text-right">
                              {Number(stream.growthRate) * 100}%
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Drivers Performance</CardTitle>
                <CardDescription>Track how your key revenue drivers are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p>Loading driver data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Jan', MAU: 42000, ConvRate: 5.5, ARPU: 84 },
                          { name: 'Feb', MAU: 42800, ConvRate: 5.6, ARPU: 85 },
                          { name: 'Mar', MAU: 43500, ConvRate: 5.7, ARPU: 86 },
                          { name: 'Apr', MAU: 44200, ConvRate: 5.7, ARPU: 87 },
                          { name: 'May', MAU: 45200, ConvRate: 5.8, ARPU: 89 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" domain={[30000, 50000]} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="MAU"
                          name="Monthly Active Users"
                          stroke="#3B82F6"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="ConvRate"
                          name="Conversion Rate (%)"
                          stroke="#10B981"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="ARPU"
                          name="ARPU ($)"
                          stroke="#8B5CF6"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Drivers</CardTitle>
                <CardDescription>Manage your revenue driving metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading revenue drivers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {revenueDrivers?.map((driver) => (
                      <Card key={driver.id} className="bg-gray-50 border">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700">{driver.name}</span>
                              <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {Number(driver.value).toLocaleString()} {driver.unit}
                              </span>
                              <span className="ml-2 text-xs font-medium text-green-600">
                                ↑ {Number(driver.growthRate) * 100}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="flex h-2 mb-2 overflow-hidden text-xs bg-gray-100 rounded-full">
                              <div 
                                className="flex flex-col justify-center text-center text-white bg-blue-500 shadow-none whitespace-nowrap h-2"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, (Number(driver.value) - Number(driver.minValue || 0)) / (Number(driver.maxValue || 100) - Number(driver.minValue || 0)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex text-xs justify-between font-medium">
                              <span>{driver.minValue || 0}</span>
                              <span>{Number(driver.minValue || 0) + (Number(driver.maxValue || 100) - Number(driver.minValue || 0)) / 2}</span>
                              <span>{driver.maxValue || 100}</span>
                            </div>
                          </div>
                          
                          {/* Linked Streams Display */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-700">Connected Streams</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedDriverId(driver.id);
                                  setIsMappingDialogOpen(true);
                                }}
                              >
                                Connect
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {driverStreamMappings
                                ?.filter(mapping => mapping.driver.id === driver.id)
                                .map(mapping => (
                                  <Badge key={mapping.id} variant="secondary" className="text-xs flex items-center gap-1">
                                    {mapping.stream.name}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-4 w-4 p-0 hover:bg-transparent"
                                      onClick={() => deleteDriverStreamMappingMutation.mutate(mapping.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                              {driverStreamMappings?.filter(mapping => mapping.driver.id === driver.id).length === 0 && (
                                <span className="text-xs text-gray-500">No connected streams</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Revenue Stream Dialog */}
      <Dialog open={isAddStreamDialogOpen} onOpenChange={setIsAddStreamDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Revenue Stream</DialogTitle>
            <DialogDescription>
              Add a new revenue stream to your forecast.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRevenueStream}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select name="type" defaultValue="subscription">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    $
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    className="rounded-l-none"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select name="frequency" defaultValue="annual">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="growthRate" className="text-right">
                  Growth Rate
                </Label>
                <div className="col-span-3 flex">
                  <Input
                    id="growthRate"
                    name="growthRate"
                    type="number"
                    step="0.001"
                    min="-0.5"
                    max="1"
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    %
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input id="category" name="category" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddStreamDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addRevenueStreamMutation.isPending}>
                {addRevenueStreamMutation.isPending ? "Adding..." : "Add Stream"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Revenue Driver Dialog */}
      <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Revenue Driver</DialogTitle>
            <DialogDescription>
              Add a new revenue driver metric to your forecast.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRevenueDriver}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Current Value
                </Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  className="col-span-3"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input id="unit" name="unit" className="col-span-3" placeholder="e.g., users, %" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minValue" className="text-right">
                  Min Value
                </Label>
                <Input
                  id="minValue"
                  name="minValue"
                  type="number"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxValue" className="text-right">
                  Max Value
                </Label>
                <Input
                  id="maxValue"
                  name="maxValue"
                  type="number"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="growthRate" className="text-right">
                  Growth Rate
                </Label>
                <div className="col-span-3 flex">
                  <Input
                    id="growthRate"
                    name="growthRate"
                    type="number"
                    step="0.001"
                    min="-0.5"
                    max="1"
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    %
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select name="category" defaultValue="usage">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="monetization">Monetization</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Revenue Stream Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="streams" className="text-right">
                  Revenue Streams
                </Label>
                <div className="col-span-3">
                  <div className="border rounded-md p-3">
                    <div className="text-sm mb-2 text-muted-foreground">
                      Select revenue streams to connect to this driver:
                    </div>
                    {isLoadingStreams ? (
                      <div className="text-sm text-center py-2">Loading streams...</div>
                    ) : revenueStreams && revenueStreams.length > 0 ? (
                      <div className="space-y-2">
                        {revenueStreams.map(stream => (
                          <div key={stream.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`stream-${stream.id}`}
                              name="streams" 
                              value={stream.id} 
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`stream-${stream.id}`} className="text-sm font-medium text-gray-700">
                              {stream.name} - ${Number(stream.amount).toLocaleString()} ({stream.type})
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-center py-2">No revenue streams available. Create streams first.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addRevenueDriverMutation.isPending || addDriverStreamMappingMutation.isPending}
              >
                {addRevenueDriverMutation.isPending || addDriverStreamMappingMutation.isPending ? "Processing..." : "Add Driver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Connect Driver to Stream Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Revenue Driver to Stream</DialogTitle>
            <DialogDescription>
              Link a revenue driver to a revenue stream to create a relationship.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMapping}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driver" className="text-right">
                  Driver
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedDriverId} 
                    onValueChange={(value) => setSelectedDriverId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueDrivers?.map(driver => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stream" className="text-right">
                  Stream
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedStreamId} 
                    onValueChange={(value) => setSelectedStreamId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueStreams?.map(stream => (
                        <SelectItem key={stream.id} value={stream.id.toString()}>
                          {stream.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="formula" className="text-right">
                  Formula
                </Label>
                <Input 
                  id="formula" 
                  name="formula" 
                  className="col-span-3" 
                  placeholder="e.g., value * 0.1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="multiplier" className="text-right">
                  Multiplier
                </Label>
                <Input 
                  id="multiplier" 
                  name="multiplier" 
                  type="number"
                  step="0.01"
                  className="col-span-3" 
                  placeholder="e.g., 0.1" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMappingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addDriverStreamMappingMutation.isPending || !selectedDriverId || !selectedStreamId}
              >
                {addDriverStreamMappingMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Revenue;

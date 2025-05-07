import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PencilIcon, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface RevenueDriversProps {
  forecastId?: number;
  isLoading: boolean;
}

const RevenueDrivers = ({ forecastId, isLoading }: RevenueDriversProps) => {
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Mutation to add a new revenue driver
  const addDriverMutation = useMutation({
    mutationFn: async (driverData) => {
      return await apiRequest("POST", "/api/revenue-drivers", driverData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-drivers"] });
      setIsAddDriverDialogOpen(false);
      toast({
        title: "Success",
        description: "Revenue driver added successfully",
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

  // Handle form submission
  const handleAddDriver = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const driverData = {
      forecastId,
      name: formData.get("name"),
      value: formData.get("value"),
      unit: formData.get("unit"),
      minValue: formData.get("minValue"),
      maxValue: formData.get("maxValue"),
      growthRate: (Number(formData.get("growthRate")) / 100).toString(),
      category: formData.get("category"),
    };

    addDriverMutation.mutate(driverData);
  };

  if (isLoading || isLoadingDrivers) {
    return (
      <Card>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="space-y-5">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">Revenue Drivers</h3>
          <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setIsAddDriverDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Driver
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        {revenueDrivers?.length > 0 ? (
          <div className="space-y-5">
            {revenueDrivers.map((driver) => (
              <div key={driver.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{driver.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                      <PencilIcon className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-tabular font-medium text-gray-900">
                      {Number(driver.value).toLocaleString()} {driver.unit}
                    </span>
                    <span className="ml-2 text-xs font-medium text-green-600">
                      ↑ {(Number(driver.growthRate) * 100).toFixed(1)}%
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
                    <span>{Math.round((Number(driver.minValue || 0) + Number(driver.maxValue || 100)) / 2)}</span>
                    <span>{driver.maxValue || 100}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No revenue drivers found</p>
            <Button onClick={() => setIsAddDriverDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Driver
            </Button>
          </div>
        )}
        
        {revenueDrivers?.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-6 border border-dashed border-gray-300 rounded-lg p-3 w-full text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setIsAddDriverDialogOpen(true)}
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add custom driver</span>
            </div>
          </Button>
        )}
      </CardContent>

      {/* Add Revenue Driver Dialog */}
      <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Revenue Driver</DialogTitle>
            <DialogDescription>
              Add a new revenue driver to track key metrics that influence your revenue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDriver}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Monthly Active Users" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">Current Value</Label>
                  <Input 
                    id="value" 
                    name="value" 
                    type="number" 
                    placeholder="45000" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input 
                    id="unit" 
                    name="unit" 
                    placeholder="users" 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minValue">Min Value</Label>
                  <Input 
                    id="minValue" 
                    name="minValue" 
                    type="number" 
                    placeholder="0" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxValue">Max Value</Label>
                  <Input 
                    id="maxValue" 
                    name="maxValue" 
                    type="number" 
                    placeholder="100000" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="growthRate">Growth Rate (%)</Label>
                  <Input 
                    id="growthRate" 
                    name="growthRate" 
                    type="number" 
                    step="0.1" 
                    placeholder="2.4" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    placeholder="usage" 
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addDriverMutation.isPending}>
                {addDriverMutation.isPending ? "Adding..." : "Add Driver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RevenueDrivers;

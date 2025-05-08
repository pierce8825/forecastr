import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PencilIcon, Plus, Repeat } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface RevenueStreamsProps {
  forecastId?: number;
  isLoading: boolean;
}

export function RevenueStreams({ forecastId, isLoading }: RevenueStreamsProps) {
  const [isAddStreamDialogOpen, setIsAddStreamDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Mutation to add a new revenue stream
  const addStreamMutation = useMutation({
    mutationFn: async (streamData: any) => {
      return await apiRequest("POST", "/api/revenue-streams", streamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-streams"] });
      setIsAddStreamDialogOpen(false);
      toast({
        title: "Success",
        description: "Revenue stream added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add revenue stream: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddStream = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const streamData = {
      forecastId,
      name: formData.get("name"),
      type: formData.get("type"),
      frequency: formData.get("frequency"),
      amount: formData.get("amount"),
      formula: formData.get("formula") || null,
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
    };

    addStreamMutation.mutate(streamData);
  };

  // Helper function to format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format frequency
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case "monthly": return "Monthly";
      case "quarterly": return "Quarterly";
      case "annually": return "Annual";
      case "one-time": return "One-time";
      default: return frequency;
    }
  };

  if (isLoading || isLoadingStreams) {
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
          <h3 className="text-base font-medium text-gray-800">Revenue Streams</h3>
          <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setIsAddStreamDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Stream
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        {revenueStreams?.length > 0 ? (
          <div className="space-y-5">
            {revenueStreams.map((stream) => (
              <div key={stream.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{stream.name}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                        <PencilIcon className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {stream.type}
                      </Badge>
                      {stream.frequency !== "one-time" && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Repeat className="h-3 w-3 mr-1" />
                          {formatFrequency(stream.frequency)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-tabular font-medium text-gray-900">
                      {formatAmount(stream.amount)}
                    </div>
                    {stream.formula && (
                      <div className="text-xs text-gray-500 mt-1">
                        Formula: {stream.formula}
                      </div>
                    )}
                  </div>
                </div>
                
                {(stream.startDate || stream.endDate) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    {stream.startDate && (
                      <span>From: {new Date(stream.startDate).toLocaleDateString()}</span>
                    )}
                    {stream.startDate && stream.endDate && (
                      <span className="mx-1">•</span>
                    )}
                    {stream.endDate && (
                      <span>Until: {new Date(stream.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No revenue streams found</p>
            <Button onClick={() => setIsAddStreamDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Stream
            </Button>
          </div>
        )}
        
        {revenueStreams?.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-6 border border-dashed border-gray-300 rounded-lg p-3 w-full text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setIsAddStreamDialogOpen(true)}
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add revenue stream</span>
            </div>
          </Button>
        )}
      </CardContent>

      {/* Add Revenue Stream Dialog */}
      <Dialog open={isAddStreamDialogOpen} onOpenChange={setIsAddStreamDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Revenue Stream</DialogTitle>
            <DialogDescription>
              Add a new revenue stream to track income sources for your business.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStream}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Software Subscriptions" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue="recurring">
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency" defaultValue="monthly">
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  placeholder="5000" 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="formula">Formula (optional)</Label>
                <Input 
                  id="formula" 
                  name="formula" 
                  placeholder="users * price_per_user" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddStreamDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addStreamMutation.isPending}>
                {addStreamMutation.isPending ? "Adding..." : "Add Stream"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash, Link2 } from "lucide-react";

interface DriverStreamMappingProps {
  forecastId?: number;
}

export const DriverStreamMapping: React.FC<DriverStreamMappingProps> = ({ forecastId }) => {
  const [driverId, setDriverId] = useState<string>("");
  const [streamId, setStreamId] = useState<string>("");
  const [multiplier, setMultiplier] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch revenue drivers
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["/api/revenue-drivers", { forecastId }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/revenue-drivers?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue drivers");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Fetch revenue streams
  const { data: streams, isLoading: isLoadingStreams } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Fetch existing mappings
  const { data: mappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ["/api/driver-stream-mappings", { forecastId }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/driver-stream-mappings?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch driver-stream mappings");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Create mapping mutation
  const createMapping = useMutation({
    mutationFn: (mappingData: any) => {
      return apiRequest("/api/driver-stream-mappings", {
        method: "POST",
        body: JSON.stringify(mappingData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Driver-stream mapping created successfully",
      });
      setDriverId("");
      setStreamId("");
      setMultiplier("");
      queryClient.invalidateQueries({ queryKey: ["/api/driver-stream-mappings"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create driver-stream mapping",
        variant: "destructive",
      });
    },
  });

  // Delete mapping mutation
  const deleteMapping = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/driver-stream-mappings/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Driver-stream mapping deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver-stream-mappings"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete driver-stream mapping",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverId || !streamId) {
      toast({
        title: "Error",
        description: "Please select both a driver and a stream",
        variant: "destructive",
      });
      return;
    }

    createMapping.mutate({
      driverId: parseInt(driverId),
      streamId: parseInt(streamId),
      multiplier: multiplier ? parseFloat(multiplier) : null,
    });
  };

  const isLoading = isLoadingDrivers || isLoadingStreams || isLoadingMappings;
  const isFormDisabled = createMapping.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Link Revenue Drivers to Streams</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Revenue Driver</label>
                  <Select value={driverId} onValueChange={setDriverId} disabled={isFormDisabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers?.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Revenue Stream</label>
                  <Select value={streamId} onValueChange={setStreamId} disabled={isFormDisabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams?.map((stream: any) => (
                        <SelectItem key={stream.id} value={stream.id.toString()}>
                          {stream.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Multiplier (optional)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 1.5"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isFormDisabled}>
                  {createMapping.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Link Driver to Stream
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Existing Connections</h3>
              {mappings?.length > 0 ? (
                <div className="space-y-3">
                  {mappings.map((mapping: any) => {
                    const driver = drivers?.find((d: any) => d.id === mapping.driverId);
                    const stream = streams?.find((s: any) => s.id === mapping.streamId);
                    
                    return (
                      <div 
                        key={mapping.id} 
                        className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-center">
                          <Link2 className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <span className="font-medium">{driver?.name}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span className="font-medium">{stream?.name}</span>
                            {mapping.multiplier && (
                              <span className="text-sm text-gray-500 ml-2">
                                (x{Number(mapping.multiplier).toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMapping.mutate(mapping.id)}
                          disabled={deleteMapping.isPending}
                        >
                          <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No driver-stream connections found. Create a connection above.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
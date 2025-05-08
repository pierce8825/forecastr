import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PencilIcon, Plus, Building2, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface DepartmentsProps {
  forecastId?: number;
  isLoading: boolean;
}

export function Departments({ forecastId, isLoading }: DepartmentsProps) {
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch departments
  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["/api/departments", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/departments?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Fetch personnel roles to count staff per department
  const { data: personnelRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["/api/personnel-roles", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/personnel-roles?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch personnel roles");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Mutation to add a new department
  const addDepartmentMutation = useMutation({
    mutationFn: async (departmentData: any) => {
      return await apiRequest("POST", "/api/departments", departmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsAddDepartmentDialogOpen(false);
      toast({
        title: "Success",
        description: "Department added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add department: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddDepartment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const departmentData = {
      forecastId,
      name: formData.get("name"),
      description: formData.get("description") || null,
    };

    addDepartmentMutation.mutate(departmentData);
  };

  // Helper to count personnel in a department
  const countPersonnelInDepartment = (departmentId: number) => {
    if (!personnelRoles) return 0;
    const rolesByDepartment = personnelRoles.filter((role: any) => role.departmentId === departmentId);
    return rolesByDepartment.reduce((sum: number, role: any) => sum + (Number(role.headcount) || 1), 0);
  };

  if (isLoading || isLoadingDepartments || isLoadingRoles) {
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
          <h3 className="text-base font-medium text-gray-800">Departments</h3>
          <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setIsAddDepartmentDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Department
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        {departments?.length > 0 ? (
          <div className="space-y-5">
            {departments.map((department: any) => {
              const headcount = countPersonnelInDepartment(department.id);
              
              return (
                <div key={department.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">{department.name}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                          <PencilIcon className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                      {department.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-[300px]">
                          {department.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <Users className="h-3 w-3 mr-1" />
                        {headcount} {headcount === 1 ? 'person' : 'people'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No departments found</p>
            <Button onClick={() => setIsAddDepartmentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Department
            </Button>
          </div>
        )}
        
        {departments?.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-6 border border-dashed border-gray-300 rounded-lg p-3 w-full text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setIsAddDepartmentDialogOpen(true)}
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add department</span>
            </div>
          </Button>
        )}
      </CardContent>

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Add a new department to organize your personnel roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDepartment}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Engineering" 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Information about this department"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDepartmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addDepartmentMutation.isPending}>
                {addDepartmentMutation.isPending ? "Adding..." : "Add Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
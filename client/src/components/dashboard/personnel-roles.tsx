import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PencilIcon, Plus, Users, BriefcaseIcon } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PersonnelRolesProps {
  forecastId?: number;
  isLoading: boolean;
}

export function PersonnelRoles({ forecastId, isLoading }: PersonnelRolesProps) {
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch departments for selection
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

  // Fetch personnel roles
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

  // Mutation to add a new personnel role
  const addRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      return await apiRequest("POST", "/api/personnel-roles", roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel-roles"] });
      setIsAddRoleDialogOpen(false);
      toast({
        title: "Success",
        description: "Personnel role added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add personnel role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const roleData = {
      forecastId,
      title: formData.get("title"),
      departmentId: formData.get("departmentId"),
      headcount: Number(formData.get("headcount")) || 1,
      annualSalary: Number(formData.get("annualSalary")),
      benefits: Number(formData.get("benefits")) || 0,
      taxes: Number(formData.get("taxes")) || 0,
      notes: formData.get("notes") || null,
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
    };

    addRoleMutation.mutate(roleData);
  };

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total compensation
  const calculateTotalComp = (salary: number, benefits: number, taxes: number) => {
    return salary + (salary * benefits / 100) + (salary * taxes / 100);
  };

  // Get department name by ID
  const getDepartmentName = (departmentId: number) => {
    if (!departments) return "Unknown Department";
    const department = departments.find((dept: any) => dept.id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  if (isLoading || isLoadingRoles || isLoadingDepartments) {
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
          <h3 className="text-base font-medium text-gray-800">Personnel Roles</h3>
          <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setIsAddRoleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        {personnelRoles?.length > 0 ? (
          <div className="space-y-5">
            {personnelRoles.map((role: any) => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{role.title}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                        <PencilIcon className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <BriefcaseIcon className="h-3 w-3 mr-1" />
                        {getDepartmentName(role.departmentId)}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <Users className="h-3 w-3 mr-1" />
                        {role.headcount} {role.headcount > 1 ? 'people' : 'person'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-tabular font-medium text-gray-900">
                      {formatAmount(calculateTotalComp(
                        Number(role.annualSalary),
                        Number(role.benefits || 0),
                        Number(role.taxes || 0)
                      ))}
                      <span className="text-xs text-gray-500 ml-1">/year</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Base: {formatAmount(Number(role.annualSalary))}
                    </div>
                  </div>
                </div>
                
                {role.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    {role.notes}
                  </div>
                )}
                
                {(role.startDate || role.endDate) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    {role.startDate && (
                      <span>From: {new Date(role.startDate).toLocaleDateString()}</span>
                    )}
                    {role.startDate && role.endDate && (
                      <span className="mx-1">•</span>
                    )}
                    {role.endDate && (
                      <span>Until: {new Date(role.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No personnel roles found</p>
            <Button onClick={() => setIsAddRoleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Role
            </Button>
          </div>
        )}
        
        {personnelRoles?.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-6 border border-dashed border-gray-300 rounded-lg p-3 w-full text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setIsAddRoleDialogOpen(true)}
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add personnel role</span>
            </div>
          </Button>
        )}
      </CardContent>

      {/* Add Personnel Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Personnel Role</DialogTitle>
            <DialogDescription>
              Add a new personnel role to track headcount and compensation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRole}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Role Title</Label>
                <Input id="title" name="title" placeholder="Senior Developer" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select name="departmentId" defaultValue={departments?.[0]?.id.toString()}>
                  <SelectTrigger id="departmentId">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="headcount">Headcount</Label>
                  <Input 
                    id="headcount" 
                    name="headcount" 
                    type="number" 
                    defaultValue="1"
                    min="1"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="annualSalary">Annual Salary ($)</Label>
                  <Input 
                    id="annualSalary" 
                    name="annualSalary" 
                    type="number" 
                    placeholder="120000" 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="benefits">Benefits (% of salary)</Label>
                  <Input 
                    id="benefits" 
                    name="benefits" 
                    type="number" 
                    placeholder="20" 
                    defaultValue="20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxes">Taxes (% of salary)</Label>
                  <Input 
                    id="taxes" 
                    name="taxes" 
                    type="number" 
                    placeholder="15" 
                    defaultValue="15"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Additional information about this role"
                  rows={3}
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
              <Button type="button" variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addRoleMutation.isPending}>
                {addRoleMutation.isPending ? "Adding..." : "Add Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
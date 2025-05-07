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
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  UserPlus,
  Filter
} from "lucide-react";
import { Helmet } from "react-helmet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const Personnel = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
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

  // Mutations for departments
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDepartment) => {
      return await apiRequest("POST", "/api/departments", newDepartment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsAddDepartmentDialogOpen(false);
      toast({
        title: "Department added",
        description: "New department has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add department: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutations for personnel roles
  const addRoleMutation = useMutation({
    mutationFn: async (newRole) => {
      return await apiRequest("POST", "/api/personnel-roles", newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel-roles"] });
      setIsAddRoleDialogOpen(false);
      toast({
        title: "Role added",
        description: "New personnel role has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleAddDepartment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addDepartmentMutation.mutate({
      forecastId,
      name: formData.get("name"),
    });
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addRoleMutation.mutate({
      forecastId,
      departmentId: Number(formData.get("departmentId")),
      title: formData.get("title"),
      count: Number(formData.get("count")),
      plannedCount: Number(formData.get("plannedCount")),
      annualSalary: formData.get("annualSalary"),
      benefits: (Number(formData.get("benefits")) / 100).toString(),
      startingMonth: Number(formData.get("startingMonth")),
      notes: formData.get("notes"),
    });
  };

  // Process personnel data for charts
  const departmentData = departments?.map((dept, index) => {
    const roles = personnelRoles?.filter(role => role.departmentId === dept.id) || [];
    const headcount = roles.reduce((sum, role) => sum + role.count, 0);
    const annualCost = roles.reduce((sum, role) => {
      return sum + (Number(role.annualSalary) * role.count * (1 + Number(role.benefits || 0)));
    }, 0);
    
    return {
      name: dept.name,
      headcount,
      annualCost,
      color: COLORS[index % COLORS.length]
    };
  }) || [];

  // Calculate totals
  const totalHeadcount = departmentData.reduce((sum, dept) => sum + dept.headcount, 0);
  const totalAnnualCost = departmentData.reduce((sum, dept) => sum + dept.annualCost, 0);
  const avgSalary = totalHeadcount > 0 
    ? totalAnnualCost / totalHeadcount 
    : 0;

  // Filter roles by department
  const selectedDepartment = departments?.find(dept => dept.name === activeTab);
  const filteredRoles = activeTab === "all" 
    ? personnelRoles 
    : personnelRoles?.filter(role => role.departmentId === selectedDepartment?.id);

  const isLoading = isLoadingDepartments || isLoadingRoles;

  return (
    <>
      <Helmet>
        <title>Personnel Planning | FinanceForge</title>
        <meta name="description" content="Plan and forecast your personnel costs, manage departments and roles, and track headcount growth." />
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Personnel Planning</h1>
            <p className="text-muted-foreground">Plan and forecast your team structure and costs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddDepartmentDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
            <Button onClick={() => setIsAddRoleDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Headcount</CardTitle>
              <CardDescription>Current employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalHeadcount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Across {departments?.length || 0} departments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Salary</CardTitle>
              <CardDescription>Per employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                ${Math.round(avgSalary).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Including benefits
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Annual Personnel Cost</CardTitle>
              <CardDescription>All departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                ${Math.round(totalAnnualCost).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${Math.round(totalAnnualCost / 12).toLocaleString()} monthly
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Headcount</CardTitle>
              <CardDescription>Distribution by department</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading department data...</p>
                  </div>
                ) : departmentData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-muted-foreground mb-2">No department data available</p>
                      <Button size="sm" onClick={() => setIsAddDepartmentDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Department
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => [`${value} employees`, ""]} />
                      <Legend />
                      <Bar dataKey="headcount" name="Headcount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution</CardTitle>
              <CardDescription>Personnel cost by department</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading personnel cost data...</p>
                  </div>
                ) : departmentData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-muted-foreground mb-2">No cost data available</p>
                      <Button size="sm" onClick={() => setIsAddRoleDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Role
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="annualCost"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personnel Roles</CardTitle>
              <CardDescription>
                Manage your team structure and costs
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddDepartmentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Department
              </Button>
              <Button size="sm" onClick={() => setIsAddRoleDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Departments</TabsTrigger>
                {departments?.map((department) => (
                  <TabsTrigger key={department.id} value={department.name} className="min-w-[100px]">
                    {department.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading personnel data...</p>
                  </div>
                ) : filteredRoles?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No personnel roles found</p>
                    <Button onClick={() => setIsAddRoleDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add Personnel Role
                    </Button>
                  </div>
                ) : (
                  <>
                    {departments?.map((department) => {
                      // Skip departments with no roles or if not viewing all departments and this isn't the selected one
                      const departmentRoles = personnelRoles?.filter(role => role.departmentId === department.id) || [];
                      if (departmentRoles.length === 0 || (activeTab !== "all" && department.name !== activeTab)) {
                        return null;
                      }
                      
                      // Calculate department totals
                      const headcount = departmentRoles.reduce((sum, role) => sum + role.count, 0);
                      const plannedHeadcount = departmentRoles.reduce((sum, role) => sum + role.plannedCount, 0);
                      const avgSalary = departmentRoles.reduce((sum, role) => sum + Number(role.annualSalary), 0) / departmentRoles.length;
                      const monthlyCost = departmentRoles.reduce((sum, role) => {
                        const monthlySalary = Number(role.annualSalary) / 12;
                        const benefits = Number(role.benefits || 0);
                        return sum + (monthlySalary * (1 + benefits) * role.count);
                      }, 0);
                      const annualCost = monthlyCost * 12;
                      
                      return (
                        <div key={department.id} className="mb-8">
                          {activeTab === "all" && (
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <span 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor: COLORS[departments.findIndex(d => d.id === department.id) % COLORS.length]
                                  }}
                                ></span>
                                {department.name}
                              </h3>
                              <span className="text-sm text-gray-500">{departmentRoles.length} roles</span>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="text-xs text-gray-500 mb-1">Headcount</div>
                              <div className="text-sm font-medium text-gray-900">
                                {headcount} / {plannedHeadcount}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="text-xs text-gray-500 mb-1">Avg. Salary</div>
                              <div className="text-sm font-medium text-gray-900 font-tabular">
                                ${Math.round(avgSalary).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="text-xs text-gray-500 mb-1">Monthly Cost</div>
                              <div className="text-sm font-medium text-gray-900 font-tabular">
                                ${Math.round(monthlyCost).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="text-xs text-gray-500 mb-1">Annual Cost</div>
                              <div className="text-sm font-medium text-gray-900 font-tabular">
                                ${Math.round(annualCost).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-3 px-2 text-left">Title</th>
                                  <th className="py-3 px-2 text-right">Headcount</th>
                                  <th className="py-3 px-2 text-right">Annual Salary</th>
                                  <th className="py-3 px-2 text-right">Benefits</th>
                                  <th className="py-3 px-2 text-right">Start</th>
                                  <th className="py-3 px-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {departmentRoles.map((role) => (
                                  <tr key={role.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2">{role.title}</td>
                                    <td className="py-3 px-2 text-right">
                                      {role.count} / {role.plannedCount}
                                    </td>
                                    <td className="py-3 px-2 text-right font-tabular">
                                      ${Number(role.annualSalary).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      {(Number(role.benefits) * 100).toFixed(0)}%
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      {role.startingMonth ? (
                                        new Date(2023, role.startingMonth - 1).toLocaleString('default', { month: 'short' })
                                      ) : 'Jan'}
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
                        </div>
                      );
                    })}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Add a new department to your organization structure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDepartment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Department Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
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

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Personnel Role</DialogTitle>
            <DialogDescription>
              Add a new role to your personnel plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRole}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departmentId" className="text-right">
                  Department
                </Label>
                <Select name="departmentId" defaultValue={selectedDepartment?.id?.toString() || ""} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Job Title
                </Label>
                <Input id="title" name="title" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="count" className="text-right">
                  Current Count
                </Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  min="0"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plannedCount" className="text-right">
                  Planned Count
                </Label>
                <Input
                  id="plannedCount"
                  name="plannedCount"
                  type="number"
                  min="0"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="annualSalary" className="text-right">
                  Annual Salary
                </Label>
                <div className="col-span-3 flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    $
                  </span>
                  <Input
                    id="annualSalary"
                    name="annualSalary"
                    type="number"
                    min="0"
                    step="1000"
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="benefits" className="text-right">
                  Benefits %
                </Label>
                <div className="col-span-3 flex">
                  <Input
                    id="benefits"
                    name="benefits"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="20"
                    className="rounded-r-none"
                    required
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    %
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startingMonth" className="text-right">
                  Starting Month
                </Label>
                <Select name="startingMonth" defaultValue="1">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input id="notes" name="notes" className="col-span-3" />
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
    </>
  );
};

export default Personnel;

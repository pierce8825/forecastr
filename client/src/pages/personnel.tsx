import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from "recharts";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFinancialContext } from "@/contexts/financial-context";

interface PersonnelRole {
  id: string;
  title: string;
  department: string;
  baseSalary: number;
  benefits: number;
  taxes: number;
  totalCost: number;
  headcount: {
    current: number;
    projected: Record<string, number>;
  };
}

const Personnel: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  // Fetch data
  const { data: personnelData, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ['/api/workspaces/1/personnel-roles'],
    enabled: !!activeWorkspace
  });

  const { data: headcountData, isLoading: isLoadingHeadcount } = useQuery({
    queryKey: ['/api/workspaces/1/personnel-headcount'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const personnelRoles: PersonnelRole[] = [
    {
      id: "swe",
      title: "Software Engineer",
      department: "Engineering",
      baseSalary: 120000,
      benefits: 24000,
      taxes: 18000,
      totalCost: 162000,
      headcount: {
        current: 5,
        projected: {
          "Q3 2023": 5,
          "Q4 2023": 6,
          "Q1 2024": 7,
          "Q2 2024": 8
        }
      }
    },
    {
      id: "pm",
      title: "Product Manager",
      department: "Product",
      baseSalary: 130000,
      benefits: 26000,
      taxes: 19500,
      totalCost: 175500,
      headcount: {
        current: 2,
        projected: {
          "Q3 2023": 2,
          "Q4 2023": 2,
          "Q1 2024": 3,
          "Q2 2024": 3
        }
      }
    },
    {
      id: "sales",
      title: "Sales Representative",
      department: "Sales",
      baseSalary: 100000,
      benefits: 20000,
      taxes: 15000,
      totalCost: 135000,
      headcount: {
        current: 3,
        projected: {
          "Q3 2023": 3,
          "Q4 2023": 4,
          "Q1 2024": 5,
          "Q2 2024": 6
        }
      }
    },
    {
      id: "marketing",
      title: "Marketing Specialist",
      department: "Marketing",
      baseSalary: 90000,
      benefits: 18000,
      taxes: 13500,
      totalCost: 121500,
      headcount: {
        current: 2,
        projected: {
          "Q3 2023": 2,
          "Q4 2023": 2,
          "Q1 2024": 3,
          "Q2 2024": 3
        }
      }
    }
  ];

  const departmentHeadcount = [
    { name: "Engineering", current: 5, projected: 8 },
    { name: "Product", current: 2, projected: 3 },
    { name: "Sales", current: 3, projected: 6 },
    { name: "Marketing", current: 2, projected: 3 },
    { name: "Operations", current: 1, projected: 2 },
  ];

  const headcountTrend = [
    { month: "Jul 23", headcount: 13 },
    { month: "Aug 23", headcount: 13 },
    { month: "Sep 23", headcount: 13 },
    { month: "Oct 23", headcount: 14 },
    { month: "Nov 23", headcount: 14 },
    { month: "Dec 23", headcount: 15 },
    { month: "Jan 24", headcount: 17 },
    { month: "Feb 24", headcount: 18 },
    { month: "Mar 24", headcount: 19 },
    { month: "Apr 24", headcount: 20 },
    { month: "May 24", headcount: 21 },
    { month: "Jun 24", headcount: 22 }
  ];

  // Event handlers
  const handleAddRole = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (id: string) => {
    setEditingRole(id);
    setIsDialogOpen(true);
  };

  const handleSaveRole = () => {
    toast({
      title: editingRole ? "Role Updated" : "Role Added",
      description: editingRole ? `Updated role successfully` : "New role added successfully",
    });
    setIsDialogOpen(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeWorkspace={activeWorkspace}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-lighter">
          <ToolbarHeader 
            title="Personnel Planning"
            onEdit={() => toast({ title: "Edit Personnel Settings", description: "Opening personnel settings" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roles">Roles & Salaries</TabsTrigger>
                <TabsTrigger value="planning">Headcount Planning</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium text-neutral-darker">Department Headcount</h3>
                        <div className="flex space-x-2">
                          <button className="text-neutral-dark hover:text-primary p-1">
                            <MaterialIcon name="filter_list" />
                          </button>
                          <button className="text-neutral-dark hover:text-primary p-1">
                            <MaterialIcon name="more_horiz" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="chart-container" style={{ height: "300px" }}>
                        {isLoadingHeadcount ? (
                          <div className="h-full w-full bg-neutral-lighter rounded animate-pulse"></div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={headcountData?.departments || departmentHeadcount}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                              barGap={6}
                              barSize={16}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" />
                              <Tooltip formatter={(value) => value} />
                              <Legend />
                              <Bar dataKey="current" name="Current" fill="#0078D4" radius={[0, 0, 0, 0]} />
                              <Bar dataKey="projected" name="Projected (12m)" fill="#EDEBE9" radius={[0, 0, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium text-neutral-darker">Headcount Trend</h3>
                        <div className="flex space-x-2">
                          <button className="text-neutral-dark hover:text-primary p-1">
                            <MaterialIcon name="filter_list" />
                          </button>
                          <button className="text-neutral-dark hover:text-primary p-1">
                            <MaterialIcon name="more_horiz" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="chart-container" style={{ height: "300px" }}>
                        {isLoadingHeadcount ? (
                          <div className="h-full w-full bg-neutral-lighter rounded animate-pulse"></div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={headcountData?.trend || headcountTrend}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              barSize={20}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="month" />
                              <YAxis domain={[0, 'dataMax + 5']} />
                              <Tooltip />
                              <Bar dataKey="headcount" name="Headcount" fill="#0078D4">
                                {(headcountData?.trend || headcountTrend).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index < 3 ? "#0078D4" : "#EDEBE9"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <h3 className="font-medium text-neutral-darker mb-6">Personnel Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Current Headcount</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">13</div>
                        <div className="text-sm text-success mt-1">+2 since beginning of year</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Annual Personnel Cost</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">$1.78M</div>
                        <div className="text-sm text-warning mt-1">+15.3% vs. last year</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Cost per Employee</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">$137K</div>
                        <div className="text-sm text-neutral-dark mt-1">Annual average</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Projected Headcount (EOY)</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">15</div>
                        <div className="text-sm text-success mt-1">+15.4% growth</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="roles" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Roles & Salaries</h3>
                  <Button onClick={handleAddRole}>
                    <MaterialIcon name="add_circle" className="mr-2" />
                    Add Role
                  </Button>
                </div>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    {isLoadingPersonnel ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-neutral-lighter rounded w-full mb-4"></div>
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-neutral-lighter rounded w-full"></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Role / Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Base Salary</TableHead>
                            <TableHead className="text-right">Benefits</TableHead>
                            <TableHead className="text-right">Taxes</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(personnelData?.roles || personnelRoles).map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">{role.title}</TableCell>
                              <TableCell>{role.department}</TableCell>
                              <TableCell className="text-right">{formatCurrency(role.baseSalary)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(role.benefits)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(role.taxes)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(role.totalCost)}</TableCell>
                              <TableCell className="text-center">
                                <button 
                                  className="text-primary hover:text-primary-dark mr-2"
                                  onClick={() => handleEditRole(role.id)}
                                >
                                  <MaterialIcon name="edit" />
                                </button>
                                <button 
                                  className="text-neutral-dark hover:text-primary"
                                  onClick={() => toast({ title: "Duplicate Role", description: `Duplicating ${role.title}` })}
                                >
                                  <MaterialIcon name="filter_list" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Cost Structure Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Default Benefits (% of Salary)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="20" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Default Taxes (% of Salary)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="15" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Annual Salary Increase (%)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="3" 
                          className="border-neutral-light"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => toast({ title: "Update Settings", description: "Cost structure settings updated" })}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="planning" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Headcount Planning</h3>
                  <Button onClick={() => toast({ title: "Generate Plan", description: "Generating headcount plan" })}>
                    <MaterialIcon name="trending_up" className="mr-2" />
                    Generate Plan
                  </Button>
                </div>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Headcount Projections</h3>
                    
                    {isLoadingPersonnel ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-neutral-lighter rounded w-full mb-4"></div>
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-neutral-lighter rounded w-full"></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Role / Title</TableHead>
                            <TableHead className="text-center">Current</TableHead>
                            <TableHead className="text-center">Q3 2023</TableHead>
                            <TableHead className="text-center">Q4 2023</TableHead>
                            <TableHead className="text-center">Q1 2024</TableHead>
                            <TableHead className="text-center">Q2 2024</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(personnelData?.roles || personnelRoles).map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">{role.title}</TableCell>
                              <TableCell className="text-center">{role.headcount.current}</TableCell>
                              <TableCell className="text-center">{role.headcount.projected["Q3 2023"]}</TableCell>
                              <TableCell className="text-center">{role.headcount.projected["Q4 2023"]}</TableCell>
                              <TableCell className="text-center">{role.headcount.projected["Q1 2024"]}</TableCell>
                              <TableCell className="text-center">{role.headcount.projected["Q2 2024"]}</TableCell>
                              <TableCell className="text-center">
                                <button 
                                  className="text-primary hover:text-primary-dark"
                                  onClick={() => toast({ title: "Edit Projections", description: `Editing projections for ${role.title}` })}
                                >
                                  <MaterialIcon name="edit" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Planning Parameters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Hiring Lead Time (days)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="60" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Default Ramp-up (months)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="3" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Revenue-to-Headcount Ratio
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="250000" 
                          className="border-neutral-light"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => toast({ title: "Update Parameters", description: "Planning parameters updated" })}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Personnel Cost Forecast</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast({ title: "Export Forecast", description: "Exporting personnel cost forecast" })}
                      >
                        Export
                      </Button>
                    </div>
                    
                    <div className="chart-container" style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { month: "Jul 23", cost: 156000 },
                            { month: "Aug 23", cost: 156000 },
                            { month: "Sep 23", cost: 156000 },
                            { month: "Oct 23", cost: 168000 },
                            { month: "Nov 23", cost: 168000 },
                            { month: "Dec 23", cost: 180000 },
                            { month: "Jan 24", cost: 216000 },
                            { month: "Feb 24", cost: 228000 },
                            { month: "Mar 24", cost: 240000 },
                            { month: "Apr 24", cost: 252000 },
                            { month: "May 24", cost: 264000 },
                            { month: "Jun 24", cost: 276000 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="cost" name="Personnel Cost" fill="#0078D4">
                            {[0, 1, 2].map((index) => (
                              <Cell key={`cell-${index}`} fill="#0078D4" />
                            ))}
                            {[3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => (
                              <Cell key={`cell-${index}`} fill="#EDEBE9" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
            <DialogDescription>
              {editingRole 
                ? "Update the details for this role" 
                : "Create a new role to add to your personnel plans"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Role / Title</Label>
              <Input 
                id="title" 
                defaultValue={editingRole ? personnelRoles.find(r => r.id === editingRole)?.title : ""} 
                placeholder="e.g., Software Engineer, Product Manager" 
                className="border-neutral-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select defaultValue={editingRole ? personnelRoles.find(r => r.id === editingRole)?.department : "Engineering"}>
                <SelectTrigger className="border-neutral-light">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Base Salary ($)</Label>
                <Input 
                  id="baseSalary" 
                  type="number" 
                  defaultValue={editingRole ? personnelRoles.find(r => r.id === editingRole)?.baseSalary : ""} 
                  placeholder="e.g., 120000" 
                  className="border-neutral-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (% of Salary)</Label>
                <Input 
                  id="benefits" 
                  type="number" 
                  defaultValue="20" 
                  placeholder="e.g., 20" 
                  className="border-neutral-light"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxes">Taxes (% of Salary)</Label>
                <Input 
                  id="taxes" 
                  type="number" 
                  defaultValue="15" 
                  placeholder="e.g., 15" 
                  className="border-neutral-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headcount">Current Headcount</Label>
                <Input 
                  id="headcount" 
                  type="number" 
                  defaultValue={editingRole ? personnelRoles.find(r => r.id === editingRole)?.headcount.current : "1"} 
                  placeholder="e.g., 1" 
                  className="border-neutral-light"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personnel;

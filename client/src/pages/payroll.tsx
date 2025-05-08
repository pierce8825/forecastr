import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Download, Filter, Search, UserPlus, UserIcon, Trash2, Edit, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { EmployeeDialog } from "@/components/payroll/employee-dialog";

const Payroll = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const { toast } = useToast();
  
  // Fetch employees
  const { data: employees, isLoading, isError, error } = useQuery({
    queryKey: ['/api/employees', { userId: 1 }], // Use userId: 1 for demo
    queryFn: () => fetch('/api/employees?userId=1').then(res => {
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    })
  });

  // Sample payroll data
  const upcomingPayrolls = [
    {
      id: 1,
      name: "Biweekly Payroll",
      date: "May 15, 2025",
      employees: 24,
      status: "Scheduled",
      amount: "$42,780.00"
    },
    {
      id: 2,
      name: "Monthly Bonus",
      date: "May 30, 2025",
      employees: 8,
      status: "Pending",
      amount: "$16,500.00"
    },
    {
      id: 3,
      name: "Contractor Payments",
      date: "May 20, 2025",
      employees: 5,
      status: "Scheduled",
      amount: "$12,450.00"
    }
  ];

  const payrollHistory = [
    {
      id: 4,
      name: "Biweekly Payroll",
      date: "April 30, 2025",
      employees: 24,
      status: "Completed",
      amount: "$42,780.00"
    },
    {
      id: 5,
      name: "Monthly Bonus",
      date: "April 15, 2025",
      employees: 7,
      status: "Completed",
      amount: "$14,000.00"
    },
    {
      id: 6,
      name: "Contractor Payments",
      date: "April 20, 2025",
      employees: 5,
      status: "Completed",
      amount: "$11,200.00"
    },
    {
      id: 7,
      name: "Biweekly Payroll",
      date: "April 15, 2025",
      employees: 23,
      status: "Completed",
      amount: "$41,500.00"
    }
  ];

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">Scheduled</Badge>;
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">Pending</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Payroll Management | FinanceForge</title>
        <meta name="description" content="Manage and process payroll for your company" />
      </Helmet>

      <div className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage employee payroll</p>
          </div>
          <div className="mt-4 flex space-x-3 sm:mt-0">
            <Button onClick={() => window.alert("New payroll run initiated!")}>
              <Plus className="mr-2 h-4 w-4" />
              New Payroll Run
            </Button>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$138,950.00</div>
              <p className="text-xs text-muted-foreground mt-1">For May 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$71,730.00</div>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground mt-1">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$5,840</div>
              <p className="text-xs text-muted-foreground mt-1">Per employee monthly</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>Manage employees and their information</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => window.alert("Employee records will be exported")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={() => setShowEmployeeDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(4).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[140px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-[120px] ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-red-500">
                        Error loading employees: {error?.message || "Failed to load employees"}
                      </TableCell>
                    </TableRow>
                  ) : employees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No employees found. Add your first employee to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees?.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{`${employee.firstName} ${employee.lastName}`}</TableCell>
                        <TableCell>{employee.departmentId ? `Dept ${employee.departmentId}` : "Unassigned"}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{new Date(employee.startDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">${employee.salary.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => window.alert(`Viewing ${employee.firstName}'s details`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="ml-1" onClick={() => window.alert(`Editing ${employee.firstName}'s information`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="ml-1 text-red-500 hover:text-red-600" onClick={() => window.alert(`Delete ${employee.firstName}?`)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle>Payroll Schedules</CardTitle>
                <CardDescription>Manage upcoming and past payroll runs</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[200px] md:w-[300px]"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => window.alert("Filter options will appear here")}>
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.alert("Calendar view will open here")}>
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.alert("Downloading payroll data...")}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingPayrolls.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">{payroll.name}</TableCell>
                          <TableCell>{payroll.date}</TableCell>
                          <TableCell>{payroll.employees}</TableCell>
                          <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                          <TableCell className="text-right">{payroll.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => window.alert(`Viewing details for ${payroll.name}`)}>View</Button>
                            <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert(`Editing ${payroll.name}`)}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollHistory.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">{payroll.name}</TableCell>
                          <TableCell>{payroll.date}</TableCell>
                          <TableCell>{payroll.employees}</TableCell>
                          <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                          <TableCell className="text-right">{payroll.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => window.alert(`Viewing details for ${payroll.name}`)}>View</Button>
                            <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert(`Downloading ${payroll.name} report...`)}>Download</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <EmployeeDialog
        open={showEmployeeDialog}
        onOpenChange={setShowEmployeeDialog}
      />
    </>
  );
};

export default Payroll;
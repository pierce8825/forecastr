import { useState } from "react";
import { Helmet } from "react-helmet";
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
import { Calendar, Plus, Download, Filter, Search, UserPlus, UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Payroll = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

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
            <Button variant="outline" onClick={() => window.alert("Add employee dialog will open here")}>
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
                <Button onClick={() => window.alert("Add new employee dialog will open here")}>
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
                  <TableRow>
                    <TableCell className="font-medium">John Smith</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>Senior Developer</TableCell>
                    <TableCell>Jan 15, 2023</TableCell>
                    <TableCell className="text-right">$95,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => window.alert("Viewing John Smith's details")}>View</Button>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert("Editing John Smith's information")}>Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sarah Johnson</TableCell>
                    <TableCell>Marketing</TableCell>
                    <TableCell>Marketing Director</TableCell>
                    <TableCell>Mar 3, 2022</TableCell>
                    <TableCell className="text-right">$110,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => window.alert("Viewing Sarah Johnson's details")}>View</Button>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert("Editing Sarah Johnson's information")}>Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Michael Chen</TableCell>
                    <TableCell>Finance</TableCell>
                    <TableCell>Financial Analyst</TableCell>
                    <TableCell>Jul 10, 2024</TableCell>
                    <TableCell className="text-right">$85,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => window.alert("Viewing Michael Chen's details")}>View</Button>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert("Editing Michael Chen's information")}>Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Emma Rodriguez</TableCell>
                    <TableCell>Sales</TableCell>
                    <TableCell>Account Executive</TableCell>
                    <TableCell>Feb 22, 2023</TableCell>
                    <TableCell className="text-right">$78,500</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => window.alert("Viewing Emma Rodriguez's details")}>View</Button>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => window.alert("Editing Emma Rodriguez's information")}>Edit</Button>
                    </TableCell>
                  </TableRow>
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
    </>
  );
};

export default Payroll;
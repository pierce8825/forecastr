import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";

interface PersonnelPlanningProps {
  forecastId?: number;
  isLoading: boolean;
}

const PersonnelPlanning = ({ forecastId, isLoading }: PersonnelPlanningProps) => {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);

  // Fetch departments for the forecast
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

  // Fetch personnel roles for the forecast
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

  // Group personnel roles by department
  const personnelByDepartment = departments?.map(dept => {
    const roles = personnelRoles?.filter(role => role.departmentId === dept.id) || [];
    const totalHeadcount = roles.reduce((sum, role) => sum + role.count, 0);
    const totalPlannedHeadcount = roles.reduce((sum, role) => sum + role.plannedCount, 0);
    const avgSalary = roles.length 
      ? roles.reduce((sum, role) => sum + Number(role.annualSalary), 0) / roles.length 
      : 0;
    const monthlyCost = roles.reduce((sum, role) => {
      const monthlySalary = Number(role.annualSalary) / 12;
      const benefitMultiplier = 1 + Number(role.benefits || 0);
      return sum + (monthlySalary * benefitMultiplier * role.count);
    }, 0);
    const annualCost = monthlyCost * 12;

    return {
      ...dept,
      roles,
      totalHeadcount,
      totalPlannedHeadcount,
      avgSalary,
      monthlyCost,
      annualCost
    };
  }) || [];

  // Filter departments based on active department
  const filteredDepartments = activeDepartment === null 
    ? personnelByDepartment 
    : personnelByDepartment.filter(dept => dept.name === activeDepartment);

  if (isLoading || isLoadingDepartments || isLoadingRoles) {
    return (
      <Card>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-center mb-5">
            <Skeleton className="h-8 w-32 mr-2" />
            <Skeleton className="h-8 w-24 mr-2" />
            <Skeleton className="h-8 w-24 mr-2" />
            <Skeleton className="h-8 w-24" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">Personnel Planning</h3>
          <Button variant="link" className="text-primary p-0 h-auto">
            <UserPlus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-center mb-5 space-x-2 overflow-x-auto pb-2">
          <Button 
            variant={activeDepartment === null ? "default" : "outline"} 
            onClick={() => setActiveDepartment(null)}
          >
            All Departments
          </Button>
          {departments?.map(dept => (
            <Button 
              key={dept.id} 
              variant={activeDepartment === dept.name ? "default" : "outline"}
              onClick={() => setActiveDepartment(dept.name)}
            >
              {dept.name}
            </Button>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No departments or personnel data found</p>
              <Button>Add Your First Department</Button>
            </div>
          ) : (
            filteredDepartments.map((department) => (
              <div key={department.id} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{
                      backgroundColor: department.name === 'Engineering' ? '#3B82F6' : 
                                       department.name === 'Sales' ? '#10B981' : '#8B5CF6'
                    }}></span>
                    <h4 className="text-sm font-medium text-gray-900">{department.name}</h4>
                  </div>
                  <div className="text-sm text-gray-500">{department.roles.length} roles</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-gray-500 mb-1">Headcount</div>
                    <div className="text-sm font-medium text-gray-900">
                      {department.totalHeadcount} / {department.totalPlannedHeadcount}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-gray-500 mb-1">Avg. Salary</div>
                    <div className="text-sm font-medium text-gray-900 font-tabular">
                      ${Math.round(department.avgSalary).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-gray-500 mb-1">Monthly Cost</div>
                    <div className="text-sm font-medium text-gray-900 font-tabular">
                      ${Math.round(department.monthlyCost).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs text-gray-500 mb-1">Annual Cost</div>
                    <div className="text-sm font-medium text-gray-900 font-tabular">
                      ${Math.round(department.annualCost).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonnelPlanning;

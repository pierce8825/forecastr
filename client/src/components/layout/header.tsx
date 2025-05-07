import React from "react";
import { MaterialIcon } from "../ui/ui-icons";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: {
    id: number;
    fullName: string;
    initials: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Models", path: "/models" },
    { name: "Reports", path: "/reports" },
    { name: "Integrations", path: "/integrations" },
  ];

  return (
    <header className="bg-white border-b border-neutral-light shadow-sm z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <div className="text-primary font-semibold text-xl mr-8">FinanceForward</div>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a className={cn(
                    "px-2 py-4 font-medium",
                    location === item.path
                      ? "text-primary font-medium tab-active"
                      : "text-neutral-dark hover:text-primary"
                  )}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-neutral-lighter">
              <MaterialIcon name="notifications" className="text-neutral-dark" />
            </button>
            <button className="p-2 rounded-md hover:bg-neutral-lighter">
              <MaterialIcon name="help_outline" className="text-neutral-dark" />
            </button>
            
            {user && (
              <div className="relative">
                <button className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center">
                    <span className="text-sm font-medium">{user.initials}</span>
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.fullName}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const ToolbarHeader: React.FC<{
  title: string;
  onEdit?: () => void;
  showScenarioSelector?: boolean;
  showPeriodSelector?: boolean;
  scenarios?: {id: string; name: string}[];
  activeScenario?: string;
  onScenarioChange?: (value: string) => void;
  period?: string;
  onPeriodChange?: (value: string) => void;
}> = ({
  title,
  onEdit,
  showScenarioSelector = true,
  showPeriodSelector = true,
  scenarios = [],
  activeScenario,
  onScenarioChange,
  period = "Monthly",
  onPeriodChange,
}) => {
  return (
    <div className="bg-white border-b border-neutral-light p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-neutral-darker">{title}</h1>
          {onEdit && (
            <button onClick={onEdit} className="ml-4 text-primary hover:text-primary-dark">
              <MaterialIcon name="edit" />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {showScenarioSelector && (
            <Select
              value={activeScenario}
              onValueChange={onScenarioChange}
            >
              <SelectTrigger className="min-w-[180px] bg-neutral-lighter border-neutral-light">
                <SelectValue placeholder="Base Scenario" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>{scenario.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {showPeriodSelector && (
            <Select
              value={period}
              onValueChange={onPeriodChange}
            >
              <SelectTrigger className="min-w-[120px] bg-neutral-lighter border-neutral-light">
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button className="bg-primary hover:bg-primary-dark" size="sm">
            <MaterialIcon name="share" className="mr-1 text-white" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

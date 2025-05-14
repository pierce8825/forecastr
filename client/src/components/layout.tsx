import React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Workflow,
  Gauge,
  FileText,
  Settings,
  Menu,
  Banknote,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigationValidator } from "@/lib/navigation-validator";

import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

function NavItem({ href, label, icon, isActive }: NavItemProps) {
  const { validateNavigation } = useNavigationValidator();
  const [_, navigate] = useLocation();
  
  const handleNavigation = (e: React.MouseEvent) => {
    // Skip validation if already on this page
    if (isActive) return;
    
    e.preventDefault();
    
    // Validate formulas before navigation
    if (validateNavigation(href)) {
      navigate(href);
    }
  };
  
  return (
    <a href={href} onClick={handleNavigation}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </a>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      href: "/revenue",
      label: "Revenue",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      href: "/personnel",
      label: "Personnel",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: "/payroll",
      label: "Payroll",
      icon: <Banknote className="h-4 w-4" />,
    },
    {
      href: "/cash-flow",
      label: "Cash Flow",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      href: "/projections",
      label: "Projections",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      href: "/scenarios",
      label: "Scenarios",
      icon: <Workflow className="h-4 w-4" />,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-6 flex items-center justify-center">
          <h1 className="text-center text-2xl font-bold tracking-tighter text-primary">
            FinanceForecast
          </h1>
        </div>
        <nav className="flex flex-col h-full justify-between">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location === item.href}
              />
            ))}
          </div>
          
          {user && (
            <div className="mt-auto pt-4 border-t">
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h1 className="text-center text-2xl font-bold tracking-tighter text-primary">
                FinanceForecast
              </h1>
            </div>
            <nav className="flex flex-col h-full p-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={location === item.href}
                  />
                ))}
              </div>
              
              {user && (
                <div className="mt-auto pt-4 border-t">
                  <div className="px-3 py-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{user.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="border-b bg-card p-4 md:hidden">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <h1 className="text-lg font-bold tracking-tighter text-primary">
              FinanceForecast
            </h1>
            <div className="w-8" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <Toaster />
    </div>
  );
}
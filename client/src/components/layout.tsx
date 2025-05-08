import React from "react";
import { Link, useLocation } from "wouter";
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
} from "lucide-react";

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
  return (
    <Link href={href}>
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
    </Link>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      href: "/dashboard",
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

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-6 flex items-center justify-center">
          <h1 className="text-center text-2xl font-bold tracking-tighter text-primary">
            FinanceForecast
          </h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={location === item.href}
            />
          ))}
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
            <nav className="flex-1 overflow-auto p-4">
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
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="border-b bg-card p-4 md:hidden">
          <div className="flex items-center justify-between">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
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
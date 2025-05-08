import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Settings, 
  CreditCard,
  AreaChart,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Revenue", href: "/revenue", icon: TrendingUp },
    { name: "Expenses", href: "/expenses", icon: CreditCard },
    { name: "Personnel", href: "/personnel", icon: Users },
    { name: "Cash Flow", href: "/cash-flow", icon: DollarSign },
    { name: "Projections", href: "/projections", icon: AreaChart },
    { name: "Scenarios", href: "/scenarios", icon: Layers },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow border-r border-border bg-card pt-5">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                FinancialForecast
              </h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      item.href === location
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.href === location
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                        "mr-3 flex-shrink-0 h-5 w-5"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-card border-b border-border">
            <div className="-ml-0.5 -mt-0.5 h-12 flex items-center">
              <h1 className="ml-3 text-xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                FinancialForecast
              </h1>
            </div>
            <div className="mt-2 flex justify-start space-x-4 overflow-x-auto pb-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.href === location
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                    "group inline-flex items-center px-2 py-1 text-sm font-medium"
                  )}
                >
                  <item.icon
                    className={cn(
                      item.href === location
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                      "mr-1 flex-shrink-0 h-4 w-4"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
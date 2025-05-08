import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp, 
  CreditCard,
  Users,
  LineChart,
  CandlestickChart,
  FileBarChart,
  Settings,
  LogOut
} from "lucide-react";

type SidebarNavProps = {
  children: ReactNode;
};

export default function Layout({ children }: SidebarNavProps) {
  const [location] = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: "Revenue",
      href: "/revenue",
      icon: TrendingUp
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: CreditCard
    },
    {
      title: "Personnel",
      href: "/personnel",
      icon: Users
    },
    {
      title: "Cash Flow",
      href: "/cash-flow",
      icon: LineChart
    },
    {
      title: "Projections",
      href: "/projections",
      icon: CandlestickChart
    },
    {
      title: "Scenarios",
      href: "/scenarios",
      icon: LineChart
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileBarChart
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              FinanceForge
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  (item.exact ? location === item.href : location.startsWith(item.href))
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
import React from "react";
import { Link, useLocation } from "wouter";
import { MaterialIcon } from "../ui/ui-icons";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: string;
  label: string;
  path: string;
}

interface SidebarProps {
  activeWorkspace: {
    id: number;
    name: string;
  } | null;
  lastSynced?: Date;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeWorkspace, lastSynced }) => {
  const [location] = useLocation();

  const sidebarItems: SidebarItem[] = [
    { icon: "dashboard", label: "Overview", path: "/" },
    { icon: "attach_money", label: "Revenue", path: "/revenue" },
    { icon: "account_balance_wallet", label: "Expenses", path: "/expenses" },
    { icon: "people", label: "Personnel", path: "/personnel" },
    { icon: "payments", label: "Payroll", path: "/payroll" },
    { icon: "trending_up", label: "Projections", path: "/projections" },
    { icon: "show_chart", label: "Scenarios", path: "/scenarios" },
    { icon: "assignment", label: "Reports", path: "/reports" },
    { icon: "settings", label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-16 md:w-64 bg-white border-r border-neutral-light flex-shrink-0">
      <div className="h-full flex flex-col">
        {activeWorkspace && (
          <div className="p-4 hidden md:block">
            <div className="text-sm font-semibold text-neutral-dark mb-1">YOUR WORKSPACE</div>
            <div className="text-base font-medium text-neutral-darker">
              {activeWorkspace.name}
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul>
            {sidebarItems.map((item) => (
              <li className="px-4 py-2" key={item.path}>
                <Link href={item.path}>
                  <a
                    className={cn(
                      "flex items-center px-2 py-2 rounded-md",
                      location === item.path
                        ? "sidebar-item active text-primary" 
                        : "sidebar-item text-neutral-dark hover:bg-blue-50"
                    )}
                  >
                    <MaterialIcon 
                      name={item.icon} 
                      className={cn(
                        "mr-3",
                        location === item.path ? "text-primary" : "text-neutral-dark"
                      )} 
                    />
                    <span className={cn(
                      "font-medium hidden md:inline",
                      location === item.path ? "text-primary" : "text-neutral-dark"
                    )}>
                      {item.label}
                    </span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-light">
          <div className="flex items-center">
            <MaterialIcon name="sync" className="text-neutral-dark mr-3" />
            <span className="text-neutral-dark text-sm hidden md:inline">
              {lastSynced 
                ? `Last synced: ${getTimeSince(lastSynced)}`
                : "Not synced yet"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Helper function to get relative time
function getTimeSince(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

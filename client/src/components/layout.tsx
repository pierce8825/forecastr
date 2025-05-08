import React from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Layers, 
  PieChart, 
  Settings,
  Home,
  Menu,
  X
} from "lucide-react";

// Navigation items for the sidebar
const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Revenue", href: "/revenue", icon: TrendingUp },
  { name: "Expenses", href: "/expenses", icon: DollarSign },
  { name: "Personnel", href: "/personnel", icon: Users },
  { name: "Cash Flow", href: "/cash-flow", icon: BarChart2 },
  { name: "Projections", href: "/projections", icon: Layers },
  { name: "Scenarios", href: "/scenarios", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Link to="/">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">FinanceForge</span>
          </Link>
        </div>
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)] lg:h-screen">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow border-r pt-5 bg-card overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <Link to="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">FinanceForge</span>
              </Link>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                    >
                      <a
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md
                          ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                        `}
                      >
                        <Icon 
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t p-4">
              <div className="flex items-center">
                <div className="h-9 w-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <span className="text-lg font-medium">D</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Demo User</p>
                  <p className="text-xs text-muted-foreground">demo@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 flex z-40">
            <div 
              className="fixed inset-0 bg-black/30" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 mb-5">
                  <Link href="/">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">FinanceForge</span>
                  </Link>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <a
                          className={`
                            group flex items-center px-2 py-2 text-sm font-medium rounded-md
                            ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                          `}
                        >
                          <Icon 
                            className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} 
                            aria-hidden="true" 
                          />
                          {item.name}
                        </a>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t p-4">
                <div className="flex items-center">
                  <div className="h-9 w-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    <span className="text-lg font-medium">D</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Demo User</p>
                    <p className="text-xs text-muted-foreground">demo@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
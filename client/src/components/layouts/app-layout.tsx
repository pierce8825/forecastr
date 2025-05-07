import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign,
  Users,
  TrendingDown,
  FileBarChart,
  Settings as SettingsIcon,
  FileText,
  LogOut,
  Menu,
  BellRing,
  Share2,
  Save,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items configuration
  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/revenue", label: "Revenue", icon: <TrendingUp className="mr-3 h-5 w-5" /> },
    { path: "/expenses", label: "Expenses", icon: <DollarSign className="mr-3 h-5 w-5" /> },
    { path: "/personnel", label: "Personnel", icon: <Users className="mr-3 h-5 w-5" /> },
    { path: "/cash-flow", label: "Cash Flow", icon: <TrendingDown className="mr-3 h-5 w-5" /> },
    { path: "/reports", label: "Reports", icon: <FileBarChart className="mr-3 h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon className="mr-3 h-5 w-5" /> }
  ];

  const recentModels = [
    { name: "2023 Growth Plan", path: "/" },
    { name: "Series A Pitch", path: "/" },
    { name: "Q2 Budget Review", path: "/" }
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="bg-white w-64 border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-primary">FinanceForge</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> New Forecast
            </Button>
          </div>
          
          <div className="px-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link href={item.path} 
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === item.path 
                      ? "bg-blue-50 text-primary" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="px-2 mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Models</h3>
            <div className="mt-2 space-y-1">
              {recentModels.map((model, index) => (
                <div key={index}>
                  <Link 
                    href={model.path}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="mr-3 h-5 w-5 text-gray-500" />
                    {model.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Smith</p>
              <p className="text-xs text-gray-500">john@startup.com</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-600">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[80%] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-primary">FinanceForge</h1>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-4">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> New Forecast
                </Button>
              </div>
              
              <div className="px-2 space-y-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    <Link 
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location === item.path 
                          ? "bg-blue-50 text-primary" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="px-2 mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Models</h3>
                <div className="mt-2 space-y-1">
                  {recentModels.map((model, index) => (
                    <div key={index}>
                      <Link 
                        href={model.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="mr-3 h-5 w-5 text-gray-500" />
                        {model.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">John Smith</p>
                  <p className="text-xs text-gray-500">john@startup.com</p>
                </div>
                <button className="ml-auto text-gray-400 hover:text-gray-600">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center md:hidden">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </div>
            
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {navItems.find(item => item.path === location)?.label || "Financial Dashboard"}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <BellRing className="h-5 w-5 text-gray-500" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
              <Button size="sm">
                <Save className="mr-1.5 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        {children}
      </div>
    </div>
  );
};

export default AppLayout;

import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Users, BarChart3, FileText, UserCheck, PieChart, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, current: location === "/" },
    { name: "Employees", href: "/employees", icon: Users, current: location === "/employees" },
    { name: "Payslips", href: "/payslips", icon: FileText, current: location === "/payslips" },
    { name: "Roles", href: "/roles", icon: UserCheck, current: location === "/roles" },
    { name: "Reports", href: "/reports", icon: PieChart, current: location === "/reports" },
    { name: "My Portal", href: "/portal", icon: Users, current: location === "/portal" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HR Manager</h1>
              <p className="text-sm text-gray-500">Employee System</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                    item.current
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50",
                    item.name === "My Portal" && "border-t border-gray-200 mt-2 pt-4"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AU</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">
                {location === "/portal" ? "Employee Portal" : "System Administrator"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Users, Briefcase, Clock, DollarSign, Plus, FileText, BarChart, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";

interface Stats {
  totalEmployees: number;
  fullTimeEmployees: number;
  partTimeEmployees: number;
  monthlyPayroll: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const quickActions = [
    {
      title: "Add New Employee",
      description: "Add a new employee to the system",
      icon: UserPlus,
      color: "bg-primary",
      hoverColor: "hover:bg-blue-700",
      textColor: "text-white",
      action: () => setLocation("/employees"),
    },
    {
      title: "Generate Payslips",
      description: "Generate payslips for employees",
      icon: FileText,
      color: "border border-gray-300",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-700",
      action: () => setLocation("/payslips"),
    },
    {
      title: "View Reports",
      description: "View detailed HR reports",
      icon: BarChart,
      color: "border border-gray-300",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-700",
      action: () => setLocation("/reports"),
    },
    {
      title: "Manage Roles",
      description: "Manage employee roles and permissions",
      icon: Users,
      color: "border border-gray-300",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-700",
      action: () => setLocation("/roles"),
    },
  ];

  const recentActivities = [
    {
      icon: Plus,
      color: "bg-success",
      title: "New employee added",
      description: "Sarah Johnson - Full-Time Developer",
      time: "2 hours ago",
    },
    {
      icon: FileText,
      color: "bg-primary",
      title: "Payslip generated",
      description: "March 2024 payroll processed",
      time: "5 hours ago",
    },
    {
      icon: Users,
      color: "bg-warning",
      title: "Employee updated",
      description: "Mike Chen role changed to Senior Developer",
      time: "1 day ago",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of your HR management system</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your HR management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Full-Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.fullTimeEmployees || 0}</p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  8% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Part-Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.partTimeEmployees || 0}</p>
                <p className="text-sm text-warning flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyPayroll || 0)}
                </p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  15% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.action}
                    className={`w-full flex items-center justify-between p-4 ${action.color} ${action.textColor} ${action.hoverColor} transition-colors h-auto`}
                    variant="outline"
                  >
                    <span className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      {action.title}
                    </span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { BarChart, Users, Building, TrendingUp, FileText, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  lastGenerated: string;
  color: string;
}

export default function Reports() {
  const { toast } = useToast();

  const reports: ReportCard[] = [
    {
      id: "payroll",
      title: "Payroll Report",
      description: "Monthly payroll summary and breakdown",
      icon: BarChart,
      lastGenerated: "March 31, 2024",
      color: "bg-blue-100 text-primary",
    },
    {
      id: "employee",
      title: "Employee Report",
      description: "Employee demographics and statistics",
      icon: Users,
      lastGenerated: "March 28, 2024",
      color: "bg-green-100 text-success",
    },
    {
      id: "department",
      title: "Department Report",
      description: "Department-wise employee distribution",
      icon: Building,
      lastGenerated: "March 25, 2024",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "performance",
      title: "Performance Report",
      description: "Employee performance metrics and reviews",
      icon: TrendingUp,
      lastGenerated: "March 20, 2024",
      color: "bg-yellow-100 text-warning",
    },
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Employee attendance and time tracking",
      icon: FileText,
      lastGenerated: "March 18, 2024",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "analytics",
      title: "HR Analytics",
      description: "Comprehensive HR metrics and insights",
      icon: PieChart,
      lastGenerated: "March 15, 2024",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const handleGenerateReport = (reportId: string, reportTitle: string) => {
    toast({
      title: "Report Generation Started",
      description: `${reportTitle} is being generated. You will be notified when it's ready.`,
    });
    
    // Here you would typically make an API call to generate the report
    // For now, we'll just show a toast notification
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports</h2>
        <p className="text-gray-600">Generate and view detailed HR reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          
          return (
            <Card 
              key={report.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-primary/20"
              onClick={() => handleGenerateReport(report.id, report.title)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {report.description}
                </p>
                <p className="text-xs text-gray-500">
                  Last generated: {report.lastGenerated}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-12">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Report Features</h4>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Automated data collection and analysis
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Customizable date ranges and filters
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Export to PDF, Excel, and CSV formats
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Real-time data synchronization
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Scheduled Reports</h4>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mr-2"></div>
                    Monthly payroll reports (auto-generated)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mr-2"></div>
                    Weekly attendance summaries
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mr-2"></div>
                    Quarterly performance reviews
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mr-2"></div>
                    Annual HR analytics dashboard
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

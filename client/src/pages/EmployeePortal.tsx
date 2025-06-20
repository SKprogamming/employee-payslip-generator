import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Save, Eye, FileText, Calendar, Phone, Mail, Building, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import EmployeeTimeEntry from "@/components/EmployeeTimeEntry";
import type { EmployeeWithRole, Role } from "@shared/schema";

// Employee self-service form schema
const employeeUpdateSchema = z.object({
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  personalNotes: z.string().optional(),
});

type EmployeeUpdateData = z.infer<typeof employeeUpdateSchema>;

// Mock current employee - in a real app this would come from authentication
const CURRENT_EMPLOYEE_ID = 1;

export default function EmployeePortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'payslips' | 'timesheet'>('profile');

  const { data: employees = [] } = useQuery<EmployeeWithRole[]>({
    queryKey: ["/api/employees"],
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Find current employee (in real app, this would be based on auth)
  const currentEmployee = employees.find(emp => emp.id === CURRENT_EMPLOYEE_ID) || employees[0];

  const form = useForm<EmployeeUpdateData>({
    resolver: zodResolver(employeeUpdateSchema),
    defaultValues: {
      phone: "",
      emergencyContact: "",
      address: "",
      personalNotes: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EmployeeUpdateData) => {
      // In a real app, this would update employee personal info
      return { success: true, data };
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  if (!currentEmployee) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Profile Found</h3>
          <p className="text-gray-600">Please contact HR to set up your employee profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {getInitials(currentEmployee.firstName, currentEmployee.lastName)}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {currentEmployee.firstName}
            </h2>
            <p className="text-gray-600">
              {currentEmployee.role.title} • {currentEmployee.department}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'payslips', label: 'My Payslips', icon: FileText },
            { id: 'timesheet', label: 'Time Tracking', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input value={currentEmployee.firstName} disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input value={currentEmployee.lastName} disabled />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input value={currentEmployee.email} disabled />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your phone number" 
                              {...field} 
                              value={field.value || currentEmployee.phone || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact name and phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your home address" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any personal notes or preferences"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Employee Quick Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-600 capitalize">{currentEmployee.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Role</p>
                    <p className="text-sm text-gray-600">{currentEmployee.role.title}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-600">{formatDate(currentEmployee.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Employment Type</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {currentEmployee.type === 'full-time' ? 'Full-Time' : 'Part-Time'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-success capitalize">{currentEmployee.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentEmployee.role.responsibilities.slice(0, 4).map((responsibility, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2"></div>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <Card>
          <CardHeader>
            <CardTitle>My Payslips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No payslips available yet.</p>
              <p className="text-sm">Payslips will appear here once they are generated by HR.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timesheet Tab */}
      {activeTab === 'timesheet' && <EmployeeTimeEntry />}
    </div>
  );
}
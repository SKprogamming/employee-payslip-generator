import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertEmployeeSchema } from "@shared/schema";
import type { EmployeeWithRole, Role } from "@shared/schema";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: EmployeeWithRole | null;
}

const formSchema = insertEmployeeSchema.extend({
  salary: z.string().min(1, "Salary is required"),
  startDate: z.string().min(1, "Start date is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const { toast } = useToast();
  const isEditing = !!employee;

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    enabled: isOpen,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "full-time",
      department: "",
      roleId: 0,
      salary: "",
      startDate: "",
      status: "active",
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        roleId: parseInt(data.roleId.toString()),
        startDate: new Date(data.startDate),
      };
      
      if (isEditing) {
        return await apiRequest("PUT", `/api/employees/${employee.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/employees", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: isEditing ? "Employee updated successfully" : "Employee added successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (employee && isOpen) {
      const startDate = new Date(employee.startDate);
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || "",
        type: employee.type,
        department: employee.department,
        roleId: employee.roleId,
        salary: employee.salary,
        startDate: startDate.toISOString().split('T')[0],
        status: employee.status,
      });
    } else if (!isEditing && isOpen) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        type: "full-time",
        department: "engineering",
        roleId: 0,
        salary: "",
        startDate: "",
        status: "active",
      });
    }
  }, [employee, isOpen, isEditing, form]);

  const onSubmit = (data: FormData) => {
    createEmployeeMutation.mutate(data);
  };

  const selectedType = form.watch("type");
  const selectedRole = roles.find(role => role.id === form.watch("roleId"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.title} - {role.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === 'full-time' ? 'Annual Salary *' : 'Hourly Rate *'}
                  </FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="rounded-l-none"
                        placeholder={selectedType === 'full-time' ? 'Annual salary' : 'Hourly rate'}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    {selectedType === 'full-time' 
                      ? 'Enter annual salary for full-time employee'
                      : 'Enter hourly rate for part-time employee'
                    }
                    {selectedRole && (
                      <span className="block mt-1">
                        Salary range for this role: ${selectedRole.minSalary} - ${selectedRole.maxSalary}
                        {selectedType === 'part-time' ? '/hour' : ''}
                      </span>
                    )}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update Employee" : "Add Employee")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

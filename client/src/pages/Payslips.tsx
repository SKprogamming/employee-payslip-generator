import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Eye, Download, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateRange, getInitials } from "@/lib/utils";
import PayslipPreview from "@/components/PayslipPreview";
import type { PayslipWithEmployee, EmployeeWithRole } from "@shared/schema";

interface PayslipCalculation {
  basePay: number;
  overtimePay: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  hoursWorked: number;
  overtimeHours: number;
}

export default function Payslips() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [payPeriodFrom, setPayPeriodFrom] = useState("");
  const [payPeriodTo, setPayPeriodTo] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [deductions, setDeductions] = useState("");
  const [calculationResult, setCalculationResult] = useState<PayslipCalculation | null>(null);
  const { toast } = useToast();

  const { data: employees = [] } = useQuery<EmployeeWithRole[]>({
    queryKey: ["/api/employees"],
  });

  const { data: payslips = [], isLoading } = useQuery<PayslipWithEmployee[]>({
    queryKey: ["/api/payslips"],
  });

  const calculatePayslipMutation = useMutation({
    mutationFn: async (data: {
      employeeId: number;
      hoursWorked: number;
      overtimeHours: number;
      deductions: number;
    }) => {
      const response = await apiRequest("POST", "/api/payslips/calculate", data);
      return response.json();
    },
    onSuccess: (result) => {
      setCalculationResult(result);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate payslip",
        variant: "destructive",
      });
    },
  });

  const generatePayslipMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/payslips", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payslips"] });
      toast({ title: "Payslip generated successfully" });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate payslip",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedEmployee("");
    setPayPeriodFrom("");
    setPayPeriodTo("");
    setHoursWorked("");
    setOvertimeHours("");
    setDeductions("");
    setCalculationResult(null);
  };

  const handleCalculate = () => {
    if (!selectedEmployee || !hoursWorked || !payPeriodFrom || !payPeriodTo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    calculatePayslipMutation.mutate({
      employeeId: parseInt(selectedEmployee),
      hoursWorked: parseFloat(hoursWorked),
      overtimeHours: parseFloat(overtimeHours || "0"),
      deductions: parseFloat(deductions || "0"),
    });
  };

  const handleGenerate = () => {
    if (!calculationResult || !selectedEmployee) return;

    generatePayslipMutation.mutate({
      employeeId: parseInt(selectedEmployee),
      payPeriodFrom: new Date(payPeriodFrom),
      payPeriodTo: new Date(payPeriodTo),
      hoursWorked: calculationResult.hoursWorked.toString(),
      overtimeHours: calculationResult.overtimeHours.toString(),
      basePay: calculationResult.basePay.toString(),
      overtimePay: calculationResult.overtimePay.toString(),
      deductions: calculationResult.deductions.toString(),
      grossPay: calculationResult.grossPay.toString(),
      netPay: calculationResult.netPay.toString(),
      status: "generated",
    });
  };

  const selectedEmployeeData = employees.find(emp => emp.id.toString() === selectedEmployee);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payslips</h2>
          <p className="text-gray-600">Generate and manage employee payslips</p>
        </div>
      </div>

      {/* Payslip Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Payslip</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.firstName} {employee.lastName} - {employee.role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period From</label>
                  <Input
                    type="date"
                    value={payPeriodFrom}
                    onChange={(e) => setPayPeriodFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period To</label>
                  <Input
                    type="date"
                    value={payPeriodTo}
                    onChange={(e) => setPayPeriodTo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked</label>
                  <Input
                    type="number"
                    placeholder="160"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                  />
                  {selectedEmployeeData?.type === 'full-time' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Standard full-time hours: 160/month
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Hours</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deductions</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full"
                disabled={calculatePayslipMutation.isPending}
              >
                {calculatePayslipMutation.isPending ? "Calculating..." : "Calculate Payslip"}
              </Button>

              {calculationResult && (
                <Button 
                  onClick={handleGenerate}
                  className="w-full"
                  variant="outline"
                  disabled={generatePayslipMutation.isPending}
                >
                  {generatePayslipMutation.isPending ? "Generating..." : "Generate & Save Payslip"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            {calculationResult && selectedEmployeeData ? (
              <PayslipPreview
                employee={selectedEmployeeData}
                calculation={calculationResult}
                payPeriod={`${payPeriodFrom} to ${payPeriodTo}`}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                <div className="text-4xl mb-4">💰</div>
                <p>Select an employee and fill in the details to preview the payslip</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payslip History */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payslips</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium text-xs">
                              {getInitials(payslip.employee.firstName, payslip.employee.lastName)}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {payslip.employee.firstName} {payslip.employee.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {formatDateRange(payslip.payPeriodFrom, payslip.payPeriodTo)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {formatCurrency(payslip.grossPay)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {formatCurrency(payslip.deductions)}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {formatCurrency(payslip.netPay)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {payslips.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No payslips generated yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

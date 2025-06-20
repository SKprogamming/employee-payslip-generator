import { formatCurrency } from "@/lib/utils";
import type { EmployeeWithRole } from "@shared/schema";

interface PayslipCalculation {
  basePay: number;
  overtimePay: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  hoursWorked: number;
  overtimeHours: number;
}

interface PayslipPreviewProps {
  employee: EmployeeWithRole;
  calculation: PayslipCalculation;
  payPeriod: string;
}

export default function PayslipPreview({ employee, calculation, payPeriod }: PayslipPreviewProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="border-b border-gray-200 pb-3">
        <h4 className="font-semibold text-gray-900">Payslip Preview</h4>
        <p className="text-sm text-gray-600">{employee.firstName} {employee.lastName}</p>
        <p className="text-xs text-gray-500">{payPeriod}</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Hours Worked:</span>
          <span>{calculation.hoursWorked}</span>
        </div>
        {calculation.overtimeHours > 0 && (
          <div className="flex justify-between">
            <span>Overtime Hours:</span>
            <span>{calculation.overtimeHours}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Base Pay:</span>
          <span>{formatCurrency(calculation.basePay)}</span>
        </div>
        {calculation.overtimePay > 0 && (
          <div className="flex justify-between">
            <span>Overtime Pay:</span>
            <span>{formatCurrency(calculation.overtimePay)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium">
          <span>Gross Pay:</span>
          <span>{formatCurrency(calculation.grossPay)}</span>
        </div>
        {calculation.deductions > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Deductions:</span>
            <span>-{formatCurrency(calculation.deductions)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
          <span>Net Pay:</span>
          <span className="text-green-600">{formatCurrency(calculation.netPay)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
        <p><strong>Employee Type:</strong> {employee.type}</p>
        <p><strong>Role:</strong> {employee.role.title}</p>
        <p><strong>Department:</strong> {employee.department}</p>
      </div>
    </div>
  );
}

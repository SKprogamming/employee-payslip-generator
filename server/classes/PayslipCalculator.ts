import { BaseEmployee, FullTimeEmployee, PartTimeEmployee } from "./Employee";

// Abstract payslip calculator demonstrating abstraction
export abstract class PayslipCalculator {
  protected employee: BaseEmployee;

  constructor(employee: BaseEmployee) {
    this.employee = employee;
  }

  // Template method pattern - defines the algorithm structure
  calculatePayslip(
    hoursWorked: number,
    overtimeHours: number = 0,
    deductions: number = 0
  ): PayslipResult {
    const basePay = this.calculateBasePay(hoursWorked);
    const overtimePay = this.calculateOvertimePay(overtimeHours);
    const grossPay = basePay + overtimePay;
    const netPay = grossPay - deductions;

    return {
      basePay,
      overtimePay,
      grossPay,
      deductions,
      netPay,
      hoursWorked,
      overtimeHours,
    };
  }

  // Abstract methods to be implemented by subclasses
  protected abstract calculateBasePay(hoursWorked: number): number;
  protected abstract calculateOvertimePay(overtimeHours: number): number;
}

// Full-time payslip calculator
export class FullTimePayslipCalculator extends PayslipCalculator {
  private fullTimeEmployee: FullTimeEmployee;

  constructor(employee: FullTimeEmployee) {
    super(employee);
    this.fullTimeEmployee = employee;
  }

  protected calculateBasePay(hoursWorked: number): number {
    // For full-time employees, pay is based on monthly salary regardless of hours
    // (assuming standard 160 hours per month)
    return this.fullTimeEmployee.calculateMonthlySalary();
  }

  protected calculateOvertimePay(overtimeHours: number): number {
    if (overtimeHours <= 0) return 0;
    
    // Overtime rate is 1.5x the hourly equivalent
    const hourlyRate = this.fullTimeEmployee.getAnnualSalary() / (52 * 40); // Annual salary / (weeks * hours per week)
    return overtimeHours * hourlyRate * 1.5;
  }
}

// Part-time payslip calculator
export class PartTimePayslipCalculator extends PayslipCalculator {
  private partTimeEmployee: PartTimeEmployee;

  constructor(employee: PartTimeEmployee) {
    super(employee);
    this.partTimeEmployee = employee;
  }

  protected calculateBasePay(hoursWorked: number): number {
    return this.partTimeEmployee.calculatePay(hoursWorked);
  }

  protected calculateOvertimePay(overtimeHours: number): number {
    if (overtimeHours <= 0) return 0;
    
    // Overtime rate is 1.5x the regular hourly rate
    return overtimeHours * this.partTimeEmployee.getHourlyRate() * 1.5;
  }
}

// Factory for creating appropriate calculator - demonstrates Factory pattern
export class PayslipCalculatorFactory {
  static createCalculator(employee: BaseEmployee): PayslipCalculator {
    if (employee instanceof FullTimeEmployee) {
      return new FullTimePayslipCalculator(employee);
    } else if (employee instanceof PartTimeEmployee) {
      return new PartTimePayslipCalculator(employee);
    } else {
      throw new Error("Unknown employee type");
    }
  }
}

// Result interface
export interface PayslipResult {
  basePay: number;
  overtimePay: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  hoursWorked: number;
  overtimeHours: number;
}

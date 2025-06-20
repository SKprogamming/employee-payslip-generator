import { Role } from "./Role";

// Abstract base class demonstrating abstraction principle
export abstract class BaseEmployee {
  protected id: number;
  protected firstName: string;
  protected lastName: string;
  protected email: string;
  protected role: Role;
  protected startDate: Date;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    startDate: Date
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.startDate = startDate;
  }

  // Abstract methods to be implemented by subclasses
  abstract calculateMonthlySalary(): number;
  abstract getEmployeeType(): string;
  abstract isEligibleForBenefits(): boolean;

  // Common methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getRole(): Role {
    return this.role;
  }

  getId(): number {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }
}

// Full-time employee class demonstrating inheritance
export class FullTimeEmployee extends BaseEmployee {
  private annualSalary: number;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    startDate: Date,
    annualSalary: number
  ) {
    super(id, firstName, lastName, email, role, startDate);
    this.annualSalary = annualSalary;
  }

  calculateMonthlySalary(): number {
    return this.annualSalary / 12;
  }

  getEmployeeType(): string {
    return "full-time";
  }

  isEligibleForBenefits(): boolean {
    return true; // Full-time employees are eligible for benefits
  }

  getAnnualSalary(): number {
    return this.annualSalary;
  }
}

// Part-time employee class demonstrating inheritance
export class PartTimeEmployee extends BaseEmployee {
  private hourlyRate: number;
  private defaultHoursPerMonth: number;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    startDate: Date,
    hourlyRate: number,
    defaultHoursPerMonth: number = 80
  ) {
    super(id, firstName, lastName, email, role, startDate);
    this.hourlyRate = hourlyRate;
    this.defaultHoursPerMonth = defaultHoursPerMonth;
  }

  calculateMonthlySalary(): number {
    return this.hourlyRate * this.defaultHoursPerMonth;
  }

  getEmployeeType(): string {
    return "part-time";
  }

  isEligibleForBenefits(): boolean {
    return false; // Part-time employees are not eligible for full benefits
  }

  getHourlyRate(): number {
    return this.hourlyRate;
  }

  calculatePay(hoursWorked: number): number {
    return this.hourlyRate * hoursWorked;
  }
}

// Factory class demonstrating Factory pattern and dependency injection
export class EmployeeFactory {
  static createEmployee(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    type: string,
    role: Role,
    startDate: Date,
    salary: number
  ): BaseEmployee {
    switch (type) {
      case "full-time":
        return new FullTimeEmployee(id, firstName, lastName, email, role, startDate, salary);
      case "part-time":
        return new PartTimeEmployee(id, firstName, lastName, email, role, startDate, salary);
      default:
        throw new Error(`Unknown employee type: ${type}`);
    }
  }
}

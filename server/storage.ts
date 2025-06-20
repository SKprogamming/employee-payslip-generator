import { roles, employees, payslips, type Role, type Employee, type Payslip, type InsertRole, type InsertEmployee, type InsertPayslip, type EmployeeWithRole, type PayslipWithEmployee } from "@shared/schema";

export interface IStorage {
  // Role methods
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Employee methods
  getEmployees(): Promise<EmployeeWithRole[]>;
  getEmployee(id: number): Promise<EmployeeWithRole | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Payslip methods
  getPayslips(): Promise<PayslipWithEmployee[]>;
  getPayslip(id: number): Promise<PayslipWithEmployee | undefined>;
  getPayslipsByEmployee(employeeId: number): Promise<Payslip[]>;
  createPayslip(payslip: InsertPayslip): Promise<Payslip>;
  updatePayslip(id: number, payslip: Partial<InsertPayslip>): Promise<Payslip | undefined>;
  deletePayslip(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<{
    totalEmployees: number;
    fullTimeEmployees: number;
    partTimeEmployees: number;
    monthlyPayroll: number;
  }>;
}

export class MemStorage implements IStorage {
  private roles: Map<number, Role>;
  private employees: Map<number, Employee>;
  private payslips: Map<number, Payslip>;
  private currentRoleId: number;
  private currentEmployeeId: number;
  private currentPayslipId: number;

  constructor() {
    this.roles = new Map();
    this.employees = new Map();
    this.payslips = new Map();
    this.currentRoleId = 1;
    this.currentEmployeeId = 1;
    this.currentPayslipId = 1;

    // Initialize with some sample roles
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample roles
    const sampleRoles: InsertRole[] = [
      {
        title: "Senior Developer",
        description: "Responsible for developing and maintaining software applications",
        department: "engineering",
        level: 3,
        minSalary: "75000",
        maxSalary: "95000",
        responsibilities: ["Code development and review", "Technical documentation", "Mentoring junior developers"]
      },
      {
        title: "Product Manager",
        description: "Oversees product development and strategy",
        department: "marketing",
        level: 4,
        minSalary: "85000",
        maxSalary: "110000",
        responsibilities: ["Product roadmap planning", "Stakeholder management", "Market research"]
      },
      {
        title: "UI Designer",
        description: "Creates user interface designs and prototypes",
        department: "engineering",
        level: 2,
        minSalary: "25",
        maxSalary: "45",
        responsibilities: ["UI/UX design", "Prototyping", "Design systems"]
      }
    ];

    sampleRoles.forEach(role => {
      const id = this.currentRoleId++;
      this.roles.set(id, { ...role, id, responsibilities: [...role.responsibilities] });
    });

    // Sample employees
    const sampleEmployees: InsertEmployee[] = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@company.com",
        phone: "+1-555-0123",
        type: "full-time",
        department: "engineering",
        roleId: 1,
        salary: "85000",
        startDate: new Date("2023-01-15"),
        status: "active"
      },
      {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.chen@company.com",
        phone: "+1-555-0124",
        type: "full-time",
        department: "marketing",
        roleId: 2,
        salary: "95000",
        startDate: new Date("2022-08-20"),
        status: "active"
      },
      {
        firstName: "Alex",
        lastName: "Rivera",
        email: "alex.rivera@company.com",
        phone: "+1-555-0125",
        type: "part-time",
        department: "engineering",
        roleId: 3,
        salary: "35",
        startDate: new Date("2023-06-10"),
        status: "active"
      }
    ];

    sampleEmployees.forEach(employee => {
      const id = this.currentEmployeeId++;
      this.employees.set(id, {
        ...employee,
        id,
        status: employee.status || "active",
        phone: employee.phone || null,
        createdAt: new Date()
      });
    });
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = this.currentRoleId++;
    const role: Role = { 
      ...insertRole, 
      id,
      responsibilities: [...insertRole.responsibilities]
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: number, insertRole: Partial<InsertRole>): Promise<Role | undefined> {
    const existing = this.roles.get(id);
    if (!existing) return undefined;

    const updated: Role = { 
      ...existing, 
      ...insertRole,
      responsibilities: insertRole.responsibilities ? [...insertRole.responsibilities] : existing.responsibilities
    };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: number): Promise<boolean> {
    return this.roles.delete(id);
  }

  // Employee methods
  async getEmployees(): Promise<EmployeeWithRole[]> {
    const employeeList = Array.from(this.employees.values());
    const result: EmployeeWithRole[] = [];

    for (const employee of employeeList) {
      const role = this.roles.get(employee.roleId);
      if (role) {
        result.push({ ...employee, role });
      }
    }

    return result;
  }

  async getEmployee(id: number): Promise<EmployeeWithRole | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const role = this.roles.get(employee.roleId);
    if (!role) return undefined;

    return { ...employee, role };
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const employee: Employee = { 
      ...insertEmployee, 
      id,
      status: insertEmployee.status || "active",
      phone: insertEmployee.phone || null,
      createdAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, insertEmployee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated: Employee = { ...existing, ...insertEmployee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Payslip methods
  async getPayslips(): Promise<PayslipWithEmployee[]> {
    const payslipList = Array.from(this.payslips.values());
    const result: PayslipWithEmployee[] = [];

    for (const payslip of payslipList) {
      const employee = this.employees.get(payslip.employeeId);
      if (employee) {
        result.push({ ...payslip, employee });
      }
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPayslip(id: number): Promise<PayslipWithEmployee | undefined> {
    const payslip = this.payslips.get(id);
    if (!payslip) return undefined;

    const employee = this.employees.get(payslip.employeeId);
    if (!employee) return undefined;

    return { ...payslip, employee };
  }

  async getPayslipsByEmployee(employeeId: number): Promise<Payslip[]> {
    return Array.from(this.payslips.values()).filter(p => p.employeeId === employeeId);
  }

  async createPayslip(insertPayslip: InsertPayslip): Promise<Payslip> {
    const id = this.currentPayslipId++;
    const payslip: Payslip = { 
      ...insertPayslip, 
      id,
      status: insertPayslip.status || "generated",
      overtimeHours: insertPayslip.overtimeHours || "0",
      overtimePay: insertPayslip.overtimePay || "0",
      deductions: insertPayslip.deductions || "0",
      createdAt: new Date()
    };
    this.payslips.set(id, payslip);
    return payslip;
  }

  async updatePayslip(id: number, insertPayslip: Partial<InsertPayslip>): Promise<Payslip | undefined> {
    const existing = this.payslips.get(id);
    if (!existing) return undefined;

    const updated: Payslip = { ...existing, ...insertPayslip };
    this.payslips.set(id, updated);
    return updated;
  }

  async deletePayslip(id: number): Promise<boolean> {
    return this.payslips.delete(id);
  }

  // Stats methods
  async getStats(): Promise<{
    totalEmployees: number;
    fullTimeEmployees: number;
    partTimeEmployees: number;
    monthlyPayroll: number;
  }> {
    const employeeList = Array.from(this.employees.values()).filter(emp => emp.status === 'active');
    const fullTimeEmployees = employeeList.filter(emp => emp.type === 'full-time');
    const partTimeEmployees = employeeList.filter(emp => emp.type === 'part-time');

    // Calculate monthly payroll estimate
    let monthlyPayroll = 0;
    for (const employee of employeeList) {
      const salary = parseFloat(employee.salary);
      if (employee.type === 'full-time') {
        monthlyPayroll += salary / 12; // Annual to monthly
      } else {
        monthlyPayroll += salary * 80; // Assuming 80 hours per month for part-time
      }
    }

    return {
      totalEmployees: employeeList.length,
      fullTimeEmployees: fullTimeEmployees.length,
      partTimeEmployees: partTimeEmployees.length,
      monthlyPayroll: Math.round(monthlyPayroll)
    };
  }
}

export const storage = new MemStorage();

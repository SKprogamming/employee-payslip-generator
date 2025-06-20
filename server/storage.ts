import { roles, employees, payslips, type Role, type Employee, type Payslip, type InsertRole, type InsertEmployee, type InsertPayslip, type EmployeeWithRole, type PayslipWithEmployee } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

// Legacy in-memory storage implementation (kept for reference)
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

    // Sample employees are now seeded via database seed script

    // Note: Sample employees are now seeded via database seed script
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role || undefined;
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db
      .insert(roles)
      .values(insertRole)
      .returning();
    return role;
  }

  async updateRole(id: number, insertRole: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db
      .update(roles)
      .set(insertRole)
      .where(eq(roles.id, id))
      .returning();
    return role || undefined;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getEmployees(): Promise<EmployeeWithRole[]> {
    const employeeList = await db
      .select()
      .from(employees)
      .leftJoin(roles, eq(employees.roleId, roles.id));
    
    return employeeList.map(row => ({
      ...row.employees,
      role: row.roles!
    }));
  }

  async getEmployee(id: number): Promise<EmployeeWithRole | undefined> {
    const [result] = await db
      .select()
      .from(employees)
      .leftJoin(roles, eq(employees.roleId, roles.id))
      .where(eq(employees.id, id));
    
    if (!result || !result.roles) return undefined;
    
    return {
      ...result.employees,
      role: result.roles
    };
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: number, insertEmployee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set(insertEmployee)
      .where(eq(employees.id, id))
      .returning();
    return employee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPayslips(): Promise<PayslipWithEmployee[]> {
    const payslipList = await db
      .select()
      .from(payslips)
      .leftJoin(employees, eq(payslips.employeeId, employees.id))
      .orderBy(payslips.createdAt);
    
    return payslipList.map(row => ({
      ...row.payslips,
      employee: row.employees!
    }));
  }

  async getPayslip(id: number): Promise<PayslipWithEmployee | undefined> {
    const [result] = await db
      .select()
      .from(payslips)
      .leftJoin(employees, eq(payslips.employeeId, employees.id))
      .where(eq(payslips.id, id));
    
    if (!result || !result.employees) return undefined;
    
    return {
      ...result.payslips,
      employee: result.employees
    };
  }

  async getPayslipsByEmployee(employeeId: number): Promise<Payslip[]> {
    return await db.select().from(payslips).where(eq(payslips.employeeId, employeeId));
  }

  async createPayslip(insertPayslip: InsertPayslip): Promise<Payslip> {
    const [payslip] = await db
      .insert(payslips)
      .values(insertPayslip)
      .returning();
    return payslip;
  }

  async updatePayslip(id: number, insertPayslip: Partial<InsertPayslip>): Promise<Payslip | undefined> {
    const [payslip] = await db
      .update(payslips)
      .set(insertPayslip)
      .where(eq(payslips.id, id))
      .returning();
    return payslip || undefined;
  }

  async deletePayslip(id: number): Promise<boolean> {
    const result = await db.delete(payslips).where(eq(payslips.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getStats(): Promise<{
    totalEmployees: number;
    fullTimeEmployees: number;
    partTimeEmployees: number;
    monthlyPayroll: number;
  }> {
    const employeeList = await db.select().from(employees).where(eq(employees.status, 'active'));
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

export const storage = new DatabaseStorage();

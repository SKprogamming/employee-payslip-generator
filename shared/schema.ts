import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  level: integer("level").notNull(),
  minSalary: decimal("min_salary", { precision: 10, scale: 2 }).notNull(),
  maxSalary: decimal("max_salary", { precision: 10, scale: 2 }).notNull(),
  responsibilities: json("responsibilities").$type<string[]>().notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  type: text("type").notNull(), // 'full-time' or 'part-time'
  department: text("department").notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payslips = pgTable("payslips", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  payPeriodFrom: timestamp("pay_period_from").notNull(),
  payPeriodTo: timestamp("pay_period_to").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  basePay: decimal("base_pay", { precision: 10, scale: 2 }).notNull(),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0").notNull(),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("generated"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertPayslipSchema = createInsertSchema(payslips).omit({
  id: true,
  createdAt: true,
});

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Payslip = typeof payslips.$inferSelect;
export type InsertPayslip = z.infer<typeof insertPayslipSchema>;

// Extended types for API responses
export type EmployeeWithRole = Employee & {
  role: Role;
};

export type PayslipWithEmployee = Payslip & {
  employee: Employee;
};

// Relations for Drizzle ORM

export const rolesRelations = relations(roles, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  role: one(roles, {
    fields: [employees.roleId],
    references: [roles.id],
  }),
  payslips: many(payslips),
}));

export const payslipsRelations = relations(payslips, ({ one }) => ({
  employee: one(employees, {
    fields: [payslips.employeeId],
    references: [employees.id],
  }),
}));

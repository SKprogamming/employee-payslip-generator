import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRoleSchema, insertEmployeeSchema, insertPayslipSchema } from "@shared/schema";
import { EmployeeFactory } from "./classes/Employee";
import { Role } from "./classes/Role";
import { PayslipCalculatorFactory } from "./classes/PayslipCalculator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Role routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validation = insertRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid role data", errors: validation.error.errors });
      }

      const role = await storage.createRole(validation.data);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertRoleSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid role data", errors: validation.error.errors });
      }

      const role = await storage.updateRole(id, validation.data);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRole(id);
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validation = insertEmployeeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: validation.error.errors });
      }

      // Check if email already exists
      const existingEmployee = await storage.getEmployeeByEmail(validation.data.email);
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee with this email already exists" });
      }

      // Validate role exists
      const role = await storage.getRole(validation.data.roleId);
      if (!role) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      // Validate salary range for the role
      const roleObj = new Role(role.id, role.title, role.description, role.department, role.level, parseFloat(role.minSalary), parseFloat(role.maxSalary), role.responsibilities);
      if (!roleObj.isSalaryInRange(parseFloat(validation.data.salary))) {
        return res.status(400).json({ message: `Salary must be between ${role.minSalary} and ${role.maxSalary} for this role` });
      }

      const employee = await storage.createEmployee(validation.data);
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertEmployeeSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: validation.error.errors });
      }

      const employee = await storage.updateEmployee(id, validation.data);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Payslip routes
  app.get("/api/payslips", async (req, res) => {
    try {
      const payslips = await storage.getPayslips();
      res.json(payslips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payslips" });
    }
  });

  app.get("/api/payslips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payslip = await storage.getPayslip(id);
      if (!payslip) {
        return res.status(404).json({ message: "Payslip not found" });
      }
      res.json(payslip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payslip" });
    }
  });

  app.post("/api/payslips/calculate", async (req, res) => {
    try {
      const { employeeId, hoursWorked, overtimeHours = 0, deductions = 0 } = req.body;

      if (!employeeId || !hoursWorked) {
        return res.status(400).json({ message: "Employee ID and hours worked are required" });
      }

      const employeeWithRole = await storage.getEmployee(employeeId);
      if (!employeeWithRole) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Create employee object using factory pattern
      const roleObj = new Role(
        employeeWithRole.role.id,
        employeeWithRole.role.title,
        employeeWithRole.role.description,
        employeeWithRole.role.department,
        employeeWithRole.role.level,
        parseFloat(employeeWithRole.role.minSalary),
        parseFloat(employeeWithRole.role.maxSalary),
        employeeWithRole.role.responsibilities
      );

      const employee = EmployeeFactory.createEmployee(
        employeeWithRole.id,
        employeeWithRole.firstName,
        employeeWithRole.lastName,
        employeeWithRole.email,
        employeeWithRole.type,
        roleObj,
        employeeWithRole.startDate,
        parseFloat(employeeWithRole.salary)
      );

      // Use abstract payslip calculator
      const calculator = PayslipCalculatorFactory.createCalculator(employee);
      const result = calculator.calculatePayslip(
        parseFloat(hoursWorked.toString()),
        parseFloat(overtimeHours.toString()),
        parseFloat(deductions.toString())
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate payslip" });
    }
  });

  app.post("/api/payslips", async (req, res) => {
    try {
      const validation = insertPayslipSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid payslip data", errors: validation.error.errors });
      }

      const employee = await storage.getEmployee(validation.data.employeeId);
      if (!employee) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const payslip = await storage.createPayslip(validation.data);
      res.status(201).json(payslip);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payslip" });
    }
  });

  app.get("/api/employees/:id/payslips", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const payslips = await storage.getPayslipsByEmployee(employeeId);
      res.json(payslips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee payslips" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

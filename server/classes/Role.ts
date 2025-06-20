// Role class demonstrating composition pattern
export class Role {
  private id: number;
  private title: string;
  private description: string;
  private department: string;
  private level: number;
  private minSalary: number;
  private maxSalary: number;
  private responsibilities: string[];

  constructor(
    id: number,
    title: string,
    description: string,
    department: string,
    level: number,
    minSalary: number,
    maxSalary: number,
    responsibilities: string[]
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.department = department;
    this.level = level;
    this.minSalary = minSalary;
    this.maxSalary = maxSalary;
    this.responsibilities = responsibilities;
  }

  getId(): number {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getDepartment(): string {
    return this.department;
  }

  getLevel(): number {
    return this.level;
  }

  getSalaryRange(): { min: number; max: number } {
    return { min: this.minSalary, max: this.maxSalary };
  }

  getResponsibilities(): string[] {
    return [...this.responsibilities]; // Return copy to maintain encapsulation
  }

  isSalaryInRange(salary: number): boolean {
    return salary >= this.minSalary && salary <= this.maxSalary;
  }

  addResponsibility(responsibility: string): void {
    if (!this.responsibilities.includes(responsibility)) {
      this.responsibilities.push(responsibility);
    }
  }

  removeResponsibility(responsibility: string): void {
    const index = this.responsibilities.indexOf(responsibility);
    if (index > -1) {
      this.responsibilities.splice(index, 1);
    }
  }
}

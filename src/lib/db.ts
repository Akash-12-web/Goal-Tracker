import fs from 'fs';
import path from 'path';

export type UserRole = 'Employee' | 'Manager' | 'Admin';
export type UomType = 'Numeric' | '%' | 'Timeline' | 'Zero';
export type GoalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Returned';
export type ProgressStatus = 'Not Started' | 'On Track' | 'Completed';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  managerId: string | null;
}

export interface Goal {
  id: string;
  employeeId: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UomType;
  target: number | string; // string for timeline dates
  weightage: number;
  status: GoalStatus;
  isShared: boolean; // if it's pushed by Admin/Manager
}

export interface CheckIn {
  id: string;
  goalId: string;
  quarter: string; // Q1, Q2, Q3, Q4
  actualAchievement: number | string;
  status: ProgressStatus;
  checkInComment: string;
  employeeComment?: string;
}

export interface DatabaseSchema {
  users: User[];
  goals: Goal[];
  checkIns: CheckIn[];
}

const DATA_FILE = path.join(process.cwd(), 'data.json');

const defaultData: DatabaseSchema = {
  users: [
    { id: 'u1', name: 'Alice (Employee)', role: 'Employee', managerId: 'u2' },
    { id: 'u2', name: 'Bob (Manager)', role: 'Manager', managerId: 'u3' },
    { id: 'u3', name: 'Charlie (Admin)', role: 'Admin', managerId: null },
    { id: 'u4', name: 'Dave (Employee)', role: 'Employee', managerId: 'u2' },
  ],
  goals: [],
  checkIns: [],
};

export function readDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function writeDb(data: DatabaseSchema) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

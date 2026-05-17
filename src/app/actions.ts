'use server';

import { readDb, writeDb, Goal, CheckIn, UserRole, GoalStatus } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  const db = readDb();
  return db.users;
}

export async function getUser(id: string) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

export async function getTeam(managerId: string) {
  const db = readDb();
  return db.users.filter(u => u.managerId === managerId);
}

export async function getGoals(employeeId: string) {
  const db = readDb();
  return db.goals.filter(g => g.employeeId === employeeId);
}

export async function saveGoal(goalData: Omit<Goal, 'id' | 'status' | 'isShared'>, existingId?: string) {
  const db = readDb();
  let goals = [...db.goals];
  
  if (existingId) {
    const idx = goals.findIndex(g => g.id === existingId);
    if (idx >= 0) {
      if (goals[idx].status !== 'Draft' && goals[idx].status !== 'Returned') {
        throw new Error("Cannot edit goals that are already submitted or approved.");
      }
      goals[idx] = { ...goals[idx], ...goalData };
    }
  } else {
    // validation
    const employeeGoals = goals.filter(g => g.employeeId === goalData.employeeId);
    if (employeeGoals.length >= 8) {
      throw new Error("Maximum of 8 goals allowed.");
    }
    goals.push({
      id: uuidv4(),
      ...goalData,
      status: 'Draft',
      isShared: false
    });
  }
  
  writeDb({ ...db, goals });
  revalidatePath('/');
  return { success: true };
}

export async function deleteGoal(id: string) {
  const db = readDb();
  const goals = db.goals.filter(g => g.id !== id);
  writeDb({ ...db, goals });
  revalidatePath('/');
}

export async function submitGoals(employeeId: string) {
  const db = readDb();
  const employeeGoals = db.goals.filter(g => g.employeeId === employeeId);
  
  // Validation rules
  const totalWeightage = employeeGoals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeightage !== 100) {
    throw new Error(`Total weightage must be exactly 100%. Currently it is ${totalWeightage}%.`);
  }
  
  for (const g of employeeGoals) {
    if (g.weightage < 10) {
      throw new Error(`Minimum weightage per goal is 10%. Goal "${g.title}" has ${g.weightage}%.`);
    }
  }
  
  const goals = db.goals.map(g => {
    if (g.employeeId === employeeId && (g.status === 'Draft' || g.status === 'Returned')) {
      return { ...g, status: 'Submitted' as GoalStatus };
    }
    return g;
  });
  
  writeDb({ ...db, goals });
  revalidatePath('/');
  return { success: true };
}

export async function approveGoals(employeeId: string, action: 'Approve' | 'Return') {
  const db = readDb();
  const goals = db.goals.map(g => {
    if (g.employeeId === employeeId && g.status === 'Submitted') {
      return { ...g, status: (action === 'Approve' ? 'Approved' : 'Returned') as GoalStatus };
    }
    return g;
  });
  
  writeDb({ ...db, goals });
  revalidatePath('/');
  return { success: true };
}

export async function pushSharedGoal(title: string, description: string, thrustArea: string, uom: any, target: any, employeeIds: string[]) {
  const db = readDb();
  const goals = [...db.goals];
  
  for (const empId of employeeIds) {
    goals.push({
      id: uuidv4(),
      employeeId: empId,
      thrustArea,
      title,
      description,
      uom,
      target,
      weightage: 10, // default
      status: 'Draft',
      isShared: true
    });
  }
  
  writeDb({ ...db, goals });
  revalidatePath('/');
}

export async function saveCheckIn(checkInData: Omit<CheckIn, 'id'>) {
  const db = readDb();
  let checkIns = [...db.checkIns];
  
  const existingIdx = checkIns.findIndex(c => c.goalId === checkInData.goalId && c.quarter === checkInData.quarter);
  
  if (existingIdx >= 0) {
    checkIns[existingIdx] = { ...checkIns[existingIdx], ...checkInData };
  } else {
    checkIns.push({
      id: uuidv4(),
      ...checkInData
    });
  }
  
  writeDb({ ...db, checkIns });
  revalidatePath('/');
  return { success: true };
}

export async function getCheckIns(employeeId: string) {
  const db = readDb();
  const employeeGoals = db.goals.filter(g => g.employeeId === employeeId);
  const goalIds = employeeGoals.map(g => g.id);
  return db.checkIns.filter(c => goalIds.includes(c.goalId));
}

export async function getAllData() {
  return readDb();
}

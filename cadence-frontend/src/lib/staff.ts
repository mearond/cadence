import api from './api';
import type { StaffRole } from './permissions';

type AssignableRole = Exclude<StaffRole, 'owner'>;

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  title: string | null;
  preferred_language?: string;
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const response = await api.get('/staff');
  return response.data;
}

export async function createStaff(data: {
  name: string;
  email: string;
  title?: string;
  role: AssignableRole;
}): Promise<{ staff: StaffMember; temporaryPassword: string; emailSent: boolean }> {
  const response = await api.post('/staff', data);
  return response.data;
}

export async function updateStaff(
  id: number,
  data: Partial<{ name: string; title: string; role: AssignableRole }>
): Promise<StaffMember> {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
}

export interface TaskToReassign {
  id: number;
  title: string;
  event_id: number;
  event_name: string;
}

// Removes the account. Returns the unfinished tasks that were assigned to them.
export async function deleteStaff(id: number): Promise<{ name: string; tasksToReassign: TaskToReassign[] }> {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
}
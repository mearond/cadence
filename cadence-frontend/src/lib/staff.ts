import api from './api';

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
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
  role?: 'admin' | 'staff';
}): Promise<{ staff: StaffMember; temporaryPassword: string; emailSent: boolean }> {
  const response = await api.post('/staff', data);
  return response.data;
}

export async function updateStaff(
  id: number,
  data: Partial<{ name: string; title: string; role: 'admin' | 'staff' }>
): Promise<StaffMember> {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/staff/${id}`);
}
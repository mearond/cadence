import api from './api';

export interface Event {
  id: number;
  name: string;
  name_am: string | null;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  guest_count: number | null;
}

export async function fetchEvents(): Promise<Event[]> {
  const response = await api.get('/events');
  return response.data;
}

export async function createEvent(data: {
  name: string;
  nameAm?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  guestCount?: number;
}) {
  const response = await api.post('/events', data);
  return response.data;
}

export async function fetchEventById(id: string): Promise<Event> {
  const response = await api.get(`/events/${id}`);
  return response.data;
}

// Timeline
export async function fetchTimeline(eventId: string) {
  const response = await api.get(`/events/${eventId}/timeline`);
  return response.data;
}
export async function addTimelineItem(eventId: string, data: { startTime: string; endTime?: string; title: string }) {
  const response = await api.post(`/events/${eventId}/timeline`, data);
  return response.data;
}

// Budget
export async function fetchBudgetItems(eventId: string) {
  const response = await api.get(`/events/${eventId}/budget`);
  return response.data;
}
export async function fetchBudgetSummary(eventId: string) {
  const response = await api.get(`/events/${eventId}/budget/summary`);
  return response.data;
}
export async function addBudgetItem(eventId: string, data: { category: string; name: string; estimatedAmountEtb: number; actualAmountEtb: number }) {
  const response = await api.post(`/events/${eventId}/budget`, data);
  return response.data;
}

// Vendors
export async function fetchEventVendors(eventId: string) {
  const response = await api.get(`/events/${eventId}/vendors`);
  return response.data;
}
export async function fetchAllVendors() {
  const response = await api.get('/vendors');
  return response.data;
}
export async function bookVendor(eventId: string, data: { vendorId: number; contractAmountEtb: number; paymentStatus: string }) {
  const response = await api.post(`/events/${eventId}/vendors`, data);
  return response.data;
}
export interface VendorCategory {
  id: number;
  name_en: string;
  name_am: string;
}

export interface Vendor {
  id: number;
  name: string;
  category_id: number | null;
  phone: string | null;
  email: string | null;
  tin_number: string | null;
  notes: string | null;
  category_name_en?: string;
  category_name_am?: string;
}

export async function fetchVendorCategories(): Promise<VendorCategory[]> {
  const response = await api.get('/vendors/categories');
  return response.data;
}

export async function createVendor(data: {
  name: string;
  categoryId?: number;
  phone?: string;
  email?: string;
  tinNumber?: string;
  notes?: string;
}): Promise<Vendor> {
  const response = await api.post('/vendors', data);
  return response.data;
}

// Tasks
export async function fetchTasks(eventId: string) {
  const response = await api.get(`/events/${eventId}/tasks`);
  return response.data;
}
export async function addTask(eventId: string, data: { title: string; priority: string }) {
  const response = await api.post(`/events/${eventId}/tasks`, data);
  return response.data;
}
export async function addTaskCheckpoint(eventId: string, taskId: number, label: string) {
  const response = await api.post(`/events/${eventId}/tasks/${taskId}/checkpoints`, { label });
  return response.data;
}
export async function toggleTaskCheckpoint(eventId: string, taskId: number, checkpointId: number) {
  const response = await api.put(`/events/${eventId}/tasks/${taskId}/checkpoints/${checkpointId}/toggle`);
  return response.data;
}
export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`);
}
export interface ApprovalRequest {
  id: number;
  event_id: number;
  item_type: string;
  title: string;
  description: string | null;
  status: 'pending' | 'approved' | 'changes_requested';
  client_comment: string | null;
  requested_by: number;
  created_at: string;
  responded_at: string | null;
}

export async function fetchApprovals(eventId: string): Promise<ApprovalRequest[]> {
  const response = await api.get(`/events/${eventId}/approvals`);
  return response.data;
}

export async function createApprovalRequest(
  eventId: string,
  data: { itemType: string; title: string; description?: string }
): Promise<ApprovalRequest> {
  const response = await api.post(`/events/${eventId}/approvals`, data);
  return response.data;
}

export async function deleteApprovalRequest(eventId: string, id: number): Promise<void> {
  await api.delete(`/events/${eventId}/approvals/${id}`);
}

export async function inviteClient(
  eventId: string,
  data: { name: string; email: string }
): Promise<{ message: string; client: { id: number; name: string; email: string }; temporaryPassword: string | null }> {
  const response = await api.post(`/events/${eventId}/invite-client`, data);
  return response.data;
}

export async function updateBudgetItem(
  eventId: string,
  id: number,
  data: { category: string; name: string; estimatedAmountEtb: number; actualAmountEtb: number }
) {
  const response = await api.put(`/events/${eventId}/budget/${id}`, data);
  return response.data;
}
export async function deleteBudgetItem(eventId: string, id: number): Promise<void> {
  await api.delete(`/events/${eventId}/budget/${id}`);
}

export async function updateTimelineItem(
  eventId: string,
  id: number,
  data: { startTime: string; endTime?: string; title: string }
) {
  const response = await api.put(`/events/${eventId}/timeline/${id}`, data);
  return response.data;
}
export async function deleteTimelineItem(eventId: string, id: number): Promise<void> {
  await api.delete(`/events/${eventId}/timeline/${id}`);
}

export async function updateTask(
  eventId: string,
  id: number,
  data: Partial<{ title: string; description: string; status: string; priority: string; assignedTo: number; dueDate: string }>
) {
  const response = await api.put(`/events/${eventId}/tasks/${id}`, data);
  return response.data;
}
export async function deleteTask(eventId: string, id: number): Promise<void> {
  await api.delete(`/events/${eventId}/tasks/${id}`);
}

export async function updateEvent(
  id: number,
  data: Partial<{
    name: string;
    nameAm: string;
    eventType: string;
    status: string;
    startDate: string;
    endDate: string;
    guestCount: number;
  }>
) {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
}
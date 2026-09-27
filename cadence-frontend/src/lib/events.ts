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
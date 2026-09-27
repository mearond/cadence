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
  eventType: string;
  startDate: string;
  endDate?: string;
  guestCount?: number;
}) {
  const response = await api.post('/events', data);
  return response.data;
}
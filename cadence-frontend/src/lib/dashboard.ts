import api from './api';
import type { Event } from './events';

export interface DashboardTask {
  id: number;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  event_id: number;
  event_name: string;
}

export interface DashboardStatusCount {
  status: string;
  count: number;
}

export interface DashboardSummary {
  upcomingEvents: Event[];
  statusCounts: DashboardStatusCount[];
  pendingTasks: DashboardTask[];
  allEvents: Pick<Event, 'id' | 'name' | 'name_am' | 'start_date' | 'status'>[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get('/dashboard/summary');
  return response.data;
}
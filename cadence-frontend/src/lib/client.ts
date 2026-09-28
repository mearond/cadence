import api from './api';

export interface ClientEventSummary {
  id: number;
  name: string;
  name_am: string | null;
  event_type: string;
  status: string;
  start_date: string;
}

export interface ClientTimelineItem {
  start_time: string;
  end_time: string | null;
  title: string;
  title_am: string | null;
  description: string | null;
}

export interface ClientApproval {
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

export interface ClientEventDetail {
  event: {
    id: number;
    name: string;
    name_am: string | null;
    event_type: string;
    status: string;
    start_date: string;
    end_date: string | null;
    guest_count: number | null;
    venue_name: string | null;
    venue_address: string | null;
  };
  timeline: ClientTimelineItem[];
  budgetSummary: { total_estimated: string; total_actual: string };
  approvals: ClientApproval[];
}

export async function fetchMyEvents(): Promise<ClientEventSummary[]> {
  const response = await api.get('/client/events');
  return response.data;
}

export async function fetchMyEventDetail(eventId: string): Promise<ClientEventDetail> {
  const response = await api.get(`/client/events/${eventId}`);
  return response.data;
}

export async function respondToApproval(
  eventId: string,
  approvalId: number,
  status: 'approved' | 'changes_requested',
  clientComment?: string
): Promise<ClientApproval> {
  const response = await api.put(`/client/events/${eventId}/approvals/${approvalId}`, {
    status,
    clientComment,
  });
  return response.data;
}
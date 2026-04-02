import { API_CONFIG } from '../config';
import api from './api';

export interface AuditEvent {
  id: string;
  hashId: string;
  eventType: string;
  source: string;
  actor: Record<string, unknown>;
  namespace: Record<string, unknown>;
  resourceType: string | null;
  resourceId: string | null;
  action: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  eventTimestamp: string;
  organizationHashId: string | null;
  createdAt: string;
  /** Virtual fields for display convenience */
  timestamp?: string;
  resource?: string;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  eventType?: string;
  actor?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  getEvents: (orgId: string, query?: AuditQuery) =>
    api.get<{ data: AuditEvent[]; total: number }>(
      `${API_CONFIG.AUDIT_URL}/api/v1/O/${orgId}/audit/logs`,
      { params: query },
    ),

  getEvent: (orgId: string, eventId: string) =>
    api.get<AuditEvent>(`${API_CONFIG.AUDIT_URL}/api/v1/O/${orgId}/audit/logs/${eventId}`),
};

import { API_CONFIG } from '../config';
import api from './api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ConnectorEndpoint {
  name: string;
  method: string;
  path: string;
  mapping: Record<string, any>;
}

export interface ConnectorConfig {
  baseUrl?: string;
  auth?: { type: string; credentials: string };
  headers?: Record<string, string>;
  timeout?: number;
  retryPolicy?: { maxRetries: number; backoffMs: number };
}

export interface Connector {
  hashId: string;
  organizationHashId: string;
  name: string;
  type: string;
  description: string;
  config: ConnectorConfig;
  endpoints: ConnectorEndpoint[];
  schedule: { cron: string; timezone: string } | null;
  isActive: boolean;
  _isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  hashId: string;
  organizationHashId: string;
  connectorHashId: string;
  connectorName: string;
  endpointName: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  request: { method?: string; url?: string; headers?: Record<string, string>; body?: any };
  response: { status?: number; headers?: Record<string, string>; body?: any; timeMs?: number };
  error: string | null;
  triggeredBy: string;
  startedAt: string;
  completedAt: string | null;
  _isDemo: boolean;
  createdAt: string;
}

export interface CreateConnectorPayload {
  name: string;
  type: string;
  description?: string;
  config?: ConnectorConfig;
  endpoints?: ConnectorEndpoint[];
  schedule?: { cron: string; timezone?: string } | null;
  isActive?: boolean;
}

export interface ExecuteConnectorPayload {
  endpointName: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */

const BASE = () => API_CONFIG.INTEGRATION_URL;

export const integrationService = {
  /* Connectors */
  getConnectors: (orgId: string, params?: Record<string, unknown>) =>
    api.get(`${BASE()}/api/v1/O/${orgId}/integrations/connectors`, { params }),

  getConnector: (orgId: string, id: string) =>
    api.get(`${BASE()}/api/v1/O/${orgId}/integrations/connectors/${id}`),

  createConnector: (orgId: string, payload: CreateConnectorPayload) =>
    api.post(`${BASE()}/api/v1/O/${orgId}/integrations/connectors`, payload),

  updateConnector: (orgId: string, id: string, payload: Partial<CreateConnectorPayload>) =>
    api.put(`${BASE()}/api/v1/O/${orgId}/integrations/connectors/${id}`, payload),

  deleteConnector: (orgId: string, id: string) =>
    api.delete(`${BASE()}/api/v1/O/${orgId}/integrations/connectors/${id}`),

  /* Executions */
  executeConnector: (orgId: string, connectorId: string, payload: ExecuteConnectorPayload) =>
    api.post(`${BASE()}/api/v1/O/${orgId}/integrations/execute/${connectorId}`, payload),

  getExecutions: (orgId: string, params?: Record<string, unknown>) =>
    api.get(`${BASE()}/api/v1/O/${orgId}/integrations/executions`, { params }),

  /* Health */
  health: () =>
    api.get(`${BASE()}/api/v1/G/integrations/health`),

  /* Seed */
  seedDemo: (orgId?: string) =>
    api.post(`${BASE()}/api/v1/G/integrations/seed/demo`, { organizationHashId: orgId }),

  flushDemo: (orgId?: string) =>
    api.delete(`${BASE()}/api/v1/G/integrations/seed/demo`, { data: { organizationHashId: orgId } }),
};

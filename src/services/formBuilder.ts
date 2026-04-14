import { API_CONFIG } from '../config';
import api from './api';

const BASE = API_CONFIG.FORM_BUILDER_URL;

export interface FormDefinition {
  hashId: string;
  name: string;
  slug: string;
  description?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  formType: string;
  piiFields?: string[];
  schema?: {
    display: string;
    components: unknown[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FormToken {
  hashId: string;
  name: string;
  status: 'active' | 'revoked';
  allowedForms: string[];
  allowedDomains: string[];
  lastUsedAt?: string;
  createdAt: string;
}

export interface CreateTokenDto {
  name: string;
  allowedForms: string[];
  allowedDomains: string[];
}

const ORG_ID = 'O-OZPY';

export const formBuilderService = {
  getFormDefinitions: (orgId = ORG_ID) =>
    api.get<{ forms: FormDefinition[]; total: number }>(
      `${BASE}/api/v1/O/${orgId}/form-builder/forms`,
    ),

  getFormDefinition: (slug: string, orgId = ORG_ID) =>
    api.get<FormDefinition>(
      `${BASE}/api/v1/O/${orgId}/form-builder/forms/${slug}`,
    ),

  publishForm: (slug: string, orgId = ORG_ID) =>
    api.post<FormDefinition>(
      `${BASE}/api/v1/O/${orgId}/form-builder/forms/${slug}/publish`,
      {},
    ),

  getTokens: (orgId = ORG_ID) =>
    api.get<FormToken[]>(
      `${BASE}/api/v1/O/${orgId}/form-builder/tokens/`,
    ),

  createToken: (data: CreateTokenDto, orgId = ORG_ID) =>
    api.post<{ token: FormToken; secret: string }>(
      `${BASE}/api/v1/O/${orgId}/form-builder/tokens/`,
      data,
    ),

  revokeToken: (tokenId: string, orgId = ORG_ID) =>
    api.post(
      `${BASE}/api/v1/O/${orgId}/form-builder/tokens/${tokenId}/revoke`,
      {},
    ),
};

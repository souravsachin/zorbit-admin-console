import { API_CONFIG } from '../config';
import api from './api';

export interface MenuItem {
  id: string;
  hashId: string;
  label: string;
  route: string;
  icon: string;
  parentId: string | null;
  parentHashId: string | null;
  order: number;
  sortOrder: number;
  section: string;
  privilegeCode: string;
  privileges: string[];
  children?: MenuItem[];
}

export interface RouteRegistration {
  id: string;
  path: string;
  service: string;
  method: string;
}

export interface ResolvedMenuResponse {
  menu: MenuItem[];
  sections?: unknown[];
  source?: 'database' | 'static';
  generatedAt?: string;
}

export const navigationService = {
  getMenus: (orgId: string) =>
    api.get<MenuItem[]>(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/menus`),

  /**
   * Get the privilege-filtered, tree-structured menu for a user.
   * Endpoint: /api/v1/U/:userId/navigation/menu (per uri-conventions.md §3)
   * This is the primary endpoint for the 6-level sidebar.
   */
  getMenu: (userId: string) =>
    api.get<ResolvedMenuResponse>(`${API_CONFIG.NAVIGATION_URL}/api/v1/U/${userId}/navigation/menu`),

  /**
   * @deprecated Use getMenu(). Kept for backward compatibility — remove after
   * all callers are migrated.
   */
  getResolvedMenu: (userId: string) =>
    api.get<ResolvedMenuResponse>(`${API_CONFIG.NAVIGATION_URL}/api/v1/U/${userId}/navigation/menu`),

  createMenuItem: (orgId: string, payload: Partial<MenuItem>) =>
    api.post(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/menus`, payload),

  updateMenuItem: (orgId: string, menuId: string, payload: Partial<MenuItem>) =>
    api.patch(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/menus/${menuId}`, payload),

  deleteMenuItem: (orgId: string, menuId: string) =>
    api.delete(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/menus/${menuId}`),

  getRoutes: (orgId: string) =>
    api.get<RouteRegistration[]>(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/routes`),

  registerRoute: (orgId: string, payload: Partial<RouteRegistration>) =>
    api.post(`${API_CONFIG.NAVIGATION_URL}/api/v1/O/${orgId}/navigation/routes`, payload),
};

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ZorbitDataTable } from '../../components/ZorbitDataTable';
import type { DataTableConfig, ActionButton } from '../../types/dataTable';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import { authorizationService, Role } from '../../services/authorization';
import { API_CONFIG } from '../../config';

const RolesPage: React.FC = () => {
  const { orgId } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedRoleData, setExpandedRoleData] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tableConfig = useMemo<DataTableConfig>(() => ({
    columns: [
      { name: 'hashId', label: 'Hash ID', type: 'string', width: '120px', sortable: false },
      { name: 'name', label: 'Name', type: 'string', sortable: true, searchable: true },
      { name: 'description', label: 'Description', type: 'string', sortable: false, searchable: true },
      { name: 'privilegeCount', label: 'Privileges', type: 'number', sortable: true, align: 'center' },
    ],
    data_source: {
      endpoint_template: `${API_CONFIG.AUTHORIZATION_URL}/api/v1/O/${orgId}/roles`,
    },
    searchable: true,
    default_sort_column: 'name',
    default_sort_direction: 'asc',
    default_page_size: 25,
    view_modes: ['list'],
    export_formats: ['csv'],
  }), [orgId]);

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = (row.hashId || row.id) as string;
    if (expandedRole === id) {
      setExpandedRole(null);
      setExpandedRoleData(null);
    } else {
      setExpandedRole(id);
      setExpandedRoleData(row as unknown as Role);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await authorizationService.createRole(orgId, form);
      toast('Role created', 'success');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      setRefreshKey((k) => k + 1);
    } catch {
      toast('Failed to create role', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <ZorbitDataTable
        key={refreshKey}
        config={tableConfig}
        orgId={orgId}
        title="Roles & Privileges"
        createButton={{ label: 'Create Role', onClick: () => setShowCreate(true) }}
        onRowClick={handleRowClick}
      />

      {expandedRole && expandedRoleData && (
        <div className="card p-4">
          <h3 className="font-medium mb-2">Privileges for role: {expandedRoleData.name}</h3>
          <div className="flex flex-wrap gap-2">
            {expandedRoleData.privileges?.length ? (
              expandedRoleData.privileges.map((p, i) => (
                <span key={i} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No privileges assigned</span>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Role">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role Name</label>
            <input data-testid="role-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input data-testid="role-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button data-testid="role-create-submit" type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RolesPage;

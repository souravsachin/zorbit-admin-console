import React, { useState, useMemo } from 'react';
import { ZorbitDataTable } from '../../components/ZorbitDataTable';
import type { DataTableConfig } from '../../types/dataTable';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/shared/Toast';
import { customerService } from '../../services/customer';
import { API_CONFIG } from '../../config';

const CustomersPage: React.FC = () => {
  const { orgId } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tableConfig = useMemo<DataTableConfig>(() => ({
    columns: [
      { name: 'id', label: 'Hash ID', type: 'string', width: '120px', sortable: false },
      { name: 'displayName', label: 'Display Name', type: 'string', sortable: true, searchable: true },
      { name: 'emailToken', label: 'Email (PII)', type: 'string', sortable: false, pii_sensitive: true },
      { name: 'phoneToken', label: 'Phone (PII)', type: 'string', sortable: false, pii_sensitive: true },
      {
        name: 'status', label: 'Status', type: 'badge', sortable: true, filterable: true,
        enum_values: [
          { value: 'active', label: 'Active', color: '#4CAF50' },
          { value: 'inactive', label: 'Inactive', color: '#9E9E9E' },
        ],
      },
      { name: 'createdAt', label: 'Created', type: 'date', sortable: true },
    ],
    filters: [
      {
        column: 'status', type: 'multiselect', label: 'Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ],
    data_source: {
      endpoint_template: `${API_CONFIG.CUSTOMER_URL}/api/v1/O/${orgId}/customers`,
      response_data_path: 'data',
      response_total_path: 'total',
    },
    searchable: true,
    default_sort_column: 'createdAt',
    default_sort_direction: 'desc',
    default_page_size: 25,
    view_modes: ['list'],
    export_formats: ['csv'],
    time_filter_column: 'createdAt',
    time_range_presets: [
      { label: '7 Days', value: '7d', duration_hours: 168 },
      { label: '30 Days', value: '30d', duration_hours: 720 },
      { label: 'All', value: 'all', duration_hours: null },
    ],
  }), [orgId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await customerService.createCustomer(orgId, form);
      toast('Customer created', 'success');
      setShowCreate(false);
      setForm({ displayName: '', email: '', phone: '' });
      setRefreshKey((k) => k + 1);
    } catch {
      toast('Failed to create customer', 'error');
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
        title="Customers"
        createButton={{ label: 'Create Customer', onClick: () => setShowCreate(true) }}
      />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Customer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+1234567890" />
          </div>
          <p className="text-xs text-gray-500">Email and phone will be tokenized via PII Vault. Only PII tokens will be stored.</p>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;

import React, { useState, useMemo } from 'react';
import { ZorbitDataTable } from '../../components/ZorbitDataTable';
import type { DataTableConfig } from '../../types/dataTable';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config';

const AuditPage: React.FC = () => {
  const { orgId } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);

  const tableConfig = useMemo<DataTableConfig>(() => ({
    columns: [
      { name: 'eventTimestamp', label: 'Timestamp', type: 'datetime', sortable: true, width: '180px' },
      {
        name: 'eventType', label: 'Event Type', type: 'badge', sortable: true, filterable: true,
        enum_values: [
          { value: 'identity.user.created', label: 'User Created', color: '#4CAF50' },
          { value: 'identity.user.updated', label: 'User Updated', color: '#2196F3' },
          { value: 'identity.user.deleted', label: 'User Deleted', color: '#F44336' },
          { value: 'identity.user.login', label: 'User Login', color: '#009688' },
          { value: 'authorization.role.created', label: 'Role Created', color: '#9C27B0' },
          { value: 'customer.created', label: 'Customer Created', color: '#FF9800' },
          { value: 'customer.updated', label: 'Customer Updated', color: '#FFC107' },
        ],
      },
      { name: 'actor', label: 'Actor', type: 'string', sortable: true, searchable: true },
      { name: 'action', label: 'Action', type: 'string', sortable: true, searchable: true },
      { name: 'resourceType', label: 'Resource', type: 'string', sortable: true, filterable: true },
      { name: 'source', label: 'Source', type: 'string', sortable: false },
    ],
    filters: [
      {
        column: 'eventType', type: 'multiselect', label: 'Event Type',
        options: [
          { value: 'identity.user.created', label: 'User Created' },
          { value: 'identity.user.login', label: 'User Login' },
          { value: 'authorization.role.created', label: 'Role Created' },
          { value: 'customer.created', label: 'Customer Created' },
        ],
      },
      { column: 'resourceType', type: 'multiselect', label: 'Resource Type', options: [] },
      { column: 'eventTimestamp', type: 'daterange', label: 'Date Range' },
    ],
    data_source: {
      endpoint_template: `${API_CONFIG.AUDIT_URL}/api/v1/O/${orgId}/events`,
      response_data_path: 'data',
      response_total_path: 'total',
    },
    searchable: true,
    default_sort_column: 'eventTimestamp',
    default_sort_direction: 'desc',
    default_page_size: 25,
    view_modes: ['list'],
    export_formats: ['csv', 'excel'],
    time_filter_column: 'eventTimestamp',
    time_range_presets: [
      { label: '1 Day', value: '1d', duration_hours: 24 },
      { label: '7 Days', value: '7d', duration_hours: 168 },
      { label: '30 Days', value: '30d', duration_hours: 720 },
      { label: '90 Days', value: '90d', duration_hours: 2160 },
      { label: 'All', value: 'all', duration_hours: null },
    ],
    summary_stats: [
      { key: 'total', label: 'Total Events', color: 'primary' },
      { key: 'page_count', label: 'Showing', color: 'info' },
      { key: 'active_filters', label: 'Active Filters', color: 'warning' },
    ],
  }), [orgId]);

  return (
    <div className="space-y-4">
      <ZorbitDataTable
        config={tableConfig}
        orgId={orgId}
        title="Audit Logs"
        onRowClick={(row) => setSelectedEvent(row)}
      />

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Audit Event Detail">
        {selectedEvent && (
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(selectedEvent, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
};

export default AuditPage;

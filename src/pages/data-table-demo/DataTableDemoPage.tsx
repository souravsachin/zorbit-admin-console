// =============================================================================
// ZorbitDataTable LIVE Demo Page
// =============================================================================
// Demonstrates ZorbitDataTable with REAL data from the UW Workflow backend.
// Shows quotations from all-quotations queue with full sorting, filtering,
// search, pagination, PII masking, and export.
// =============================================================================

import React, { useState, useMemo } from 'react';
import { ZorbitDataTable } from '../../components/ZorbitDataTable';
import type {
  DataTableConfig,
  ActionButton,
} from '../../types/dataTable';
import { API_CONFIG } from '../../config';

// ---------------------------------------------------------------------------
// LIVE Config — UW Workflow All Quotations
// ---------------------------------------------------------------------------

const liveConfig: DataTableConfig = {
  columns: [
    { name: 'quotationNumber', label: 'Quotation #', type: 'string', width: '130px', sortable: true, searchable: true },
    { name: 'proposerName', label: 'Proposer', type: 'string', sortable: true, searchable: true, pii_sensitive: true },
    { name: 'productName', label: 'Product', type: 'string', sortable: true, searchable: true },
    {
      name: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      filterable: true,
      enum_values: [
        { value: 'new', label: 'New', color: '#2196F3' },
        { value: 'pending_review', label: 'Pending Review', color: '#FFC107' },
        { value: 'under_review', label: 'Under Review', color: '#FF9800' },
        { value: 'stp_approved', label: 'STP Approved', color: '#4CAF50' },
        { value: 'stp_pending', label: 'STP Pending', color: '#009688' },
        { value: 'nstp_pending', label: 'NSTP Pending', color: '#9C27B0' },
        { value: 'nstp_review', label: 'NSTP Review', color: '#7B1FA2' },
        { value: 'approved', label: 'Approved', color: '#4CAF50' },
        { value: 'approved_with_loading', label: 'Approved +Loading', color: '#388E3C' },
        { value: 'approved_with_conditions', label: 'Approved +Conditions', color: '#689F38' },
        { value: 'declined', label: 'Declined', color: '#F44336' },
        { value: 'query_raised', label: 'Query Raised', color: '#FF6F00' },
        { value: 'query_responded', label: 'Query Responded', color: '#00BCD4' },
        { value: 'payment_pending', label: 'Payment Pending', color: '#3F51B5' },
        { value: 'policy_issued', label: 'Policy Issued', color: '#2E7D32' },
        { value: 'cancelled', label: 'Cancelled', color: '#9E9E9E' },
        { value: 'incomplete', label: 'Incomplete', color: '#757575' },
      ],
    },
    { name: 'totalPremium', label: 'Premium', type: 'currency', format: 'AED', align: 'right', sortable: true },
    {
      name: 'region',
      label: 'Region',
      type: 'string',
      sortable: true,
      filterable: true,
    },
    {
      name: 'quotationType',
      label: 'Type',
      type: 'badge',
      sortable: true,
      filterable: true,
      enum_values: [
        { value: 'retail', label: 'Retail', color: '#2196F3' },
        { value: 'corporate', label: 'Corporate', color: '#9C27B0' },
        { value: 'sme', label: 'SME', color: '#FF9800' },
      ],
    },
    { name: 'memberCount', label: 'Members', type: 'number', align: 'center', sortable: true },
    { name: 'proposerEmail', label: 'Email', type: 'string', pii_sensitive: true, visible: false },
    { name: 'createdAt', label: 'Created', type: 'date', sortable: true },
  ],
  filters: [
    {
      column: 'status',
      type: 'multiselect',
      label: 'Status',
      options: [
        { value: 'new', label: 'New' },
        { value: 'pending_review', label: 'Pending Review' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'stp_approved', label: 'STP Approved' },
        { value: 'nstp_pending', label: 'NSTP Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'declined', label: 'Declined' },
        { value: 'query_raised', label: 'Query Raised' },
        { value: 'payment_pending', label: 'Payment Pending' },
        { value: 'policy_issued', label: 'Policy Issued' },
      ],
    },
    {
      column: 'region',
      type: 'multiselect',
      label: 'Region',
      options: [
        { value: 'Dubai', label: 'Dubai' },
        { value: 'Abu Dhabi', label: 'Abu Dhabi' },
        { value: 'Sharjah', label: 'Sharjah' },
        { value: 'UAE', label: 'UAE' },
        { value: 'India', label: 'India' },
        { value: 'US', label: 'US' },
      ],
    },
    {
      column: 'quotationType',
      type: 'multiselect',
      label: 'Type',
      options: [
        { value: 'retail', label: 'Retail' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'sme', label: 'SME' },
      ],
    },
  ],
  summary_stats: [
    { key: 'total', label: 'Total Quotations', icon: 'functions', color: 'primary' },
    { key: 'page_count', label: 'This Page', icon: 'view_list', color: 'info' },
    { key: 'active_filters', label: 'Active Filters', icon: 'filter_alt', color: 'warning' },
  ],
  view_modes: ['list', 'grid'],
  export_formats: ['csv'],
  searchable: true,
  sortable: true,
  page_sizes: [10, 25, 50, 100],
  default_page_size: 25,
  default_sort_column: 'createdAt',
  default_sort_direction: 'desc',
  time_filter_column: 'createdAt',
  time_range_presets: [
    { label: '24h', value: '1D', duration_hours: 24 },
    { label: '7 Days', value: '7D', duration_hours: 168 },
    { label: '30 Days', value: '30D', duration_hours: 720 },
    { label: '90 Days', value: '90D', duration_hours: 2160 },
    { label: 'All', value: 'all', duration_hours: null },
  ],
  empty_state_message: 'No quotations found matching your criteria.',
  data_source: {
    // The UW Workflow queue endpoint returns { success, items, total, page, limit }
    endpoint_template: `${API_CONFIG.UW_WORKFLOW_URL}/api/v1/O/O-OZPY/uw_workflow/queues/all-quotations/items`,
    method: 'GET',
    response_data_path: 'items',
    response_total_path: 'total',
    page_param: 'page',
    page_size_param: 'limit',
    sort_param: 'sort',
    sort_dir_param: 'order',
    search_param: 'search',
  },
};

// ---------------------------------------------------------------------------
// Workflow Queue Tabs
// ---------------------------------------------------------------------------

interface QueueTab {
  key: string;
  label: string;
  endpoint: string;
  statusFilter?: string[];
}

const QUEUE_TABS: QueueTab[] = [
  { key: 'all', label: 'All Quotations', endpoint: 'all-quotations' },
  { key: 'new-l1', label: 'New (L1)', endpoint: 'new-quotations-l1' },
  { key: 'stp', label: 'STP Approved', endpoint: 'all-quotations', statusFilter: ['stp_approved', 'stp_pending'] },
  { key: 'nstp', label: 'NSTP Review', endpoint: 'all-quotations', statusFilter: ['nstp_pending', 'nstp_review'] },
  { key: 'approved', label: 'Approved', endpoint: 'all-quotations', statusFilter: ['approved', 'approved_with_loading', 'approved_with_conditions'] },
  { key: 'declined', label: 'Declined', endpoint: 'all-quotations', statusFilter: ['declined'] },
  { key: 'payment', label: 'Payment Pending', endpoint: 'all-quotations', statusFilter: ['payment_pending'] },
];

// ---------------------------------------------------------------------------
// Demo Actions
// ---------------------------------------------------------------------------

const liveActions: ActionButton[] = [
  { key: 'view', label: 'View', onClick: (row) => alert(`View quotation: ${row.quotationNumber || row.hashId}`) },
  { key: 'edit', label: 'Edit', variant: 'primary', onClick: (row) => alert(`Edit quotation: ${row.quotationNumber || row.hashId}`) },
];

// ---------------------------------------------------------------------------
// Demo Page Component
// ---------------------------------------------------------------------------

const DataTableDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const activeQueue = QUEUE_TABS.find((t) => t.key === activeTab) || QUEUE_TABS[0];

  // Build the config for the active queue
  const currentConfig: DataTableConfig = useMemo(() => {
    const endpoint = `${API_CONFIG.UW_WORKFLOW_URL}/api/v1/O/O-OZPY/uw_workflow/queues/${activeQueue.endpoint}/items`;
    return {
      ...liveConfig,
      data_source: {
        ...liveConfig.data_source,
        endpoint_template: endpoint,
      },
    };
  }, [activeQueue]);

  // Build locked filters for status-filtered queues
  const lockedFilters = useMemo(() => {
    if (activeQueue.statusFilter) {
      return { status: activeQueue.statusFilter };
    }
    return undefined;
  }, [activeQueue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ZorbitDataTable — LIVE Demo</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real data from UW Workflow backend. Sorting, filtering, search, pagination, PII masking, CSV export — all working.
        </p>
      </div>

      {/* Queue Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 pb-1">
        {QUEUE_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-primary-600 border border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-800 -mb-px'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* The ZorbitDataTable — using the real component, real API */}
      <ZorbitDataTable
        key={activeTab}
        config={currentConfig}
        orgId="O-OZPY"
        actions={liveActions}
        lockedFilters={lockedFilters}
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </div>
  );
};

export default DataTableDemoPage;

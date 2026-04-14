import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Users, Building2 } from 'lucide-react';
import DataTable, { Column } from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { identityService, User, Organization } from '../../services/identity';

const UserDirectoryPage: React.FC = () => {
  const { orgId, user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load orgs for filter dropdown
        const orgsRes = await identityService.getOrganizations();
        const orgs = Array.isArray(orgsRes.data) ? orgsRes.data : [];
        setOrganizations(orgs);

        if (isSuperAdmin) {
          // Super admin: load users from ALL top-level orgs + their trees
          const topLevelOrgs = orgs.filter((o: any) => o.orgType !== 'department');
          const allResults: User[] = [];
          for (const org of topLevelOrgs) {
            try {
              const res = await identityService.getUsers(org.hashId!, { tree: 'true' });
              const users = Array.isArray(res.data) ? res.data : [];
              allResults.push(...users);
            } catch { /* skip failed orgs */ }
          }
          setAllUsers(allResults);
        } else {
          // Org admin: load from own org tree
          const res = await identityService.getUsers(orgId, { tree: 'true' });
          setAllUsers(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId, isSuperAdmin]);

  // Build org name lookup
  const orgNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const o of organizations) if (o.hashId) map[o.hashId] = o.name;
    return map;
  }, [organizations]);

  // Top-level orgs for filter (exclude departments)
  const topLevelOrgs = useMemo(
    () => organizations.filter((o: any) => o.orgType !== 'department'),
    [organizations],
  );

  // Filtered + searched users
  const filtered = useMemo(() => {
    let result = [...allUsers];

    // Sort: latest first
    result.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(q) ||
          u.hashId?.toLowerCase().includes(q) ||
          u.title?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q) ||
          u.organizationHashId?.toLowerCase().includes(q),
      );
    }

    // Filter by org
    if (filterOrg) {
      result = result.filter((u) => u.organizationHashId === filterOrg);
    }

    // Filter by role
    if (filterRole) {
      result = result.filter((u) => u.role === filterRole);
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter((u) => u.status === filterStatus);
    }

    return result;
  }, [allUsers, search, filterOrg, filterRole, filterStatus]);

  // Unique roles for filter
  const roles = useMemo(
    () => [...new Set(allUsers.map((u) => u.role).filter((r): r is string => Boolean(r)))].sort(),
    [allUsers],
  );

  const columns: Column<User>[] = [
    {
      key: 'hashId',
      header: 'ID',
      render: (u) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
          {u.hashId}
        </code>
      ),
    },
    { key: 'displayName', header: 'Name' },
    {
      key: 'title' as any,
      header: 'Title',
      render: (u) => u.title || <span className="text-gray-400">—</span>,
    },
    {
      key: 'organizationHashId',
      header: 'Organization',
      render: (u) => (
        <span className="text-xs">
          {orgNameMap[u.organizationHashId] || u.organizationHashId}
        </span>
      ),
    },
    {
      key: 'role' as any,
      header: 'Role',
      render: (u) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            u.role === 'superadmin'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : u.role === 'admin'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {u.role || 'member'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge label={u.status || 'active'} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) =>
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users size={24} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">User Directory</h1>
            <p className="text-sm text-gray-500">
              {filtered.length} of {allUsers.length} users
              {isSuperAdmin && ' (all organizations)'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, ID, title, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Org filter */}
        {isSuperAdmin && topLevelOrgs.length > 1 && (
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Organizations</option>
            {topLevelOrgs.map((o: any) => (
              <option key={o.hashId} value={o.hashId}>
                {o.name}
              </option>
            ))}
          </select>
        )}

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        {(search || filterOrg || filterRole || filterStatus) && (
          <button
            onClick={() => {
              setSearch('');
              setFilterOrg('');
              setFilterRole('');
              setFilterStatus('');
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No users found matching your filters"
      />
    </div>
  );
};

export default UserDirectoryPage;

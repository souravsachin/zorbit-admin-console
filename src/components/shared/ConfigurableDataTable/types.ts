/* Configurable DataTable — feProps contract per
 *   SPEC-datatable-parameters.md v1.0
 *
 * Exported as `zorbit-pfs-datatable:DataTable` in componentRegistry.ts.
 *
 * Renders a full list/detail page from manifest configuration alone.
 * Backend is the source of truth for RBAC + masking — this component is
 * strictly a presentation layer with defence-in-depth FE mask support.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type SrcRef = { $src: string };

export type ColumnType =
  | 'id'
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'boolean'
  | 'chip'
  | 'avatar-with-name'
  | 'pill'
  | 'progress'
  | 'link';

export type CellRenderer =
  | 'text'
  | 'link'
  | 'badge'
  | 'currency'
  | 'date'
  | 'chip'
  | 'avatar'
  | 'pill';

export interface ChipPalette {
  bg: string;
  text: string;
  label?: string;
  lt?: number;
}

export interface Column {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean | FilterSpec;
  pinned?: 'left' | 'right' | null;
  cellRenderer?: CellRenderer;
  linkTo?: string;
  mono?: boolean;
  truncate?: number;
  currencyField?: string;
  format?: string;
  chipColors?: Record<string, ChipPalette>;
  pillColors?: { range?: ChipPalette[] };
  lookup?: string;
}

export interface FilterSpec {
  kind: 'search' | 'select' | 'range' | 'date-range' | 'toggle' | 'auto';
  min?: number;
  max?: number;
  step?: number;
}

export interface ExtraFilter {
  id: string;
  label: string;
  kind: FilterSpec['kind'];
  applies: Record<string, unknown>;
}

export interface FiltersBlock {
  auto?: boolean;
  collapsed?: boolean;
  extra?: ExtraFilter[];
}

export interface LookupSpec {
  beRoute: string;
  valueField: string;
  labelField: string;
  avatarField?: string;
  cacheMs?: number;
}

export interface DataSourceSpec {
  beRoute: string;
  method?: 'GET' | 'POST';
  pageSize?: number;
  paginationStyle?: 'offset' | 'cursor';
}

export interface ActionSpec {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  kind?: string;
  beRoute?: string;
  privilege?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  confirm?: string | { title: string; prompt?: string; field?: string; required?: boolean; kind?: string };
  format?: 'csv' | 'pdf' | 'xlsx';
  'requires-selection'?: boolean;
}

export interface DetailLayoutField {
  key: string;
  label: string;
  type?: ColumnType;
  format?: string;
  lookup?: string;
  chipColors?: Record<string, ChipPalette>;
}

export interface DetailLayoutSection {
  title: string;
  collapsed?: boolean;
  fields: DetailLayoutField[];
}

export interface DetailView {
  mode?: 'drawer' | 'modal' | 'full-page';
  beRoute?: string;
  layout?: DetailLayoutSection[] | SrcRef;
  actions?: ActionSpec[];
}

export interface RoleVariant {
  columns?: Column[] | SrcRef;
  filters?: FiltersBlock;
  lookups?: Record<string, LookupSpec>;
  tableActions?: ActionSpec[];
  rowActions?: ActionSpec[];
  detailView?: DetailView;
}

export interface FeMasking {
  enabled?: boolean;
  rules?: Array<{ field: string; pattern: string; 'mask-char'?: string }>;
}

export interface DataTableFeProps {
  pageId?: string;
  dataSource: DataSourceSpec;
  columns: Column[] | SrcRef;
  defaultSort?: Array<{ field: string; order: 'asc' | 'desc' }>;
  detailView?: DetailView;
  filters?: FiltersBlock;
  lookups?: Record<string, LookupSpec>;
  feMasking?: FeMasking;
  tableActions?: ActionSpec[];
  rowActions?: ActionSpec[];
  roleVariants?: Record<string, RoleVariant | SrcRef>;
  /**
   * Parameter-driven primary key field on each row. Used for React keys
   * and action callbacks. Defaults to 'id'. Modules whose rows use a
   * domain-specific id (e.g. quotationId, claimId, policyNumber) should
   * set this in the manifest feProps.
   */
  primaryKeyField?: string;
  /**
   * Parameter-driven envelope field in the list-response JSON that holds
   * the array of rows. Defaults to 'records'. Common module-specific
   * values: 'items', 'users', 'quotations', 'claims', 'rows', 'data'.
   * The component also inspects a known allow-list of generic envelope
   * names as a last-resort fallback so modules that don't set this still
   * render — but new modules should pass this explicitly.
   */
  dataField?: string;
}

export interface Row {
  [k: string]: any;
}

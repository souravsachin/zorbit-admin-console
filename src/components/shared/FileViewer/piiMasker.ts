/**
 * Best-effort Phase 1 PII redaction helpers.
 *
 * Scope: text formats only (Markdown, CSV, JSON). PDF / DOCX / binary
 * formats are NOT redacted in Phase 1.
 *
 * Rules are "dotted paths" — the last segment is the field the rule
 * targets. For CSV we treat the last segment as a column header; for
 * JSON we walk the whole path; for Markdown/plain text we look for
 * obvious key-value-shaped lines (e.g. `email: aarav@example.com`)
 * and mask the value after the colon.
 *
 * This is deliberately conservative. The authoritative PII story will
 * be server-side redaction (Phase 2) through the PII vault.
 */

const DEFAULT_MASK = '\u2022';

function maskValue(v: unknown, maskChar: string): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.length === 0) return '';
  return maskChar.repeat(Math.max(4, Math.min(s.length, 16)));
}

function lastSegment(rule: string): string {
  const idx = rule.lastIndexOf('.');
  return idx >= 0 ? rule.slice(idx + 1) : rule;
}

export function maskMarkdown(
  text: string,
  rules: string[] = [],
  maskChar = DEFAULT_MASK,
): string {
  if (!rules.length) return text;
  const fields = new Set(rules.map((r) => lastSegment(r).toLowerCase()));
  return text.replace(
    /^([\t ]*[-*]?[\t ]*(?:\*\*)?)([A-Za-z][A-Za-z0-9_\- ]*)((?:\*\*)?[\t ]*:[\t ]*)(.+)$/gm,
    (full, prefix: string, key: string, sep: string, value: string) => {
      const keyNorm = key.trim().toLowerCase().replace(/[\s_-]/g, '');
      for (const f of fields) {
        const fNorm = f.replace(/[\s_-]/g, '');
        if (keyNorm === fNorm || keyNorm.endsWith(fNorm)) {
          return `${prefix}${key}${sep}${maskValue(value, maskChar)}`;
        }
      }
      return full;
    },
  );
}

/** Mask matching columns in a CSV or TSV string. */
export function maskDelimited(
  text: string,
  delimiter: ',' | '\t',
  rules: string[] = [],
  maskChar = DEFAULT_MASK,
): string {
  if (!rules.length) return text;
  const fields = new Set(rules.map((r) => lastSegment(r).toLowerCase()));
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return text;
  const headers = splitCsvRow(lines[0], delimiter);
  const maskCols: Set<number> = new Set();
  headers.forEach((h, idx) => {
    const norm = h.trim().toLowerCase().replace(/[\s_-]/g, '');
    for (const f of fields) {
      const fNorm = f.replace(/[\s_-]/g, '');
      if (norm === fNorm || norm.endsWith(fNorm)) maskCols.add(idx);
    }
  });
  if (maskCols.size === 0) return text;
  const out: string[] = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === 0) {
      out.push(lines[i]);
      continue;
    }
    const cols = splitCsvRow(lines[i], delimiter);
    for (const idx of maskCols) {
      if (cols[idx] !== undefined) cols[idx] = maskValue(cols[idx], maskChar);
    }
    out.push(cols.join(delimiter));
  }
  return out.join('\n');
}

/** Walk a JSON value, masking leaves whose path matches any rule. */
export function maskJson<T>(
  obj: T,
  rules: string[] = [],
  maskChar = DEFAULT_MASK,
): T {
  if (!rules.length) return obj;
  const ruleSet = rules.map((r) => r.split('.'));
  return walk(obj, [], ruleSet, maskChar) as T;
}

function walk(
  v: unknown,
  path: string[],
  rules: string[][],
  maskChar: string,
): unknown {
  if (Array.isArray(v)) {
    return v.map((item, i) => walk(item, [...path, String(i)], rules, maskChar));
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, value] of Object.entries(v as Record<string, unknown>)) {
      const childPath = [...path, k];
      if (matchesRule(childPath, rules)) {
        out[k] = maskValue(value, maskChar);
      } else {
        out[k] = walk(value, childPath, rules, maskChar);
      }
    }
    return out;
  }
  return v;
}

function matchesRule(path: string[], rules: string[][]): boolean {
  for (const rule of rules) {
    if (rule.length > path.length) continue;
    // suffix match — "customer.phone" matches path ending in [..., "customer", "phone"]
    let ok = true;
    for (let i = 0; i < rule.length; i++) {
      const lhs = rule[rule.length - 1 - i].toLowerCase();
      const rhs = path[path.length - 1 - i].toLowerCase();
      if (lhs !== rhs) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/** Minimal CSV splitter — handles quoted fields with embedded delimiter or newline. */
function splitCsvRow(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"' && cur.length === 0) {
        inQuotes = true;
      } else if (ch === delim) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

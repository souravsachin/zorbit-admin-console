import type { FileFormat } from './types';

/**
 * Content-Type → FileFormat map. Order matters for the substring
 * checks (e.g. `application/vnd.openxmlformats...` must be matched
 * before the generic `application/` arm).
 */
const MIME_TO_FORMAT: Array<[RegExp, FileFormat]> = [
  [/^text\/markdown\b/i, 'markdown'],
  [/^text\/x-markdown\b/i, 'markdown'],
  [/^text\/html\b/i, 'html'],
  [/^application\/json\b/i, 'json'],
  [/^text\/csv\b/i, 'csv'],
  [/^text\/tab-separated-values\b/i, 'tsv'],
  [/^application\/pdf\b/i, 'pdf'],
  [/^application\/vnd\.openxmlformats-officedocument\.wordprocessingml/i, 'docx'],
  [/^application\/x-sqlite3\b/i, 'sqlite'],
  [/^application\/vnd\.sqlite3\b/i, 'sqlite'],
  [/^image\//i, 'image'],
  [/^audio\//i, 'audio'],
  [/^video\//i, 'video'],
  [
    /^text\/(javascript|typescript|x-python|x-ruby|x-go|x-rust|x-java|x-c|x-c\+\+|x-shell|x-sh|x-sql|x-yaml|yaml|x-toml)\b/i,
    'code',
  ],
  [/^application\/(javascript|typescript|xml|yaml|x-yaml|x-toml)\b/i, 'code'],
  [/^text\/plain\b/i, 'text'],
];

const EXT_TO_FORMAT: Record<string, FileFormat> = {
  md: 'markdown',
  markdown: 'markdown',
  mdown: 'markdown',
  mkd: 'markdown',
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  json: 'json',
  csv: 'csv',
  tsv: 'tsv',
  pdf: 'pdf',
  docx: 'docx',
  sqlite: 'sqlite',
  sqlite3: 'sqlite',
  db: 'sqlite',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  flac: 'audio',
  aac: 'audio',
  m4a: 'audio',
  mp4: 'video',
  webm: 'video',
  mov: 'video',
  mkv: 'video',
  ogv: 'video',
  // Code — map to `code` with hljs language inference at render time.
  js: 'code',
  mjs: 'code',
  cjs: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  py: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  java: 'code',
  c: 'code',
  h: 'code',
  cpp: 'code',
  hpp: 'code',
  cs: 'code',
  php: 'code',
  swift: 'code',
  kt: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',
  lua: 'code',
  sql: 'code',
  css: 'code',
  scss: 'code',
  less: 'code',
  vue: 'code',
  svelte: 'code',
  xml: 'code',
  yml: 'code',
  yaml: 'code',
  toml: 'code',
  ini: 'code',
  cfg: 'code',
  conf: 'code',
  env: 'code',
  // Plain
  txt: 'text',
  log: 'text',
};

export function detectFormatFromMime(mime: string): FileFormat | null {
  if (!mime) return null;
  const head = mime.split(';')[0].trim().toLowerCase();
  for (const [re, fmt] of MIME_TO_FORMAT) {
    if (re.test(head)) return fmt;
  }
  return null;
}

export function detectFormatFromUrl(url: string): FileFormat | null {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://x');
    const path = u.pathname;
    const dot = path.lastIndexOf('.');
    if (dot < 0) return null;
    const ext = path.slice(dot + 1).toLowerCase();
    return EXT_TO_FORMAT[ext] ?? null;
  } catch {
    return null;
  }
}

export function detectLanguageFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://x');
    const path = u.pathname;
    const dot = path.lastIndexOf('.');
    if (dot < 0) return undefined;
    const ext = path.slice(dot + 1).toLowerCase();
    const langAliases: Record<string, string> = {
      js: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      java: 'java',
      c: 'c',
      h: 'c',
      cpp: 'cpp',
      hpp: 'cpp',
      cs: 'csharp',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      sh: 'bash',
      bash: 'bash',
      zsh: 'bash',
      lua: 'lua',
      sql: 'sql',
      css: 'css',
      scss: 'scss',
      less: 'less',
      vue: 'xml',
      svelte: 'xml',
      xml: 'xml',
      yml: 'yaml',
      yaml: 'yaml',
      toml: 'ini',
      ini: 'ini',
      cfg: 'ini',
      conf: 'ini',
      env: 'bash',
    };
    return langAliases[ext];
  } catch {
    return undefined;
  }
}

# Zorbit Service: Unified Console

## Project ID: CP-003

---

## ⚡ SESSION START — READ THIS FIRST (survives compaction)

Every time a new session starts OR context compacts, Claude MUST do ALL of the following before any other work:

### 1. Message Echo Protocol (Skill 1028) — MANDATORY, NO EXCEPTIONS
Every user message must be echoed at the top of the response in this exact format:
```
MSG-NNN (post-compaction) | [YYYY-MM-DD HH:MM TZ]

> **You said:**
> P1. {first paragraph verbatim}
> P2. {second paragraph verbatim}

---
{response here}
```
- Counter resets to MSG-001 after compaction — note `(post-compaction)` on first echo
- Counter increments ONLY on user-typed messages — NOT on system-reminder tags, tool confirmations, or background task notifications
- NEVER skip the echo. Even "yes" or "ok" gets echoed as P1.

### 2. Platform Conventions — MANDATORY
- All FE routes: `/m/{module-slug}/{feature}` — NO org scope in URL ever
- All BE routes: `/api/{module-slug}/api/v1/{scope}/{scope-id}/{resource}` — see uri-conventions.md
- Approved shortcuts ONLY: `configs` (not configurations), `orgs`, `apps`, `refs`
- NEVER use `configurations`, `deploys`, `deps`, `notifs` in any URI
- Source of truth: `zorbit-core/platform-spec/uri-conventions.md`

### 3. Sync Locations — update after EVERY completed task
- **User Stories**: Notion → Zorbit Platform → User Stories database
  - URL: https://www.notion.so/6ff5d0e1e20b43178ddf27ee07a6fe53
  - collection://103bb3d2-13e9-4d60-a0c8-8ce37234065c
- **Test Plans**: Kiwi TCMS at kiwi.scalatics.com (27 test plans, TU-* prefix)
- Link: Notion stories have a "Kiwi Test URL" field pointing to their Kiwi test plan

### 4. Active Platform Plan
5 epics in execution order — see `zorbit-core/platform-spec/epics-module-registry-revamp.md`:
- EPIC 1: `zorbit-cor-module_registry` (new repo, port 3015/3115)
- EPIC 2: Manifest v2 + PCG4 as reference implementation
- EPIC 3: Navigation service decoupling (subscribes to Kafka, no more seed files)
- EPIC 4: FE route migration to `/m/...` pattern
- EPIC 5: Micro-frontend lazy loading

### 5. menuSource = 'static' — NO SHORTCUT
The sidebar footer source indicator MUST stay `'static'` until the FULL pipeline works:
`Module → Kafka (platform.module.announcements) → module-registry → platform.module.ready → navigation service → /menu endpoint`
Do NOT set menuSource to 'database' just because the navigation service returns data.

### 6. Module Registry Pipeline — THE LAW (no exceptions, no shortcuts)
```
Module starts up
  → publishes HMAC-signed announcement to Kafka (platform-module-announcements)
  → zorbit-cor-module_registry consumes it
  → validates HMAC-SHA256(canonical_json(payload), PLATFORM_MODULE_SECRET)
  → fetches manifest from manifestUrl
  → stores module as PENDING → READY
  → publishes platform.module.ready to Kafka
  → pushes WebSocket to eligible users

Navigation, sidebar, everything else:
  → reads from module registry
  → NEVER registers modules itself
  → NEVER owns menu content
```

Each module needs:
1. `zorbit-module-manifest.json` (v2: placement, registration, /m/... feRoutes)
2. `GET /api/v1/G/manifest` endpoint
3. Startup Kafka publisher — HMAC-signed, manifestUrl = `https://zorbit-uat.onezippy.ai/api/{slug}/api/v1/G/manifest`

Renaming: CREATE FRESH REPOS with correct names. Old repos stay alive in parallel until stable, then delete. No tech debt before first demo. Decision: 2026-04-19.
New repos to create:
- zorbit-identity → zorbit-cor-identity
- zorbit-authorization → zorbit-cor-authorization
- zorbit-navigation → zorbit-cor-navigation
- zorbit-event_bus → zorbit-cor-event_bus
- zorbit-pii-vault → zorbit-cor-pii_vault
- zorbit-audit → zorbit-cor-audit

Transition tracker: `/Users/s/.claude/projects/-Users-s-workspace-zorbit/memory/project_module_transition_tracker.md`
Full spec: `zorbit-core/platform-spec/epics-module-registry-revamp.md`

### 7. Memory files
Read `/Users/s/.claude/projects/-Users-s-workspace-zorbit/memory/MEMORY.md` for full context on this project (environments, decisions, backlog, feedback rules).

---

## Session Communication (Skill 1021)

When you need to communicate with the user asynchronously, use the session communicator at gmeet.scalatics.com:

```bash
# Status update
curl -X POST https://gmeet.scalatics.com/api/request \
  -H "Content-Type: application/json" \
  -d '{"project_id":"CP-003","summary":"Your message here","type":"status"}'

# Need a decision
curl -X POST https://gmeet.scalatics.com/api/request \
  -H "Content-Type: application/json" \
  -d '{"project_id":"CP-003","summary":"Which option?","type":"decision","options":"1) A 2) B"}'

# Share for review
curl -X POST https://gmeet.scalatics.com/api/request \
  -H "Content-Type: application/json" \
  -d '{"project_id":"CP-003","summary":"Ready for review","type":"review","details":"https://link"}'
```

Types: permission, decision, info, review, status, brainstorm, feedback.
Check pending: `curl https://gmeet.scalatics.com/api/requests?status=pending`

## Purpose

This repository implements the Unified Console for the Zorbit platform.

> **Note:** This repository is named `zorbit-unified-console`. The name "admin-console" is retired — do not use it anywhere.

Zorbit is a MACH-compliant shared platform infrastructure used to build enterprise applications.

The Unified Console is a React single-page application (SPA) that provides a unified management UI for all Zorbit platform services. It is a frontend application, not a backend service.

## Responsibilities

- Provide a centralized unified UI for managing the Zorbit platform
- Authenticate users via the Identity service (JWT-based)
- Display and manage users, organizations, roles, and privileges
- Manage customers from the sample-customer-service (demonstrating a business app)
- View audit logs, messaging topics, dead letter queues
- Manage navigation menus and route registrations
- View PII Vault access audit logs (audit view only, no raw PII shown)
- Link to Swagger UI documentation for each backend service
- Provide demo data seeding and cleanup tools

## Architecture Context

This is a frontend SPA that consumes REST APIs from Zorbit backend services.

Key rules:

- All API calls go through an Axios instance with JWT auth interceptor
- On 401 response, tokens are cleared and user is redirected to /login
- Organization context is derived from the JWT token
- PII values are never displayed — only PII tokens (e.g., PII-92AF)
- API endpoints are configurable via environment variables
- Default paths use nginx reverse proxying (/api/identity -> identity service)

## Dependencies

Allowed dependencies:

- All Zorbit backend services (via REST API calls)

Forbidden dependencies:

- Direct database access to any service
- Cross-service code imports
- Server-side rendering

## Platform Dependencies

Upstream services (consumed APIs):
- zorbit-identity (authentication, users, organizations)
- zorbit-authorization (roles, privileges)
- zorbit-navigation (menu management, routes)
- zorbit-messaging (topics, DLQ, health)
- zorbit-audit (audit event logs)
- zorbit-pii-vault (PII token audit logs)
- sample-customer-service (customer management)

Downstream consumers:
- None (this is a leaf UI application)

## Repository Structure

```
/src
  /components
    /layout         Sidebar, Header, Layout shell
    /shared         DataTable, StatusBadge, Modal, Card, Toast
  /pages
    /auth           Login, Register pages
    /dashboard      Dashboard with summary cards
    /users          User management
    /organizations  Organization management
    /roles          Role and privilege management
    /customers      Customer management (PII-tokenized)
    /audit          Audit log viewer with filters
    /messaging      Kafka topics and DLQ viewer
    /navigation-admin  Menu item CRUD
    /pii-vault      PII access audit log
    /api-docs       Links to service Swagger UIs
    /settings       User profile and API config
    /demo           Demo data seeding and gallery
  /services         API client functions (Axios)
  /hooks            useAuth, useApi custom hooks
  /config.ts        API endpoint configuration
  /App.tsx          Route definitions
  /main.tsx         Application entry point
  /index.css        Tailwind CSS imports and custom classes
/public             Static assets
index.html          HTML entry point
Dockerfile          Multi-stage build (Node -> Nginx)
nginx.conf          Reverse proxy config for API routing
```

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (with Vite proxy to backend services)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on port 5173. Vite proxies API requests to backend services:
- /api/identity -> localhost:3099
- /api/authorization -> localhost:3098
- /api/navigation -> localhost:3097
- /api/messaging -> localhost:3096
- /api/pii-vault -> localhost:3095
- /api/audit -> localhost:3094
- /api/customer -> localhost:3093

## Events Published

None (frontend-only application).

## Events Consumed

None (frontend-only application).

## API Endpoints

This application does not expose API endpoints. It consumes APIs from:

| Service | Base Path | Backend Port |
|---------|-----------|-------------|
| Identity | /api/identity | 3099 |
| Authorization | /api/authorization | 3098 |
| Navigation | /api/navigation | 3097 |
| Messaging | /api/messaging | 3096 |
| PII Vault | /api/pii-vault | 3095 |
| Audit | /api/audit | 3094 |
| Customer | /api/customer | 3093 |

## Development Guidelines

Follow Zorbit architecture rules:
- Use Tailwind CSS classes, not inline styles
- All API calls go through the shared Axios instance (src/services/api.ts)
- New pages follow the pattern: header with title + action button, optional filter bar, data table
- Reuse shared components (DataTable, Modal, StatusBadge, Card, Toast)
- PII values must never be displayed in the UI
- Keep organization context from JWT token
- Responsive design (sidebar collapses on mobile)

# Overnight Execution Plan — AWNIC Demo (Apr 8 Afternoon)

## Objective
Deliver a complete, demonstrable AWNIC insurance flow covering:
1. Full lifecycle: Org → Users → Product → Rates → Application → UW → Payment → Policy PDF
2. Multi-persona: Broker org, internal sales, telesales
3. Aggregator API: REST API for leads from insurancemarket.ae / policybazaar.ae
4. Channel analytics: Which channel brings what volume/premium
5. Improved Policy PDF: Professional with branding, watermarks, proper layout
6. E2E bundle: ./runme.sh runs everything

---

## Soldier Deployment Waves

### Wave 1: Core PFS Services (4 soldiers)

**Soldier 1: Document Generator PFS (zorbit-pfs-doc_generator)**
- NestJS service on port 3032 (moved from 3026/3126 on 2026-04-22 — seniority rule)
- POST /api/v1/O/:orgId/doc-generator/render — accepts JSON + template → returns PDF
- POST /api/v1/O/:orgId/doc-generator/render-html — accepts HTML → returns PDF
- Templates: policy-certificate, quotation-summary, premium-breakdown
- Uses Puppeteer (not PDFKit) for beautiful HTML→PDF conversion
- Header/footer with org branding, watermarks, page breaks
- Must produce a MUCH better policy PDF than current one

**Soldier 2: Payment Gateway PFS (zorbit-pfs-payment_gateway)**
- Extract payment logic from zorbit-app-uw_workflow
- NestJS service on port 3028/3128
- POST /generate-link — creates payment with gateway page URL
- POST /complete — completes payment (public endpoint)
- GET /status — check payment status
- Support multiple gateways: test (mock), stripe, paytabs
- uw_workflow calls this PFS instead of doing it internally

**Soldier 3: Improve UW Workflow — FQP + Queue Routing**
- Ensure UW workflow properly routes by product/premium/region
- Add queue privilege checks (underwriter sees only entitled queues)
- Wire Kafka consumer for hi_quotation.quotation.submitted events
- Add approve-with-loading, add-exclusion, add-waiting-period actions
- After approval → call Payment Gateway PFS to generate link
- After payment complete → call Doc Generator PFS for policy PDF
- Rename events to hi_uw_* prefix for clarity

**Soldier 4: Broker Organization + Multi-Persona**
- Add broker_org concept to zorbit-identity (org type: broker)
- Brokers belong to broker org with capability tiers
- Broker creates application on behalf of customer
- Application tracks: channel (direct/broker/telesales/aggregator), broker hashId
- Broker dashboard: see all their applications, follow-up status
- Broker reassignment: when broker leaves, reassign applications

### Wave 2: Channel + Analytics + Frontend (4 soldiers, after Wave 1)

**Soldier 5: Aggregator API + Channel Tracking**
- REST API for aggregator leads: POST /api/v1/O/:orgId/hi-quotation/leads
- Lead → auto-creates quotation with channel=aggregator, source=insurancemarket.ae
- Channel field on quotation: direct, broker, telesales, aggregator, field_sales
- Source field: portal, broker_app, call_center, insurancemarket.ae, policybazaar.ae

**Soldier 6: Channel Analytics Dashboard**
- GET /api/v1/O/:orgId/hi-quotation/analytics/channels — volume/premium by channel
- GET /api/v1/O/:orgId/hi-quotation/analytics/brokers — per-broker performance
- GET /api/v1/O/:orgId/hi-quotation/analytics/aggregators — per-aggregator conversion
- Frontend dashboard page with charts

**Soldier 7: Frontend — Broker Portal Pages**
- Broker login → sees broker dashboard
- Application list filtered by broker
- Create application on behalf of customer
- Follow-up tracking
- Application reassignment UI (admin/manager view)

**Soldier 8: E2E Test Config Update**
- Update awnic-demo.json with new flows
- Add broker persona journey
- Add telesales persona journey
- Add aggregator API journey
- Update policy PDF download verification
- Bundle update with all new configs

### Wave 3: Polish + Deploy + Test (after Wave 2)

**Soldier 9: Build + Deploy all services**
- Build all changed services
- Deploy to server via rsync
- Update .env files
- PM2 restart
- Health check all services

**Soldier 10: Full E2E Test Run**
- Run complete awnic-demo.json
- Verify all personas
- Verify policy PDF quality
- Capture screenshots
- Generate results.json

---

## Priority Order (if time is short)

If we can't finish everything, the MUST-HAVES for the demo:
1. Improved Policy PDF (via Doc Generator PFS) — current one is embarrassing
2. UW Workflow FQP improvement — queues, approve with loading
3. Payment Gateway cleanup — professional payment page
4. At minimum ONE broker flow in E2E
5. Channel field on quotation (even if analytics dashboard is basic)

NICE-TO-HAVES:
6. Aggregator REST API
7. Channel analytics dashboard with charts
8. Telesales persona
9. Broker reassignment

---

## Service Dependency Graph

```
PCG4 → Product Pricing → HI Quotation → UW Workflow → Payment Gateway PFS → Doc Generator PFS
                              |                |
                              |                └→ HI UW Decisioning (AI queue participant)
                              |
                              └→ PII Vault (tokenization)
```

## Naming Convention (per user directive)
- zorbit-app-hi_quotation — Health Insurance Retail/Individual Quotation
- zorbit-app-hi_uw_workflow — Health Insurance Underwriting Workflow (rename from uw_workflow)
- zorbit-app-hi_uw_decisioning — Health Insurance UW Decisioning (rename from hi_decisioning)
- zorbit-pfs-doc_generator — Document Generator Platform Service
- zorbit-pfs-payment_gateway — Payment Gateway Platform Service
- zorbit-pfs-dms — Document Management System Platform Service (future)

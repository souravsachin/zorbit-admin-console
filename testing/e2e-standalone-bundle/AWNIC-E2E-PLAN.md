# AWNIC End-to-End Demo Plan

## Date: 2026-04-06
## Goal: Complete AWNIC insurance flow from org creation to policy PDF

---

## CURRENT STATE (Verified)

### Services Running (server 85.25.93.171)
| Service | Port | Status |
|---------|------|--------|
| zorbit-identity | 3099 | OK |
| zorbit-authorization | 3102 | OK |
| zorbit-navigation | 3103 | OK |
| zorbit-pii-vault | 3105 | Running (100% CPU - needs check) |
| zorbit-audit | 3106 | OK |
| zorbit-pfs-product_pricing | 3125 | OK (healthy) |
| zorbit-pfs-form_builder | 3114 | OK |
| zorbit-app-pcg4 | 3111 | OK |
| zorbit-app-hi_quotation | 3117 | OK (MISSING: PRODUCT_PRICING_URL) |
| zorbit-app-uw_workflow | 3115 | Running (100% CPU - needs check) |
| zorbit-app-hi_decisioning | 3116 | OK |
| zorbit-pfs-verification | 3124 | OK |

### Code Changes Ready (Not Yet Deployed)
1. hi_quotation backend: pricing integration (calls product_pricing API)
2. Unified console frontend: form -> quotation bridge (RegionalFormPage.tsx)
3. Both build clean locally

### Known Gaps
1. PRODUCT_PRICING_URL not set in hi_quotation server .env
2. PII vault at 100% CPU
3. UW workflow at 100% CPU
4. PII tokenization has graceful degradation (stores raw on vault failure)

---

## EXECUTION PLAN

### Phase 1: Fix Critical Issues
1.1 Investigate PII vault 100% CPU - restart if needed
1.2 Investigate UW workflow 100% CPU - restart if needed
1.3 Harden PII tokenization: FAIL on vault error, don't store raw
1.4 Add PRODUCT_PRICING_URL to hi_quotation .env on server

### Phase 2: Deploy Changes
2.1 Build + deploy hi_quotation backend (pricing integration)
2.2 Build + deploy unified console frontend (form->quotation bridge)
2.3 Verify all services healthy after deploy

### Phase 3: API-Level Integration Test (No Browser)
Test each integration point via curl/API:
3.1 Login -> get JWT
3.2 Create quotation with PII fields -> verify tokens in MongoDB
3.3 Add member with PII -> verify tokens
3.4 Calculate premium -> verify real rate from product_pricing
3.5 Submit quotation -> verify UW workflow ingested
3.6 Generate payment link -> verify link returned
3.7 Complete payment -> verify status updated
3.8 Issue policy -> verify PDF generated
3.9 Download policy PDF -> verify file streams

### Phase 4: Frontend E2E Test (Playwright)
Run the full AWNIC E2E config through Playwright:
4.1 Login
4.2 Create org (or use existing)
4.3 Create role + user (optional, may exist)
4.4 PCG4 8-step product configuration
4.5 Rate table view/verify
4.6 New HI application (UAE form)
4.7 Verify quotation created in backend
4.8 UW workflow queue - find quotation
4.9 Approve quotation
4.10 Payment page
4.11 Policy issuance
4.12 Download policy PDF

### Phase 5: PII Verification
5.1 After quotation creation, query MongoDB directly
5.2 Verify all PII fields are PII-XXXX tokens (not raw values)
5.3 Verify detokenization works (API call with auth)

---

## TEST PLAN

### Test 1: PII Tokenization (API)
```
POST /hi-quotation/quotations with proposer PII
ASSERT: MongoDB stores PII-XXXX tokens for firstName, lastName, email, mobile, emiratesId
ASSERT: PII vault failure -> quotation creation FAILS (not raw storage)
```

### Test 2: Pricing Integration (API)
```
POST /hi-quotation/quotations (with rateTableHashId=RT-1C09, network=CN, copay=0%)
POST /hi-quotation/quotations/:id/members (age 35, Male)
GET  /hi-quotation/quotations/:id/premium
ASSERT: totalPremium > 0
ASSERT: breakdown.pricingSource = "product_pricing"
ASSERT: memberPremiums[0].netRate = 8840.86 (known Dubai CN Male 35 rate)
```

### Test 3: Quotation -> UW Pipeline (API)
```
POST /hi-quotation/quotations/:id/submit
ASSERT: status = "submitted"
ASSERT: quotationNumber = QN-YYYY-NNNNNN
GET  /uw-workflow/queues/stats
ASSERT: new quotation appears in queue
```

### Test 4: Payment Flow (API)
```
POST /uw-workflow/payments/generate-link (quotationHashId)
ASSERT: paymentLink returned
ASSERT: payment status = "pending"
POST /uw-workflow/payments/:id/complete
ASSERT: payment status = "completed"
ASSERT: quotation status = "payment_received"
```

### Test 5: Policy Issuance (API)
```
POST /uw-workflow/policies/issue (quotationHashId)
ASSERT: policyNumber = POL-XXXX
ASSERT: PDF file exists on server
GET  /uw-workflow/policies/:id/pdf
ASSERT: response content-type = application/pdf
ASSERT: response body is valid PDF (starts with %PDF)
```

### Test 6: Full E2E (Playwright)
```
Run awnic-demo.json config
ASSERT: All 7 journeys pass
ASSERT: Screenshots captured at each step
ASSERT: HAR files captured
ASSERT: Policy PDF downloadable at end
```

---

## SUCCESS CRITERIA

- [ ] All PII stored as tokens in MongoDB (zero raw PII)
- [ ] Premium comes from product_pricing service (not hardcoded)
- [ ] Quotation submission creates UW workflow entry
- [ ] Payment link generates and completes
- [ ] Policy PDF generated and downloadable
- [ ] Full Playwright E2E passes all segments
- [ ] User can manually test the flow end-to-end in browser

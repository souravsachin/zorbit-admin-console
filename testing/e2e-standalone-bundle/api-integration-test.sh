#!/bin/bash
# E2E API Integration Test
# Tests the complete flow: quotation → PII → pricing → UW → payment → policy
set -e

HOST="${1:-localhost}"
echo "=== API Integration Test ==="
echo "Host: $HOST"
echo ""

# Step 1: Register/Login
echo "--- Step 1: Login ---"
LOGIN_RESULT=$(curl -s -X POST "http://$HOST:3099/api/v1/G/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"api-test-'$$'@zorbit.com","password":"ApiTest@123","displayName":"API Test '$$'","organizationId":"O-92AF"}')
TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tokens',{}).get('accessToken',''))" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "  FAIL: Could not get token"
  echo "  Response: $LOGIN_RESULT"
  exit 1
fi
echo "  PASS: Got JWT token"

ORG="O-92AF"
AUTH="Authorization: Bearer $TOKEN"

# Step 2: Create Quotation with PII
echo ""
echo "--- Step 2: Create Quotation with PII ---"
QT_RESULT=$(curl -s -X POST "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/quotations" \
  -H "Content-Type: application/json" \
  -H "$AUTH" \
  -d '{
    "quotationType": "retail",
    "region": "UAE",
    "productHashId": "PRD-TEST",
    "productName": "AWNIC NAS Health",
    "rateTableHashId": "RT-1C09",
    "network": "CN",
    "copay": "0%",
    "proposer": {
      "firstName": "Ahmed",
      "lastName": "Al Maktoum",
      "email": "ahmed.apitest@example.com",
      "mobile": "+971501234567",
      "dateOfBirth": "1991-03-15",
      "emiratesId": "784-1991-1234567-1",
      "passportNumber": "P1234567"
    }
  }')

QT_HASH=$(echo "$QT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('hashId',''))" 2>/dev/null)
QT_NUM=$(echo "$QT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('quotationNumber',''))" 2>/dev/null)
PROP_FNAME=$(echo "$QT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('proposer',{}).get('firstName',''))" 2>/dev/null)
PROP_EMAIL=$(echo "$QT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('proposer',{}).get('email',''))" 2>/dev/null)
PROP_EID=$(echo "$QT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('proposer',{}).get('emiratesId',''))" 2>/dev/null)

if [ -z "$QT_HASH" ]; then
  echo "  FAIL: Quotation not created"
  echo "  Response: $QT_RESULT"
  exit 1
fi

echo "  Quotation: $QT_HASH ($QT_NUM)"
echo "  proposer.firstName: $PROP_FNAME"
echo "  proposer.email: $PROP_EMAIL"
echo "  proposer.emiratesId: $PROP_EID"

# PII Check
if echo "$PROP_FNAME" | grep -q "^PII-"; then
  echo "  PII CHECK: PASS - firstName tokenized"
else
  echo "  PII CHECK: FAIL - firstName NOT tokenized (raw: $PROP_FNAME)"
fi
if echo "$PROP_EMAIL" | grep -q "^PII-"; then
  echo "  PII CHECK: PASS - email tokenized"
else
  echo "  PII CHECK: FAIL - email NOT tokenized (raw: $PROP_EMAIL)"
fi
if echo "$PROP_EID" | grep -q "^PII-"; then
  echo "  PII CHECK: PASS - emiratesId tokenized"
else
  echo "  PII CHECK: FAIL - emiratesId NOT tokenized (raw: $PROP_EID)"
fi

# Step 3: Add Member
echo ""
echo "--- Step 3: Add Member ---"
MEM_RESULT=$(curl -s -X POST "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/quotations/$QT_HASH/members" \
  -H "Content-Type: application/json" \
  -H "$AUTH" \
  -d '{
    "relationship": "self",
    "personalDetails": {
      "firstName": "Ahmed",
      "lastName": "Al Maktoum",
      "dateOfBirth": "1991-03-15",
      "gender": "Male",
      "height": 175,
      "weight": 80,
      "emiratesId": "784-1991-1234567-1",
      "nationality": "UAE"
    }
  }')

MEM_FNAME=$(echo "$MEM_RESULT" | python3 -c "
import sys,json
d=json.load(sys.stdin)
members = d.get('medicalApplicationForm',{}).get('members',[])
if members:
    pd = members[-1].get('personalDetails',{})
    print(pd.get('firstName',''))
else:
    print('')
" 2>/dev/null)

if echo "$MEM_FNAME" | grep -q "^PII-"; then
  echo "  PASS: Member added, PII tokenized (firstName=$MEM_FNAME)"
else
  echo "  Member added (firstName=$MEM_FNAME)"
  echo "  Response snippet: $(echo "$MEM_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(str(d)[:200])" 2>/dev/null)"
fi

# Step 4: Calculate Premium
echo ""
echo "--- Step 4: Calculate Premium ---"
PREMIUM_RESULT=$(curl -s -X GET "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/quotations/$QT_HASH/premium" \
  -H "$AUTH")

TOTAL=$(echo "$PREMIUM_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); pb=d.get('premiumBreakdown',d); print(pb.get('totalPremium',pb.get('total','0')))" 2>/dev/null)
SOURCE=$(echo "$PREMIUM_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); pb=d.get('premiumBreakdown',d); print(pb.get('pricingSource',''))" 2>/dev/null)

echo "  Total Premium: $TOTAL"
echo "  Pricing Source: $SOURCE"
if [ "$SOURCE" = "product_pricing" ]; then
  echo "  PRICING CHECK: PASS - using real rate table"
elif [ -n "$TOTAL" ] && [ "$TOTAL" != "0" ] && [ "$TOTAL" != "None" ]; then
  echo "  PRICING CHECK: PARTIAL - premium calculated but source=$SOURCE"
else
  echo "  PRICING CHECK: FAIL - no premium calculated"
  echo "  Response: $PREMIUM_RESULT"
fi

# Step 5: Submit for UW
echo ""
echo "--- Step 5: Submit for Underwriting ---"
SUBMIT_RESULT=$(curl -s -X POST "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/quotations/$QT_HASH/submit" \
  -H "$AUTH")

STATUS=$(echo "$SUBMIT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
QN=$(echo "$SUBMIT_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('quotationNumber',''))" 2>/dev/null)

echo "  Status: $STATUS"
echo "  Quotation Number: $QN"
if [ "$STATUS" = "submitted" ]; then
  echo "  SUBMIT CHECK: PASS"
else
  echo "  SUBMIT CHECK: FAIL (status=$STATUS)"
  echo "  Response: $SUBMIT_RESULT"
fi

# Step 6: Check UW Queue
echo ""
echo "--- Step 6: Check UW Workflow Queue ---"
QUEUE_RESULT=$(curl -s "http://$HOST:3115/api/v1/O/$ORG/uw-workflow/queues/stats" \
  -H "$AUTH")
echo "  Queue stats: $(echo "$QUEUE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(str(d)[:300])" 2>/dev/null)"

# Step 7: Generate Payment Link
echo ""
echo "--- Step 7: Generate Payment Link ---"
PAY_RESULT=$(curl -s -X POST "http://$HOST:3115/api/v1/O/$ORG/uw-workflow/payments/generate-link" \
  -H "Content-Type: application/json" \
  -H "$AUTH" \
  -d "{\"quotationHashId\":\"$QT_HASH\",\"amount\":${TOTAL:-1050}}")

PAY_ID=$(echo "$PAY_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('paymentId','') or d.get('hashId',''))" 2>/dev/null)
PAY_LINK=$(echo "$PAY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('paymentLink',''))" 2>/dev/null)

echo "  Payment ID: $PAY_ID"
echo "  Payment Link: $PAY_LINK"
if [ -n "$PAY_ID" ]; then
  echo "  PAYMENT LINK CHECK: PASS"
else
  echo "  PAYMENT LINK CHECK: FAIL"
  echo "  Response: $PAY_RESULT"
fi

# Step 8: Complete Payment
echo ""
echo "--- Step 8: Complete Payment ---"
if [ -n "$PAY_ID" ]; then
  COMPLETE_RESULT=$(curl -s -X POST "http://$HOST:3115/api/v1/G/uw-workflow/payments/$PAY_ID/complete" \
    -H "Content-Type: application/json" \
    -d '{"transactionId":"TXN-TEST-'$$'","gateway":"test"}')
  PAY_STATUS=$(echo "$COMPLETE_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
  echo "  Payment Status: $PAY_STATUS"
  if [ "$PAY_STATUS" = "completed" ]; then
    echo "  PAYMENT CHECK: PASS"
  else
    echo "  PAYMENT CHECK: FAIL (status=$PAY_STATUS)"
    echo "  Response: $COMPLETE_RESULT"
  fi
else
  echo "  SKIPPED (no payment ID)"
fi

# Step 9: Issue Policy
echo ""
echo "--- Step 9: Issue Policy ---"
POLICY_RESULT=$(curl -s -X POST "http://$HOST:3115/api/v1/O/$ORG/uw-workflow/policies/issue" \
  -H "Content-Type: application/json" \
  -H "$AUTH" \
  -d "{\"quotationHashId\":\"$QT_HASH\",\"paymentId\":\"$PAY_ID\"}")

POL_NUM=$(echo "$POLICY_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); p=d.get('policy',d); print(p.get('policyNumber',''))" 2>/dev/null)
POL_HASH=$(echo "$POLICY_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); p=d.get('policy',d); print(p.get('policyHashId','') or p.get('hashId',''))" 2>/dev/null)
echo "  Full response keys: $(echo "$POLICY_RESULT" | python3 -c "import sys,json; print(list(json.load(sys.stdin).keys()))" 2>/dev/null)"

echo "  Policy Number: $POL_NUM"
echo "  Policy HashId: $POL_HASH"
if [ -n "$POL_NUM" ]; then
  echo "  POLICY CHECK: PASS"
else
  echo "  POLICY CHECK: FAIL"
  echo "  Response: $POLICY_RESULT"
fi

# Step 10: Download Policy PDF
echo ""
echo "--- Step 10: Download Policy PDF ---"
if [ -n "$POL_HASH" ]; then
  PDF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST:3115/api/v1/O/$ORG/uw-workflow/policies/$POL_HASH/pdf" -H "$AUTH")
  PDF_TYPE=$(curl -s -I "http://$HOST:3115/api/v1/O/$ORG/uw-workflow/policies/$POL_HASH/pdf" -H "$AUTH" | grep -i content-type | head -1)
  echo "  HTTP Status: $PDF_STATUS"
  echo "  Content-Type: $PDF_TYPE"
  if [ "$PDF_STATUS" = "200" ]; then
    echo "  PDF CHECK: PASS"
  else
    echo "  PDF CHECK: FAIL (HTTP $PDF_STATUS)"
  fi
else
  echo "  SKIPPED (no policy hash)"
fi

# Step 11: Test Aggregator Lead API
echo ""
echo "--- Step 11: Aggregator Lead API ---"
LEAD_RESULT=$(curl -s -X POST "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/leads" \
  -H "Content-Type: application/json" \
  -H "$AUTH" \
  -d '{
    "source": "insurancemarket.ae",
    "referralCode": "IM-2026-TEST-'$$'",
    "proposer": { "firstName": "Sara", "lastName": "Khan", "email": "sara.lead@test.com", "mobile": "+971509876543", "dateOfBirth": "1988-05-20" },
    "product": { "code": "NAS-DXB", "name": "AWNIC NAS Health" },
    "members": [{ "relationship": "self", "firstName": "Sara", "lastName": "Khan", "dateOfBirth": "1988-05-20", "gender": "Female" }]
  }')
LEAD_HASH=$(echo "$LEAD_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('hashId',''))" 2>/dev/null)
LEAD_CHANNEL=$(echo "$LEAD_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('channel',''))" 2>/dev/null)
if [ "$LEAD_CHANNEL" = "aggregator" ]; then
  echo "  LEAD CHECK: PASS (hashId=$LEAD_HASH, channel=$LEAD_CHANNEL)"
else
  echo "  LEAD CHECK: FAIL (channel=$LEAD_CHANNEL)"
  echo "  Response: $(echo "$LEAD_RESULT" | head -c 200)"
fi

# Step 12: Channel Analytics
echo ""
echo "--- Step 12: Channel Analytics ---"
ANALYTICS_RESULT=$(curl -s "http://$HOST:3117/api/v1/O/$ORG/hi-quotation/analytics/channels" -H "$AUTH")
echo "  Analytics: $(echo "$ANALYTICS_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d if isinstance(d,list) else str(d)[:200])" 2>/dev/null)"

# Step 13: DocGenerator PFS Health
echo ""
echo "--- Step 13: DocGenerator PFS ---"
DOCGEN_HEALTH=$(curl -s "http://$HOST:3136/api/v1/G/doc-generator/health" 2>/dev/null)
DOCGEN_STATUS=$(echo "$DOCGEN_HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
if [ "$DOCGEN_STATUS" = "ok" ]; then
  echo "  DOCGEN CHECK: PASS (healthy, puppeteer running)"
else
  echo "  DOCGEN CHECK: FAIL"
  echo "  Response: $DOCGEN_HEALTH"
fi

echo ""
echo "=== Integration Test Complete ==="
echo "  Quotation: $QT_HASH ($QT_NUM)"
echo "  Premium: $TOTAL (source: $SOURCE)"
echo "  Payment: $PAY_ID"
echo "  Policy: $POL_NUM ($POL_HASH)"
echo "  Lead: $LEAD_HASH (channel: $LEAD_CHANNEL)"

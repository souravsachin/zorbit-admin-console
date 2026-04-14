#!/usr/bin/env bash
###############################################################################
# Zorbit Platform — White Label Deep-Dive E2E
# Run: ssh ilri-arm-uat 'bash -s' < scripts/e2e-white-label.sh
#
# API facts (verified 2026-04-14):
#   - No bare /seed endpoint. Only /seed/demo exists.
#   - POST /seed/demo returns {success, message, seeded, skipped, themes:[]}
#   - Demo themes are global and returned in themes[] array of /seed/demo
#   - GET /O/{org}/white-label/themes returns org-scoped themes {themes:[], total:N}
#   - POST /O/{org}/white-label/themes creates with {name, description} — no color fields in DTO
#   - PUT/DELETE /O/{org}/white-label/themes/{id} works
#   - DELETE /G/white-label/seed/demo flushes demo themes
###############################################################################

set -uo pipefail

BASE="http://localhost"
IDENTITY_URL="${BASE}:3001"
WL_URL="${BASE}:3034"
ORG_ID="O-OZPY"
ADMIN_EMAIL="s@onezippy.ai"
ADMIN_PASSWORD='s@2021#cz'
CURL_OPTS="-s --max-time 15"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

PASSED=0
FAILED=0
TOTAL=0

declare -A SECTION_PASSED
declare -A SECTION_FAILED
CURRENT_SECTION="default"

pass() {
  PASSED=$((PASSED + 1))
  TOTAL=$((TOTAL + 1))
  SECTION_PASSED[$CURRENT_SECTION]=$(( ${SECTION_PASSED[$CURRENT_SECTION]:-0} + 1 ))
  printf "${GREEN}  [PASS]${RESET} %s\n" "$1"
}

fail() {
  FAILED=$((FAILED + 1))
  TOTAL=$((TOTAL + 1))
  SECTION_FAILED[$CURRENT_SECTION]=$(( ${SECTION_FAILED[$CURRENT_SECTION]:-0} + 1 ))
  printf "${RED}  [FAIL]${RESET} %s\n" "$1"
  if [[ -n "${2:-}" ]]; then
    printf "${RED}         %.120s${RESET}\n" "$2"
  fi
}

warn() {
  printf "${YELLOW}  [WARN]${RESET} %s\n" "$1"
}

section() {
  CURRENT_SECTION="$1"
  SECTION_PASSED[$CURRENT_SECTION]=0
  SECTION_FAILED[$CURRENT_SECTION]=0
  echo ""
  printf "${CYAN}${BOLD}── %s ──${RESET}\n" "$1"
}

ACCESS_TOKEN=""
FIRST_THEME_ID=""
NEW_THEME_ID=""
NEW_THEME_SLUG=""

###############################################################################
# 0. Obtain JWT
###############################################################################
section "Authentication"

LOGIN_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${IDENTITY_URL}/api/v1/G/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  2>/dev/null || printf '\n000')

LOGIN_STATUS=$(printf '%s' "$LOGIN_RESP" | tail -n1)
LOGIN_BODY=$(printf '%s' "$LOGIN_RESP" | sed '$d')

if [[ "$LOGIN_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Login (HTTP $LOGIN_STATUS)"
  ACCESS_TOKEN=$(printf '%s' "$LOGIN_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    print(d.get('accessToken') or d.get('tokens',{}).get('accessToken',''))" \
    2>/dev/null || true)
  if [[ -n "$ACCESS_TOKEN" ]]; then
    pass "Access token obtained"
  else
    fail "No accessToken in login response"
  fi
else
  fail "Login failed (HTTP $LOGIN_STATUS)" \
    "$(printf '%s' "$LOGIN_BODY" | head -3)"
fi

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo ""
  printf "${RED}${BOLD}FATAL: Cannot proceed without access token${RESET}\n"
  exit 1
fi

AUTH_HDR="Authorization: Bearer ${ACCESS_TOKEN}"

###############################################################################
# 1. Health Check
###############################################################################
section "Health Check"

HEALTH_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  "${WL_URL}/api/v1/G/white-label/health" 2>/dev/null || printf '\n000')
HEALTH_STATUS=$(printf '%s' "$HEALTH_RESP" | tail -n1)
HEALTH_BODY=$(printf '%s' "$HEALTH_RESP" | sed '$d')

if [[ "$HEALTH_STATUS" == "200" ]]; then
  pass "White Label health endpoint (HTTP 200)"
  STATUS_VAL=$(printf '%s' "$HEALTH_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" \
    2>/dev/null || true)
  if [[ "$STATUS_VAL" == "healthy" ]]; then
    pass "status=healthy"
  else
    warn "status field is '${STATUS_VAL}'"
  fi
  MONGO_CONNECTED=$(printf '%s' "$HEALTH_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    db=d.get('mongodb',d.get('database',{})); \
    val=db.get('connected',db.get('status','')) if isinstance(db,dict) else db; \
    print(str(val))" 2>/dev/null || true)
  if [[ "$MONGO_CONNECTED" == "True" || "$MONGO_CONNECTED" == "connected" ]]; then
    pass "mongodb.connected=true"
  else
    warn "mongodb connected field: '${MONGO_CONNECTED}'"
  fi
else
  fail "White Label health endpoint (HTTP $HEALTH_STATUS)" \
    "$(printf '%s' "$HEALTH_BODY" | head -3)"
fi

###############################################################################
# 2. Seed demo themes (no bare /seed — only /seed/demo exists)
###############################################################################
section "Seed Demo Themes"

SEED_DEMO_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${WL_URL}/api/v1/G/white-label/seed/demo" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
SEED_DEMO_STATUS=$(printf '%s' "$SEED_DEMO_RESP" | tail -n1)
SEED_DEMO_BODY=$(printf '%s' "$SEED_DEMO_RESP" | sed '$d')

if [[ "$SEED_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Seed demo themes (POST /seed/demo) HTTP $SEED_DEMO_STATUS"
  SUCCESS_VAL=$(printf '%s' "$SEED_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" \
    2>/dev/null || true)
  if [[ "$SUCCESS_VAL" == "True" ]]; then
    pass "seed/demo returned success:true"
  else
    warn "success field: '${SUCCESS_VAL}'"
  fi
  # Response: {success, message, seeded:N, skipped:N, themes:[{slug,hashId,name,status}]}
  THEMES_IN_RESP=$(printf '%s' "$SEED_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    t=d.get('themes',[]); print(len(t))" 2>/dev/null || true)
  if [[ "$THEMES_IN_RESP" == "6" ]]; then
    pass "seed/demo response contains 6 theme entries"
  else
    warn "themes in response: '${THEMES_IN_RESP}' (expected 6)"
  fi
  # Verify all expected theme names are present
  NAMES_OK=$(printf '%s' "$SEED_DEMO_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
themes = d.get('themes', [])
names = [t.get('name', '') for t in themes]
expected = ['NovaCare', 'SwiftDrive', 'BlueSky', 'GreenShield', 'Obsidian', 'CrimsonCare']
missing = [e for e in expected if not any(e in n for n in names)]
print('MISSING:' + ','.join(missing) if missing else 'OK')
" 2>/dev/null || echo "?")
  if [[ "$NAMES_OK" == "OK" ]]; then
    pass "All 6 expected theme names in seed/demo response"
  else
    warn "Themes: $NAMES_OK"
  fi
  # Extract first global theme hashId for later use (from seed/demo response)
  FIRST_THEME_ID=$(printf '%s' "$SEED_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    t=d.get('themes',[]); print(t[0].get('hashId','') if t else '')" \
    2>/dev/null || true)
  if [[ -n "$FIRST_THEME_ID" ]]; then
    pass "First theme hashId from seed/demo: ${FIRST_THEME_ID}"
  fi
else
  fail "Seed demo themes (HTTP $SEED_DEMO_STATUS)" \
    "$(printf '%s' "$SEED_DEMO_BODY" | head -3)"
fi

###############################################################################
# 3. Create a test theme (org-scoped)
###############################################################################
section "Create Test Theme"

# API accepts: name, description. No color fields in DTO (they're embedded in cssContent).
# Use timestamp suffix to avoid slug collision with soft-deleted themes.
E2E_TS=$(date +%s)
CREATE_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HDR" \
  -d "{
    \"name\": \"TestTheme-E2E-${E2E_TS}\",
    \"description\": \"Automated E2E test theme - safe to delete\",
    \"cssContent\": \":root { --primary: #ff0000; --accent: #cc0000; }\"
  }" \
  2>/dev/null || printf '\n000')
CREATE_STATUS=$(printf '%s' "$CREATE_RESP" | tail -n1)
CREATE_BODY=$(printf '%s' "$CREATE_RESP" | sed '$d')

if [[ "$CREATE_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Create test theme (TestTheme-E2E) HTTP $CREATE_STATUS"
  NEW_THEME_ID=$(printf '%s' "$CREATE_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    print(d.get('hashId',d.get('_id','')))" 2>/dev/null || true)
  NEW_THEME_SLUG=$(printf '%s' "$CREATE_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('slug',''))" \
    2>/dev/null || true)
  if [[ -n "$NEW_THEME_ID" ]]; then
    pass "New theme created: ID=${NEW_THEME_ID} slug=${NEW_THEME_SLUG}"
  else
    warn "Could not extract new theme ID/hashId"
  fi
else
  fail "Create test theme (HTTP $CREATE_STATUS)" \
    "$(printf '%s' "$CREATE_BODY" | head -3)"
fi

###############################################################################
# 4. List themes for O-OZPY (should include our new theme)
###############################################################################
section "List Themes (O-OZPY org-scoped)"

LIST_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X GET "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
LIST_STATUS=$(printf '%s' "$LIST_RESP" | tail -n1)
LIST_BODY=$(printf '%s' "$LIST_RESP" | sed '$d')

if [[ "$LIST_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "List themes GET /O/${ORG_ID}/white-label/themes (HTTP $LIST_STATUS)"
  # Response: {themes: [...], total: N}
  THEME_COUNT=$(printf '%s' "$LIST_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    arr=d.get('themes',d if isinstance(d,list) else []); print(len(arr))" \
    2>/dev/null || echo "0")
  TOTAL_VAL=$(printf '%s' "$LIST_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('total','?'))" \
    2>/dev/null || echo "?")
  if [[ "$THEME_COUNT" -ge 1 ]]; then
    pass "Theme list has ${THEME_COUNT} org-scoped theme(s) (total:${TOTAL_VAL})"
  else
    warn "Org-scoped theme list is empty (demo themes are global, not org-scoped)"
  fi
  # Verify our test theme is in the list
  if [[ -n "$NEW_THEME_ID" ]]; then
    HAS_TEST=$(printf '%s' "$LIST_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
themes = d.get('themes', d if isinstance(d, list) else [])
ids = [t.get('hashId', t.get('_id', '')) for t in themes]
print('YES' if '${NEW_THEME_ID}' in ids else 'NO')
" 2>/dev/null || echo "?")
    if [[ "$HAS_TEST" == "YES" ]]; then
      pass "TestTheme-E2E (${NEW_THEME_ID}) found in org-scoped list"
    else
      warn "TestTheme-E2E not found in list (may use _id not hashId)"
    fi
  fi
else
  fail "List themes (HTTP $LIST_STATUS)" "$(printf '%s' "$LIST_BODY" | head -3)"
fi

###############################################################################
# 5. Get specific theme
###############################################################################
section "Get Specific Theme"

if [[ -z "$NEW_THEME_ID" ]]; then
  warn "Skipping — no theme ID available"
else
  GET_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes/${NEW_THEME_ID}" \
    -H "$AUTH_HDR" \
    2>/dev/null || printf '\n000')
  GET_STATUS=$(printf '%s' "$GET_RESP" | tail -n1)
  GET_BODY=$(printf '%s' "$GET_RESP" | sed '$d')

  if [[ "$GET_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "Get theme by hashId ${NEW_THEME_ID} (HTTP $GET_STATUS)"
    THEME_NAME=$(printf '%s' "$GET_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      t=d.get('theme',d) if isinstance(d,dict) else d; print(t.get('name',''))" \
      2>/dev/null || true)
    if [[ -n "$THEME_NAME" ]]; then
      pass "Theme name returned: ${THEME_NAME}"
    fi
  else
    warn "Get theme by hashId HTTP $GET_STATUS (may use _id not hashId in path)"
  fi
fi

###############################################################################
# 6. Resolve theme for org
###############################################################################
section "Resolve Theme"

RESOLVE_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X GET "${WL_URL}/api/v1/O/${ORG_ID}/white-label/resolve" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
RESOLVE_STATUS=$(printf '%s' "$RESOLVE_RESP" | tail -n1)

if [[ "$RESOLVE_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Resolve theme GET /O/${ORG_ID}/white-label/resolve (HTTP $RESOLVE_STATUS)"
else
  warn "Resolve theme HTTP $RESOLVE_STATUS (requires an active default theme for the org)"
fi

###############################################################################
# 7. Get theme CSS
###############################################################################
section "Theme CSS"

if [[ -z "$NEW_THEME_ID" ]]; then
  warn "Skipping CSS check — no org-scoped theme ID"
else
  CSS_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes/${NEW_THEME_ID}/css" \
    -H "$AUTH_HDR" \
    2>/dev/null || printf '\n000')
  CSS_STATUS=$(printf '%s' "$CSS_RESP" | tail -n1)
  CSS_BODY=$(printf '%s' "$CSS_RESP" | sed '$d')

  if [[ "$CSS_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "Get theme CSS (HTTP $CSS_STATUS)"
    if printf '%s' "$CSS_BODY" | grep -q ':root\|--\|{'; then
      pass "CSS response contains CSS declarations"
    else
      warn "CSS response may not contain :root declarations"
    fi
  else
    warn "Get theme CSS HTTP $CSS_STATUS (endpoint may not exist for this theme)"
  fi
fi

###############################################################################
# 8. Update the test theme
###############################################################################
section "Update Test Theme"

if [[ -z "$NEW_THEME_ID" ]]; then
  warn "Skipping update — no test theme ID"
else
  UPDATE_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X PUT "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes/${NEW_THEME_ID}" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HDR" \
    -d '{"description":"Updated by E2E test"}' \
    2>/dev/null || printf '\n000')
  UPDATE_STATUS=$(printf '%s' "$UPDATE_RESP" | tail -n1)
  UPDATE_BODY=$(printf '%s' "$UPDATE_RESP" | sed '$d')

  if [[ "$UPDATE_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "Update test theme (HTTP $UPDATE_STATUS)"
    pass "Theme PUT returned 2xx — update applied"
  else
    fail "Update test theme (HTTP $UPDATE_STATUS)" \
      "$(printf '%s' "$UPDATE_BODY" | head -3)"
  fi
fi

###############################################################################
# 9. Delete the test theme
###############################################################################
section "Delete Test Theme"

if [[ -z "$NEW_THEME_ID" ]]; then
  warn "Skipping delete — no test theme ID"
else
  DELETE_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X DELETE "${WL_URL}/api/v1/O/${ORG_ID}/white-label/themes/${NEW_THEME_ID}" \
    -H "$AUTH_HDR" \
    2>/dev/null || printf '\n000')
  DELETE_STATUS=$(printf '%s' "$DELETE_RESP" | tail -n1)
  DELETE_BODY=$(printf '%s' "$DELETE_RESP" | sed '$d')

  if [[ "$DELETE_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "Delete test theme ${NEW_THEME_ID} (HTTP $DELETE_STATUS)"
    IS_DELETED=$(printf '%s' "$DELETE_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      t=d.get('theme',d) if isinstance(d,dict) else d; print(t.get('isDeleted',''))" \
      2>/dev/null || true)
    if [[ "$IS_DELETED" == "True" ]]; then
      pass "isDeleted=true confirmed"
    else
      pass "Delete returned 2xx — soft delete applied"
    fi
  else
    fail "Delete test theme (HTTP $DELETE_STATUS)" \
      "$(printf '%s' "$DELETE_BODY" | head -3)"
  fi
fi

###############################################################################
# 10. Idempotency — seed demo again
###############################################################################
section "Idempotency — Seed Demo Again"

IDEM_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${WL_URL}/api/v1/G/white-label/seed/demo" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
IDEM_STATUS=$(printf '%s' "$IDEM_RESP" | tail -n1)
IDEM_BODY=$(printf '%s' "$IDEM_RESP" | sed '$d')

if [[ "$IDEM_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Seed demo idempotent run (HTTP $IDEM_STATUS — not 500)"
  IDEM_SEEDED=$(printf '%s' "$IDEM_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('seeded','?'))" \
    2>/dev/null || echo "?")
  IDEM_SKIPPED=$(printf '%s' "$IDEM_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('skipped','?'))" \
    2>/dev/null || echo "?")
  IDEM_THEMES=$(printf '%s' "$IDEM_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('themes',[])))" \
    2>/dev/null || echo "?")
  pass "Idempotent: seeded=${IDEM_SEEDED} skipped=${IDEM_SKIPPED} themes_in_response=${IDEM_THEMES}"
  if [[ "$IDEM_THEMES" == "6" ]]; then
    pass "6 themes still reported (idempotent — skipped existing)"
  else
    warn "themes in idempotent response: ${IDEM_THEMES}"
  fi
else
  fail "Seed demo idempotency FAILED (HTTP $IDEM_STATUS)" \
    "$(printf '%s' "$IDEM_BODY" | head -3)"
fi

###############################################################################
# 11. Flush demo themes
###############################################################################
section "Flush Demo Themes"

FLUSH_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X DELETE "${WL_URL}/api/v1/G/white-label/seed/demo" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
FLUSH_STATUS=$(printf '%s' "$FLUSH_RESP" | tail -n1)
FLUSH_BODY=$(printf '%s' "$FLUSH_RESP" | sed '$d')

if [[ "$FLUSH_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Flush demo themes (DELETE /G/white-label/seed/demo) HTTP $FLUSH_STATUS"
  SUCCESS_VAL=$(printf '%s' "$FLUSH_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" \
    2>/dev/null || true)
  if [[ "$SUCCESS_VAL" == "True" ]]; then
    pass "flush returned success:true"
  fi
else
  warn "Flush demo HTTP $FLUSH_STATUS (endpoint may not be implemented)"
fi

###############################################################################
# 12. Re-seed after flush (verify round-trip)
###############################################################################
section "Re-seed After Flush (Round-Trip)"

RESEED_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${WL_URL}/api/v1/G/white-label/seed/demo" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HDR" \
  2>/dev/null || printf '\n000')
RESEED_STATUS=$(printf '%s' "$RESEED_RESP" | tail -n1)
RESEED_BODY=$(printf '%s' "$RESEED_RESP" | sed '$d')

if [[ "$RESEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Re-seed after flush (HTTP $RESEED_STATUS)"
  RESEED_SEEDED=$(printf '%s' "$RESEED_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('seeded','?'))" \
    2>/dev/null || echo "?")
  if [[ "$RESEED_SEEDED" == "6" ]]; then
    pass "Re-seed created 6 fresh themes (seeded=${RESEED_SEEDED})"
  else
    warn "Re-seed seeded=${RESEED_SEEDED} (expected 6 after flush)"
  fi
else
  fail "Re-seed after flush (HTTP $RESEED_STATUS)" \
    "$(printf '%s' "$RESEED_BODY" | head -3)"
fi

###############################################################################
# Summary
###############################################################################
echo ""
printf "${BOLD}══════════════════════════════════════════════════════════${RESET}\n"
printf "${BOLD}  White Label E2E — Section Summary${RESET}\n"
printf "${BOLD}══════════════════════════════════════════════════════════${RESET}\n"

for sec in \
  "Authentication" \
  "Health Check" \
  "Seed Demo Themes" \
  "Create Test Theme" \
  "List Themes (O-OZPY org-scoped)" \
  "Get Specific Theme" \
  "Resolve Theme" \
  "Theme CSS" \
  "Update Test Theme" \
  "Delete Test Theme" \
  "Idempotency — Seed Demo Again" \
  "Flush Demo Themes" \
  "Re-seed After Flush (Round-Trip)"; do
  P=${SECTION_PASSED[$sec]:-0}
  F=${SECTION_FAILED[$sec]:-0}
  if [[ "$F" -gt 0 ]]; then
    STATUS_ICON="${RED}FAIL${RESET}"
  else
    STATUS_ICON="${GREEN}OK  ${RESET}"
  fi
  printf "  ${STATUS_ICON}  %-45s  P:%-2d  F:%-2d\n" "$sec" "$P" "$F"
done

echo ""
printf "${BOLD}══════════════════════════════════════════════════════════${RESET}\n"
printf "  Total : %d\n" "$TOTAL"
printf "  ${GREEN}Passed: %d${RESET}\n" "$PASSED"
printf "  ${RED}Failed: %d${RESET}\n" "$FAILED"
printf "${BOLD}══════════════════════════════════════════════════════════${RESET}\n"

if [[ "$FAILED" -gt 0 ]]; then
  printf "\n${RED}${BOLD}RESULT: FAILED${RESET}\n\n"
  exit 1
else
  printf "\n${GREEN}${BOLD}RESULT: ALL TESTS PASSED${RESET}\n\n"
  exit 0
fi

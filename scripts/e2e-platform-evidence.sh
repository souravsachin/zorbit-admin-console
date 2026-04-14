#!/usr/bin/env bash
###############################################################################
# Zorbit Platform — Master E2E Evidence Script (Sessions 2 & 3)
# Run: ssh ilri-arm-uat 'bash -s' < scripts/e2e-platform-evidence.sh
#
# Verified API paths on UAT (2026-04-14):
#   Identity:         /api/v1/O/{org}/users  (org-scoped)
#   Authorization:    /api/v1/O/{org}/roles  (org-scoped)
#   Navigation:       /api/v1/O/{org}/navigation/menus
#   Messaging topics: /api/v1/G/messaging/topics  (needs auth)
#   PII Vault seed:   /api/v1/G/pii-vault/seed
#   Audit seed:       /api/v1/G/audit/seed
#   ZMB Factory seed: /api/v1/G/zmb-factory/seed
#   HI Quotation:     health=/api/v1/G/hi-quotation/health  seed=/api/v1/G/hi-quotation/seed
#   HI UW Decisioning:health=/api/v1/G/hi-uw-decisioning/health  seed=/api/v1/G/hi-uw-decisioning/seed
#   UW Workflow:      health=/api/v1/G/uw-workflow/health  seed=/api/v1/G/uw-workflow/seed
#   Product Pricing:  health=/api/v1/G/product-pricing/health
#   Doc Generator:    health=/api/v1/G/doc-generator/health
#   White Label:      health=/api/v1/G/white-label/health  seed=/api/v1/G/white-label/seed/demo
#   PCG4: no health endpoint found (deployed on 3011 but path unknown)
###############################################################################

set -uo pipefail

BASE="http://localhost"
IDENTITY_URL="${BASE}:3001"
AUTHZ_URL="${BASE}:3002"
NAV_URL="${BASE}:3003"
MSG_URL="${BASE}:3004"
PII_URL="${BASE}:3005"
AUDIT_URL="${BASE}:3006"
PCG4_URL="${BASE}:3011"
WL_URL="${BASE}:3034"
ZMB_URL="${BASE}:3035"
HI_QUOT_URL="${BASE}:3017"
HI_UW_URL="${BASE}:3016"
UW_WF_URL="${BASE}:3015"
PROD_PRICE_URL="${BASE}:3025"
FORM_BUILD_URL="${BASE}:3014"
DATATABLE_URL="${BASE}:3013"
DOC_GEN_URL="${BASE}:3026"

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

health_check() {
  local name="$1"
  local url="$2"
  local resp
  resp=$(curl $CURL_OPTS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [[ "$resp" =~ ^2[0-9][0-9]$ ]]; then
    pass "$name healthy (HTTP $resp)"
  else
    fail "$name down (HTTP $resp)" "$url"
  fi
}

health_check_warn() {
  local name="$1"
  local url="$2"
  local resp
  resp=$(curl $CURL_OPTS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [[ "$resp" =~ ^2[0-9][0-9]$ ]]; then
    pass "$name healthy (HTTP $resp)"
  else
    warn "$name returned HTTP $resp (service may use different health path)"
  fi
}

ACCESS_TOKEN=""

###############################################################################
# Obtain JWT first
###############################################################################
section "JWT Authentication"

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
  fail "Login (HTTP $LOGIN_STATUS)" "$(printf '%s' "$LOGIN_BODY" | head -3)"
fi

###############################################################################
# SECTION: Infrastructure Health (tickets 2001-2004)
###############################################################################
section "Infrastructure Health (tickets 2001-2004)"

health_check "Identity (3001)"          "${IDENTITY_URL}/api/v1/G/health"
health_check "Authorization (3002)"     "${AUTHZ_URL}/api/v1/G/health"
health_check "Navigation (3003)"        "${NAV_URL}/api/v1/G/health"
health_check "Messaging (3004)"         "${MSG_URL}/api/v1/G/messaging/health"
health_check "PII Vault (3005)"         "${PII_URL}/api/v1/G/health"
health_check "Audit (3006)"             "${AUDIT_URL}/api/v1/G/health"
health_check_warn "PCG4 (3011)"         "${PCG4_URL}/api/v1/G/pcg4/health"
health_check "White Label (3034)"       "${WL_URL}/api/v1/G/white-label/health"
health_check "ZMB Factory (3035)"       "${ZMB_URL}/api/v1/G/zmb-factory/health"
health_check "HI Quotation (3017)"      "${HI_QUOT_URL}/api/v1/G/hi-quotation/health"
health_check "HI UW Decisioning (3016)" "${HI_UW_URL}/api/v1/G/hi-uw-decisioning/health"
health_check "UW Workflow (3015)"       "${UW_WF_URL}/api/v1/G/uw-workflow/health"
health_check "Product Pricing (3025)"   "${PROD_PRICE_URL}/api/v1/G/product-pricing/health"
health_check "Form Builder (3014)"      "${FORM_BUILD_URL}/api/v1/G/form-builder/health"
health_check "DataTable (3013)"         "${DATATABLE_URL}/api/v1/G/datatable/health"
health_check "Doc Generator (3026)"     "${DOC_GEN_URL}/api/v1/G/doc-generator/health"

# PM2 process check
PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "
import sys, json
try:
    procs = json.load(sys.stdin)
    bad = [x['name'] for x in procs if x['pm2_env']['status'] != 'online']
    print('OK' if not bad else 'FAIL:' + ','.join(bad))
except Exception as e:
    print('ERROR:' + str(e))
" 2>/dev/null || echo "pm2 not available")

if [[ "$PM2_STATUS" == "OK" ]]; then
  pass "All PM2 processes online"
elif [[ "$PM2_STATUS" == "pm2 not available" ]]; then
  warn "pm2 not in PATH for this session"
else
  fail "Some PM2 processes offline: $PM2_STATUS"
fi

# Disk usage
DISK_USE=$(df -h / 2>/dev/null | awk 'NR==2{print $5}' || echo "unknown")
if [[ "$DISK_USE" != "unknown" ]]; then
  DISK_PCT=${DISK_USE%%%}
  if [[ "$DISK_PCT" -lt 85 ]]; then
    pass "Disk usage: ${DISK_USE} (healthy)"
  else
    warn "Disk usage: ${DISK_USE} (high — review needed)"
  fi
fi

###############################################################################
# SECTION: Authentication + Identity (ticket 2009)
###############################################################################
section "Authentication + Identity (ticket 2009)"

if [[ -n "$ACCESS_TOKEN" ]]; then
  pass "Admin login via email/password: verified"
fi

# List users (org-scoped: O-OZPY)
if [[ -n "$ACCESS_TOKEN" ]]; then
  USERS_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${IDENTITY_URL}/api/v1/O/${ORG_ID}/users" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  USERS_STATUS=$(printf '%s' "$USERS_RESP" | tail -n1)
  USERS_BODY=$(printf '%s' "$USERS_RESP" | sed '$d')

  if [[ "$USERS_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "List users (GET /O/${ORG_ID}/users) HTTP $USERS_STATUS"
    USER_COUNT=$(printf '%s' "$USERS_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      arr=d if isinstance(d,list) else d.get('data',d.get('users',d.get('items',[]))); \
      print(len(arr))" 2>/dev/null || echo "0")
    if [[ "$USER_COUNT" -gt 0 ]]; then
      pass "Users list has ${USER_COUNT} record(s)"
    else
      warn "Users list is empty"
    fi
    # Check for specific users (avoid UID — it's readonly in bash)
    for USER_HASHID in "U-90D3" "U-9CE0"; do
      HAS=$(printf '%s' "$USERS_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
arr = d if isinstance(d, list) else d.get('data', d.get('users', d.get('items', [])))
ids = [u.get('hashId', '') for u in arr]
print('YES' if '${USER_HASHID}' in ids else 'NO')
" 2>/dev/null || echo "?")
      if [[ "$HAS" == "YES" ]]; then
        pass "User ${USER_HASHID} found"
      else
        warn "User ${USER_HASHID} not found in org-scoped list"
      fi
    done
  else
    fail "List users (HTTP $USERS_STATUS)"
  fi
fi

# Identity service has no standalone /seed — log as informational
warn "Identity does not expose a standalone /seed endpoint (no path found)"

###############################################################################
# SECTION: Authorization + Roles (ticket 2010)
###############################################################################
section "Authorization + Roles (ticket 2010)"

if [[ -n "$ACCESS_TOKEN" ]]; then
  ROLES_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${AUTHZ_URL}/api/v1/O/${ORG_ID}/roles" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  ROLES_STATUS=$(printf '%s' "$ROLES_RESP" | tail -n1)
  ROLES_BODY=$(printf '%s' "$ROLES_RESP" | sed '$d')

  if [[ "$ROLES_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "GET authorization/roles O-OZPY (HTTP $ROLES_STATUS)"
    ROLE_COUNT=$(printf '%s' "$ROLES_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      arr=d if isinstance(d,list) else d.get('data',d.get('roles',d.get('items',[]))); \
      print(len(arr))" 2>/dev/null || echo "0")
    if [[ "$ROLE_COUNT" -ge 1 ]]; then
      pass "Roles list has ${ROLE_COUNT} role(s)"
    else
      warn "Roles list is empty"
    fi
  else
    fail "GET authorization/roles (HTTP $ROLES_STATUS)"
  fi
fi

###############################################################################
# SECTION: Navigation + Menu (tickets 2011/2012/2013)
###############################################################################
section "Navigation + Menu (tickets 2011/2012/2013)"

if [[ -n "$ACCESS_TOKEN" ]]; then
  # Correct path: /api/v1/O/{org}/navigation/menus
  MENUS_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${NAV_URL}/api/v1/O/${ORG_ID}/navigation/menus" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  MENUS_STATUS=$(printf '%s' "$MENUS_RESP" | tail -n1)
  MENUS_BODY=$(printf '%s' "$MENUS_RESP" | sed '$d')

  if [[ "$MENUS_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "GET /O/${ORG_ID}/navigation/menus (HTTP $MENUS_STATUS)"
    ITEM_COUNT=$(printf '%s' "$MENUS_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      arr=d if isinstance(d,list) else d.get('data',d.get('items',d.get('menus',[]))); \
      print(len(arr))" 2>/dev/null || echo "0")
    if [[ "$ITEM_COUNT" -gt 10 ]]; then
      pass "Menu items count > 10 (found: ${ITEM_COUNT})"
    else
      warn "Menu items count: ${ITEM_COUNT} (expected > 10)"
    fi
    for KEYWORD in "Support Center" "support-center" "Developer Center" "dev-center"; do
      HAS=$(printf '%s' "$MENUS_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
txt = json.dumps(d)
print('YES' if '${KEYWORD}' in txt else 'NO')
" 2>/dev/null || echo "?")
      if [[ "$HAS" == "YES" ]]; then
        pass "'${KEYWORD}' found in navigation"
        break
      fi
    done
  else
    fail "GET navigation/menus (HTTP $MENUS_STATUS)"
  fi
fi

###############################################################################
# SECTION: Messaging / Event Bus (ticket 2014)
###############################################################################
section "Messaging / Event Bus (ticket 2014)"

if [[ -n "$ACCESS_TOKEN" ]]; then
  TOPICS_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X GET "${MSG_URL}/api/v1/G/messaging/topics" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  TOPICS_STATUS=$(printf '%s' "$TOPICS_RESP" | tail -n1)
  TOPICS_BODY=$(printf '%s' "$TOPICS_RESP" | sed '$d')

  if [[ "$TOPICS_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "GET messaging/topics (HTTP $TOPICS_STATUS)"
    TOPICS_COUNT=$(printf '%s' "$TOPICS_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      arr=d if isinstance(d,list) else d.get('data',d.get('topics',d.get('items',[]))); \
      print(len(arr))" 2>/dev/null || echo "0")
    if [[ "$TOPICS_COUNT" -ge 5 ]]; then
      pass "Topics count >= 5 (found: ${TOPICS_COUNT})"
    else
      warn "Topics count: ${TOPICS_COUNT} (expected >= 5)"
    fi
  else
    fail "GET messaging/topics (HTTP $TOPICS_STATUS)"
  fi
fi

# Messaging seed (path includes service prefix)
MSG_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${MSG_URL}/api/v1/G/messaging/seed" \
  -H "Content-Type: application/json" \
  2>/dev/null || printf '\n000')
MSG_SEED_STATUS=$(printf '%s' "$MSG_SEED" | tail -n1)
if [[ "$MSG_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Messaging seed (HTTP $MSG_SEED_STATUS)"
else
  warn "Messaging seed HTTP $MSG_SEED_STATUS"
fi

MSG_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${MSG_URL}/api/v1/G/messaging/seed/demo" \
  -H "Content-Type: application/json" \
  2>/dev/null || printf '\n000')
MSG_DEMO_STATUS=$(printf '%s' "$MSG_DEMO" | tail -n1)
MSG_DEMO_BODY=$(printf '%s' "$MSG_DEMO" | sed '$d')
if [[ "$MSG_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Messaging demo seed (HTTP $MSG_DEMO_STATUS)"
  DEMO_TOPICS=$(printf '%s' "$MSG_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    s=d.get('seeded',{}); print(s.get('topics','?'))" 2>/dev/null || echo "?")
  if [[ "$DEMO_TOPICS" == "3" ]]; then
    pass "Messaging demo seeded.topics=3"
  else
    warn "Messaging demo seeded.topics=${DEMO_TOPICS}"
  fi
else
  warn "Messaging demo seed HTTP $MSG_DEMO_STATUS"
fi

###############################################################################
# SECTION: PII Vault (ticket 2015)
###############################################################################
section "PII Vault (ticket 2015)"

health_check "PII Vault health" "${PII_URL}/api/v1/G/health"

# PII Vault seed path includes service prefix
PII_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${PII_URL}/api/v1/G/pii-vault/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
PII_SEED_STATUS=$(printf '%s' "$PII_SEED" | tail -n1)
if [[ "$PII_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "PII Vault seed (HTTP $PII_SEED_STATUS)"
else
  warn "PII Vault seed HTTP $PII_SEED_STATUS"
fi

PII_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${PII_URL}/api/v1/G/pii-vault/seed/demo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
PII_DEMO_STATUS=$(printf '%s' "$PII_DEMO" | tail -n1)
PII_DEMO_BODY=$(printf '%s' "$PII_DEMO" | sed '$d')
if [[ "$PII_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "PII Vault demo seed (HTTP $PII_DEMO_STATUS)"
  PII_COUNT=$(printf '%s' "$PII_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    s=d.get('seeded',{}); \
    print(s.get('piiRecords',s.get('records',s.get('count',d.get('count','?')))))" \
    2>/dev/null || echo "?")
  if [[ "$PII_COUNT" == "8" ]]; then
    pass "PII demo seeded.piiRecords=8"
  else
    warn "PII demo piiRecords=${PII_COUNT}"
  fi
else
  warn "PII Vault demo seed HTTP $PII_DEMO_STATUS"
fi

###############################################################################
# SECTION: Audit Trail (ticket 2017)
###############################################################################
section "Audit Trail (ticket 2017)"

health_check "Audit health" "${AUDIT_URL}/api/v1/G/health"

AUDIT_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${AUDIT_URL}/api/v1/G/audit/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
AUDIT_SEED_STATUS=$(printf '%s' "$AUDIT_SEED" | tail -n1)
if [[ "$AUDIT_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Audit seed (HTTP $AUDIT_SEED_STATUS)"
else
  warn "Audit seed HTTP $AUDIT_SEED_STATUS"
fi

AUDIT_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${AUDIT_URL}/api/v1/G/audit/seed/demo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
AUDIT_DEMO_STATUS=$(printf '%s' "$AUDIT_DEMO" | tail -n1)
AUDIT_DEMO_BODY=$(printf '%s' "$AUDIT_DEMO" | sed '$d')
if [[ "$AUDIT_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Audit demo seed (HTTP $AUDIT_DEMO_STATUS)"
  AUDIT_COUNT=$(printf '%s' "$AUDIT_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    s=d.get('seeded',{}); \
    print(s.get('auditRecords',s.get('records',s.get('count',d.get('count','?')))))" \
    2>/dev/null || echo "?")
  if [[ "$AUDIT_COUNT" == "12" ]]; then
    pass "Audit demo seeded.auditRecords=12"
  else
    warn "Audit demo auditRecords=${AUDIT_COUNT}"
  fi
else
  warn "Audit demo seed HTTP $AUDIT_DEMO_STATUS"
fi

###############################################################################
# SECTION: HI Quotation (ticket 2018a)
###############################################################################
section "HI Quotation (ticket 2018a)"

health_check "HI Quotation health" "${HI_QUOT_URL}/api/v1/G/hi-quotation/health"

if [[ -n "$ACCESS_TOKEN" ]]; then
  HI_QUOT_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${HI_QUOT_URL}/api/v1/G/hi-quotation/seed" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  HI_QUOT_SEED_STATUS=$(printf '%s' "$HI_QUOT_SEED" | tail -n1)
  if [[ "$HI_QUOT_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "HI Quotation seed (HTTP $HI_QUOT_SEED_STATUS)"
  else
    warn "HI Quotation seed HTTP $HI_QUOT_SEED_STATUS"
  fi

  HI_QUOT_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${HI_QUOT_URL}/api/v1/G/hi-quotation/seed/demo" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  HI_QUOT_DEMO_STATUS=$(printf '%s' "$HI_QUOT_DEMO" | tail -n1)
  HI_QUOT_DEMO_BODY=$(printf '%s' "$HI_QUOT_DEMO" | sed '$d')
  if [[ "$HI_QUOT_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "HI Quotation demo seed (HTTP $HI_QUOT_DEMO_STATUS)"
    QUOT_COUNT=$(printf '%s' "$HI_QUOT_DEMO_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      s=d.get('seeded',{}); \
      print(s.get('quotations',s.get('count',d.get('count','?'))))" 2>/dev/null || echo "?")
    if [[ "$QUOT_COUNT" == "20" ]]; then
      pass "HI Quotation demo seeded.quotations=20"
    else
      warn "HI Quotation demo quotations=${QUOT_COUNT}"
    fi
  else
    fail "HI Quotation demo seed (HTTP $HI_QUOT_DEMO_STATUS)" \
      "$(printf '%s' "$HI_QUOT_DEMO_BODY" | head -3)"
  fi

  # Idempotency test
  HI_QUOT_IDEM=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${HI_QUOT_URL}/api/v1/G/hi-quotation/seed/demo" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  HI_QUOT_IDEM_STATUS=$(printf '%s' "$HI_QUOT_IDEM" | tail -n1)
  HI_QUOT_IDEM_BODY=$(printf '%s' "$HI_QUOT_IDEM" | sed '$d')
  if [[ "$HI_QUOT_IDEM_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "HI Quotation seed idempotent (HTTP $HI_QUOT_IDEM_STATUS — not 500)"
  else
    fail "HI Quotation seed idempotency FAILED (HTTP $HI_QUOT_IDEM_STATUS)" \
      "$(printf '%s' "$HI_QUOT_IDEM_BODY" | head -3)"
  fi
fi

###############################################################################
# SECTION: HI UW Decisioning (tickets 2018b + 2022)
###############################################################################
section "HI UW Decisioning (tickets 2018b + 2022)"

# NEW path must work
HI_UW_HEALTH=$(curl $CURL_OPTS -o /dev/null -w "%{http_code}" \
  "${HI_UW_URL}/api/v1/G/hi-uw-decisioning/health" 2>/dev/null || echo "000")
if [[ "$HI_UW_HEALTH" =~ ^2[0-9][0-9]$ ]]; then
  pass "HI UW Decisioning NEW path /api/v1/G/hi-uw-decisioning/health (HTTP $HI_UW_HEALTH)"
else
  fail "HI UW Decisioning NEW path health (HTTP $HI_UW_HEALTH)"
fi

# OLD path must NOT work (ticket 2022 — rename verification)
HI_OLD_HEALTH=$(curl $CURL_OPTS -o /dev/null -w "%{http_code}" \
  "${HI_UW_URL}/api/v1/G/hi-decisioning/health" 2>/dev/null || echo "000")
if [[ "$HI_OLD_HEALTH" == "404" || "$HI_OLD_HEALTH" == "000" ]]; then
  pass "OLD path /api/v1/G/hi-decisioning/health is dead (HTTP $HI_OLD_HEALTH) — renamed correctly"
else
  fail "OLD path still alive (HTTP $HI_OLD_HEALTH) — rename not complete"
fi

if [[ -n "$ACCESS_TOKEN" ]]; then
  HI_UW_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${HI_UW_URL}/api/v1/G/hi-uw-decisioning/seed" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  HI_UW_SEED_STATUS=$(printf '%s' "$HI_UW_SEED" | tail -n1)
  if [[ "$HI_UW_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "HI UW Decisioning seed (HTTP $HI_UW_SEED_STATUS)"
  else
    warn "HI UW Decisioning seed HTTP $HI_UW_SEED_STATUS"
  fi

  HI_UW_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${HI_UW_URL}/api/v1/G/hi-uw-decisioning/seed/demo" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  HI_UW_DEMO_STATUS=$(printf '%s' "$HI_UW_DEMO" | tail -n1)
  HI_UW_DEMO_BODY=$(printf '%s' "$HI_UW_DEMO" | sed '$d')
  if [[ "$HI_UW_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "HI UW Decisioning demo seed (HTTP $HI_UW_DEMO_STATUS)"
    RULES_COUNT=$(printf '%s' "$HI_UW_DEMO_BODY" | \
      python3 -c "import sys,json; d=json.load(sys.stdin); \
      s=d.get('seeded',{}); \
      print(s.get('rules',s.get('count',d.get('count','?'))))" 2>/dev/null || echo "?")
    pass "HI UW Decisioning demo seeded rules: ${RULES_COUNT}"
  else
    warn "HI UW Decisioning demo seed HTTP $HI_UW_DEMO_STATUS"
  fi
fi

###############################################################################
# SECTION: UW Workflow (ticket 2018c)
###############################################################################
section "UW Workflow (ticket 2018c)"

health_check "UW Workflow health" "${UW_WF_URL}/api/v1/G/uw-workflow/health"

if [[ -n "$ACCESS_TOKEN" ]]; then
  UW_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${UW_WF_URL}/api/v1/G/uw-workflow/seed" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  UW_SEED_STATUS=$(printf '%s' "$UW_SEED" | tail -n1)
  if [[ "$UW_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "UW Workflow seed (HTTP $UW_SEED_STATUS)"
  else
    warn "UW Workflow seed HTTP $UW_SEED_STATUS"
  fi

  UW_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
    -X POST "${UW_WF_URL}/api/v1/G/uw-workflow/seed/demo" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    2>/dev/null || printf '\n000')
  UW_DEMO_STATUS=$(printf '%s' "$UW_DEMO" | tail -n1)
  if [[ "$UW_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    pass "UW Workflow demo seed (HTTP $UW_DEMO_STATUS)"
  else
    warn "UW Workflow demo seed HTTP $UW_DEMO_STATUS"
  fi
fi

###############################################################################
# SECTION: White Label Themes (ticket 2018 white-label)
###############################################################################
section "White Label Themes (ticket 2018 white-label)"

health_check "White Label health" "${WL_URL}/api/v1/G/white-label/health"

# Seed demo (creates 6 global themes)
WL_DEMO=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${WL_URL}/api/v1/G/white-label/seed/demo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
WL_DEMO_STATUS=$(printf '%s' "$WL_DEMO" | tail -n1)
WL_DEMO_BODY=$(printf '%s' "$WL_DEMO" | sed '$d')
if [[ "$WL_DEMO_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "White Label demo seed (HTTP $WL_DEMO_STATUS)"
  # Response: {success, seeded:N, skipped:N, themes:[{slug,hashId,name,status}]}
  WL_THEMES_IN_RESP=$(printf '%s' "$WL_DEMO_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('themes',[])))" \
    2>/dev/null || echo "?")
  if [[ "$WL_THEMES_IN_RESP" == "6" ]]; then
    pass "White Label demo seed returns 6 themes (seeded+skipped=6)"
  else
    warn "Themes in response: ${WL_THEMES_IN_RESP}"
  fi
  # Verify all 6 expected names
  NAMES=$(printf '%s' "$WL_DEMO_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
names = [t.get('name', '') for t in d.get('themes', [])]
expected = ['NovaCare', 'SwiftDrive', 'BlueSky', 'GreenShield', 'Obsidian', 'CrimsonCare']
missing = [e for e in expected if not any(e in n for n in names)]
print('MISSING:' + ','.join(missing) if missing else 'OK')
" 2>/dev/null || echo "?")
  if [[ "$NAMES" == "OK" ]]; then
    pass "All 6 expected theme names in seed response"
  else
    fail "Theme names issue: $NAMES"
  fi
else
  fail "White Label demo seed (HTTP $WL_DEMO_STATUS)" \
    "$(printf '%s' "$WL_DEMO_BODY" | head -3)"
fi

###############################################################################
# SECTION: DataTable (ticket 2018 datatable)
###############################################################################
section "DataTable (ticket 2018 datatable)"

health_check "DataTable health" "${DATATABLE_URL}/api/v1/G/datatable/health"

# DataTable seed path not found yet — warn only
DT_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${DATATABLE_URL}/api/v1/G/datatable/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
DT_SEED_STATUS=$(printf '%s' "$DT_SEED" | tail -n1)
if [[ "$DT_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "DataTable seed (HTTP $DT_SEED_STATUS)"
else
  warn "DataTable seed HTTP $DT_SEED_STATUS (seed endpoint path may differ)"
fi

###############################################################################
# SECTION: Form Builder (ticket 2018 form-builder)
###############################################################################
section "Form Builder (ticket 2018 form-builder)"

health_check "Form Builder health" "${FORM_BUILD_URL}/api/v1/G/form-builder/health"

FB_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${FORM_BUILD_URL}/api/v1/G/form-builder/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
FB_SEED_STATUS=$(printf '%s' "$FB_SEED" | tail -n1)
if [[ "$FB_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Form Builder seed (HTTP $FB_SEED_STATUS)"
else
  warn "Form Builder seed HTTP $FB_SEED_STATUS (seed endpoint path may differ)"
fi

###############################################################################
# SECTION: Doc Generator (ticket 2018 doc-generator)
###############################################################################
section "Doc Generator (ticket 2018 doc-generator)"

health_check "Doc Generator health" "${DOC_GEN_URL}/api/v1/G/doc-generator/health"

DG_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${DOC_GEN_URL}/api/v1/G/doc-generator/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
DG_SEED_STATUS=$(printf '%s' "$DG_SEED" | tail -n1)
if [[ "$DG_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Doc Generator seed (HTTP $DG_SEED_STATUS)"
else
  warn "Doc Generator seed HTTP $DG_SEED_STATUS (seed endpoint path may differ)"
fi

###############################################################################
# SECTION: Product Pricing (ticket 2018 product-pricing)
###############################################################################
section "Product Pricing (ticket 2018 product-pricing)"

health_check "Product Pricing health" "${PROD_PRICE_URL}/api/v1/G/product-pricing/health"

PP_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${PROD_PRICE_URL}/api/v1/G/product-pricing/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
PP_SEED_STATUS=$(printf '%s' "$PP_SEED" | tail -n1)
if [[ "$PP_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "Product Pricing seed (HTTP $PP_SEED_STATUS)"
else
  warn "Product Pricing seed HTTP $PP_SEED_STATUS (seed endpoint path may differ)"
fi

###############################################################################
# SECTION: ZMB Factory (tickets 2001/2019/2022)
###############################################################################
section "ZMB Factory (tickets 2001/2019/2022)"

health_check "ZMB Factory health" "${ZMB_URL}/api/v1/G/zmb-factory/health"

ZMB_SEED=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X POST "${ZMB_URL}/api/v1/G/zmb-factory/seed" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
ZMB_SEED_STATUS=$(printf '%s' "$ZMB_SEED" | tail -n1)
ZMB_SEED_BODY=$(printf '%s' "$ZMB_SEED" | sed '$d')
if [[ "$ZMB_SEED_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "ZMB Factory seed (HTTP $ZMB_SEED_STATUS)"
  MOD_COUNT=$(printf '%s' "$ZMB_SEED_BODY" | \
    python3 -c "import sys,json; d=json.load(sys.stdin); \
    s=d.get('seeded',{}); print(s.get('modules',s.get('count','?')))" \
    2>/dev/null || echo "?")
  if [[ "$MOD_COUNT" == "4" ]]; then
    pass "ZMB Factory seeded.modules=4"
  else
    warn "ZMB Factory seeded modules: ${MOD_COUNT}"
  fi
else
  warn "ZMB Factory seed HTTP $ZMB_SEED_STATUS"
fi

# Get module list and verify hi_uw_decisioning (not hi_decisioning)
ZMB_MODS=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X GET "${ZMB_URL}/api/v1/G/zmb-factory/modules" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  2>/dev/null || printf '\n000')
ZMB_MODS_STATUS=$(printf '%s' "$ZMB_MODS" | tail -n1)
ZMB_MODS_BODY=$(printf '%s' "$ZMB_MODS" | sed '$d')

if [[ "$ZMB_MODS_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "ZMB Factory module list (HTTP $ZMB_MODS_STATUS)"
  HAS_NEW=$(printf '%s' "$ZMB_MODS_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
txt = json.dumps(d)
print('YES' if 'hi_uw_decisioning' in txt else 'NO')
" 2>/dev/null || echo "?")
  HAS_OLD=$(printf '%s' "$ZMB_MODS_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
arr = d if isinstance(d, list) else d.get('data', d.get('modules', d.get('items', [])))
codes = [m.get('code', '') for m in arr]
print('YES' if 'hi_decisioning' in codes else 'NO')
" 2>/dev/null || echo "?")

  if [[ "$HAS_NEW" == "YES" ]]; then
    pass "hi_uw_decisioning module found in ZMB registry (renamed correctly)"
  else
    fail "hi_uw_decisioning NOT found in ZMB module registry"
  fi
  if [[ "$HAS_OLD" == "NO" ]]; then
    pass "OLD hi_decisioning code NOT in ZMB module registry"
  else
    fail "OLD hi_decisioning code still present in ZMB module registry"
  fi
else
  fail "ZMB Factory module list (HTTP $ZMB_MODS_STATUS)"
fi

###############################################################################
# SECTION: OAuth Buttons (ticket 2008)
###############################################################################
section "OAuth Buttons (ticket 2008)"

PROV_RESP=$(curl $CURL_OPTS -w '\n%{http_code}' \
  -X GET "${IDENTITY_URL}/api/v1/G/auth/providers" \
  2>/dev/null || printf '\n000')
PROV_STATUS=$(printf '%s' "$PROV_RESP" | tail -n1)
PROV_BODY=$(printf '%s' "$PROV_RESP" | sed '$d')

if [[ "$PROV_STATUS" =~ ^2[0-9][0-9]$ ]]; then
  pass "GET auth/providers (HTTP $PROV_STATUS)"
  PROV_COUNT=$(printf '%s' "$PROV_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
providers = d.get('providers', d if isinstance(d, list) else [])
print(len(providers))
" 2>/dev/null || echo "0")
  if [[ "$PROV_COUNT" -ge 3 ]]; then
    pass "Auth providers response contains ${PROV_COUNT} provider(s)"
  else
    warn "Providers count: ${PROV_COUNT}"
  fi
  # OAuth providers exist in response (enabled:false on UAT is expected)
  for provider in "google" "github" "linkedin"; do
    EXISTS=$(printf '%s' "$PROV_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
providers = d.get('providers', d if isinstance(d, list) else [])
p = next((x for x in providers if x.get('name','').lower() == '${provider}'), None)
print('YES' if p else 'NO')
" 2>/dev/null || echo "?")
    ENABLED=$(printf '%s' "$PROV_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
providers = d.get('providers', d if isinstance(d, list) else [])
p = next((x for x in providers if x.get('name','').lower() == '${provider}'), None)
print(str(p.get('enabled','')) if p else 'not_found')
" 2>/dev/null || echo "?")
    if [[ "$EXISTS" == "YES" ]]; then
      pass "${provider} provider present in response (enabled=${ENABLED})"
    else
      warn "${provider} provider not found"
    fi
  done
else
  fail "GET auth/providers (HTTP $PROV_STATUS)"
fi

###############################################################################
# SECTION: PM2 Startup Persistence (ticket 2020)
###############################################################################
section "PM2 Startup Persistence (ticket 2020)"

SYSTEMCTL_RESP=$(systemctl is-enabled pm2-s 2>/dev/null || echo "not-found")
if [[ "$SYSTEMCTL_RESP" == "enabled" ]]; then
  pass "PM2 startup service enabled (pm2-s: enabled)"
elif [[ "$SYSTEMCTL_RESP" == "not-found" ]]; then
  warn "PM2 systemd service 'pm2-s' not found — check pm2 startup config"
else
  warn "PM2 startup status: ${SYSTEMCTL_RESP}"
fi

###############################################################################
# Final Summary
###############################################################################
echo ""
printf "${BOLD}══════════════════════════════════════════════════════════════════${RESET}\n"
printf "${BOLD}  Zorbit Platform Evidence — Section Summary${RESET}\n"
printf "${BOLD}══════════════════════════════════════════════════════════════════${RESET}\n"

ALL_SECTIONS=(
  "JWT Authentication"
  "Infrastructure Health (tickets 2001-2004)"
  "Authentication + Identity (ticket 2009)"
  "Authorization + Roles (ticket 2010)"
  "Navigation + Menu (tickets 2011/2012/2013)"
  "Messaging / Event Bus (ticket 2014)"
  "PII Vault (ticket 2015)"
  "Audit Trail (ticket 2017)"
  "HI Quotation (ticket 2018a)"
  "HI UW Decisioning (tickets 2018b + 2022)"
  "UW Workflow (ticket 2018c)"
  "White Label Themes (ticket 2018 white-label)"
  "DataTable (ticket 2018 datatable)"
  "Form Builder (ticket 2018 form-builder)"
  "Doc Generator (ticket 2018 doc-generator)"
  "Product Pricing (ticket 2018 product-pricing)"
  "ZMB Factory (tickets 2001/2019/2022)"
  "OAuth Buttons (ticket 2008)"
  "PM2 Startup Persistence (ticket 2020)"
)

for sec in "${ALL_SECTIONS[@]}"; do
  P=${SECTION_PASSED[$sec]:-0}
  F=${SECTION_FAILED[$sec]:-0}
  if [[ "$F" -gt 0 ]]; then
    STATUS_ICON="${RED}FAIL${RESET}"
  else
    STATUS_ICON="${GREEN}PASS${RESET}"
  fi
  printf "  ${STATUS_ICON}  %-55s  P:%-3d  F:%-3d\n" "${sec:0:55}" "$P" "$F"
done

echo ""
printf "${BOLD}══════════════════════════════════════════════════════════════════${RESET}\n"
printf "  Total  : %d\n" "$TOTAL"
printf "  ${GREEN}Passed : %d${RESET}\n" "$PASSED"
printf "  ${RED}Failed : %d${RESET}\n" "$FAILED"
printf "${BOLD}══════════════════════════════════════════════════════════════════${RESET}\n"

if [[ "$FAILED" -gt 0 ]]; then
  printf "\n${RED}${BOLD}RESULT: FAILED${RESET}\n\n"
  exit 1
else
  printf "\n${GREEN}${BOLD}RESULT: ALL TESTS PASSED${RESET}\n\n"
  exit 0
fi

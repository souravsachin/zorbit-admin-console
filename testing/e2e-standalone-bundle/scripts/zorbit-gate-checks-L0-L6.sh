#!/usr/bin/env bash
# =============================================================================
# Zorbit Platform Gate Checks — L0 through L6
# =============================================================================
# Run this ON the ARM UAT server (ssh s@141.145.155.34)
# L7 (browser UI) is in configs/zorbit-gate-checks.json (Playwright runner)
#
# Gates:
#   L0 — Docker containers running, networks, port bindings
#   L1 — Service health endpoints (all modules respond 200)
#   L2 — Auth & JWT structure (login works, privileges embedded)
#   L3 — Kafka infrastructure (topics exist, consumer groups assigned)
#   L4 — Module registry API state (19 modules READY, manifests present)
#   L5 — Kafka event flow E2E (publish → nav logs "cached" within 30s)
#   L6 — Navigation cache (GET /menu → stale:false, sections > 0)
#
# Usage:
#   bash zorbit-gate-checks-L0-L6.sh [--gate L0] [--stop-on-fail]
#
# =============================================================================

set -euo pipefail

# ---- Colors -----------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ---- Config -----------------------------------------------------------------
BASE_URL="https://zorbit-uat.onezippy.ai"
ADMIN_EMAIL="s@onezippy.ai"
ADMIN_PASS="s@2021#cz"
KAFKA_CONTAINER="zs-kafka"
REGISTRY_CONTAINER="zu-module_registry"
NAV_PM2_NAME="zorbit-n"
KAFKA_BROKER="zs-kafka:9092"

EXPECTED_CONTAINERS=("zu-core" "zu-module_registry" "zs-kafka" "zs-pg")
EXPECTED_MODULES=(
  "zorbit-cor-identity" "zorbit-cor-authorization" "zorbit-cor-navigation"
  "zorbit-cor-event_bus" "zorbit-cor-pii_vault" "zorbit-cor-audit"
  "zorbit-pfs-datatable" "zorbit-pfs-form_builder" "zorbit-pfs-ai_gateway"
  "zorbit-pfs-chat" "zorbit-pfs-rtc" "zorbit-pfs-interaction_recorder"
  "zorbit-pfs-verification" "zorbit-pfs-white_label" "zorbit-pfs-zmb_factory"
  "zorbit-app-pcg4" "zorbit-app-hi_quotation" "zorbit-app-hi_decisioning"
  "zorbit-app-uw_workflow"
)
EXPECTED_MODULE_COUNT=19

# ---- State ------------------------------------------------------------------
PASS=0; FAIL=0; SKIP=0
GATE_RESULTS=()
STOP_ON_FAIL=false
RUN_GATE=""
ACCESS_TOKEN=""

# ---- Arg parsing ------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --gate) RUN_GATE="$2"; shift 2 ;;
    --stop-on-fail) STOP_ON_FAIL=true; shift ;;
    *) shift ;;
  esac
done

# ---- Helpers ----------------------------------------------------------------
pass() { echo -e "  ${GREEN}✓ PASS${RESET} $1"; ((PASS++)) || true; }
fail() { echo -e "  ${RED}✗ FAIL${RESET} $1"; ((FAIL++)) || true; }
info() { echo -e "  ${CYAN}ℹ${RESET}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
gate_header() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${RESET}"; }

check_stop() {
  if $STOP_ON_FAIL && [[ $FAIL -gt 0 ]]; then
    echo -e "\n${RED}STOP_ON_FAIL: Halting after $FAIL failure(s).${RESET}"
    summary; exit 1
  fi
}

should_run() {
  [[ -z "$RUN_GATE" || "$RUN_GATE" == "$1" ]]
}

summary() {
  echo -e "\n${BOLD}═══════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD} Gate Summary${RESET}"
  echo -e "${BOLD}═══════════════════════════════════════════════════${RESET}"
  for r in "${GATE_RESULTS[@]}"; do echo -e "  $r"; done
  echo -e "${BOLD}───────────────────────────────────────────────────${RESET}"
  echo -e "  ${GREEN}PASS: $PASS${RESET}   ${RED}FAIL: $FAIL${RESET}   ${YELLOW}SKIP: $SKIP${RESET}"
  if [[ $FAIL -eq 0 ]]; then
    echo -e "  ${GREEN}${BOLD}ALL GATES PASSED${RESET}"
  else
    echo -e "  ${RED}${BOLD}$FAIL FAILURE(S) — see above${RESET}"
  fi
}

record_gate() {
  local gate="$1" pfail="$2"
  if [[ $pfail -eq 0 ]]; then
    GATE_RESULTS+=("${GREEN}✓${RESET} $gate")
  else
    GATE_RESULTS+=("${RED}✗${RESET} $gate (${pfail} checks failed)")
  fi
}

http_status() { curl -sk -o /dev/null -w "%{http_code}" "$1" "${@:2}"; }
http_body()   { curl -sk "$1" "${@:2}"; }

# =============================================================================
# L0 — Docker Containers, Networks, Port Bindings
# =============================================================================
if should_run "L0"; then
  gate_header "L0 — Docker Infrastructure"
  gate_fail_before=$FAIL

  # L0.1 — Required containers are running
  RUNNING=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")
  for cname in "${EXPECTED_CONTAINERS[@]}"; do
    if echo "$RUNNING" | grep -q "^${cname}$"; then
      pass "Container running: $cname"
    else
      fail "Container NOT running: $cname"
    fi
  done

  # L0.2 — zu-core PM2 processes (identity, authorization, navigation)
  if docker exec zu-core pm2 list 2>/dev/null | grep -qE "zorbit-(identity|i)\s"; then
    pass "PM2 inside zu-core: zorbit-identity running"
  else
    fail "PM2 inside zu-core: zorbit-identity NOT found"
  fi

  if docker exec zu-core pm2 list 2>/dev/null | grep -qE "zorbit-(n|navigation)\s"; then
    pass "PM2 inside zu-core: zorbit-navigation running"
  else
    fail "PM2 inside zu-core: zorbit-navigation NOT found"
  fi

  # L0.3 — Port bindings (key services)
  declare -A PORT_MAP=(
    ["3001"]="identity"
    ["3002"]="authorization"
    ["3003"]="navigation"
    ["3036"]="module_registry"
  )
  for port in "${!PORT_MAP[@]}"; do
    svc="${PORT_MAP[$port]}"
    if docker ps --format "{{.Ports}}" 2>/dev/null | grep -q "0.0.0.0:${port}->"; then
      pass "Port binding: $port → $svc"
    elif ss -tlnp 2>/dev/null | grep -q ":${port} "; then
      pass "Port binding (ss): $port → $svc"
    else
      # Try nc as last resort
      if nc -z 127.0.0.1 "$port" 2>/dev/null; then
        pass "Port reachable: $port → $svc"
      else
        fail "Port NOT bound: $port → $svc"
      fi
    fi
  done

  # L0.4 — Kafka port reachable
  if nc -z 127.0.0.1 9092 2>/dev/null || docker exec "$KAFKA_CONTAINER" nc -z localhost 9092 2>/dev/null; then
    pass "Kafka port 9092 reachable"
  else
    fail "Kafka port 9092 NOT reachable"
  fi

  # L0.5 — PostgreSQL port reachable
  if nc -z 127.0.0.1 5432 2>/dev/null || nc -z 127.0.0.1 5433 2>/dev/null; then
    pass "PostgreSQL port reachable (5432 or 5433)"
  else
    fail "PostgreSQL port NOT reachable"
  fi

  record_gate "L0 — Docker Infrastructure" $((FAIL - gate_fail_before))
  check_stop
fi

# =============================================================================
# L1 — Service Health Endpoints
# =============================================================================
if should_run "L1"; then
  gate_header "L1 — Service Health (HTTPS)"
  gate_fail_before=$FAIL

  declare -A HEALTH_ENDPOINTS=(
    ["identity"]="/api/identity/api/v1/G/health"
    ["authorization"]="/api/authorization/api/v1/G/health"
    ["navigation"]="/api/navigation/api/v1/G/health"
    ["module_registry"]="/api/module-registry/api/v1/G/health"
    ["event_bus"]="/api/event-bus/api/v1/G/health"
    ["audit"]="/api/audit/api/v1/G/health"
    ["pii_vault"]="/api/pii-vault/api/v1/G/health"
  )

  for svc in "${!HEALTH_ENDPOINTS[@]}"; do
    path="${HEALTH_ENDPOINTS[$svc]}"
    status=$(http_status "${BASE_URL}${path}")
    if [[ "$status" == "200" ]]; then
      pass "Health OK ($status): $svc → $path"
    else
      fail "Health FAIL ($status): $svc → $path"
    fi
  done

  record_gate "L1 — Service Health" $((FAIL - gate_fail_before))
  check_stop
fi

# =============================================================================
# L2 — Auth & JWT Structure
# =============================================================================
if should_run "L2"; then
  gate_header "L2 — Auth & JWT Structure"
  gate_fail_before=$FAIL

  # L2.1 — Login returns 200 + accessToken
  LOGIN_RESP=$(http_body "${BASE_URL}/api/identity/api/v1/G/auth/login" \
    -X POST -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}" 2>/dev/null || echo "{}")

  if echo "$LOGIN_RESP" | grep -q '"accessToken"'; then
    pass "Login returns accessToken"
    ACCESS_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  else
    fail "Login did NOT return accessToken"
    warn "Response: $(echo "$LOGIN_RESP" | head -c 200)"
    record_gate "L2 — Auth & JWT Structure" $((FAIL - gate_fail_before))
    check_stop
    # Cannot proceed without token
    SKIP=$((SKIP + 4))
    GATE_RESULTS+=("${YELLOW}⚠${RESET} L2+ sub-checks skipped (no token)")
  fi

  if [[ -n "$ACCESS_TOKEN" ]]; then
    # L2.2 — JWT decodes to valid structure
    JWT_PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2 | \
      awk '{n=length($0)%4; if(n==2) $0=$0"=="; if(n==3) $0=$0"="; print}' | \
      base64 -d 2>/dev/null || echo "{}")

    if echo "$JWT_PAYLOAD" | grep -q '"sub"'; then
      pass "JWT payload: sub field present"
    else
      fail "JWT payload: sub field MISSING"
      warn "Decoded: $(echo "$JWT_PAYLOAD" | head -c 300)"
    fi

    # L2.3 — JWT contains org
    if echo "$JWT_PAYLOAD" | grep -q '"org"'; then
      ORG_ID=$(echo "$JWT_PAYLOAD" | grep -o '"org":"[^"]*"' | cut -d'"' -f4)
      pass "JWT payload: org = $ORG_ID"
    else
      fail "JWT payload: org field MISSING"
    fi

    # L2.4 — JWT contains non-empty privileges array
    if echo "$JWT_PAYLOAD" | grep -q '"privileges":\['; then
      # Count privileges
      PRIV_COUNT=$(echo "$JWT_PAYLOAD" | grep -o '"[a-z][a-z0-9_.-]*\.[a-z][a-z0-9_.-]*\.[a-z][a-z0-9_.-]*"' | wc -l | tr -d ' ')
      if [[ $PRIV_COUNT -gt 0 ]]; then
        pass "JWT privileges array: $PRIV_COUNT privilege codes embedded"
        if [[ $PRIV_COUNT -lt 10 ]]; then
          warn "Only $PRIV_COUNT privileges — expected 47+. Re-login when system is idle."
        fi
      else
        fail "JWT privileges array: EMPTY (auth service may have timed out at login)"
        warn "Re-login when system is idle — auth service timeout embeds [] privileges"
      fi
    else
      fail "JWT payload: privileges field MISSING — identity service not embedding privileges"
    fi

    # L2.5 — JWT type=access
    if echo "$JWT_PAYLOAD" | grep -q '"type":"access"'; then
      pass "JWT type: access"
    else
      fail "JWT type: NOT 'access'"
    fi

    # L2.6 — Auth service internal privileges endpoint reachable
    if [[ -n "${ORG_ID:-}" ]]; then
      # Get user sub
      USER_ID=$(echo "$JWT_PAYLOAD" | grep -o '"sub":"[^"]*"' | cut -d'"' -f4)
      PRIV_STATUS=$(http_status \
        "${BASE_URL}/api/authorization/api/v1/G/internal/users/${ORG_ID}/${USER_ID}/privileges" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
      if [[ "$PRIV_STATUS" == "200" ]]; then
        pass "Auth service: internal privileges endpoint returns 200"
      else
        fail "Auth service: internal privileges endpoint returned $PRIV_STATUS (expected 200)"
      fi
    fi
  fi

  record_gate "L2 — Auth & JWT Structure" $((FAIL - gate_fail_before))
  check_stop
fi

# =============================================================================
# L3 — Kafka Infrastructure (topics + consumer groups)
# =============================================================================
if should_run "L3"; then
  gate_header "L3 — Kafka Infrastructure"
  gate_fail_before=$FAIL

  # L3.1 — Required topics exist
  REQUIRED_TOPICS=(
    "platform-module-announcements"
    "platform-module-ready"
  )

  for topic in "${REQUIRED_TOPICS[@]}"; do
    if docker exec "$KAFKA_CONTAINER" \
        /usr/bin/kafka-topics.sh --bootstrap-server localhost:9092 \
        --list 2>/dev/null | grep -qx "$topic"; then
      pass "Kafka topic exists: $topic"
    else
      fail "Kafka topic MISSING: $topic"
      warn "Create with: docker exec $KAFKA_CONTAINER /usr/bin/kafka-topics.sh \\"
      warn "  --bootstrap-server localhost:9092 --create --topic $topic --partitions 1 --replication-factor 1"
    fi
  done

  # L3.2 — Module registry consumer group is active on announcements topic
  REGISTRY_GROUP="zorbit-module-registry-group"
  REGISTRY_GROUP_STATE=$(docker exec "$KAFKA_CONTAINER" \
    /usr/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --describe --group "$REGISTRY_GROUP" 2>/dev/null || echo "")

  if echo "$REGISTRY_GROUP_STATE" | grep -q "platform-module-announcements"; then
    pass "Consumer group active: $REGISTRY_GROUP → platform-module-announcements"
    REGISTRY_LAG=$(echo "$REGISTRY_GROUP_STATE" | awk '/platform-module-announcements/{print $6}' | head -1)
    info "Registry consumer LAG: ${REGISTRY_LAG:-unknown}"
  else
    fail "Consumer group NOT active: $REGISTRY_GROUP (module_registry not consuming announcements)"
    warn "Check: docker logs $REGISTRY_CONTAINER | grep -i 'kafka'"
  fi

  # L3.3 — Nav consumer group is active on platform-module-ready (HYPHENS)
  NAV_GROUP="zorbit-navigation-group"
  NAV_GROUP_STATE=$(docker exec "$KAFKA_CONTAINER" \
    /usr/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --describe --group "$NAV_GROUP" 2>/dev/null || echo "")

  if echo "$NAV_GROUP_STATE" | grep -q "platform-module-ready"; then
    pass "Consumer group active: $NAV_GROUP → platform-module-ready (hyphens ✓)"
    NAV_LAG=$(echo "$NAV_GROUP_STATE" | awk '/platform-module-ready/{print $6}' | head -1)
    info "Nav consumer LAG: ${NAV_LAG:-unknown}"
    if [[ "${NAV_LAG:-0}" -gt 100 ]]; then
      warn "LAG $NAV_LAG is high — consumer may be rebalancing (~8 min to rejoin)"
    fi
  else
    fail "Consumer group NOT active: $NAV_GROUP on platform-module-ready"
    warn "CRITICAL: nav service not subscribed. Check nav logs: docker exec zu-core pm2 logs $NAV_PM2_NAME --lines 20"
    warn "COMMON MISTAKE: topic with DOTS (platform.module.ready) ≠ topic with HYPHENS (platform-module-ready)"
  fi

  # L3.4 — Verify no rogue dot-named topics that would swallow bad publishes
  if docker exec "$KAFKA_CONTAINER" \
      /usr/bin/kafka-topics.sh --bootstrap-server localhost:9092 \
      --list 2>/dev/null | grep -q "platform\.module\.ready"; then
    warn "Dot-named topic 'platform.module.ready' exists — manual pub scripts may accidentally use it"
    warn "Messages sent there will NEVER reach the nav consumer"
  else
    pass "No rogue dot-named topic (platform.module.ready absent — correct)"
  fi

  record_gate "L3 — Kafka Infrastructure" $((FAIL - gate_fail_before))
  check_stop
fi

# =============================================================================
# L4 — Module Registry API State
# =============================================================================
if should_run "L4"; then
  gate_header "L4 — Module Registry API State"
  gate_fail_before=$FAIL

  if [[ -z "$ACCESS_TOKEN" ]]; then
    warn "No access token — skipping L4 (run L2 first or set ACCESS_TOKEN env var)"
    SKIP=$((SKIP + 4))
    record_gate "L4 — Module Registry API State" 0
  else
    # L4.1 — Registry returns 200 for module list
    MODULES_RESP=$(http_body "${BASE_URL}/api/module-registry/api/v1/G/modules" \
      -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null || echo "[]")
    MODULE_LIST_STATUS=$(http_status "${BASE_URL}/api/module-registry/api/v1/G/modules" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    if [[ "$MODULE_LIST_STATUS" == "200" ]]; then
      pass "Registry API: GET /modules returns 200"
    else
      fail "Registry API: GET /modules returned $MODULE_LIST_STATUS"
    fi

    # L4.2 — All 19 modules present and READY
    READY_COUNT=$(echo "$MODULES_RESP" | grep -o '"status":"READY"' | wc -l | tr -d ' ')
    TOTAL_COUNT=$(echo "$MODULES_RESP" | grep -o '"moduleId"' | wc -l | tr -d ' ')

    info "Registry: $TOTAL_COUNT total modules, $READY_COUNT in READY state"

    if [[ "$READY_COUNT" -eq "$EXPECTED_MODULE_COUNT" ]]; then
      pass "All $EXPECTED_MODULE_COUNT modules are READY"
    elif [[ "$READY_COUNT" -gt 0 ]]; then
      fail "Only $READY_COUNT / $EXPECTED_MODULE_COUNT modules are READY"
      # Find which modules are not READY
      for mid in "${EXPECTED_MODULES[@]}"; do
        if ! echo "$MODULES_RESP" | grep -q "\"moduleId\":\"${mid}\""; then
          warn "Module MISSING from registry: $mid"
        elif echo "$MODULES_RESP" | grep -A5 "\"moduleId\":\"${mid}\"" | grep -q '"status":"PENDING"'; then
          warn "Module PENDING (not READY): $mid"
        fi
      done
    else
      fail "Zero READY modules in registry"
    fi

    # L4.3 — At least core modules have manifest data (navigation sections)
    CORE_MODULES=("zorbit-cor-identity" "zorbit-cor-navigation" "zorbit-cor-audit")
    for mid in "${CORE_MODULES[@]}"; do
      MANIFEST_STATUS=$(http_status "${BASE_URL}/api/module-registry/api/v1/G/modules/${mid}/manifest" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
      MANIFEST_BODY=$(http_body "${BASE_URL}/api/module-registry/api/v1/G/modules/${mid}/manifest" \
        -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null || echo "{}")

      if [[ "$MANIFEST_STATUS" == "200" ]] && echo "$MANIFEST_BODY" | grep -q '"navigation"'; then
        SECTION_COUNT=$(echo "$MANIFEST_BODY" | grep -o '"sections"' | wc -l | tr -d ' ')
        pass "Manifest has navigation data: $mid ($SECTION_COUNT section block(s))"
      elif [[ "$MANIFEST_STATUS" == "200" ]]; then
        fail "Manifest returned 200 but has NO navigation field: $mid"
      else
        fail "Manifest fetch failed ($MANIFEST_STATUS): $mid"
      fi
    done

    record_gate "L4 — Module Registry API State" $((FAIL - gate_fail_before))
    check_stop
  fi
fi

# =============================================================================
# L5 — Kafka Event Flow E2E (publish → nav logs within 30s)
# =============================================================================
if should_run "L5"; then
  gate_header "L5 — Kafka Event Flow E2E"
  gate_fail_before=$FAIL

  PUB_SCRIPT="/opt/zorbit-platform/scripts/pub_module_ready.js"
  TMP_SCRIPT="/tmp/pub_module_ready_gate.js"

  # L5.1 — Pub script exists
  if [[ -f "$PUB_SCRIPT" ]]; then
    pass "Pub script exists: $PUB_SCRIPT"
  else
    fail "Pub script MISSING: $PUB_SCRIPT"
    warn "Copy from: zorbit-cor-module_registry/scripts/pub_module_ready.js"
  fi

  # L5.2 — Wait for nav consumer to be stable (not rebalancing)
  info "Checking nav consumer stability before publishing..."
  NAV_LOG_BEFORE=$(docker exec zu-core pm2 logs "$NAV_PM2_NAME" --lines 5 --nocolor 2>/dev/null || echo "")
  if echo "$NAV_LOG_BEFORE" | grep -qi "rebalanc\|joining\|left the group"; then
    warn "Nav consumer appears to be rebalancing — wait ~8 minutes before L5"
    fail "Nav consumer not stable — skipping publish to avoid lost events"
    record_gate "L5 — Kafka Event Flow E2E" $((FAIL - gate_fail_before))
    check_stop
  else
    pass "Nav consumer appears stable (no rebalancing in recent logs)"
  fi

  # L5.3 — Copy and run pub script inside registry container
  if [[ -f "$PUB_SCRIPT" ]]; then
    docker cp "$PUB_SCRIPT" "${REGISTRY_CONTAINER}:${TMP_SCRIPT}" 2>/dev/null
    info "Publishing 19 platform.module.ready events (topic: platform-module-ready)..."
    PUB_OUTPUT=$(docker exec "$REGISTRY_CONTAINER" node "$TMP_SCRIPT" 2>&1 || echo "ERROR")
    PUBLISHED=$(echo "$PUB_OUTPUT" | grep -c "Published:" || echo "0")
    if [[ "$PUBLISHED" -eq "$EXPECTED_MODULE_COUNT" ]]; then
      pass "Published $PUBLISHED / $EXPECTED_MODULE_COUNT module-ready events"
    elif [[ "$PUBLISHED" -gt 0 ]]; then
      warn "Published $PUBLISHED / $EXPECTED_MODULE_COUNT (partial)"
    else
      fail "Publish script failed. Output: $(echo "$PUB_OUTPUT" | head -c 300)"
    fi
  fi

  # L5.4 — Nav service logs "Module ready signal received" within 30s
  info "Waiting 30s for nav service to consume events..."
  sleep 30

  NAV_LOG_AFTER=$(docker exec zu-core pm2 logs "$NAV_PM2_NAME" --lines 60 --nocolor 2>/dev/null || echo "")
  if echo "$NAV_LOG_AFTER" | grep -qi "module ready signal\|Module ready signal received"; then
    pass "Nav service: 'Module ready signal received' in logs"
  else
    fail "Nav service: 'Module ready signal received' NOT found in last 60 log lines"
    warn "Check: docker exec zu-core pm2 logs $NAV_PM2_NAME --lines 100"
  fi

  # L5.5 — Nav service logs "Cached nav for module"
  CACHE_COUNT=$(echo "$NAV_LOG_AFTER" | grep -c "Cached nav for module" || echo "0")
  if [[ $CACHE_COUNT -ge 10 ]]; then
    pass "Nav service: 'Cached nav for module' appears $CACHE_COUNT times"
  elif [[ $CACHE_COUNT -gt 0 ]]; then
    warn "Nav service: only $CACHE_COUNT / $EXPECTED_MODULE_COUNT modules cached so far"
    fail "Nav cache incomplete after 30s"
  else
    fail "Nav service: 'Cached nav for module' NOT found — events not reaching nav"
    warn "CRITICAL CHECK: topic is 'platform-module-ready' (hyphens). Event envelope must have:"
    warn "  { eventType: 'platform.module.ready', payload: { moduleId: '...' } }"
    warn "NOT: { type: '...', moduleId: '...' }"
  fi

  record_gate "L5 — Kafka Event Flow E2E" $((FAIL - gate_fail_before))
  check_stop
fi

# =============================================================================
# L6 — Navigation Cache (/menu API)
# =============================================================================
if should_run "L6"; then
  gate_header "L6 — Navigation Cache (/menu API)"
  gate_fail_before=$FAIL

  # Need a fresh token (cache may have expired, JWT may have changed)
  if [[ -z "$ACCESS_TOKEN" ]]; then
    LOGIN_RESP=$(http_body "${BASE_URL}/api/identity/api/v1/G/auth/login" \
      -X POST -H "Content-Type: application/json" \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}" 2>/dev/null || echo "{}")
    ACCESS_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || echo "")
    JWT_PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2 | \
      awk '{n=length($0)%4; if(n==2) $0=$0"=="; if(n==3) $0=$0"="; print}' | \
      base64 -d 2>/dev/null || echo "{}")
  fi

  USER_ID=$(echo "$JWT_PAYLOAD" | grep -o '"sub":"[^"]*"' | cut -d'"' -f4 || echo "")

  if [[ -z "$USER_ID" ]]; then
    fail "Cannot determine user ID from JWT — skipping L6"
    record_gate "L6 — Navigation Cache" 0
  else
    MENU_URL="${BASE_URL}/api/navigation/api/v1/U/${USER_ID}/navigation/menu"
    MENU_RESP=$(http_body "$MENU_URL" -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null || echo "{}")
    MENU_STATUS=$(http_status "$MENU_URL" -H "Authorization: Bearer $ACCESS_TOKEN")

    # L6.1 — /menu returns 200
    if [[ "$MENU_STATUS" == "200" ]]; then
      pass "Navigation /menu returns 200"
    else
      fail "Navigation /menu returned $MENU_STATUS (expected 200)"
    fi

    # L6.2 — stale: false
    if echo "$MENU_RESP" | grep -q '"stale":false'; then
      pass "Menu: stale = false (served from live registry cache)"
    else
      STALE_VAL=$(echo "$MENU_RESP" | grep -o '"stale":[a-z]*' | head -1)
      fail "Menu: $STALE_VAL (expected stale:false)"
      warn "Stale menu = nav cache empty or TTL expired. Run L5 first to repopulate."
    fi

    # L6.3 — sections array non-empty
    SECTION_COUNT=$(echo "$MENU_RESP" | grep -o '"sections":\[' | wc -l | tr -d ' ')
    ITEM_COUNT=$(echo "$MENU_RESP" | grep -o '"label"' | wc -l | tr -d ' ')

    if [[ $ITEM_COUNT -gt 0 ]]; then
      pass "Menu: $ITEM_COUNT items in sections (non-empty)"
    else
      fail "Menu: sections are EMPTY (0 items)"
      warn "Cause A: JWT privileges=[] — re-login when system is idle"
      warn "Cause B: Nav cache empty — run L5 to repopulate"
      warn "Cause C: Manifest has no navigation.sections — check manifest JSONB in registry DB"
    fi

    # L6.4 — Expected core modules present
    EXPECTED_IN_MENU=("Identity" "Navigation" "Event Bus" "Audit")
    for label in "${EXPECTED_IN_MENU[@]}"; do
      if echo "$MENU_RESP" | grep -qi "\"${label}\""; then
        pass "Menu section present: $label"
      else
        warn "Menu section NOT found: $label (privilege or cache issue)"
      fi
    done

    # L6.5 — menuSource = 'registry' or 'database' (not 'fallback')
    if echo "$MENU_RESP" | grep -q '"source":"registry"'; then
      pass "Menu source: registry (correct — served from module registry cache)"
    elif echo "$MENU_RESP" | grep -q '"source":"database"'; then
      pass "Menu source: database (served from nav DB)"
    elif echo "$MENU_RESP" | grep -q '"source":"fallback"'; then
      fail "Menu source: fallback (means registry cache is empty — run L5)"
    else
      SOURCE_VAL=$(echo "$MENU_RESP" | grep -o '"source":"[^"]*"' | head -1)
      info "Menu source: ${SOURCE_VAL:-unknown}"
    fi

    info "Full menu preview:"
    echo "$MENU_RESP" | grep -o '"label":"[^"]*"' | head -20 | sed 's/"label":"//;s/"//' | \
      awk '{print "    " $0}'

    record_gate "L6 — Navigation Cache" $((FAIL - gate_fail_before))
    check_stop
  fi
fi

# =============================================================================
# Summary
# =============================================================================
echo -e "\n"
summary

echo -e "\n${CYAN}Next step: Run L7 (browser UI) via:${RESET}"
echo -e "  cd testing/e2e-standalone-bundle"
echo -e "  npx ts-node runner.ts --config configs/zorbit-gate-checks.json --bouquet gate"
echo -e "\n${CYAN}Quick pipeline re-trigger (if L6 failed):${RESET}"
echo -e "  docker cp /opt/zorbit-platform/scripts/pub_module_ready.js ${REGISTRY_CONTAINER}:/tmp/"
echo -e "  docker exec ${REGISTRY_CONTAINER} node /tmp/pub_module_ready.js"

[[ $FAIL -eq 0 ]] && exit 0 || exit 1

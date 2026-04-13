#!/bin/bash
# ============================================================================
# Zorbit Environment Checker
# Usage:
#   ./check.sh uat                    # quick check against UAT
#   ./check.sh prod                   # quick check against PROD
#   ./check.sh scalatics              # quick check against zorbit.scalatics.com
#   ./check.sh uat full               # full UI + API check against UAT
#   ./check.sh prod ui                # UI check against PROD
#   ./check.sh uat api                # API-only check (no browser)
#   ./check.sh <url>                  # quick check against any URL
#   ./check.sh <url> full             # full check against any URL
#
# Bouquets:
#   (default / quick)  = env-quick   API health + direct login only (~30s)
#   ui                 = env-ui      Login + all pages + logout (~3 min)
#   full               = env-full    Everything (~5 min)
# ============================================================================

set -e
cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ENV="${1:-uat}"
MODE="${2:-quick}"

# ─── Resolve URL ─────────────────────────────────────────────────────────────
case "$ENV" in
  uat)
    URL="https://zorbit-uat.onezippy.ai"
    CREDS="credentials-uat"
    LABEL="UAT (zorbit-uat.onezippy.ai)"
    ;;
  prod)
    URL="https://zorbit-prod.onezippy.ai"
    CREDS="credentials-prod"
    LABEL="PROD (zorbit-prod.onezippy.ai)"
    ;;
  scalatics|main)
    URL="https://zorbit.scalatics.com"
    CREDS="credentials"
    LABEL="Main (zorbit.scalatics.com)"
    ;;
  dev)
    URL="https://zorbit-dev.onezippy.ai"
    CREDS="credentials-uat"
    LABEL="DEV (zorbit-dev.onezippy.ai)"
    ;;
  local)
    URL="http://localhost:5173"
    CREDS="credentials"
    LABEL="Local (localhost:5173)"
    ;;
  http*)
    URL="$ENV"
    CREDS="credentials"
    LABEL="Custom ($ENV)"
    ;;
  *)
    echo -e "${RED}Unknown environment: $ENV${NC}"
    echo ""
    echo "Usage: ./check.sh [uat|prod|scalatics|dev|local|<url>] [quick|ui|full]"
    exit 1
    ;;
esac

# ─── Resolve Bouquet ─────────────────────────────────────────────────────────
case "$MODE" in
  quick|api|fast)
    BOUQUET="env-quick"
    MODE_LABEL="Quick (API health + direct login)"
    ;;
  ui)
    BOUQUET="env-ui"
    MODE_LABEL="UI (login + all pages + logout)"
    ;;
  full|all)
    BOUQUET="env-full"
    MODE_LABEL="Full (API + UI + all pages)"
    ;;
  *)
    BOUQUET="env-quick"
    MODE_LABEL="Quick (default)"
    ;;
esac

# ─── Print header ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Zorbit Environment Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Environment : ${GREEN}${LABEL}${NC}"
echo -e "  URL         : ${YELLOW}${URL}${NC}"
echo -e "  Mode        : ${MODE_LABEL}"
echo -e "  Credentials : credentials/${CREDS}.json"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── Run ─────────────────────────────────────────────────────────────────────
#
# FLAGS YOU CAN CHANGE:
#
#   --headless     Run browser invisibly in background. No window opens.
#                  Remove this line (or pass --no-headless) to watch the
#                  browser live on screen as the test runs.
#
#   --no-voice     Suppress all TTS audio announcements during the run.
#                  Remove this line to hear spoken step narrations.
#
#   --url "$URL"   Override the base URL from the config file. Comes from
#                  the ENV argument above (uat / prod / custom URL).
#
#   --creds "$CREDS"  Which credentials JSON to use from credentials/ folder.
#                     E.g. "credentials-uat" → credentials/credentials-uat.json
#
#   --bouquet "$BOUQUET"  Which test suite to run:
#                     env-quick  = API health only, ~20s, no browser
#                     env-ui     = API + full browser walk, ~75s
#                     env-full   = Everything including logout, ~5min
#
./runme.sh \
  --config zorbit-env-check \
  --bouquet "$BOUQUET" \
  --url "$URL" \
  --creds "$CREDS" \
  --no-voice \
  "${@:3}"
#
# NOTE: --headless removed so the browser is VISIBLE during test runs.
# To run headless (no visible window), add --headless back to the line above.

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ All checks passed for ${LABEL}${NC}"
else
  echo -e "${RED}${BOLD}✗ Some checks FAILED for ${LABEL}${NC}"
  echo -e "${YELLOW}  Check screenshots in outputs/ for details${NC}"
fi
echo ""

exit $EXIT_CODE

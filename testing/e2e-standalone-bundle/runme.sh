#!/bin/bash
#
# Zorbit Unified Console - E2E Test Bundle Launcher
# Self-bootstrapping: checks Node.js, installs deps, launches runner.
#

set -e
cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

speak() {
    if command -v say &> /dev/null; then
        say "$1" &
    elif command -v espeak &> /dev/null; then
        espeak "$1" 2>/dev/null &
    fi
}

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}First time setup required...${NC}"
    speak "Setting up test environment"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed!${NC}"
        echo ""
        echo "Please install Node.js from: https://nodejs.org/"
        echo "Recommended: Node.js 22 LTS"
        echo ""
        read -p "Press Enter after installing Node.js..."
        if ! command -v node &> /dev/null; then
            echo -e "${RED}Node.js still not found. Exiting.${NC}"
            exit 1
        fi
    fi

    NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}Node.js version 18+ required (found v$NODE_VERSION)${NC}"
        echo "Please upgrade Node.js from: https://nodejs.org/"
        exit 1
    fi

    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install --loglevel=error

    echo -e "${GREEN}Installing Chromium browser...${NC}"
    npx playwright install chromium

    echo -e "${GREEN}Setup complete!${NC}"
    speak "Setup complete"
    sleep 2
fi

npx tsx runner.ts "$@"
EXIT_CODE=$?

# Post-process: convert WebM to MP4 + narration + playlist
LATEST_OUTPUT=$(ls -td outputs/*/ 2>/dev/null | head -1)
if [ -n "$LATEST_OUTPUT" ] && [ -d "${LATEST_OUTPUT}videos" ] && command -v ffmpeg &>/dev/null; then
  echo ""
  echo -e "${GREEN}Converting videos to MP4 with narration...${NC}"
  bash "$(dirname "$0")/post-process-videos.sh" "${LATEST_OUTPUT%/}"
fi

exit $EXIT_CODE

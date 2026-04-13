#!/bin/bash
# Post-process a SINGLE journey video: WebM → MP4 with title slide + narration
# Usage: post-process-single.sh <input.webm> <output.mp4> <journey_name> <index> <total>
set -e

WEBM="$1"
MP4="$2"
JOURNEY_NAME="$3"
IDX="$4"
TOTAL="$5"

[ -z "$WEBM" ] || [ -z "$MP4" ] && exit 1
command -v ffmpeg &>/dev/null || { cp "$WEBM" "$MP4" 2>/dev/null; exit 0; }

# ─── Read Config ───
CONFIG_FILE="$(dirname "$0")/video-config.json"
# Branding defaults
BRAND_PLATFORM="ZORBIT PLATFORM"
BRAND_DEMO="Zorbit Platform"
BRAND_BG_COLOR="#1e3a5f"
BRAND_TITLE_COLOR="#ffffff"
BRAND_SUBTITLE_COLOR="#8ab4d6"
BRAND_ACCENT_COLOR="#3b82f6"
BRAND_COUNTER_COLOR="#4b7baa"
# TTS defaults
TTS_VOICE="en-US-AriaNeural"
TTS_RATE="+15%"
# Title slide defaults
TITLE_MIN_DURATION=4
TITLE_EXTRA_BUFFER=1

# Title + subtitle + narration maps
declare -A TITLES SUBTITLES NARRATIONS

if [ -f "$CONFIG_FILE" ]; then
  eval "$(python3 -c "
import json
with open('$CONFIG_FILE') as f:
    cfg = json.load(f)
b = cfg.get('branding', {})
print(f'BRAND_PLATFORM=\"{b.get(\"platform\", \"ZORBIT PLATFORM\")}\"')
print(f'BRAND_DEMO=\"{b.get(\"demo\", \"Zorbit Platform\")}\"')
print(f'BRAND_BG_COLOR=\"{b.get(\"bgColor\", \"#1e3a5f\")}\"')
print(f'BRAND_TITLE_COLOR=\"{b.get(\"titleColor\", \"#ffffff\")}\"')
print(f'BRAND_SUBTITLE_COLOR=\"{b.get(\"subtitleColor\", \"#8ab4d6\")}\"')
print(f'BRAND_ACCENT_COLOR=\"{b.get(\"accentColor\", \"#3b82f6\")}\"')
print(f'BRAND_COUNTER_COLOR=\"{b.get(\"counterColor\", \"#4b7baa\")}\"')
t = cfg.get('tts', {})
print(f'TTS_VOICE=\"{t.get(\"voice\", \"en-US-AriaNeural\")}\"')
print(f'TTS_RATE=\"{t.get(\"rate\", \"+15%\")}\"')
ts = cfg.get('titleSlide', {})
print(f'TITLE_MIN_DURATION={ts.get(\"minDuration\", 4)}')
print(f'TITLE_EXTRA_BUFFER={ts.get(\"extraBuffer\", 1)}')
for j in cfg.get('journeys', []):
    jid = j.get('id', '')
    title = j.get('title', '').replace(\"'\", \"'\\\\''\")
    subtitle = j.get('subtitle', '').replace(\"'\", \"'\\\\''\")
    narration = j.get('narration', '').replace(\"'\", \"'\\\\''\")
    print(f\"TITLES[{jid}]='{title}'\")
    print(f\"SUBTITLES[{jid}]='{subtitle}'\")
    print(f\"NARRATIONS[{jid}]='{narration}'\")
" 2>/dev/null)" 2>/dev/null || true
fi

# Fallback defaults if config was missing or failed
: "${TITLES[setup]:=Organization Setup}";          : "${SUBTITLES[setup]:=Create org, roles & users}"
: "${TITLES[pcg4]:=Product Configuration}";         : "${SUBTITLES[pcg4]:=PCG4 8-step wizard}"
: "${TITLES[pricing]:=Product Pricing}";            : "${SUBTITLES[pricing]:=Rate tables & premium lookup}"
: "${TITLES[quotation]:=Health Insurance Application}"; : "${SUBTITLES[quotation]:=UAE quotation with PII protection}"
: "${TITLES[underwriting]:=Underwriting Workflow}";  : "${SUBTITLES[underwriting]:=Queue routing, approve & issue policy}"
: "${TITLES[decisioning]:=AI Decisioning Engine}";   : "${SUBTITLES[decisioning]:=Automated rules & STP evaluation}"
: "${TITLES[policy]:=Policy Issuance}";             : "${SUBTITLES[policy]:=Certificate verification & PDF}"

: "${NARRATIONS[setup]:=Setting up the organization, creating roles, and adding team members onto the platform.}"
: "${NARRATIONS[pcg4]:=Configuring the health insurance product using the PCG4 eight-step wizard.}"
: "${NARRATIONS[pricing]:=Reviewing the rate tables imported from the product rate card.}"
: "${NARRATIONS[quotation]:=Creating a new UAE health insurance application with proposer and member details.}"
: "${NARRATIONS[underwriting]:=The underwriting workflow. Approving the quotation, generating payment, and issuing the policy.}"
: "${NARRATIONS[decisioning]:=Reviewing the AI decisioning engine for automated straight-through processing.}"
: "${NARRATIONS[policy]:=Verifying the issued policy certificate and downloading the PDF.}"

# Match journey name to a config id
KEY=""
JOURNEY_LOWER=$(echo "$JOURNEY_NAME" | tr '[:upper:]' '[:lower:]')
for K in "${!TITLES[@]}"; do
  if echo "$JOURNEY_LOWER" | grep -q "$K"; then KEY="$K"; break; fi
done

# Guard against empty KEY — bash associative arrays crash on empty subscript
if [ -n "$KEY" ]; then
  TITLE="${TITLES[$KEY]:-$JOURNEY_NAME}"
  SUBTITLE="${SUBTITLES[$KEY]:-}"
  NARRATION="${NARRATIONS[$KEY]:-Step $((IDX+1)) of $TOTAL.}"
else
  TITLE="$JOURNEY_NAME"
  SUBTITLE=""
  NARRATION="Step $((IDX+1)) of $TOTAL: $JOURNEY_NAME."
fi

# Get video dimensions
VID_W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$WEBM" 2>/dev/null | head -1)
VID_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$WEBM" 2>/dev/null | head -1)
VID_W=${VID_W:-1280}; VID_H=${VID_H:-720}

# Convert main video
MAIN="/tmp/e2e-single-main-$$.mp4"
ffmpeg -y -i "$WEBM" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$MAIN" 2>/dev/null

# Generate TTS narration
AUDIO="/tmp/e2e-single-audio-$$.mp3"
TITLE_DUR=$TITLE_MIN_DURATION
if command -v edge-tts &>/dev/null; then
  edge-tts --text "$NARRATION" --voice "$TTS_VOICE" --rate "$TTS_RATE" --write-media "$AUDIO" 2>/dev/null
  if [ -f "$AUDIO" ] && [ -s "$AUDIO" ]; then
    NAR_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO" 2>/dev/null | head -1 | cut -d. -f1)
    [ -n "$NAR_DUR" ] && [ "$NAR_DUR" -gt 0 ] 2>/dev/null && TITLE_DUR=$((NAR_DUR + TITLE_EXTRA_BUFFER))
  fi
fi

# Generate title slide with Pillow
TITLE_PNG="/tmp/e2e-single-title-$$.png"
TITLE_VID="/tmp/e2e-single-title-$$.mp4"
python3 -c "
from PIL import Image, ImageDraw, ImageFont

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

W, H = $VID_W, $VID_H
bg_rgb = hex_to_rgb('$BRAND_BG_COLOR')
title_rgb = hex_to_rgb('$BRAND_TITLE_COLOR')
subtitle_rgb = hex_to_rgb('$BRAND_SUBTITLE_COLOR')
accent_rgb = hex_to_rgb('$BRAND_ACCENT_COLOR')
counter_rgb = hex_to_rgb('$BRAND_COUNTER_COLOR')

img = Image.new('RGB', (W, H), bg_rgb)
draw = ImageDraw.Draw(img)
try:
    fb = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
    fm = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
    fs = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 16)
except:
    fb = fm = fs = ImageFont.load_default()
draw.text((W//2, 55), '$BRAND_PLATFORM', fill=counter_rgb, font=fs, anchor='mt')
draw.text((W//2, 85), '$BRAND_DEMO', fill=subtitle_rgb, font=fm, anchor='mt')
draw.text((W//2, H//2 - 40), '''$TITLE''', fill=title_rgb, font=fb, anchor='mm')
draw.text((W//2, H//2 + 20), '''$SUBTITLE''', fill=subtitle_rgb, font=fm, anchor='mm')
draw.text((W//2, H - 50), '$((IDX+1)) of $TOTAL', fill=counter_rgb, font=fs, anchor='mm')
draw.rectangle([(W//2-60, H//2-5), (W//2+60, H//2-2)], fill=accent_rgb)
img.save('$TITLE_PNG')
" 2>/dev/null

if [ -f "$TITLE_PNG" ]; then
  ffmpeg -y -loop 1 -i "$TITLE_PNG" -c:v libx264 -t "$TITLE_DUR" -pix_fmt yuv420p -preset fast "$TITLE_VID" 2>/dev/null
  rm -f "$TITLE_PNG"
fi

# Concatenate title + main
CONCAT="/tmp/e2e-single-concat-$$.txt"
[ -f "$TITLE_VID" ] && echo "file '$TITLE_VID'" > "$CONCAT" || > "$CONCAT"
echo "file '$MAIN'" >> "$CONCAT"

if [ -f "$AUDIO" ] && [ -s "$AUDIO" ]; then
  JOINED="/tmp/e2e-single-joined-$$.mp4"
  ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy "$JOINED" 2>/dev/null
  TOTAL_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$JOINED" 2>/dev/null | head -1)
  ffmpeg -y -i "$JOINED" -i "$AUDIO" \
    -filter_complex "[1:a]apad=pad_dur=${TOTAL_DUR}[n];[n]atrim=0:${TOTAL_DUR}[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 128k -movflags +faststart -shortest \
    "$MP4" 2>/dev/null
  rm -f "$JOINED"
else
  ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy -movflags +faststart "$MP4" 2>/dev/null
fi

# Cleanup
rm -f "$MAIN" "$TITLE_VID" "$AUDIO" "$CONCAT"

# Update M3U playlist
MP4_DIR=$(dirname "$MP4")
PLAYLIST="$MP4_DIR/Playlist.m3u"
echo "$(basename "$MP4")" >> "$PLAYLIST"

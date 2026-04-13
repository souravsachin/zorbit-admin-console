#!/bin/bash
#
# Post-process E2E test videos
# Converts WebM → MP4 (H.264), adds TTS narration, creates M3U playlist
#
# TTS Fallback: edge-tts → piper → hosted-piper → hosted-edge → say (last resort)
#
set -e

OUTPUT_DIR="${1:-$(ls -td outputs/*/videos/.. 2>/dev/null | head -1)}"
if [ -z "$OUTPUT_DIR" ] || [ ! -d "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <output-dir>"
  echo "  e.g.: $0 outputs/2026-04-08T09-05-49"
  exit 1
fi

VIDEO_DIR="$OUTPUT_DIR/videos"
MP4_DIR="$OUTPUT_DIR/mp4"
RESULTS="$OUTPUT_DIR/results.json"

if [ ! -d "$VIDEO_DIR" ]; then
  echo "No videos directory found in $OUTPUT_DIR"
  exit 1
fi

mkdir -p "$MP4_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Post-Processing E2E Videos ==="
echo "Source: $VIDEO_DIR"
echo "Output: $MP4_DIR"
echo ""

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

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

if [ -f "$CONFIG_FILE" ]; then
  eval "$(python3 -c "
import json, sys
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
" 2>/dev/null)" 2>/dev/null || true
fi

# ─── TTS Engine Detection ───
# Fallback chain: edge-tts → piper → hosted-piper → hosted-edge → say
TTS_ENGINE=""
EDGE_TTS_VOICE="$TTS_VOICE"
PIPER_MODEL="$HOME/.local/share/piper-voices/en_US-amy-medium.onnx"
HOSTED_PIPER_URL="http://85.25.93.171:5200"  # oz-tts on server
HOSTED_EDGE_URL=""

if command -v edge-tts &>/dev/null; then
  TTS_ENGINE="edge-tts"
  echo -e "${GREEN}TTS: edge-tts ($EDGE_TTS_VOICE — Positive, Confident)${NC}"
elif command -v piper &>/dev/null || python3 -m piper --help &>/dev/null 2>&1; then
  TTS_ENGINE="piper"
  echo -e "${GREEN}TTS: piper (amy-medium)${NC}"
elif curl -s --connect-timeout 2 "$HOSTED_PIPER_URL/health" &>/dev/null; then
  TTS_ENGINE="hosted-piper"
  echo -e "${GREEN}TTS: hosted piper ($HOSTED_PIPER_URL)${NC}"
elif command -v say &>/dev/null; then
  TTS_ENGINE="say"
  echo -e "${YELLOW}TTS: macOS say (last resort fallback)${NC}"
else
  TTS_ENGINE="none"
  echo -e "${YELLOW}TTS: none available — videos will have no narration${NC}"
fi

# ─── TTS Function ───
generate_tts() {
  local TEXT="$1"
  local OUTPUT="$2"  # must be .mp3 or .wav

  case "$TTS_ENGINE" in
    edge-tts)
      edge-tts \
        --text "$TEXT" \
        --voice "$EDGE_TTS_VOICE" \
        --rate "$TTS_RATE" \
        --write-media "$OUTPUT" 2>/dev/null
      ;;
    piper)
      echo "$TEXT" | python3 -m piper \
        -m "$PIPER_MODEL" \
        --output_file "${OUTPUT%.mp3}.wav" 2>/dev/null
      # Convert WAV to MP3 for consistency
      if [ -f "${OUTPUT%.mp3}.wav" ]; then
        ffmpeg -y -i "${OUTPUT%.mp3}.wav" -c:a libmp3lame -b:a 128k "$OUTPUT" 2>/dev/null
        rm -f "${OUTPUT%.mp3}.wav"
      fi
      ;;
    hosted-piper)
      curl -s -X POST "$HOSTED_PIPER_URL/synthesize" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"$TEXT\"}" \
        -o "$OUTPUT" 2>/dev/null
      ;;
    say)
      local AIFF="/tmp/e2e-tts-$$.aiff"
      say -v "Samantha" -r 210 -o "$AIFF" "$TEXT" 2>/dev/null
      if [ -f "$AIFF" ]; then
        ffmpeg -y -i "$AIFF" -c:a libmp3lame -b:a 128k "$OUTPUT" 2>/dev/null
        rm -f "$AIFF"
      fi
      ;;
    *)
      return 1
      ;;
  esac

  [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]
}

# ─── Map Videos to Journeys ───
JOURNEY_NAMES=()
if [ -f "$RESULTS" ]; then
  JOURNEY_NAMES=($(python3 -c "
import json
with open('$RESULTS') as f:
    d = json.load(f)
seen = []
for s in d.get('steps', []):
    j = s.get('journey', '')
    if j and j not in seen:
        seen.append(j)
for j in seen:
    safe = j.replace(' ', '_').replace('(', '').replace(')', '').replace('/', '-')
    print(safe)
" 2>/dev/null))
fi

# Sorted by creation time (oldest first = journey order)
VIDEOS=($(ls -t "$VIDEO_DIR"/*.webm 2>/dev/null | tac))
VIDEO_COUNT=${#VIDEOS[@]}

echo "Found $VIDEO_COUNT videos, ${#JOURNEY_NAMES[@]} journeys"
echo ""

# ─── Journey Narrations + Title Slides (from config or fallback defaults) ───
declare -A NARRATIONS
declare -A TITLES
declare -A SUBTITLES

# Build ID-based lookup from video-config.json, then map by journey name or index
if [ -f "$CONFIG_FILE" ]; then
  # First load all journeys by index (legacy behavior)
  eval "$(python3 -c "
import json
with open('$CONFIG_FILE') as f:
    cfg = json.load(f)
for i, j in enumerate(cfg.get('journeys', [])):
    title = j.get('title', '').replace(\"'\", \"'\\\\''\")
    subtitle = j.get('subtitle', '').replace(\"'\", \"'\\\\''\")
    narration = j.get('narration', '').replace(\"'\", \"'\\\\''\")
    print(f\"TITLES[{i}]='{title}'\")
    print(f\"SUBTITLES[{i}]='{subtitle}'\")
    print(f\"NARRATIONS[{i}]='{narration}'\")
" 2>/dev/null)" 2>/dev/null || true

  # Now try ID-based matching: map actual journey names to config entries
  if [ ${#JOURNEY_NAMES[@]} -gt 0 ]; then
    eval "$(python3 -c "
import json, sys

with open('$CONFIG_FILE') as f:
    cfg = json.load(f)

# Build name->journey lookup from id + aliases
id_map = {}
for j in cfg.get('journeys', []):
    jid = j.get('id', '')
    if jid:
        id_map[jid] = j
        safe = jid.replace(' ', '_').replace('(', '').replace(')', '').replace('/', '-')
        id_map[safe] = j
        id_map[safe.lower()] = j
    # Also register aliases
    for alias in j.get('aliases', []):
        id_map[alias] = j
        id_map[alias.lower()] = j

# Journey names from results.json (passed via JOURNEY_NAMES bash array)
journey_names = '''${JOURNEY_NAMES[*]}'''.split()

for i, name in enumerate(journey_names):
    j = id_map.get(name) or id_map.get(name.lower()) or id_map.get(name.replace('_', '-')) or id_map.get(name.replace('_', '-').lower())
    if j:
        title = j.get('title', name).replace(\"'\", \"'\\\\\\''\")
        subtitle = j.get('subtitle', '').replace(\"'\", \"'\\\\\\''\")
        narration = j.get('narration', '').replace(\"'\", \"'\\\\\\''\")
        print(f\"TITLES[{i}]='{title}'\")
        print(f\"SUBTITLES[{i}]='{subtitle}'\")
        print(f\"NARRATIONS[{i}]='{narration}'\")
" 2>/dev/null)" 2>/dev/null || true
  fi
fi

# Fallback defaults if config was missing or failed
: "${TITLES[0]:=Organization Setup}"
: "${SUBTITLES[0]:=Create org, roles & users}"
: "${NARRATIONS[0]:=Setting up the organization, creating roles, and adding team members onto the platform.}"
: "${TITLES[1]:=Product Configuration}"
: "${SUBTITLES[1]:=PCG4 8-step wizard}"
: "${NARRATIONS[1]:=Configuring the health insurance product using the PCG4 eight-step wizard.}"
: "${TITLES[2]:=Product Pricing}"
: "${SUBTITLES[2]:=Rate tables & premium lookup}"
: "${NARRATIONS[2]:=Reviewing the rate tables imported from the product rate card.}"
: "${TITLES[3]:=Health Insurance Application}"
: "${SUBTITLES[3]:=UAE quotation with PII protection}"
: "${NARRATIONS[3]:=Creating a new health insurance application for the UAE region.}"
: "${TITLES[4]:=Underwriting Workflow}"
: "${SUBTITLES[4]:=Queue routing, approve & issue policy}"
: "${NARRATIONS[4]:=The underwriting workflow. Approving and issuing the policy.}"
: "${TITLES[5]:=AI Decisioning Engine}"
: "${SUBTITLES[5]:=Automated rules & STP evaluation}"
: "${NARRATIONS[5]:=Reviewing the AI decisioning engine for automated processing.}"
: "${TITLES[6]:=Policy Issuance}"
: "${SUBTITLES[6]:=Certificate verification & PDF}"
: "${NARRATIONS[6]:=Verifying the issued policy certificate and downloading the PDF.}"

# ─── Title Slide Generator (Python+Pillow → ffmpeg) ───
generate_title_slide() {
  local TITLE="$1"
  local SUBTITLE="$2"
  local NUM="$3"
  local TOTAL="$4"
  local OUTPUT="$5"   # .mp4 output
  local DURATION="${6:-4}"
  local W="${7:-1280}"
  local H="${8:-720}"

  local PNG="/tmp/e2e-title-${NUM}.png"

  python3 -c "
from PIL import Image, ImageDraw, ImageFont
import sys

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

W, H = $W, $H
bg_rgb = hex_to_rgb('$BRAND_BG_COLOR')
title_rgb = hex_to_rgb('$BRAND_TITLE_COLOR')
subtitle_rgb = hex_to_rgb('$BRAND_SUBTITLE_COLOR')
accent_rgb = hex_to_rgb('$BRAND_ACCENT_COLOR')
counter_rgb = hex_to_rgb('$BRAND_COUNTER_COLOR')

img = Image.new('RGB', (W, H), bg_rgb)
draw = ImageDraw.Draw(img)

# Try to load nice fonts, fall back to default
try:
    font_big = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
    font_med = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 24)
    font_sm  = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 16)
except:
    font_big = ImageFont.load_default()
    font_med = font_big
    font_sm  = font_big

# Top: Platform name
draw.text((W//2, 55), '$BRAND_PLATFORM', fill=counter_rgb, font=font_sm, anchor='mt')
# Subtitle: Demo name
draw.text((W//2, 85), '$BRAND_DEMO', fill=subtitle_rgb, font=font_med, anchor='mt')

# Center: Title
draw.text((W//2, H//2 - 40), '''$TITLE''', fill=title_rgb, font=font_big, anchor='mm')
# Below: Subtitle
draw.text((W//2, H//2 + 20), '''$SUBTITLE''', fill=subtitle_rgb, font=font_med, anchor='mm')

# Bottom: step counter
draw.text((W//2, H - 50), '$NUM of $TOTAL', fill=counter_rgb, font=font_sm, anchor='mm')

# Accent line
draw.rectangle([(W//2-60, H//2-5), (W//2+60, H//2-2)], fill=accent_rgb)

img.save('$PNG')
" 2>/dev/null

  if [ -f "$PNG" ]; then
    # Convert PNG to video clip
    ffmpeg -y -loop 1 -i "$PNG" -c:v libx264 -t "$DURATION" -pix_fmt yuv420p -preset fast "$OUTPUT" 2>/dev/null
    rm -f "$PNG"
  fi
}

# ─── Process Each Video ───
IDX=0
MP4_FILES=()
for WEBM in "${VIDEOS[@]}"; do
  if [ $IDX -lt ${#JOURNEY_NAMES[@]} ]; then
    JOURNEY="${JOURNEY_NAMES[$IDX]}"
  else
    JOURNEY="Journey_$((IDX+1))"
  fi

  MP4_FILE="$MP4_DIR/${IDX}_${JOURNEY}.mp4"
  NARRATION="${NARRATIONS[$IDX]:-Journey $((IDX+1)) of $TOTAL.}"

  TITLE="${TITLES[$IDX]:-$JOURNEY}"
  SUBTITLE="${SUBTITLES[$IDX]:-}"

  echo -e "${GREEN}[$((IDX+1))/$VIDEO_COUNT]${NC} $TITLE"

  # Get video dimensions
  VID_W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$WEBM" 2>/dev/null | head -1)
  VID_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$WEBM" 2>/dev/null | head -1)
  VID_W=${VID_W:-1280}
  VID_H=${VID_H:-720}

  # Convert main video to MP4 first (for consistent codec)
  MAIN_CLIP="/tmp/e2e-main-${IDX}.mp4"
  ffmpeg -y -i "$WEBM" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "$MAIN_CLIP" 2>/dev/null

  # Generate TTS narration first (need duration for title slide)
  AUDIO_FILE="/tmp/e2e-narration-${IDX}.mp3"
  rm -f "$AUDIO_FILE"
  TITLE_DURATION=$TITLE_MIN_DURATION  # from config or default 4

  TTS_OK=false
  if generate_tts "$NARRATION" "$AUDIO_FILE"; then
    TTS_OK=true
    # Get narration duration to match title slide length
    NAR_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_FILE" 2>/dev/null | head -1 | cut -d. -f1)
    if [ -n "$NAR_DUR" ] && [ "$NAR_DUR" -gt 0 ] 2>/dev/null; then
      TITLE_DURATION=$((NAR_DUR + TITLE_EXTRA_BUFFER))
    fi
    echo "  Narration: generated ($(du -h "$AUDIO_FILE" | awk '{print $1}'), title slide: ${TITLE_DURATION}s)"
  else
    echo "  Narration: skipped (TTS unavailable)"
  fi

  # Generate title slide (duration matches narration length, or 4s fallback)
  TITLE_CLIP="/tmp/e2e-title-${IDX}.mp4"
  generate_title_slide "$TITLE" "$SUBTITLE" "$((IDX+1))" "$VIDEO_COUNT" "$TITLE_CLIP" "$TITLE_DURATION" "$VID_W" "$VID_H"

  # Concatenate title slide + main video
  CONCAT_LIST="/tmp/e2e-concat-${IDX}.txt"
  echo "file '$TITLE_CLIP'" > "$CONCAT_LIST"
  echo "file '$MAIN_CLIP'" >> "$CONCAT_LIST"

  if [ "$TTS_OK" = true ]; then
    CONCAT_VIDEO="/tmp/e2e-concat-${IDX}.mp4"
    ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$CONCAT_VIDEO" 2>/dev/null

    # Get total duration for audio padding
    TOTAL_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CONCAT_VIDEO" 2>/dev/null | head -1)

    # Add narration audio to concatenated video
    ffmpeg -y \
      -i "$CONCAT_VIDEO" \
      -i "$AUDIO_FILE" \
      -filter_complex "[1:a]apad=pad_dur=${TOTAL_DUR}[narration];[narration]atrim=0:${TOTAL_DUR}[a]" \
      -map 0:v -map "[a]" \
      -c:v copy \
      -c:a aac -b:a 128k \
      -movflags +faststart \
      -shortest \
      "$MP4_FILE" 2>/dev/null

    rm -f "$AUDIO_FILE" "$CONCAT_LIST" "$CONCAT_VIDEO"
  else
    ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c copy -movflags +faststart "$MP4_FILE" 2>/dev/null
    rm -f "$CONCAT_LIST"
  fi

  rm -f "$TITLE_CLIP" "$MAIN_CLIP"

  if [ -f "$MP4_FILE" ]; then
    SIZE=$(du -h "$MP4_FILE" | awk '{print $1}')
    echo "  MP4: $(basename "$MP4_FILE") ($SIZE)"
    MP4_FILES+=("$MP4_FILE")
  else
    echo "  WARNING: Conversion failed"
  fi

  echo ""
  IDX=$((IDX+1))
done

# ─── Create M3U Playlist ───
PLAYLIST="$MP4_DIR/Playlist.m3u"
> "$PLAYLIST"
for MP4 in "${MP4_FILES[@]}"; do
  echo "$(basename "$MP4")" >> "$PLAYLIST"
done

echo "=== Post-Processing Complete ==="
echo "  MP4 files: ${#MP4_FILES[@]}"
echo "  Playlist:  $PLAYLIST"
echo "  TTS used:  $TTS_ENGINE"
echo ""
echo "Files:"
for MP4 in "${MP4_FILES[@]}"; do
  echo "  $MP4"
done
echo ""

# ─── Auto-open in preferred player ───
if [ ${#MP4_FILES[@]} -gt 0 ]; then
  if command -v vlc &>/dev/null; then
    echo "Opening in VLC..."
    vlc "$PLAYLIST" &>/dev/null &
  elif command -v mplayer &>/dev/null; then
    echo "Opening in mplayer..."
    mplayer -playlist "$PLAYLIST" &>/dev/null &
  elif [ "$(uname)" = "Darwin" ]; then
    echo "Opening folder in Finder..."
    open "$MP4_DIR"
  fi
fi

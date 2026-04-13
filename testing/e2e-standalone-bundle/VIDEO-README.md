# E2E Demo Video Recording & Post-Processing

## Quick Start

### Run E2E test + auto-generate MP4 videos
```bash
cd /Users/s/workspace/zorbit/02_repos/zorbit-unified-console/testing/e2e-standalone-bundle
./runme.sh --config awnic-demo.json --bouquet awnic-full
```

Each journey converts to MP4 immediately after completion. If you break midway, completed videos are already saved.

### Output location
```
outputs/<timestamp>/
  videos/       # Raw WebM from Playwright
  mp4/          # Processed MP4 with title slides + narration
    0_AWNIC_Setup.mp4
    1_PCG4_Full_Config.mp4
    2_Product_Pricing.mp4
    3_HI_Quotation_UAE.mp4
    4_UW_Workflow.mp4
    5_HI_Decisioning.mp4
    6_Policy_Issuance.mp4
    AWNIC-Demo-Playlist.m3u
```

### Play videos
```bash
# Single video
mplayer outputs/<timestamp>/mp4/0_AWNIC_Setup.mp4

# Full playlist
cd outputs/<timestamp>/mp4
mplayer -playlist AWNIC-Demo-Playlist.m3u
```

---

## Hand-Tuning Videos

### 1. Edit video-config.json

Open `video-config.json` and modify:

| Field | What it controls |
|-------|-----------------|
| `journeys[].title` | Large text on title slide |
| `journeys[].subtitle` | Smaller text below title |
| `journeys[].narration` | What the voice says (AriaNeural) |
| `journeys[].titleDurationOverride` | Set to a number (seconds) to force title slide length. `null` = auto-match narration length |
| `branding.platform` | Top line on title slide |
| `branding.demo` | Second line on title slide |
| `branding.bgColor` | Title slide background (hex) |
| `tts.voice` | TTS voice (default: en-US-AriaNeural) |
| `tts.rate` | Speech rate (+15% = slightly fast, +0% = normal) |
| `preSubmitPause` | Seconds to pause before submit clicks (captures filled form) |

### 2. Re-run post-processing only (no E2E re-run needed)

```bash
bash post-process-videos.sh outputs/<timestamp>
```

This re-generates all MP4s using the existing WebM recordings + your updated config.

### 3. Re-process a single video

```bash
bash post-process-single.sh \
  outputs/<timestamp>/videos/<file>.webm \
  outputs/<timestamp>/mp4/0_AWNIC_Setup.mp4 \
  "setup" 0 7
```

Arguments: `<input.webm> <output.mp4> <journey_key> <index> <total_count>`

---

## Video Structure

Each MP4 contains:
1. **Title slide** (navy background, white text) — duration matches narration
2. **AriaNeural narration** plays over the title slide
3. **Demo recording** starts immediately after title slide ends
4. **Pre-submit screenshots** auto-captured (1.5s pause before submit clicks)

---

## Credentials

Videos use multi-persona login:

| Journey | Persona | Role |
|---------|---------|------|
| Setup | Sourav Sachin | superadmin |
| PCG4 | Fatima Al-Rashid | Product Configurator |
| Pricing | Ahmed Al-Mansouri | Pricing Analyst |
| Quotation | Hessa Al-Nuaimi | Quotation Officer |
| UW Workflow | Omar Al-Hashimi | Underwriter |
| Decisioning | Sourav Sachin | superadmin |
| Policy | Omar Al-Hashimi | Underwriter |

Edit `credentials/credentials.json` to change login accounts.

---

## Dependencies

- Node.js 18+
- ffmpeg (for video conversion)
- edge-tts (for narration: `pip install edge-tts`)
- Python 3 + Pillow (for title slides: `pip install Pillow`)
- Playwright Chromium (auto-installed on first run)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No MP4 files | Run `bash post-process-videos.sh outputs/<timestamp>` manually |
| White screen at video start | The pre-warm navigates to base URL before recording. If still blank, increase wait in runner.ts |
| Narration missing | Check `edge-tts` is installed: `which edge-tts` |
| Title slide missing | Check `python3 -c "from PIL import Image; print('ok')"` |
| Login fails | Account may be locked. Run E2E to auto-unlock via API login |
| Playlist won't play | Use `mplayer -playlist file.m3u` (note the `-playlist` flag) |

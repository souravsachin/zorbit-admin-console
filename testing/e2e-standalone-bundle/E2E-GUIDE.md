# Zorbit E2E Testing & Video Recording Guide

## Quick Start

### Run the full test + auto-generate videos
```bash
cd /Users/s/workspace/zorbit/02_repos/zorbit-unified-console/testing/e2e-standalone-bundle
./runme.sh --config awnic-demo.json --bouquet awnic-full
```

### What happens
1. Playwright runs 7 journeys (Setup → PCG4 → Pricing → Quotation → UW → Decisioning → Policy)
2. Each journey logs in as a different persona (Fatima for PCG4, Ahmed for Pricing, etc.)
3. **Dynamic credentials**: Setup creates users with unique ${runId} suffix → subsequent journeys login as those freshly created users
4. Each journey's video converts to MP4 **immediately** after completion (title slide + AriaNeural narration)
5. M3U playlist generated in `outputs/<timestamp>/mp4/`

### Output location
```
outputs/<timestamp>/
  *.png                    # Screenshots at each step
  results.json             # Pass/fail results
  har-*.har                # Network traces
  videos/                  # Raw WebM from Playwright
  mp4/                     # Post-processed MP4 with title + narration
    0_setup.mp4
    1_pcg4.mp4
    ...
    AWNIC-Demo-Playlist.m3u
```

---

## Credentials Model

### How it works
The test uses a **two-layer credential system**:

1. **Static credentials** (`credentials/credentials.json`) — fallback defaults
2. **Runtime credentials** — captured during the test run via `captureCredential` action

During the Setup journey, users are created with `${runId}` suffix:
```
fatima.X7KP@awnic-demo.ae / Awnic@2026!
ahmed.X7KP@awnic-demo.ae  / Awnic@2026!
...
```

These are stored in runtime memory via `captureCredential` steps. When PCG4 journey starts, it resolves `${credentials.configurator.email}` from runtime first (gets `fatima.X7KP@...`), falling back to static credentials only if runtime is empty.

### Password hashing
The login uses SHA-256 client-side hashing. The E2E runner's login JavaScript handles this:
```javascript
const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
const hex = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('');
```

### Credential files
```
credentials/
  credentials.json          # Default (admin + 5 personas)
  credentials-uat.json      # UAT server credentials
  demo-awnic.json           # AWNIC demo-specific
```

---

## Video Configuration

### Edit `video-config.json` to customize videos

```json
{
  "branding": {
    "platform": "ZORBIT PLATFORM",
    "demo": "AWNIC Health Insurance Demo",
    "bgColor": "#1e3a5f",
    "titleColor": "#ffffff",
    "subtitleColor": "#8ab4d6",
    "accentColor": "#3b82f6"
  },
  "tts": {
    "engine": "edge-tts",
    "voice": "en-US-AriaNeural",
    "rate": "+15%"
  },
  "journeys": [
    {
      "id": "setup",
      "title": "Organization Setup",
      "subtitle": "Create org, roles & users",
      "narration": "Your custom narration text here...",
      "titleDurationOverride": null
    }
  ]
}
```

### Regenerate videos WITHOUT re-running the test
```bash
# Re-process existing WebM recordings with updated config
bash post-process-videos.sh outputs/<timestamp>
```

This reads `video-config.json`, regenerates title slides and narration, and produces new MP4 files. The raw WebM recordings are untouched.

### Re-process a single video
```bash
bash post-process-single.sh \
  outputs/<timestamp>/videos/<file>.webm \
  outputs/<timestamp>/mp4/0_AWNIC_Setup.mp4 \
  "setup" 0 7
```

---

## Running Against Different Servers

### UAT
```bash
./runme.sh --config awnic-demo-uat.json --bouquet awnic-full
```

### Custom server
1. Copy `configs/awnic-demo.json` to `configs/my-server.json`
2. Change `"baseUrl"` to your server URL
3. Update `credentials/credentials.json` with valid credentials
4. Run: `./runme.sh --config my-server.json --bouquet awnic-full`

---

## Prospect & Customer Portal Tests

### Prospect Portal
```bash
./runme.sh --config prospect-portal.json --bouquet prospect-demo
```

### Customer Portal
```bash
./runme.sh --config customer-portal.json --bouquet customer-demo
```

---

## Available Bouquets

| Config | Bouquet | Journeys | Description |
|--------|---------|----------|-------------|
| awnic-demo.json | awnic-full | 7 | Full AWNIC flow (Setup → Policy) |
| awnic-demo.json | awnic-complete | 7 | Same + UW approve + payment |
| awnic-demo.json | awnic-setup | 1 | Setup only (org, roles, users) |
| prospect-portal.json | prospect-demo | 1 | Prospect quote flow |
| customer-portal.json | customer-demo | 1 | Customer portal walkthrough |

---

## Dependencies

| Tool | Install | Purpose |
|------|---------|---------|
| Node.js 18+ | Auto-detected | Test runner |
| Chromium | Auto-installed on first run | Browser |
| ffmpeg | `brew install ffmpeg` | Video conversion |
| edge-tts | `pip install edge-tts` | Voice narration |
| Pillow | `pip install Pillow` | Title slide images |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No MP4 files | Run `bash post-process-videos.sh outputs/<timestamp>` manually |
| Login fails | Check credentials.json, verify SHA-256 hashing works |
| White screen in video | Pre-warm navigates to base URL before recording |
| Narration missing | Verify: `which edge-tts` |
| Playlist won't play | Use `mplayer -playlist file.m3u` |
| Account locked | Account has lockout_exempt=true, should not happen |

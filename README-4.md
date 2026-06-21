# sundial

A cozy, single-page front porch for free live TV — warm lo-fi summer theme, browser-grabbed
channel previews, a draggable remote, and a phone-first layout. It plays two public,
community-maintained playlists (**Free-TV/IPTV** and **iptv-org**). It hosts no video itself.

## Files

```
index.html        the whole app — markup, styles, three.js + hls.js, M3U parser, player, remote
api/playlist.js   Vercel serverless proxy (CORS fallback for the playlist fetch)
```

No `vercel.json`, no `package.json`, no build step. Vercel auto-detects the static
`index.html` and turns `api/playlist.js` into the `/api/playlist` function on its own.

## What's inside

- **Signal check + auto-remove.** As channels scroll into view, each is probed in the
  background: a stream is "receiving signal" only if the player can actually pull a media
  fragment from it. Anything that can't — offline, blocked, unreachable, or that drops during
  playback — is **removed from every list**: the grid, the channel count, Favorites, Recent,
  and any preset slot pointing at it. The dead status is cached 24h, and saved lists are pruned
  of known-dead channels on load, so they don't creep back. A small "N no-signal removed"
  counter in the status bar shows how many were dropped this session.
- **Never scroll back.** The player has Prev/Next buttons (and the remote's CH +/-) that jump
  to the next *live* channel, skipping known-dead ones. If whatever you're watching drops, it
  auto-skips forward to the next working channel on its own.
- **Mobile-first.** Two-column grid on phones, big touch targets, a bottom-sheet remote, lighter
  WebGL (it pauses while a stream plays), single-capture concurrency, and previews that pause
  during playback to save data. Telemetry is hidden on small screens to keep things calm.
- **Virtual remote.** A retro remote you can drag around on desktop or slide up from the bottom
  on mobile: power, guide, monitor wall, CH +/- , VOL +/- , mute, a numeric keypad (type a
  channel number, press OK), favorite, drift, play/pause, pop-out.
- **Warm lo-fi theme.** Golden-hour dusk palette, an animated sunset-haze WebGL background with
  a soft sun glow, analog film grain, a spinning tape-reel "now playing" tag, and warm
  Fraunces / Nunito / DM Mono type.
- Plus the full console: search, source + mood filters, a 9-slot preset "mixtape" bank,
  favorites & recents, drift/random, a 4-screen monitor wall, sleep timer, PiP, fullscreen,
  and keyboard shortcuts (press ?).

## Honest limits

- **Probing is viewport-driven, not all-at-once.** Checking thousands of streams on first
  paint is impossible on a phone, so channels are probed as they scroll into view; dead ones
  vanish as you reach them, which can cause a little reflow. The 24h cache means it's a
  once-a-day cost.
- **Health probing needs hls.js (MSE).** On Chrome/Android/desktop the probe matches what the
  player can do, so hidden = genuinely unplayable for you. On older iOS Safari (native HLS) the
  app can't probe reliably, so it errs toward showing channels rather than removing them.
- **Removal is real, and a touch aggressive.** A channel that's only *temporarily* down (a
  brief outage, a geo-block, a momentary timeout) gets removed and pruned from Favorites/Recent
  too, and won't be re-checked for 24h. That's the literal "remove from all lists" behavior —
  the upside is clean lists, the cost is the occasional false positive on a flaky-but-real channel.
- **Stream reliability is out of our hands.** The playlists are third-party; channels go
  offline, get geo-locked, or block playback. If one will not load, drift to another.
- **Storage degrades gracefully.** In a sandboxed preview, IndexedDB/localStorage may be blocked,
  so previews and presets live only for the session. On Vercel they persist.

## Deploy

### GitHub to Vercel (recommended)
1. Create a new GitHub repo and push these files (keep `api/` as a subfolder).
2. On vercel.com, Add New -> Project -> Import your repo.
3. Framework preset: **Other**. Leave build command and output directory **empty**.
4. **Deploy.** The site is live and `/api/playlist` works automatically.

If you previously committed a `vercel.json`, remove it (`git rm vercel.json`) — it is no longer
needed and the old `functions` block caused build failures. The proxy needs Node 18+ (Vercel's
default 20/22 is fine).

### Local
Serve the folder over HTTP (not file://, so the module + importmap load):
```
python3 -m http.server 8080
```
The `/api/playlist` proxy only exists on Vercel; locally, sources that block CORS may not load,
but Free-TV (the default) fetches directly.

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

- **Channel previews + Lost Signal.** As you scroll, each channel's stream is briefly loaded
  in a hidden player, one frame is drawn to a canvas, and that becomes its thumbnail. Previews
  are cached in **IndexedDB for 24 hours**, so they generate once and reuse on later visits.
  A frame that comes back **black** isn't trusted on the first look — the channel is sent to the
  back of the queue and retried after the rest, up to a few times (stations often start on a
  black ident or ad). Only a stream that won't load at all, or stays dark after every retry,
  drops into the separate, collapsible **Lost Signal** section. On-screen previews also refresh
  on a gentle interval so the wall feels live, and if a working channel goes offline during a
  refresh it gets moved to Lost Signal too. "No preview" is not always "broken": some still play.
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

- **Previews are viewport-driven, not all-at-once.** Loading thousands of streams on first paint
  is impossible (especially on a phone), so previews generate for channels as they scroll into
  view. The 24h cache means they only do this once per day.
- **Many streams can't be captured.** Drawing a cross-origin video to canvas throws a security
  error unless the stream sends permissive CORS headers, and native-HLS playback (older iOS
  Safari) taints the canvas entirely. Those land in Lost Signal. Capture works best on
  Chrome / Android / desktop where hls.js + MSE is used.
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

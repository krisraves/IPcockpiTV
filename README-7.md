# sundial

A clean, single-page guide for free live TV. Flat gunmetal theme, an intuitive channel
guide, a small floating player that stays out of your way, a saved-channels widget, and
automatic removal of channels that aren't receiving a signal. It plays two public,
community-maintained playlists (Free-TV/IPTV and iptv-org); it hosts no video itself.

## Files

```
index.html        the whole app — one file, no build, no dependencies except hls.js (CDN)
api/playlist.js   Vercel serverless proxy (CORS fallback for the playlist fetch)
```

No `vercel.json`, no `package.json`. Vercel serves `index.html` and turns `api/playlist.js`
into `/api/playlist` automatically.

## What it does

- **Intuitive guide.** Pick a source from the dropdown, filter by category chips, or search.
  The grid shows a clean card per channel (logo + name + category). Scroll loads more.
- **Dead channels remove themselves.** Each visible channel is quietly probed — a stream
  counts as live only if the player can actually pull a media fragment from it. Anything that
  can't (offline, blocked, unreachable) is dropped from the grid, the count, Favorites, and
  Recent. If a channel dies while you're watching, the player auto-skips to the next one.
  Dead channels are remembered for 24h so they don't reappear.
- **English only.** Non-English channels are filtered out. The app pulls iptv-org's authoritative
  English-language channel list and keeps only channels whose shared `tvg-id` is in it (this works
  across Free-TV and iptv-org alike). The default source is the English "Everything" list.
- **Unobtrusive player.** A small floating window. The channel name lives in its header bar —
  never over the video. Drag it by the header, minimize it to a strip, or close it. Picking a
  channel never scrolls the guide; it just updates the window in place.
- **Saved in a widget.** The "Saved" button opens a slide-in panel with Favorites and Recent
  tabs. Tap ★ on any channel to save it. Favorites and history persist locally.
- Keyboard: `/` search · `Space` play/pause · `[` `]` prev/next · `M` mute · `F` fullscreen ·
  `P` pop-out · `Esc` close.

## Deliberately left out (was overbuilt before)
Thumbnail frame-capture, the WebGL background, custom fonts, the 4-up monitor wall, the preset
bank, the separate remote, the sleep timer, and the telemetry readout were all removed to keep
this fast, stable, and mobile-friendly. The dead-channel detection now uses a lightweight
fragment probe instead of grabbing video frames to a canvas — that was the main source of the
old bugginess. Any of these can be added back on request.

## Honest limits
- **Probing is viewport-driven and best-effort.** It checks channels as they scroll into view,
  pauses while you're watching, and is capped (1 stream at a time on mobile, 2 on desktop). A
  genuinely slow channel can occasionally be misjudged as dead; clearing site data resets the
  24h dead list. Probing needs hls.js/MSE (Chrome/Android/desktop); on older iOS Safari it errs
  toward keeping channels and relies on play-time removal instead.
- **Removal is real.** A temporarily-down favorite gets removed and pruned too; re-save it once
  it's alive again.
- **Streams are third-party.** They go offline, get geo-locked, or block playback. If one won't
  load, the app moves on.
- **Storage degrades.** In a sandboxed preview, localStorage may be blocked, so saves last only
  for the session. On Vercel they persist.

## Deploy
1. Push these files to a GitHub repo (keep `api/` as a subfolder).
2. vercel.com → Add New → Project → Import. Framework preset **Other**; leave build command and
   output directory empty. Deploy.

Run locally with any static server (`python3 -m http.server 8080`); the `/api/playlist` proxy
only exists on Vercel, but the iptv-org sources (including the English default) may need it; Free-TV fetches directly.

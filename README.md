# SIGNAL — IPTV operations console

A single-page control console for two public, community-maintained M3U playlists:

- **Full TV** — [Free-TV/IPTV](https://github.com/Free-TV/IPTV) (`playlist.m3u8`)
- **Sports / News / Movies / Music / Kids / Docs / Everything** — [iptv-org](https://github.com/iptv-org/iptv) category and index playlists

It hosts no video. It reads those playlists, parses the channels, and plays the
free-to-air HLS streams they link to. WebGL "signal field" background (three.js),
HLS playback (hls.js), broadcast lower-third UI, and a full operations layer on top.

## What's in the console

- **Monitor wall** — watch up to four channels at once in a 2×2 grid; tap a screen to
  give it the audio. Toggle from the player bar.
- **Live signal telemetry** — resolution, bitrate, buffer depth, dropped frames, and a
  buffer-health meter, read live from hls.js / the video element (no audio is routed
  through Web Audio, so nothing gets muted).
- **Preset bank** — nine numbered slots, tunable with keys `1`–`9`. Persist across visits.
- **Favorites & Recents** — star any channel; recents fill automatically. Both appear as
  their own sources in the rail.
- **Surf & Scan** — `S` jumps to a random channel in the current filter; Scan auto-advances.
- **Transport** — play/pause, volume + mute, picture-in-picture, fullscreen, and a sleep
  timer that counts down and auto-stops.
- **Keyboard command layer** — `/` search · `S` surf · `[` `]` prev/next · `1`–`9` presets ·
  `Space` `M` `P` `F` `R` playback · `?` help · `Esc` close. Press `?` in the app for the list.
- **Console header** — live clock, session uptime, source, channel count, connection state.

State (favorites, recents, presets) is stored in `localStorage`, wrapped so it degrades to
in-memory if storage is blocked.

## Files

```
index.html        the whole app — markup, styles, three.js + hls.js, M3U parser
api/playlist.js   Vercel serverless proxy (CORS fallback for the playlist fetch)
vercel.json       minimal config
```

## Deploy

### GitHub → Vercel (recommended)
1. Create a new GitHub repo and push these files (keep the folder structure).
2. On vercel.com → **Add New… → Project → Import** your repo.
3. Framework preset: **Other**. No build command, no output dir — it's static.
4. **Deploy.** Your site is live; `api/playlist` becomes a function automatically.

### Vercel CLI
```bash
npm i -g vercel
cd signal
vercel
```

## How it works / why the proxy exists

The browser tries to fetch each playlist **directly** first. `raw.githubusercontent.com`
sends permissive CORS headers, so Free-TV usually loads with no proxy. The iptv-org
GitHub Pages host is less predictable, so if a direct fetch is blocked, the app
falls back to `/api/playlist?url=…`, which fetches server-side and returns the text.

The proxy only fetches an allowlisted set of hosts (see `api/playlist.js`) so it
can't be turned into an open relay.

> On plain static hosting with **no** serverless functions (e.g. GitHub Pages),
> the proxy fallback won't exist, so any CORS-blocked source will fail to load.
> Vercel is what makes the fallback work.

## Editing channels / sources

Open `index.html`, find the `SOURCES` array near the top of the `<script type="module">`.
Each entry is `{ id, t (title), s (subtitle), url }`. Add, remove, or repoint to any
public `.m3u` / `.m3u8` URL. Add a host to `ALLOWED_HOSTS` in `api/playlist.js` if a new
source needs the proxy.

## Honest caveats

- **Stream reliability is out of our hands.** These lists link to third-party
  free-to-air streams. Many are geo-locked, rate-limited, or go offline without
  notice. A channel that won't load is almost always the stream, not the site —
  hit **Reconnect** or pick another.
- **Some streams set CORS / referer restrictions** the browser can't satisfy, so
  they fail in-browser even though they'd work in a native player like VLC.
- **YouTube-live entries** in Free-TV won't play here — those need extraction a
  browser can't do. Most channels are direct HLS (`.m3u8`) and play fine.
- **Endpoints were verified reachable in June 2026.** Upstream repos can rename or
  restructure files; if a whole source goes blank, check the URL in `SOURCES`.
- **Legality varies by country and by stream.** "Free-to-air" is not universal.
  Check what you're allowed to watch where you are.

## Credits

Playlists: [Free-TV/IPTV](https://github.com/Free-TV/IPTV) and
[iptv-org](https://github.com/iptv-org/iptv), both community projects. SIGNAL is an
independent frontend and is not affiliated with either.

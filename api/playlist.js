// Vercel Serverless Function — CORS-safe M3U fetcher (CommonJS).
// Zero-config: Vercel turns this into the endpoint /api/playlist automatically.
// The frontend tries a direct fetch first and only falls back to this when the
// browser blocks the request cross-origin.

const ALLOWED_HOSTS = new Set([
  'raw.githubusercontent.com',
  'iptv-org.github.io',
]);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const target = req.query && req.query.url;
  if (!target) {
    res.status(400).send('Missing ?url=');
    return;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch (e) {
    res.status(400).send('Bad url');
    return;
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    res.status(403).send('Host not allowed');
    return;
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: { 'User-Agent': 'SIGNAL-iptv-frontend/1.0' },
    });
    if (!upstream.ok) {
      res.status(upstream.status).send('Upstream ' + upstream.status);
      return;
    }
    const text = await upstream.text();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).send('Fetch failed: ' + (err && err.message ? err.message : 'unknown'));
  }
};

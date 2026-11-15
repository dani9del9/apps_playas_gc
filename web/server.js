// Versión web de Playas GC.
// Sirve la misma página que lleva el APK (app/src/main/assets/www/index.html)
// y hace de puente con AEMET, que no permite peticiones desde el navegador (CORS).
// Sin dependencias: Node 18 o superior.  Uso:  node web/server.js   →  http://localhost:3000

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "..", "app", "src", "main", "assets", "www", "index.html");
const AEMET = "https://www.aemet.es";
// Solo se reenvían las rutas de playas, para que no sea un proxy abierto.
const ALLOWED = [/^\/xml\/playas\/play_v2_\d{7}\.xml$/, /^\/es\/eltiempo\/prediccion\/playas$/];
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map(); // url -> {t, status, type, body}

async function proxyAemet(req, res, url) {
  const sub = url.pathname.slice("/aemet".length);
  if (!ALLOWED.some(r => r.test(sub))) { res.writeHead(403); return res.end("Ruta no permitida"); }
  const target = AEMET + sub + url.search;
  const hit = cache.get(target);
  if (hit && Date.now() - hit.t < CACHE_MS) return send(res, hit);
  try {
    const r = await fetch(target, { headers: { "User-Agent": "PlayasGC/1.0" } });
    const entry = { t: Date.now(), status: r.status, type: r.headers.get("content-type") || "text/plain", body: Buffer.from(await r.arrayBuffer()) };
    if (r.ok) cache.set(target, entry);
    send(res, entry);
  } catch (e) {
    res.writeHead(502); res.end("AEMET no responde");
  }
}
function send(res, e) {
  res.writeHead(e.status, { "Content-Type": e.type, "Cache-Control": "public, max-age=300" });
  res.end(e.body);
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/aemet/")) return proxyAemet(req, res, url);
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); return res.end("No encuentro index.html"); }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(data);
    });
  }
  res.writeHead(404); res.end("No encontrado");
}).listen(PORT, () => console.log(`Playas GC web → http://localhost:${PORT}`));

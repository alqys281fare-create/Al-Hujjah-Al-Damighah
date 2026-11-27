// Cloudflare Worker that replaces json-server. Same URLs as json-server, data kept in Workers KV (seeded once from db.json).
import seed from "../db.json";

const COLS = ["sections", "packages", "requests"];
const SINGLES = ["settings", "pages", "auth"];
const BIG = "requests";                       // requests carry the customers' files, so each one gets its own KV key

const slim = (c, d) => (c === BIG && Array.isArray(d?.attachments) ? { ...d, attachments: d.attachments.map(({ data, ...a }) => a) } : d);
const cmp = (a, b) => (a == null ? 1 : b == null ? -1 : typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b)));

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };
    const send = (status, data) => new Response(status === 204 ? null : JSON.stringify(data ?? {}), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
    if (req.method === "OPTIONS") return send(204);

    try {
      const url = new URL(req.url);
      const [name, id] = url.pathname.replace(/^\/api(\/|$)/, "/").split("/").filter(Boolean).map(decodeURIComponent);
      if (!name) return send(200, { ok: true, service: "legal-site api" });
      const kv = env.LEGAL_SITE_KV;
      const J = JSON.stringify;
      const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await req.json().catch(() => ({})) : null;

      // first run: load db.json into KV
      if (!(await kv.get("meta:seeded"))) {
        for (const n of SINGLES) if (seed[n] != null) await kv.put("single:" + n, J(seed[n]));
        for (const c of COLS) {
          const list = seed[c] || [];
          if (c === BIG) for (const d of list) await kv.put(`doc:${c}:${d.id}`, J(d));
          await kv.put("idx:" + c, J(list.map((d) => slim(c, d))));
        }
        await kv.put("meta:seeded", "1");
      }

      if (SINGLES.includes(name) && id === undefined) {
        const cur = await kv.get("single:" + name, "json");
        if (req.method === "GET") return cur ? send(200, cur) : send(404);
        if (req.method === "PUT" || req.method === "PATCH") {
          const v = req.method === "PATCH" ? { ...(cur || {}), ...body } : body;
          await kv.put("single:" + name, J(v));
          return send(200, v);
        }
        return send(405);
      }
      if (!COLS.includes(name)) return send(404, { error: "not found" });

      const idx = (await kv.get("idx:" + name, "json")) || [];
      const same = (a, b) => String(a) === String(b);
      const saveIdx = (l) => kv.put("idx:" + name, J(l));

      if (req.method === "GET") {
        if (id === undefined) {
          const out = [...idx];
          const s = url.searchParams.get("_sort"), o = url.searchParams.get("_order");
          if (s) out.sort((a, b) => cmp(a[s], b[s]) * (o === "desc" ? -1 : 1));
          return send(200, out);
        }
        const one = name === BIG ? await kv.get(`doc:${name}:${id}`, "json") : idx.find((d) => same(d.id, id));
        return one ? send(200, one) : send(404);
      }

      if (req.method === "POST" && id === undefined) {
        const nid = body.id ?? idx.reduce((m, d) => Math.max(m, Number(d.id) || 0), 0) + 1;
        const doc = { ...body, id: nid };
        if (name === BIG) await kv.put(`doc:${name}:${nid}`, J(doc));
        await saveIdx([...idx.filter((d) => !same(d.id, nid)), slim(name, doc)]);
        return send(201, slim(name, doc));
      }

      if (id === undefined) return send(405);

      if (req.method === "PUT" || req.method === "PATCH") {
        const old = name === BIG ? await kv.get(`doc:${name}:${id}`, "json") : idx.find((d) => same(d.id, id));
        if (!old && req.method === "PATCH") return send(404);
        const doc = req.method === "PATCH" ? { ...old, ...body, id: old.id } : { ...body, id: body.id ?? id };
        if (name === BIG) await kv.put(`doc:${name}:${id}`, J(doc));
        const exists = idx.some((d) => same(d.id, id));
        await saveIdx(exists ? idx.map((d) => (same(d.id, id) ? slim(name, doc) : d)) : [...idx, slim(name, doc)]);
        return send(200, slim(name, doc));
      }

      if (req.method === "DELETE") {
        if (name === BIG) await kv.delete(`doc:${name}:${id}`);
        await saveIdx(idx.filter((d) => !same(d.id, id)));
        return send(200, {});
      }
      return send(405);
    } catch (e) {
      return send(500, { error: String(e?.message || e) });
    }
  },
};
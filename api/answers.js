// 내 답안 수집함 (Redis REST, 비밀번호 보호). AI 호출 없음 = 비용 0
export default async function handler(req, res) {
  if (!process.env.ANSWERS_PASSWORD || req.headers["x-answers-key"] !== process.env.ANSWERS_PASSWORD) {
    return res.status(401).json({ error: "비밀번호가 맞지 않습니다" });
  }
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(500).json({ error: "저장소(Redis)가 연결되지 않았습니다" });

  const KEY = "mach:answers";
  const cmd = async (...args) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d.result;
  };

  try {
    if (req.method === "GET") {
      const raw = await cmd("LRANGE", KEY, 0, -1);
      return res.status(200).json({ items: (raw || []).map((s) => JSON.parse(s)) });
    }

    if (req.method === "POST") {
      const b = req.body || {};
      const text = String(b.text || "").trim();
      if (!text) return res.status(400).json({ error: "답안이 비어 있습니다" });
      const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        topicId: b.topicId ?? null,
        topicTitle: String(b.topicTitle || "").slice(0, 200),
        round: b.round ?? null,
        q: b.q ? String(b.q).slice(0, 2000) : null,
        kind: ["교재 필사", "내 말", "혼합"].includes(b.kind) ? b.kind : "혼합",
        text: text.slice(0, 20000),
        memo: String(b.memo || "").slice(0, 500),
        savedAt: new Date().toISOString(),
      };
      await cmd("LPUSH", KEY, JSON.stringify(item));
      return res.status(200).json({ ok: true, id: item.id });
    }
    if (req.method === "PUT") {
      const b = req.body || {};
      const raw = await cmd("LRANGE", KEY, 0, -1);
      const idx = (raw || []).findIndex((s) => {
        try { return JSON.parse(s).id === b.id; } catch { return false; }
      });
      if (idx < 0) return res.status(404).json({ error: "찾을 수 없습니다" });
      const item = JSON.parse(raw[idx]);
      item.verify = b.verify || null;
      await cmd("LSET", KEY, idx, JSON.stringify(item));
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      const id = req.query.id;
      const raw = await cmd("LRANGE", KEY, 0, -1);
      const target = (raw || []).find((s) => {
        try { return JSON.parse(s).id === id; } catch { return false; }
      });
      if (!target) return res.status(404).json({ error: "찾을 수 없습니다" });
      await cmd("LREM", KEY, 1, target);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "저장소 오류", detail: e.message });
  }
}

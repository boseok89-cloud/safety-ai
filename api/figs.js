// 답안 그림 저장 (Redis 해시: 필드 = 답안 id). AI 호출 없음 = 비용 0
export default async function handler(req, res) {
  const pw = process.env.ANSWERS_PASSWORD;
  if (pw) {
    let sent = "";
    try { sent = decodeURIComponent(req.headers["x-answers-key"] || ""); } catch { sent = ""; }
    if (sent !== pw) return res.status(401).json({ error: "비밀번호가 맞지 않습니다" });
  }
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(500).json({ error: "저장소(Redis)가 연결되지 않았습니다" });

  const KEY = "mach:figs";
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
      const id = String((req.query || {}).id || "");
      if (!id) return res.status(400).json({ error: "id가 필요합니다" });
      const raw = await cmd("HGET", KEY, id);
      let figs = [];
      try { figs = raw ? JSON.parse(raw) : []; } catch {}
      return res.status(200).json({ figs });
    }

    if (req.method === "PUT") {
      const b = req.body || {};
      const id = String(b.id || "").slice(0, 40);
      if (!id) return res.status(400).json({ error: "id가 필요합니다" });
      const list = Array.isArray(b.figs) ? b.figs.slice(0, 3) : [];
      const clean = list
        .filter((f) => f && typeof f.data === "string" && /^data:image\/(png|jpeg);base64,/.test(f.data) && f.data.length <= 300000)
        .map((f) => ({ data: f.data, caption: String(f.caption || "").slice(0, 100) }));
      if (!clean.length) return res.status(400).json({ error: "저장할 그림이 없거나 너무 큽니다" });
      await cmd("HSET", KEY, id, JSON.stringify(clean));
      return res.status(200).json({ ok: true, count: clean.length });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "저장소 오류", detail: e.message });
  }
}

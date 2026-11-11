// 내 모범답안 저장 (Redis 해시: 필드 = 문제 제목). owner는 나중에 계정 분리를 위한 이름표. AI 호출 없음 = 비용 0
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

  const KEY = "mach:models";
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
      const raw = await cmd("HGETALL", KEY);
      const items = [];
      const push = (v) => { try { items.push(typeof v === "string" ? JSON.parse(v) : v); } catch {} };
      if (Array.isArray(raw)) { for (let i = 0; i + 1 < raw.length; i += 2) push(raw[i + 1]); }
      else if (raw && typeof raw === "object") Object.values(raw).forEach(push);
      return res.status(200).json({ items });
    }

    if (req.method === "PUT") {
      const b = req.body || {};
      const title = String(b.topicTitle || "").trim().slice(0, 100);
      if (!title) return res.status(400).json({ error: "문제 제목이 필요합니다" });
      const text = String(b.text || "").slice(0, 30000);
      if (!text.trim()) return res.status(400).json({ error: "답안이 비어 있습니다" });
      const cites = {};
      Object.entries(b.cites && typeof b.cites === "object" ? b.cites : {}).slice(0, 100).forEach(([k, v]) => {
        const res0 = ["ok", "bad", "skip"].includes(v && v.res) ? v.res : null;
        cites[String(k).slice(0, 200)] = { res: res0, src: String((v && v.src) || "").slice(0, 200) };
      });
      const item = {
        owner: "me",
        topicTitle: title,
        topicId: b.topicId ?? null,
        text,
        status: b.status === "confirmed" ? "confirmed" : "draft",
        cites,
        updatedAt: new Date().toISOString(),
      };
      await cmd("HSET", KEY, title, JSON.stringify(item));
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const title = String((req.query || {}).title || "").slice(0, 100);
      if (!title) return res.status(400).json({ error: "title이 필요합니다" });
      await cmd("HDEL", KEY, title);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "저장소 오류", detail: e.message });
  }
}

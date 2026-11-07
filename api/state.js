// 확정·진도 기록 저장 (Redis 해시 1개). 항목별로 저장해 서로 덮어쓰지 않게 함. AI 호출 없음 = 비용 0
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

  const KEY = "mach:state";
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
      const fields = {};
      if (Array.isArray(raw)) {
        for (let i = 0; i + 1 < raw.length; i += 2) {
          try { fields[raw[i]] = JSON.parse(raw[i + 1]); } catch {}
        }
      } else if (raw && typeof raw === "object") {
        Object.entries(raw).forEach(([f, v]) => {
          try { fields[f] = typeof v === "string" ? JSON.parse(v) : v; } catch {}
        });
      }
      return res.status(200).json({ fields });
    }

    if (req.method === "PUT") {
      const b = req.body || {};
      const entries = b.batch && typeof b.batch === "object" ? Object.entries(b.batch) : [];
      const okEntries = entries
        .filter(([f]) => /^(p|r|c):/.test(String(f)))
        .slice(0, 200);
      if (!okEntries.length) return res.status(400).json({ error: "저장할 항목이 없습니다" });
      const args = ["HSET", KEY];
      okEntries.forEach(([f, v]) => { args.push(String(f).slice(0, 300), JSON.stringify(v)); });
      await cmd(...args);
      return res.status(200).json({ ok: true, count: okEntries.length });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "저장소 오류", detail: e.message });
  }
}

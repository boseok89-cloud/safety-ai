// 법제처 조회 프록시 (OC는 서버에만 보관하고 응답에서 가림). AI 호출 없음 = 비용 0
// 법령·고시 본문 JSON에서 조문·항·호·목 내용만 순서대로 뽑는다
function flattenLaw(node, out) {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach((n) => flattenLaw(n, out)); return; }
  for (const [k, v] of Object.entries(node)) {
    if (/(조문|항|호|목)내용$/.test(k)) {
      const parts = [];
      const grab = (x) => { if (typeof x === "string") parts.push(x); else if (Array.isArray(x)) x.forEach(grab); };
      grab(v);
      const s = parts.join("\n").trim();
      if (s) out.push(s);
    } else if (v && typeof v === "object") flattenLaw(v, out);
  }
}

export default async function handler(req, res) {
  const oc = process.env.LAW_OC;
  if (!oc) return res.status(500).json({ error: "LAW_OC 환경변수가 없습니다 (Vercel 설정과 Redeploy 확인)" });

  const pw = process.env.ANSWERS_PASSWORD;
  if (pw) {
    let sent = "";
    try { sent = req.headers["x-answers-key"] ? decodeURIComponent(req.headers["x-answers-key"]) : String((req.query || {}).key || ""); } catch { sent = ""; }
    if (sent !== pw) return res.status(401).json({ error: "비밀번호가 맞지 않습니다" });
  }

  const q = req.query || {};
  const mode = q.mode === "detail" ? "detail" : "search";
  const target = ["law", "eflaw", "admrul"].includes(q.target) ? q.target : "law";
  const params = new URLSearchParams({ OC: oc, target, type: "JSON" });

  if (mode === "search") {
    if (!q.query) return res.status(400).json({ error: "query가 필요합니다" });
    params.set("query", String(q.query).slice(0, 100));
    params.set("display", String(Math.min(parseInt(q.display || "10", 10) || 10, 20)));
  } else {
    if (q.ID) params.set("ID", String(q.ID).slice(0, 20));
    else if (q.MST) params.set("MST", String(q.MST).slice(0, 20));
    else return res.status(400).json({ error: "ID 또는 MST가 필요합니다" });
    if (q.JO && /^\d{6}$/.test(String(q.JO))) params.set("JO", String(q.JO));
  }

  const path = "/DRF/" + (mode === "search" ? "lawSearch.do" : "lawService.do") + "?" + params.toString();
  const headers = { "User-Agent": "Mozilla/5.0 (safety-ai)", Referer: "https://www.safety-ai.co.kr/" };

  let r = null;
  let lastErr = "";
  for (const base of ["https://www.law.go.kr", "http://www.law.go.kr"]) {
    try { r = await fetch(base + path, { headers }); break; } catch (e) { lastErr = e.message; }
  }
  if (!r) return res.status(502).json({ error: "법제처에 연결하지 못했습니다", detail: lastErr });

  const text = (await r.text()).split(oc).join("***OC***");
  try {
    const data = JSON.parse(text);
    if (mode === "detail" && q.format === "text") {
      const lines = [];
      flattenLaw(data, lines);
      const uniq = lines.filter((s, i) => s !== lines[i - 1]);
      return res.status(200).json({ ok: true, upstreamStatus: r.status, lines: uniq, ...(uniq.length ? {} : { data }) });
    }
    return res.status(200).json({ ok: true, upstreamStatus: r.status, data });
  } catch {
    return res.status(200).json({ ok: false, upstreamStatus: r.status, contentType: r.headers.get("content-type"), preview: text.slice(0, 600) });
  }
}

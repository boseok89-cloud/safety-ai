import { ANSWER_BANK } from "./answerBank";

const STATUS = { draft: "초안", sourced: "출처확인", reviewed: "검토완료", proven: "검증됨" };
const KIND = {
  fact: { label: "사실", color: "#60a5fa" },
  mine: { label: "내 생각", color: "#34d399" },
  ai: { label: "AI 보완·미확인", color: "#fbbf24" },
};

export default function AnswerView({ answerKey }) {
  const a = ANSWER_BANK[answerKey];
  if (!a) return <div style={{ padding: 12, color: "#94a3b8" }}>답안 준비 중</div>;

  return (
    <div style={{ lineHeight: 1.7, color: "#e2e8f0" }}>
      <div style={{ marginBottom: 8 }}>
        <b>{a.title}</b>{" "}
        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "#334155", color: "#e2e8f0" }}>
          {STATUS[a.status] || a.status}
        </span>
      </div>

      {a.sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>{s.h}</div>
          {s.lines.map((l, j) => {
            const k = KIND[l.t] || KIND.ai;
            return (
              <div key={j} style={{ marginLeft: 8, borderLeft: `3px solid ${k.color}`, paddingLeft: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: k.color, marginRight: 6 }}>[{k.label}]</span>
                {l.text}
                {l.t === "fact" && (
                  <div style={{ fontSize: 12, color: l.src ? "#94a3b8" : "#f87171" }}>
                    {l.src ? `출처: ${l.src}` : "⚠ 출처 없음"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {(a.figures || []).map((f, i) => (
        <div key={i} style={{ marginTop: 12 }}>
          <img
            src={f.url}
            alt={f.caption}
            style={{ maxWidth: "100%", borderRadius: 6 }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{f.caption}</div>
          {(f.labels || []).map((lb) => (
            <div key={lb.id} style={{ fontSize: 13 }}>
              <b>{lb.id}. {lb.name}</b> - {lb.role}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

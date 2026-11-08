import { useRef, useState, useEffect, useCallback } from "react";

const W = 800;
const H = 480;
const COLORS = ["#111111", "#2563eb", "#dc2626"];
const TOOLS = [
  ["pen", "✏️ 펜"], ["line", "╱ 직선"], ["arrow", "➜ 화살표"], ["rect", "▭ 사각형"],
  ["ellipse", "◯ 원"], ["text", "T 글자"], ["erase", "🧽 지우개"],
];

function drawOp(ctx, op) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = op.color;
  ctx.fillStyle = op.color;
  ctx.lineWidth = op.width || 1;
  if (op.type === "pen" || op.type === "erase") {
    if (op.type === "erase") ctx.globalCompositeOperation = "destination-out";
    const p = op.points;
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    if (p.length === 1) ctx.lineTo(p[0].x + 0.1, p[0].y + 0.1);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.stroke();
  } else if (op.type === "line" || op.type === "arrow") {
    const { a, b } = op;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (op.type === "arrow") {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const L = 12 + op.width * 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - L * Math.cos(ang - Math.PI / 7), b.y - L * Math.sin(ang - Math.PI / 7));
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - L * Math.cos(ang + Math.PI / 7), b.y - L * Math.sin(ang + Math.PI / 7));
      ctx.stroke();
    }
  } else if (op.type === "rect") {
    const { a, b } = op;
    ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  } else if (op.type === "ellipse") {
    const { a, b } = op;
    ctx.beginPath();
    ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (op.type === "text") {
    ctx.font = `${op.size}px "Noto Sans KR", sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(op.text, op.x, op.y);
  }
  ctx.restore();
}

const btn = (on) => ({
  padding: "6px 9px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  background: on ? "rgba(59,130,246,0.25)" : "transparent",
  color: on ? "#60a5fa" : "#94a3b8",
  border: `1px solid ${on ? "#3b82f6" : "#1e3a5f"}`,
});

export default function DrawPad({ onAdd }) {
  const ref = useRef(null);
  const cur = useRef(null);
  const [ops, setOps] = useState([]);
  const [redo, setRedo] = useState([]);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);
  const [penOnly, setPenOnly] = useState(false);
  const [grid, setGrid] = useState(true);

  const render = useCallback((extra) => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ops.forEach((o) => drawOp(ctx, o));
    if (extra) drawOp(ctx, extra);
  }, [ops]);

  useEffect(() => { render(null); }, [render]);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const down = (e) => {
    if (penOnly && e.pointerType === "touch") return;
    e.preventDefault();
    const p = pos(e);
    if (tool === "text") {
      const t = window.prompt("넣을 글자를 입력하세요");
      if (t) {
        setOps((prev) => [...prev, { type: "text", x: p.x, y: p.y, text: t, color, size: 14 + width * 3 }]);
        setRedo([]);
      }
      return;
    }
    ref.current.setPointerCapture(e.pointerId);
    const w = tool === "erase" ? width * 4 : width;
    cur.current = tool === "pen" || tool === "erase"
      ? { type: tool, color, width: w, points: [p] }
      : { type: tool, color, width: w, a: p, b: p };
    render(cur.current);
  };

  const move = (e) => {
    if (!cur.current) return;
    const p = pos(e);
    if (cur.current.points) cur.current.points.push(p);
    else cur.current.b = p;
    render(cur.current);
  };

  const up = () => {
    if (!cur.current) return;
    const o = cur.current;
    cur.current = null;
    setOps((prev) => [...prev, o]);
    setRedo([]);
  };

  const undo = () => {
    if (!ops.length) return;
    setRedo([...redo, ops[ops.length - 1]]);
    setOps(ops.slice(0, -1));
  };
  const redoFn = () => {
    if (!redo.length) return;
    setOps([...ops, redo[redo.length - 1]]);
    setRedo(redo.slice(0, -1));
  };
  const clearAll = () => {
    if (ops.length && window.confirm("그림을 모두 지울까요?")) { setOps([]); setRedo([]); }
  };

  const add = () => {
    if (!ops.length) return;
    const t = document.createElement("canvas");
    t.width = W;
    t.height = H;
    const ctx = t.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(ref.current, 0, 0);
    let data = t.toDataURL("image/png");
    if (data.length > 250000) data = t.toDataURL("image/jpeg", 0.7);
    onAdd(data);
    setOps([]);
    setRedo([]);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
        {TOOLS.map(([k, label]) => (
          <button key={k} onClick={() => setTool(k)} style={btn(tool === k)}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)}
            style={{ width: 24, height: 24, borderRadius: 99, background: c, cursor: "pointer", border: color === c ? "3px solid #f59e0b" : "2px solid #334155" }} />
        ))}
        {[[2, "가늘게"], [4, "보통"], [7, "굵게"]].map(([w, l]) => (
          <button key={w} onClick={() => setWidth(w)} style={btn(width === w)}>{l}</button>
        ))}
      </div>
      <canvas ref={ref} width={W} height={H}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{
          width: "100%", aspectRatio: `${W} / ${H}`, display: "block", borderRadius: 8, background: "#fff",
          touchAction: "none", cursor: "crosshair",
          backgroundImage: grid ? "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)" : "none",
          backgroundSize: "5% 8.3333%",
        }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
        <button onClick={undo} style={btn(false)}>↩ 되돌리기</button>
        <button onClick={redoFn} style={btn(false)}>↪ 다시</button>
        <button onClick={clearAll} style={btn(false)}>🗑 모두 지우기</button>
        <button onClick={() => setGrid(!grid)} style={btn(grid)}>▦ 격자</button>
        <button onClick={() => setPenOnly(!penOnly)} style={btn(penOnly)}>🖐 펜만</button>
        <button onClick={add} style={{ ...btn(true), background: "#10b981", color: "#fff", border: "1px solid #10b981" }}>➕ 답안에 추가</button>
      </div>
    </div>
  );
}

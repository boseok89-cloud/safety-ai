import { useRef, useState, useEffect } from "react";

const W = 800;
const H = 480;
const COLORS = ["#111111", "#2563eb", "#dc2626"];
const TOOLS = [
  ["select", "👆 선택·이동"], ["pen", "✏️ 펜"], ["line", "╱ 직선"], ["arrow", "➜ 화살표"],
  ["rect", "▭ 사각형"], ["ellipse", "◯ 원"], ["text", "T 글자"], ["erase", "🧽 지우개"],
];
const TEXT_SIZES = [["작게", 16], ["보통", 24], ["크게", 36], ["아주 크게", 52]];
const NAMES = { pen: "펜 선", line: "직선", arrow: "화살표", rect: "사각형", ellipse: "원", text: "글자" };

let _m = null;
const measure = (op) => {
  if (!_m) _m = document.createElement("canvas").getContext("2d");
  _m.font = `${op.size}px "Noto Sans KR", sans-serif`;
  return _m.measureText(op.text).width;
};

const dist2seg = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

function bbox(op) {
  if (op.points) {
    const xs = op.points.map((q) => q.x), ys = op.points.map((q) => q.y);
    const pad = (op.width || 1) / 2;
    return { x1: Math.min(...xs) - pad, y1: Math.min(...ys) - pad, x2: Math.max(...xs) + pad, y2: Math.max(...ys) + pad };
  }
  if (op.a) {
    return { x1: Math.min(op.a.x, op.b.x), y1: Math.min(op.a.y, op.b.y), x2: Math.max(op.a.x, op.b.x), y2: Math.max(op.a.y, op.b.y) };
  }
  return { x1: op.x, y1: op.y, x2: op.x + measure(op), y2: op.y + op.size * 1.2 };
}

function hitOp(op, p, tol) {
  if (op.type === "pen") {
    const pts = op.points;
    if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= tol + op.width;
    for (let i = 1; i < pts.length; i++) {
      if (dist2seg(p, pts[i - 1], pts[i]) <= tol + op.width / 2) return true;
    }
    return false;
  }
  if (op.type === "line" || op.type === "arrow") return dist2seg(p, op.a, op.b) <= tol + op.width / 2;
  const b = bbox(op);
  return p.x >= b.x1 - tol && p.x <= b.x2 + tol && p.y >= b.y1 - tol && p.y <= b.y2 + tol;
}

function moved(op, dx, dy) {
  if (op.points) return { ...op, points: op.points.map((q) => ({ x: q.x + dx, y: q.y + dy })) };
  if (op.a) return { ...op, a: { x: op.a.x + dx, y: op.a.y + dy }, b: { x: op.b.x + dx, y: op.b.y + dy } };
  return { ...op, x: op.x + dx, y: op.y + dy };
}

function drawOp(ctx, op) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = op.color;
  ctx.fillStyle = op.color;
  ctx.lineWidth = op.width || 1;
  if (op.type === "pen") {
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

function paint(ctx, list) {
  list.forEach((o) => drawOp(ctx, o));
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
  const opsRef = useRef([]);
  const undoRef = useRef([]);
  const redoRef = useRef([]);
  const gest = useRef(null);
  const [, setTick] = useState(0);
  const [sel, setSel] = useState(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);
  const [textSize, setTextSize] = useState(24);
  const [penOnly, setPenOnly] = useState(false);
  const [grid, setGrid] = useState(true);

  const setOps = (n) => { opsRef.current = n; setTick((t) => t + 1); };
  const pushUndo = (before) => { undoRef.current.push(before); redoRef.current = []; };

  const render = (live) => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    paint(ctx, opsRef.current);
    if (live) drawOp(ctx, live);
    if (tool === "select" && sel !== null && opsRef.current[sel]) {
      const b = bbox(opsRef.current[sel]);
      ctx.save();
      ctx.strokeStyle = "#3b82f6";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x1 - 6, b.y1 - 6, b.x2 - b.x1 + 12, b.y2 - b.y1 + 12);
      ctx.restore();
    }
  };

  useEffect(() => { render(null); });

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const hitTest = (p, tol = 8) => {
    const list = opsRef.current;
    for (let i = list.length - 1; i >= 0; i--) if (hitOp(list[i], p, tol)) return i;
    return null;
  };

  const eraseAt = (p) => {
    const idx = hitTest(p, 10);
    if (idx !== null) { setOps(opsRef.current.filter((_, i) => i !== idx)); setSel(null); }
  };

  const down = (e) => {
    if (penOnly && e.pointerType === "touch") return;
    e.preventDefault();
    const p = pos(e);
    if (tool === "text") {
      const t = window.prompt("넣을 글자를 입력하세요");
      if (t) {
        const before = opsRef.current;
        pushUndo(before);
        setOps([...before, { type: "text", x: p.x, y: p.y, text: t, color, size: textSize }]);
      }
      return;
    }
    ref.current.setPointerCapture(e.pointerId);
    if (tool === "select") {
      const idx = hitTest(p);
      setSel(idx);
      if (idx !== null) gest.current = { mode: "move", start: p, idx, before: opsRef.current, orig: opsRef.current[idx], moved: false };
      return;
    }
    if (tool === "erase") { gest.current = { mode: "erase", before: opsRef.current }; eraseAt(p); return; }
    const op = tool === "pen" ? { type: "pen", color, width, points: [p] } : { type: tool, color, width, a: p, b: p };
    gest.current = { mode: "draw", op };
    render(op);
  };

  const move = (e) => {
    const g = gest.current;
    if (!g) return;
    const p = pos(e);
    if (g.mode === "draw") {
      if (g.op.points) g.op.points.push(p); else g.op.b = p;
      render(g.op);
    } else if (g.mode === "move") {
      g.moved = true;
      const o = moved(g.orig, p.x - g.start.x, p.y - g.start.y);
      setOps(g.before.map((x, i) => (i === g.idx ? o : x)));
    } else if (g.mode === "erase") {
      eraseAt(p);
    }
  };

  const up = () => {
    const g = gest.current;
    gest.current = null;
    if (!g) return;
    if (g.mode === "draw") { const before = opsRef.current; pushUndo(before); setOps([...before, g.op]); }
    else if (g.mode === "move") { if (g.moved) pushUndo(g.before); }
    else if (g.mode === "erase") { if (opsRef.current !== g.before) pushUndo(g.before); }
  };

  const patchSel = (fn) => {
    if (sel === null || !opsRef.current[sel]) return;
    const before = opsRef.current;
    pushUndo(before);
    setOps(before.map((x, i) => (i === sel ? { ...x, ...fn(x) } : x)));
  };
  const chooseColor = (c) => { setColor(c); patchSel(() => ({ color: c })); };
  const chooseWidth = (w) => { setWidth(w); patchSel((o) => (o.type === "text" ? {} : { width: w })); };
  const chooseSize = (s) => { setTextSize(s); patchSel((o) => (o.type === "text" ? { size: s } : {})); };

  const selOp = sel !== null ? opsRef.current[sel] : null;
  const editText = () => {
    if (!selOp || selOp.type !== "text") return;
    const t = window.prompt("글자 수정", selOp.text);
    if (t) patchSel(() => ({ text: t }));
  };
  const delSel = () => {
    if (sel === null) return;
    pushUndo(opsRef.current);
    setOps(opsRef.current.filter((_, i) => i !== sel));
    setSel(null);
  };

  const undo = () => {
    if (!undoRef.current.length) return;
    redoRef.current.push(opsRef.current);
    setOps(undoRef.current.pop());
    setSel(null);
  };
  const redo = () => {
    if (!redoRef.current.length) return;
    undoRef.current.push(opsRef.current);
    setOps(redoRef.current.pop());
    setSel(null);
  };
  const clearAll = () => {
    if (opsRef.current.length && window.confirm("그림을 모두 지울까요?")) { pushUndo(opsRef.current); setOps([]); setSel(null); }
  };

  const add = () => {
    if (!opsRef.current.length) return;
    const t = document.createElement("canvas");
    t.width = W;
    t.height = H;
    const ctx = t.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    paint(ctx, opsRef.current);
    let data = t.toDataURL("image/png");
    if (data.length > 250000) data = t.toDataURL("image/jpeg", 0.7);
    onAdd(data);
    undoRef.current = [];
    redoRef.current = [];
    setOps([]);
    setSel(null);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
        {TOOLS.map(([k, label]) => (
          <button key={k} onClick={() => { setTool(k); setSel(null); }} style={btn(tool === k)}>{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        {COLORS.map((c) => (
          <button key={c} onClick={() => chooseColor(c)}
            style={{ width: 24, height: 24, borderRadius: 99, background: c, cursor: "pointer", border: color === c ? "3px solid #f59e0b" : "2px solid #334155" }} />
        ))}
        {[[2, "가늘게"], [4, "보통"], [7, "굵게"]].map(([w, l]) => (
          <button key={w} onClick={() => chooseWidth(w)} style={btn(width === w)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>글자 크기</span>
        {TEXT_SIZES.map(([l, s]) => (
          <button key={s} onClick={() => chooseSize(s)} style={btn(textSize === s)}>{l}</button>
        ))}
      </div>
      {tool === "select" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            {selOp ? `선택됨: ${NAMES[selOp.type]} (끌어서 이동)` : "그림이나 글자를 눌러 선택하세요"}
          </span>
          {selOp && selOp.type === "text" && <button onClick={editText} style={btn(false)}>✎ 글자 수정</button>}
          {selOp && <button onClick={delSel} style={btn(false)}>🗑 선택 삭제</button>}
        </div>
      )}
      <canvas ref={ref} width={W} height={H}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{
          width: "100%", aspectRatio: `${W} / ${H}`, display: "block", borderRadius: 8, background: "#fff",
          touchAction: "none", cursor: tool === "select" ? "default" : tool === "erase" ? "cell" : "crosshair",
          backgroundImage: grid ? "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)" : "none",
          backgroundSize: "5% 8.3333%",
        }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
        <button onClick={undo} style={btn(false)}>↩ 되돌리기</button>
        <button onClick={redo} style={btn(false)}>↪ 다시</button>
        <button onClick={clearAll} style={btn(false)}>🗑 모두 지우기</button>
        <button onClick={() => setGrid(!grid)} style={btn(grid)}>▦ 격자</button>
        <button onClick={() => setPenOnly(!penOnly)} style={btn(penOnly)}>🖐 펜만</button>
        <button onClick={add} style={{ ...btn(true), background: "#10b981", color: "#fff", border: "1px solid #10b981" }}>➕ 답안에 추가</button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

// ── 업종별 시나리오 DB ───────────────────────────
const INDUSTRY_SCENARIOS = {
  "건설업": {
    workTypes: ["고소작업(비계/거푸집)", "굴착/토공작업", "철근/콘크리트 타설", "중량물 양중작업", "해체작업"],
    equipments: ["타워크레인", "이동식크레인", "지게차", "고소작업대", "굴착기", "항타기"],
    materials: ["시멘트", "철근", "LPG/산소(용접)", "유기용제", "방수재"],
    hazards: ["추락(고소작업)", "협착(중장비)", "낙하·비래", "붕괴·도괴", "감전", "화재·폭발"],
  },
  "제조업": {
    workTypes: ["프레스/절단 작업", "용접·용단 작업", "도장·도금 작업", "컨베이어 작업", "화학물질 취급"],
    equipments: ["프레스", "선반/밀링", "지게차", "컨베이어", "산업용 로봇", "호이스트"],
    materials: ["유기용제(신너/아세톤)", "도료", "산·알칼리", "윤활유", "압축가스"],
    hazards: ["협착·끼임(프레스)", "절단·베임", "화재·폭발(도장)", "화학물질 노출", "근골격계 질환", "소음"],
  },
  "물류·유통업": {
    workTypes: ["지게차 운전", "수작업 하역", "랙 입출고", "상하차 작업", "저온창고 작업"],
    equipments: ["지게차", "전동 파렛트 트럭", "컨베이어 벨트", "랙 시스템", "적재함"],
    materials: ["위험물(배터리·화학품)", "중량 화물", "냉매"],
    hazards: ["지게차 충돌·전도", "낙하(적재물)", "요통(중량물)", "저온 노출", "미끄러짐·넘어짐"],
  },
  "서비스업": {
    workTypes: ["전기 설비 점검", "시설 유지보수", "청소·위생관리", "엘리베이터 작업"],
    equipments: ["사다리", "전동공구", "청소 장비", "승강기"],
    materials: ["세정제·소독제", "윤활제"],
    hazards: ["추락(사다리)", "감전(전기작업)", "미끄러짐", "화학물질 노출", "근골격계 질환"],
  },
  "화학·석유업": {
    workTypes: ["화학물질 이송·충전", "반응기 운전", "밀폐공간 작업", "배관 정비", "폐수 처리"],
    equipments: ["반응기", "탱크로리", "컴프레셔", "펌프·밸브", "배관설비"],
    materials: ["인화성 액체", "독성 가스", "산·알칼리", "고압 증기", "폭발성 물질"],
    hazards: ["화재·폭발", "독성 물질 누출", "밀폐공간 질식", "고압 분출", "화상(고온·고압)"],
  },
};

// ── 공통 정보 (1단계에서만 입력) ─────────────────
const BASE_FIELDS = [
  { key: "company", label: "사업장명", placeholder: "예: OO건설 3공구" },
  { key: "industry", label: "업종", placeholder: "예: 건설업 / 제조업 / 물류업" },
  { key: "workers", label: "근로자수", placeholder: "예: 35명" },
  { key: "manager", label: "안전관리자", placeholder: "예: 홍길동" },
];

// ── 단계별 고유 필드만 정의 (사업장명 등 반복 제거) ──
const STEPS = [
  {
    id: 1, icon: "📁", title: "사전준비", subtitle: "평가기준 및 자료 수집", color: "#0ea5e9",
    uniqueFields: [
      { key: "evalType", label: "평가종류", placeholder: "예: 최초평가 / 정기평가 / 수시평가" },
      { key: "evalDate", label: "평가일자", placeholder: "예: 2026-05-06" },
      { key: "riskLevel", label: "허용위험성 기준", placeholder: "예: 상(즉시조치) / 중(단기) / 하(허용)" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 사전준비 단계 문서 작성. 포함: 사업장 기본정보, 법적근거(산업안전보건법 제36조), 평가팀 구성, 허용위험성 기준 매트릭스, 수집자료 목록, 평가일정. 전문적으로 한국어로.",
  },
  {
    id: 2, icon: "🔍", title: "유해·위험요인 파악", subtitle: "작업별 위험요인 도출", color: "#f59e0b",
    uniqueFields: [
      { key: "workArea", label: "작업장소/공정", placeholder: "예: 지하 2층 거푸집 설치 작업" },
      { key: "workType", label: "작업종류", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "equipment", label: "사용 기계·기구", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "materials", label: "취급 원자재/화학물질", placeholder: "업종 시나리오 선택 또는 직접 입력" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 유해·위험요인 파악 단계 문서 작성. 포함: 작업개요, 유해위험요인 목록표(8가지 이상/유형별), 재해유형, 파악방법. 전문적으로 한국어로.",
    hasScenario: true,
  },
  {
    id: 3, icon: "⚖️", title: "위험성 결정", subtitle: "가능성 × 중대성 = 위험성", color: "#ef4444",
    uniqueFields: [
      { key: "hazards", label: "주요 위험요인", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "method", label: "위험성 추정 방법", placeholder: "예: 빈도·강도법 / 핵심요인 기술법" },
      { key: "currentMeasures", label: "현재 안전조치 현황", placeholder: "예: 안전난간 설치, 안전대 지급" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성 결정 단계 문서 작성. 포함: 위험성 추정 매트릭스, 위험요인별 결정표, 허용불가 위험성 목록, 판단근거. 전문적으로 한국어로.",
    hasScenario: true,
  },
  {
    id: 4, icon: "🛡️", title: "감소대책 수립·실행", subtitle: "위험성 제거 및 저감 조치", color: "#22c55e",
    uniqueFields: [
      { key: "highRisks", label: "허용불가 위험요인", placeholder: "예: 추락(상), 협착(상), 감전(중)" },
      { key: "budget", label: "개선 가용예산", placeholder: "예: 약 500만원" },
      { key: "deadline", label: "조치 완료기한", placeholder: "예: 2026-06-30" },
      { key: "responsible", label: "조치 책임자", placeholder: "예: 현장소장 김○○" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성 감소대책 수립·실행 단계 문서 작성. 포함: 감소대책 우선순위원칙, 위험요인별 실행계획표, 단기/중장기 조치, 개선전후 위험성 비교, 잔류위험 관리. 실용적으로 한국어로.",
  },
  {
    id: 5, icon: "📢", title: "위험성평가 공유", subtitle: "근로자 주지 및 교육", color: "#8b5cf6",
    uniqueFields: [
      { key: "shareMethod", label: "공유 방법", placeholder: "예: 조회시간 교육, 게시판 부착" },
      { key: "shareDate", label: "공유 일자", placeholder: "예: 2026-05-10" },
      { key: "keyPoints", label: "강조할 핵심 위험요인", placeholder: "예: 추락, 협착, 화재" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 공유 단계 문서 작성. 포함: 공유목적/법적근거, 핵심위험요인 요약, 현장게시용 안전수칙 5가지, 근로자 의견수렴, 서명란. 한국어로.",
  },
  {
    id: 6, icon: "📂", title: "기록 및 보존", subtitle: "3년 보존 의무 문서 완성", color: "#64748b",
    uniqueFields: [
      { key: "evalPeriod", label: "평가 기간", placeholder: "예: 2026-05-01 ~ 2026-05-10" },
      { key: "totalHazards", label: "총 위험요인 수", placeholder: "예: 15개" },
      { key: "highCount", label: "고위험(상) 건수", placeholder: "예: 3건" },
      { key: "midCount", label: "중위험(중) 건수", placeholder: "예: 7건" },
      { key: "lowCount", label: "저위험(하) 건수", placeholder: "예: 5건" },
      { key: "nextEval", label: "다음 평가 예정일", placeholder: "예: 2027-05-01" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 기록 및 보존 단계 문서 작성. 포함: 최종결과 요약(통계), 법정보존서류 목록(시행규칙 제37조), 보존방법/기간(3년), 총평, 수시평가 기준, 다음 정기평가 계획, 서명란. 한국어로.",
  },
];

const C = {
  navy: "#0f2640", blue: "#1a3a5c", accent: "#0ea5e9",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  purple: "#8b5cf6", slate: "#64748b", bg: "#f0f4f8",
};

async function saveStorage(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}
async function loadStorage(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}

export default function App() {
  // 세션 공통 정보 (1단계 → 전체 공유)
  const [baseInfo, setBaseInfo] = useState({ company: "", industry: "", workers: "", manager: "" });
  const [baseConfirmed, setBaseConfirmed] = useState(false); // 1단계 기본정보 확정 여부

  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("assessment");
  const [activeStep, setActiveStep] = useState(null);
  const [stepData, setStepData] = useState({}); // 단계별 고유 데이터
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [history, setHistory] = useState([]);

  const [showScenario, setShowScenario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  

  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      const p = await loadStorage("company-profile");
      if (p) { setBaseInfo(p); setBaseConfirmed(true); }
      const h = await loadStorage("eval-history");
      if (h) setHistory(h);
    })();
  }, []);

  // 전체 데이터 = baseInfo + 단계별 고유 데이터
  const getAllData = () => ({ ...baseInfo, ...stepData });

  const callAI = async (prompt) => {
    setLoading(true);
    setResult("");
    const allData = getAllData();
    const info = Object.entries(allData).map(([k, v]) => `${k}: ${v || "미입력"}`).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",        
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022
          max_tokens: 1000,
          system: prompt,
          messages: [{ role: "user", content: `다음 정보로 문서를 작성해주세요:\n\n${info}` }],
        }),
      });
      const d = await res.json();
      const text = d.content?.map(b => b.text || "").join("") || "오류가 발생했습니다.";
      setResult(text);
      const entry = {
        id: Date.now(),
        step: activeStep?.title,
        company: baseInfo.company || "미입력",
        date: new Date().toLocaleDateString("ko-KR"),
        preview: text.slice(0, 60) + "...",
        full: text,
      };
      const newH = [entry, ...history].slice(0, 20);
      setHistory(newH);
      await saveStorage("eval-history", newH);
    } catch {
      setResult("오류가 발생했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
  };

  // 엑셀/CSV 통합 파싱
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const parseRows = (rows) => {
      const base = { ...baseInfo };
      const step = { ...stepData };
      let cnt = 0;
      rows.forEach(row => {
        // 각 행의 첫 셀=키, 두번째 셀=값
        const key = String(row[0] || "").trim().toLowerCase();
        const val = String(row[1] || "").trim();
        if (!key || !val) return;
        if (key.includes("사업장") || key.includes("company"))       { base.company   = val; cnt++; }
        else if (key.includes("업종") || key.includes("industry"))   { base.industry  = val; cnt++; }
        else if (key.includes("근로자") || key.includes("worker"))   { base.workers   = val; cnt++; }
        else if (key.includes("관리자") || key.includes("manager"))  { base.manager   = val; cnt++; }
        else if (key.includes("작업종류") || key.includes("worktype")){ step.workType  = val; cnt++; }
        else if (key.includes("기계") || key.includes("equipment"))  { step.equipment = val; cnt++; }
        else if (key.includes("화학") || key.includes("material"))   { step.materials = val; cnt++; }
        else if (key.includes("위험") || key.includes("hazard"))     { step.hazards   = val; cnt++; }
      });
      setBaseInfo(base);
      setStepData(step);
      if (base.company) setBaseConfirmed(true);
      if (cnt > 0) alert(`✅ ${cnt}개 항목 자동 입력 완료!`);
      else alert("⚠️ 인식된 항목이 없어요.\n첫 열에 항목명(예: 사업장명), 두번째 열에 값을 입력해주세요.");
    };

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          parseRows(rows);
        } catch {
          alert("❌ 엑셀 파일을 읽을 수 없어요. 파일이 손상됐거나 형식이 맞지 않아요.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV / TXT
      const reader = new FileReader();
      reader.onload = (ev) => {
        const lines = ev.target.result.split("\n").filter(Boolean);
        const rows = lines.map(line => line.split(",").map(c => c.trim().replace(/"/g, "")));
        parseRows(rows);
      };
      reader.readAsText(file, "UTF-8");
    }
    e.target.value = "";
  };

  const applyScenario = (industry) => {
    const sc = INDUSTRY_SCENARIOS[industry];
    if (!sc) return;
    setStepData(prev => ({
      ...prev,
      workType: sc.workTypes.join(", "),
      equipment: sc.equipments.join(", "),
      materials: sc.materials.join(", "),
      hazards: sc.hazards.join(", "),
    }));
    setShowScenario(false);
  };

  // ── 공통 헤더 ──────────────────────────────────
  const Header = ({ title, onBack, right }) => (
    <div style={{
      background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
      padding: "14px 16px", position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.12)", border: "none",
            borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 13, cursor: "pointer",
          }}>← 뒤로</button>
        )}
        <div style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</div>
        {right}
      </div>
    </div>
  );

  // ── 공통 정보 배너 (2~6단계 상단 표시) ──────────
  const BaseInfoBanner = () => (
    baseConfirmed && baseInfo.company ? (
      <div style={{
        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: 11, padding: "10px 14px", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>✅ 공통정보 자동 적용 중</div>
          <div style={{ fontSize: 12, color: "#4b7c5e", marginTop: 2 }}>
            {baseInfo.company} · {baseInfo.industry} · {baseInfo.workers} · 관리자: {baseInfo.manager}
          </div>
        </div>
        <button onClick={() => setScreen("step-form-1")} style={{
          background: "none", border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: 7, padding: "4px 10px", color: "#166534",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
        }}>수정</button>
      </div>
    ) : null
  );

  // ══════════════════════════════════════════════
  // 홈
  // ══════════════════════════════════════════════
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "20px 16px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>⚠️</span>
              <div>
                <div style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>위험성평가 전문 시스템</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>고용노동부 고시 제2024-76호 · 공통정보 자동연결</div>
              </div>
            </div>
            <button onClick={() => { setShowProfileModal(true); }} style={{
              background: baseConfirmed ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)",
              border: `1px solid ${baseConfirmed ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderRadius: 10, padding: "7px 12px", color: "#fff",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              {baseConfirmed ? "✅ 프로필" : "🏢 프로필"}
            </button>
          </div>

          {/* 공통정보 상태 */}
          {baseConfirmed ? (
            <div style={{
              background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🏢</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{baseInfo.company}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 1 }}>
                  {baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}
                </div>
              </div>
              <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 700 }}>전 단계 자동적용</div>
            </div>
          ) : (
            <div style={{
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              fontSize: 12, color: "#fbbf24",
            }}>
              💡 STEP 1 사전준비에서 사업장 정보를 입력하면 모든 단계에 자동 적용돼요
            </div>
          )}

          {/* 진행바 */}
          <div style={{ display: "flex", gap: 4 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                flex: 1, height: 5, borderRadius: 3,
                background: completedSteps.includes(i + 1) ? C.green : "rgba(255,255,255,0.18)",
                transition: "all 0.4s",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 0" }}>
        <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 11, padding: 3, gap: 3 }}>
          {[{ k: "assessment", l: "📋 위험성평가" }, { k: "education", l: "🎓 교육자료" }, { k: "history", l: "📜 이력" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
              background: tab === t.k ? "#fff" : "transparent",
              color: tab === t.k ? C.navy : C.slate,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: tab === t.k ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s",
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* 위험성평가 탭 */}
      {tab === "assessment" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 14px 28px" }}>
          {/* CSV 업로드 */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: "12px 14px",
            boxShadow: "0 1px 5px rgba(0,0,0,0.05)", marginBottom: 12,
            display: "flex", gap: 8,
          }}>
            <button onClick={() => fileRef.current?.click()} style={{
              flex: 1, padding: "9px 0",
              background: "rgba(14,165,233,0.08)", border: "1.5px solid rgba(14,165,233,0.3)",
              borderRadius: 9, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>📊 엑셀/CSV 불러오기</button>
            <button onClick={() => setShowScenario(true)} style={{
              flex: 1, padding: "9px 0",
              background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)",
              borderRadius: 9, color: C.amber, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>🏭 업종별 시나리오</button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} style={{ display: "none" }} />
          </div>

          {/* 단계 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STEPS.map((s, i) => {
              const done = completedSteps.includes(i + 1);
              return (
                <button key={s.id} onClick={() => {
                  setActiveStep(s);
                  setStepData({});
                  setResult("");
                  setScreen("step-form");
                }} style={{
                  background: "#fff", border: `2px solid ${done ? C.green : "#e2e8f0"}`,
                  borderRadius: 13, padding: "13px 15px",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                  boxShadow: "0 1px 5px rgba(0,0,0,0.04)", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: done ? `${C.green}18` : `${s.color}12`,
                    border: `2px solid ${done ? C.green : s.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                  }}>{done ? "✅" : s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: s.color,
                        background: `${s.color}15`, padding: "1px 7px", borderRadius: 20,
                      }}>STEP {s.id}</span>
                      {done && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>완료</span>}
                      {s.id === 1 && !baseConfirmed && (
                        <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>← 여기서 시작!</span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                      {s.id === 1 ? "사업장 공통정보 입력 → 전 단계 자동적용" : s.subtitle}
                    </div>
                  </div>
                  <div style={{ color: "#cbd5e1", fontSize: 18 }}>›</div>
                </button>
              );
            })}
          </div>

          <div style={{
            marginTop: 12, padding: "11px 14px",
            background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)",
            borderRadius: 10, fontSize: 12, color: "#0369a1", lineHeight: 1.7,
          }}>
            📌 산업안전보건법 제36조 — 상시근로자 1인 이상 전 사업장 의무 실시 · 결과 <strong>3년 보존</strong>
          </div>
        </div>
      )}

      {/* 교육자료 탭 */}
      {tab === "education" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 14px 28px" }}>
          {[
            { icon: "🎓", title: "위험성평가 실시 전 교육", badge: "사전교육", color: C.accent, when: "평가 시작 전", prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 실시 전 교육자료 작성. 포함: 정의/목적, 법적의무, 역할분담, 6단계 절차, 판단기준 매트릭스, 사례비교, O/X 퀴즈 5문제. 쉽게 한국어로." },
            { icon: "📝", title: "개선대책 이행 후 교육", badge: "완료 후", color: C.green, when: "감소대책 완료 후", prompt: "위험성평가 감소대책 이행 후 교육자료 작성. 포함: 평가결과 요약, 개선조치 상세, 변경된 작업방법, 잔류위험 주의, 금지행위, 보고절차, O/X 퀴즈 5문제. 쉽게 한국어로." },
            { icon: "🔄", title: "정기 안전교육 (위험성평가 연계)", badge: "정기교육", color: C.amber, when: "월 1회 또는 분기별", prompt: "월례 정기 안전교육자료를 위험성평가 결과와 연계해 작성. 포함: 핵심메시지, 평가결과 복습, 중점 위험요인 교육, 아차사고 분석, 안전수칙 5가지, TBM 질문 5개. 산안법 제29조 기준. 한국어로." },
            { icon: "👷", title: "신규 채용자 교육", badge: "신규자", color: C.purple, when: "채용 즉시", prompt: "신규 채용자 위험성평가 결과 교육자료 작성. 포함: 현장 소개/안전방침, 주요위험요인, 보호구 착용법, 절대금지 행위, 비상대응절차, 서약서 양식, 퀴즈 5문제. 아주 쉽게 한국어로." },
          ].map(edu => (
            <button key={edu.title} onClick={() => {
              setActiveStep(edu);
              setStepData({});
              setResult("");
              setScreen("edu-form");
            }} style={{
              width: "100%", background: "#fff", border: "2px solid #e2e8f0",
              borderRadius: 13, padding: "14px 15px", marginBottom: 8,
              display: "flex", alignItems: "flex-start", gap: 12,
              cursor: "pointer", textAlign: "left",
              boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: `${edu.color}12`, border: `2px solid ${edu.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{edu.icon}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: edu.color, padding: "2px 8px", borderRadius: 20 }}>{edu.badge}</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginTop: 4, marginBottom: 2 }}>{edu.title}</div>
                <div style={{ fontSize: 11, color: edu.color, fontWeight: 600 }}>📅 {edu.when}</div>
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 18 }}>›</div>
            </button>
          ))}
        </div>
      )}

      {/* 이력 탭 */}
      {tab === "history" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 14px 28px" }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📜</div>
              <div style={{ fontWeight: 700 }}>아직 작성된 문서가 없어요</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>최근 {history.length}건</div>
                <button onClick={async () => { setHistory([]); await saveStorage("eval-history", []); }} style={{ background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>전체삭제</button>
              </div>
              {history.map(h => (
                <div key={h.id} style={{ background: "#fff", borderRadius: 12, padding: "14px", marginBottom: 8, boxShadow: "0 1px 5px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{h.step}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{h.company} · {h.date}</div>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(h.full)} style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}30`, borderRadius: 7, padding: "4px 10px", color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>복사</button>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{h.preview}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 시나리오 모달 */}
      {showScenario && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={() => setShowScenario(false)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 36px", width: "100%", maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>🏭 업종별 시나리오</div>
            {Object.entries(INDUSTRY_SCENARIOS).map(([name, sc]) => (
              <button key={name} onClick={() => { applyScenario(name); setBaseInfo(p => ({ ...p, industry: p.industry || name })); }} style={{
                width: "100%", background: "#f8fafc", border: "2px solid #e2e8f0",
                borderRadius: 11, padding: "12px 14px", textAlign: "left", cursor: "pointer", marginBottom: 8,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{sc.hazards.slice(0, 4).join(" · ")}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 프로필 모달 */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={() => setShowProfileModal(false)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 36px", width: "100%", maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>🏢 회사 프로필 저장</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>저장하면 앱을 닫아도 자동 불러와요</div>
            {BASE_FIELDS.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                <input value={baseInfo[f.key] || ""} onChange={e => setBaseInfo(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={async () => {
              setBaseConfirmed(true);
              await saveStorage("company-profile", baseInfo);
              setShowProfileModal(false);
              alert("✅ 저장됐어요! 모든 단계에 자동 적용됩니다.");
            }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              💾 저장하기
            </button>
          </div>
        </div>
      )}
      <style>{`*{box-sizing:border-box;}`}</style>
    </div>
  );

  // ══════════════════════════════════════════════
  // 단계 폼 (고유 필드만 표시)
  // ══════════════════════════════════════════════
  if (screen === "step-form" && activeStep) {
    const isStep1 = activeStep.id === 1;
    const stepColor = activeStep.color;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Header title={`${activeStep.icon} STEP ${activeStep.id} · ${activeStep.title}`} onBack={() => setScreen("home")} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 32px" }}>

          {/* 2~6단계: 공통정보 배너 */}
          {!isStep1 && <BaseInfoBanner />}

          {/* 1단계: 공통정보 직접 입력 */}
          {isStep1 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                🏢 사업장 공통정보
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: `${C.accent}12`, padding: "2px 8px", borderRadius: 20 }}>2~6단계 자동적용</span>
              </div>
              {BASE_FIELDS.map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input value={baseInfo[f.key] || ""} onChange={e => setBaseInfo(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
          )}

          {/* 단계별 고유 필드 */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
              {activeStep.icon} 이 단계 전용 정보
            </div>

            {/* 시나리오 버튼 */}
            {activeStep.hasScenario && (
              <button onClick={() => setShowScenario(true)} style={{
                width: "100%", padding: "9px", marginBottom: 14,
                background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)",
                borderRadius: 9, color: C.amber, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>🏭 업종별 시나리오로 자동완성</button>
            )}

            {activeStep.uniqueFields.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>
                  {f.label}
                  {stepData[f.key] && <span style={{ color: C.green, fontSize: 11, marginLeft: 6 }}>● 자동완성</span>}
                </label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} style={{
                    width: "100%", padding: "10px 13px", borderRadius: 9,
                    border: `1.5px solid ${stepData[f.key] ? "rgba(34,197,94,0.4)" : "#e2e8f0"}`,
                    fontSize: 14, color: C.navy, outline: "none",
                    background: stepData[f.key] ? "rgba(34,197,94,0.04)" : "#f8fafc",
                    boxSizing: "border-box", transition: "all 0.2s",
                  }} />
              </div>
            ))}
          </div>

          <button onClick={async () => {
            if (isStep1) setBaseConfirmed(true);
            setScreen("step-result");
            await callAI(activeStep.prompt);
            setCompletedSteps(prev => prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]);
          }} style={{
            width: "100%", padding: "14px",
            background: `linear-gradient(135deg, ${stepColor}, ${stepColor}cc)`,
            border: "none", borderRadius: 13, color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 14px ${stepColor}44`,
          }}>
            🤖 AI 문서 자동 작성
          </button>
        </div>

        {/* 시나리오 모달 */}
        {showScenario && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={() => setShowScenario(false)}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 36px", width: "100%", maxWidth: 560 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>🏭 업종 선택</div>
              {Object.entries(INDUSTRY_SCENARIOS).map(([name, sc]) => (
                <button key={name} onClick={() => applyScenario(name)} style={{ width: "100%", background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 11, padding: "12px 14px", textAlign: "left", cursor: "pointer", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{sc.hazards.slice(0, 4).join(" · ")}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <style>{`*{box-sizing:border-box;}input:focus{border-color:${stepColor}!important;background:#fff!important;}`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // 교육 폼
  // ══════════════════════════════════════════════
  if (screen === "edu-form" && activeStep) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Header title={`${activeStep.icon} ${activeStep.title}`} onBack={() => setScreen("home")} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 32px" }}>
          <BaseInfoBanner />
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
            {[
              { key: "attendees", label: "교육 대상", placeholder: "예: 전 근로자 35명" },
              { key: "date", label: "교육 일자", placeholder: "예: 2026-05-06" },
              { key: "extra", label: "특이사항/중점내용", placeholder: "예: 최근 아차사고 발생, 여름철 온열질환 주의" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button onClick={async () => { setScreen("step-result"); await callAI(activeStep.prompt); }} style={{
            width: "100%", padding: "14px",
            background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
            border: "none", borderRadius: 13, color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
          }}>🤖 교육자료 AI 자동 생성</button>
        </div>
        <style>{`*{box-sizing:border-box;}input:focus{border-color:${C.purple}!important;background:#fff!important;}`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // 결과
  // ══════════════════════════════════════════════
  if (screen === "step-result" && activeStep) {
    const stepIdx = STEPS.findIndex(s => s.id === activeStep.id);
    const nextStep = STEPS[stepIdx + 1];
    const stepColor = activeStep.color || C.purple;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Header
          title={`${activeStep.icon || "🎓"} ${activeStep.title} 결과`}
          onBack={() => setScreen(activeStep.uniqueFields ? "step-form" : "edu-form")}
          right={!loading && result ? (
            <button onClick={() => navigator.clipboard.writeText(result)} style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>📋 복사</button>
          ) : null}
        />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 32px" }}>
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 10 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{activeStep.icon || "🎓"}</div>
                <div style={{ color: C.navy, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>AI가 문서를 작성하고 있어요</div>
                <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>고용노동부 기준으로 생성 중...</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: stepColor, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: "18px" }}>
                <div style={{ background: `${stepColor}10`, border: `1px solid ${stepColor}25`, borderRadius: 9, padding: "9px 13px", marginBottom: 14, fontSize: 12, color: stepColor, fontWeight: 600 }}>
                  ✅ 완료 — 검토 후 사용하세요
                </div>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13.5, lineHeight: 1.8, color: "#1e293b", margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>{result}</pre>
              </div>
            )}
          </div>

          {!loading && result && (
            <>
              {nextStep && (
                <button onClick={() => {
                  setActiveStep(nextStep);
                  setStepData({});
                  setResult("");
                  setScreen("step-form");
                }} style={{
                  width: "100%", padding: "13px", marginBottom: 8,
                  background: `linear-gradient(135deg, ${nextStep.color}, ${nextStep.color}cc)`,
                  border: "none", borderRadius: 13, color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 14px ${nextStep.color}44`,
                }}>
                  다음 → STEP {nextStep.id}: {nextStep.title}
                </button>
              )}
              <button onClick={() => setScreen("home")} style={{ width: "100%", padding: "12px", background: "#fff", border: "2px solid #e2e8f0", borderRadius: 13, color: C.navy, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                🏠 홈으로
              </button>
            </>
          )}

          <div style={{ marginTop: 10, padding: "11px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
            ⚠️ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.
          </div>
        </div>
        <style>{`@keyframes pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}*{box-sizing:border-box;}`}</style>
      </div>
    );
  }

  return null;
}

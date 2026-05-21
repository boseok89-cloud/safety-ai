import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

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

const BASE_FIELDS = [
  { key: "company", label: "사업장명", placeholder: "예: OO건설 3공구" },
  { key: "industry", label: "업종", placeholder: "예: 건설업 / 제조업 / 물류업" },
  { key: "workers", label: "근로자수", placeholder: "예: 35명" },
  { key: "manager", label: "안전관리자", placeholder: "예: 홍길동" },
];

const STEPS = [
  { id: 1, icon: "📁", title: "사전준비", subtitle: "평가기준 및 자료 수집", color: "#0ea5e9",
    uniqueFields: [
      { key: "evalType", label: "평가종류", placeholder: "예: 최초평가 / 정기평가 / 수시평가" },
      { key: "evalDate", label: "평가일자", placeholder: "예: 2026-05-06" },
      { key: "riskLevel", label: "허용위험성 기준", placeholder: "예: 상(즉시조치) / 중(단기) / 하(허용)" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 사전준비 단계 문서 작성. 포함: 사업장 기본정보, 법적근거(산업안전보건법 제36조), 평가팀 구성, 허용위험성 기준 매트릭스, 수집자료 목록, 평가일정. 전문적으로 한국어로.",
  },
  { id: 2, icon: "🔍", title: "유해·위험요인 파악", subtitle: "작업별 위험요인 도출", color: "#f59e0b",
    uniqueFields: [
      { key: "workArea", label: "작업장소/공정", placeholder: "예: 지하 2층 거푸집 설치 작업" },
      { key: "workType", label: "작업종류", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "equipment", label: "사용 기계·기구", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "materials", label: "취급 원자재/화학물질", placeholder: "업종 시나리오 선택 또는 직접 입력" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 유해·위험요인 파악 단계 문서 작성. 포함: 작업개요, 유해위험요인 목록표(8가지 이상/유형별), 재해유형, 파악방법. 전문적으로 한국어로.",
    hasScenario: true,
  },
  { id: 3, icon: "⚖️", title: "위험성 결정", subtitle: "가능성 × 중대성 = 위험성", color: "#ef4444",
    uniqueFields: [
      { key: "hazards", label: "주요 위험요인", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "method", label: "위험성 추정 방법", placeholder: "예: 빈도·강도법 / 핵심요인 기술법" },
      { key: "currentMeasures", label: "현재 안전조치 현황", placeholder: "예: 안전난간 설치, 안전대 지급" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성 결정 단계 문서 작성. 포함: 위험성 추정 매트릭스, 위험요인별 결정표, 허용불가 위험성 목록, 판단근거. 전문적으로 한국어로.",
    hasScenario: true,
  },
  { id: 4, icon: "🛡️", title: "감소대책 수립·실행", subtitle: "위험성 제거 및 저감 조치", color: "#22c55e",
    uniqueFields: [
      { key: "highRisks", label: "허용불가 위험요인", placeholder: "예: 추락(상), 협착(상), 감전(중)" },
      { key: "budget", label: "개선 가용예산", placeholder: "예: 약 500만원" },
      { key: "deadline", label: "조치 완료기한", placeholder: "예: 2026-06-30" },
      { key: "responsible", label: "조치 책임자", placeholder: "예: 현장소장 김○○" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성 감소대책 수립·실행 단계 문서 작성. 포함: 감소대책 우선순위원칙, 위험요인별 실행계획표, 단기/중장기 조치, 개선전후 위험성 비교, 잔류위험 관리. 실용적으로 한국어로.",
  },
  { id: 5, icon: "📢", title: "위험성평가 공유", subtitle: "근로자 주지 및 교육", color: "#8b5cf6",
    uniqueFields: [
      { key: "shareMethod", label: "공유 방법", placeholder: "예: 조회시간 교육, 게시판 부착" },
      { key: "shareDate", label: "공유 일자", placeholder: "예: 2026-05-10" },
      { key: "keyPoints", label: "강조할 핵심 위험요인", placeholder: "예: 추락, 협착, 화재" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 공유 단계 문서 작성. 포함: 공유목적/법적근거, 핵심위험요인 요약, 현장게시용 안전수칙 5가지, 근로자 의견수렴, 서명란. 한국어로.",
  },
  { id: 6, icon: "📂", title: "기록 및 보존", subtitle: "3년 보존 의무 문서 완성", color: "#64748b",
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
  const [baseInfo, setBaseInfo] = useState({ company: "", industry: "", workers: "", manager: "" });
  const [baseConfirmed, setBaseConfirmed] = useState(false);
  const [mode, setMode] = useState(null); // null=선택화면 | "moel"=노동부양식 | "company"=회사양식
  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("assessment");
  const [activeStep, setActiveStep] = useState(null);
  const [stepData, setStepData] = useState({});
  const [result, setResult] = useState("");
  const [results, setResults] = useState({}); // 단계별 결과 저장
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [history, setHistory] = useState([]);
  const [showScenario, setShowScenario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [companyTemplate, setCompanyTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const templateRef = useRef();

  useEffect(() => {
    (async () => {
      const p = await loadStorage("company-profile");
      if (p) { setBaseInfo(p); setBaseConfirmed(true); }
      const h = await loadStorage("eval-history");
      if (h) setHistory(h);
      const m = await loadStorage("eval-mode");
      if (m) setMode(m);
    })();
  }, []);

  const getAllData = () => ({ ...baseInfo, ...stepData });

  const callAI = async (prompt) => {
    setLoading(true);
    setResult("");
    const allData = getAllData();
    const info = Object.entries(allData).map(([k, v]) => `${k}: ${v || "미입력"}`).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: prompt,
          messages: [{ role: "user", content: `다음 정보로 문서를 작성해주세요:\n\n${info}` }],
        }),
      });
      const d = await res.json();
      const text = d.content?.map(b => b.text || "").join("") || "오류가 발생했습니다.";
      setResult(text);
      if (activeStep?.id) setResults(prev => ({ ...prev, [activeStep.id]: text }));
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
    } finally {
      setLoading(false);
    }
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

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        setCompanyTemplate(wb);
        setTemplateName(file.name);
        alert(`✅ "${file.name}" 양식이 등록됐어요!`);
      } catch { alert("❌ 엑셀 파일을 읽을 수 없어요."); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const fillTemplateWithAI = async () => {
    if (!companyTemplate) { alert("⚠️ 먼저 회사 양식을 업로드해주세요!"); return; }
    setTemplateLoading(true);
    try {
      const allData = getAllData();
      const info = Object.entries(allData).map(([k, v]) => `${k}: ${v || "미입력"}`).join("\n");
      const ws = companyTemplate.Sheets[companyTemplate.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const templateText = rows.map(r => r.join(" | ")).join("\n");
      const systemPrompt = `당신은 산업안전보건 전문가입니다. 아래 위험성평가 양식 구조를 분석하고, 주어진 사업장 정보를 바탕으로 빈칸을 채워주세요.\n\n양식 구조:\n${templateText.slice(0, 2000)}\n\n출력 형식: JSON 배열로만 응답하세요.\n[{"row": 행번호, "col": 열번호, "value": "채울내용"}, ...]\nJSON 외 다른 텍스트는 절대 포함하지 마세요.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: `사업장 정보:\n${info}\n\n위 양식의 빈칸을 채워주세요.` }],
        }),
      });
      const d = await res.json();
      const text = d.content?.map(b => b.text || "").join("") || "";
      let fills = [];
      try { fills = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { fills = []; }
      const newWb = XLSX.read(XLSX.write(companyTemplate, { type: "array", bookType: "xlsx" }), { type: "array" });
      const newWs = newWb.Sheets[newWb.SheetNames[0]];
      rows.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          const s = String(cell).trim();
          const nc = XLSX.utils.encode_cell({ r: ri, c: ci + 1 });
          if (!newWs[nc] || !newWs[nc].v) {
            if (s.includes("사업장") || s.includes("업체명")) newWs[nc] = { t: "s", v: baseInfo.company || "" };
            else if (s.includes("업종")) newWs[nc] = { t: "s", v: baseInfo.industry || "" };
            else if (s.includes("근로자수") || s.includes("근로자 수")) newWs[nc] = { t: "s", v: baseInfo.workers || "" };
            else if (s.includes("안전관리자") || s.includes("담당자")) newWs[nc] = { t: "s", v: baseInfo.manager || "" };
            else if (s.includes("작성일") || s.includes("평가일")) newWs[nc] = { t: "s", v: new Date().toLocaleDateString("ko-KR") };
          }
        });
      });
      fills.forEach(({ row, col, value }) => {
        if (typeof row === "number" && typeof col === "number" && value)
          newWs[XLSX.utils.encode_cell({ r: row, c: col })] = { t: "s", v: String(value) };
      });
      const fileName = `${templateName.replace(".xlsx", "")}_AI완성_${baseInfo.company || "사업장"}.xlsx`;
      XLSX.writeFile(newWb, fileName);
      alert(`✅ "${fileName}" 다운로드 완료!`);
    } catch { alert("❌ 오류가 발생했습니다."); }
    finally { setTemplateLoading(false); }
  };

  const downloadAllExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ["AI 위험성평가 자동작성 시스템", ""],
      ["고용노동부 고시 제2024-76호 기준", ""],
      ["", ""],
      ["사업장명", baseInfo.company || ""],
      ["업종", baseInfo.industry || ""],
      ["근로자수", baseInfo.workers || ""],
      ["안전관리자", baseInfo.manager || ""],
      ["작성일", new Date().toLocaleDateString("ko-KR")],
      ["완完了단계", completedSteps.length + "단계 / 6단계"],
      ["", ""],
      ["⚠️ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.", ""],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs["!cols"] = [{ wch: 50 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "요약");
    STEPS.forEach(step => {
      const text = results[step.id];
      if (!text) return;
      const lines = text.split("\n").filter(Boolean);
      const ws = XLSX.utils.aoa_to_sheet([
        [step.icon + " " + step.title, ""],
        ["고용노동부 고시 제2024-76호 기준", ""],
        ["", ""],
        ...lines.map(l => [l, ""]),
      ]);
      ws["!cols"] = [{ wch: 80 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, ("STEP" + step.id + "_" + step.title).slice(0, 31));
    });
    XLSX.writeFile(wb, `위험성평가_전체_${baseInfo.company || "사업장"}_${new Date().toLocaleDateString("ko-KR").replace(/\./g,"").replace(/ /g,"")}.xlsx`);
  };

  const Header = ({ title, onBack }) => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 13, cursor: "pointer" }}>← 뒤로</button>}
        <div style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // 상단 사업장 기본정보 배너 컴포넌트
  // -------------------------------------------------------------------------
  const BaseInfoBanner = () => {
    if (baseConfirmed && baseInfo.company) {
      return (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 11, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button 
            onClick={() => setShowProfileModal(true)} 
            style={{ background: "none", border: "1px solid rgba(34,197,94,0.3)", padding: "12px", borderRadius: "8px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <div style={{ color: C.navy, fontSize: 13, fontWeight: 700 }}>
              🏢 {baseInfo.company} ({baseInfo.industry || "업종 미지정"})
            </div>
            <span style={{ color: C.green, fontSize: 12 }}>수정 ›</span>
          </button>
        </div>
      );
    }
    return null;
  };
    return (
      <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        
        {/* 상단 그라데이션 타이틀 섹션 */}
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "36px 16px 28px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              위험성평가 전문 시스템
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              고용노동부 고시 제2024-76호 기준
            </div>
          </div>
        </div>

        {/* 하단 메인 컨텐츠 및 버튼 섹션 */}
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, textAlign: "center", marginBottom: 6 }}>
            평가 방식을 선택하세요.
          </div>
          <div style={{ fontSize: 13, color: C.slate, textAlign: "center", marginBottom: 24 }}>
            작성 목적에 맞는 방식을 선택하시면 법정 6단계 절차에 따라 AI가 문서를 자동 작성해드려요.
          </div>

          {/* 고용노동부 고시 양식 버튼 */}
          <button 
            onClick={async () => { setMode("moel"); await saveStorage("eval-mode", "moel"); }} 
            style={{ width: "100%", background: "#fff", border: `2px solid ${C.accent}`, borderRadius: 16, padding: "20px 18px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", textAlign: "left", boxShadow: `0 4px 20px ${C.accent}15` }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${C.accent}15`, border: `2px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>
                고용노동부 고시 양식
              </div>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6 }}>
                법정 6단계 절차에 따라 AI가 문서를 자동 작성해드려요.
              </div>
            </div>
          </button>

          {/* 우리 회사 양식 사용 버튼 */}
          <button 
            onClick={async () => { setMode("company"); await saveStorage("eval-mode", "company"); }} 
            style={{ width: "100%", background: "#fff", border: `2px solid ${C.purple}`, borderRadius: 16, padding: "20px 18px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", textAlign: "left", boxShadow: `0 4px 20px ${C.purple}20` }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${C.purple}15`, border: `2px solid ${C.purple}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>우리 회사 양식 사용</div>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6 }}>기존에 사용하던 엑셀 양식을 업로드하면 AI가 내용을 자동으로 채워드려요. 회사 고유 양식을 유지하고 싶은 분께 적합해요.</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["기존 양식 유지", "AI 자동입력", "엑셀 업로드"].map(t => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: `${C.purple}12`, padding: "3px 9px", borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            </div>
          </button>

          <div style={{ padding: "12px 14px", background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)", borderRadius: 10, fontSize: 12, color: "#0369a1", lineHeight: 1.7 }}>
            📌 산업안전보건법 제36조 — 상시근로자 1인 이상 전 사업장 의무 실시 · 결과 <strong>3년 보존</strong>
          </div>
        </div>
      </div>
    );
  }
  // ══════════════════════════════════════════════
  // 회사 양식 모드
  // ══════════════════════════════════════════════
  if (screen === "home" && mode === "company") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "20px 16px 16px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🏢</span>
              <div>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>회사 양식 자동채우기</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>AI가 우리 회사 양식을 자동으로 작성</div>
              </div>
            </div>
            <button onClick={async () => { setMode(null); await saveStorage("eval-mode", null); }} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 12, cursor: "pointer" }}>모드변경</button>
          </div>
        </div>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px 32px" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>🏢 사업장 기본정보</div>
            {BASE_FIELDS.map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={baseInfo[f.key] || ""} onChange={e => setBaseInfo(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>📂 회사 양식 업로드</div>
            {companyTemplate ? (
              <div>
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 9, padding: "10px 13px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>✅ 양식 등록됨</div>
                    <div style={{ fontSize: 11, color: "#4b7c5e", marginTop: 2 }}>{templateName}</div>
                  </div>
                  <button onClick={() => { setCompanyTemplate(null); setTemplateName(""); }} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 18, cursor: "pointer" }}>×</button>
                </div>
                <button onClick={fillTemplateWithAI} disabled={templateLoading} style={{ width: "100%", padding: "14px", background: templateLoading ? "rgba(139,92,246,0.3)" : `linear-gradient(135deg, #7c3aed, ${C.purple})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: templateLoading ? "not-allowed" : "pointer", boxShadow: `0 4px 14px ${C.purple}44` }}>
                  {templateLoading ? "⏳ AI가 양식을 채우는 중..." : "🤖 AI로 양식 자동채우기 + 다운로드"}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>회사에서 사용하는 위험성평가 엑셀 양식을 업로드하면 AI가 자동으로 내용을 채워드려요.</div>
                <button onClick={() => templateRef.current?.click()} style={{ width: "100%", padding: "14px", background: "rgba(139,92,246,0.08)", border: "2px dashed rgba(139,92,246,0.4)", borderRadius: 12, color: C.purple, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📂 회사 양식 업로드 (.xlsx)</button>
              </div>
            )}
          </div>
          <button onClick={async () => { setMode(null); await saveStorage("eval-mode", null); }} style={{ width: "100%", padding: "12px", background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, color: C.slate, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>← 다른 방식으로 변경</button>
        </div>
        <input ref={templateRef} type="file" accept=".xlsx,.xls" onChange={handleTemplateUpload} style={{ display: "none" }} />
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // 노동부 고시 양식 모드 홈
  // ══════════════════════════════════════════════
  if (screen === "home" && mode === "moel") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "20px 16px 16px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>위험성평가 전문 시스템</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>고용노동부 고시 제2024-76호 기준</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setShowProfileModal(true)} style={{ background: baseConfirmed ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)", border: `1px solid ${baseConfirmed ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.2)"}`, borderRadius: 8, padding: "6px 9px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {baseConfirmed ? "✅ 프로필" : "🏢 프로필"}
                </button>
                <button onClick={async () => { setMode(null); await saveStorage("eval-mode", null); }} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 9px", color: "#fff", fontSize: 11, cursor: "pointer" }}>모드변경</button>
              </div>
            </div>
            {baseConfirmed && (
              <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "9px 13px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏢</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{baseInfo.company}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}</div>
                </div>
                <div style={{ color: "#4ade80", fontSize: 10, fontWeight: 700 }}>전 단계 자동적용</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 4 }}>
              {STEPS.map((s, i) => (
                <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 3, background: completedSteps.includes(i + 1) ? C.green : "rgba(255,255,255,0.18)", transition: "all 0.4s" }} />
              ))}
            </div>
            {completedSteps.length > 0 && (
              <div style={{ textAlign: "right", marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{completedSteps.length}/6 완료</div>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 14px 0" }}>
          <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 11, padding: 3, gap: 3 }}>
            {[{ k: "assessment", l: "📋 위험성평가" }, { k: "education", l: "🎓 교육자료" }, { k: "history", l: "📜 이력" }].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: tab === t.k ? "#fff" : "transparent", color: tab === t.k ? C.navy : C.slate, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: tab === t.k ? "0 2px 6px rgba(0,0,0,0.08)" : "none" }}>{t.l}</button>
            ))}
          </div>
        </div>

        {tab === "assessment" && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "10px 14px 28px" }}>
            {completedSteps.length > 0 && (
              <button onClick={downloadAllExcel} style={{ width: "100%", padding: "13px", marginBottom: 12, background: "linear-gradient(135deg, #16a34a, #22c55e)", border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📥</span> 전체 문서 다운로드 ({completedSteps.length}/6 완료)
              </button>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STEPS.map((s, i) => {
                const done = completedSteps.includes(i + 1);
                return (
                  <button key={s.id} onClick={() => { setActiveStep(s); setStepData({}); setResult(results[s.id] || ""); setScreen("step-form"); }} style={{ background: "#fff", border: `2px solid ${done ? C.green : "#e2e8f0"}`, borderRadius: 13, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", boxShadow: "0 1px 5px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: done ? `${C.green}18` : `${s.color}12`, border: `2px solid ${done ? C.green : s.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{done ? "✅" : s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: "1px 7px", borderRadius: 20 }}>STEP {s.id}</span>
                        {done && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>완료</span>}
                        {s.id === 1 && !baseConfirmed && <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>← 여기서 시작!</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{s.id === 1 ? "사업장 공통정보 입력 → 전 단계 자동적용" : s.subtitle}</div>
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: 18 }}>›</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: "11px 14px", background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)", borderRadius: 10, fontSize: 12, color: "#0369a1", lineHeight: 1.7 }}>
              📌 산업안전보건법 제36조 — 상시근로자 1인 이상 전 사업장 의무 실시 · 결과 <strong>3년 보존</strong>
            </div>
          </div>
        )}

        {tab === "education" && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "10px 14px 28px" }}>
            {[
              { icon: "🎓", title: "위험성평가 실시 전 교육", badge: "사전교육", color: C.accent, when: "평가 시작 전", prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 실시 전 교육자료 작성. 포함: 정의/목적, 법적의무, 역할분담, 6단계 절차, 판단기준 매트릭스, 사례비교, O/X 퀴즈 5문제. 쉽게 한국어로." },
              { icon: "📝", title: "개선대책 이행 후 교육", badge: "완료 후", color: C.green, when: "감소대책 완료 후", prompt: "위험성평가 감소대책 이행 후 교육자료 작성. 포함: 평가결과 요약, 개선조치 상세, 변경된 작업방법, 잔류위험 주의, 금지행위, 보고절차, O/X 퀴즈 5문제. 쉽게 한국어로." },
              { icon: "🔄", title: "정기 안전교육 (위험성평가 연계)", badge: "정기교육", color: C.amber, when: "월 1회 또는 분기별", prompt: "월례 정기 안전교육자료를 위험성평가 결과와 연계해 작성. 포함: 핵심메시지, 평가결과 복습, 중점 위험요인 교육, 아차사고 분석, 안전수칙 5가지, TBM 질문 5개. 산안법 제29조 기준. 한국어로." },
              { icon: "👷", title: "신규 채용자 교육", badge: "신규자", color: C.purple, when: "채용 즉시", prompt: "신규 채용자 위험성평가 결과 교육자료 작성. 포함: 현장 소개/안전방침, 주요위험요인, 보호구 착용법, 절대금지 행위, 비상대응절차, 서약서 양식, 퀴즈 5문제. 아주 쉽게 한국어로." },
            ].map(edu => (
              <button key={edu.title} onClick={() => { setActiveStep(edu); setStepData({}); setResult(""); setScreen("edu-form"); }} style={{ width: "100%", background: "#fff", border: "2px solid #e2e8f0", borderRadius: 13, padding: "14px 15px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", textAlign: "left", boxShadow: "0 1px 5px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: `${edu.color}12`, border: `2px solid ${edu.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{edu.icon}</div>
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

        {tab === "history" && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "10px 14px 28px" }}>
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

        {showProfileModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }} onClick={() => setShowProfileModal(false)}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 36px", width: "100%", maxWidth: 560 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>🏢 회사 프로필 저장</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>저장하면 앱을 닫아도 자동 불러와요</div>
              {BASE_FIELDS.map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input value={baseInfo[f.key] || ""} onChange={e => setBaseInfo(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={async () => { setBaseConfirmed(true); await saveStorage("company-profile", baseInfo); setShowProfileModal(false); alert("✅ 저장됐어요!"); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                💾 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  // ══════════════════════════════════════════════
  // 단계 폼
  // ══════════════════════════════════════════════
  if (screen === "step-form" && activeStep) {
    const isStep1 = activeStep.id === 1;
    const stepColor = activeStep.color;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <style>{`*{box-sizing:border-box;}input:focus{border-color:${stepColor}!important;background:#fff!important;}`}</style>
        <Header title={`${activeStep.icon} STEP ${activeStep.id} · ${activeStep.title}`} onBack={() => setScreen("home")} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 32px" }}>
          {!isStep1 && <BaseInfoBanner />}
          {isStep1 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                🏢 사업장 공통정보
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: `${C.accent}12`, padding: "2px 8px", borderRadius: 20 }}>2~6단계 자동적용</span>
              </div>
              {BASE_FIELDS.map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input value={baseInfo[f.key] || ""} onChange={e => setBaseInfo(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{activeStep.icon} 이 단계 전용 정보</div>
            {activeStep.hasScenario && (
              <button onClick={() => setShowScenario(true)} style={{ width: "100%", padding: "9px", marginBottom: 12, background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 9, color: C.amber, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🏭 업종별 시나리오로 자동완성</button>
            )}
            {activeStep.uniqueFields.map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>
                  {f.label} {stepData[f.key] && <span style={{ color: C.green, fontSize: 11, marginLeft: 6 }}>● 자동완성</span>}
                </label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${stepData[f.key] ? "rgba(34,197,94,0.4)" : "#e2e8f0"}`, fontSize: 13, color: C.navy, outline: "none", background: stepData[f.key] ? "rgba(34,197,94,0.04)" : "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button onClick={async () => { if (isStep1) { setBaseConfirmed(true); await saveStorage("company-profile", baseInfo); } setScreen("step-result"); await callAI(activeStep.prompt); setCompletedSteps(prev => prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${stepColor}, ${stepColor}cc)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${stepColor}44` }}>
            🤖 AI 문서 자동 작성
          </button>
        </div>
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
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button onClick={async () => { setScreen("step-result"); await callAI(activeStep.prompt); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.4)" }}>🤖 교육자료 AI 자동 생성</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // 결과 화면
  // ══════════════════════════════════════════════
  if (screen === "step-result" && activeStep) {
    const stepIdx = STEPS.findIndex(s => s.id === activeStep.id);
    const nextStep = STEPS[stepIdx + 1];
    const stepColor = activeStep.color || C.purple;
    const allDone = completedSteps.length === STEPS.length;
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4f8 0%, #e8eef5 100%)", fontFamily: "'Noto Sans KR', sans-serif" }}>
        <style>{`*{box-sizing:border-box;}@keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.2);opacity:0.5;}}`}</style>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setScreen(activeStep.uniqueFields ? "step-form" : "edu-form")} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 13, cursor: "pointer" }}>← 뒤로</button>
            <div style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 700 }}>{activeStep.icon || "🎓"} {activeStep.title} 결과</div>
            {!loading && result && (
              <button onClick={() => navigator.clipboard.writeText(result)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📋 복사</button>
            )}
          </div>
        </div>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px 32px" }}>
          {loading ? (
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", padding: "50px 20px", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px", background: `linear-gradient(135deg, ${stepColor}22, ${stepColor}11)`, border: `3px solid ${stepColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{activeStep.icon || "🎓"}</div>
              <div style={{ color: C.navy, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>AI가 문서를 작성하고 있어요</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>고용노동부 기준으로 생성 중...</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: stepColor, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: `linear-gradient(135deg, ${stepColor}, ${stepColor}cc)`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 20px ${stepColor}44` }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✅</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{activeStep.title} 문서 생성 완료!</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>{baseInfo.company || "사업장"} · {new Date().toLocaleDateString("ko-KR")}</div>
                </div>
              </div>
              {allDone && (
                <button onClick={downloadAllExcel} style={{ width: "100%", padding: "14px", marginBottom: 12, background: "linear-gradient(135deg, #16a34a, #22c55e)", border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📥</span> 전체 6단계 문서 한번에 다운로드
                </button>
              )}
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 12 }}>
                <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{activeStep.icon || "📄"}</span>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{activeStep.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>고용노동부 고시 제2024-76호 기준</div>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(result)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "5px 10px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📋 복사</button>
                </div>
                <div style={{ padding: "18px" }}>
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13, lineHeight: 1.8, color: "#1e293b", margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>{result}</pre>
                </div>
              </div>
              {nextStep && (
                <button onClick={() => { setActiveStep(nextStep); setStepData({}); setResult(results[nextStep.id] || ""); setScreen("step-form"); }} style={{ width: "100%", padding: "14px", marginBottom: 8, background: `linear-gradient(135deg, ${nextStep.color}, ${nextStep.color}cc)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${nextStep.color}44` }}>
                  다음 → STEP {nextStep.id}: {nextStep.title} {nextStep.icon}
                </button>
              )}
              <button onClick={() => setScreen("home")} style={{ width: "100%", padding: "12px", background: "#fff", border: "2px solid #e2e8f0", borderRadius: 13, color: C.navy, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🏠 홈으로</button>
              <div style={{ marginTop: 10, padding: "11px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                ⚠️ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

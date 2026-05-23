import React, { useState, useEffect } from "react";

const INDUSTRY_SCENARIOS = {
  "건설업": {
    workTypes: ["고소작업(비계/거푸집)", "굴착/토공작업", "철근/콘크리트 타설", "중량물 양중작업", "해체작업"],
    equipments: ["타워크레인", "이동식크레인", "지게차", "고소작업대", "굴착기", "항타기"],
    materials: ["시멘트", "철근", "LPG/산소(용접)", "유기용제", "방수재"],
    hazards: ["추락(고소작업)", "협착(중장비)", "낙하·비래", "붕괴·도괴", "감전", "화재·폭발"],
    envFactors: ["협소한 작업공간", "고온·다습 환경", "소음·진동", "야간작업", "바닥 불균형"],
    accidentCases: [
      { title: "비계 발판 탈락 추락 사망", date: "2024-03", industry: "건설업", severity: "사망", situation: "지상 8m 높이 비계에서 거푸집 해체 작업 중 발판이 탈락하여 근로자 추락", cause: "비계 발판 결속 불량 / 안전대 미착용 / 작업 전 점검 미실시", prevention: "작업 전 비계 점검 의무화 / 안전대 부착설비 설치 / 관리감독자 상주", keyword: "추락·비계" },
      { title: "이동식크레인 전도 협착 사망", date: "2024-06", industry: "건설업", severity: "사망", situation: "연약지반에서 이동식크레인으로 철골 양중 중 크레인 전도, 운전원 협착", cause: "아웃트리거 미설치 / 지반 지내력 미확인 / 작업반경 내 근로자 출입", prevention: "지반 조사 후 아웃트리거 완전 전개 / 작업반경 통제구역 설정 / 신호수 배치", keyword: "협착·크레인" },
      { title: "굴착면 붕괴 매몰 사망", date: "2024-09", industry: "건설업", severity: "사망", situation: "토사 굴착 작업 중 굴착면 붕괴로 근로자 2명 매몰", cause: "흙막이 미설치 / 굴착면 기울기 기준 미준수 / 강우 후 지반 약화 미확인", prevention: "굴착 깊이 2m 초과 시 흙막이 의무 설치 / 강우 후 지반 상태 점검 절차 수립", keyword: "붕괴·굴착" },
    ],
  },
  "제조업": {
    workTypes: ["프레스/절단 작업", "용접·용단 작업", "도장·도금 작업", "컨베이어 작업", "화학물질 취급"],
    equipments: ["프레스", "선반/밀링", "지게차", "컨베이어", "산업용 로봇", "호이스트"],
    materials: ["유기용제(신너/아세톤)", "도료", "산·알칼리", "윤활유", "압축가스"],
    hazards: ["협착·끼임(프레스)", "절단·베임", "화재·폭발(도장)", "화학물질 노출", "근골격계 질환", "소음"],
    envFactors: ["고온 작업환경", "소음 85dB 초과", "분진 발생", "환기 불량", "조명 부족"],
    accidentCases: [
      { title: "프레스 금형 교체 중 협착 사망", date: "2024-04", industry: "제조업", severity: "사망", situation: "프레스 금형 교체 작업 중 슬라이드가 하강하여 작업자 손 협착", cause: "안전블록 미삽입 / 양수조작식 방호장치 임의 해제 / 작업절차서 미준수", prevention: "금형 교체 시 안전블록 의무 삽입 / 방호장치 해제 잠금장치 설치 / 위험성평가 실시", keyword: "협착·프레스" },
      { title: "도장부스 유기용제 폭발 화재", date: "2024-07", industry: "제조업", severity: "중상", situation: "도장부스 내 유기용제 스프레이 도장 중 정전기 점화로 폭발 발생", cause: "방폭 조명 미설치 / 국소배기장치 미작동 / 정전기 방지 미접지", prevention: "방폭형 전기설비 설치 / 국소배기장치 가동 확인 후 작업 / 정전기 접지 의무화", keyword: "화재·폭발" },
      { title: "컨베이어 청소 중 끼임 사망", date: "2024-11", industry: "제조업", severity: "사망", situation: "컨베이어 벨트 청소 중 가동 상태에서 벨트와 롤러 사이 끼임", cause: "잠금·표지 절차(LOTO) 미이행 / 청소 중 기계 정지 규정 없음", prevention: "청소·정비 전 LOTO(잠금·표지) 의무화 / 청소 전용 정지 절차 수립 및 교육", keyword: "끼임·컨베이어" },
    ],
  },
  "물류·유통업": {
    workTypes: ["지게차 운전", "수작업 하역", "랙 입출고", "상하차 작업", "저온창고 작업"],
    equipments: ["지게차", "전동 파렛트 트럭", "컨베이어 벨트", "랙 시스템", "적재함"],
    materials: ["위험물(배터리·화학품)", "중량 화물", "냉매"],
    hazards: ["지게차 충돌·전도", "낙하(적재물)", "요통(중량물)", "저온 노출", "미끄러짐·넘어짐"],
    envFactors: ["좁은 통로", "저온·냉동 환경", "소음", "야간 작업", "바닥 오염(물·기름)"],
    accidentCases: [
      { title: "지게차 후진 중 보행자 충돌 사망", date: "2024-05", industry: "물류·유통업", severity: "사망", situation: "창고 내 지게차 후진 중 보행 근로자를 미발견하고 충돌", cause: "보행자·차량 통로 미분리 / 후방카메라 미설치 / 신호수 미배치", prevention: "차량·보행자 통로 완전 분리 / 후방감지센서 설치 / 교차로 안전거울 설치", keyword: "충돌·지게차" },
      { title: "고층 랙 적재물 낙하 골절", date: "2024-08", industry: "물류·유통업", severity: "중상", situation: "5단 랙 최상단 작업 중 불안정 적재물이 낙하하여 하부 작업자 충격", cause: "적재 중량 초과 / 랙 안전핀 미설치 / 작업구역 출입통제 없음", prevention: "랙 최대 적재하중 표시 및 준수 / 랙 안전핀 설치 의무화 / 작업 중 하부 출입금지", keyword: "낙하·랙" },
    ],
  },
  "서비스업": {
    workTypes: ["전기 설비 점검", "시설 유지보수", "청소·위생관리", "엘리베이터 작업"],
    equipments: ["사다리", "전동공구", "청소 장비", "승강기"],
    materials: ["세정제·소독제", "윤활제"],
    hazards: ["추락(사다리)", "감전(전기작업)", "미끄러짐", "화학물질 노출", "근골격계 질환"],
    envFactors: ["습기 많은 환경", "좁은 공간", "조명 불량", "고온 환경"],
    accidentCases: [
      { title: "이동식 사다리 전도 추락 사망", date: "2024-06", industry: "서비스업", severity: "사망", situation: "건물 내부 천장 점검 중 이동식 사다리 전도로 추락", cause: "사다리 고정 미실시 / 안전모 미착용 / 1인 단독 작업", prevention: "사다리 전도방지 고정 의무 / 2인 1조 작업 / 안전모·안전대 착용 의무화", keyword: "추락·사다리" },
    ],
  },
  "화학·석유업": {
    workTypes: ["화학물질 이송·충전", "반응기 운전", "밀폐공간 작업", "배관 정비", "폐수 처리"],
    equipments: ["반응기", "탱크로리", "컴프레셔", "펌프·밸브", "배관설비"],
    materials: ["인화성 액체", "독성 가스", "산·알칼리", "고압 증기", "폭발성 물질"],
    hazards: ["화재·폭발", "독성 물질 누출", "밀폐공간 질식", "고압 분출", "화상(고온·고압)"],
    envFactors: ["고온·고압 환경", "밀폐 공간", "독성가스 잠재", "환기 불량", "야간 단독 작업"],
    accidentCases: [
      { title: "밀폐공간 질소 치환 중 질식 사망", date: "2024-03", industry: "화학·석유업", severity: "사망", situation: "탱크 내부 정비를 위해 질소 치환 후 산소 농도 미확인 상태로 입장하여 질식", cause: "산소 농도 측정 미실시 / 감시인 미배치 / 공기호흡기 미착용", prevention: "밀폐공간 진입 전 산소농도(18% 이상) 측정 의무 / 감시인 배치 / 공기호흡기 착용", keyword: "질식·밀폐공간" },
      { title: "배관 수리 중 고압 화학물질 누출 화상", date: "2024-10", industry: "화학·석유업", severity: "중상", situation: "운전 중 배관 플랜지 볼트 조임 작업 중 고압 화학물질 분출", cause: "운전 중 정비 실시 / 잠금·표지 절차 미이행 / 보호복 미착용", prevention: "배관 정비 전 완전 차단 및 LOTO 절차 이행 / 내화학성 보호복·보안면 착용 의무화", keyword: "누출·화상" },
    ],
  },
};

const DOCUMENT_TEMPLATES = [
  { id: "standard", icon: "📋", name: "고용노동부 표준 양식", desc: "고시 제2024-76호 기준 6단계 표준 양식", color: "#0ea5e9", tags: ["법정 기준", "전 업종"] },
  { id: "construction", icon: "🏗️", name: "건설업 전용 양식", desc: "고소작업·중장비·굴착 등 건설 현장 특화", color: "#f59e0b", tags: ["건설업", "고소작업", "중장비"] },
  { id: "manufacturing", icon: "🏭", name: "제조업 전용 양식", desc: "프레스·화학물질·컨베이어 등 제조 현장 특화", color: "#ef4444", tags: ["제조업", "기계작업", "화학물질"] },
  { id: "small", icon: "🏪", name: "소규모 사업장 간이 양식", desc: "50인 미만 소규모 사업장용 간소화 양식", color: "#22c55e", tags: ["소규모", "간이", "50인 미만"] },
  { id: "logistics", icon: "🚛", name: "물류·유통업 전용 양식", desc: "지게차·하역·보관 등 물류 현장 특화", color: "#8b5cf6", tags: ["물류", "지게차", "하역"] },
];

const BASE_FIELDS = [
  { key: "company", label: "사업장명", placeholder: "예: OO건설 3공구" },
  { key: "industry", label: "업종", placeholder: "예: 건설업 / 제조업 / 물류업" },
  { key: "workers", label: "근로자수", placeholder: "예: 35명" },
  { key: "manager", label: "안전관리자", placeholder: "예: 홍길동" },
];

const STEPS = [
  { id: 1, icon: "📁", title: "사전준비", subtitle: "평가팀 구성 및 기준 설정", color: "#0ea5e9", uniqueFields: [ { key: "evalType", label: "평가종류", placeholder: "예: 최초평가 / 정기평가 / 수시평가" }, { key: "evalDate", label: "평가일자", placeholder: "예: 2026-05-06" }, { key: "evalTeam", label: "평가팀 구성", placeholder: "예: 안전관리자, 관리감독자, 근로자 대표" }, { key: "riskMatrix", label: "위험성 판단 기준", placeholder: "예: 가능성(상/중/하) × 중대성(상/중/하) 9칸 매트릭스" } ], prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 사전준비 단계 문서 작성. 포함: 사업장 기본정보, 법적근거(산업안전보건법 제36조), 평가팀 구성 및 역할, 가능성×중대성 위험성 판단 기준 매트릭스(3×3), 수집자료 목록(재해사례/아차사고/공정정보), 평가일정. 전문적으로 한국어로." },
  { id: 2, icon: "🔍", title: "유해·위험요인 파악", subtitle: "공정별 위험 시나리오 도출", color: "#f59e0b", uniqueFields: [], multiSheet: true, prompt: "고용노동부 고시 제2024-76호 기준 유해·위험요인 파악 단계 문서 작성. 포함: 공정/작업 개요, 기인물별 위험 시나리오 목록표(6개 이상) - 각 시나리오는 [작업상황 → 기인물 → 위험요인 → 예상 재해유형] 형식, 유형별 분류(기계적/화학적/물리적/인간공학적/작업환경적), 작업장 환경요인(온도·소음·조명·환기·공간 등) 별도 분석표, 현재 안전조치 현황. 전문적으로 한국어로.", hasScenario: true },
  { id: 3, icon: "⚖️", title: "위험성 결정", subtitle: "시나리오별 가능성 × 중대성 평가", color: "#ef4444", uniqueFields: [ { key: "hazards", label: "STEP2에서 도출된 주요 위험 시나리오", placeholder: "업종 시나리오 선택 또는 STEP2 결과 입력" }, { key: "method", label: "위험성 추정 방법", placeholder: "예: 빈도·강도법(가능성×중대성)" }, { key: "acceptableCriteria", label: "허용 가능 위험성 기준", placeholder: "예: 위험성 합계 4이상=허용불가, 3=조건부, 2이하=허용" } ], prompt: "고용노동부 고시 제2024-76호 기준 위험성 결정 단계 문서 작성. 핵심: 각 위험 시나리오별로 (1)가능성(상3/중2/하1) (2)중대성(상3/중2/하1) (3)위험성=가능성×중대성 (4)허용여부를 결정하는 표 작성. 포함: 위험성 결정 매트릭스표, 시나리오별 상세 결정 근거, 허용불가 위험성 목록, 중대성 판단기준(사망/중상/경상). 전문적으로 한국어로.", hasScenario: true },
  { id: 4, icon: "🛡️", title: "감소대책 수립·실행", subtitle: "위험성 제거 및 저감 조치", color: "#22c55e", uniqueFields: [ { key: "highRisks", label: "허용불가 위험요인", placeholder: "예: 추락(상), 협착(상), 감전(중)" }, { key: "budget", label: "개선 가용예산", placeholder: "예: 약 500만원" }, { key: "deadline", label: "조치 완료기한", placeholder: "예: 2026-06-30" }, { key: "responsible", label: "조치 책임자", placeholder: "예: 현장소장 김○○" } ], prompt: "고용노동부 고시 제2024-76호 기준 위험성 감소대책 수립·실행 단계 문서 작성. 포함: 감소대책 우선순위원칙, 위험요인별 실행계획표, 단기/중장기 조치, 개선전후 위험성 비교, 잔류위험 관리. 실용적으로 한국어로." },
  { id: 5, icon: "📢", title: "위험성평가 공유", subtitle: "근로자 주지 및 교육", color: "#8b5cf6", uniqueFields: [ { key: "shareMethod", label: "공유 방법", placeholder: "예: 조회시간 교육, 게시판 부착" }, { key: "shareDate", label: "공유 일자", placeholder: "예: 2026-05-10" }, { key: "keyPoints", label: "강조할 핵심 위험요인", placeholder: "예: 추락, 협착, 화재" } ], prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 공유 단계 문서 작성. 포함: 공유목적/법적근거, 핵심위험요인 요약, 현장게시용 안전수칙 5가지, 근로자 의견수렴, 서명란. 한국어로." },
  { id: 6, icon: "📂", title: "기록 및 보존", subtitle: "3년 보존 의무 문서 완성", color: "#64748b", uniqueFields: [ { key: "evalPeriod", label: "평가 기간", placeholder: "예: 2026-05-01 ~ 2026-05-10" }, { key: "totalHazards", label: "총 위험요인 수", placeholder: "예: 15개" }, { key: "highCount", label: "고위험(상) 건수", placeholder: "예: 3건" }, { key: "midCount", label: "중위험(중) 건수", placeholder: "예: 7건" }, { key: "lowCount", label: "저위험(하) 건수", placeholder: "예: 5건" }, { key: "nextEval", label: "다음 평가 예정일", placeholder: "예: 2027-05-01" } ], prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 기록 및 보존 단계 문서 작성. 포함: 최종결과 요약(통계), 법정보존서류 목록(시행규칙 제37조), 보존방법/기간(3년), 총평, 수시평가 기준, 다음 정기평가 계획, 서명란. 한국어로." },
];

const C = { navy: "#0f2640", blue: "#1a3a5c", accent: "#0ea5e9", green: "#22c55e", amber: "#f59e0b", red: "#ef4444", purple: "#8b5cf6", slate: "#64748b", bg: "#f0f4f8", siren: "#dc2626" };

async function saveStorage(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }
async function loadStorage(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }

function copyText(text, setCopied, key) {
  navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 1800); });
}

function ResultViewer({ text, color }) {
  const [copied, setCopied] = useState(null);
  const lines = text.split("\n");
  const sections = [];
  let current = null;
  
  lines.forEach(line => {
    const isHeader = line.startsWith("#") || (line.match(/^[■□▶◆●\d]+[\.\s]/) && line.length < 60 && line.trim().length > 2);
    if (isHeader) {
      if (current) sections.push(current);
      current = { title: line.replace(/^#+\s*/, "").replace(/\*\*/g,"").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      if (!sections.length) sections.push({ title: null, lines: [] });
      sections[0].lines.push(line);
    }
  });
  if (current) sections.push(current);
  if (!sections.length) return <pre style={{ whiteSpace:"pre-wrap", wordBreak:"break-word", fontSize:13, lineHeight:1.8, color:"#1e293b", margin:0, fontFamily:"'Noto Sans KR',sans-serif" }}>{text}</pre>;

  return (
    <div>
      {sections.map((sec, i) => {
        const secText = (sec.title ? sec.title + "\n" : "") + sec.lines.join("\n");
        const isCopied = copied === i;
        return (
          <div key={i} style={{ marginBottom: 12, borderRadius: 10, border: `1px solid ${color}20`, overflow: "hidden" }}>
            {sec.title && (
              <div style={{ background: `${color}12`, borderBottom: `1px solid ${color}20`, padding: "9px 14px", display: "flex", alignItems: "center", justifyBetween: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: color }}>{sec.title}</span>
                <button onClick={() => copyText(secText, setCopied, i)} style={{ background: isCopied ? `${C.green}20` : `${color}15`, border: `1px solid ${isCopied ? C.green : color}30`, borderRadius: 6, padding: "3px 9px", color: isCopied ? C.green : color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{isCopied ? "✓ 복사됨" : "복사"}</button>
              </div>
            )}
            <div style={{ padding: "12px 14px", background: "#fff" }}>
              <pre style={{ whiteSpace:"pre-wrap", wordBreak:"break-word", fontSize:12, lineHeight:1.8, color:"#374151", margin:0, fontFamily:"'Noto Sans KR',sans-serif" }}>{sec.lines.join("\n").trim()}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [baseInfo, setBaseInfo] = useState({ company:"", industry:"", workers:"", manager:"" });
  const [baseConfirmed, setBaseConfirmed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("assessment");
  const [activeStep, setActiveStep] = useState(null);
  const [stepData, setStepData] = useState({});
  const [result, setResult] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // 브라우저 window.history 스코프 충돌을 피하기 위해 이름을 evalHistory로 변경
  const [evalHistory, setEvalHistory] = useState([]);
  
  const [showScenario, setShowScenario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sirenIndustry, setSirenIndustry] = useState(null);
  const [linkedSirenCases, setLinkedSirenCases] = useState([]);
  const [globalCopied, setGlobalCopied] = useState(false);
  const [sirenCopied, setSirenCopied] = useState(null);
  const [sheets, setSheets] = useState([{ id:1, workArea:"", workType:"", equipment:"", materials:"", envFactors:"", currentSafety:"", result:"" }]);
  const [activeSheetId, setActiveSheetId] = useState(1);
  const [sheetLoading, setSheetLoading] = useState({});

  useEffect(() => {
    async function initStorageData() {
      const p = await loadStorage("company-profile"); if (p) { setBaseInfo(p); setBaseConfirmed(true); }
      const h = await loadStorage("eval-history"); if (h) setEvalHistory(h);
      const t = await loadStorage("selected-template"); if (t) setSelectedTemplate(t);
    }
    initStorageData();
  }, []);

  useEffect(() => {
    if (completedSteps.length >= 4 && baseInfo.industry) {
      const matchKey = Object.keys(INDUSTRY_SCENARIOS).find(k => baseInfo.industry.includes(k) || baseInfo.industry.replace("업","") === k.replace("업",""));
      if (matchKey) setLinkedSirenCases(INDUSTRY_SCENARIOS[matchKey].accidentCases || []);
    }
  }, [completedSteps, baseInfo.industry]);

  const getAllData = () => ({ ...baseInfo, ...stepData });

  const callAI = async (prompt) => {
    setLoading(true); setResult("");
    const info = Object.entries(getAllData()).map(([k,v]) => `${k}: ${v||"미입력"}`).join("\n");
    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1500, system:prompt, messages:[{ role:"user", content:`다음 정보로 문서를 작성해주세요:\n\n${info}` }] }) });
      const d = await res.json();
      const text = d.content?.map(b => b.text||"").join("") || "오류가 발생했습니다.";
      setResult(text);
      if (activeStep?.id) setResults(prev => ({ ...prev, [activeStep.id]: text }));
      const entry = { id:Date.now(), step:activeStep?.title, company:baseInfo.company||"미입력", date:new Date().toLocaleDateString("ko-KR"), preview:text.slice(0,60)+"...", full:text };
      const newH = [entry,...evalHistory].slice(0,20); setEvalHistory(newH); await saveStorage("eval-history", newH);
    } catch { setResult("오류가 발생했습니다. 다시 시도해주세요."); }
    finally { setLoading(false); }
  };

  const applyScenario = (industry) => {
    const sc = INDUSTRY_SCENARIOS[industry]; if (!sc) return;
    if (activeStep?.multiSheet) {
      setSheets(prev => prev.map(s => s.id===activeSheetId ? { ...s, workType:sc.workTypes.join(", "), equipment:sc.equipments.join(", "), materials:sc.materials.join(", "), envFactors:sc.envFactors.join(", "), currentSafety:"" } : s));
    } else {
      setStepData(prev => ({ ...prev, workType:sc.workTypes.join(", "), equipment:sc.equipments.join(", "), materials:sc.materials.join(", "), hazards:sc.hazards.join(", "), envFactors:sc.envFactors.join(", ") }));
    }
    setShowScenario(false);
  };

  const addSheet = () => { const newId = Math.max(...sheets.map(s=>s.id))+1; setSheets(prev=>[...prev,{id:newId,workArea:"",workType:"",equipment:"",materials:"",envFactors:"",currentSafety:"",result:""}]); setActiveSheetId(newId); };
  const removeSheet = (id) => { if (sheets.length<=1) return; const remaining=sheets.filter(s=>s.id!==id); setSheets(remaining); if(activeSheetId===id) setActiveSheetId(remaining[0].id); };
  const updateSheet = (id,field,value) => setSheets(prev=>prev.map(s=>s.id===id?{...s,[field]:value}:s));

  const callAIForSheet = async (sheet) => {
    setSheetLoading(prev=>({...prev,[sheet.id]:true}));
    const info = Object.entries({...baseInfo,...sheet}).map(([k,v])=>`${k}: ${v||"미입력"}`).join("\n");
    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1500, system:STEPS[1].prompt, messages:[{role:"user",content:`다음공정의 위험요인을 파악해주세요:\n\n${info}`}] }) });
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setSheets(prev=>prev.map(s=>s.id===sheet.id?{...s,result:text}:s));
      const entry={id:Date.now(),step:`유해위험요인파악 - ${sheet.workArea||"공정"+sheet.id}`,company:baseInfo.company||"미입력",date:new Date().toLocaleDateString("ko-KR"),preview:text.slice(0,60)+"...",full:text};
      const newH=[entry,...evalHistory].slice(0,20); setEvalHistory(newH); await saveStorage("eval-history",newH);
    } catch { setSheets(prev=>prev.map(s=>s.id===sheet.id?{...s,result:"오류가 발생했습니다."}:s)); }
    finally { setSheetLoading(prev=>({...prev,[sheet.id]:false})); }
  };

  const getAllSheetsResult = () => sheets.filter(s=>s.result).map((s,i)=>`[공정 ${i+1}: ${s.workArea||"미입력"}]\n${s.result}`).join("\n\n");
  const getSirenCases = () => {
    if (sirenIndustry) return INDUSTRY_SCENARIOS[sirenIndustry]?.accidentCases||[];
    if (baseInfo.industry) { const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업","")); if(mk) return INDUSTRY_SCENARIOS[mk]?.accidentCases||[]; }
    return Object.values(INDUSTRY_SCENARIOS).flatMap(s=>s.accidentCases||[]);
  };
  const getRelatedCases = () => { if(!baseInfo.industry) return []; const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업","")); return mk?(INDUSTRY_SCENARIOS[mk]?.accidentCases||[]):[];};
  const formatSirenText = (c) => `🚨 중대재해 사이렌 — ${c.title}\n\n[업종] ${c.industry} | [일자] ${c.date} | [피해] ${c.severity}\n\n▶ 발생 경위\n${c.situation}\n\n▶ 원인 분석\n${c.cause}\n\n▶ 재발방지 대책\n${c.prevention}\n\n⚠ 지금 당장 현장에 공유하세요!`;

  const Header = ({ title, onBack }) => (
    <div style={{ background:`linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding:"14px 16px", position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:560, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
        {onBack && <button onClick={onBack} style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:8, padding:"6px 11px", color:"#fff", fontSize:13, cursor:"pointer" }}>← 뒤로</button>}
        <div style={{ flex:1, color:"#fff", fontSize:15, fontWeight:700 }}>{title}</div>
      </div>
    </div>
  );

  const BaseInfoBanner = () => baseConfirmed && baseInfo.company ? (
    <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:11, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", justifyBetween: "space-between" }}>
      <div><div style={{fontSize:12,fontWeight:700,color:"#166534"}}>공통정보 자동 적용 중</div><div style={{fontSize:12,color:"#4b7c5e",marginTop:2}}>{baseInfo.company} · {baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}</div></div>
      <button onClick={()=>setShowProfileModal(true)} style={{background:"none",border:"1px solid rgba(34,197,94,0.4)",borderRadius:7,padding:"4px 10px",color:"#166534",fontSize:11,fontWeight:700,cursor:"pointer"}}>수정</button>
    </div>
  ) : null;

  if (screen==="home" && !selectedTemplate) {
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"36px 16px 28px"}}>
          <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
            <div style={{color:"#fff",fontSize:20,fontWeight:800,marginBottom:6}}>위험성평가 전문 시스템</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>고용노동부 고시 제2024-76호 기준</div>
          </div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"24px 16px"}}>
          <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:6}}>문서 양식을 선택해주세요</div>
          <div style={{fontSize:13,color:C.slate,marginBottom:20}}>업종과 사업장 규모에 맞는 양식을 선택하면 최적화된 문서를 작성해드려요</div>
          {DOCUMENT_TEMPLATES.map(tmpl => (
            <button key={tmpl.id} onClick={async()=>{setSelectedTemplate(tmpl);await saveStorage("selected-template",tmpl);}} style={{width:"100%",background:"#fff",border:`2px solid ${tmpl.color}30`,borderRadius:14,padding:"16px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:14,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{width:48,height:48,borderRadius:12,background:`${tmpl.color}15`,border:`2px solid ${tmpl.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{tmpl.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:C.navy,marginBottom:4}}>{tmpl.name}</div>
                <div style={{fontSize:12,color:C.slate,lineHeight:1.5,marginBottom:8}}>{tmpl.desc}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{tmpl.tags.map(t=><span key={t} style={{fontSize:10,fontWeight:700,color:tmpl.color,background:`${tmpl.color}12`,padding:"2px 8px",borderRadius:20}}>{t}</span>)}</div>
              </div>
              <div style={{color:"#cbd5e1",fontSize:20,alignSelf:"center"}}>›</div>
            </button>
          ))}
          <div style={{padding:"12px 14px",background:"rgba(14,165,233,0.07)",border:"1px solid rgba(14,165,233,0.18)",borderRadius:10,fontSize:12,color:"#0369a1",lineHeight:1.7,marginTop:4}}>
            📌 산업안전보건법 제36조 — 상시근로자 1인 이상 전 사업장 의무 실시 · 결과 <strong>3년 보존</strong>
          </div>
        </div>
      </div>
    );
  }

  if (screen==="home" && selectedTemplate) {
    const sirenCases = getSirenCases();
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"20px 16px 16px"}}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{selectedTemplate.icon}</span>
                <div><div style={{color:"#fff",fontSize:15,fontWeight:800}}>{selectedTemplate.name}</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:11}}>고용노동부 고시 제2024-76호 기준</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setShowProfileModal(true)} style={{background:baseConfirmed?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 9px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{baseConfirmed?"✅ 프로필":"🏢 프로필"}</button>
                <button onClick={async()=>{setSelectedTemplate(null);await saveStorage("selected-template",null);}} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 9px",color:"#fff",fontSize:11,cursor:"pointer"}}>양식변경</button>
              </div>
            </div>
            {baseConfirmed && (
              <div style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"9px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>🏢</span>
                <div style={{flex:1}}><div style={{color:"#fff",fontSize:12,fontWeight:700}}>{baseInfo.company}</div><div style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}</div></div>
                <div style={{color:"#4ade80",fontSize:10,fontWeight:700}}>전 단계 자동적용</div>
              </div>
            )}
            <div style={{display:"flex",gap:4}}>{STEPS.map((s,i)=><div key={s.id} style={{flex:1,height:4,borderRadius:3,background:completedSteps.includes(i+1)?C.green:"rgba(255,255,255,0.18)"}}/>)}</div>
          </div>
        </div>

        <div style={{maxWidth:560,margin:"0 auto",padding:"12px 14px 0"}}>
          <div style={{display:"flex",background:"#e2e8f0",borderRadius:11,padding:3,gap:3}}>
            {[{k:"assessment",l:"📋 위험성평가"},{k:"siren",l:"🚨 중대재해 사이렌"},{k:"history",l:"📜 이력"}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:tab===t.k?(t.k==="siren"?C.siren:"#fff"):"transparent",color:tab===t.k?(t.k==="siren"?"#fff":C.navy):C.slate,fontSize:12,fontWeight:700,cursor:"pointer embezzlement"}}>{t.l}</button>
            ))}
          </div>
        </div>

        {tab==="assessment" && (
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            {completedSteps.length > 0 && (() => {
              const allText = STEPS.filter(s=>results[s.id]).map(s=>`=== ${s.icon} STEP ${s.id}: ${s.title} ===\n\n${results[s.id]}`).join("\n\n\n");
              return (
                <button onClick={()=>{ navigator.clipboard.writeText(allText).then(()=>{setGlobalCopied(true);setTimeout(()=>setGlobalCopied(false),2000);}); }} style={{width:"100%",padding:"13px",marginBottom:12,background:globalCopied?"linear-gradient(135deg,#166534,#15803d)":"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span style={{fontSize:18}}>{globalCopied?"✅":"📋"}</span> {globalCopied?`전체 복사 완료! (${completedSteps.length}/6 단계)`:`전체 내용 복사 (${completedSteps.length}/6 완료)`}
                </button>
              );
            })()}
            {linkedSirenCases.length > 0 && (
  <div style={{background:"linear-gradient(135deg,rgba(220,38,38,0.08),rgba(220,38,38,0.03))",border:"2px solid rgba(220,38,38,0.25)",borderRadius:13,padding:"12px 14px",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <span style={{fontSize:18}}>🚨</span>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:C.siren}}>
          중대재해 사이렌 연계
        </div>
        <div style={{fontSize:11,color:"#7f1d1d"}}>
          위험성평가 완료! 동종 업종 실제 사고사례를 현장에 공유하세요
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {linkedSirenCases.map((c,i)=>(
        <button key={i} onClick={()=>setTab("siren")} style={{padding:"5px 10px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:8,color:C.siren,fontSize:11,fontWeight:700,cursor:"pointer"}}>
          {c.keyword}
        </button>
      ))}
    </div>
  </div>
)}
<div style={{display:"flex",flexDirection:"column",gap:8}}>
  {STEPS.map((s,i)=>{
    const done=completedSteps.includes(i+1);
    return (
      <button key={s.id} onClick={()=>{setActiveStep(s);setStepData({});setResult(results[s.id]||"");setScreen("step-form");}} style={{width:"100%",background:"#fff",border:`2px solid ${done?C.green:"#e2e8f0"}`,borderRadius:13,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:10,flexShrink:0,background:done?`${C.green}18`:`${s.color}12`,border:`2px solid ${done?C.green:s.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{done?"✅":s.icon}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
            <span style={{fontSize:10,fontWeight:700,color:s.color,background:`${s.color}15`,padding:"1px 7px",borderRadius:20}}>STEP {s.id}</span>
            {done&&<span style={{fontSize:10,color:C.green,fontWeight:700}}>완료</span>}
            {s.id===1&&!baseConfirmed&&<span style={{fontSize:10,color:C.amber,fontWeight:700}}>← 여기서 시작!</span>}
          </div>
                      <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{s.title}</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{s.id===1?"사업장 공통정보 입력 → 전 단계 자동적용":s.subtitle}</div>
                    </div>
                    <div style={{color:"#cbd5e1",fontSize:18}}>›</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab==="siren" && (
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            <div style={{background:"linear-gradient(135deg,#7f1d1d,#dc2626)",borderRadius:14,padding:"18px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:6}}>🚨</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:800,marginBottom:4}}>중대재해 사이렌</div>
              <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,lineHeight:1.6}}>실제 중대재해 사례를 원시트로 복사해서<br/>카카오톡·문자·게시판에 즉시 공유하세요</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.slate,marginBottom:8}}>업종별 사고사례</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button onClick={()=>setSirenIndustry(null)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:!sirenIndustry?C.siren:"#e2e8f0",color:!sirenIndustry?"#fff":C.slate,fontSize:12,fontWeight:700,cursor:"pointer"}}>전체</button>
                {Object.keys(INDUSTRY_SCENARIOS).map(ind=>(
                  <button key={ind} onClick={()=>setSirenIndustry(ind)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:sirenIndustry===ind?C.siren:"#e2e8f0",color:sirenIndustry===ind?"#fff":C.slate,fontSize:12,fontWeight:700,cursor:"pointer"}}>{ind}</button>
                ))}
              </div>
            </div>
            {sirenCases.map((c,i)=>{
              const isCopied = sirenCopied===i;
              const sirenText = formatSirenText(c);
              return (
                <div key={i} style={{background:"#fff",border:"2px solid rgba(220,38,38,0.12)",borderLeft:`4px solid ${C.siren}`,borderRadius:14,padding:"16px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,fontWeight:700,color:"#fff",background:C.siren,padding:"2px 8px",borderRadius:20}}>{c.severity}</span>
                        <span style={{fontSize:10,fontWeight:700,color:C.siren,background:"rgba(220,38,38,0.08)",padding:"2px 8px",borderRadius:20}}>{c.keyword}</span>
                        <span style={{fontSize:10,color:C.slate}}>{c.date} · {c.industry}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:800,color:C.navy,lineHeight:1.4}}>{c.title}</div>
                    </div>
                  </div>
                  <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:C.siren,marginBottom:3}}>🔴 발생 경위</div><div style={{fontSize:12,color:"#374151",lineHeight:1.6,background:"rgba(220,38,38,0.04)",padding:"8px 10px",borderRadius:8}}>{c.situation}</div></div>
                  <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:3}}>⚠️ 원인 분석</div><div style={{fontSize:12,color:"#374151",lineHeight:1.6,background:"rgba(245,158,11,0.05)",padding:"8px 10px",borderRadius:8}}>{c.cause}</div></div>
                  <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:3}}>✅ 재발방지 대책</div><div style={{fontSize:12,color:"#374151",lineHeight:1.6,background:"rgba(34,197,94,0.05)",padding:"8px 10px",borderRadius:8}}>{c.prevention}</div></div>
                  <button onClick={()=>{navigator.clipboard.writeText(sirenText).then(()=>{setSirenCopied(i);setTimeout(()=>setSirenCopied(null),2000);});}} style={{width:"100%",padding:"11px",background:isCopied?"linear-gradient(135deg,#166534,#15803d)":`linear-gradient(135deg,${C.siren},#b91c1c)`,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span>{isCopied?"✅":"📋"}</span> {isCopied?"복사 완료! 카톡/문자로 공유하세요":"전체 내용 복사 · 즉시 현장 공유"}
                  </button>
                </div>
              );
            })}
            <div style={{padding:"12px 14px",background:"rgba(220,38,38,0.04)",border:"1px solid rgba(220,38,38,0.12)",borderRadius:10,fontSize:12,color:"#7f1d1d",lineHeight:1.7}}>
              🚨 사고사례는 고용노동부 공개 자료를 기반으로 재구성한 예시입니다. 실제 현장 배포 전 안전관리자가 확인하세요.
            </div>
          </div>
        )}

        {tab==="history" && (
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            {evalHistory.length===0 ? (
              <div style={{textAlign:"center",padding:"50px 0",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>📜</div><div style={{fontWeight:700}}>아직 작성된 문서가 없어요</div></div>
            ) : (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:12,color:C.slate,fontWeight:600}}>최근 {evalHistory.length}건</div>
                  <button onClick={async()=>{setEvalHistory([]);await saveStorage("eval-history",[]);}} style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",fontWeight:600}}>전체삭제</button>
                </div>
                {evalHistory.map(h=>(
                  <div key={h.id} style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <div><div style={{fontSize:13,fontWeight:700,color:C.navy}}>{h.step}</div><div style={{fontSize:11,color:"#94a3b8"}}>{h.company} · {h.date}</div></div>
                      <button onClick={()=>navigator.clipboard.writeText(h.full)} style={{background:`${C.accent}12`,border:`1px solid ${C.accent}30`,borderRadius:7,padding:"4px 10px",color:C.accent,fontSize:11,fontWeight:700,cursor:"pointer"}}>복사</button>
                    </div>
                    <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{h.preview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showProfileModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setShowProfileModal(false)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxWidth:560}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:4}}>🏢 회사 프로필 저장</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>저장하면 앱을 닫아도 자동 불러와요</div>
              {BASE_FIELDS.map(f=>(
                <div key={f.key} style={{marginBottom:12}}>
                  <label style={{fontSize:13,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>{f.label}</label>
                  <input value={baseInfo[f.key]||""} onChange={e=>setBaseInfo(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:14,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
                </div>
              ))}
              <button onClick={async()=>{setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);setShowProfileModal(false);alert("저장됐어요!");}} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.navy},${C.blue})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:4}}>💾 저장하기</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen==="step-form" && activeStep) {
    const isStep1=activeStep.id===1, isStep2=activeStep.multiSheet===true;
    const stepColor=activeStep.color;
    const activeSheet=sheets.find(s=>s.id===activeSheetId)||sheets[0];
    const SHEET_FIELDS=[
      {key:"workArea",label:"작업장소/공정명",placeholder:"예: 지하 2층 거푸집 설치 작업"},
      {key:"workType",label:"작업종류",placeholder:"예: 고소작업, 용접작업"},
      {key:"equipment",label:"사용 기계·기구·기인물",placeholder:"예: 이동식비계, 용접기, 지게차"},
      {key:"materials",label:"취급 원자재/화학물질",placeholder:"예: 시멘트, LPG, 유기용제"},
      {key:"envFactors",label:"작업장 환경요인",placeholder:"예: 고온·다습, 소음 90dB, 환기 불량, 협소 공간, 야간작업",isNew:true},
      {key:"currentSafety",label:"현재 안전조치",placeholder:"예: 안전난간 설치, 안전대 지급"},
    ];
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <style>{`*{box-sizing:border-box;}input:focus{border-color:${stepColor}!important;background:#fff!important;}`}</style>
        <Header title={`${activeStep.icon} STEP ${activeStep.id} · ${activeStep.title}`} onBack={()=>setScreen("home")}/>
        <div style={{maxWidth:560,margin:"0 auto",padding:"14px 14px 32px"}}>
          {!isStep1&&<BaseInfoBanner/>}
          {isStep1&&(
            <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>🏢 사업장 공통정보 <span style={{fontSize:11,color:C.accent,fontWeight:600,background:`${C.accent}12`,padding:"2px 8px",borderRadius:20,marginLeft:6}}>2~6단계 자동적용</span></div>
              {BASE_FIELDS.map(f=>(
                <div key={f.key} style={{marginBottom:10}}>
                  <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:4}}>{f.label}</label>
                  <input value={baseInfo[f.key]||""} onChange={e=>setBaseInfo(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          )}
          {isStep2&&(
            <div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  {sheets.map((s,i)=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:2}}>
                      <button onClick={()=>setActiveSheetId(s.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",background:activeSheetId===s.id?stepColor:"#e2e8f0",color:activeSheetId===s.id?"#fff":C.slate,fontSize:12,fontWeight:700}}>
                        {s.result?"✅ ":""}{s.workArea?s.workArea.slice(0,8)+(s.workArea.length>8?"..":""):`공정 ${i+1}`}
                      </button>
                      {sheets.length>1&&<button onClick={()=>removeSheet(s.id)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:14,cursor:"pointer",padding:"0 2px"}}>×</button>}
                    </div>
                  ))}
                  <button onClick={addSheet} style={{padding:"6px 12px",borderRadius:8,border:`1.5px dashed ${C.accent}`,background:`${C.accent}08`,color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 공정 추가</button>
                </div>
                <div style={{fontSize:11,color:"#94a3b8"}}>공정/작업별로 Sheet를 추가해서 각각 위험요인을 파악하세요</div>
              </div>
              <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy}}>🏭 {activeSheet.workArea||`공정 ${sheets.findIndex(s=>s.id===activeSheetId)+1}`}</div>
                  <button onClick={()=>setShowScenario(true)} style={{padding:"5px 10px",background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:8,color:C.amber,fontSize:11,fontWeight:700,cursor:"pointer"}}>🏭 시나리오</button>
                </div>
                {SHEET_FIELDS.map(f=>(
                  <div key={f.key} style={{marginBottom:10}}>
                    <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:4}}>
                      {f.label}
                      {f.isNew&&<span style={{fontSize:10,color:"#fff",fontWeight:700,marginLeft:6,background:C.purple,padding:"1px 6px",borderRadius:10}}>NEW</span>}
                      {activeSheet[f.key]&&f.key!=="workArea"&&<span style={{color:C.green,fontSize:11,marginLeft:6}}>자동완성</span>}
                    </label>
                    <input value={activeSheet[f.key]||""} onChange={e=>updateSheet(activeSheetId,f.key,e.target.value)} placeholder={f.placeholder}
                      style={{width:"100%",padding:"9px 12px",borderRadius:9,fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box",
                        border:`1.5px solid ${activeSheet[f.key]&&f.key!=="workArea"?"rgba(34,197,94,0.4)":f.isNew?`${C.purple}40`:"#e2e8f0"}`,
                        background:activeSheet[f.key]&&f.key!=="workArea"?"rgba(34,197,94,0.04)":f.isNew?`${C.purple}05`:"#f8fafc"}}/>
                  </div>
                ))}
                <button onClick={()=>callAIForSheet(activeSheet)} disabled={!!sheetLoading[activeSheetId]} style={{width:"100%",padding:"12px",background:sheetLoading[activeSheetId]?"rgba(245,158,11,0.3)":`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:11,color:"#fff",fontSize:13,fontWeight:700,cursor:sheetLoading[activeSheetId]?"not-allowed":"pointer"}}>
                  {sheetLoading[activeSheetId]?"⏳ AI가 위험요인 파악 중...":"🤖 이 공정 위험요인 AI 파악"}
                </button>
                {activeSheet.result&&(
                  <div style={{marginTop:12,background:"#f8fafc",borderRadius:10,padding:"12px",border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:6}}>✅ 위험요인 파악 완료</div>
                    <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:12,lineHeight:1.7,color:"#374151",margin:0,fontFamily:"'Noto Sans KR',sans-serif",maxHeight:200,overflow:"auto"}}>{activeSheet.result}</pre>
                  </div>
                )}
              </div>
              <div style={{background:`${C.accent}0a`,border:`1px solid ${C.accent}25`,borderRadius:12,padding:"11px 14px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:C.accent}}>{sheets.filter(s=>s.result).length}/{sheets.length} 공정 완료</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>모든 공정 파악 후 다음 단계로 진행하세요</div>
              </div>
              <button onClick={async()=>{ const r=getAllSheetsResult(); if(!r){alert("최소 1개 공정의 위험요인을 먼저 파악해주세요!");return;} setResult(r);setResults(prev=>({...prev,[2]:r}));setCompletedSteps(prev=>prev.includes(2)?prev:[...prev,2]);setScreen("step-result"); }} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                📋 전체 결과 확인 및 다음 단계로
              </button>
            </div>
          )}
          {!isStep2&&(
            <div>
              <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>{activeStep.icon} 이 단계 전용 정보</div>
                {activeStep.hasScenario&&<button onClick={()=>setShowScenario(true)} style={{width:"100%",padding:"9px",marginBottom:12,background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:9,color:C.amber,fontSize:12,fontWeight:700,cursor:"pointer"}}>🏭 업종별 시나리오로 자동완성</button>}
                {activeStep.uniqueFields&&activeStep.uniqueFields.map(f=>(
                  <div key={f.key} style={{marginBottom:10}}>
                    <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:4}}>{f.label} {stepData[f.key]&&<span style={{color:C.green,fontSize:11,marginLeft:6}}>자동완성</span>}</label>
                    <input value={stepData[f.key]||""} onChange={e=>setStepData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${stepData[f.key]?"rgba(34,197,94,0.4)":"#e2e8f0"}`,fontSize:13,color:C.navy,outline:"none",background:stepData[f.key]?"rgba(34,197,94,0.04)":"#f8fafc",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </div>
              <button onClick={async()=>{ if(isStep1){setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);} setScreen("step-result"); await callAI(activeStep.prompt); setCompletedSteps(prev=>prev.includes(activeStep.id)?prev:[...prev,activeStep.id]); }} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                🤖 AI 문서 자동 작성
              </button>
            </div>
          )}
        </div>
        {showScenario&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setShowScenario(false)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxWidth:560}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:14}}>🏭 업종 선택</div>
              {Object.entries(INDUSTRY_SCENARIOS).map(([name,sc])=>(
                <button key={name} onClick={()=>applyScenario(name)} style={{width:"100%",background:"#f8fafc",border:"2px solid #e2e8f0",borderRadius:11,padding:"12px 14px",textAlign:"left",cursor:"pointer",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{name}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{sc.hazards.slice(0,4).join(" · ")}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen==="step-result" && activeStep) {
    const stepIdx=STEPS.findIndex(s=>s.id===activeStep.id);
    const nextStep=stepIdx!==-1&&stepIdx+1<STEPS.length?STEPS[stepIdx+1]:null;
    const stepColor=activeStep.color||C.purple;
    const relatedCases=getRelatedCases();
    const [localCopied,setLocalCopied]=useState(false);
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <style>{`*{box-sizing:border-box;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"14px 16px",position:"sticky",top:0,zIndex:50}}>
          <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setScreen("step-form")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 뒤로</button>
            <div style={{flex:1,color:"#fff",fontSize:14,fontWeight:700}}>{activeStep.icon} {activeStep.title} 결과</div>
            {!loading&&result&&(
              <button onClick={()=>{navigator.clipboard.writeText(result).then(()=>{setLocalCopied(true);setTimeout(()=>setLocalCopied(false),2000);});}} style={{background:localCopied?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.15)",border:`1px solid ${localCopied?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.3)"}`,borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                {localCopied?"✅ 복사됨":"📋 전체복사"}
              </button>
            )}
          </div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"16px 14px 32px"}}>
          {loading ? (
            <div style={{background:"#fff",borderRadius:20,padding:"50px 20px",textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>{activeStep.icon}</div>
              <div style={{color:C.navy,fontWeight:800,fontSize:15,marginBottom:6}}>AI가 문서를 작성하고 있어요</div>
              <div style={{color:"#94a3b8",fontSize:13,marginBottom:20}}>고용노동부 기준으로 생성 중...</div>
              <div style={{display:"flex",justifyContent:"center",gap:8}}>
                {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:stepColor,animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.4}s`}}/>)}
              </div>
            </div>
          ) : (
            <div>
              <div style={{background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,borderRadius:14,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✅</div>
                <div>
                  <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{activeStep.title} 문서 생성 완료!</div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:2}}>{baseInfo.company||"사업장"} · {new Date().toLocaleDateString("ko-KR")}</div>
                </div>
              </div>

              <button onClick={()=>{navigator.clipboard.writeText(result).then(()=>{setLocalCopied(true);setTimeout(()=>setLocalCopied(false),2000);});}} style={{width:"100%",padding:"13px",marginBottom:12,background:localCopied?"linear-gradient(135deg,#166534,#15803d)":`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:18}}>{localCopied?"✅":"📋"}</span> {localCopied?"복사 완료! 붙여넣기 해서 사용하세요":"전체 내용 복사"}
              </button>

              {relatedCases.length>0&&(
                <div style={{background:"linear-gradient(135deg,rgba(220,38,38,0.07),rgba(220,38,38,0.03))",border:"2px solid rgba(220,38,38,0.2)",borderRadius:13,padding:"12px 14px",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.siren,marginBottom:6}}>🚨 동종 업종 중대재해 사례 — 지금 현장에 공유하세요!</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {relatedCases.slice(0,3).map((c,i)=>{
                      const txt=formatSirenText(c);
                      return <button key={i} onClick={()=>navigator.clipboard.writeText(txt)} style={{padding:"6px 11px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.25)",borderRadius:8,color:C.siren,fontSize:11,fontWeight:700,cursor:"pointer"}}>📋 {c.keyword} 복사</button>;
                    })}
                  </div>
                </div>
              )}

              <div style={{background:"#fff",borderRadius:16,overflow:"hidden",marginBottom:12}}>
                <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{activeStep.icon}</span>
                    <div><div style={{color:"#fff",fontWeight:700,fontSize:13}}>{activeStep.title}</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>고용노동부 고시 제2024-76호 기준</div></div>
                  </div>
                </div>
                <div style={{padding:"16px"}}>
                  <ResultViewer text={result} color={stepColor}/>
                </div>
              </div>

              {nextStep&&(
                <button onClick={()=>{setActiveStep(nextStep);setStepData({});setResult(results[nextStep.id]||"");setScreen("step-form");}} style={{width:"100%",padding:"14px",marginBottom:8,background:`linear-gradient(135deg,${nextStep.color},${nextStep.color}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  다음 → STEP {nextStep.id}: {nextStep.title} {nextStep.icon}
                </button>
              )}
              <button onClick={()=>setScreen("home")} style={{width:"100%",padding:"12px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:13,color:C.navy,fontSize:14,fontWeight:700,cursor:"pointer"}}>🏠 홈으로</button>
              <div style={{marginTop:10,padding:"11px 14px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,fontSize:12,color:"#92400e",lineHeight:1.6}}>
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

import { useState, useEffect } from "react";

// docx 라이브러리 CDN으로 로드 (index.html에 추가 필요)
// <script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>

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

// 미리 만든 문서 틀
const DOCUMENT_TEMPLATES = [
  {
    id: "standard",
    icon: "📋",
    name: "고용노동부 표준 양식",
    desc: "고시 제2024-76호 기준 6단계 표준 양식",
    color: "#0ea5e9",
    tags: ["법정 기준", "전 업종"],
  },
  {
    id: "construction",
    icon: "🏗️",
    name: "건설업 전용 양식",
    desc: "고소작업·중장비·굴착 등 건설 현장 특화",
    color: "#f59e0b",
    tags: ["건설업", "고소작업", "중장비"],
  },
  {
    id: "manufacturing",
    icon: "🏭",
    name: "제조업 전용 양식",
    desc: "프레스·화학물질·컨베이어 등 제조 현장 특화",
    color: "#ef4444",
    tags: ["제조업", "기계작업", "화학물질"],
  },
  {
    id: "small",
    icon: "🏪",
    name: "소규모 사업장 간이 양식",
    desc: "50인 미만 소규모 사업장용 간소화 양식",
    color: "#22c55e",
    tags: ["소규모", "간이", "50인 미만"],
  },
  {
    id: "logistics",
    icon: "🚛",
    name: "물류·유통업 전용 양식",
    desc: "지게차·하역·보관 등 물류 현장 특화",
    color: "#8b5cf6",
    tags: ["물류", "지게차", "하역"],
  },
];

const BASE_FIELDS = [
  { key: "company", label: "사업장명", placeholder: "예: OO건설 3공구" },
  { key: "industry", label: "업종", placeholder: "예: 건설업 / 제조업 / 물류업" },
  { key: "workers", label: "근로자수", placeholder: "예: 35명" },
  { key: "manager", label: "안전관리자", placeholder: "예: 홍길동" },
];

const STEPS = [
  { id: 1, icon: "📁", title: "사전준비", subtitle: "평가팀 구성 및 기준 설정", color: "#0ea5e9",
    uniqueFields: [
      { key: "evalType", label: "평가종류", placeholder: "예: 최초평가 / 정기평가 / 수시평가" },
      { key: "evalDate", label: "평가일자", placeholder: "예: 2026-05-06" },
      { key: "evalTeam", label: "평가팀 구성", placeholder: "예: 안전관리자, 관리감독자, 근로자 대표" },
      { key: "riskMatrix", label: "위험성 판단 기준", placeholder: "예: 가능성(상/중/하) × 중대성(상/중/하) 9칸 매트릭스" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 사전준비 단계 문서 작성. 포함: 사업장 기본정보, 법적근거(산업안전보건법 제36조), 평가팀 구성 및 역할, 가능성×중대성 위험성 판단 기준 매트릭스(3×3), 수집자료 목록(재해사례/아차사고/공정정보), 평가일정. 중대성은 시나리오별로 STEP3에서 결정됨을 명시. 전문적으로 한국어로.",
  },
  { id: 2, icon: "🔍", title: "유해·위험요인 파악", subtitle: "위험 시나리오 도출", color: "#f59e0b",
    uniqueFields: [
      { key: "workArea", label: "작업장소/공정", placeholder: "예: 지하 2층 거푸집 설치 작업" },
      { key: "workType", label: "작업종류", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "equipment", label: "사용 기계·기구", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "materials", label: "취급 원자재/화학물질", placeholder: "업종 시나리오 선택 또는 직접 입력" },
      { key: "currentSafety", label: "현재 안전조치 현황", placeholder: "예: 안전난간 설치, 안전대 지급, 작업허가서 운영" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 유해·위험요인 파악 단계 문서 작성. 포함: 작업개요, 위험 시나리오 목록표(8개 이상) - 각 시나리오는 [작업상황 → 위험요인 → 예상 재해유형] 형식으로 작성, 유형별 분류(기계적/화학적/물리적/인간공학적), 파악방법(순회점검/근로자의견청취). 중대성 평가는 STEP3에서 별도 수행함을 명시. 전문적으로 한국어로.",
    hasScenario: true,
  },
  { id: 3, icon: "⚖️", title: "위험성 결정", subtitle: "시나리오별 가능성 × 중대성 평가", color: "#ef4444",
    uniqueFields: [
      { key: "hazards", label: "STEP2에서 도출된 주요 위험 시나리오", placeholder: "업종 시나리오 선택 또는 STEP2 결과 입력" },
      { key: "method", label: "위험성 추정 방법", placeholder: "예: 빈도·강도법(가능성×중대성) / 핵심요인 기술법" },
      { key: "acceptableCriteria", label: "허용 가능 위험성 기준", placeholder: "예: 위험성 합계 4이상=허용불가, 3=조건부, 2이하=허용" },
    ],
    prompt: "고용노동부 고시 제2024-76호 기준 위험성 결정 단계 문서 작성. 핵심: 각 위험 시나리오별로 (1)가능성(상3/중2/하1) (2)중대성(상3/중2/하1) (3)위험성=가능성×중대성 (4)허용여부를 결정하는 표 작성. 포함: 위험성 결정 매트릭스표, 시나리오별 상세 결정 근거, 허용불가 위험성 목록(즉시조치 필요), 중대성 판단기준(사망/중상/경상). 중대성은 이 단계에서 처음 결정됨을 강조. 전문적으로 한국어로.",
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

// Vercel 인바이런먼트 브라우저 안전장치 확보
async function saveStorage(key, val) {
  try { 
    if (window.storage && typeof window.storage.set === 'function') {
      await window.storage.set(key, JSON.stringify(val)); 
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch {}
}

async function loadStorage(key) {
  try { 
    if (window.storage && typeof window.storage.get === 'function') {
      const r = await window.storage.get(key); 
      return r ? JSON.parse(r.value) : null; 
    } else {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : null;
    }
  } catch { return null; }
}

// 워드 문서 생성 함수 (docx CDN 사용)
function downloadWordDoc(content, title, baseInfo) {
  try {
    if (!window.docx) {
      alert("docx 라이브러리가 로드되지 않았습니다. index.html의 CDN 설정을 확인하세요.");
      return;
    }
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
            HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType } = window.docx;

    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    const borders = { top: border, bottom: border, left: border, right: border };
    const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

    const children = [];

    // 제목
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 32, font: "맑은 고딕" })],
      spacing: { after: 200 },
    }));

    // 기본정보 표
    children.push(new Paragraph({
      children: [new TextRun({ text: "■ 사업장 기본정보", bold: true, size: 24, font: "맑은 고딕" })],
      spacing: { before: 200, after: 100 },
    }));

    children.push(new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2257, 2256, 2257, 2256],
      rows: [
        new TableRow({ children: [
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 2257, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "사업장명", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 2256, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: baseInfo.company || "", size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 2257, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "업종", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 2256, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: baseInfo.industry || "", size: 20, font: "맑은 고딕" })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 2257, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "근로자수", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 2256, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: baseInfo.workers || "", size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 2257, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "안전관리자", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 2256, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: baseInfo.manager || "", size: 20, font: "맑은 고딕" })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 2257, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "작성일", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, columnSpan: 3, width: { size: 6769, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString("ko-KR"), size: 20, font: "맑은 고딕" })] })] }),
        ]}),
      ],
    }));

    // 본문 내용
    children.push(new Paragraph({
      children: [new TextRun({ text: "■ 평가 내용", bold: true, size: 24, font: "맑은 고딕" })],
      spacing: { before: 300, after: 100 },
    }));

    const lines = content.split("\n");
    lines.forEach(line => {
      if (!line.trim()) {
        children.push(new Paragraph({ spacing: { after: 60 } }));
        return;
      }
      const isHeader = line.startsWith("#") || (line.match(/^\d+\./) && line.length < 50);
      const cleanLine = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
      children.push(new Paragraph({
        heading: isHeader ? HeadingLevel.HEADING_2 : undefined,
        children: [new TextRun({
          text: cleanLine,
          bold: isHeader,
          size: isHeader ? 24 : 20,
          font: "맑은 고딕",
        })],
        spacing: { before: isHeader ? 200 : 60, after: 60 },
      }));
    });

    // 서명란
    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [3009, 3008, 3009],
      rows: [
        new TableRow({ children: [
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 3009, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "작성자", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 3008, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "검토자", bold: true, size: 20, font: "맑은 고딕" })] })] }),
          new TableCell({ borders, margins: cellMargins, shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, width: { size: 3009, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "승인자", bold: true, size: 20, font: "맑은 고딕" })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders, margins: cellMargins, width: { size: 3009, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "　", size: 40 })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 3008, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "　", size: 40 })] })] }),
          new TableCell({ borders, margins: cellMargins, width: { size: 3009, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "　", size: 40 })] })] }),
        ]}),
      ],
    }));

    // 주의사항
    children.push(new Paragraph({
      children: [new TextRun({ text: "※ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.", size: 18, color: "FF6B00", font: "맑은 고딕" })],
      spacing: { before: 200 },
    }));

    const doc = new Document({
      styles: {
        default: { document: { run: { font: "맑은 고딕", size: 20 } } },
        paragraphStyles: [
          { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
            run: { size: 32, bold: true, font: "맑은 고딕", color: "0F2640" },
            paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
          { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
            run: { size: 24, bold: true, font: "맑은 고딕", color: "1A3A5C" },
            paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 } },
        ],
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `위험성평가_${title}_${baseInfo.company || "사업장"}_${new Date().toLocaleDateString("ko-KR").replace(/\. /g, "").replace(".", "")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    });
  } catch (e) {
    alert("워드 문서 생성 중 오류가 발생했습니다: " + e.message);
  }
}

export default function App() {
  const [baseInfo, setBaseInfo] = useState({ company: "", industry: "", workers: "", manager: "" });
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
  const [history, setHistory] = useState([]);
  const [showScenario, setShowScenario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadStorage("company-profile");
      if (p) { setBaseInfo(p); setBaseConfirmed(true); }
      const h = await loadStorage("eval-history");
      if (h) setHistory(h);
      const t = await loadStorage("selected-template");
      if (t) setSelectedTemplate(t);
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
          model: "claude-sonnet-4-6",
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

  const Header = ({ title, onBack }) => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 11px", color: "#fff", fontSize: 13, cursor: "pointer" }}>← 뒤로</button>}
        <div style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</div>
      </div>
    </div>
  );

  const BaseInfoBanner = () => (
    baseConfirmed && baseInfo.company ? (
      <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 11, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>공통정보 자동 적용 중</div>
          <div style={{ fontSize: 12, color: "#4b7c5e", marginTop: 2 }}>{baseInfo.company} · {baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}</div>
        </div>
        <button onClick={() => setShowProfileModal(true)} style={{ background: "none", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 7, padding: "4px 10px", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>수정</button>
      </div>
    ) : null
  );

  // 템플릿 선택 화면
  if (screen === "home" && !selectedTemplate) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "36px 16px 28px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>위험성평가 전문 시스템</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>고용노동부 고시 제2024-76호 기준</div>
          </div>
        </div>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 6 }}>문서 양식을 선택해주세요</div>
          <div style={{ fontSize: 13, color: C.slate, marginBottom: 20 }}>업종과 사업장 규모에 맞는 양식을 선택하면 최적화된 문서를 작성해드려요</div>
          {DOCUMENT_TEMPLATES.map(tmpl => (
            <button key={tmpl.id} onClick={async () => { setSelectedTemplate(tmpl); await saveStorage("selected-template", tmpl); }} style={{ width: "100%", background: "#fff", border: `2px solid ${tmpl.color}30`, borderRadius: 14, padding: "16px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${tmpl.color}15`, border: `2px solid ${tmpl.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{tmpl.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 4 }}>{tmpl.name}</div>
                <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, marginBottom: 8 }}>{tmpl.desc}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {tmpl.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, color: tmpl.color, background: `${tmpl.color}12`, padding: "2px 8px", borderRadius: 20 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 20, alignSelf: "center" }}>›</div>
            </button>
          ))}
          <div style={{ padding: "12px 14px", background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)", borderRadius: 10, fontSize: 12, color: "#0369a1", lineHeight: 1.7, marginTop: 4 }}>
            📌 산업안전보건법 제36조 — 상시근로자 1인 이상 전 사업장 의무 실시 · 결과 <strong>3년 보존</strong>
          </div>
        </div>
      </div>
    );
  }

  // 메인 홈
  if (screen === "home" && selectedTemplate) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "20px 16px 16px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{selectedTemplate.icon}</span>
                <div>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{selectedTemplate.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>고용노동부 고시 제2024-76호 기준</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setShowProfileModal(true)} style={{ background: baseConfirmed ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 9px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {baseConfirmed ? "✅ 프로필" : "🏢 프로필"}
                </button>
                <button onClick={async () => { setSelectedTemplate(null); await saveStorage("selected-template", null); }} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 9px", color: "#fff", fontSize: 11, cursor: "pointer" }}>양식변경</button>
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
                <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 3, background: completedSteps.includes(i + 1) ? C.green : "rgba(255,255,255,0.18)" }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 14px 0" }}>
          <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 11, padding: 3, gap: 3 }}>
            {[{ k: "assessment", l: "📋 위험성평가" }, { k: "education", l: "🎓 교육자료" }, { k: "history", l: "📜 이력" }].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: tab === t.k ? "#fff" : "transparent", color: tab === t.k ? C.navy : C.slate, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t.l}</button>
            ))}
          </div>
        </div>

        {tab === "assessment" && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "10px 14px 28px" }}>
            {completedSteps.length > 0 && (
              <button onClick={() => {
                const allText = STEPS.filter(s => results[s.id]).map(s => `=== ${s.icon} STEP ${s.id}: ${s.title} ===\n\n${results[s.id]}`).join("\n\n\n");
                downloadWordDoc(allText, "위험성평가 전체", baseInfo);
              }} style={{ width: "100%", padding: "13px", marginBottom: 12, background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📄</span> 전체 워드 문서 다운로드 ({completedSteps.length}/6 완료)
              </button>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STEPS.map((s, i) => {
                const done = completedSteps.includes(i + 1);
                return (
                  <button key={s.id} onClick={() => { setActiveStep(s); setStepData({}); setResult(results[s.id] || ""); setScreen("step-form"); }} style={{ background: "#fff", border: `2px solid ${done ? C.green : "#e2e8f0"}`, borderRadius: 13, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
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
              { icon: "🎓", title: "위험성평가 실시 전 교육", badge: "사전교육", color: C.accent, when: "평가 시작 전", prompt: "고용노동부 고시 제2024-76호 기준 위험성평가 실시 전 교육자료 작성. 포함: 정의/목적, 법적의무, 역할분담, 6단계 절차, 판단기준 매트릭스, O/X 퀴즈 5문제. 쉽게 한국어로." },
              { icon: "📝", title: "개선대책 이행 후 교육", badge: "완료 후", color: C.green, when: "감소대책 완료 후", prompt: "위험성평가 감소대책 이행 후 교육자료 작성. 포함: 평가결과 요약, 개선조치 상세, 변경된 작업방법, 잔류위험 주의, O/X 퀴즈 5문제. 한국어로." },
              { icon: "🔄", title: "정기 안전교육 (위험성평가 연계)", badge: "정기교육", color: C.amber, when: "월 1회 또는 분기별", prompt: "월례 정기 안전교육자료를 위험성평가 결과와 연계해 작성. 포함: 핵심메시지, 평가결과 복습, 중점 위험요인 교육, TBM 질문 5개. 한국어로." },
              { icon: "👷", title: "신규 채용자 교육", badge: "신규자", color: C.purple, when: "채용 즉시", prompt: "신규 채용자 위험성평가 결과 교육자료 작성. 포함: 현장 소개, 주요위험요인, 보호구 착용법, 절대금지 행위, 비상대응절차, 퀴즈 5문제. 쉽게 한국어로." },
            ].map(edu => (
              <button key={edu.title} onClick={() => { setActiveStep(edu); setStepData({}); setResult(""); setScreen("edu-form"); }} style={{ width: "100%", background: "#fff", border: "2px solid #e2e8f0", borderRadius: 13, padding: "14px 15px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", textAlign: "left" }}>
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
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>최근 {history.length}건</div>
                  <button onClick={async () => { setHistory([]); await saveStorage("eval-history", []); }} style={{ background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>전체삭제</button>
                </div>
                {history.map(h => (
                  <div key={h.id} style={{ background: "#fff", borderRadius: 12, padding: "14px", marginBottom: 8 }}>
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
              </div>
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
              <button onClick={async () => { setBaseConfirmed(true); await saveStorage("company-profile", baseInfo); setShowProfileModal(false); alert("저장됐어요!"); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                💾 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  if (screen === "step-form" && activeStep) {
    const isStep1 = activeStep.id === 1;
    const stepColor = activeStep.color;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <header dangerouslySetInnerHTML={{ __html: `<style>*{box-sizing:border-box;} input:focus{border-color:${stepColor}!important; background:#fff!important;}</style>` }} />
        <Header title={`${activeStep.icon} STEP ${activeStep.id} · ${activeStep.title}`} onBack={() => setScreen("home")} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 14px 32px" }}>
          {!isStep1 && <BaseInfoBanner />}
          {isStep1 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
                🏢 사업장 공통정보
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: `${C.accent}12`, padding: "2px 8px", borderRadius: 20, marginLeft: 6 }}>2~6단계 자동적용</span>
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
            {activeStep.uniqueFields && activeStep.uniqueFields.map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>
                  {f.label} {stepData[f.key] && <span style={{ color: C.green, fontSize: 11, marginLeft: 6 }}>자동완성</span>}
                </label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${stepData[f.key] ? "rgba(34,197,94,0.4)" : "#e2e8f0"}`, fontSize: 13, color: C.navy, outline: "none", background: stepData[f.key] ? "rgba(34,197,94,0.04)" : "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button onClick={async () => { if (isStep1) { setBaseConfirmed(true); await saveStorage("company-profile", baseInfo); } setScreen("step-result"); await callAI(activeStep.prompt); setCompletedSteps(prev => prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${stepColor}, ${stepColor}cc)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
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
              { key: "extra", label: "특이사항/중점내용", placeholder: "예: 최근 아차사고 발생" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={stepData[f.key] || ""} onChange={e => setStepData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: C.navy, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button onClick={async () => { setScreen("step-result"); await callAI(activeStep.prompt); }} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🤖 교육자료 AI 자동 생성</button>
        </div>
      </div>
    );
  }

  if (screen === "step-result" && activeStep) {
    const stepIdx = STEPS.findIndex(s => s.id === activeStep.id);
    const nextStep = STEPS[stepIdx + 1];
    const stepColor = activeStep.color || C.purple;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <header dangerouslySetInnerHTML={{ __html: `<style>*{box-sizing:border-box;} @keyframes pulse{0%,100%{opacity:1;} 50%{opacity:0.4;}}</style>` }} />
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
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
            <div style={{ background: "#fff", borderRadius: 20, padding: "50px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{activeStep.icon || "🎓"}</div>
              <div style={{ color: C.navy, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>AI가 문서를 작성하고 있어요</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>고용노동부 기준으로 생성 중...</div>
              <div style={{ display: "center", justifyContent: "center", gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: stepColor, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.4}s` }} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: `linear-gradient(135deg, ${stepColor}, ${stepColor}cc)`, borderRadius: 14, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✅</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{activeStep.title} 문서 생성 완료!</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>{baseInfo.company || "사업장"} · {new Date().toLocaleDateString("ko-KR")}</div>
                </div>
              </div>
              <button onClick={() => downloadWordDoc(result, activeStep.title, baseInfo)} style={{ width: "100%", padding: "13px", marginBottom: 12, background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📄</span> 워드 문서(.docx) 다운로드
              </button>
              <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
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
                <button onClick={() => { setActiveStep(nextStep); setStepData({}); setResult(results[nextStep.id] || ""); setScreen("step-form"); }} style={{ width: "100%", padding: "14px", marginBottom: 8, background: `linear-gradient(135deg, ${nextStep.color}, ${nextStep.color}cc)`, border: "none", borderRadius: 13, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
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
    </div>
    );
  }

  return null;
}

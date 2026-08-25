import React, { useState, useEffect } from "react";
import Admin from "./Admin";
import MachSafety from "./MachSafety";

// ── 상수 ──────────────────────────────────────────────────────────────────
const C = { navy:"#0f2640", blue:"#1a3a5c", accent:"#0ea5e9", green:"#22c55e", amber:"#f59e0b", red:"#ef4444", purple:"#8b5cf6", slate:"#64748b", bg:"#f0f4f8", siren:"#dc2626" };

const STUDY_PASSWORD = "safety2026!";

const INDUSTRY_SCENARIOS = {
  "건설업":{ accidentCases:[
      {title:"비계 발판 탈락 추락 사망",date:"2024-03",industry:"건설업",severity:"사망",situation:"지상 8m 비계 거푸집 해체 중 발판 탈락으로 추락",cause:"발판 결속 불량 / 안전대 미착용 / 점검 미실시",prevention:"작업 전 비계 점검 의무화 / 안전대 부착설비 설치",keyword:"추락·비계"},
      {title:"이동식크레인 전도 협착 사망",date:"2024-06",industry:"건설업",severity:"사망",situation:"연약지반 철골 양중 중 크레인 전도로 운전원 협착",cause:"아웃트리거 미설치 / 지반 미확인",prevention:"지반조사 후 아웃트리거 전개 / 작업반경 통제",keyword:"협착·크레인"},
      {title:"굴착면 붕괴 매몰 사망",date:"2024-09",industry:"건설업",severity:"사망",situation:"토사 굴착 중 굴착면 붕괴로 2명 매몰",cause:"흙막이 미설치 / 기울기 기준 미준수",prevention:"2m 초과 굴착 시 흙막이 의무 설치",keyword:"붕괴·굴착"},
    ]},
  "제조업":{ accidentCases:[
      {title:"프레스 금형 교체 중 협착 사망",date:"2024-04",industry:"제조업",severity:"사망",situation:"프레스 금형 교체 중 슬라이드 하강으로 손 협착",cause:"안전블록 미삽입 / 방호장치 임의 해제",prevention:"금형 교체 시 안전블록 의무 삽입 / 잠금장치 설치",keyword:"협착·프레스"},
      {title:"도장부스 유기용제 폭발",date:"2024-07",industry:"제조업",severity:"중상",situation:"도장부스 스프레이 도장 중 정전기 점화 폭발",cause:"방폭 조명 미설치 / 국소배기장치 미작동",prevention:"방폭형 전기설비 설치 / 배기장치 가동 확인",keyword:"화재·폭발"},
      {title:"컨베이어 청소 중 끼임 사망",date:"2024-11",industry:"제조업",severity:"사망",situation:"컨베이어 가동 중 청소하다 벨트와 롤러 사이 끼임",cause:"LOTO 미이행 / 정지 규정 없음",prevention:"청소·정비 전 LOTO 의무화",keyword:"끼임·컨베이어"},
    ]},
  "물류·유통업":{ accidentCases:[
      {title:"지게차 후진 중 보행자 충돌 사망",date:"2024-05",industry:"물류·유통업",severity:"사망",situation:"창고 내 지게차 후진 중 보행 근로자 충돌",cause:"차량·보행 통로 미분리 / 후방카메라 미설치",prevention:"통로 완전 분리 / 후방감지센서 설치",keyword:"충돌·지게차"},
      {title:"고층 랙 적재물 낙하 골절",date:"2024-08",industry:"물류·유통업",severity:"중상",situation:"5단 랙 최상단 작업 중 불안정 적재물 낙하",cause:"적재 중량 초과 / 랙 안전핀 미설치",prevention:"최대 하중 표시 준수 / 안전핀 설치 의무화",keyword:"낙하·랙"},
    ]},
  "서비스업":{ accidentCases:[
      {title:"이동식 사다리 전도 추락 사망",date:"2024-06",industry:"서비스업",severity:"사망",situation:"천장 점검 중 이동식 사다리 전도로 추락",cause:"사다리 고정 미실시 / 1인 단독 작업",prevention:"전도방지 고정 의무 / 2인 1조 작업",keyword:"추락·사다리"},
    ]},
  "화학·석유업":{ accidentCases:[
      {title:"밀폐공간 질소 치환 중 질식 사망",date:"2024-03",industry:"화학·석유업",severity:"사망",situation:"탱크 내부 질소 치환 후 산소 미확인 상태로 입장하여 질식",cause:"산소 농도 측정 미실시 / 감시인 미배치",prevention:"진입 전 산소농도 18% 이상 확인 / 감시인 배치",keyword:"질식·밀폐공간"},
      {title:"배관 수리 중 화학물질 누출 화상",date:"2024-10",industry:"화학·석유업",severity:"중상",situation:"운전 중 배관 볼트 조임 작업 중 고압 화학물질 분출",cause:"운전 중 정비 / LOTO 미이행 / 보호복 미착용",prevention:"배관 정비 전 완전 차단 및 LOTO / 보호복 착용 의무",keyword:"누출·화상"},
    ]},
};

const BASE_FIELDS = [
  {key:"company",label:"사업장명",placeholder:"예: OO건설 3공구"},
  {key:"industry",label:"업종",placeholder:"예: 건설업 / 제조업 / 물류업"},
  {key:"workers",label:"근로자수",placeholder:"예: 35명"},
  {key:"manager",label:"안전관리자",placeholder:"예: 홍길동"},
];

const formatSirenText = (c) => `🚨 중대재해 사이렌 — ${c.title}\n\n[업종] ${c.industry} | [일자] ${c.date} | [피해] ${c.severity}\n\n▶ 발생 경위\n${c.situation}\n\n▶ 원인 분석\n${c.cause}\n\n▶ 재발방지 대책\n${c.prevention}\n\n⚠ 지금 당장 현장에 공유하세요!`;

async function saveStorage(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }
async function loadStorage(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } }

// ── 통계 수집 ──────────────────────────────────────────────────────────────
async function trackVisit() {
  try {
    const today = new Date().toLocaleDateString("ko-KR");
    const ts = new Date().toISOString();
    const visits = JSON.parse((await window.storage.get("stat-visits"))?.value||"[]");
    visits.push({ date: today, ts });
    if (visits.length > 1000) visits.splice(0, visits.length - 1000);
    await window.storage.set("stat-visits", JSON.stringify(visits));
  } catch {}
}
async function trackAction(key) {
  try {
    const actions = JSON.parse((await window.storage.get("stat-actions"))?.value||"{}");
    actions[key] = (actions[key]||0) + 1;
    await window.storage.set("stat-actions", JSON.stringify(actions));
  } catch {}
}

// ── ProfileModal ─────────────────────────────────────────────────────────
function ProfileModal({ baseInfo, setBaseInfo, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxWidth:560}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:4}}>🏢 회사 프로필 저장</div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>저장하면 앱을 닫아도 자동 불러와요</div>
        {BASE_FIELDS.map(f=>(
          <div key={f.key} style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>{f.label}</label>
            <input value={baseInfo[f.key]||""} onChange={e=>setBaseInfo(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:14,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
          </div>
        ))}
        <button onClick={onClose} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.navy},${C.blue})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:4}}>💾 저장하기</button>
      </div>
    </div>
  );
}

// ── AccidentFullScreen (메인 기능으로 업그레이드) ──────────────────────────
function AccidentFullScreen({ baseInfo, onBack, onSave }) {
  const [report, setReport] = useState({id:Date.now(),who:"",when:"",where:"",what:"",how:"",why:"",object:"",directCause:"",indirectCause:"",damage:"",improvement:"",aiResult:"",evalLinked:false});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiCopied, setAiCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);

  const SIX_W = [
    {key:"who",icon:"👤",label:"누가",placeholder:"예: 비계 작업반 근로자 홍○○ (경력 2년)"},
    {key:"when",icon:"🕐",label:"언제",placeholder:"예: 2026-05-23 14:30"},
    {key:"where",icon:"📍",label:"어디서",placeholder:"예: 지상 8m 비계 3층 발판 위"},
    {key:"what",icon:"🔧",label:"무엇을",placeholder:"예: 거푸집 해체 작업 중"},
    {key:"how",icon:"💥",label:"어떻게",placeholder:"예: 발판이 탈락하여 지면으로 추락"},
    {key:"why",icon:"❓",label:"왜",placeholder:"예: 발판 결속 불량 상태 미확인"},
  ];

  // 기인물 입력 완료(onBlur) 시 직접원인·간접원인·개선대책 자동 분석
  const autoAnalyzeCauses = async (currentReport) => {
    const obj = currentReport.object || report.object;
    if (!obj || obj.trim().length < 2) return;
    const hasContext = currentReport.how || currentReport.what || currentReport.why || report.how || report.what || report.why;
    if (!hasContext) return;

    setAutoAnalyzing(true);
    const r = {...report, ...currentReport};
    const info = [
      `사업장: ${baseInfo.company||"미입력"} / 업종: ${baseInfo.industry||"미입력"}`,
      `누가: ${r.who||"-"}`, `언제: ${r.when||"-"}`, `어디서: ${r.where||"-"}`,
      `무엇을: ${r.what||"-"}`, `어떻게: ${r.how||"-"}`, `왜: ${r.why||"-"}`,
      `기인물: ${r.object||"-"}`,
    ].join("\n");
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-6", max_tokens:900,
        system:`산업안전 전문가로서 사고 정보를 분석해 아래 3가지만 JSON으로 반환하세요. 반드시 JSON만, 마크다운 없이 반환하세요.
{"directCause":"직접 원인 (불안전한 행동·상태, 2~4줄)","indirectCause":"간접 원인 - 관리적 결함 (교육·감독·시스템 미흡, 2~3줄)","improvement":"개선대책 (번호 매기기, 공학적·관리적·교육적 대책 구분, 4~6가지, 실행 난이도가 낮은 것부터 우선순위 순서로)"}`,
        messages:[{role:"user",content:`다음 사고 정보로 직접원인, 간접원인, 개선대책을 분석하세요:\n\n${info}`}]
      })});
      const d = await res.json();
      const raw = d.content?.map(b=>b.text||"").join("")||"";
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setReport(p=>({
        ...p,
        directCause: parsed.directCause || p.directCause,
        indirectCause: parsed.indirectCause || p.indirectCause,
        improvement: parsed.improvement || p.improvement,
      }));
      setAutoAnalyzed(true);
      setTimeout(()=>setAutoAnalyzed(false), 3000);
    } catch(e) { console.error("자동분석 오류:", e); }
    finally { setAutoAnalyzing(false); }
  };

  const generateAI = async () => {
    setAiLoading(true); setActiveTab("ai");
    const info = [`사업장: ${baseInfo.company||"미입력"} / 업종: ${baseInfo.industry||"미입력"}`,`누가: ${report.who||"-"}`,`언제: ${report.when||"-"}`,`어디서: ${report.where||"-"}`,`무엇을: ${report.what||"-"}`,`어떻게: ${report.how||"-"}`,`왜: ${report.why||"-"}`,`기인물: ${report.object||"-"}`,`직접원인: ${report.directCause||"-"}`,`간접원인: ${report.indirectCause||"-"}`,`피해현황: ${report.damage||"-"}`,`개선대책: ${report.improvement||"-"}`].join("\n");
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1400,system:"고용노동부 산업재해 조사표 기준으로 사고보고서를 작성하세요. 육하원칙 기반 사고경위 서술, 기인물 명시, 직접·간접 원인분석, 재발방지 개선대책(공학적/관리적/교육적 구분, 즉시 실행가능 여부 표시)을 구분하여 전문적이고 명확하게 한국어로 작성하세요. 마지막에 '누구나 이해할 수 있는 핵심 요약 3줄'을 추가하세요.",messages:[{role:"user",content:`다음 정보로 사고보고서를 작성해주세요:\n\n${info}`}]})});
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setAiResult(text);
      setReport(p=>({...p,aiResult:text}));
      trackAction("accident-ai");
    } catch { setAiResult("오류가 발생했습니다. 다시 시도해주세요."); }
    finally { setAiLoading(false); }
  };

  const handleSave = () => {
    if (!report.when && !report.how) { alert("언제(발생일시)와 어떻게(사고경위)는 필수입니다"); return; }
    onSave({...report, aiResult:aiResult||report.aiResult||""});
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <style>{`*{box-sizing:border-box;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
      <div style={{background:`linear-gradient(135deg,${C.red},#b91c1c)`,padding:"14px 16px",position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 뒤로</button>
        <div style={{flex:1,color:"#fff",fontSize:15,fontWeight:700}}>📝 사고보고서 작성</div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>setActiveTab("form")} style={{padding:"5px 10px",borderRadius:7,border:"none",background:activeTab==="form"?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>입력</button>
          <button onClick={()=>setActiveTab("ai")} style={{padding:"5px 10px",borderRadius:7,border:"none",background:activeTab==="ai"?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>AI결과</button>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 16px 100px"}}>
        {activeTab==="form"&&(
          <div>
            <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>📌 사고 경위 — 육하원칙</div>
              {SIX_W.map(f=>(
                <div key={f.key} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div style={{width:42,flexShrink:0,paddingTop:8,textAlign:"center"}}>
                    <div style={{fontSize:18}}>{f.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:C.red,marginTop:1}}>{f.label}</div>
                  </div>
                  <input value={report[f.key]||""} onChange={e=>setReport(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{flex:1,padding:"9px 11px",borderRadius:9,border:`1.5px solid ${report[f.key]?"rgba(239,68,68,0.3)":"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:report[f.key]?"rgba(239,68,68,0.02)":"#f8fafc",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy}}>⚙️ 기인물</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>입력 완료 시 원인·대책 자동분석</div>
              </div>
              <input value={report.object||""} onChange={e=>setReport(p=>({...p,object:e.target.value}))}
                onBlur={e=>{const updated={...report,object:e.target.value};setReport(updated);autoAnalyzeCauses(updated);}}
                placeholder="예: 이동식비계 / 프레스 / 지게차 / LPG 가스"
                style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${report.object?"rgba(245,158,11,0.4)":"#e2e8f0"}`,fontSize:13,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy}}>🔍 원인 분석</div>
                {autoAnalyzing&&(
                  <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.25)",borderRadius:20,padding:"3px 10px"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:C.accent,animation:"pulse 1s ease-in-out infinite"}}/>
                    <span style={{fontSize:11,color:C.accent,fontWeight:700}}>AI 자동분석 중...</span>
                  </div>
                )}
                {autoAnalyzed&&!autoAnalyzing&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:20,padding:"3px 10px"}}>
                    <span style={{fontSize:13}}>✅</span>
                    <span style={{fontSize:11,color:C.green,fontWeight:700}}>자동분석 완료</span>
                  </div>
                )}
              </div>
              {[
                {key:"directCause",label:"직접 원인",placeholder:"예: 발판 결속 불량 / 방호장치 미설치 / 안전대 미착용\n(기인물 입력 후 자동 분석됩니다)",color:C.red,rows:3},
                {key:"indirectCause",label:"간접 원인 (관리적)",placeholder:"예: 작업 전 점검 미실시 / 감독 소홀 / 교육 부족\n(기인물 입력 후 자동 분석됩니다)",color:C.amber,rows:3},
                {key:"damage",label:"피해 현황",placeholder:"예: 요추 골절 1명 / 병원 이송 / 휴업 4주 예상",color:C.slate,rows:2},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <label style={{fontSize:12,fontWeight:700,color:f.color}}>{f.label}</label>
                    {autoAnalyzing&&(f.key==="directCause"||f.key==="indirectCause")&&(
                      <span style={{fontSize:10,color:C.accent,fontWeight:600,animation:"pulse 1s ease-in-out infinite"}}>분석 중...</span>
                    )}
                    {autoAnalyzed&&!autoAnalyzing&&(f.key==="directCause"||f.key==="indirectCause")&&report[f.key]&&(
                      <span style={{fontSize:10,color:C.green,fontWeight:600,background:"rgba(34,197,94,0.1)",padding:"1px 6px",borderRadius:6}}>AI 자동입력</span>
                    )}
                  </div>
                  <textarea value={report[f.key]||""} onChange={e=>setReport(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder} rows={f.rows}
                    style={{width:"100%",padding:"9px 11px",borderRadius:9,
                      border:`1.5px solid ${autoAnalyzed&&!autoAnalyzing&&(f.key==="directCause"||f.key==="indirectCause")&&report[f.key]?"rgba(34,197,94,0.35)":report[f.key]?f.color+"30":"#e2e8f0"}`,
                      fontSize:12,color:C.navy,outline:"none",
                      background:autoAnalyzed&&!autoAnalyzing&&(f.key==="directCause"||f.key==="indirectCause")&&report[f.key]?"rgba(34,197,94,0.02)":"#f8fafc",
                      boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy}}>✅ 개선대책</div>
                {autoAnalyzing&&<span style={{fontSize:10,color:C.accent,fontWeight:600,animation:"pulse 1s ease-in-out infinite"}}>분석 중...</span>}
                {autoAnalyzed&&!autoAnalyzing&&report.improvement&&(
                  <span style={{fontSize:10,color:C.green,fontWeight:600,background:"rgba(34,197,94,0.1)",padding:"1px 6px",borderRadius:6}}>AI 자동입력</span>
                )}
              </div>
              <textarea value={report.improvement||""} onChange={e=>setReport(p=>({...p,improvement:e.target.value}))}
                placeholder={"예:\n1. [공학적] 안전대 부착설비 설치\n2. [관리적] 작업 전 비계 점검 의무화\n3. [교육적] 관리감독자 상주 교육\n(기인물 입력 후 자동 분석됩니다)"}
                rows={5} style={{width:"100%",padding:"9px 12px",borderRadius:9,
                  border:`1.5px solid ${autoAnalyzed&&!autoAnalyzing&&report.improvement?"rgba(34,197,94,0.4)":report.improvement?"rgba(34,197,94,0.4)":"#e2e8f0"}`,
                  fontSize:12,color:C.navy,outline:"none",
                  background:autoAnalyzed&&!autoAnalyzing&&report.improvement?"rgba(34,197,94,0.02)":"#f8fafc",
                  boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
            </div>
            <button onClick={generateAI} disabled={aiLoading} style={{width:"100%",padding:"14px",background:aiLoading?"rgba(15,38,64,0.3)":`linear-gradient(135deg,${C.navy},${C.blue})`,border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {aiLoading?"⏳ AI 보고서 작성 중...":"🤖 AI 보고서 자동완성"}
            </button>
          </div>
        )}
        {activeTab==="ai"&&(
          <div>
            {aiLoading?(
              <div style={{background:"#fff",borderRadius:16,padding:"50px 20px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>📝</div>
                <div style={{color:C.navy,fontWeight:800,fontSize:15,marginBottom:6}}>AI가 보고서를 작성하고 있어요</div>
                <div style={{color:"#94a3b8",fontSize:13}}>산업재해 조사표 기준으로 작성 중...</div>
              </div>
            ):aiResult?(
              <div>
                <div style={{background:"#fff",borderRadius:14,overflow:"hidden",marginBottom:12}}>
                  <div style={{background:`linear-gradient(135deg,${C.red},#b91c1c)`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{color:"#fff",fontWeight:700,fontSize:13}}>📝 AI 사고보고서</div>
                    <button onClick={()=>{navigator.clipboard.writeText(aiResult).then(()=>{setAiCopied(true);setTimeout(()=>setAiCopied(false),2000)});}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:7,padding:"5px 11px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{aiCopied?"✅ 복사됨":"📋 복사"}</button>
                  </div>
                  <div style={{padding:"16px"}}><pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:12,lineHeight:1.8,color:"#374151",margin:0,fontFamily:"'Noto Sans KR',sans-serif"}}>{aiResult}</pre></div>
                </div>
                <button onClick={()=>{
                  const printContent=`<html><head><meta charset="utf-8"><style>body{font-family:'맑은 고딕',sans-serif;padding:24px;font-size:13px;}h2{text-align:center;border-bottom:2px solid #b91c1c;padding-bottom:8px;color:#7f1d1d;}pre{white-space:pre-wrap;font-size:13px;line-height:1.9;}.info{display:flex;gap:16px;background:#fef2f2;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:12px;flex-wrap:wrap;}</style></head><body><h2>📝 사고보고서</h2><div class="info"><span>🏢 ${baseInfo.company||"사업장명"}</span><span>🏭 ${baseInfo.industry||"업종"}</span><span>📅 ${new Date().toLocaleDateString("ko-KR")}</span></div><pre>${aiResult}</pre></body></html>`;
                  const w=window.open("","_blank","width=800,height=700");
                  w.document.write(printContent); w.document.close(); w.focus();
                  setTimeout(()=>{w.print();},300); trackAction("accident-pdf");
                }} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>🖨️ PDF 저장</button>
                <button onClick={()=>setActiveTab("form")} style={{width:"100%",padding:"12px",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:10}}>← 내용 수정</button>
              </div>
            ):(
              <div style={{textAlign:"center",padding:"50px 0",color:"#94a3b8"}}>
                <div style={{fontSize:36,marginBottom:10}}>📝</div>
                <div style={{fontWeight:600}}>AI 보고서가 여기에 표시돼요</div>
                <div style={{fontSize:12,marginTop:6}}>입력 탭에서 정보 입력 후 AI 자동완성을 눌러주세요</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px 28px",background:"rgba(255,255,255,0.96)",backdropFilter:"blur(8px)",borderTop:"1px solid #e2e8f0"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <button onClick={handleSave} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.red},#b91c1c)`,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>💾 사고보고서 저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 기술사 학습 비밀번호 게이트 ─────────────────────────────────────────
function StudyGate({ onSuccess, onBack }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const check = () => {
    if (pw === STUDY_PASSWORD) onSuccess();
    else { setError(true); setTimeout(()=>setError(false), 2000); }
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",width:"100%",maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",marginBottom:16}}>← 뒤로</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🔐</div>
          <div style={{fontSize:17,fontWeight:800,color:C.navy}}>기계안전기술사 학습</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>비공개 학습 전용 공간</div>
        </div>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setError(false);}} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="비밀번호"
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${error?"#ef4444":"#e2e8f0"}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12,color:C.navy}}/>
        {error&&<div style={{color:"#ef4444",fontSize:12,marginBottom:8,textAlign:"center"}}>비밀번호가 틀렸어요</div>}
        <button onClick={check} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.purple},#6d28d9)`,border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>입장하기</button>
      </div>
    </div>
  );
}

// ── 메인 App ──────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [baseInfo, setBaseInfo] = useState({company:"",industry:"",workers:"",manager:""});
  const [baseConfirmed, setBaseConfirmed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sirenIndustry, setSirenIndustry] = useState(null);
  const [sirenCopied, setSirenCopied] = useState(null);
  const [accidentReports, setAccidentReports] = useState([]);
  const [lastSavedAccident, setLastSavedAccident] = useState(null);
  const [studyAuthed, setStudyAuthed] = useState(false);
  const [homeTab, setHomeTab] = useState("accident");

  useEffect(()=>{
    trackVisit();
    if(window.location.pathname==="/admin") { setScreen("admin"); return; }
    (async()=>{
      const p=await loadStorage("company-profile"); if(p){setBaseInfo(p);setBaseConfirmed(true);}
      const ar=await loadStorage("accident-reports"); if(ar) setAccidentReports(ar);
    })();
  },[]);

  const getSirenCases=()=>{
    if(sirenIndustry) return INDUSTRY_SCENARIOS[sirenIndustry]?.accidentCases||[];
    if(baseInfo.industry){const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업",""));if(mk) return INDUSTRY_SCENARIOS[mk]?.accidentCases||[];}
    return Object.values(INDUSTRY_SCENARIOS).flatMap(s=>s.accidentCases||[]);
  };

  const saveAccidentReport=async(report)=>{
    const isEdit=accidentReports.some(r=>r.id===report.id);
    const updated=isEdit?accidentReports.map(r=>r.id===report.id?report:r):[report,...accidentReports];
    setAccidentReports(updated); await saveStorage("accident-reports",updated);
  };
  const deleteAccidentReport=async(id)=>{const updated=accidentReports.filter(r=>r.id!==id);setAccidentReports(updated);await saveStorage("accident-reports",updated);};

  // ── 관리자 화면 ──────────────────────────────────────────────────────
  if(screen==="admin") return <Admin />;

  // ── 기술사 학습 (비밀번호 보호) ────────────────────────────────────
  if(screen==="study") {
    if(!studyAuthed) return <StudyGate onSuccess={()=>setStudyAuthed(true)} onBack={()=>setScreen("landing")} />;
    return <MachSafety onBack={()=>setScreen("landing")} />;
  }

  // ── 랜딩 ────────────────────────────────────────────────────────────
  if(screen==="landing") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:`linear-gradient(160deg,${C.navy},${C.blue})`,padding:"44px 20px 32px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>⚠️</div>
        <div style={{color:"#fff",fontSize:21,fontWeight:800,marginBottom:6}}>산업안전 AI 시스템</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,lineHeight:1.7}}>누구나 쉽게 작성하는<br/>사고보고서 · 개선안 도출</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"28px 16px"}}>
        <button onClick={()=>setScreen("accident-form")} style={{width:"100%",background:"#fff",borderRadius:18,padding:"24px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:18,cursor:"pointer",textAlign:"left",border:`2px solid ${C.red}20`,boxShadow:"0 4px 24px rgba(239,68,68,0.1)"}}>
          <div style={{width:64,height:64,borderRadius:18,background:`linear-gradient(135deg,${C.red},#b91c1c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>📝</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:5}}>사고보고서 작성</div>
            <div style={{fontSize:12,color:C.slate,lineHeight:1.65,marginBottom:8}}>육하원칙 입력 → AI 원인분석 → 개선안 자동완성</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["무료","AI 자동분석","공학·관리·교육 대책"].map(t=><span key={t} style={{fontSize:10,fontWeight:700,color:C.red,background:`${C.red}08`,padding:"2px 8px",borderRadius:20}}>{t}</span>)}</div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:24}}>›</div>
        </button>

        <button onClick={()=>{setHomeTab("accident");setScreen("home");}} style={{width:"100%",background:"#fff",borderRadius:18,padding:"18px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left",border:"2px solid #e2e8f0",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
          <div style={{width:50,height:50,borderRadius:14,background:`${C.accent}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📋</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:C.navy}}>보고서 이력 · 중대재해 사례</div>
            <div style={{fontSize:11,color:C.slate,marginTop:2}}>저장된 보고서 확인 및 동종업계 사고사례</div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:22}}>›</div>
        </button>

        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <button onClick={()=>setShowProfileModal(true)} style={{flex:1,padding:"14px 4px",background:"#fff",border:`1.5px solid ${C.green}15`,borderRadius:12,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>🏢</div>
            <div style={{fontSize:10,fontWeight:700,color:C.green}}>{baseConfirmed?(baseInfo.company||"").slice(0,6)||"프로필":"프로필"}</div>
          </button>
          <button onClick={()=>setScreen("study")} style={{flex:1,padding:"14px 4px",background:"#fff",border:`1.5px solid ${C.purple}15`,borderRadius:12,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>🔐</div>
            <div style={{fontSize:10,fontWeight:700,color:C.purple}}>기술사 학습</div>
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:11,color:"#cbd5e1",lineHeight:1.7}}>산업안전보건법 기준 · 누구나 무료 사용</div>
      </div>
      {showProfileModal&&<ProfileModal baseInfo={baseInfo} setBaseInfo={setBaseInfo} onClose={async()=>{setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);setShowProfileModal(false);}}/>}
    </div>
  );

  // ── 사고보고서 작성 화면 ──────────────────────────────────────────────
  if(screen==="accident-form") return (
    <AccidentFullScreen baseInfo={baseInfo} onBack={()=>setScreen("landing")} onSave={async(report)=>{await saveAccidentReport(report);setLastSavedAccident(report);setScreen("accident-done");}}/>
  );

  // ── 사고보고서 완료 화면 ──────────────────────────────────────────────
  if(screen==="accident-done"&&lastSavedAccident) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:`linear-gradient(135deg,${C.red},#b91c1c)`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setScreen("landing")} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 홈</button>
        <div style={{color:"#fff",fontSize:15,fontWeight:700}}>📝 사고보고서 저장 완료</div>
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:"20px",marginBottom:14,textAlign:"center",border:`2px solid ${C.green}25`}}>
          <div style={{fontSize:44,marginBottom:10}}>✅</div>
          <div style={{fontSize:16,fontWeight:800,color:C.navy,marginBottom:4}}>사고보고서가 저장됐어요</div>
          <div style={{fontSize:12,color:C.slate,lineHeight:1.6}}>{lastSavedAccident.when} · {lastSavedAccident.where}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginTop:6}}>{lastSavedAccident.what||lastSavedAccident.how?.slice(0,30)||""}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setScreen("home");setHomeTab("accident");}} style={{flex:1,padding:"14px",background:`linear-gradient(135deg,${C.accent},#0284c7)`,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>📋 보고서 목록</button>
          <button onClick={()=>setScreen("accident-form")} style={{flex:1,padding:"14px",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer"}}>+ 새 보고서</button>
        </div>
        <button onClick={()=>setScreen("landing")} style={{width:"100%",marginTop:8,padding:"12px",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer"}}>🏠 홈으로</button>
      </div>
    </div>
  );

  // ── 홈 (보고서 이력 + 사이렌) ──────────────────────────────────────
  if(screen==="home"){
    const sirenCases=getSirenCases();
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"16px 16px 12px"}}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <button onClick={()=>setScreen("landing")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"5px 9px",color:"#fff",fontSize:12,cursor:"pointer"}}>🏠</button>
              <div style={{color:"#fff",fontSize:15,fontWeight:800,flex:1}}>산업안전 AI</div>
              <button onClick={()=>setScreen("accident-form")} style={{padding:"6px 12px",background:`linear-gradient(135deg,${C.red},#b91c1c)`,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 사고등록</button>
            </div>
            <div style={{display:"flex",background:"rgba(255,255,255,0.1)",borderRadius:11,padding:3,gap:2}}>
              {[{k:"accident",l:"📝 보고서"},{k:"siren",l:"🚨 사이렌"}].map(t=>(
                <button key={t.k} onClick={()=>setHomeTab(t.k)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:homeTab===t.k?"#fff":"transparent",color:homeTab===t.k?C.navy:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.l}</button>
              ))}
            </div>
          </div>
        </div>

        {homeTab==="accident"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"14px 14px 28px"}}>
            {accidentReports.length===0?(
              <div style={{textAlign:"center",padding:"50px 0",background:"#fff",borderRadius:14,border:"2px dashed #e2e8f0"}}>
                <div style={{fontSize:40,marginBottom:10}}>📋</div>
                <div style={{fontSize:14,color:"#94a3b8",fontWeight:600}}>등록된 사고보고서가 없어요</div>
                <div style={{fontSize:12,color:"#cbd5e1",marginTop:4,marginBottom:16}}>사고 발생 시 즉시 등록하고 AI 개선안을 받아보세요</div>
                <button onClick={()=>setScreen("accident-form")} style={{padding:"11px 24px",background:`linear-gradient(135deg,${C.red},#b91c1c)`,border:"none",borderRadius:11,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ 사고보고서 작성</button>
              </div>
            ):accidentReports.map(r=>(
              <div key={r.id} style={{background:"#fff",borderRadius:13,padding:"14px",marginBottom:10,border:"2px solid rgba(239,68,68,0.12)",borderLeft:`4px solid ${C.red}`}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:C.slate}}>{r.when}</span><span style={{fontSize:11,color:C.slate}}>· {r.where}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:3}}>{r.what||"작업내용 미입력"}</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.4}}>{r.how?.slice(0,60)}{(r.how?.length||0)>60?"...":""}</div>
                {r.improvement&&(
                  <div style={{background:"rgba(34,197,94,0.06)",borderRadius:9,padding:"9px 11px",marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.green,marginBottom:3}}>✅ 개선대책</div>
                    <div style={{fontSize:11,color:"#374151",lineHeight:1.5}}>{r.improvement.slice(0,100)}{r.improvement.length>100?"...":""}</div>
                  </div>
                )}
                <button onClick={()=>deleteAccidentReport(r.id)} style={{padding:"7px 12px",background:"none",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,color:C.red,fontSize:12,cursor:"pointer"}}>🗑️ 삭제</button>
              </div>
            ))}
          </div>
        )}

        {homeTab==="siren"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"14px 14px 28px"}}>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              <button onClick={()=>setSirenIndustry(null)} style={{padding:"5px 11px",borderRadius:8,border:"none",background:!sirenIndustry?C.siren:"#e2e8f0",color:!sirenIndustry?"#fff":C.slate,fontSize:11,fontWeight:700,cursor:"pointer"}}>전체</button>
              {Object.keys(INDUSTRY_SCENARIOS).map(ind=><button key={ind} onClick={()=>setSirenIndustry(ind)} style={{padding:"5px 11px",borderRadius:8,border:"none",background:sirenIndustry===ind?C.siren:"#e2e8f0",color:sirenIndustry===ind?"#fff":C.slate,fontSize:11,fontWeight:700,cursor:"pointer"}}>{ind}</button>)}
            </div>
            {sirenCases.map((c,i)=>(
              <div key={i} style={{background:"#fff",border:"2px solid rgba(220,38,38,0.1)",borderLeft:`4px solid ${C.siren}`,borderRadius:14,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",gap:5,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#fff",background:C.siren,padding:"2px 8px",borderRadius:20}}>{c.severity}</span>
                  <span style={{fontSize:10,fontWeight:700,color:C.siren,background:"rgba(220,38,38,0.08)",padding:"2px 8px",borderRadius:20}}>{c.keyword}</span>
                  <span style={{fontSize:10,color:C.slate}}>{c.date} · {c.industry}</span>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:C.navy,marginBottom:8}}>{c.title}</div>
                <div style={{marginBottom:6}}><div style={{fontSize:11,fontWeight:700,color:C.siren,marginBottom:2}}>🔴 발생 경위</div><div style={{fontSize:12,color:"#374151",lineHeight:1.5,background:"rgba(220,38,38,0.04)",padding:"7px 9px",borderRadius:7}}>{c.situation}</div></div>
                <div style={{marginBottom:6}}><div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:2}}>⚠️ 원인</div><div style={{fontSize:12,color:"#374151",lineHeight:1.5,background:"rgba(245,158,11,0.05)",padding:"7px 9px",borderRadius:7}}>{c.cause}</div></div>
                <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:2}}>✅ 재발방지</div><div style={{fontSize:12,color:"#374151",lineHeight:1.5,background:"rgba(34,197,94,0.05)",padding:"7px 9px",borderRadius:7}}>{c.prevention}</div></div>
                <button onClick={()=>{navigator.clipboard.writeText(formatSirenText(c)).then(()=>{setSirenCopied(i);setTimeout(()=>setSirenCopied(null),2000);trackAction("siren-copy")});}} style={{width:"100%",padding:"10px",background:sirenCopied===i?"linear-gradient(135deg,#166534,#15803d)":`linear-gradient(135deg,${C.siren},#b91c1c)`,border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {sirenCopied===i?"✅ 복사 완료! 카톡/문자로 공유하세요":"📋 전체 복사 · 즉시 현장 공유"}
                </button>
              </div>
            ))}
          </div>
        )}
        {showProfileModal&&<ProfileModal baseInfo={baseInfo} setBaseInfo={setBaseInfo} onClose={async()=>{setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);setShowProfileModal(false);}}/>}
      </div>
    );
  }

  return null;
}

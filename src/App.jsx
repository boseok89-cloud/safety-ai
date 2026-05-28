import React, { useState, useEffect } from "react";

// ── 상수 ──────────────────────────────────────────────────────────────────
const C = { navy:"#0f2640", blue:"#1a3a5c", accent:"#0ea5e9", green:"#22c55e", amber:"#f59e0b", red:"#ef4444", purple:"#8b5cf6", slate:"#64748b", bg:"#f0f4f8", siren:"#dc2626" };

const INDUSTRY_SCENARIOS = {
  "건설업":{ workTypes:["고소작업(비계/거푸집)","굴착/토공작업","철근/콘크리트 타설","중량물 양중작업","해체작업"], equipments:["타워크레인","이동식크레인","지게차","고소작업대","굴착기"], materials:["시멘트","철근","LPG/산소(용접)","유기용제","방수재"], hazards:["추락(고소작업)","협착(중장비)","낙하·비래","붕괴·도괴","감전","화재·폭발"], envFactors:["협소한 작업공간","고온·다습 환경","소음·진동","야간작업","바닥 불균형"],
    accidentCases:[
      {title:"비계 발판 탈락 추락 사망",date:"2024-03",industry:"건설업",severity:"사망",situation:"지상 8m 비계 거푸집 해체 중 발판 탈락으로 추락",cause:"발판 결속 불량 / 안전대 미착용 / 점검 미실시",prevention:"작업 전 비계 점검 의무화 / 안전대 부착설비 설치",keyword:"추락·비계"},
      {title:"이동식크레인 전도 협착 사망",date:"2024-06",industry:"건설업",severity:"사망",situation:"연약지반 철골 양중 중 크레인 전도로 운전원 협착",cause:"아웃트리거 미설치 / 지반 미확인",prevention:"지반조사 후 아웃트리거 전개 / 작업반경 통제",keyword:"협착·크레인"},
      {title:"굴착면 붕괴 매몰 사망",date:"2024-09",industry:"건설업",severity:"사망",situation:"토사 굴착 중 굴착면 붕괴로 2명 매몰",cause:"흙막이 미설치 / 기울기 기준 미준수",prevention:"2m 초과 굴착 시 흙막이 의무 설치",keyword:"붕괴·굴착"},
    ]},
  "제조업":{ workTypes:["프레스/절단 작업","용접·용단 작업","도장·도금 작업","컨베이어 작업","화학물질 취급"], equipments:["프레스","선반/밀링","지게차","컨베이어","산업용 로봇"], materials:["유기용제(신너/아세톤)","도료","산·알칼리","윤활유","압축가스"], hazards:["협착·끼임(프레스)","절단·베임","화재·폭발(도장)","화학물질 노출","근골격계 질환","소음"], envFactors:["고온 작업환경","소음 85dB 초과","분진 발생","환기 불량","조명 부족"],
    accidentCases:[
      {title:"프레스 금형 교체 중 협착 사망",date:"2024-04",industry:"제조업",severity:"사망",situation:"프레스 금형 교체 중 슬라이드 하강으로 손 협착",cause:"안전블록 미삽입 / 방호장치 임의 해제",prevention:"금형 교체 시 안전블록 의무 삽입 / 잠금장치 설치",keyword:"협착·프레스"},
      {title:"도장부스 유기용제 폭발",date:"2024-07",industry:"제조업",severity:"중상",situation:"도장부스 스프레이 도장 중 정전기 점화 폭발",cause:"방폭 조명 미설치 / 국소배기장치 미작동",prevention:"방폭형 전기설비 설치 / 배기장치 가동 확인",keyword:"화재·폭발"},
      {title:"컨베이어 청소 중 끼임 사망",date:"2024-11",industry:"제조업",severity:"사망",situation:"컨베이어 가동 중 청소하다 벨트와 롤러 사이 끼임",cause:"LOTO 미이행 / 정지 규정 없음",prevention:"청소·정비 전 LOTO 의무화",keyword:"끼임·컨베이어"},
    ]},
  "물류·유통업":{ workTypes:["지게차 운전","수작업 하역","랙 입출고","상하차 작업","저온창고 작업"], equipments:["지게차","전동 파렛트 트럭","컨베이어 벨트","랙 시스템"], materials:["위험물(배터리·화학품)","중량 화물","냉매"], hazards:["지게차 충돌·전도","낙하(적재물)","요통(중량물)","저온 노출","미끄러짐"], envFactors:["좁은 통로","저온·냉동 환경","소음","야간 작업","바닥 오염"],
    accidentCases:[
      {title:"지게차 후진 중 보행자 충돌 사망",date:"2024-05",industry:"물류·유통업",severity:"사망",situation:"창고 내 지게차 후진 중 보행 근로자 충돌",cause:"차량·보행 통로 미분리 / 후방카메라 미설치",prevention:"통로 완전 분리 / 후방감지센서 설치",keyword:"충돌·지게차"},
      {title:"고층 랙 적재물 낙하 골절",date:"2024-08",industry:"물류·유통업",severity:"중상",situation:"5단 랙 최상단 작업 중 불안정 적재물 낙하",cause:"적재 중량 초과 / 랙 안전핀 미설치",prevention:"최대 하중 표시 준수 / 안전핀 설치 의무화",keyword:"낙하·랙"},
    ]},
  "서비스업":{ workTypes:["전기 설비 점검","시설 유지보수","청소·위생관리","엘리베이터 작업"], equipments:["사다리","전동공구","청소 장비","승강기"], materials:["세정제·소독제","윤활제"], hazards:["추락(사다리)","감전(전기작업)","미끄러짐","화학물질 노출"], envFactors:["습기 많은 환경","좁은 공간","조명 불량","고온 환경"],
    accidentCases:[
      {title:"이동식 사다리 전도 추락 사망",date:"2024-06",industry:"서비스업",severity:"사망",situation:"천장 점검 중 이동식 사다리 전도로 추락",cause:"사다리 고정 미실시 / 1인 단독 작업",prevention:"전도방지 고정 의무 / 2인 1조 작업",keyword:"추락·사다리"},
    ]},
  "화학·석유업":{ workTypes:["화학물질 이송·충전","반응기 운전","밀폐공간 작업","배관 정비","폐수 처리"], equipments:["반응기","탱크로리","컴프레셔","펌프·밸브","배관설비"], materials:["인화성 액체","독성 가스","산·알칼리","고압 증기","폭발성 물질"], hazards:["화재·폭발","독성 물질 누출","밀폐공간 질식","고압 분출","화상"], envFactors:["고온·고압 환경","밀폐 공간","독성가스 잠재","환기 불량"],
    accidentCases:[
      {title:"밀폐공간 질소 치환 중 질식 사망",date:"2024-03",industry:"화학·석유업",severity:"사망",situation:"탱크 내부 질소 치환 후 산소 미확인 상태로 입장하여 질식",cause:"산소 농도 측정 미실시 / 감시인 미배치",prevention:"진입 전 산소농도 18% 이상 확인 / 감시인 배치",keyword:"질식·밀폐공간"},
      {title:"배관 수리 중 화학물질 누출 화상",date:"2024-10",industry:"화학·석유업",severity:"중상",situation:"운전 중 배관 볼트 조임 작업 중 고압 화학물질 분출",cause:"운전 중 정비 / LOTO 미이행 / 보호복 미착용",prevention:"배관 정비 전 완전 차단 및 LOTO / 보호복 착용 의무",keyword:"누출·화상"},
    ]},
};

const DOCUMENT_TEMPLATES = [
  {id:"standard",icon:"📋",name:"고용노동부 표준 양식",desc:"고시 제2024-76호 기준 6단계 표준 양식",color:"#0ea5e9",tags:["법정 기준","전 업종"]},
  {id:"construction",icon:"🏗️",name:"건설업 전용 양식",desc:"고소작업·중장비·굴착 등 건설 현장 특화",color:"#f59e0b",tags:["건설업","고소작업","중장비"]},
  {id:"manufacturing",icon:"🏭",name:"제조업 전용 양식",desc:"프레스·화학물질·컨베이어 등 제조 현장 특화",color:"#ef4444",tags:["제조업","기계작업","화학물질"]},
  {id:"small",icon:"🏪",name:"소규모 사업장 간이 양식",desc:"50인 미만 소규모 사업장용 간소화 양식",color:"#22c55e",tags:["소규모","간이","50인 미만"]},
  {id:"logistics",icon:"🚛",name:"물류·유통업 전용 양식",desc:"지게차·하역·보관 등 물류 현장 특화",color:"#8b5cf6",tags:["물류","지게차","하역"]},
];

const BASE_FIELDS = [
  {key:"company",label:"사업장명",placeholder:"예: OO건설 3공구"},
  {key:"industry",label:"업종",placeholder:"예: 건설업 / 제조업 / 물류업"},
  {key:"workers",label:"근로자수",placeholder:"예: 35명"},
  {key:"manager",label:"안전관리자",placeholder:"예: 홍길동"},
];

const STEPS = [
  {id:1,icon:"📁",title:"사전준비",subtitle:"평가팀 구성 및 기준 설정",color:"#0ea5e9",
    uniqueFields:[
      {key:"evalType",label:"평가종류",placeholder:"예: 최초평가 / 정기평가 / 수시평가"},
      {key:"evalDate",label:"평가일자",placeholder:"예: 2026-05-06"},
      {key:"evalTeam",label:"평가팀 구성",placeholder:"예: 안전관리자, 관리감독자, 근로자 대표"},
      {key:"riskMatrix",label:"위험성 판단 기준",placeholder:"예: 가능성×중대성 9칸 매트릭스"},
    ],
    prompt:"고용노동부 고시 제2024-76호 기준 위험성평가 사전준비 단계 문서 작성. 포함: 사업장 기본정보, 법적근거(산업안전보건법 제36조), 평가팀 구성 및 역할, 가능성×중대성 위험성 판단 기준 매트릭스(3×3), 수집자료 목록, 평가일정. 전문적으로 한국어로."},
  {id:2,icon:"🔍",title:"유해·위험요인 파악",subtitle:"공정별 위험 시나리오 도출",color:"#f59e0b",
    uniqueFields:[],multiSheet:true,hasScenario:true,
    prompt:"고용노동부 고시 제2024-76호 기준 유해·위험요인 파악 단계 문서 작성. 포함: 공정/작업 개요, 기인물별 위험 시나리오 목록표(6개 이상) - [작업상황→기인물→위험요인→예상 재해유형] 형식, 유형별 분류(기계적/화학적/물리적/인간공학적/작업환경적), 작업장 환경요인(온도·소음·조명·환기·공간) 별도 분석표, 현재 안전조치 현황. 전문적으로 한국어로."},
  {id:3,icon:"⚖️",title:"위험성 결정",subtitle:"시나리오별 가능성×중대성 평가",color:"#ef4444",
    uniqueFields:[
      {key:"hazards",label:"STEP2에서 도출된 주요 위험 시나리오",placeholder:"업종 시나리오 선택 또는 STEP2 결과 입력"},
      {key:"method",label:"위험성 추정 방법",placeholder:"예: 빈도·강도법(가능성×중대성)"},
      {key:"acceptableCriteria",label:"허용 가능 위험성 기준",placeholder:"예: 4이상=허용불가, 3=조건부, 2이하=허용"},
    ],
    hasScenario:true,
    prompt:"고용노동부 고시 제2024-76호 기준 위험성 결정 단계 문서 작성. 핵심: 각 위험 시나리오별로 (1)가능성(상3/중2/하1) (2)중대성(상3/중2/하1) (3)위험성=가능성×중대성 (4)허용여부 표 작성. 포함: 위험성 결정 매트릭스표, 시나리오별 결정 근거, 허용불가 위험성 목록, 중대성 판단기준. 전문적으로 한국어로."},
  {id:4,icon:"🛡️",title:"감소대책 수립·실행",subtitle:"위험성 제거 및 저감 조치",color:"#22c55e",
    uniqueFields:[
      {key:"highRisks",label:"허용불가 위험요인",placeholder:"예: 추락(상), 협착(상), 감전(중)"},
      {key:"budget",label:"개선 가용예산",placeholder:"예: 약 500만원"},
      {key:"deadline",label:"조치 완료기한",placeholder:"예: 2026-06-30"},
      {key:"responsible",label:"조치 책임자",placeholder:"예: 현장소장 김○○"},
    ],
    prompt:"고용노동부 고시 제2024-76호 기준 위험성 감소대책 수립·실행 단계 문서 작성. 포함: 감소대책 우선순위원칙, 위험요인별 실행계획표, 단기/중장기 조치, 개선전후 위험성 비교, 잔류위험 관리. 실용적으로 한국어로."},
  {id:5,icon:"📢",title:"위험성평가 공유",subtitle:"근로자 주지 및 교육",color:"#8b5cf6",
    uniqueFields:[
      {key:"shareMethod",label:"공유 방법",placeholder:"예: 조회시간 교육, 게시판 부착"},
      {key:"shareDate",label:"공유 일자",placeholder:"예: 2026-05-10"},
      {key:"keyPoints",label:"강조할 핵심 위험요인",placeholder:"예: 추락, 협착, 화재"},
    ],
    prompt:"고용노동부 고시 제2024-76호 기준 위험성평가 공유 단계 문서 작성. 포함: 공유목적/법적근거, 핵심위험요인 요약, 현장게시용 안전수칙 5가지, 근로자 의견수렴, 서명란. 한국어로."},
  {id:6,icon:"📂",title:"기록 및 보존",subtitle:"3년 보존 의무 문서 완성",color:"#64748b",
    uniqueFields:[
      {key:"evalPeriod",label:"평가 기간",placeholder:"예: 2026-05-01 ~ 2026-05-10"},
      {key:"totalHazards",label:"총 위험요인 수",placeholder:"예: 15개"},
      {key:"highCount",label:"고위험(상) 건수",placeholder:"예: 3건"},
      {key:"midCount",label:"중위험(중) 건수",placeholder:"예: 7건"},
      {key:"lowCount",label:"저위험(하) 건수",placeholder:"예: 5건"},
      {key:"nextEval",label:"다음 평가 예정일",placeholder:"예: 2027-05-01"},
    ],
    prompt:"고용노동부 고시 제2024-76호 기준 위험성평가 기록 및 보존 단계 문서 작성. 포함: 최종결과 요약(통계), 법정보존서류 목록(시행규칙 제37조), 보존방법/기간(3년), 총평, 수시평가 기준, 다음 정기평가 계획, 서명란. 한국어로."},
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

// ── ResultViewer ──────────────────────────────────────────────────────────
function ResultViewer({ text, color }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const lines = text.split("\n");
  const sections = [];
  let cur = null;
  lines.forEach(line => {
    const isH = line.startsWith("#") || (line.match(/^[■□▶◆●\d]+[\.\s]/) && line.length < 60 && line.trim().length > 2);
    if (isH) { if (cur) sections.push(cur); cur = { title: line.replace(/^#+\s*/,"").replace(/\*\*/g,"").trim(), lines:[] }; }
    else if (cur) cur.lines.push(line);
    else { if (!sections.length) sections.push({title:null,lines:[]}); sections[0].lines.push(line); }
  });
  if (cur) sections.push(cur);
  if (!sections.length) return <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:13,lineHeight:1.8,color:"#1e293b",margin:0,fontFamily:"'Noto Sans KR',sans-serif"}}>{text}</pre>;
  return (
    <div>
      {sections.map((sec,i) => {
        const secText = (sec.title?sec.title+"\n":"")+sec.lines.join("\n");
        return (
          <div key={i} style={{marginBottom:12,borderRadius:10,border:`1px solid ${color}20`,overflow:"hidden"}}>
            {sec.title && (
              <div style={{background:`${color}12`,borderBottom:`1px solid ${color}20`,padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:700,color}}>{sec.title}</span>
                <button onClick={()=>{navigator.clipboard.writeText(secText).then(()=>{setCopiedIdx(i);setTimeout(()=>setCopiedIdx(null),1800);});}} style={{background:copiedIdx===i?`${C.green}20`:`${color}15`,border:`1px solid ${copiedIdx===i?C.green:color}30`,borderRadius:6,padding:"3px 9px",color:copiedIdx===i?C.green:color,fontSize:11,fontWeight:700,cursor:"pointer"}}>{copiedIdx===i?"✓ 복사됨":"복사"}</button>
              </div>
            )}
            <div style={{padding:"12px 14px",background:"#fff"}}>
              <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:12,lineHeight:1.8,color:"#374151",margin:0,fontFamily:"'Noto Sans KR',sans-serif"}}>{sec.lines.join("\n").trim()}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── StepResultScreen ──────────────────────────────────────────────────────
function StepResultScreen({ activeStep, result, loading, results, baseInfo, setScreen, setActiveStep, setStepData, setResult, getRelatedCases }) {
  const [localCopied, setLocalCopied] = useState(false);
  const [sirenCopied, setSirenCopied] = useState(null);
  const stepIdx = STEPS.findIndex(s => s.id === activeStep.id);
  const nextStep = stepIdx !== -1 && stepIdx + 1 < STEPS.length ? STEPS[stepIdx+1] : null;
  const stepColor = activeStep.color || C.purple;
  const relatedCases = getRelatedCases();

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <style>{`*{box-sizing:border-box;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"14px 16px",position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setScreen("step-form")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 뒤로</button>
        <div style={{flex:1,color:"#fff",fontSize:14,fontWeight:700}}>{activeStep.icon} {activeStep.title} 결과</div>
        {!loading&&result&&<button onClick={()=>{navigator.clipboard.writeText(result).then(()=>{setLocalCopied(true);setTimeout(()=>setLocalCopied(false),2000)});}} style={{background:localCopied?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.15)",border:`1px solid ${localCopied?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.3)"}`,borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>{localCopied?"✅ 복사됨":"📋 전체복사"}</button>}
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 14px 32px"}}>
        {loading?(
          <div style={{background:"#fff",borderRadius:20,padding:"50px 20px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>{activeStep.icon}</div>
            <div style={{color:C.navy,fontWeight:800,fontSize:15,marginBottom:6}}>AI가 문서를 작성하고 있어요</div>
            <div style={{color:"#94a3b8",fontSize:13,marginBottom:20}}>고용노동부 기준으로 생성 중...</div>
            <div style={{display:"flex",justifyContent:"center",gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:stepColor,animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.4}s`}}/>)}</div>
          </div>
        ):(
          <div>
            <div style={{background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,borderRadius:14,padding:"14px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✅</div>
              <div>
                <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{activeStep.title} 문서 생성 완료!</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:2}}>{baseInfo.company||"사업장"} · {new Date().toLocaleDateString("ko-KR")}</div>
              </div>
            </div>
            <button onClick={()=>{navigator.clipboard.writeText(result).then(()=>{setLocalCopied(true);setTimeout(()=>setLocalCopied(false),2000)});}} style={{width:"100%",padding:"13px",marginBottom:12,background:localCopied?"linear-gradient(135deg,#166534,#15803d)":`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:18}}>{localCopied?"✅":"📋"}</span>{localCopied?"복사 완료! 붙여넣기 해서 사용하세요":"전체 내용 복사"}
            </button>
            {relatedCases.length>0&&(
              <div style={{background:"rgba(220,38,38,0.07)",border:"2px solid rgba(220,38,38,0.2)",borderRadius:13,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:800,color:C.siren,marginBottom:6}}>🚨 동종 업종 중대재해 사례</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {relatedCases.slice(0,3).map((c,i)=>(
                    <button key={i} onClick={()=>{navigator.clipboard.writeText(formatSirenText(c)).then(()=>{setSirenCopied(i);setTimeout(()=>setSirenCopied(null),2000);trackAction("siren-copy")});}} style={{padding:"6px 11px",background:sirenCopied===i?"rgba(34,197,94,0.15)":"rgba(220,38,38,0.1)",border:`1px solid ${sirenCopied===i?"rgba(34,197,94,0.4)":"rgba(220,38,38,0.25)"}`,borderRadius:8,color:sirenCopied===i?C.green:C.siren,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      {sirenCopied===i?"✅ 복사됨":`📋 ${c.keyword} 복사`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{background:"#fff",borderRadius:16,overflow:"hidden",marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"12px 16px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{activeStep.icon}</span>
                <div><div style={{color:"#fff",fontWeight:700,fontSize:13}}>{activeStep.title}</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>고용노동부 고시 제2024-76호 기준</div></div>
              </div>
              <div style={{padding:"16px"}}><ResultViewer text={result} color={stepColor}/></div>
            </div>
            {nextStep&&<button onClick={()=>{setActiveStep(nextStep);setStepData(nextStep.id===3&&results[2]?{hazards:results[2].slice(0,600),extraScenarios:[]}:{});setResult(results[nextStep.id]||"");setScreen("step-form");}} style={{width:"100%",padding:"14px",marginBottom:8,background:`linear-gradient(135deg,${nextStep.color},${nextStep.color}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>다음 → STEP {nextStep.id}: {nextStep.title} {nextStep.icon}</button>}
            <button onClick={()=>setScreen("landing")} style={{width:"100%",padding:"12px",background:"#fff",border:"2px solid #e2e8f0",borderRadius:13,color:C.navy,fontSize:14,fontWeight:700,cursor:"pointer"}}>🏠 홈으로</button>
            <div style={{marginTop:10,padding:"11px 14px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,fontSize:12,color:"#92400e",lineHeight:1.6}}>⚠️ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TbmFormModal ─────────────────────────────────────────────────────────
function TbmFormModal({ baseInfo, results, completedSteps, onClose, onSave }) {
  const today = new Date().toLocaleDateString("ko-KR");
  const [form, setForm] = useState({
    id: Date.now(),
    date: today,
    workArea: "",
    workContent: "",
    attendees: "",
    keyHazards: "",
    measures: "",
    special: "",
  });
  const [aiLoading, setAiLoading] = useState(false);

  // 위험성평가 결과에서 핵심 위험요인 추출
  const autoFillFromEval = () => {
    const step2Result = results[2] || "";
    const step4Result = results[4] || "";
    const hazardText = step2Result.slice(0, 400) || "위험성평가 결과 없음";
    const measureText = step4Result.slice(0, 400) || "감소대책 결과 없음";
    setForm(p => ({
      ...p,
      keyHazards: hazardText,
      measures: measureText,
    }));
  };

  const generateAI = async () => {
    setAiLoading(true);
    const info = [
      `사업장: ${baseInfo.company||"미입력"} / 업종: ${baseInfo.industry||"미입력"}`,
      `작업장소: ${form.workArea||"-"}`,
      `작업내용: ${form.workContent||"-"}`,
      `참석인원: ${form.attendees||"-"}명`,
      `핵심위험요인: ${form.keyHazards||results[2]?.slice(0,200)||"-"}`,
      `안전조치: ${form.measures||results[4]?.slice(0,200)||"-"}`,
    ].join("\n");
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-6",max_tokens:800,
        system:"산업안전 TBM(Tool Box Meeting, 작업 전 안전점검회의) 회의록을 작성하세요. 핵심 위험요인 3~5가지와 각각의 안전조치사항을 간결하고 현장에서 바로 활용할 수 있게 한국어로 작성하세요.",
        messages:[{role:"user",content:`다음 정보로 TBM 회의록 핵심내용을 작성해주세요:

${info}`}]
      })});
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setForm(p=>({...p, keyHazards:text.slice(0,500), measures:text.slice(500,900)||p.measures}));
    } catch { alert("오류가 발생했습니다."); }
    finally { setAiLoading(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"0 0 36px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {/* 헤더 */}
        <div style={{background:`linear-gradient(135deg,${C.accent},#0284c7)`,borderRadius:"20px 20px 0 0",padding:"16px",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#fff",fontSize:15,fontWeight:800}}>📋 TBM 회의록 작성</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:2}}>작업 전 안전점검회의</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{padding:"16px"}}>
          {/* 기본 정보 */}
          <div style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>📌 기본 정보</div>
            {[
              {key:"date",label:"회의 일자",placeholder:"예: 2026-05-27"},
              {key:"workArea",label:"작업 장소",placeholder:"예: 3층 외벽 비계 구간"},
              {key:"workContent",label:"작업 내용",placeholder:"예: 거푸집 설치 및 철근 배근 작업"},
              {key:"attendees",label:"참석 인원 수",placeholder:"예: 8"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:9}}>
                <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:3}}>{f.label}</label>
                <input value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                  style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1.5px solid ${form[f.key]?"rgba(14,165,233,0.4)":"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>

          {/* 위험요인 & 안전조치 */}
          <div style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy}}>⚠️ 핵심 위험요인 & 안전조치</div>
              <div style={{display:"flex",gap:5}}>
                {completedSteps.length>0&&(
                  <button onClick={autoFillFromEval} style={{padding:"4px 9px",background:"rgba(34,197,94,0.1)",border:`1px solid ${C.green}30`,borderRadius:7,color:C.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>📋 평가 불러오기</button>
                )}
                <button onClick={generateAI} disabled={aiLoading} style={{padding:"4px 9px",background:`rgba(14,165,233,0.1)`,border:`1px solid ${C.accent}30`,borderRadius:7,color:C.accent,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                  {aiLoading?"⏳ 생성중...":"🤖 AI 자동생성"}
                </button>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:12,fontWeight:700,color:C.red,display:"block",marginBottom:3}}>핵심 위험요인</label>
              <textarea value={form.keyHazards||""} onChange={e=>setForm(p=>({...p,keyHazards:e.target.value}))}
                placeholder={"예:\n1. 고소작업 중 추락 위험\n2. 중장비 협착 위험\n3. 낙하물 위험"}
                rows={4} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1.5px solid ${form.keyHazards?"rgba(239,68,68,0.3)":"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:12,fontWeight:700,color:C.green,display:"block",marginBottom:3}}>안전조치사항</label>
              <textarea value={form.measures||""} onChange={e=>setForm(p=>({...p,measures:e.target.value}))}
                placeholder={"예:\n1. 안전대 착용 및 안전대 부착설비 확인\n2. 작업반경 내 출입금지\n3. 안전모·안전화 착용"}
                rows={4} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1.5px solid ${form.measures?"rgba(34,197,94,0.3)":"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.amber,display:"block",marginBottom:3}}>특별 지시사항</label>
              <textarea value={form.special||""} onChange={e=>setForm(p=>({...p,special:e.target.value}))}
                placeholder="예: 오늘 강풍 예보 있음 - 고소작업 시 특별 주의 / 신규 장비 투입"
                rows={2} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:12,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
            </div>
          </div>

          {/* 저장 & PDF 버튼 */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{
              if(!form.workContent){alert("작업 내용은 필수입니다");return;}
              onSave(form);
            }} style={{flex:1,padding:"13px",background:`linear-gradient(135deg,${C.accent},#0284c7)`,border:"none",borderRadius:11,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 저장</button>
            <button onClick={()=>{
              if(!form.workContent){alert("작업 내용을 먼저 입력하세요");return;}
              const printContent=`<html><head><meta charset="utf-8"><style>body{font-family:'맑은 고딕',sans-serif;padding:20px;font-size:13px;}h2{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin-top:12px;}td,th{border:1px solid #333;padding:8px 10px;vertical-align:top;}th{background:#f0f0f0;font-weight:700;width:25%;}.hazard{background:#fff3f3;}.measure{background:#f0fff4;}.footer{margin-top:20px;border-top:1px solid #ccc;padding-top:10px;font-size:11px;color:#666;}</style></head><body><h2>📋 TBM (작업 전 안전점검회의) 회의록</h2><table><tr><th>작성일</th><td>${form.date}</td><th>참석인원</th><td>${form.attendees}명</td></tr><tr><th>사업장</th><td>${baseInfo.company||"-"}</td><th>작업장소</th><td>${form.workArea||"-"}</td></tr><tr><th>작업내용</th><td colspan="3">${form.workContent||"-"}</td></tr><tr><th class="hazard">핵심 위험요인</th><td colspan="3" class="hazard">${(form.keyHazards||"-").replace(/\n/g,"<br>")}</td></tr><tr><th class="measure">안전조치사항</th><td colspan="3" class="measure">${(form.measures||"-").replace(/\n/g,"<br>")}</td></tr><tr><th>특별 지시사항</th><td colspan="3">${(form.special||"-").replace(/\n/g,"<br>")}</td></tr><tr><th>서명</th><td colspan="3" style="height:60px;">관리감독자: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (인)</td></tr></table><div class="footer">※ 산업안전보건법 제36조에 의거 위험성평가 결과를 근로자에게 주지시키기 위해 작성되었습니다.</div></body></html>`;
              const w=window.open("","_blank","width=800,height=600");
              w.document.write(printContent);
              w.document.close();
              w.focus();
              setTimeout(()=>{w.print();},300);
            }} style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:11,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>🖨️ PDF 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
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

// ── AccidentFullScreen ────────────────────────────────────────────────────
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
    // 사고경위 최소 1개 이상 있어야 실행
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
        model:"claude-sonnet-4-6", max_tokens:800,
        system:`산업안전 전문가로서 사고 정보를 분석해 아래 3가지만 JSON으로 반환하세요. 반드시 JSON만, 마크다운 없이 반환하세요.
{"directCause":"직접 원인 (불안전한 행동·상태, 2~4줄)","indirectCause":"간접 원인 - 관리적 결함 (교육·감독·시스템 미흡, 2~3줄)","improvement":"개선대책 (번호 매기기, 3~5가지)"}`,
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
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1200,system:"고용노동부 산업재해 조사표 기준으로 사고보고서를 작성하세요. 육하원칙 기반 사고경위 서술, 기인물 명시, 직접·간접 원인분석, 재발방지 개선대책을 구분하여 전문적이고 명확하게 한국어로 작성하세요.",messages:[{role:"user",content:`다음 정보로 사고보고서를 작성해주세요:\n\n${info}`}]})});
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setAiResult(text);
      setReport(p=>({...p,aiResult:text}));
    } catch { setAiResult("오류가 발생했습니다. 다시 시도해주세요."); }
    finally { setAiLoading(false); }
  };

  const handleSave = () => {
    if (!report.when && !report.how) { alert("언제(발생일시)와 어떻게(사고경위)는 필수입니다"); return; }
    onSave({...report, aiResult:aiResult||report.aiResult||""});
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
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
                placeholder={"예:\n1. 작업 전 비계 점검 의무화\n2. 안전대 부착설비 설치\n3. 관리감독자 상주\n(기인물 입력 후 자동 분석됩니다)"}
                rows={4} style={{width:"100%",padding:"9px 12px",borderRadius:9,
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

// ── 메인 App ──────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [tab, setTab] = useState("assessment");
  const [baseInfo, setBaseInfo] = useState({company:"",industry:"",workers:"",manager:""});
  const [baseConfirmed, setBaseConfirmed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [stepData, setStepData] = useState({});
  const [result, setResult] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [evalHistory, setEvalHistory] = useState([]);
  const [showScenario, setShowScenario] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sirenIndustry, setSirenIndustry] = useState(null);
  const [sirenCopied, setSirenCopied] = useState(null);
  const [globalCopied, setGlobalCopied] = useState(false);
  const [linkedSirenCases, setLinkedSirenCases] = useState([]);
  const [sirenEvalType, setSirenEvalType] = useState(null);
  const [showSirenEvalModal, setShowSirenEvalModal] = useState(false);
  const [accidentReports, setAccidentReports] = useState([]);
  const [lastSavedAccident, setLastSavedAccident] = useState(null);
  const [sheets, setSheets] = useState([{id:1,workArea:"",workType:"",equipment:"",materials:"",envFactors:"",currentSafety:"",result:"",extraHazards:[]}]);
  const [activeSheetId, setActiveSheetId] = useState(1);
  const [sheetLoading, setSheetLoading] = useState({});
  const [tbmRecords, setTbmRecords] = useState([]);
  const [showTbmForm, setShowTbmForm] = useState(false);

  useEffect(()=>{
    trackVisit(); // 방문 기록
    (async()=>{
      const p=await loadStorage("company-profile"); if(p){setBaseInfo(p);setBaseConfirmed(true);}
      const h=await loadStorage("eval-history"); if(h) setEvalHistory(h);
      const t=await loadStorage("selected-template"); if(t){setSelectedTemplate(t);setScreen("home");}
      const ar=await loadStorage("accident-reports"); if(ar) setAccidentReports(ar);
      const tb=await loadStorage("tbm-records"); if(tb) setTbmRecords(tb);
    })();
  },[]);

  useEffect(()=>{
    if(completedSteps.length>=4&&baseInfo.industry){
      const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업",""));
      if(mk) setLinkedSirenCases(INDUSTRY_SCENARIOS[mk].accidentCases||[]);
    }
  },[completedSteps,baseInfo.industry]);

  const getAllData = ()=>({...baseInfo,...stepData});

  const callAI = async(prompt,overrideData)=>{
    setLoading(true); setResult("");
    const merged = overrideData?{...baseInfo,...overrideData}:getAllData();
    const info = Object.entries(merged).filter(([k])=>k!=="extraScenarios").map(([k,v])=>`${k}: ${typeof v==="object"?JSON.stringify(v):v||"미입력"}`).join("\n");
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,system:prompt,messages:[{role:"user",content:`다음 정보로 문서를 작성해주세요:\n\n${info}`}]})});
      const d=await res.json();
      const text=d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setResult(text);
      if(activeStep?.id) setResults(prev=>({...prev,[activeStep.id]:text}));
      const entry={id:Date.now(),step:activeStep?.title,company:baseInfo.company||"미입력",date:new Date().toLocaleDateString("ko-KR"),preview:text.slice(0,60)+"...",full:text};
      const newH=[entry,...evalHistory].slice(0,20); setEvalHistory(newH); await saveStorage("eval-history",newH);
    } catch { setResult("오류가 발생했습니다. 다시 시도해주세요."); }
    finally { setLoading(false); }
  };

  const applyScenario=(industry)=>{
    const sc=INDUSTRY_SCENARIOS[industry]; if(!sc) return;
    if(activeStep?.multiSheet) setSheets(prev=>prev.map(s=>s.id===activeSheetId?{...s,workType:sc.workTypes.join(", "),equipment:sc.equipments.join(", "),materials:sc.materials.join(", "),envFactors:sc.envFactors.join(", "),currentSafety:""}:s));
    else setStepData(prev=>({...prev,workType:sc.workTypes.join(", "),equipment:sc.equipments.join(", "),materials:sc.materials.join(", "),hazards:sc.hazards.join(", "),envFactors:sc.envFactors.join(", ")}));
    setShowScenario(false);
  };

  const addSheet=()=>{const newId=Math.max(...sheets.map(s=>s.id))+1;setSheets(prev=>[...prev,{id:newId,workArea:"",workType:"",equipment:"",materials:"",envFactors:"",currentSafety:"",result:"",extraHazards:[]}]);setActiveSheetId(newId);};
  const removeSheet=(id)=>{if(sheets.length<=1)return;const r=sheets.filter(s=>s.id!==id);setSheets(r);if(activeSheetId===id)setActiveSheetId(r[0].id);};
  const updateSheet=(id,field,value)=>setSheets(prev=>prev.map(s=>s.id===id?{...s,[field]:value}:s));
  const addExtraHazard=(sheetId)=>setSheets(prev=>prev.map(s=>s.id===sheetId?{...s,extraHazards:[...(s.extraHazards||[]),{id:Date.now(),situation:"",cause:"",prevention:""}]}:s));
  const updateExtraHazard=(sheetId,hazardId,field,value)=>setSheets(prev=>prev.map(s=>s.id===sheetId?{...s,extraHazards:(s.extraHazards||[]).map(h=>h.id===hazardId?{...h,[field]:value}:h)}:s));
  const removeExtraHazard=(sheetId,hazardId)=>setSheets(prev=>prev.map(s=>s.id===sheetId?{...s,extraHazards:(s.extraHazards||[]).filter(h=>h.id!==hazardId)}:s));

  const callAIForSheet=async(sheet)=>{
    setSheetLoading(prev=>({...prev,[sheet.id]:true}));
    const info=Object.entries({...baseInfo,...sheet}).filter(([k])=>k!=="extraHazards"&&k!=="result").map(([k,v])=>`${k}: ${v||"미입력"}`).join("\n");
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,system:STEPS[1].prompt,messages:[{role:"user",content:`다음 공정의 위험요인을 파악해주세요:\n\n${info}`}]})});
      const d=await res.json();
      const text=d.content?.map(b=>b.text||"").join("")||"오류가 발생했습니다.";
      setSheets(prev=>prev.map(s=>s.id===sheet.id?{...s,result:text}:s));
      const entry={id:Date.now(),step:`유해위험요인파악-${sheet.workArea||"공정"+sheet.id}`,company:baseInfo.company||"미입력",date:new Date().toLocaleDateString("ko-KR"),preview:text.slice(0,60)+"...",full:text};
      const newH=[entry,...evalHistory].slice(0,20); setEvalHistory(newH); await saveStorage("eval-history",newH);
    } catch {setSheets(prev=>prev.map(s=>s.id===sheet.id?{...s,result:"오류가 발생했습니다."}:s));}
    finally {setSheetLoading(prev=>({...prev,[sheet.id]:false}));}
  };

  const getAllSheetsResult=()=>sheets.filter(s=>s.result||(s.extraHazards||[]).length>0).map((s,i)=>{
    let text=`[공정 ${i+1}: ${s.workArea||"미입력"}]`;
    if(s.result) text+=`\n${s.result}`;
    if((s.extraHazards||[]).length>0) text+=`\n\n【현장 추가 위험요인】\n`+s.extraHazards.map((h,j)=>`추가 ${j+1}. ${h.situation||"(미입력)"}\n  원인: ${h.cause||"-"}\n  대책: ${h.prevention||"-"}`).join("\n");
    return text;
  }).join("\n\n");

  const getSirenCases=()=>{
    if(sirenIndustry) return INDUSTRY_SCENARIOS[sirenIndustry]?.accidentCases||[];
    if(baseInfo.industry){const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업",""));if(mk) return INDUSTRY_SCENARIOS[mk]?.accidentCases||[];}
    return Object.values(INDUSTRY_SCENARIOS).flatMap(s=>s.accidentCases||[]);
  };
  const getRelatedCases=()=>{if(!baseInfo.industry) return [];const mk=Object.keys(INDUSTRY_SCENARIOS).find(k=>baseInfo.industry.includes(k)||baseInfo.industry.replace("업","")===k.replace("업",""));return mk?(INDUSTRY_SCENARIOS[mk]?.accidentCases||[]):[];};

  const saveAccidentReport=async(report)=>{
    const isEdit=accidentReports.some(r=>r.id===report.id);
    const updated=isEdit?accidentReports.map(r=>r.id===report.id?report:r):[report,...accidentReports];
    setAccidentReports(updated); await saveStorage("accident-reports",updated);
  };
  const deleteAccidentReport=async(id)=>{const updated=accidentReports.filter(r=>r.id!==id);setAccidentReports(updated);await saveStorage("accident-reports",updated);};

  const injectAccidentToEval=(report)=>{
    const when=report.when||report.date||""; const where=report.where||report.location||"";
    const what=report.what||report.workContent||""; const how=report.how||report.situation||"";
    const situation=`[사고 기반 수시평가]\n누가: ${report.who||"-"}\n언제: ${when}\n어디서: ${where}\n무엇을: ${what}\n어떻게: ${how}\n왜: ${report.why||"-"}\n기인물: ${report.object||"-"}\n직접원인: ${report.directCause||"-"}\n간접원인: ${report.indirectCause||"-"}\n피해현황: ${report.damage||"-"}`;
    setSheets([{id:1,workArea:where,workType:what,equipment:report.object||"",materials:"",envFactors:"",currentSafety:"",result:"",extraHazards:[{id:Date.now(),situation:`${how} (${report.why||""})`.trim(),cause:report.directCause||"",prevention:report.improvement||""}]}]);
    setActiveSheetId(1);
    setActiveStep(STEPS.find(s=>s.id===2));
    setStepData({hazards:situation}); setResult(""); setSirenEvalType("accident"); setScreen("step-form");
  };

  // ── 랜딩 ────────────────────────────────────────────────────────────────
  if(screen==="landing") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:`linear-gradient(160deg,${C.navy},${C.blue})`,padding:"44px 20px 32px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>⚠️</div>
        <div style={{color:"#fff",fontSize:21,fontWeight:800,marginBottom:6}}>산업안전 AI 시스템</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,lineHeight:1.7}}>고용노동부 고시 제2024-76호 기준<br/>위험성평가 · 사고보고서 · 중대재해 사이렌</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"28px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.slate,textAlign:"center",marginBottom:20}}>무엇을 시작할까요?</div>
        <button onClick={()=>{ if(!selectedTemplate){setScreen("home");} else setScreen("home"); }} style={{width:"100%",background:"#fff",borderRadius:18,padding:"22px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:18,cursor:"pointer",textAlign:"left",border:`2px solid ${C.accent}20`,boxShadow:"0 4px 24px rgba(14,165,233,0.10)"}}>
          <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.accent},#0284c7)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>📋</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:5}}>위험성평가</div>
            <div style={{fontSize:12,color:C.slate,lineHeight:1.65,marginBottom:8}}>6단계 AI 자동 작성 · 정기·수시평가 지원</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["법정 6단계","AI 자동작성","업종별 맞춤"].map(t=><span key={t} style={{fontSize:10,fontWeight:700,color:C.accent,background:`${C.accent}10`,padding:"2px 8px",borderRadius:20}}>{t}</span>)}</div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:24}}>›</div>
        </button>
        <button onClick={()=>setScreen("accident-form")} style={{width:"100%",background:"#fff",borderRadius:18,padding:"22px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:18,cursor:"pointer",textAlign:"left",border:`2px solid ${C.red}18`,boxShadow:"0 4px 24px rgba(239,68,68,0.09)"}}>
          <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.red},#b91c1c)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>📝</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:5}}>사고보고서 작성</div>
            <div style={{fontSize:12,color:C.slate,lineHeight:1.65,marginBottom:8}}>육하원칙 기반 · AI 자동완성 · 수시평가 연계</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["육하원칙","기인물·원인분석","수시평가 연계"].map(t=><span key={t} style={{fontSize:10,fontWeight:700,color:C.red,background:`${C.red}08`,padding:"2px 8px",borderRadius:20}}>{t}</span>)}</div>
          </div>
          <div style={{color:"#cbd5e1",fontSize:24}}>›</div>
        </button>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[
            {icon:"🚨",label:"중대재해 사이렌",color:C.siren,action:()=>{setScreen("home");setTab("siren");}},
            {icon:"🔄",label:"수시평가",color:C.accent,action:()=>{setScreen("home");setTab("urgent");}},
            {icon:"🏢",label:baseConfirmed?(baseInfo.company||"").slice(0,5)||"프로필":"프로필",color:C.green,action:()=>setShowProfileModal(true)},
          ].map(m=>(
            <button key={m.label} onClick={m.action} style={{flex:1,padding:"12px 4px",background:"#fff",border:`1.5px solid ${m.color}15`,borderRadius:12,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:4}}>{m.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:m.color,lineHeight:1.3}}>{m.label}</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",fontSize:11,color:"#cbd5e1",lineHeight:1.7}}>산업안전보건법 제36조 · 상시근로자 1인 이상 의무<br/>결과 <strong style={{color:"#94a3b8"}}>3년 보존</strong></div>
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
        <div style={{background:`rgba(14,165,233,0.07)`,border:`2px solid ${C.accent}25`,borderRadius:16,padding:"18px",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:800,color:C.navy,marginBottom:4}}>🔄 수시위험성평가 연계</div>
          <div style={{fontSize:12,color:C.slate,lineHeight:1.6,marginBottom:14}}>사고보고서 내용이 STEP 2에 자동으로 반영됩니다.</div>
          <button onClick={()=>{const updated={...lastSavedAccident,evalLinked:true};saveAccidentReport(updated);setLastSavedAccident(updated);injectAccidentToEval(updated);}} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.accent},#0284c7)`,border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:18}}>🔗</span> 수시위험성평가 바로 시작
          </button>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12,border:"1px solid #e2e8f0"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>수시평가 사유 선택</div>
          {[
            {key:"accident",icon:"🚑",label:"산업재해 발생",color:C.red},
            {key:"process",icon:"🏗️",label:"공정 추가·변경",color:C.accent},
            {key:"manager",icon:"👔",label:"안전보건관리책임자 요청",color:C.purple},
            {key:"major",icon:"⚠️",label:"중대재해 발생",color:C.siren},
          ].map(item=>(
            <button key={item.key} onClick={()=>{setSirenEvalType(item.key);setActiveStep(STEPS.find(s=>s.id===1));setStepData({evalType:`수시평가 - ${item.label}`});setResult("");setCompletedSteps([]);trackAction("urgent-eval");setScreen("step-form");}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:`${item.color}06`,border:`1.5px solid ${item.color}20`,borderRadius:10,cursor:"pointer",textAlign:"left",marginBottom:7}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div style={{fontSize:13,fontWeight:700,color:C.navy,flex:1}}>{item.label}</div>
              <div style={{color:"#cbd5e1",fontSize:16}}>›</div>
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setScreen("home");setTab("accident");}} style={{flex:1,padding:"12px",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer"}}>📋 보고서 목록</button>
          <button onClick={()=>setScreen("landing")} style={{flex:1,padding:"12px",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer"}}>🏠 홈으로</button>
        </div>
      </div>
    </div>
  );

  // ── step-result ──────────────────────────────────────────────────────
  if(screen==="step-result"&&activeStep) return <StepResultScreen activeStep={activeStep} result={result} loading={loading} results={results} baseInfo={baseInfo} setScreen={setScreen} setActiveStep={setActiveStep} setStepData={setStepData} setResult={setResult} getRelatedCases={getRelatedCases}/>;

  // ── 템플릿 선택 ──────────────────────────────────────────────────────
  if(screen==="home"&&!selectedTemplate) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"28px 16px 20px"}}>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setScreen("landing")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 홈</button>
          <div style={{flex:1,textAlign:"center",color:"#fff",fontSize:16,fontWeight:800}}>⚠️ 위험성평가</div>
        </div>
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:5}}>문서 양식을 선택해주세요</div>
        <div style={{fontSize:12,color:C.slate,marginBottom:16}}>업종에 맞는 양식을 선택하면 최적화된 문서를 작성해드려요</div>
        {DOCUMENT_TEMPLATES.map(tmpl=>(
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
      </div>
    </div>
  );

  // ── 메인 대시보드 ─────────────────────────────────────────────────────
  if(screen==="home"&&selectedTemplate){
    const sirenCases=getSirenCases();
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"16px 16px 12px"}}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>setScreen("landing")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"5px 9px",color:"#fff",fontSize:12,cursor:"pointer"}}>🏠</button>
                <span style={{fontSize:18}}>{selectedTemplate.icon}</span>
                <div style={{color:"#fff",fontSize:14,fontWeight:800}}>{selectedTemplate.name}</div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>setShowProfileModal(true)} style={{background:baseConfirmed?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.12)",border:"none",borderRadius:7,padding:"5px 8px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{baseConfirmed?"✅ 프로필":"🏢 프로필"}</button>
                <button onClick={async()=>{setSelectedTemplate(null);await saveStorage("selected-template",null);}} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:7,padding:"5px 8px",color:"#fff",fontSize:11,cursor:"pointer"}}>양식변경</button>
              </div>
            </div>
            {baseConfirmed&&<div style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:9,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>🏢</span><div style={{flex:1}}><div style={{color:"#fff",fontSize:12,fontWeight:700}}>{baseInfo.company}</div><div style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{baseInfo.industry} · {baseInfo.workers} · {baseInfo.manager}</div></div><div style={{color:"#4ade80",fontSize:10,fontWeight:700}}>자동적용</div></div>}
            <div style={{display:"flex",gap:3}}>{STEPS.map((s,i)=><div key={s.id} style={{flex:1,height:3,borderRadius:3,background:completedSteps.includes(i+1)?C.green:"rgba(255,255,255,0.18)"}}/>)}</div>
          </div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 0"}}>
          <div style={{display:"flex",background:"#e2e8f0",borderRadius:11,padding:3,gap:2}}>
            {[{k:"assessment",l:"📋 평가"},{k:"tbm",l:"📋 TBM"},{k:"accident",l:"📝 보고서"},{k:"urgent",l:"🔄 수시"},{k:"siren",l:"🚨 사이렌"}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:tab===t.k?(t.k==="siren"?C.siren:t.k==="accident"?C.red:"#fff"):"transparent",color:tab===t.k?"#fff":C.slate,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.l}</button>
            ))}
          </div>
        </div>

        {/* ── 위험성평가 탭 ── */}
        {tab==="assessment"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            {completedSteps.length>0&&(
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <button onClick={()=>{const t=STEPS.filter(s=>results[s.id]).map(s=>`=== ${s.icon} STEP ${s.id}: ${s.title} ===\n\n${results[s.id]}`).join("\n\n\n");navigator.clipboard.writeText(t).then(()=>{setGlobalCopied(true);setTimeout(()=>setGlobalCopied(false),2000)});}} style={{flex:1,padding:"13px",background:globalCopied?"linear-gradient(135deg,#166534,#15803d)":"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",borderRadius:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <span style={{fontSize:16}}>{globalCopied?"✅":"📋"}</span>{globalCopied?"복사완료":` 전체복사 (${completedSteps.length}/6)`}
                </button>
                <button onClick={()=>{
                  const allText=STEPS.filter(s=>results[s.id]).map(s=>`<h3>${s.icon} STEP ${s.id}: ${s.title}</h3><pre style="white-space:pre-wrap;font-size:12px;line-height:1.8;">${results[s.id]}</pre>`).join("<hr>");
                  const printContent=`<html><head><meta charset="utf-8"><style>body{font-family:'맑은 고딕',sans-serif;padding:24px;font-size:13px;}h2{text-align:center;border-bottom:2px solid #0f2640;padding-bottom:8px;color:#0f2640;}h3{color:#1a3a5c;border-left:4px solid #0ea5e9;padding-left:10px;margin-top:24px;}pre{background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;white-space:pre-wrap;}hr{border:none;border-top:1px solid #e2e8f0;margin:20px 0;}.info{display:flex;gap:20px;background:#f0f4f8;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:12px;}</style></head><body><h2>⚠️ 위험성평가 보고서</h2><div class="info"><span>🏢 ${baseInfo.company||"사업장명"}</span><span>🏭 ${baseInfo.industry||"업종"}</span><span>👷 ${baseInfo.workers||"근로자수"}</span><span>📅 ${new Date().toLocaleDateString("ko-KR")}</span></div>${allText}<p style="margin-top:20px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;">※ AI 초안입니다. 안전관리자가 현장 상황에 맞게 반드시 검토·수정 후 사용하세요.</p></body></html>`;
                  const w=window.open("","_blank","width=900,height=700");
                  w.document.write(printContent);
                  w.document.close();
                  w.focus();
                  setTimeout(()=>{w.print();},300);trackAction("pdf-save");
                }} style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <span style={{fontSize:16}}>🖨️</span> PDF 저장
                </button>
              </div>
            )}
            {linkedSirenCases.length>0&&(
              <div style={{background:"rgba(220,38,38,0.07)",border:"2px solid rgba(220,38,38,0.2)",borderRadius:13,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:800,color:C.siren,marginBottom:5}}>🚨 중대재해 사이렌 연계</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{linkedSirenCases.map((c,i)=><button key={i} onClick={()=>setTab("siren")} style={{padding:"4px 10px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.25)",borderRadius:8,color:C.siren,fontSize:11,fontWeight:700,cursor:"pointer"}}>{c.keyword}</button>)}</div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {STEPS.map((s,i)=>{
                const done=completedSteps.includes(i+1);
                return (
                  <button key={s.id} onClick={()=>{setActiveStep(s);if(s.id===3&&results[2]){setStepData({hazards:results[2].slice(0,600),extraScenarios:[]});}else{setStepData({});}setResult(results[s.id]||"");setScreen("step-form");}} style={{width:"100%",background:"#fff",border:`2px solid ${done?C.green:"#e2e8f0"}`,borderRadius:13,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:40,height:40,borderRadius:10,flexShrink:0,background:done?`${C.green}18`:`${s.color}12`,border:`2px solid ${done?C.green:s.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{done?"✅":s.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                        <span style={{fontSize:10,fontWeight:700,color:s.color,background:`${s.color}15`,padding:"1px 7px",borderRadius:20}}>STEP {s.id}</span>
                        {done&&<span style={{fontSize:10,color:C.green,fontWeight:700}}>완료</span>}
                        {s.id===1&&!baseConfirmed&&<span style={{fontSize:10,color:C.amber,fontWeight:700}}>← 시작!</span>}
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

        {/* ── 사고보고서 탭 ── */}
        {tab==="accident"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div><div style={{fontSize:14,fontWeight:800,color:C.navy}}>📝 사고보고서 이력</div><div style={{fontSize:11,color:C.slate,marginTop:2}}>작성 후 수시평가에 즉시 연계</div></div>
              <button onClick={()=>setScreen("accident-form")} style={{padding:"8px 14px",background:`linear-gradient(135deg,${C.red},#b91c1c)`,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ 사고 등록</button>
            </div>
            {accidentReports.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",background:"#fff",borderRadius:14,border:"2px dashed #e2e8f0"}}>
                <div style={{fontSize:36,marginBottom:8}}>📋</div>
                <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>등록된 사고보고서가 없어요</div>
                <div style={{fontSize:11,color:"#cbd5e1",marginTop:4}}>사고 발생 시 즉시 등록하세요</div>
              </div>
            ):accidentReports.map(r=>(
              <div key={r.id} style={{background:"#fff",borderRadius:13,padding:"14px",marginBottom:10,border:`2px solid ${r.evalLinked?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.12)"}`,borderLeft:`4px solid ${r.evalLinked?C.green:C.red}`}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#fff",background:r.evalLinked?C.green:C.red,padding:"2px 8px",borderRadius:20}}>{r.evalLinked?"평가연계":"미연계"}</span>
                  <span style={{fontSize:11,color:C.slate}}>{r.when}</span><span style={{fontSize:11,color:C.slate}}>{r.where}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:3}}>{r.what||"작업내용 미입력"}</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.4}}>{r.how?.slice(0,60)}{(r.how?.length||0)>60?"...":""}</div>
                <div style={{display:"flex",gap:6}}>
                  {!r.evalLinked&&<button onClick={()=>injectAccidentToEval(r)} style={{flex:1,padding:"8px",background:`linear-gradient(135deg,${C.accent},${C.accent}cc)`,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔗 수시평가 연계</button>}
                  <button onClick={()=>deleteAccidentReport(r.id)} style={{padding:"8px 11px",background:"none",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,color:C.red,fontSize:12,cursor:"pointer"}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TBM 회의록 탭 ── */}
        {tab==="tbm"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:C.navy}}>📋 TBM 회의록</div>
                <div style={{fontSize:11,color:C.slate,marginTop:2}}>작업 전 안전점검회의 · 위험성평가 기반 자동생성</div>
              </div>
              <button onClick={()=>setShowTbmForm(true)} style={{padding:"8px 14px",background:`linear-gradient(135deg,${C.accent},#0284c7)`,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ TBM 작성</button>
            </div>

            {/* 위험성평가 연계 안내 */}
            {completedSteps.length>0&&(
              <div style={{background:`rgba(14,165,233,0.07)`,border:`1.5px solid ${C.accent}25`,borderRadius:12,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>🔗</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.accent}}>위험성평가 연계 가능</div>
                  <div style={{fontSize:11,color:C.slate,marginTop:1}}>완료된 평가 결과를 TBM에 자동 반영할 수 있어요</div>
                </div>
              </div>
            )}

            {tbmRecords.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",background:"#fff",borderRadius:14,border:"2px dashed #e2e8f0"}}>
                <div style={{fontSize:36,marginBottom:8}}>📋</div>
                <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>작성된 TBM 회의록이 없어요</div>
                <div style={{fontSize:11,color:"#cbd5e1",marginTop:4}}>매일 작업 전 TBM을 작성하고 기록하세요</div>
              </div>
            ):tbmRecords.slice().reverse().map((tbm,i)=>(
              <div key={tbm.id} style={{background:"#fff",borderRadius:13,padding:"14px",marginBottom:10,border:`2px solid ${C.accent}15`,borderLeft:`4px solid ${C.accent}`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontWeight:700,color:C.accent}}>{tbm.date}</span>
                      <span style={{fontSize:11,color:C.slate}}>{tbm.workArea}</span>
                      <span style={{fontSize:10,color:"#fff",background:C.green,padding:"1px 7px",borderRadius:10,fontWeight:700}}>참석 {tbm.attendees}명</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{tbm.workContent||"작업내용 미입력"}</div>
                  </div>
                  <button onClick={async()=>{const updated=tbmRecords.filter(t=>t.id!==tbm.id);setTbmRecords(updated);await saveStorage("tbm-records",updated);}} style={{background:"none",border:"none",color:"#94a3b8",fontSize:16,cursor:"pointer",padding:"0 4px"}}>🗑️</button>
                </div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:8}}>{tbm.keyHazards?.slice(0,60)}{(tbm.keyHazards?.length||0)>60?"...":""}</div>
                <button onClick={()=>{
                  const printContent = `
                    <html><head><meta charset="utf-8">
                    <style>
                      body{font-family:'맑은 고딕',sans-serif;padding:20px;font-size:13px;}
                      h2{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;}
                      table{width:100%;border-collapse:collapse;margin-top:12px;}
                      td,th{border:1px solid #333;padding:8px 10px;vertical-align:top;}
                      th{background:#f0f0f0;font-weight:700;width:25%;}
                      .hazard{background:#fff3f3;} .measure{background:#f0fff4;}
                      .footer{margin-top:20px;border-top:1px solid #ccc;padding-top:10px;font-size:11px;color:#666;}
                    </style></head><body>
                    <h2>📋 TBM (작업 전 안전점검회의) 회의록</h2>
                    <table>
                      <tr><th>작성일</th><td>${tbm.date}</td><th>참석인원</th><td>${tbm.attendees}명</td></tr>
                      <tr><th>사업장</th><td>${baseInfo.company||"-"}</td><th>작업장소</th><td>${tbm.workArea||"-"}</td></tr>
                      <tr><th>작업내용</th><td colspan="3">${tbm.workContent||"-"}</td></tr>
                      <tr><th class="hazard">핵심 위험요인</th><td colspan="3" class="hazard">${(tbm.keyHazards||"-").replace(/\n/g,"<br>")}</td></tr>
                      <tr><th class="measure">안전조치사항</th><td colspan="3" class="measure">${(tbm.measures||"-").replace(/\n/g,"<br>")}</td></tr>
                      <tr><th>특별 지시사항</th><td colspan="3">${(tbm.special||"-").replace(/\n/g,"<br>")}</td></tr>
                      <tr><th>서명</th><td colspan="3" style="height:60px;">관리감독자: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (인)</td></tr>
                    </table>
                    <div class="footer">※ 본 TBM 회의록은 산업안전보건법 제36조에 의거 위험성평가 결과를 근로자에게 주지시키기 위해 작성되었습니다.</div>
                    </body></html>
                  `;
                  const w=window.open("","_blank","width=800,height=600");
                  w.document.write(printContent);
                  w.document.close();
                  w.focus();
                  setTimeout(()=>{w.print();},300);
                }} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${C.accent},#0284c7)`,border:"none",borderRadius:9,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  🖨️ PDF 인쇄 / 저장
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── 수시평가 탭 ── */}
        {tab==="urgent"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{color:"#fff",fontSize:15,fontWeight:800,marginBottom:3}}>🔄 수시위험성평가</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>사유를 선택하면 맞춤 평가가 시작됩니다</div>
            </div>
            {[
              {key:"process",icon:"🏗️",label:"공정 추가·변경",desc:"새 공정 투입 또는 작업방법·설비 변경 시",color:C.accent,badge:"산안법 제36조②"},
              {key:"accident",icon:"🚑",label:"산업재해 발생",desc:"재해 발생 후 재발방지 목적의 즉시 평가",color:C.red,badge:"재발방지 의무"},
              {key:"manager",icon:"👔",label:"안전보건관리책임자 요청",desc:"책임자 판단에 의한 수시 평가 지시",color:C.purple,badge:"자율 실시"},
              {key:"major",icon:"⚠️",label:"중대재해 발생",desc:"중대재해 발생 직후 긴급 위험성 재평가",color:C.siren,badge:"긴급"},
            ].map(item=>(
              <button key={item.key} onClick={()=>{setSirenEvalType(item.key);if(item.key==="accident"&&accidentReports.length>0){setShowSirenEvalModal(true);}else{setActiveStep(STEPS.find(s=>s.id===1));setStepData({evalType:`수시평가 - ${item.label}`});setResult("");setCompletedSteps([]);trackAction("urgent-eval");setScreen("step-form");}}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px",background:"#fff",border:`2px solid ${item.color}18`,borderLeft:`4px solid ${item.color}`,borderRadius:13,cursor:"pointer",textAlign:"left",marginBottom:10}}>
                <span style={{fontSize:26,flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:800,color:C.navy}}>{item.label}</span>
                    <span style={{fontSize:9,fontWeight:700,color:item.color,background:`${item.color}12`,padding:"1px 6px",borderRadius:10}}>{item.badge}</span>
                  </div>
                  <div style={{fontSize:12,color:C.slate}}>{item.desc}</div>
                </div>
                <div style={{color:"#cbd5e1",fontSize:18}}>›</div>
              </button>
            ))}
          </div>
        )}

        {/* ── 사이렌 탭 ── */}
        {tab==="siren"&&(
          <div style={{maxWidth:560,margin:"0 auto",padding:"10px 14px 28px"}}>
            <div style={{background:"linear-gradient(135deg,#7f1d1d,#dc2626)",borderRadius:14,padding:"16px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:5}}>🚨</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:800,marginBottom:3}}>중대재해 사이렌</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:12}}>실제 사례를 복사해서 카카오톡·게시판에 즉시 공유</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              <button onClick={()=>setSirenIndustry(null)} style={{padding:"5px 11px",borderRadius:8,border:"none",background:!sirenIndustry?C.siren:"#e2e8f0",color:!sirenIndustry?"#fff":C.slate,fontSize:11,fontWeight:700,cursor:"pointer"}}>전체</button>
              {Object.keys(INDUSTRY_SCENARIOS).map(ind=><button key={ind} onClick={()=>setSirenIndustry(ind)} style={{padding:"5px 11px",borderRadius:8,border:"none",background:sirenIndustry===ind?C.siren:"#e2e8f0",color:sirenIndustry===ind?"#fff":C.slate,fontSize:11,fontWeight:700,cursor:"pointer"}}>{ind}</button>)}
            </div>
            {sirenCases.map((c,i)=>(
              <div key={i} style={{background:"#fff",border:`2px solid rgba(220,38,38,0.1)`,borderLeft:`4px solid ${C.siren}`,borderRadius:14,padding:"14px",marginBottom:10}}>
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

        {/* ── TBM 작성 폼 모달 ── */}
        {showTbmForm&&(
          <TbmFormModal
            baseInfo={baseInfo}
            results={results}
            completedSteps={completedSteps}
            onClose={()=>setShowTbmForm(false)}
            onSave={async(tbm)=>{
              const updated=[tbm,...tbmRecords];
              setTbmRecords(updated);
              await saveStorage("tbm-records",updated);
              setShowTbmForm(false);
            }}
          />
        )}

        {/* 수시평가 연계 모달 */}
        {showSirenEvalModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setShowSirenEvalModal(false)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxWidth:560,maxHeight:"70vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:4}}>🚑 연계할 사고보고서 선택</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>선택하면 STEP 2에 사고 내용이 자동 반영됩니다</div>
              {accidentReports.map(r=>(
                <button key={r.id} onClick={()=>{setShowSirenEvalModal(false);injectAccidentToEval(r);}} style={{width:"100%",background:"#f8fafc",border:"2px solid #e2e8f0",borderRadius:11,padding:"12px 14px",textAlign:"left",cursor:"pointer",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{r.what||r.workContent||"작업내용 미입력"}</div>
                  <div style={{fontSize:11,color:C.slate,marginTop:2}}>{r.when||r.date} · {r.where||r.location}</div>
                </button>
              ))}
              <button onClick={()=>{setShowSirenEvalModal(false);setActiveStep(STEPS.find(s=>s.id===1));setStepData({evalType:"수시평가 - 산업재해 발생"});setResult("");setCompletedSteps([]);trackAction("urgent-eval");setScreen("step-form");}} style={{width:"100%",padding:"11px",background:"#f8fafc",border:"2px dashed #e2e8f0",borderRadius:11,color:C.slate,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:4}}>보고서 없이 바로 시작</button>
            </div>
          </div>
        )}
        {showProfileModal&&<ProfileModal baseInfo={baseInfo} setBaseInfo={setBaseInfo} onClose={async()=>{setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);setShowProfileModal(false);}}/>}
      </div>
    );
  }

  // ── step-form ─────────────────────────────────────────────────────────
  if(screen==="step-form"&&activeStep){
    const isStep1=activeStep.id===1, isStep2=activeStep.multiSheet===true;
    const stepColor=activeStep.color;
    const activeSheet=sheets.find(s=>s.id===activeSheetId)||sheets[0];
    const SHEET_FIELDS=[
      {key:"workArea",label:"작업장소/공정명",placeholder:"예: 지하 2층 거푸집 설치 작업"},
      {key:"workType",label:"작업종류",placeholder:"예: 고소작업, 용접작업"},
      {key:"equipment",label:"사용 기계·기구·기인물",placeholder:"예: 이동식비계, 용접기, 지게차"},
      {key:"materials",label:"취급 원자재/화학물질",placeholder:"예: 시멘트, LPG, 유기용제"},
      {key:"envFactors",label:"작업장 환경요인",placeholder:"예: 고온·다습, 소음 90dB, 환기 불량, 야간작업",isNew:true},
      {key:"currentSafety",label:"현재 안전조치",placeholder:"예: 안전난간 설치, 안전대 지급"},
    ];
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
        <style>{`*{box-sizing:border-box;}`}</style>
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"14px 16px",position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:13,cursor:"pointer"}}>← 뒤로</button>
          <div style={{flex:1,color:"#fff",fontSize:14,fontWeight:700}}>{activeStep.icon} STEP {activeStep.id} · {activeStep.title}</div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"14px 14px 32px"}}>
          {/* 공통 정보 배너 */}
          {!isStep1&&baseConfirmed&&baseInfo.company&&(
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:11,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:12,fontWeight:700,color:"#166534"}}>공통정보 자동 적용 중</div><div style={{fontSize:12,color:"#4b7c5e",marginTop:2}}>{baseInfo.company} · {baseInfo.industry} · {baseInfo.workers}</div></div>
              <button onClick={()=>setShowProfileModal(true)} style={{background:"none",border:"1px solid rgba(34,197,94,0.4)",borderRadius:7,padding:"4px 10px",color:"#166534",fontSize:11,fontWeight:700,cursor:"pointer"}}>수정</button>
            </div>
          )}

          {/* STEP 1 */}
          {isStep1&&(
            <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>🏢 사업장 공통정보 <span style={{fontSize:10,color:C.accent,fontWeight:700,background:`${C.accent}12`,padding:"2px 7px",borderRadius:15,marginLeft:5}}>2~6단계 자동적용</span></div>
              {BASE_FIELDS.map(f=>(
                <div key={f.key} style={{marginBottom:10}}>
                  <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:4}}>{f.label}</label>
                  <input value={baseInfo[f.key]||""} onChange={e=>setBaseInfo(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2 */}
          {isStep2&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                {sheets.map((s,i)=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:1}}>
                    <button onClick={()=>setActiveSheetId(s.id)} style={{padding:"5px 11px",borderRadius:8,border:"none",cursor:"pointer",background:activeSheetId===s.id?stepColor:"#e2e8f0",color:activeSheetId===s.id?"#fff":C.slate,fontSize:12,fontWeight:700}}>
                      {s.result||((s.extraHazards||[]).length>0)?"✅ ":""}{s.workArea?s.workArea.slice(0,7)+(s.workArea.length>7?"..":""):`공정 ${i+1}`}
                    </button>
                    {sheets.length>1&&<button onClick={()=>removeSheet(s.id)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:14,cursor:"pointer",padding:"0 2px"}}>×</button>}
                  </div>
                ))}
                <button onClick={addSheet} style={{padding:"5px 11px",borderRadius:8,border:`1.5px dashed ${C.accent}`,background:`${C.accent}08`,color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 공정 추가</button>
              </div>
              <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy}}>🏭 {activeSheet.workArea||`공정 ${sheets.findIndex(s=>s.id===activeSheetId)+1}`}</div>
                  <button onClick={()=>setShowScenario(true)} style={{padding:"4px 9px",background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:8,color:C.amber,fontSize:11,fontWeight:700,cursor:"pointer"}}>🏭 시나리오</button>
                </div>
                {SHEET_FIELDS.map(f=>(
                  <div key={f.key} style={{marginBottom:9}}>
                    <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:3}}>
                      {f.label}
                      {f.isNew&&<span style={{fontSize:9,color:"#fff",fontWeight:700,marginLeft:5,background:C.purple,padding:"1px 5px",borderRadius:8}}>NEW</span>}
                    </label>
                    <input value={activeSheet[f.key]||""} onChange={e=>updateSheet(activeSheetId,f.key,e.target.value)} placeholder={f.placeholder} style={{width:"100%",padding:"8px 11px",borderRadius:9,border:`1.5px solid ${activeSheet[f.key]&&f.key!=="workArea"?"rgba(34,197,94,0.4)":f.isNew?`${C.purple}30`:"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <button onClick={()=>callAIForSheet(activeSheet)} disabled={!!sheetLoading[activeSheetId]} style={{width:"100%",padding:"11px",background:sheetLoading[activeSheetId]?"rgba(245,158,11,0.3)":`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:sheetLoading[activeSheetId]?"not-allowed":"pointer"}}>
                  {sheetLoading[activeSheetId]?"⏳ AI 위험요인 파악 중...":"🤖 이 공정 위험요인 AI 파악"}
                </button>
                {activeSheet.result&&(
                  <div style={{marginTop:10,background:"#f8fafc",borderRadius:9,padding:"11px",border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:5}}>✅ 위험요인 파악 완료</div>
                    <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:12,lineHeight:1.7,color:"#374151",margin:0,fontFamily:"'Noto Sans KR',sans-serif",maxHeight:180,overflow:"auto"}}>{activeSheet.result}</pre>
                  </div>
                )}
                {/* 추가 위험요인 */}
                <div style={{marginTop:12,borderTop:"1.5px dashed #e2e8f0",paddingTop:12}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.navy}}>✏️ 추가 위험요인 직접 입력</div>
                    <button onClick={()=>addExtraHazard(activeSheetId)} style={{padding:"5px 10px",background:`linear-gradient(135deg,${C.amber},${C.amber}cc)`,border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ 추가</button>
                  </div>
                  {(activeSheet.extraHazards||[]).length===0&&(
                    <div style={{textAlign:"center",padding:"12px 0",background:"rgba(245,158,11,0.04)",border:`1.5px dashed ${C.amber}25`,borderRadius:9,fontSize:11,color:"#94a3b8"}}>AI가 놓친 현장 위험요인을 직접 추가하세요</div>
                  )}
                  {(activeSheet.extraHazards||[]).map((h,idx)=>(
                    <div key={h.id} style={{background:"rgba(245,158,11,0.04)",border:`1.5px solid ${C.amber}25`,borderRadius:10,padding:"11px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontSize:11,fontWeight:700,color:C.amber}}>추가 {idx+1}</span>
                        <button onClick={()=>removeExtraHazard(activeSheetId,h.id)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:15,cursor:"pointer"}}>×</button>
                      </div>
                      {[{f:"situation",l:"작업상황/위험요인",p:"예: 야간 단독 전기작업 중 감전 위험"},{f:"cause",l:"원인",p:"예: 잔류전압 미확인, 절연장갑 미착용"},{f:"prevention",l:"개선 대책",p:"예: 작업 전 전원 차단 확인"}].map(row=>(
                        <div key={row.f} style={{marginBottom:6}}>
                          <label style={{fontSize:11,fontWeight:700,color:"#374151",display:"block",marginBottom:2}}>{row.l}</label>
                          <input value={h[row.f]||""} onChange={e=>updateExtraHazard(activeSheetId,h.id,row.f,e.target.value)} placeholder={row.p} style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1.5px solid ${C.amber}20`,fontSize:12,color:C.navy,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:`${C.accent}08`,border:`1px solid ${C.accent}20`,borderRadius:11,padding:"10px 13px",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:C.accent}}>{sheets.filter(s=>s.result||(s.extraHazards||[]).length>0).length}/{sheets.length} 공정 완료</div>
              </div>
              <button onClick={()=>{const r=getAllSheetsResult();if(!r){alert("최소 1개 공정의 위험요인을 먼저 파악해주세요!");return;}setResult(r);setResults(prev=>({...prev,[2]:r}));setCompletedSteps(prev=>prev.includes(2)?prev:[...prev,2]);setScreen("step-result");}} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                📋 전체 결과 확인 및 다음 단계로
              </button>
            </div>
          )}

          {/* 나머지 STEP */}
          {!isStep2&&(
            <div>
              <div style={{background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>{activeStep.icon} 이 단계 전용 정보</div>
                {activeStep.hasScenario&&<button onClick={()=>setShowScenario(true)} style={{width:"100%",padding:"8px",marginBottom:10,background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:9,color:C.amber,fontSize:12,fontWeight:700,cursor:"pointer"}}>🏭 업종별 시나리오로 자동완성</button>}
                {activeStep.uniqueFields&&activeStep.uniqueFields.map(f=>{
                  if(f.key==="hazards"){
                    const isAuto=!!(stepData[f.key]&&results[2]&&stepData[f.key].startsWith(results[2].slice(0,30)));
                    return (
                      <div key={f.key} style={{marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                          <label style={{fontSize:12,fontWeight:700,color:"#374151"}}>{f.label}</label>
                          {isAuto&&<span style={{fontSize:10,color:"#fff",fontWeight:700,background:C.green,padding:"1px 6px",borderRadius:8}}>STEP2 자동입력</span>}
                        </div>
                        <textarea value={stepData[f.key]||""} onChange={e=>setStepData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={4}
                          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${isAuto?"rgba(34,197,94,0.4)":"#e2e8f0"}`,fontSize:12,color:C.navy,outline:"none",background:isAuto?"rgba(34,197,94,0.03)":"#f8fafc",boxSizing:"border-box",resize:"vertical",lineHeight:1.6,fontFamily:"'Noto Sans KR',sans-serif"}}/>
                        <div style={{marginTop:10,borderTop:"1.5px dashed #e2e8f0",paddingTop:10}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.navy}}>✏️ 시나리오 추가 입력</div>
                            <button onClick={()=>setStepData(p=>({...p,extraScenarios:[...(p.extraScenarios||[]),{id:Date.now(),scenario:"",risk:"",measure:""}]}))} style={{padding:"5px 10px",background:`linear-gradient(135deg,${C.accent},${C.accent}cc)`,border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ 추가</button>
                          </div>
                          {(stepData.extraScenarios||[]).length===0&&<div style={{textAlign:"center",padding:"10px 0",background:`rgba(14,165,233,0.04)`,border:`1.5px dashed ${C.accent}25`,borderRadius:9,fontSize:11,color:"#94a3b8"}}>추가할 위험 시나리오가 있으면 버튼을 눌러주세요</div>}
                          {(stepData.extraScenarios||[]).map((es,idx)=>(
                            <div key={es.id} style={{background:`rgba(14,165,233,0.04)`,border:`1.5px solid ${C.accent}20`,borderRadius:10,padding:"11px",marginBottom:8}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                                <span style={{fontSize:11,fontWeight:700,color:C.accent}}>추가 시나리오 {idx+1}</span>
                                <button onClick={()=>setStepData(p=>({...p,extraScenarios:(p.extraScenarios||[]).filter(e=>e.id!==es.id)}))} style={{background:"none",border:"none",color:"#94a3b8",fontSize:15,cursor:"pointer"}}>×</button>
                              </div>
                              {[{field:"scenario",label:"작업상황→위험요인→재해유형",placeholder:"예: 야간 전기작업→잔류전압→감전"},{field:"risk",label:"가능성×중대성",placeholder:"예: 가능성 중(2)×중대성 상(3)=위험성 6→허용불가"},{field:"measure",label:"필요 조치",placeholder:"예: 전원 차단 확인, 절연장갑 착용"}].map(row=>(
                                <div key={row.field} style={{marginBottom:6}}>
                                  <label style={{fontSize:11,fontWeight:700,color:"#374151",display:"block",marginBottom:2}}>{row.label}</label>
                                  <input value={es[row.field]||""} onChange={e=>setStepData(p=>({...p,extraScenarios:(p.extraScenarios||[]).map(s=>s.id===es.id?{...s,[row.field]:e.target.value}:s)}))} placeholder={row.placeholder} style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1.5px solid ${C.accent}18`,fontSize:12,color:C.navy,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={f.key} style={{marginBottom:10}}>
                      <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:4}}>{f.label}</label>
                      <input value={stepData[f.key]||""} onChange={e=>setStepData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,color:C.navy,outline:"none",background:"#f8fafc",boxSizing:"border-box"}}/>
                    </div>
                  );
                })}
              </div>
              <button onClick={async()=>{
                if(isStep1){setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);}
                const extras=(stepData.extraScenarios||[]).filter(e=>e.scenario);
                let finalData=stepData;
                if(extras.length>0){
                  const lines=extras.map((e,i)=>[`${i+1}. ${e.scenario}`,e.risk?`   위험성: ${e.risk}`:"",e.measure?`   조치: ${e.measure}`:""].filter(Boolean).join("\n")).join("\n");
                  finalData={...stepData,hazards:(stepData.hazards||"")+"\n\n【추가 시나리오】\n"+lines};
                  setStepData(finalData);
                }
                setScreen("step-result");
                trackAction("ai-generate");
                trackAction(`step-${activeStep.id}`);
                await callAI(activeStep.prompt,finalData);
                setCompletedSteps(prev=>prev.includes(activeStep.id)?prev:[...prev,activeStep.id]);
              }} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                🤖 AI 문서 자동 작성
              </button>
            </div>
          )}
        </div>

        {/* 시나리오 모달 */}
        {showScenario&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setShowScenario(false)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",width:"100%",maxWidth:560}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:15,fontWeight:800,color:C.navy,marginBottom:14}}>🏭 업종 선택</div>
              {Object.entries(INDUSTRY_SCENARIOS).map(([name,sc])=>(
                <button key={name} onClick={()=>applyScenario(name)} style={{width:"100%",background:"#f8fafc",border:"2px solid #e2e8f0",borderRadius:11,padding:"11px 13px",textAlign:"left",cursor:"pointer",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{name}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{sc.hazards.slice(0,4).join(" · ")}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {showProfileModal&&<ProfileModal baseInfo={baseInfo} setBaseInfo={setBaseInfo} onClose={async()=>{setBaseConfirmed(true);await saveStorage("company-profile",baseInfo);setShowProfileModal(false);}}/>}
      </div>
    );
  }

  return null;
}

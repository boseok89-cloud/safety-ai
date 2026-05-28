import React, { useState, useEffect } from "react";

const C = { navy:"#0f2640", blue:"#1a3a5c", accent:"#0ea5e9", green:"#22c55e", amber:"#f59e0b", red:"#ef4444", slate:"#64748b", bg:"#f0f4f8", purple:"#8b5cf6" };

const ADMIN_PASSWORD = "safety2026!";

async function loadStorage(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"16px",flex:1,minWidth:140,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:800,color:color||C.navy}}>{value}</div>
      <div style={{fontSize:12,fontWeight:700,color:C.slate,marginTop:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map((d,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:90,fontSize:11,color:C.slate,textAlign:"right",flexShrink:0}}>{d.label}</div>
          <div style={{flex:1,background:"#f0f4f8",borderRadius:6,height:22,overflow:"hidden"}}>
            <div style={{width:`${(d.value/max)*100}%`,background:color||C.accent,height:"100%",borderRadius:6,display:"flex",alignItems:"center",paddingLeft:8,transition:"width 0.6s ease"}}>
              {d.value>0&&<span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{d.value}</span>}
            </div>
          </div>
          {d.value===0&&<span style={{fontSize:11,color:"#cbd5e1"}}>0</span>}
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); }
    else { setPwError(true); setTimeout(()=>setPwError(false), 2000); }
  };

  useEffect(() => {
    if (authed) loadStats();
  }, [authed]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const visits   = await loadStorage("stat-visits")   || [];
      const actions  = await loadStorage("stat-actions")  || {};
      const evals    = await loadStorage("eval-history")  || [];
      const accidents= await loadStorage("accident-reports") || [];
      const tbms     = await loadStorage("tbm-records")   || [];
      const profile  = await loadStorage("company-profile");

      // 방문 통계
      const today = new Date().toLocaleDateString("ko-KR");
      const todayVisits = Array.isArray(visits) ? visits.filter(v=>v.date===today).length : 0;
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
      const weekVisits = Array.isArray(visits) ? visits.filter(v=>new Date(v.ts)>=weekAgo).length : 0;

      // 날짜별 방문 (최근 7일)
      const dailyMap = {};
      for (let d=6; d>=0; d--) {
        const dt = new Date(); dt.setDate(dt.getDate()-d);
        const key = dt.toLocaleDateString("ko-KR");
        dailyMap[key] = 0;
      }
      if (Array.isArray(visits)) {
        visits.forEach(v=>{ if(dailyMap[v.date]!==undefined) dailyMap[v.date]++; });
      }
      const dailyVisits = Object.entries(dailyMap).map(([date,count])=>({
        label: date.slice(5), value: count
      }));

      // 기능별 사용
      const featureData = [
        { label:"위험성평가", value: actions["eval"]||0, icon:"📋", color:C.accent },
        { label:"AI 문서생성", value: actions["ai-generate"]||0, icon:"🤖", color:C.purple },
        { label:"사고보고서", value: accidents.length || 0, icon:"📝", color:C.red },
        { label:"TBM 회의록", value: tbms.length || 0, icon:"📋", color:C.green },
        { label:"중대재해 사이렌", value: actions["siren-copy"]||0, icon:"🚨", color:"#dc2626" },
        { label:"수시평가", value: actions["urgent-eval"]||0, icon:"🔄", color:C.amber },
        { label:"PDF 저장", value: actions["pdf-save"]||0, icon:"🖨️", color:"#7c3aed" },
      ];

      // STEP별 완료율
      const stepStats = [1,2,3,4,5,6].map(id=>({
        label:`STEP ${id}`, value: actions[`step-${id}`]||0
      }));

      // 업종 분포
      const industryMap = {};
      if (Array.isArray(evals)) {
        evals.forEach(e=>{
          const ind = e.industry||"미입력";
          industryMap[ind] = (industryMap[ind]||0)+1;
        });
      }
      const industryData = Object.entries(industryMap)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5)
        .map(([label,value])=>({label,value}));

      setStats({
        totalVisits: visits.length || 0,
        todayVisits,
        weekVisits,
        dailyVisits,
        featureData,
        stepStats,
        industryData,
        totalEvals: evals.length || 0,
        totalAccidents: accidents.length || 0,
        totalTbms: tbms.length || 0,
        lastVisit: (Array.isArray(visits) && visits.length>0) ? visits[visits.length-1].date : "-",
        companyProfile: profile,
        recentEvals: Array.isArray(evals) ? evals.slice(0,5) : [],
      });
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!authed) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Sans KR',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",width:"100%",maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🔐</div>
          <div style={{fontSize:18,fontWeight:800,color:C.navy}}>관리자 페이지</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>산업안전 AI 시스템</div>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e=>{setPw(e.target.value);setPwError(false);}}
          onKeyDown={e=>e.key==="Enter"&&login()}
          placeholder="관리자 비밀번호"
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${pwError?"#ef4444":"#e2e8f0"}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12,color:C.navy}}
        />
        {pwError&&<div style={{color:"#ef4444",fontSize:12,marginBottom:8,textAlign:"center"}}>비밀번호가 틀렸어요</div>}
        <button onClick={login} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.navy},${C.blue})`,border:"none",borderRadius:11,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          로그인
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#cbd5e1"}}>
          safety-ai-blond.vercel.app/admin
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif"}}>
      {/* 헤더 */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#fff",fontSize:15,fontWeight:800}}>📊 관리자 대시보드</div>
          <div style={{color:"rgba(255,255,255,0.55)",fontSize:11,marginTop:1}}>산업안전 AI 시스템</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={loadStats} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:12,cursor:"pointer"}}>🔄 새로고침</button>
          <button onClick={()=>setAuthed(false)} style={{background:"rgba(239,68,68,0.2)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:12,cursor:"pointer"}}>로그아웃</button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{maxWidth:600,margin:"0 auto",padding:"10px 14px 0"}}>
        <div style={{display:"flex",background:"#e2e8f0",borderRadius:11,padding:3,gap:2,marginBottom:14}}>
          {[{k:"overview",l:"📊 현황"},{k:"features",l:"⚙️ 기능별"},{k:"data",l:"📋 데이터"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:tab===t.k?"#fff":"transparent",color:tab===t.k?C.navy:C.slate,fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.l}</button>
          ))}
        </div>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <div style={{fontWeight:600}}>데이터 불러오는 중...</div>
        </div>
      ):stats&&(
        <div style={{maxWidth:600,margin:"0 auto",padding:"0 14px 40px"}}>

          {/* ── 현황 탭 ── */}
          {tab==="overview"&&(
            <div>
              {/* 핵심 지표 */}
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                <StatCard icon="👥" label="총 방문" value={stats.totalVisits} sub="누적" color={C.accent}/>
                <StatCard icon="📅" label="오늘 방문" value={stats.todayVisits} sub="today" color={C.green}/>
                <StatCard icon="📆" label="7일 방문" value={stats.weekVisits} sub="이번주" color={C.purple}/>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <StatCard icon="📋" label="위험성평가" value={stats.totalEvals} sub="생성 횟수" color={C.accent}/>
                <StatCard icon="📝" label="사고보고서" value={stats.totalAccidents} sub="등록 건수" color={C.red}/>
                <StatCard icon="📋" label="TBM 회의록" value={stats.totalTbms} sub="작성 건수" color={C.green}/>
              </div>

              {/* 일별 방문 차트 */}
              <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>📈 최근 7일 방문자</div>
                {stats.dailyVisits.every(d=>d.value===0)?(
                  <div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8",fontSize:12}}>
                    아직 방문 데이터가 없어요<br/>
                    <span style={{fontSize:11,marginTop:4,display:"block"}}>App.jsx에 통계 수집 코드를 추가해야 해요 👇</span>
                  </div>
                ):(
                  <BarChart data={stats.dailyVisits} color={C.accent}/>
                )}
              </div>

              {/* 업종 분포 */}
              {stats.industryData.length>0&&(
                <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>🏭 업종별 사용 현황</div>
                  <BarChart data={stats.industryData} color={C.amber}/>
                </div>
              )}

              {/* STEP 완료율 */}
              <div style={{background:"#fff",borderRadius:14,padding:"16px"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>📋 위험성평가 STEP별 완료 횟수</div>
                <BarChart data={stats.stepStats} color={C.green}/>
              </div>
            </div>
          )}

          {/* ── 기능별 탭 ── */}
          {tab==="features"&&(
            <div>
              <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:14}}>⚙️ 기능별 사용 횟수</div>
                {stats.featureData.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<stats.featureData.length-1?"1px solid #f0f4f8":"none"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${f.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{f.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{f.label}</div>
                      <div style={{background:"#f0f4f8",borderRadius:6,height:8,marginTop:5,overflow:"hidden"}}>
                        <div style={{width:`${Math.min((f.value/Math.max(...stats.featureData.map(x=>x.value),1))*100,100)}%`,background:f.color,height:"100%",borderRadius:6,transition:"width 0.6s"}}/>
                      </div>
                    </div>
                    <div style={{fontSize:18,fontWeight:800,color:f.color,minWidth:30,textAlign:"right"}}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* 통계 수집 안내 */}
              <div style={{background:`rgba(245,158,11,0.08)`,border:`1.5px solid rgba(245,158,11,0.2)`,borderRadius:12,padding:"14px"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#92400e",marginBottom:6}}>⚠️ 통계 수집 활성화 필요</div>
                <div style={{fontSize:12,color:"#78350f",lineHeight:1.7}}>
                  App.jsx에 아래 코드를 추가하면 실시간으로 통계가 수집돼요.<br/>
                  <code style={{background:"rgba(0,0,0,0.06)",padding:"1px 5px",borderRadius:4,fontSize:11}}>trackAction("eval")</code> 형태로 각 기능 버튼에 추가하세요.
                </div>
              </div>
            </div>
          )}

          {/* ── 데이터 탭 ── */}
          {tab==="data"&&(
            <div>
              {/* 최근 평가 이력 */}
              <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>📋 최근 위험성평가 이력</div>
                {stats.recentEvals.length===0?(
                  <div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8",fontSize:12}}>이력이 없어요</div>
                ):stats.recentEvals.map((e,i)=>(
                  <div key={i} style={{padding:"10px 0",borderBottom:i<stats.recentEvals.length-1?"1px solid #f0f4f8":"none"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{e.step||"평가"}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{e.date}</div>
                    </div>
                    <div style={{fontSize:11,color:C.slate}}>{e.company}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{e.preview}</div>
                  </div>
                ))}
              </div>

              {/* 사업장 프로필 현황 */}
              <div style={{background:"#fff",borderRadius:14,padding:"16px",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>🏢 등록된 사업장 프로필</div>
                {stats.companyProfile?(
                  <div>
                    {[
                      {label:"사업장명", value:stats.companyProfile.company},
                      {label:"업종", value:stats.companyProfile.industry},
                      {label:"근로자수", value:stats.companyProfile.workers},
                      {label:"안전관리자", value:stats.companyProfile.manager},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                        <div style={{width:70,fontSize:12,fontWeight:700,color:"#94a3b8",flexShrink:0}}>{r.label}</div>
                        <div style={{fontSize:12,color:C.navy,fontWeight:600}}>{r.value||"-"}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"16px 0",color:"#94a3b8",fontSize:12}}>프로필 미등록</div>
                )}
              </div>

              {/* 원시 데이터 초기화 */}
              <div style={{background:"rgba(239,68,68,0.05)",border:"1.5px solid rgba(239,68,68,0.15)",borderRadius:12,padding:"14px"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>🗑️ 통계 데이터 초기화</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>방문 기록과 사용 통계만 삭제 (평가 이력·보고서는 유지)</div>
                <button onClick={async()=>{
                  if(window.confirm("통계 데이터를 초기화할까요?")) {
                    try {
                      await window.storage.delete("stat-visits");
                      await window.storage.delete("stat-actions");
                      alert("초기화 완료!");
                      loadStats();
                    } catch(e){ alert("오류: "+e); }
                  }
                }} style={{padding:"8px 16px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:C.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

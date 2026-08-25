import { useState, useEffect } from "react";
import { EXAM_BANK } from "./examBank";

const C = {
  bg:"#0a0e1a", surface:"#111827", card:"#1a2235", border:"#1e3a5f",
  accent:"#3b82f6", gold:"#f59e0b", green:"#10b981", red:"#ef4444",
  purple:"#8b5cf6", text:"#e2e8f0", muted:"#64748b", highlight:"#60a5fa",
  orange:"#f97316", cyan:"#06b6d4",
};

const CAT_COLORS = {
  "안전관리":C.accent, "기계설비":C.green, "보호구":C.gold,
  "위험성평가":C.red, "역학재료":C.purple, "법령":C.orange, "설비진단":C.cyan,
};
const CATEGORIES = ["전체","안전관리","기계설비","보호구","위험성평가","역학재료","법령","설비진단"];

// ── SVG 현장 그림 모음 ──────────────────────────────────────
const SVG_SCENES = {
  // 크레인 방호장치
  crane: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 크레인 구조 */}
      <rect x="140" y="20" width="10" height="120" fill="#4a7fa5"/>
      <rect x="80" y="20" width="80" height="8" fill="#4a7fa5"/>
      <line x1="85" y1="28" x2="145" y2="60" stroke="#6b9fc4" strokeWidth="2"/>
      {/* 호이스트 */}
      <rect x="125" y="60" width="30" height="20" fill="#2563eb" rx="4"/>
      {/* 와이어 */}
      <line x1="140" y1="80" x2="140" y2="130" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4,2"/>
      {/* 훅 */}
      <path d="M134,130 Q140,145 146,130" stroke="#f59e0b" strokeWidth="2.5" fill="none"/>
      {/* 화물 */}
      <rect x="120" y="145" width="40" height="30" fill="#374151" rx="3"/>
      {/* 방호장치 태그 */}
      <rect x="168" y="55" width="90" height="18" fill="#1e3a5f" rx="4"/>
      <text x="172" y="67" fill="#60a5fa" fontSize="9" fontFamily="sans-serif">① 권과방지장치</text>
      <rect x="168" y="78" width="90" height="18" fill="#1e3a5f" rx="4"/>
      <text x="172" y="90" fill="#10b981" fontSize="9" fontFamily="sans-serif">② 과부하방지장치</text>
      <rect x="168" y="101" width="90" height="18" fill="#1e3a5f" rx="4"/>
      <text x="172" y="113" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">③ 훅 해지장치</text>
      <rect x="168" y="124" width="90" height="18" fill="#1e3a5f" rx="4"/>
      <text x="172" y="136" fill="#ef4444" fontSize="9" fontFamily="sans-serif">④ 비상정지장치</text>
      <rect x="168" y="147" width="90" height="18" fill="#1e3a5f" rx="4"/>
      <text x="172" y="159" fill="#c084fc" fontSize="9" fontFamily="sans-serif">⑤ 레일정지기구</text>
      {/* 연결선 */}
      <line x1="155" y1="65" x2="168" y2="64" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="155" y1="75" x2="168" y2="87" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="147" y1="133" x2="168" y2="110" stroke="#1e3a5f" strokeWidth="1"/>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">크레인 방호장치 5종</text>
    </svg>
  ),

  // 프레스 방호장치
  press: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 프레스 본체 */}
      <rect x="80" y="20" width="100" height="30" fill="#374151" rx="4"/>
      <rect x="90" y="50" width="80" height="60" fill="#1f2937" rx="2"/>
      {/* 슬라이드 */}
      <rect x="100" y="80" width="60" height="20" fill="#4b5563" rx="2"/>
      {/* 다이 */}
      <rect x="90" y="130" width="80" height="20" fill="#374151" rx="2"/>
      {/* 테이블 */}
      <rect x="70" y="150" width="120" height="10" fill="#4b5563"/>
      {/* 다리 */}
      <rect x="75" y="160" width="10" height="40" fill="#374151"/>
      <rect x="175" y="160" width="10" height="40" fill="#374151"/>
      {/* 방호장치 태그 */}
      <rect x="5" y="30" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="41" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">게이트가드식</text>
      <rect x="5" y="52" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="63" fill="#10b981" fontSize="8" fontFamily="sans-serif">양수조작식</text>
      <rect x="5" y="74" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="85" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">감응식(광전자)</text>
      <rect x="5" y="96" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="107" fill="#ef4444" fontSize="8" fontFamily="sans-serif">수인식</text>
      <rect x="5" y="118" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="129" fill="#c084fc" fontSize="8" fontFamily="sans-serif">손쳐내기식</text>
      {/* 연결선 */}
      <line x1="75" y1="38" x2="90" y2="55" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="60" x2="90" y2="75" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="82" x2="90" y2="90" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="104" x2="90" y2="95" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="126" x2="90" y2="110" stroke="#1e3a5f" strokeWidth="1"/>
      {/* 안전거리 표시 */}
      <line x1="210" y1="80" x2="250" y2="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="210" y="76" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">Ds=1.6Tm</text>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">프레스 방호장치 5종</text>
    </svg>
  ),

  // 보일러 구조
  boiler: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 보일러 몸체 */}
      <ellipse cx="130" cy="110" rx="70" ry="85" fill="#1f2937" stroke="#4a7fa5" strokeWidth="2"/>
      {/* 안전밸브 */}
      <rect x="108" y="22" width="12" height="20" fill="#ef4444" rx="2"/>
      <rect x="104" y="18" width="20" height="6" fill="#ef4444" rx="1"/>
      {/* 압력게이지 */}
      <circle cx="170" cy="80" r="12" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="158" y1="80" x2="170" y2="80" stroke="#6b9fc4" strokeWidth="1"/>
      {/* 수면계 */}
      <rect x="55" y="70" width="8" height="60" fill="#0ea5e9" opacity="0.6" rx="2"/>
      <rect x="53" y="68" width="12" height="4" fill="#4b5563"/>
      <rect x="53" y="130" width="12" height="4" fill="#4b5563"/>
      {/* 급수밸브 */}
      <rect x="58" y="145" width="20" height="10" fill="#10b981" rx="2"/>
      {/* 방출밸브 */}
      <rect x="108" y="185" width="12" height="18" fill="#f97316" rx="2"/>
      {/* 버너 */}
      <rect x="85" y="188" width="30" height="8" fill="#dc2626" rx="2"/>
      {/* 태그 */}
      <rect x="195" y="18" width="110" height="16" fill="#1e3a5f" rx="3"/>
      <text x="198" y="29" fill="#ef4444" fontSize="8.5" fontFamily="sans-serif">① 안전밸브(압력방출)</text>
      <rect x="195" y="40" width="110" height="16" fill="#1e3a5f" rx="3"/>
      <text x="198" y="51" fill="#60a5fa" fontSize="8.5" fontFamily="sans-serif">② 압력제한스위치</text>
      <rect x="195" y="62" width="110" height="16" fill="#1e3a5f" rx="3"/>
      <text x="198" y="73" fill="#0ea5e9" fontSize="8.5" fontFamily="sans-serif">③ 수면계(고저수위)</text>
      <rect x="195" y="84" width="110" height="16" fill="#1e3a5f" rx="3"/>
      <text x="198" y="95" fill="#10b981" fontSize="8.5" fontFamily="sans-serif">④ 화염검출기</text>
      <rect x="195" y="106" width="110" height="16" fill="#1e3a5f" rx="3"/>
      <text x="198" y="117" fill="#f97316" fontSize="8.5" fontFamily="sans-serif">⑤ 방출밸브(드레인)</text>
      <line x1="120" y1="26" x2="195" y2="26" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="170" y1="80" x2="195" y2="73" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="61" y1="100" x2="100" y2="90" stroke="#1e3a5f" strokeWidth="1"/>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">보일러 방호장치 5종</text>
    </svg>
  ),

  // 압력용기 응력
  pressure: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 원통 단면 */}
      <ellipse cx="160" cy="100" rx="80" ry="50" fill="none" stroke="#4a7fa5" strokeWidth="2.5"/>
      <ellipse cx="160" cy="100" rx="60" ry="35" fill="#1a2235" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,2"/>
      {/* 두께 표시 */}
      <line x1="80" y1="100" x2="100" y2="100" stroke="#f59e0b" strokeWidth="3"/>
      <text x="82" y="118" fill="#f59e0b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">t</text>
      {/* 원주방향 응력 화살표 */}
      <line x1="160" y1="50" x2="160" y2="20" stroke="#ef4444" strokeWidth="2"/>
      <polygon points="160,15 156,25 164,25" fill="#ef4444"/>
      <line x1="160" y1="150" x2="160" y2="180" stroke="#ef4444" strokeWidth="2"/>
      <polygon points="160,185 156,175 164,175" fill="#ef4444"/>
      <text x="168" y="25" fill="#ef4444" fontSize="9" fontFamily="sans-serif">σ₁ = Pd/2t</text>
      <text x="168" y="185" fill="#ef4444" fontSize="9" fontFamily="sans-serif">(원주방향)</text>
      {/* 축방향 응력 화살표 */}
      <line x1="80" y1="100" x2="50" y2="100" stroke="#10b981" strokeWidth="2"/>
      <polygon points="45,100 55,96 55,104" fill="#10b981"/>
      <line x1="240" y1="100" x2="270" y2="100" stroke="#10b981" strokeWidth="2"/>
      <polygon points="275,100 265,96 265,104" fill="#10b981"/>
      <text x="20" y="92" fill="#10b981" fontSize="9" fontFamily="sans-serif">σ₂=Pd/4t</text>
      <text x="20" y="115" fill="#10b981" fontSize="9" fontFamily="sans-serif">(축방향)</text>
      {/* 안전관점 */}
      <rect x="60" y="170" width="200" height="35" fill="#1e3a5f" rx="6"/>
      <text x="70" y="183" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">σ₁ = 2×σ₂ → 원주방향이 2배</text>
      <text x="70" y="198" fill="#60a5fa" fontSize="9" fontFamily="sans-serif">∴ 파열은 축방향으로 발생!</text>
      <text x="10" y="215" fill="#475569" fontSize="8" fontFamily="sans-serif">원통형 압력용기 응력 분석</text>
    </svg>
  ),

  // 안전모 구조
  helmet: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 안전모 외형 */}
      <path d="M80,140 Q80,60 160,50 Q240,60 240,140 Z" fill="#f59e0b" opacity="0.8"/>
      <rect x="70" y="138" width="180" height="12" fill="#d97706" rx="3"/>
      {/* 충격흡수재 */}
      <path d="M95,140 Q95,80 160,72 Q225,80 225,140 Z" fill="#1f2937" opacity="0.7"/>
      {/* 착장체 */}
      <path d="M110,140 L110,120 Q160,108 210,120 L210,140" fill="none" stroke="#60a5fa" strokeWidth="2"/>
      {/* 턱끈 */}
      <line x1="95" y1="148" x2="85" y2="175" stroke="#6b9fc4" strokeWidth="2"/>
      <line x1="225" y1="148" x2="235" y2="175" stroke="#6b9fc4" strokeWidth="2"/>
      <rect x="145" y="172" width="30" height="8" fill="#374151" rx="2"/>
      {/* 태그 */}
      <rect x="5" y="55" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="66" fill="#ef4444" fontSize="8.5" fontFamily="sans-serif">① 내관통성</text>
      <rect x="5" y="77" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="88" fill="#10b981" fontSize="8.5" fontFamily="sans-serif">② 충격흡수성</text>
      <rect x="5" y="99" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="110" fill="#60a5fa" fontSize="8.5" fontFamily="sans-serif">③ 내전압성</text>
      <rect x="5" y="121" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="132" fill="#f59e0b" fontSize="8.5" fontFamily="sans-serif">④ 내수성</text>
      <rect x="245" y="55" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="248" y="66" fill="#c084fc" fontSize="8.5" fontFamily="sans-serif">⑤ 난연성</text>
      <rect x="245" y="77" width="70" height="16" fill="#1e3a5f" rx="3"/>
      <text x="248" y="88" fill="#f97316" fontSize="8.5" fontFamily="sans-serif">⑥ 턱끈풀림</text>
      <line x1="75" y1="63" x2="110" y2="72" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="85" x2="110" y2="100" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="107" x2="115" y2="118" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="75" y1="129" x2="115" y2="135" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="245" y1="63" x2="210" y2="72" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="245" y1="85" x2="215" y2="168" stroke="#1e3a5f" strokeWidth="1"/>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">안전모 성능시험 6가지</text>
    </svg>
  ),

  // 지게차 안전
  forklift: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 지게차 몸체 */}
      <rect x="100" y="120" width="120" height="60" fill="#374151" rx="4"/>
      {/* 운전석 */}
      <rect x="150" y="90" width="60" height="35" fill="#1f2937" rx="4"/>
      {/* 헤드가드 */}
      <rect x="148" y="60" width="64" height="8" fill="#f59e0b" rx="2"/>
      <line x1="150" y1="68" x2="150" y2="90" stroke="#f59e0b" strokeWidth="3"/>
      <line x1="210" y1="68" x2="210" y2="90" stroke="#f59e0b" strokeWidth="3"/>
      {/* 마스트 */}
      <rect x="95" y="50" width="8" height="130" fill="#4a7fa5"/>
      <rect x="108" y="50" width="8" height="130" fill="#4a7fa5"/>
      {/* 포크 */}
      <rect x="60" y="140" width="48" height="8" fill="#6b7280"/>
      <rect x="60" y="155" width="48" height="8" fill="#6b7280"/>
      {/* 바퀴 */}
      <circle cx="130" cy="185" r="16" fill="#1f2937" stroke="#4b5563" strokeWidth="3"/>
      <circle cx="200" cy="185" r="16" fill="#1f2937" stroke="#4b5563" strokeWidth="3"/>
      {/* 태그 */}
      <rect x="225" y="55" width="88" height="16" fill="#1e3a5f" rx="3"/>
      <text x="228" y="66" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">① 헤드가드 설치</text>
      <rect x="225" y="77" width="88" height="16" fill="#1e3a5f" rx="3"/>
      <text x="228" y="88" fill="#10b981" fontSize="8" fontFamily="sans-serif">② 백레스트 설치</text>
      <rect x="225" y="99" width="88" height="16" fill="#1e3a5f" rx="3"/>
      <text x="228" y="110" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">③ 전조등·후미등</text>
      <rect x="225" y="121" width="88" height="16" fill="#1e3a5f" rx="3"/>
      <text x="228" y="132" fill="#ef4444" fontSize="8" fontFamily="sans-serif">④ 경보장치</text>
      <rect x="225" y="143" width="88" height="16" fill="#1e3a5f" rx="3"/>
      <text x="228" y="154" fill="#c084fc" fontSize="8" fontFamily="sans-serif">⑤ 안전벨트</text>
      <line x1="212" y1="63" x2="225" y2="63" stroke="#1e3a5f" strokeWidth="1"/>
      <line x1="212" y1="85" x2="225" y2="85" stroke="#1e3a5f" strokeWidth="1"/>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">지게차 안전장치</text>
    </svg>
  ),

  // 롤러기 위험점
  roller: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 롤러 2개 */}
      <circle cx="130" cy="110" r="50" fill="#1f2937" stroke="#4a7fa5" strokeWidth="2"/>
      <circle cx="200" cy="110" r="50" fill="#1f2937" stroke="#4a7fa5" strokeWidth="2"/>
      {/* 물림점 표시 */}
      <circle cx="165" cy="110" r="6" fill="#ef4444" opacity="0.9"/>
      <text x="155" y="100" fill="#ef4444" fontSize="9" fontFamily="sans-serif">물림점!</text>
      {/* 재료 진입 */}
      <rect x="20" y="105" width="60" height="10" fill="#6b7280" rx="2"/>
      <polygon points="75,105 90,110 75,115" fill="#f59e0b"/>
      {/* 화살표 */}
      <text x="25" y="98" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">재료 진입</text>
      {/* 역전방지 표시 */}
      <path d="M130,55 Q165,40 200,55" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4,2"/>
      <text x="130" y="40" fill="#10b981" fontSize="8" fontFamily="sans-serif">역전방지장치</text>
      {/* 비상정지줄 */}
      <line x1="80" y1="160" x2="250" y2="160" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,3"/>
      <text x="130" y="175" fill="#ef4444" fontSize="8.5" fontFamily="sans-serif">비상정지줄(복줄)</text>
      {/* 덮개 */}
      <path d="M100,60 Q165,30 230,60" stroke="#f59e0b" strokeWidth="2" fill="none"/>
      <text x="110" y="52" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">덮개(안전가드)</text>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">롤러기 위험점 및 방호장치</text>
    </svg>
  ),

  // 연삭기 안전
  grinder: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 연삭 숫돌 */}
      <circle cx="150" cy="100" r="65" fill="#374151" stroke="#6b7280" strokeWidth="3"/>
      <circle cx="150" cy="100" r="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
      {/* 덮개 */}
      <path d="M90,100 A60,60 0 0,1 210,100" stroke="#f59e0b" strokeWidth="3" fill="none"/>
      <text x="115" y="45" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">덮개(150°이상)</text>
      {/* 작업받침대 */}
      <rect x="195" y="95" width="50" height="10" fill="#10b981" rx="2"/>
      <text x="200" y="118" fill="#10b981" fontSize="8.5" fontFamily="sans-serif">작업받침대</text>
      <text x="200" y="130" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">(3mm이내)</text>
      {/* 비산방지판 */}
      <rect x="85" y="155" width="130" height="8" fill="#ef4444" rx="2"/>
      <text x="105" y="175" fill="#ef4444" fontSize="8.5" fontFamily="sans-serif">칩 비산방지판</text>
      {/* 플랜지 */}
      <circle cx="150" cy="100" r="20" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3,2"/>
      <text x="10" y="100" fill="#60a5fa" fontSize="8" fontFamily="sans-serif">플랜지</text>
      <text x="10" y="112" fill="#c084fc" fontSize="7.5" fontFamily="sans-serif">(숫돌지름1/3)</text>
      {/* 시운전 */}
      <rect x="5" y="140" width="75" height="16" fill="#1e3a5f" rx="3"/>
      <text x="8" y="151" fill="#f97316" fontSize="8" fontFamily="sans-serif">시운전 1분이상</text>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">연삭기 방호장치 및 안전기준</text>
    </svg>
  ),

  // FTA 결함수 분석
  fta: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 정상사상 */}
      <rect x="120" y="10" width="80" height="28" fill="#ef4444" rx="6"/>
      <text x="135" y="28" fill="#fff" fontSize="9" fontFamily="sans-serif" fontWeight="bold">정상사상(T)</text>
      {/* AND 게이트 */}
      <path d="M145,60 L175,60 Q185,60 185,70 Q185,80 175,80 L145,80 Z" fill="#3b82f6"/>
      <text x="152" y="73" fill="#fff" fontSize="9" fontFamily="sans-serif">AND</text>
      {/* OR 게이트 */}
      <path d="M60,130 Q60,120 75,118 Q90,120 90,130 Q90,140 75,142 Q60,140 60,130Z" fill="#10b981"/>
      <text x="66" y="134" fill="#fff" fontSize="9" fontFamily="sans-serif">OR</text>
      <path d="M225,130 Q225,120 240,118 Q255,120 255,130 Q255,140 240,142 Q225,140 225,130Z" fill="#10b981"/>
      <text x="231" y="134" fill="#fff" fontSize="9" fontFamily="sans-serif">OR</text>
      {/* 기본사상 */}
      <circle cx="50" cy="185" r="12" fill="#f59e0b"/>
      <circle cx="95" cy="185" r="12" fill="#f59e0b"/>
      <circle cx="215" cy="185" r="12" fill="#f59e0b"/>
      <circle cx="260" cy="185" r="12" fill="#f59e0b"/>
      {/* 연결선 */}
      <line x1="160" y1="38" x2="160" y2="60" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="160" y1="80" x2="75" y2="118" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="160" y1="80" x2="240" y2="118" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="75" y1="142" x2="50" y2="173" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="75" y1="142" x2="95" y2="173" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="240" y1="142" x2="215" y2="173" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="240" y1="142" x2="260" y2="173" stroke="#4b5563" strokeWidth="1.5"/>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">FTA(결함수 분석) 구조</text>
    </svg>
  ),

  // 욕조곡선
  bathtub: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 축 */}
      <line x1="30" y1="170" x2="300" y2="170" stroke="#4b5563" strokeWidth="1.5"/>
      <line x1="30" y1="30" x2="30" y2="170" stroke="#4b5563" strokeWidth="1.5"/>
      <text x="155" y="195" fill="#64748b" fontSize="9" fontFamily="sans-serif">시간(t)</text>
      <text x="5" y="100" fill="#64748b" fontSize="9" fontFamily="sans-serif" transform="rotate(-90,12,100)">고장률</text>
      {/* 욕조 곡선 */}
      <path d="M35,50 Q60,100 100,130 Q160,150 220,130 Q260,110 285,60" stroke="#3b82f6" strokeWidth="2.5" fill="none"/>
      {/* 영역 색칠 */}
      <path d="M35,50 Q60,100 100,130 L100,170 L35,170 Z" fill="#ef4444" opacity="0.2"/>
      <path d="M100,130 Q160,150 220,130 L220,170 L100,170 Z" fill="#10b981" opacity="0.2"/>
      <path d="M220,130 Q260,110 285,60 L285,170 L220,170 Z" fill="#f59e0b" opacity="0.2"/>
      {/* 구분선 */}
      <line x1="100" y1="30" x2="100" y2="170" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="220" y1="30" x2="220" y2="170" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 라벨 */}
      <text x="40" y="25" fill="#ef4444" fontSize="9" fontFamily="sans-serif">① 초기고장</text>
      <text x="40" y="36" fill="#ef4444" fontSize="8" fontFamily="sans-serif">(감소형)</text>
      <text x="128" y="25" fill="#10b981" fontSize="9" fontFamily="sans-serif">② 우발고장</text>
      <text x="128" y="36" fill="#10b981" fontSize="8" fontFamily="sans-serif">(일정형)</text>
      <text x="228" y="25" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">③ 마모고장</text>
      <text x="228" y="36" fill="#f59e0b" fontSize="8" fontFamily="sans-serif">(증가형)</text>
      <text x="10" y="210" fill="#475569" fontSize="8" fontFamily="sans-serif">기계설비 욕조곡선(Bathtub Curve)</text>
    </svg>
  ),

  // 재해예방 4원칙
  prevention: (
    <svg viewBox="0 0 320 220" style={{width:"100%",maxWidth:320}}>
      <rect width="320" height="220" fill="#0d1520" rx="12"/>
      {/* 중앙 원 */}
      <circle cx="160" cy="110" r="40" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2"/>
      <text x="140" y="106" fill="#60a5fa" fontSize="9" fontFamily="sans-serif" fontWeight="bold">재해예방</text>
      <text x="146" y="119" fill="#60a5fa" fontSize="9" fontFamily="sans-serif" fontWeight="bold">4원칙</text>
      {/* 4개 원칙 박스 */}
      <rect x="10" y="20" width="100" height="35" fill="#1e3a5f" rx="8"/>
      <text x="25" y="33" fill="#ef4444" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">① 손실우연의 원칙</text>
      <text x="20" y="47" fill="#94a3b8" fontSize="7.5" fontFamily="sans-serif">사고→손실은 우연히 결정</text>

      <rect x="210" y="20" width="100" height="35" fill="#1e3a5f" rx="8"/>
      <text x="218" y="33" fill="#10b981" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">② 원인계기의 원칙</text>
      <text x="220" y="47" fill="#94a3b8" fontSize="7.5" fontFamily="sans-serif">사고엔 반드시 원인 있음</text>

      <rect x="10" y="165" width="100" height="35" fill="#1e3a5f" rx="8"/>
      <text x="18" y="178" fill="#f59e0b" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">③ 예방가능의 원칙</text>
      <text x="20" y="192" fill="#94a3b8" fontSize="7.5" fontFamily="sans-serif">모든 사고는 예방 가능</text>

      <rect x="210" y="165" width="100" height="35" fill="#1e3a5f" rx="8"/>
      <text x="218" y="178" fill="#c084fc" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">④ 대책선정의 원칙</text>
      <text x="218" y="192" fill="#94a3b8" fontSize="7.5" fontFamily="sans-serif">가장 효과적 대책 선정</text>

      {/* 연결선 */}
      <line x1="110" y1="37" x2="128" y2="85" stroke="#ef4444" strokeWidth="1.5"/>
      <line x1="210" y1="37" x2="192" y2="85" stroke="#10b981" strokeWidth="1.5"/>
      <line x1="110" y1="182" x2="128" y2="138" stroke="#f59e0b" strokeWidth="1.5"/>
      <line x1="210" y1="182" x2="192" y2="138" stroke="#c084fc" strokeWidth="1.5"/>
    </svg>
  ),
};

// ── 250문제 + 챕터2 통합 데이터 ────────────────────────────
const TOPICS = [
  // ★★★★★ 5회 이상 출제
  {id:1,cat:"위험성평가",title:"위험성평가",keywords:["유해위험요인 파악","위험성 결정","감소대책 수립·실행","기록 보존","근로자 참여"],freq:5,level:"★★★★★",svg:"prevention"},
  {id:2,cat:"기계설비",title:"보일러 이상현상",keywords:["수격현상(Water Hammering)","캐리오버(Carry Over)","프라이밍","포밍","역화"],freq:5,level:"★★★★★",svg:"boiler"},
  {id:3,cat:"기계설비",title:"보일러 방호장치",keywords:["안전밸브(압력방출장치)","압력제한스위치","고저수위조절장치","화염검출기","방출밸브"],freq:5,level:"★★★★★",svg:"boiler"},
  {id:4,cat:"기계설비",title:"컨베이어 안전조치",keywords:["역전방지장치","비상정지장치(EMO)","이탈방지장치","기복장치","선반 다리"],freq:5,level:"★★★★★"},
  {id:5,cat:"기계설비",title:"크레인 방호장치",keywords:["과부하방지장치","권과방지장치","훅 해지장치","레일정지기구","비상정지장치"],freq:5,level:"★★★★★",svg:"crane"},
  {id:6,cat:"기계설비",title:"기어 각부 명칭과 크기표시",keywords:["이끝원(원주피치)","이뿌리원","피치원","모듈(M)","피치원지름(Pd)","백래시(Backlash)"],freq:5,level:"★★★★★"},
  {id:7,cat:"기계설비",title:"재해통계와 재해율",keywords:["연천인율(빈도율×1000)","도수율(빈도율)","강도율","환산강도율","종합재해지수(FSI=√도수율×강도율)"],freq:5,level:"★★★★★"},
  {id:8,cat:"역학재료",title:"재료의 파괴양식",keywords:["연성파괴","취성파괴","피로파괴(S-N곡선)","크리프파괴","응력부식파괴"],freq:5,level:"★★★★★"},
  {id:9,cat:"안전관리",title:"냉간가공과 열간가공",keywords:["재결정온도 기준","냉간:경도↑연신율↓","열간:가공이 쉬움","잔류응력","가공경화"],freq:5,level:"★★★★★"},
  {id:10,cat:"기계설비",title:"설비보전활동",keywords:["예방보전(PM)","시간기준보전(TBM)","상태기준보전(CBM)","사후보전(BM)","적응보전(AM)"],freq:5,level:"★★★★★"},
  {id:11,cat:"기계설비",title:"부식의 종류와 방지대책",keywords:["전기화학적 부식","응력부식","침식부식","음극방식","방식도료·라이닝"],freq:5,level:"★★★★★"},
  {id:12,cat:"기계설비",title:"와이어로프 안전계수",keywords:["안전계수=절단하중/최대허용하중","달기작업 10이상","이동식크레인 5이상","구조물 4이상","엘리베이터 10이상"],freq:5,level:"★★★★★"},
  {id:13,cat:"기계설비",title:"유압결합 재해유형·방호조치",keywords:["파열·누유","압력충격(서지)","방호덮개","압력제한밸브","체크밸브"],freq:5,level:"★★★★★"},
  {id:14,cat:"기계설비",title:"용접결합 종류와 발생원인",keywords:["치수상 결함(오버랩·언더컷)","구조상 결함","기공(Porosity)","슬래그 혼입","크랙(Crack)"],freq:5,level:"★★★★★"},
  {id:15,cat:"역학재료",title:"재해손실비용 종류와 산정방법",keywords:["하인리히 방식(직접비:간접비=1:4)","시몬스 방식","버즈 방식","노우제 방식","콤패스 방식(고정비+변동비)"],freq:5,level:"★★★★★"},
  {id:16,cat:"역학재료",title:"강의 열처리",keywords:["담금질(Quenching)-경도↑","뜨임(Tempering)-인성↑","풀림(Annealing)-연화","불림(Normalizing)-표준화","표면경화"],freq:5,level:"★★★★★"},
  {id:17,cat:"기계설비",title:"윤활유 사용목적·구비조건",keywords:["냉각·윤활·방청·세척작용","점도·점도지수 적합","유막강도","산화안정성","적정 인화점"],freq:5,level:"★★★★★"},
  {id:18,cat:"기계설비",title:"기계설비 재료의 기계적 성질",keywords:["인장강도","항복점","연신율","단면수축률","충격치(인성)","경도"],freq:5,level:"★★★★★"},
  {id:19,cat:"기계설비",title:"공진현상",keywords:["강제진동수=고유진동수","공진원인 3가지","공진특성(수평>수직)","공진대책","댐퍼 설치"],freq:5,level:"★★★★★"},
  {id:20,cat:"역학재료",title:"원통형 압력용기의 응력",keywords:["원주방향 응력 σ₁=Pd/2t","축방향 응력 σ₂=Pd/4t","σ₁=2σ₂(원주방향이 2배)","파열은 축방향으로"],freq:5,level:"★★★★★",svg:"pressure"},
  {id:21,cat:"역학재료",title:"크리프(Creep) 현상",keywords:["고온+지속하중→소성변형 증가","1차(천이)→2차(정상)→3차(가속)","크리프 한도","내열합금 사용"],freq:5,level:"★★★★★"},
  {id:22,cat:"기계설비",title:"아크용접 재해유형·방호조치",keywords:["감전(2차측 무부하전압)","유해광선(자외선·적외선)","흄(Fume)","화재폭발","방호조치(차광유리·방열판·환기)"],freq:5,level:"★★★★★"},

  // ★★★★ 4회 이상 출제
  {id:23,cat:"법령",title:"비파괴검사의 종류",keywords:["방사선투과(RT)-필름","초음파(UT)-탐촉자","자분탐상(MT)-자성체","침투탐상(PT)-비자성체","와전류(ET)"],freq:4,level:"★★★★"},
  {id:24,cat:"기계설비",title:"초음파 탐상시험(UT)",keywords:["투과법·반사법·공진법","장점:깊은결함 탐지 가능","단점:숙련도 필요","접촉매질 필요","탐상주파수 1~5MHz"],freq:4,level:"★★★★"},
  {id:25,cat:"기계설비",title:"기계설비 위험점 6가지",keywords:["협착점(Squeeze Point)","끼임점(Trapping Point)","절단점(Cutting Point)","접선물림점(Tangential Nip)","회전말림점","튀어나옴(Flying Chips)"],freq:4,level:"★★★★"},
  {id:26,cat:"기계설비",title:"기계설비의 안전화방안",keywords:["본질안전화(위험원 제거)","페일세이프(Fail Safe)","풀프루프(Fool Proof)","안전율","이중안전장치"],freq:4,level:"★★★★"},
  {id:27,cat:"기계설비",title:"기계설비의 방호장치",keywords:["격리형(완전밀폐)","위치제한형(거리)","접근거부형","접근반응형(광전자)","포집형(덮개)"],freq:4,level:"★★★★"},
  {id:28,cat:"역학재료",title:"S-N 곡선과 피로파괴",keywords:["S-N 곡선(응력-반복수)","피로한도(내구한도)","응력집중계수","표면상태","잔류응력 영향"],freq:4,level:"★★★★"},
  {id:29,cat:"역학재료",title:"강의 표면경화법",keywords:["침탄법(탄소 침투)","질화법(질소 침투)","화염경화법(국부가열)","고주파경화법","가스침탄법"],freq:4,level:"★★★★"},
  {id:30,cat:"기계설비",title:"나사의 풀림방지 방법",keywords:["로크너트(이중너트)","스프링와셔","분할핀","접착제(나사록)","용접·코터"],freq:4,level:"★★★★"},
  {id:31,cat:"기계설비",title:"프레스 방호장치",keywords:["게이트가드식","양수조작식(Ds=1.6Tm)","감응식(광전자)","수인식","손쳐내기식"],freq:4,level:"★★★★",svg:"press"},
  {id:32,cat:"기계설비",title:"프레스 재해유형 및 안전대책",keywords:["끼임(협착)","절단","낙하비래","감전","NO-hand in die","방호장치 선택기준"],freq:4,level:"★★★★",svg:"press"},
  {id:33,cat:"기계설비",title:"컨베이어 종류·위험성·안전장치",keywords:["벨트·체인·스크류·롤러·트롤리","역전방지장치","비상정지장치","이탈방지장치","방호덮개"],freq:4,level:"★★★★"},
  {id:34,cat:"기계설비",title:"산업용 로봇의 안전기능",keywords:["안전방호울타리(1.8m이상)","비상정지장치(EMO)","안전매트","로봇 작업범위 표시","LOTO 적용"],freq:4,level:"★★★★"},
  {id:35,cat:"기계설비",title:"공기 압축기 안전기준",keywords:["왕복동식·스크류식·터보식","안전밸브(최고사용압력×1.05배)","언로드밸브","자동운전장치","드레인밸브"],freq:4,level:"★★★★"},
  {id:36,cat:"기계설비",title:"리프트 종류·재재류형·안전기준",keywords:["건설용·산업용·이삿짐운반용","유압식·랙피니언식","권과방지장치","비상정지장치","과부하방지"],freq:4,level:"★★★★"},
  {id:37,cat:"기계설비",title:"펌프의 공동·서징·수격현상",keywords:["공동현상(Cavitation)-임펠러 손상","서징(Surging)-유량불안정","수격작용(Water Hammer)-압력충격","방지대책"],freq:4,level:"★★★★"},
  {id:38,cat:"법령",title:"제조물 책임법(PL법)",keywords:["결함 3가지(설계·제조·표시)","무과실책임","손해배상","결함의 증명","소멸시효"],freq:4,level:"★★★★"},
  {id:39,cat:"기계설비",title:"목재가공용 둥근톱 방호장치",keywords:["날 접촉예방장치(덮개)","분할날(반발 방지)","반발예방장치(Anti-Kickback)","가동식 덮개","비상정지"],freq:4,level:"★★★★"},
  {id:40,cat:"기계설비",title:"양수조작식 방호장치",keywords:["최소안전거리 Ds=1.6Tm","양수버튼 동시조작","한 손 떼면 즉시 정지","방호범위","설치조건"],freq:4,level:"★★★★",svg:"press"},
  {id:41,cat:"기계설비",title:"롤러기 작업안전수칙",keywords:["역전방지장치","비상정지줄(복줄)","덮개 설치","청소시 반드시 정지","급정지장치"],freq:4,level:"★★★★",svg:"roller"},
  {id:42,cat:"기계설비",title:"회전기계 진동원인(기계적)",keywords:["불평형(Unbalance)-가장多","축정렬불량(Misalignment)","공진","느슨함(Looseness)","베어링 불량"],freq:4,level:"★★★★"},
  {id:43,cat:"역학재료",title:"재해예방의 4원칙",keywords:["손실우연의 원칙","원인계기의 원칙","예방가능의 원칙","대책선정의 원칙(3E)"],freq:4,level:"★★★★",svg:"prevention"},
  {id:44,cat:"위험성평가",title:"위험성평가 기법(정성적·정량적)",keywords:["체크리스트·HAZOP·FMEA·What-if·PHA(정성)","FTA·ETA·CCA·LOPA(정량)"],freq:4,level:"★★★★"},
  {id:45,cat:"법령",title:"안전보건 경영시스템",keywords:["PDCA 사이클(Plan-Do-Check-Act)","ISO 45001","안전보건방침","위험성평가 연계","내부심사"],freq:4,level:"★★★★"},
  {id:46,cat:"법령",title:"RBI (위험기반검사)",keywords:["위험도=발생가능성×피해크기","정성적·정량적 분석","검사계획 수립","RCM 연계","FFS"],freq:4,level:"★★★★"},
  {id:47,cat:"안전관리",title:"재해예방 4원칙",keywords:["손실우연","원인계기","예방가능","대책선정(기술적·교육적·규제적 3E)"],freq:4,level:"★★★★",svg:"prevention"},
  {id:48,cat:"안전관리",title:"안전심리 5요소",keywords:["동기(Motive)","기질(Temper)","감정(Feeling)","습성(Habit)","숙관(Custom)","K.Lewin:B=f(P·E)"],freq:4,level:"★★★★"},
  {id:49,cat:"안전관리",title:"공장배치 3단계와 안전조건 5가지",keywords:["1단계:지역배치","2단계:건물배치","3단계:기계배치","안전조건:정리정돈·조명·통로·소화기·구급"],freq:4,level:"★★★★"},
  {id:50,cat:"법령",title:"산업안전보건법 정의",keywords:["산업재해","중대재해(사망·3일이상입원등)","사업주 의무","안전보건관리책임자","관리감독자"],freq:4,level:"★★★★"},
  {id:51,cat:"기계설비",title:"유해위험기계·기구 방호장치",keywords:["프레스·전단기","크레인·리프트","압력용기","원심기","국소배기장치"],freq:4,level:"★★★★"},
  {id:52,cat:"법령",title:"안전인증·자율안전확인",keywords:["안전인증(의무)","자율안전확인(신고)","자율검사프로그램","안전검사(정기)","표시방법"],freq:4,level:"★★★★"},
  {id:53,cat:"기계설비",title:"기계설비의 신뢰도",keywords:["신뢰도R(t)=e^(-λt)","고장률(λ)","MTBF=1/λ","MTTR","가용도A=MTBF/(MTBF+MTTR)"],freq:4,level:"★★★★"},

  // ★★★ 3회 이상 출제
  {id:54,cat:"기계설비",title:"압력용기 정의 및 주요구조부",keywords:["동체(Shell)","경판(Head)","노즐","안전밸브","지지구조(새들·러그)"],freq:3,level:"★★★"},
  {id:55,cat:"기계설비",title:"고소작업대 분류·위험요인·대책",keywords:["A형(전복선 내)·B형(전복선 밖)","1종~3종 분류","과부하·전도·추락","작업계획서 작성"],freq:3,level:"★★★"},
  {id:56,cat:"법령",title:"공정안전보고서(PSM)",keywords:["PSM 12대 실천사항","공정안전자료","위험성평가","안전운전계획","비상조치계획"],freq:3,level:"★★★"},
  {id:57,cat:"법령",title:"직업계획서 작성대상·내용",keywords:["고소작업차·차량계건설기계","작업방법·순서","작업지휘자","안전조치사항"],freq:3,level:"★★★"},
  {id:58,cat:"기계설비",title:"밀폐공간 작업안전",keywords:["산소농도 18%이상 확인","환기(1세제곱미터/분)","IDLH 농도","출입금지·감시인","구조장비 비치"],freq:3,level:"★★★"},
  {id:59,cat:"위험성평가",title:"FMEA(고장형태 영향분석)",keywords:["고장형태(Failure Mode)","고장영향","심각도(S)·발생도(O)·검출도(D)","위험우선순위(RPN=S×O×D)"],freq:3,level:"★★★"},
  {id:60,cat:"법령",title:"타워크레인 지지·고정방식",keywords:["벽체 지지방식","와이어로프 지지방식","A프레임·로프 방식","지지 3개 방법","기준"],freq:3,level:"★★★",svg:"crane"},
  {id:61,cat:"기계설비",title:"프레스 NO-hand in die",keywords:["위험한계 내 손 접근 방지","전용프레스","자동프레스","특수프레스","트랜스퍼 프레스"],freq:3,level:"★★★",svg:"press"},
  {id:62,cat:"기계설비",title:"절삭유의 사용목적·종류·구비조건",keywords:["냉각·윤활·방청·세척작용","불용성·유용성·혼합유","점도 적합","독성 없음","거품 적음"],freq:3,level:"★★★"},
  {id:63,cat:"기계설비",title:"연삭기 안전작업",keywords:["숫돌 결함 확인(타음검사)","덮개 150°이상","작업받침대 3mm이내","시운전 1분이상(신품 3분)","플랜지 1/3이상"],freq:3,level:"★★★",svg:"grinder"},
  {id:64,cat:"기계설비",title:"연삭기 플랜지 및 숫돌 설치기준",keywords:["플랜지=숫돌지름×1/3이상","두께 동일한 것","받침판(종이)","균형잡기","고정방법"],freq:3,level:"★★★",svg:"grinder"},
  {id:65,cat:"기계설비",title:"이동식 크레인 안전기준",keywords:["권과방지장치","과부하방지장치","아웃트리거 설치","안전인증","작업계획서 작성"],freq:3,level:"★★★",svg:"crane"},
  {id:66,cat:"기계설비",title:"타워크레인 안전작업",keywords:["설치·해체 특별안전교육","작업지휘자 선임","신호방법 및 요령","인양물 위험성","강풍 시 작업중지"],freq:3,level:"★★★",svg:"crane"},
  {id:67,cat:"기계설비",title:"가드의 구조상 분류 및 구비조건",keywords:["고정식가드(완전밀폐·작업점용)","가동식가드(이동형·간섭형·가동형)","조정식가드","구비조건"],freq:3,level:"★★★"},
  {id:68,cat:"역학재료",title:"강의 표면경화법 상세",keywords:["화염경화법(표면급냉)","고주파경화법(유도가열)","침탄법(C침투)","질화법(N침투)","가스침탄법"],freq:3,level:"★★★"},
  {id:69,cat:"기계설비",title:"양중기 종류",keywords:["스탠더·이동식크레인(호이스트 포함)","승강기(최대하중 0.5t이상)","리프트(0.15t이상)","곤돌라","이삿짐운반용 리프트"],freq:3,level:"★★★",svg:"crane"},
  {id:70,cat:"법령",title:"산업안전보건법 안전교육 규정용어",keywords:["단기간작업(2개월이내)","간헐적작업(연60일미만)","임시작업(월10시간이상24시간미만)","준시간작업"],freq:3,level:"★★★"},
  {id:71,cat:"기계설비",title:"타워크레인 설치작업순서",keywords:["기초앵커 설치→베이직마스트→텔레스코핑케이지→문선 정리→캣(터렛)헤드→항중등"],freq:3,level:"★★★",svg:"crane"},
  {id:72,cat:"기계설비",title:"구내운반차 작업시작전 점검사항",keywords:["전조등·후미등·방향지시기","제동장치","하역장치 이상유무","바퀴","충전장치"],freq:3,level:"★★★"},
  {id:73,cat:"기계설비",title:"지게차 작업시작전 점검사항",keywords:["제동장치·조향장치","하역장치(마스트·포크)","전조등·후미등","바퀴상태","헤드가드"],freq:3,level:"★★★",svg:"forklift"},
  {id:74,cat:"법령",title:"안전교육 교안 작성시 유의사항",keywords:["명확성(그림·도표 활용)","구체적(암기가능하게)","실용성(실천가능하도록)","논리적","평이성"],freq:3,level:"★★★"},
  {id:75,cat:"기계설비",title:"FTA (결함수 분석)",keywords:["정상사상(Top Event)","AND·OR 게이트","기본사상(Basic Event)","최소절단집합(MCS)","정량적 재해확률 계산"],freq:3,level:"★★★",svg:"fta"},
  {id:76,cat:"기계설비",title:"기계설비의 욕조곡선",keywords:["초기고장(감소형)-DFR","우발고장(일정형)-CFR","마모고장(증가형)-IFR","욕조곡선(Bathtub Curve)","예방보전 시점"],freq:3,level:"★★★",svg:"bathtub"},
  {id:77,cat:"기계설비",title:"버(Burr)와 디버링(Deburring)",keywords:["버(Burr)=제품 엣지에 생긴 얇은 돌출물","버의 문제점","브러싱·연마·수작업 제거법","블라스팅","자동화"],freq:3,level:"★★★"},
  {id:78,cat:"기계설비",title:"레이놀즈수",keywords:["Re=ρVd/μ=관성력/점성력","층류(Re<2100)","난류(Re>4000)","천이구역(2100<Re<4000)","무차원수"],freq:3,level:"★★★"},
  {id:79,cat:"법령",title:"안전보건관리책임자 직무",keywords:["안전보건관리규정 작성","위험성평가 실시","안전보건교육 실시","작업환경측정","건강진단","중대재해 조사"],freq:3,level:"★★★"},
  {id:80,cat:"기계설비",title:"승강기 구동 체인 안전장치",keywords:["과속조절기(조속기)","구동 체인 안전장치(래칫기구)","전자제동장치","비상정지장치","조속기"],freq:3,level:"★★★"},
  {id:81,cat:"법령",title:"도급에 따른 산업재해예방조치",keywords:["도급인 안전조치 의무","합동 안전보건점검","협의체 구성·운영","수급인 보호","연대책임"],freq:3,level:"★★★"},
  {id:82,cat:"기계설비",title:"에스컬레이터 안전장치",keywords:["역전방지장치","구동 체인 안전장치","스커트가드 안전장치","핸드레일 속도 동조","비상정지장치"],freq:3,level:"★★★"},
  {id:83,cat:"기계설비",title:"자동전락방지기(크레인)",keywords:["권과방지장치(권상용)","과부하방지장치","비상정지장치","훅 해지장치","적재하중 표시"],freq:3,level:"★★★",svg:"crane"},
  {id:84,cat:"역학재료",title:"금속재료의 기계적 성질",keywords:["인장강도·항복강도·연신율·경도","연성·취성·인성","피로강도","크리프강도","피로한도"],freq:3,level:"★★★"},
  {id:85,cat:"기계설비",title:"공장안전통로의 집단방호대책",keywords:["통로폭 기준(주요통로 120cm이상)","조명(75Lux이상)","바닥면 상태","표시·표지","방호울"],freq:3,level:"★★★"},
  {id:86,cat:"기계설비",title:"안전도로 설치 시 5가지",keywords:["폭 기준(주통로 1.2m)","바닥 상태(미끄럼방지)","조명 기준","방호울 설치","비상구 확보"],freq:3,level:"★★★"},
  {id:87,cat:"기계설비",title:"프레스 작업의 위험성과 대책",keywords:["기계적 위험성(에너지 집중)","비정상적 작업 위험성","작업의 위험성(공급·배출)","방호장치·수공구 활용"],freq:3,level:"★★★",svg:"press"},
  {id:88,cat:"위험성평가",title:"위험점 분석기법 종류",keywords:["체크리스트(4M)","HAZOP(이탈어)","FMECA","What-if","PHA","FTA","ETA","CCA"],freq:3,level:"★★★"},
  {id:89,cat:"기계설비",title:"차량계 건설기계 작업계획서",keywords:["차량계 건설기계 종류","작업장소 지형","운행경로","작업방법·순서","작업지휘자"],freq:3,level:"★★★"},
  {id:90,cat:"기계설비",title:"타워크레인 강풍 시 작업중지",keywords:["순간풍속 10m/sec초과→설치해체·검사·채결 중지","15m/sec초과→운전중지","주의사항"],freq:3,level:"★★★",svg:"crane"},
  {id:91,cat:"기계설비",title:"지게차 헤드가드 설치기준",keywords:["강도=지게차 최대하중의 2배(4t미만)","지붕 없는 것은 안전","높이 2m이상","개구부 최대폭 16cm이하"],freq:3,level:"★★★",svg:"forklift"},
  {id:92,cat:"기계설비",title:"절삭가공 칩 브레이커·칩 종류",keywords:["유동형칩(연성재료)","전단형칩","열단형칩","침 브레이커(칩 처리장치)","발생조건"],freq:3,level:"★★★"},
  {id:93,cat:"법령",title:"안전인증 심사종류",keywords:["예비심사","서면심사","기술능력·생산체계 심사","제품심사","확인심사"],freq:3,level:"★★★"},
  {id:94,cat:"기계설비",title:"지게차 안전장치 및 방호조치",keywords:["헤드가드","백레스트","전조등·후미등","경보장치","안전벨트·좌석안전띠"],freq:3,level:"★★★",svg:"forklift"},
  {id:95,cat:"기계설비",title:"드롭포지 해머 방호장치",keywords:["낙하방지장치","집게형","구름방지장치","고정장치","안전블록"],freq:3,level:"★★★"},
  {id:96,cat:"기계설비",title:"비파괴검사 선정기준",keywords:["시험체 형상·재질","결함 종류·위치","검사목적","비용","접근성"],freq:3,level:"★★★"},
  {id:97,cat:"법령",title:"안전검사 면제",keywords:["고압가스 안전관리법","항만법","원자력법","위험물안전관리법","화재예방법"],freq:3,level:"★★★"},
  {id:98,cat:"기계설비",title:"구성요소 신뢰도 계산",keywords:["직렬계:R=R₁×R₂×...","병렬계:R=1-(1-R₁)(1-R₂)","AND게이트","OR게이트","시스템 신뢰도"],freq:3,level:"★★★"},
  {id:99,cat:"법령",title:"용접 파괴시험법",keywords:["인장시험(인장강도)","굽힘시험(연성)","충격시험(인성)","경도시험","파면시험"],freq:3,level:"★★★"},
  {id:100,cat:"기계설비",title:"계측제어 PID제어",keywords:["비례제어(P)-잔류편차","적분제어(I)-잔류편차 해소","미분제어(D)-응답 빠름","PID 복합","피드백 제어"],freq:3,level:"★★★"},
  {id:101,cat:"기계설비",title:"방호장치 형태 및 특징",keywords:["격리형·위치제한형·접근거부형·접근반응형·포집형","선택기준","특징 비교"],freq:3,level:"★★★"},
  {id:102,cat:"법령",title:"안전관리자 교육 의의 유의사항",keywords:["안전관리자 직무","위험성평가","교육실시","작업환경측정","중대재해 조사보고"],freq:3,level:"★★★"},
  {id:103,cat:"기계설비",title:"동작경제 3원칙",keywords:["신체사용 원칙(양손동시·대칭운동)","작업장 배치 원칙(정해진 위치)","공구·설비 설계 원칙(지그 활용)"],freq:3,level:"★★★"},
  {id:104,cat:"법령",title:"Human Error 유형",keywords:["착오(Mistake)-의도 오류","실수(Slip)-행동 오류","건망(Lapse)-기억 오류","위반(Violation)","설계적 대책"],freq:3,level:"★★★"},
  {id:105,cat:"기계설비",title:"RWL(권고중량한계)",keywords:["NIOSH 들기 방정식","RWL=LC×HM×VM×DM×AM×FM×CM","들기지수(LI=실제하중/RWL)","1 이하 권고"],freq:3,level:"★★★"},
  {id:106,cat:"법령",title:"에너지 차단 대책(LOTO)",keywords:["에너지 격리 절차","Lockout(잠금)·Tagout(표찰)","에너지원 종류(전기·유압·공압)","복귀절차","그룹 LOTO"],freq:3,level:"★★★"},
  {id:107,cat:"법령",title:"재해예방 4원칙(하인리히)",keywords:["손실우연의 원칙","원인계기의 원칙","예방가능의 원칙","대책선정의 원칙(기술·교육·규제)"],freq:3,level:"★★★",svg:"prevention"},
  {id:108,cat:"기계설비",title:"산업안전교육 직원 작업",keywords:["정기안전보건교육(사무직 매분기3h·비사무직 매분기6h)","채용 시(8h)","작업변경 시(2h)","특별교육(16h)"],freq:3,level:"★★★"},

  // ★★ 2회 이상 출제
  {id:109,cat:"역학재료",title:"피로파괴 영향인자",keywords:["응력집중계수(Kt)","표면거칠기","치수효과","잔류응력","부식환경","온도"],freq:2,level:"★★"},
  {id:110,cat:"기계설비",title:"가스용접 재해유형과 예방대책",keywords:["화재폭발(역화·인화)","중독(CO·CO₂)","화상","폭발(압력초과)","역화방지기 설치"],freq:2,level:"★★"},
  {id:111,cat:"기계설비",title:"아세틸렌 특성 및 위험성",keywords:["CaC₂+H₂O→C₂H₂+Ca(OH)₂","자연발화 406~408℃","폭발범위 2.5~81%","2기압이상 부패폭발","역화방지기"],freq:2,level:"★★"},
  {id:112,cat:"기계설비",title:"기계소장률의 욕조곡선",keywords:["초기고장기(감소)","우발고장기(일정)","마모고장기(증가)","예방보전 적기","신뢰도관리"],freq:2,level:"★★",svg:"bathtub"},
  {id:113,cat:"기계설비",title:"기어스트레스·방호장치",keywords:["굽힘응력(Lewis 방정식)","면압응력(Hertz 방정식)","마모","스코어링","열처리·재료선택"],freq:2,level:"★★"},
  {id:114,cat:"기계설비",title:"공정안전보고서 12대 실천사항",keywords:["공정안전자료","위험성평가","안전운전절차","비상조치계획","협력업체 안전관리"],freq:2,level:"★★"},
  {id:115,cat:"기계설비",title:"도급에 따른 재해예방조치",keywords:["안전보건협의체","합동안전점검","작업장 순회점검","수급인 안전보건교육 지원"],freq:2,level:"★★"},
  {id:116,cat:"기계설비",title:"보일러 역화 원인과 대책",keywords:["역화원인(연료과다·점화불량·버너고장)","역화방지기(화염방지기)","화염검출기","자동차단장치"],freq:2,level:"★★",svg:"boiler"},
  {id:117,cat:"법령",title:"차리기(안전순찰) 5단계",keywords:["1단계:사실 발견","2단계:원인 분석","3단계:대책 선정","4단계:대책 실시","5단계:확인"],freq:2,level:"★★"},
  {id:118,cat:"기계설비",title:"FTA 결함수 분석법",keywords:["결함수(Fault Tree) 작성","AND/OR 게이트","정상사상→기본사상","최소절단집합(MCS)","재해확률 계산"],freq:2,level:"★★",svg:"fta"},
  {id:119,cat:"기계설비",title:"자동성형기(사출성형기) 방호장치",keywords:["게이트가드식","안전플러그","방호문","양수조작식","감응식"],freq:2,level:"★★"},
  {id:120,cat:"기계설비",title:"비상정지장치(EMO) 설치기준",keywords:["EMO 조작 후 자동복귀 안 됨","작업자가 쉽게 2곳에서 조작가능","비상정지 후 재기동 방지","색상:빨간색"],freq:2,level:"★★"},
  {id:121,cat:"법령",title:"보호구 지급·관리 규정",keywords:["보호구 종류별 지급기준","안전인증 보호구","성능기준","관리방법","지급 의무"],freq:2,level:"★★"},
  {id:122,cat:"기계설비",title:"와이어로프 단말가공방법",keywords:["소켓고정","클립 고정(3개이상)","웨지 소켓","아이스플라이스(아이형)","압축고정(알루미늄슬리브)"],freq:2,level:"★★"},
  {id:123,cat:"기계설비",title:"연삭기 방호대책(작업방법)",keywords:["숫돌 교환 후 3분 시운전","측면 사용 금지","1m/s 속도기준","작업받침대 3mm","덮개 개구각"],freq:2,level:"★★",svg:"grinder"},
  {id:124,cat:"법령",title:"안전보건교육 규정 용어",keywords:["단기간작업·간헐적작업·임시작업·준시간작업","각 정의","교육면제 기준"],freq:2,level:"★★"},
  {id:125,cat:"기계설비",title:"가드 구비조건",keywords:["충분한 강도","쉽게 제거 안 됨","작업 방해 안 됨","개구부 크기 기준(손거리계산)","적절한 재질"],freq:2,level:"★★"},
  {id:126,cat:"법령",title:"안전관리자 직무",keywords:["안전보건관리책임자 보좌","위험성평가 지원","안전교육 계획·실시","작업환경 점검","중대재해 조사"],freq:2,level:"★★"},
  {id:127,cat:"법령",title:"산업안전감독(근로감독관) 직무",keywords:["감독권한(시정명령·작업중지)","사법경찰권","명예산업안전감독관","안전보건진단","과태료 부과"],freq:2,level:"★★"},
  {id:128,cat:"기계설비",title:"드릴링머신 안전작업",keywords:["척 조작 시 드릴 정지","공작물 고정(바이스·클램프)","절삭날 날카롭게 유지","보호안경 착용","칩 처리"],freq:2,level:"★★"},
  {id:129,cat:"역학재료",title:"축 설계 시 고려사항",keywords:["비틀림모멘트","굽힘모멘트","임계속도(Nc=30/π×√g/δ)","응력집중(키홈)","피로강도"],freq:2,level:"★★"},
  {id:130,cat:"기계설비",title:"프레스 클러치·브레이크",keywords:["클러치 종류(맞물림·마찰)","브레이크 종류(기계식·전기식)","안전일행정기구","클러치 이상 시 조치"],freq:2,level:"★★",svg:"press"},
  {id:131,cat:"역학재료",title:"피로파괴 원인과 방지대책",keywords:["응력집중 제거(필렛반경↑)","표면 처리(쇼트피닝)","잔류응력 제거","재료 선택","설계 개선"],freq:2,level:"★★"},
  {id:132,cat:"법령",title:"중대재해처벌법",keywords:["중대산업재해(사망1명이상 등)","중대시민재해","경영책임자 의무","처벌기준","안전보건관리체계"],freq:2,level:"★★"},
  {id:133,cat:"기계설비",title:"타이어식 크레인 안전기준",keywords:["아웃트리거 설치","경사지 작업 제한","안전하중 확인","작업반경","신호수 배치"],freq:2,level:"★★",svg:"crane"},
  {id:134,cat:"역학재료",title:"재료 파괴 시험 종류",keywords:["인장시험","충격시험(샤르피·아이조드)","경도시험(로크웰·브리넬·비커스)","피로시험","크리프시험"],freq:2,level:"★★"},
  {id:135,cat:"기계설비",title:"고소작업대 방호장치",keywords:["과부하방지장치","비상정지장치","붐 각도·길이 제한장치","아웃트리거 인터록","작업대 과상승 방지"],freq:2,level:"★★"},
  {id:136,cat:"기계설비",title:"연삭기 덮개 설치기준",keywords:["강도기준(최소두께)","최대 개구각(원주:125°이하)","고정방법","탁상용 연삭기 후드","덮개 재질"],freq:2,level:"★★",svg:"grinder"},

  // ★ 1회 이상 출제 (핵심만 선별)
  {id:137,cat:"법령",title:"산재발생 공표대상 사업장",keywords:["공표기준(사망재해율 등)","공표방법(홈페이지)","공표시기","이행강제금"],freq:1,level:"★"},
  {id:138,cat:"법령",title:"도급의 제한(도급금지 업무)",keywords:["도금작업","수은 등 금속 제련","유해물질 제조·사용","방사선업무","승인 도급"],freq:1,level:"★"},
  {id:139,cat:"기계설비",title:"보일러 이상현상(심화)",keywords:["수격(Water Hammer)-배관파손","캐리오버-터빈손상","프라이밍-수분혼입","포밍-거품발생","역화-화염역류"],freq:1,level:"★",svg:"boiler"},
  {id:140,cat:"기계설비",title:"압력용기 안전밸브",keywords:["스프링식(가장多)","중추식","파열판","복합형(파열판+안전밸브)","설정압력(최고사용압력의 1.05배)"],freq:1,level:"★"},
  {id:141,cat:"안전관리",title:"5C운동",keywords:["복장단정(Correctness)","정리정돈(Clearance)","청소청결(Cleaning)","점검확인(Checking)","전심전력(Concentration)"],freq:1,level:"★"},
  {id:142,cat:"안전관리",title:"매슬로 욕구단계 이론",keywords:["1생리적→2안전→3사회적→4존경→5자아실현","저위욕구 충족시 상위욕구 발생","결핍욕구·성장욕구"],freq:1,level:"★"},
  {id:143,cat:"기계설비",title:"절삭가공 발열 방지대책",keywords:["절삭속도 감소","절삭유 사용","공구 재질 개선(초경합금)","절삭깊이 감소","공구각도 최적화"],freq:1,level:"★"},
  {id:144,cat:"법령",title:"근로방법 개선(인간공학)",keywords:["인체측정 자료 적용","작업자세 개선","작업공간 설계","표시장치 설계","제어장치 설계"],freq:1,level:"★"},
  {id:145,cat:"역학재료",title:"열처리 목적과 방법",keywords:["담금질→경도↑","뜨임→인성↑취성↓","풀림→연화·내부응력제거","불림→표준화","시효처리"],freq:1,level:"★"},
  {id:146,cat:"기계설비",title:"베어링 수명 계산",keywords:["베어링 수명(Lh)","기본동정격하중(C)","등가동하중(P)","L=（C/P)^n×10^6/60n","수명계수"],freq:1,level:"★"},
  {id:147,cat:"기계설비",title:"기계설비 신뢰도 관련 지표",keywords:["신뢰도(R)","가용도(A)","MTBF(평균고장간격)","MTTR(평균수리시간)","유지보수성"],freq:1,level:"★"},
  {id:148,cat:"기계설비",title:"나사 각부 명칭",keywords:["피치(P)","리드(L=nP)","리드각","플랭크각","나사산 높이","골지름·유효지름·바깥지름"],freq:1,level:"★"},
  {id:149,cat:"법령",title:"승강기 검사종류",keywords:["완성검사","정기검사(매년)","수시검사","정밀안전검사","안전관리자 선임"],freq:1,level:"★"},
  {id:150,cat:"기계설비",title:"재료 분류",keywords:["금속재료(철계·비철계)","비금속재료(세라믹·폴리머)","복합재료","기능성재료","신소재"],freq:1,level:"★"},
  {id:151,cat:"기계설비",title:"기어 선정기준",keywords:["전달동력","속도비","회전수","중심거리","소음·진동","재질·열처리"],freq:1,level:"★"},
  {id:152,cat:"역학재료",title:"응력-변형률 선도",keywords:["비례한도","탄성한도","항복점","인장강도","파단점","탄성계수(Young's Modulus)"],freq:1,level:"★"},
  {id:153,cat:"기계설비",title:"공기압 시스템 구성",keywords:["공기압축기→애프터쿨러→드라이어→필터→레귤레이터→루브리케이터→액추에이터"],freq:1,level:"★"},
  {id:154,cat:"법령",title:"안전보건개선계획서",keywords:["제출대상(산재다발사업장)","작성내용","심사·확인","이행계획","사업주 이행의무"],freq:1,level:"★"},
  {id:155,cat:"역학재료",title:"부식의 원인과 방지대책",keywords:["전기화학적 부식(갈바닉)","응력부식","침식부식","음극방식","방식도료·코팅"],freq:1,level:"★"},
  {id:156,cat:"설비진단",title:"설비진단 기법",keywords:["진동분석(FFT)","오일분석","음향방출(AE)","열화상검사(IR)","초음파두께측정"],freq:1,level:"★"},
  {id:157,cat:"기계설비",title:"위험물의 종류",keywords:["인화성액체","폭발성물질","산화성물질","독성물질","자연발화성물질","반응성물질"],freq:1,level:"★"},
  {id:158,cat:"역학재료",title:"수소취성",keywords:["수소취성 발생메커니즘","지연파괴","방지대책(베이킹처리·도금)","취약재료","고강도강"],freq:1,level:"★"},
  {id:159,cat:"법령",title:"안전보건관련 직제규정",keywords:["안전관리자·보건관리자 선임기준","산업보건의","안전보건관리담당자","전문기관 위탁"],freq:1,level:"★"},
  {id:160,cat:"기계설비",title:"금속재료의 집단성능 특성",keywords:["인장시험(인장강도·항복강도·연신율)","충격시험(충격치)","경도시험(브리넬·로크웰·비커스)"],freq:1,level:"★"},
  {id:161,cat:"안전관리",title:"재해손실비용 하인리히 방식",keywords:["직접비(의료비·보상비)","간접비(생산손실·교육비·조사비)","직접비:간접비=1:4","총재해비용"],freq:1,level:"★"},
  {id:162,cat:"기계설비",title:"프레스 금형 공급방식",keywords:["자동화 공급(다이얼피드·롤피드·셔틀피드)","수동공급","반자동공급","수공구 활용"],freq:1,level:"★",svg:"press"},
  {id:163,cat:"기계설비",title:"산업용 로봇 작업안전",keywords:["안전방호울타리 1.8m이상","교시작업 로봇 속도250mm/s이하","EMO설치","작업계획서","복귀절차"],freq:1,level:"★"},
  {id:164,cat:"기계설비",title:"프레스 클러치 이상 시 조치",keywords:["즉시 운전중지","원인조사","수리 후 재가동","안전블록 사용","재발방지"],freq:1,level:"★",svg:"press"},
  {id:165,cat:"기계설비",title:"주조의 결함과 원인",keywords:["기공(Porosity)","수축공","열간균열","냉간균열","미스런(Misrun)","탕경(Cold Shut)"],freq:1,level:"★"},
  {id:166,cat:"기계설비",title:"프레스 주요 구조부위 기준",keywords:["플라이휠(에너지 저장)","슬라이드(상하운동)","크랭크(동력전달)","브레이크(정지)","클러치(연결·차단)"],freq:1,level:"★",svg:"press"},
  {id:167,cat:"법령",title:"안전검사 대상 및 주기",keywords:["크레인(2년)","리프트(2년)","압력용기(2년)","원심기(2년)","롤러기(2년)"],freq:1,level:"★"},
  {id:168,cat:"기계설비",title:"전기기계의 안전기준 4가지",keywords:["절연(절연저항)","접지(보호접지)","차단(과전류보호)","경보(이상감지)"],freq:1,level:"★"},
  {id:169,cat:"기계설비",title:"공진이완 대책",keywords:["고유진동수 변경","댐퍼 설치","동흡진기(Dynamic Absorber)","기초 강성화","불평형 제거"],freq:1,level:"★"},
  {id:170,cat:"기계설비",title:"정전기 재해 예방",keywords:["접지·본딩","제전기(이온화)","도전성 재료","습도 유지(65%이상)","정전기 발생 억제"],freq:1,level:"★"},
  {id:171,cat:"역학재료",title:"연삭 숫돌 표시 기호",keywords:["연삭재(A:알루미나·C:탄화규소)","입도(숫자 클수록 미세)","결합도(A-Z)","조직(0-14)","결합제"],freq:1,level:"★",svg:"grinder"},
  {id:172,cat:"기계설비",title:"양중기 브레이크 종류",keywords:["기계식(밴드·원판·원추·드럼)","전자식(전자석)","유압식","정격제동토크","제동력 기준"],freq:1,level:"★"},
  {id:173,cat:"기계설비",title:"크레인 비파괴검사",keywords:["정기검사 시 비파괴검사","최초검사","수시검사","초음파·방사선·자분·침투","검사주기"],freq:1,level:"★",svg:"crane"},
  {id:174,cat:"기계설비",title:"공장 기계장치 출입금지 종류",keywords:["접근금지(방호울)","작업중지(이상발생)","사용금지(불량)","출입금지(위험구역)","표지 기준"],freq:1,level:"★"},
  {id:175,cat:"법령",title:"안전성 평가기법 6가지",keywords:["체크리스트","HAZOP","FMEA·FMECA","FTA","ETA","CA(원인결과분석)"],freq:1,level:"★"},
  {id:176,cat:"기계설비",title:"불안전행동의 기초원인",keywords:["불안전한 행동(88%)","불안전한 상태(10%)","불가항력(2%)","관리적 원인","인적 요인"],freq:1,level:"★"},
  {id:177,cat:"안전관리",title:"안전교육 4단계",keywords:["1단계:4Step 확인(이미 아는 것 확인)","2단계:설명(새 내용 제시)","3단계:시험(실습)","4단계:확인"],freq:1,level:"★"},
  {id:178,cat:"법령",title:"안전점검 종류",keywords:["일상점검(매일)","정기점검(주기적)","수시점검(이상 시)","정밀안전점검(전문기관)","안전진단"],freq:1,level:"★"},
  {id:179,cat:"기계설비",title:"MTBF·MTTR·가용도",keywords:["MTBF=총동작시간/고장횟수","MTTR=총수리시간/고장횟수","가용도A=MTBF/(MTBF+MTTR)","신뢰도 관리"],freq:1,level:"★"},
  {id:180,cat:"법령",title:"물질안전보건자료(MSDS)",keywords:["작성·제출 의무","16개 항목","경고표지","GHS 시스템","근로자 교육"],freq:1,level:"★"},
  {id:181,cat:"법령",title:"색채 안전기준",keywords:["빨강:금지·정지·소화","노랑:주의·경고","초록:안전·비상구","파랑:지시","보라:방사능"],freq:1,level:"★"},
  {id:182,cat:"역학재료",title:"금속의 집단성능 특성",keywords:["기계적 성질(강도·경도·인성)","물리적 성질(밀도·열전도·전기전도)","화학적 성질(내식성·내열성)"],freq:1,level:"★"},
  {id:183,cat:"기계설비",title:"소음 대책",keywords:["소음원 대책(방음커버·저소음 설계)","전파경로 대책(방음벽·거리)","수음자 보호(귀마개·귀덮개)","85dB(A) 기준"],freq:1,level:"★"},
  {id:184,cat:"기계설비",title:"절삭가공 조건",keywords:["절삭속도(m/min)","이송(mm/rev)","절삭깊이(mm)","공구 재질(HSS·초경)","공구수명(테일러 공식)"],freq:1,level:"★"},
  {id:185,cat:"기계설비",title:"낙하·비래 방지대책",keywords:["방호선반","안전망","안전방호울","낙하물 방지망","낙하물 투하설비"],freq:1,level:"★"},
  {id:186,cat:"법령",title:"주조의 외부결함",keywords:["탕경(Cold Shut)","미스런(Misrun)","수축공(Shrinkage)","균열","기공(Blow Hole)"],freq:1,level:"★"},
  {id:187,cat:"법령",title:"인간기계 통합시스템",keywords:["감각(입력)→지각→판단→제어(출력)","시스템 설계 원칙","인간-기계 기능배분","인터페이스 설계"],freq:1,level:"★"},
  {id:188,cat:"기계설비",title:"가스 취급 안전조항",keywords:["가스저장(환기·냉암소)","취급안전(누설방지·점화원 제거)","누설감지기","응급조치·대피"],freq:1,level:"★"},
  {id:189,cat:"기계설비",title:"밀폐공간 종류",keywords:["맨홀·탱크 내부","지하 피트","선창·사일로","하수관·오수관","터널·갱도"],freq:1,level:"★"},
  {id:190,cat:"기계설비",title:"기계설비 안전진단",keywords:["진동분석","오일분석","열화상진단","초음파 진단","전기설비 진단"],freq:1,level:"★",svg:"bathtub"},

  // 챕터2 심화 추가
  {id:191,cat:"기계설비",title:"타워크레인 설치·해체 작업",keywords:["작업계획서 작성","신호방법","안전방호","강풍 시 중지","특별안전교육 16h이상"],freq:2,level:"★★",svg:"crane"},
  {id:192,cat:"기계설비",title:"이동식 크레인 아웃트리거",keywords:["아웃트리거 완전 확장","지반 지지력 확인","깔판 설치","경사지 작업 금지","용량 표시"],freq:2,level:"★★",svg:"crane"},
  {id:193,cat:"법령",title:"공정안전관리(PSM) 12대 실천",keywords:["공정안전자료(HazMat정보)","위험성평가(HAZOP·FMEA)","안전운전절차","비상조치계획","사고조사"],freq:2,level:"★★"},
  {id:194,cat:"기계설비",title:"압력용기 주요구조부",keywords:["동체(Shell):원통형","경판(Head):반구형·타원형·접시형","노즐·관통구","지지구조(새들·스커트·러그)"],freq:2,level:"★★"},
  {id:195,cat:"역학재료",title:"재료의 충격시험",keywords:["샤르피 시험(수평시편)","아이조드 시험(수직시편)","충격치(흡수에너지/단면적)","천이온도","취성파괴 평가"],freq:2,level:"★★"},
  {id:196,cat:"기계설비",title:"컨베이어 롤러 방호장치",keywords:["롤러 덮개","역전방지장치","긴급정지줄","물림점 방호","이탈방지가이드"],freq:2,level:"★★"},
  {id:197,cat:"법령",title:"TBM(Tool Box Meeting)",keywords:["작업 전 5~10분","위험예지훈련","4라운드법(발견→원인→대책→행동목표)","참여형 교육","무재해운동"],freq:2,level:"★★"},
  {id:198,cat:"기계설비",title:"지게차 전도방지 조건",keywords:["안정도 기준(전후:18%·좌우:6%이상)","하중의 중심","마스트 경사","주행 시 포크 높이 30cm","선회반경"],freq:2,level:"★★",svg:"forklift"},
  {id:199,cat:"기계설비",title:"기계설비 점검 종류",keywords:["일상점검(매일)","정기점검(1년/3년)","특별점검(사고후)","정밀점검(전문기관)"],freq:2,level:"★★"},
  {id:200,cat:"기계설비",title:"사고예방의 5요소",keywords:["안전관리조직","사실발견","분석·평가","시정책 선정","시정책 적용(교육·기술·규제)"],freq:2,level:"★★",svg:"prevention"},
];


// ── 관련 기출문제 찾기 (제목/키워드 매칭) ─────────────────
function findRelatedExams(topic, limit=3) {
  const searchTerms = [topic.title, ...topic.keywords.slice(0,3)];
  const scored = EXAM_BANK.map(e => {
    let score = 0;
    searchTerms.forEach(term => {
      const cleaned = term.replace(/\([^)]*\)/g,"").trim();
      if (cleaned.length >= 2 && e.q.includes(cleaned)) score += cleaned.length;
    });
    return {...e, score};
  }).filter(e => e.score > 0).sort((a,b)=>b.score-a.score);
  return scored.slice(0, limit);
}

// ── AI 함수 ────────────────────────────────────────────────
async function gradeAnswer(topic, answer) {
  const related = findRelatedExams(topic, 2);
  const examContext = related.length>0
    ? `\n\n[참고: 실제 기출 유사문제]\n${related.map(r=>`${r.round}회: ${r.q}`).join("\n")}`
    : "";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:800,
      system:`당신은 기계안전기술사 실제 시험 채점위원입니다. 실제 국가기술자격 기술사 시험 수준으로 엄격하게 채점하세요.
채점 기준: 개요-본론-결론 구조 여부, 핵심키워드 포함도, 기술적 정확성, 실무 적용성, 답안 분량 적절성(서술형 특성상 구체적 수치·기준 인용 여부 중요).
반드시 JSON만 반환:
{"score":0~100,"grade":"A/B/C/D/F","strengths":"잘된점(1~2줄)","improvements":"보완점(2~3줄, 실제 시험에서 감점 요인 중심)","keywordsMissed":["키워드1"]}`,
      messages:[{role:"user",content:`문제:${topic.title}\n핵심키워드:${topic.keywords.join(", ")}${examContext}\n\n수험생 답안:\n${answer}`}]
    })
  });
  const d = await res.json();
  const raw = d.content?.map(b=>b.text||"").join("")||"";
  return JSON.parse(raw.replace(/```json|```/g,"").trim());
}

async function generateModel(topic) {
  const related = findRelatedExams(topic, 3);
  const examContext = related.length>0
    ? `\n\n실제 기출 유사문제 참고(출제 스타일 반영):\n${related.map(r=>`${r.round}회: ${r.q}`).join("\n")}`
    : "";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1200,
      system:"당신은 기계안전기술사 시험 전문 강사입니다. 실제 합격 답안 스타일로 작성합니다: 1.개요(정의·배경 간결하게) 2.본론(번호매기기·표 활용·수치기준 명시) 3.결론(실무 시사점) 구조를 반드시 지키고, 산업안전보건법령·KOSHA GUIDE 등 근거를 가능한 인용하세요. 마지막은 항상 '끝.'으로 마무리하세요.",
      messages:[{role:"user",content:`기계안전기술사 시험 문제: "${topic.title}"에 대한 모범답안을 작성해주세요.
핵심키워드(${topic.keywords.join(", ")})를 반드시 포함해서 700~1000자로 작성. 실제 시험 답안지에 쓰는 것처럼 구체적 수치·기준·법령을 포함하세요.${examContext}`}]
    })
  });
  const d = await res.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function MachSafety({ onBack }) {
  const [screen, setScreen] = useState("home");
  const [selectedCat, setSelectedCat] = useState("전체");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);
  const [modelAnswer, setModelAnswer] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const [progress, setProgress] = useState({});
  const [searchTxt, setSearchTxt] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem("mach_prog")||"{}"); setProgress(p); } catch {}
  }, []);

  const markDone = (id) => {
    const next = {...progress, [id]:true};
    setProgress(next);
    try { localStorage.setItem("mach_prog", JSON.stringify(next)); } catch {}
  };

  const filtered = TOPICS.filter(t => {
    if (selectedCat !== "전체" && t.cat !== selectedCat) return false;
    if (showOnlyPending && progress[t.id]) return false;
    if (searchTxt && !t.title.includes(searchTxt) && !t.keywords.some(k=>k.includes(searchTxt))) return false;
    return true;
  });

  const topFreq = [...TOPICS].sort((a,b)=>b.freq-a.freq).slice(0,5);
  const doneCount = Object.keys(progress).length;
  const totalCount = TOPICS.length;

  const handleGrade = async () => {
    if (!answer.trim()) return;
    setGrading(true); setGradeResult(null);
    try { const r = await gradeAnswer(selectedTopic, answer); setGradeResult(r); }
    catch { setGradeResult({score:0,grade:"오류",strengths:"AI 연결 오류",improvements:"다시 시도해주세요",keywordsMissed:[]}); }
    finally { setGrading(false); }
  };

  const handleModel = async () => {
    setModelLoading(true); setModelAnswer("");
    try { const m = await generateModel(selectedTopic); setModelAnswer(m); }
    catch { setModelAnswer("AI 연결 오류. 다시 시도해주세요."); }
    finally { setModelLoading(false); }
  };

  // ── 홈 ────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif",color:C.text}}>
      {/* 헤더 */}
      <div style={{background:"linear-gradient(135deg,#0f1f3d,#1a2f5c)",padding:"20px 16px 24px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            {onBack && <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontSize:12,cursor:"pointer",flexShrink:0}}>← 홈</button>}
            <div style={{fontSize:26}}>⚙️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>기계안전기술사</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>200문제 · 실제기출{EXAM_BANK.length}개 · AI 모의채점</div>
            </div>
            <div style={{background:`${C.gold}20`,border:`1px solid ${C.gold}40`,borderRadius:8,padding:"4px 10px"}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{doneCount}/{totalCount}</span>
            </div>
          </div>
          {/* 진도바 */}
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:99,height:5}}>
            <div style={{width:`${(doneCount/totalCount)*100}%`,background:`linear-gradient(90deg,${C.accent},${C.gold})`,borderRadius:99,height:"100%",transition:"width 0.5s"}}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"14px 14px 40px"}}>
        {/* 출제빈도 TOP5 */}
        <div style={{background:C.card,borderRadius:16,padding:"14px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,fontWeight:800,color:C.gold,marginBottom:10}}>🔥 출제빈도 TOP 5</div>
          {topFreq.map((t,i)=>(
            <div key={t.id} onClick={()=>{setSelectedTopic(t);setScreen("card");setCardFlipped(false);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:10,cursor:"pointer",marginBottom:i<4?5:0,
                background:i===0?`${C.gold}12`:"transparent",border:i===0?`1px solid ${C.gold}25`:"1px solid transparent"}}>
              <div style={{width:22,height:22,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                background:i===0?C.gold:i===1?"#9ca3af":i===2?"#b45309":"#374151"}}>
                <span style={{fontSize:10,fontWeight:900,color:i<3?"#000":"#fff"}}>{i+1}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{t.title}</div>
                <div style={{fontSize:10,color:CAT_COLORS[t.cat]||C.muted}}>{t.cat} · {t.level}</div>
              </div>
              {t.svg && <span style={{fontSize:11,color:C.muted}}>🖼️</span>}
              <span style={{fontSize:11,color:C.gold}}>{t.freq}회↑</span>
            </div>
          ))}
        </div>

        {/* 검색 + 필터 */}
        <input value={searchTxt} onChange={e=>setSearchTxt(e.target.value)} placeholder="🔍 문제·키워드 검색"
          style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.card,color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>

        <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:3}}>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>setSelectedCat(cat)}
              style={{padding:"5px 12px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
                background:selectedCat===cat?(CAT_COLORS[cat]||C.accent):C.card,
                color:selectedCat===cat?"#fff":C.muted,
                border:`1px solid ${selectedCat===cat?(CAT_COLORS[cat]||C.accent):C.border}`}}>
              {cat}
            </button>
          ))}
          <button onClick={()=>setShowOnlyPending(p=>!p)}
            style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${showOnlyPending?C.red:C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
              background:showOnlyPending?`${C.red}20`:C.card,color:showOnlyPending?C.red:C.muted}}>
            미완료만
          </button>
        </div>

        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{filtered.length}개 문제</div>

        {/* 문제 목록 */}
        {filtered.map(t=>(
          <div key={t.id} onClick={()=>{setSelectedTopic(t);setScreen("card");setCardFlipped(false);}}
            style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:7,cursor:"pointer",
              border:`1px solid ${progress[t.id]?C.green+"40":C.border}`,opacity:progress[t.id]?0.7:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:`${CAT_COLORS[t.cat]||C.accent}20`,color:CAT_COLORS[t.cat]||C.accent}}>{t.cat}</span>
              <span style={{fontSize:10,color:C.muted}}>{t.level}</span>
              {t.svg && <span style={{fontSize:10,color:C.cyan}}>🖼️그림</span>}
              {progress[t.id] && <span style={{marginLeft:"auto",fontSize:10,color:C.green,fontWeight:700}}>✓완료</span>}
            </div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{t.title}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>
              {t.keywords.slice(0,3).join(" · ")}{t.keywords.length>3&&` +${t.keywords.length-3}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── 플래시카드 ─────────────────────────────────────────────
  if (screen === "card" && selectedTopic) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif",color:C.text}}>
      <div style={{background:C.surface,padding:"13px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
        <button onClick={()=>setScreen("home")} style={{background:C.border,border:"none",borderRadius:8,padding:"6px 12px",color:C.text,fontSize:12,cursor:"pointer"}}>← 목록</button>
        <span style={{fontSize:11,fontWeight:700,color:CAT_COLORS[selectedTopic.cat]||C.accent,background:`${CAT_COLORS[selectedTopic.cat]||C.accent}20`,padding:"3px 10px",borderRadius:6}}>{selectedTopic.cat}</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{selectedTopic.level}</span>
        <button onClick={()=>{setScreen("write");setAnswer("");setGradeResult(null);setModelAnswer("");}}
          style={{background:`${C.accent}20`,border:`1px solid ${C.accent}40`,borderRadius:8,padding:"6px 12px",color:C.accent,fontSize:11,fontWeight:700,cursor:"pointer"}}>✍️ 답안연습</button>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"18px 14px"}}>
        {/* 현장 SVG 그림 */}
        {selectedTopic.svg && SVG_SCENES[selectedTopic.svg] && (
          <div style={{marginBottom:14,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {SVG_SCENES[selectedTopic.svg]}
          </div>
        )}

        {/* 플래시카드 */}
        <div onClick={()=>setCardFlipped(p=>!p)}
          style={{background:cardFlipped?"linear-gradient(135deg,#0f3460,#1a5276)":`linear-gradient(135deg,${C.card},#1e3a5f)`,
            borderRadius:18,padding:"28px 22px",minHeight:200,cursor:"pointer",
            border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",justifyContent:"center",marginBottom:14,transition:"all 0.3s"}}>
          {!cardFlipped ? (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:14}}>📌 문제 — 탭하면 핵심 키워드 확인</div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",lineHeight:1.5}}>{selectedTopic.title}</div>
              <div style={{marginTop:18,textAlign:"center"}}>
                <span style={{fontSize:11,color:C.muted,background:C.border,padding:"4px 14px",borderRadius:20}}>👆 탭하여 키워드 확인</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{fontSize:10,color:C.highlight,marginBottom:14,textAlign:"center"}}>✅ 핵심 키워드 ({selectedTopic.keywords.length}개) — 클릭하면 검색</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center"}}>
                {selectedTopic.keywords.map((kw,i)=>(
                  <div key={i} onClick={(e)=>{e.stopPropagation();window.open(`https://www.google.com/search?q=기계안전기술사+${encodeURIComponent(kw)}`,"_blank");}}
                    style={{background:"rgba(59,130,246,0.18)",border:`1px solid ${C.accent}40`,borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,color:C.highlight,cursor:"pointer"}}>
                    {i+1}. {kw} 🔍
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{markDone(selectedTopic.id);}}
            style={{flex:1,padding:"12px",background:progress[selectedTopic.id]?`${C.green}20`:`linear-gradient(135deg,${C.green},#059669)`,
              border:progress[selectedTopic.id]?`1px solid ${C.green}`:"none",
              borderRadius:12,color:progress[selectedTopic.id]?C.green:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {progress[selectedTopic.id]?"✓ 완료됨":"✓ 학습 완료"}
          </button>
          <button onClick={()=>{setScreen("write");setAnswer("");setGradeResult(null);setModelAnswer("");}}
            style={{flex:1,padding:"12px",background:`linear-gradient(135deg,${C.accent},#2563eb)`,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            ✍️ 답안 연습
          </button>
        </div>

        {/* 실제 기출 이력 */}
        {(() => {
          const related = findRelatedExams(selectedTopic, 4);
          if (related.length === 0) return null;
          return (
            <div style={{marginTop:14,background:C.card,borderRadius:14,padding:"14px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,fontWeight:800,color:C.orange,marginBottom:10}}>📜 실제 기출 이력 ({related.length}건 발견)</div>
              {related.map((r,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:i<related.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.gold,background:`${C.gold}15`,padding:"2px 7px",borderRadius:6,marginRight:6}}>{r.round}회</span>
                  <span style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{r.q.length>80?r.q.slice(0,80)+"...":r.q}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );

  // ── 답안 작성 + AI 채점 ────────────────────────────────────
  if (screen === "write" && selectedTopic) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Sans KR',sans-serif",color:C.text}}>
      <div style={{background:C.surface,padding:"13px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
        <button onClick={()=>setScreen("card")} style={{background:C.border,border:"none",borderRadius:8,padding:"6px 12px",color:C.text,fontSize:12,cursor:"pointer"}}>← 카드</button>
        <div style={{flex:1,fontSize:13,fontWeight:700}}>✍️ 답안 연습</div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"14px 14px 40px"}}>
        {/* 문제 + SVG */}
        {selectedTopic.svg && SVG_SCENES[selectedTopic.svg] && (
          <div style={{marginBottom:12,borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {SVG_SCENES[selectedTopic.svg]}
          </div>
        )}
        <div style={{background:C.card,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:5}}>📌 문제</div>
          <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:8}}>{selectedTopic.title}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {selectedTopic.keywords.map((kw,i)=>(
              <span key={i} onClick={()=>window.open(`https://www.google.com/search?q=기계안전기술사+${encodeURIComponent(kw)}`,"_blank")}
                style={{fontSize:10,color:C.highlight,background:`${C.accent}15`,padding:"2px 8px",borderRadius:6,cursor:"pointer"}}>{kw} 🔍</span>
            ))}
          </div>
        </div>

        {/* 답안 입력 */}
        <div style={{background:C.card,borderRadius:14,padding:"12px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:7}}>📝 답안 (개요 → 본론 → 결론)</div>
          <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
            placeholder={"1. 개요\n   ...\n\n2. 본론\n   1) ...\n   2) ...\n\n3. 결론\n   ..."}
            rows={10}
            style={{width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${answer?C.accent+"50":C.border}`,
              background:"#0d1520",color:C.text,fontSize:12,lineHeight:1.8,outline:"none",
              boxSizing:"border-box",resize:"vertical",fontFamily:"'Noto Sans KR',sans-serif"}}/>
          <div style={{textAlign:"right",fontSize:10,color:C.muted,marginTop:3}}>{answer.length}자</div>
        </div>

        {!gradeResult && (
          <button onClick={handleGrade} disabled={grading||!answer.trim()}
            style={{width:"100%",padding:"13px",marginBottom:8,
              background:grading||!answer.trim()?`${C.accent}30`:`linear-gradient(135deg,${C.accent},#7c3aed)`,
              border:"none",borderRadius:13,color:grading||!answer.trim()?"#64748b":"#fff",fontSize:14,fontWeight:700,cursor:grading||!answer.trim()?"not-allowed":"pointer"}}>
            {grading?"⏳ AI 채점 중...":"🤖 AI 채점받기"}
          </button>
        )}

        {gradeResult && (
          <div style={{background:C.card,borderRadius:14,padding:"16px",marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:56,height:56,borderRadius:13,background:`linear-gradient(135deg,${C.accent},#7c3aed)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{gradeResult.grade}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>{gradeResult.score}점</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:3}}>👍 {gradeResult.strengths}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{gradeResult.improvements}</div>
              </div>
            </div>
            {gradeResult.keywordsMissed?.length>0 && (
              <div style={{background:`${C.red}10`,border:`1px solid ${C.red}30`,borderRadius:10,padding:"9px 11px",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:5}}>⚠️ 누락 키워드</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {gradeResult.keywordsMissed.map((kw,i)=>(
                    <span key={i} style={{fontSize:11,color:C.red,background:`${C.red}15`,padding:"2px 8px",borderRadius:6}}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setGradeResult(null);setAnswer("");}} style={{flex:1,padding:"9px",background:C.border,border:"none",borderRadius:10,color:C.text,fontSize:12,cursor:"pointer"}}>다시 작성</button>
              <button onClick={()=>markDone(selectedTopic.id)} style={{flex:1,padding:"9px",background:`${C.green}20`,border:`1px solid ${C.green}40`,borderRadius:10,color:C.green,fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ 완료 체크</button>
            </div>
          </div>
        )}

        <button onClick={handleModel} disabled={modelLoading}
          style={{width:"100%",padding:"12px",marginBottom:8,
            background:`${C.gold}15`,border:`1px solid ${C.gold}40`,
            borderRadius:13,color:C.gold,fontSize:13,fontWeight:700,cursor:modelLoading?"not-allowed":"pointer"}}>
          {modelLoading?"⏳ 생성 중...":"✨ AI 모범답안 보기"}
        </button>

        {modelAnswer && (
          <div style={{background:`${C.gold}08`,border:`1px solid ${C.gold}30`,borderRadius:14,padding:"14px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:10}}>✨ AI 모범답안</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.9,whiteSpace:"pre-wrap"}}>{modelAnswer}</div>
          </div>
        )}
      </div>
    </div>
  );

  return null;
}

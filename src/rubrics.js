// 기준표: 문제별 "답안에 들어가야 할 요소" 목록.
// 요소 이름·점검용 키워드·확인할 항목만 적는다 (교재 문장은 넣지 않는다).
// groups: 각 묶음 안에서 하나라도 답안에 있으면 그 묶음은 "있음", min: 필요한 묶음 수(생략하면 전부)
// origin: 교재 / Claude / 둘 다,  conflict: 교재와 Claude의 서술이 달라 원문 확인이 특히 필요한 요소

const norm = (s) => String(s || "").toLowerCase().replace(/[\s·ㆍ,.\-()]/g, "");

export function checkRubric(rubric, text) {
  const t = norm(text);
  return rubric.items.map((it) => {
    const matched = it.groups.filter((g) => g.some((k) => t.includes(norm(k)))).length;
    const need = it.min || it.groups.length;
    return {
      id: it.id,
      name: it.name,
      origin: it.origin,
      check: it.check,
      conflict: !!it.conflict,
      hit: matched >= need,
    };
  });
}

export const RUBRICS = {
  "risk-assessment": {
    id: "risk-assessment",
    title: "위험성평가",
    items: [
      { id: 1, name: "정의", origin: "둘 다", check: "법 조문 번호와 정의 문구", groups: [["정의", "위험성평가란", "스스로"]] },
      { id: 2, name: "법적근거 (법·시행규칙·고시)", origin: "둘 다", check: "법, 시행규칙, 고시의 조문 번호", groups: [["제36조", "시행규칙", "고시", "지침"]] },
      { id: 3, name: "목적", origin: "교재", check: "목적 서술 (고시에 규정이 있는지)", groups: [["목적"]] },
      { id: 4, name: "위험성 결정 (가능성 × 중대성)", origin: "둘 다", conflict: true, check: "교재는 '위험도 4단계', Claude는 '중대성 분류'로 기억함. 원문에서 어느 쪽이 맞는지", groups: [["가능성", "빈도"], ["중대성", "강도"]] },
      { id: 5, name: "실시 주체와 근로자 참여", origin: "둘 다", check: "실시 주체, 근로자 참여 사항의 조문", groups: [["사업주"], ["근로자 참여", "모든 근로자", "전 근로자", "참여"]] },
      { id: 6, name: "추진 절차", origin: "둘 다", conflict: true, min: 4, check: "교재는 6단계, Claude는 고시 5단계로 기억함. 단계 수와 순서", groups: [["사전준비", "대상 선정", "평가대상"], ["요인 파악", "위험요인 파악"], ["위험성 결정", "허용 가능", "허용가능"], ["감소대책"], ["기록", "보존"]] },
      { id: 7, name: "최초평가", origin: "교재", check: "착수 기한 수치", groups: [["최초평가", "최초 평가"]] },
      { id: 8, name: "수시평가", origin: "교재", check: "수시평가 사유 목록", groups: [["수시평가", "수시 평가"]] },
      { id: 9, name: "정기평가", origin: "Claude", check: "고시에 규정되어 있는지, 주기", groups: [["정기평가", "정기 평가"]] },
      { id: 10, name: "상시평가", origin: "Claude", check: "고시에 규정되어 있는지, 요건", groups: [["상시평가", "상시 평가"]] },
      { id: 11, name: "실시규정 포함사항", origin: "교재", check: "실시규정에 넣을 사항 목록", groups: [["실시규정", "실시 규정"]] },
      { id: 12, name: "감소대책 우선순위", origin: "Claude", min: 3, check: "고시에 우선순위가 명시되어 있는지, 순서", groups: [["제거", "폐지", "대체"], ["공학적"], ["관리적"], ["보호구"]] },
      { id: 13, name: "일반원칙·주의사항", origin: "교재", min: 2, check: "일반원칙 조문, 아차사고 반영 규정", groups: [["아차사고", "near miss", "nearmiss"], ["합리적", "ALARP"], ["기술적", "경제성"], ["급박", "우선"]] },
      { id: 14, name: "기록·보존", origin: "둘 다", check: "보존 기간과 기록 항목", groups: [["기록"], ["보존"]] },
    ],
  },
};

// 답안은행: 줄 종류 t = fact(출처 필수) / mine(내 생각) / ai(AI 보완, 확인 전)
// status = draft → sourced → reviewed → proven
export const ANSWER_BANK = {
  "risk-assessment": {
    title: "위험성평가",
    rounds: ["129", "132", "138"],
    status: "draft",
    sections: [
      {
        h: "정의",
        lines: [
          {
            t: "fact",
            text: "사업주가 스스로 유해·위험요인을 파악하고 위험성 수준을 결정해, 위험성을 낮추기 위한 조치를 마련하고 실행하는 과정",
            src: "산업안전보건법 제36조 (원문 대조 필요)",
          },
        ],
      },
      {
        h: "결론",
        lines: [
          {
            t: "mine",
            text: "전 근로자가 참여해 실질적·잠재적 위험의 실행 가능한 낮은 수준 유지가 목적",
          },
        ],
      },
    ],
    figures: [
      // { url: "/images/risk/matrix-01.png", caption: "위험성 매트릭스", labels: [{ id: 1, name: "", role: "" }] },
    ],
  },
};

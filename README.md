# AI 위험성평가 자동작성 시스템

고용노동부 고시 제2024-76호 기준 위험성평가 6단계를 AI로 자동 작성하는 서비스입니다.

---

## 🚀 Vercel 배포 방법 (10분 완성)

### 1단계 — GitHub에 올리기
1. github.com 가입 (무료)
2. 새 Repository 만들기 → "safety-ai" 이름으로
3. 이 폴더 전체를 업로드

### 2단계 — Vercel 연결
1. vercel.com 가입 (GitHub 계정으로 로그인)
2. "New Project" → GitHub Repository 선택
3. "Deploy" 클릭

### 3단계 — 환경변수 설정 (필수!)
Vercel 프로젝트 설정 → Environment Variables 에 추가:
```
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
```
※ Anthropic API 키는 console.anthropic.com 에서 발급

### 4단계 — App.jsx API 키 연결
App.jsx 에서 fetch 헤더 부분을 아래처럼 수정:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01"
}
```

완료! 자동으로 URL이 생성됩니다.
예: https://safety-ai.vercel.app

---

## 💰 API 비용 안내
- Anthropic Claude Sonnet: 문서 1건당 약 2~5원
- 월 1000건 사용 기준 약 2,000~5,000원

---

## 📁 폴더 구조
```
safety-ai/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx      ← 메인 앱
│   └── index.js
├── package.json
├── vercel.json
└── README.md
```

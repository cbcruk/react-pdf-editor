# react-pdf-editor (가칭) — 프로젝트 브리프

> Claude Code 킥오프용 정리 문서. 지금까지의 탐색에서 도달한 결론과 그 근거, 경쟁 분석, 아키텍처 방향, v0 스코프를 담는다.

---

## 0. 한 줄 정의

**"react-email for PDFs"** — 개발자가 `@react-pdf/renderer`로 PDF 템플릿을 빠르게 만들도록 돕는 dev-first 도구. JSX가 source of truth, GUI는 핫리로드 미리보기 보조 역할.

---

## 1. 어떻게 여기까지 왔는가 (의사결정 흐름)

탐색은 "PDF 출력 품질 문제"에서 시작해 "도구 제품"으로 진화했다.

1. **출발점**: jsPDF + html2canvas 파이프라인. `jsPDF.html()`은 사실상 `html2canvas + addImage`가 하드코딩된 래퍼.
2. **진짜 통증 발견**: html2canvas가 **웹폰트의 `font-weight`를 정상 렌더링하지 못함** (Bold이 Regular로 폴백). 원인은 html2canvas가 렌더링을 절차적으로 *재구현*하기 때문 — 브라우저 엔진이 아니라 자기 폰트 매칭 로직을 쓴다.
3. **캡처 방식 개선 검토**: native HTML-in-Canvas(`drawElementImage`) → 플래그 뒤라 프로덕션 불가. **snapdom**(`@zumer/snapdom`)으로 결정. foreignObject로 실제 엔진에 렌더링을 넘기므로 weight 문제가 구조적으로 사라짐.
4. **근본 재고**: 문서 디자인이 복잡하지 않다면 캡처(스크린샷 계열) 자체가 틀린 접근. **직접 그리기**가 우월 — 진짜 텍스트(선택/검색), 작은 용량, 벡터, 서버사이드 생성, weight 모호함 없음.
5. **`@react-pdf/renderer` 채택**: `Font.register`로 weight별 파일을 명시 → weight 폴백 문제 원천 차단. 의료 동의서 예시로 검증 (단순 흐름 문서엔 압도적).
6. **제품 아이디어 발생**: (a) react-pdf용 GUI 저작 도구, (b) 기존 HTML을 e2e 캡처로 react-pdf 스키마로 옮기는 마이그레이터.
7. **경쟁 분석**: pdfme가 인접 자리를 단단히 점유. 단 **pdf-lib 기반 + 절대 위치 모델**이라 react-pdf의 리플로우 모델과 카테고리가 다름. 마이그레이터 자리는 거의 비어 있음.
8. **자기관찰**: 무의식적으로 **email-editor(react-email)**를 의식하고 있었음을 인지 → 이것이 올바른 anchor. 제품 정체성이 "react-email for PDFs"로 또렷해짐.
9. **현재**: Claude Code에서 라이브러리 시작.

---

## 2. 확정된 기술 결론

### 캡처 방식 (참고용 — 이번 제품의 메인 경로는 아님)

- html2canvas의 폰트/weight 버그는 절차적 재구현이 근본 원인.
- 해결이 필요하면 **snapdom**: foreignObject = 실제 브라우저 엔진 렌더링.
- 필수 조건: `embedFonts: true`, 캡처 전 `await document.fonts.ready`, 자체 호스팅 폰트는 `localFonts`로 weight별 선언.

### 직접 그리기 (메인 경로)

- **`@react-pdf/renderer`** + yoga flexbox 레이아웃 모델.
- **`Font.register({ family, fonts: [{src, fontWeight:400},{src, fontWeight:700}] })`** — weight별 파일 명시가 weight 모호함을 없애는 핵심.
- **한국어**: 기본 폰트에 한글 글리프 없음 → Pretendard/Noto Sans KR **TTF** 임베드 필수. 용량은 서브셋팅으로 대응(보통 100~300KB). 이 폰트 셋업이 다른 문서(영수증·처방전 등)에도 재사용됨.
- 미리보기: `<PDFViewer>` 인라인. 서버사이드: `renderToBuffer` / `renderToStream`.

---

## 3. 경쟁 분석 (바퀴 재발명 방지)

### GUI 에디터 — 인접 영역에 강한 선행자 존재

| 도구                              | 위치              | 핵심 차이                                                                                                                            |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **pdfme**                         | 시장 점유자       | TS + React WYSIWYG Designer + JSON 템플릿 + 임베드 가능 + MIT. **단 pdf-lib 런타임 + 절대 위치 모델** (폼/픽셀 고정 레이아웃에 최적) |
| **@aavanamkit/designer + engine** | 동일 컨셉, 미성숙 | "디자이너를 만들자" 아이디어 동일. 1인 프로젝트, react-pdf 기반 아님                                                                 |
| **easy-react-pdf**                | 부분 구현         | JSON 스키마 → react-pdf 렌더러. GUI 없음, 직렬화 레이어만                                                                            |
| **react-print-pdf (OnedocLabs)**  | 빌딩 블록         | react-pdf용 unstyled 컴포넌트 키트. GUI 아님 → **컴포넌트 키트 참고처**                                                              |
| **PDFx (shadcn for PDF)**         | 빌딩 블록         | 카피-페이스트 react-pdf 컴포넌트                                                                                                     |
| **react-pdf-html**                | 런타임 파서       | HTML 문자열을 매번 파싱해 react-pdf로 렌더. 마이그레이터 아님                                                                        |

→ **pdfme = 폼/픽셀 고정 (좌표가 사양). react-pdf = 흐르는 문서 (구조가 사양).** 시장이 안 겹친다. 차별화 명분은 "react-pdf 네이티브"가 아니라 **"리플로우 문서에 특화된 dev-first 도구"**.

### HTML → react-pdf 마이그레이터 — 거의 비어 있음

- 헤드리스 브라우저로 **e2e 캡처 → 구조화된 react-pdf 스키마/TSX**를 생성하는 도구는 검색 결과 없음.
- Puppeteer/Playwright `page.pdf()`는 최종 PDF만 출력(편집 불가능한 종착역).
- **boneyard**(0xGF)가 같은 패턴을 검증해둠: 실제 렌더 → 레이아웃을 구조화 JSON으로 캡처. 출력만 react-pdf로 바꾸면 됨.

---

## 4. 제품 정체성: react-email 모델을 PDF로 이식

| 축            | pdfme              | react-email 모델 (채택)                 |
| ------------- | ------------------ | --------------------------------------- |
| 1차 사용자    | 비-개발자/디자이너 | **개발자**                              |
| 1차 데이터    | JSON 템플릿        | **TSX (단방향, JSX = source of truth)** |
| 데이터 바인딩 | placeholder 변수   | **그냥 props (타입 안전)**              |
| GUI 역할      | 메인 작성 도구     | **미리보기 + 핫리로드, 보조**           |
| 컴포넌트 모델 | 빌트인 schema      | **유저가 npm 컴포넌트로 확장**          |

핵심: GUI 캔버스/드래그앤드롭/JSON 스키마/바인딩 DSL을 **안 만들어도 된다**. JSX가 다 해준다. 만들 게 1/3로 줄고 제품 명확성은 올라간다.

---

## 5. 아키텍처 / v0 스코프

### 패키지 구성 (pnpm 모노레포)

- **`@pkg/components`** — react-pdf 위에 깐 의견 있는 컴포넌트 키트 (`<Section>`, `<Heading>`, `<Field>`, `<Signature>`, `<Table>` 등) + 디자인 토큰(여백/타이포 스케일/색). `react-print-pdf`를 인터페이스 참고처로.
- **`@pkg/preview`** — dev 서버. `pdf/` 폴더 컴포넌트 자동 발견 → HMR로 `<PDFViewer>` 갱신 → 사이드바 카탈로그/컴포넌트 전환 → props mock 데이터 패널. (react-email preview 앱과 동일 UX)
- **`@pkg/render`** — Node 렌더 함수. `@react-pdf/renderer`의 `renderToBuffer`로 충분할 수 있어 얇게.

### v0에서 만들 것

- 컴포넌트 4~6개 + 토큰
- dev 서버: 자동 발견 + HMR + PDFViewer + 사이드바 + props mock
- 한국어 폰트 프리셋(Pretendard 등록) + 유저 폰트 업로드

### v0에서 안 만들 것

- GUI 드래그앤드롭 캔버스
- JSON 스키마 / 양방향 동기화
- 데이터 바인딩 DSL

---

## 6. react-email 코드 참고 가이드 (MIT, 아키텍처 레퍼런스)

코드를 베끼는 게 아니라 **이미 풀린 어려운 결정들**을 차용. 우선순위:

1. **dev server / CLI (`packages/react-email`)** — 최우선. 파일 워칭, 컴포넌트 발견, HMR, preview iframe 메시징. PDF로 그대로 옮길 패턴 가장 많음.
2. **preview UI (`apps/web`)** — 사이드바/미리보기 레이아웃 골격. 직접 만들면 가장 시간 잡아먹는 부분.
3. **components (`packages/components`)** — **인터페이스만 차용, 구현은 새로.** 이메일 컴포넌트엔 table-based HTML/Outlook 호환 결정이 박혀 있어 PDF엔 무의미하거나 해로움.
4. **render (`packages/render`)** — PDF는 `renderToBuffer`가 이미 함. 거의 불필요.

**주의**: 읽다 보면 PDF와 무관한 이메일 도메인 결정(미디어 쿼리 조작, Outlook ghost table, dark mode 변환)이 많다. "우리 도메인 해당 없음"을 빨리 인식하고 넘길 것.

---

## 7. 솔직한 리스크 / 열린 질문

- **컴포넌트 키트의 가치가 이메일보다 약하다.** PDF는 이메일만큼 레이아웃 지옥이 아니라, dev가 그냥 `<View>`/`<Text>`로 짤 수 있다. → 의견 있는 디자인 토큰을 묶어 "예쁘게 시작하는 키트"로 포지셔닝해야 함. 안 그러면 "그냥 react-pdf로 짤래"가 된다.
- **진짜 hook은 preview 서버.** "코드 → 클릭 → 다운로드 → 확인" 4단계를 react-email식 즉시 미리보기로 단축하는 것 자체가 채택 이유.
- **검증 액션**: pdfme Designer를 한 시간 임베드해서 동의서를 만들어보고 "내가 만들 건 pdfme냐 react-email이냐"를 손으로 확인. (본능이 react-email이면 이 검증은 이미 답이 난 단계일 수 있음)

---

## 8. 마이그레이터 (별도 패키지, 추후)

- 이 방향에서 출력 타깃은 JSON이 아니라 **TSX 코드** (`Invoice.tsx`). git에 커밋되고 diff로 검토되고 코드로 진화 → 더 dev-friendly.
- boneyard 패턴 차용: Playwright로 띄움 → DOM 워킹 + computed style + `getBoundingClientRect` 캡처 → react-pdf 트리로 변환.
- **핵심 디테일**: `page.emulateMedia({ media: 'print' })`로 기존 `@media print` CSS를 활용하면 변환 품질 급상승 (대부분의 출력용 HTML은 print CSS를 이미 가짐).
- **설계 분기**: Faithful 모드(절대 위치 1:1) vs Reconstruct 모드(박스→flex 재해석). 둘 다 제공 + import 시 선택이 현실적.
- 폰트 메타데이터(`requiredFonts: [{family, weight, src}]`)를 출력에 박아 에디터가 import 시 폰트 등록을 유도.
- 단독 OSS 패키지(`html-to-react-pdf`)로도 가치 있음 + 에디터 도입 깔때기 역할.
- **순서**: 마이그레이터를 만들면 "react-pdf 스키마는 어떻게 생겨야 하나"가 강제되고, 그 스키마가 에디터의 데이터 모델이 됨. 단, react-email 모델로 가면 1차 산출물이 TSX라 스키마 강제가 약해짐 — v0(에디터)을 먼저 굳히고 마이그레이터를 v1로 붙이는 게 이 방향엔 더 맞을 수 있음.

---

## 9. Claude Code 첫 작업 제안

1. pnpm 모노레포 초기화 (`@pkg/components`, `@pkg/preview`, `@pkg/render`).
2. `@react-pdf/renderer` 설치, `<PDFViewer>`로 hello-world PDF 렌더 확인.
3. Pretendard TTF 두 개(400/700) `Font.register` → 한글 + weight 렌더 검증 (이 프로젝트의 출발 통증이었던 부분).
4. `pdf/` 디렉토리 컨벤션 + 파일 자동 발견 + HMR → PDFViewer 갱신의 최소 dev 서버 스파이크.
5. 동의서 컴포넌트를 첫 레퍼런스 템플릿으로 이식해 전체 파이프라인 e2e 확인.

---

### 참고 라이브러리/레퍼런스

- `@react-pdf/renderer` (메인 렌더러)
- `react-email` (아키텍처 레퍼런스, MIT)
- `pdfme` (경쟁/카테고리 비교 대상)
- `react-print-pdf` (OnedocLabs, 컴포넌트 키트 인터페이스 참고)
- `boneyard` (e2e 캡처 패턴 레퍼런스 — 마이그레이터용)
- `@zumer/snapdom` (캡처 경로 fallback, 참고용)

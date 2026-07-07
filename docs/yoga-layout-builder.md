# yoga-layout 검토 — 빌더 구성 관점

> `빌더 구성 시 yoga-layout 검토해보기` 태스크 결과. 빌더(`@pkg/preview`의 Builder)에 yoga-layout을 어떻게 끌어들일지, 그럴 필요가 있는지, 있다면 어디까지가 현실적인지 정리한다. 코드 스케치는 바로 이식 가능한 수준으로 붙였다.

---

## 0. 결론 먼저

1. **yoga-layout은 이미 우리 스택 안에서 돌고 있다.** 새로 붙일 "엔진"이 아니다. `@react-pdf/renderer` → `@react-pdf/layout@4.6.1` → `yoga-layout@3.2.1` (pnpm-lock.yaml). 미리보기에 보이는 배치는 전부 yoga가 계산한 것.
2. 따라서 "빌더에 yoga 도입"의 실질 = **yoga의 flexbox 속성을 빌더 UI/스키마에 노출할 것인가**의 문제이지, 라이브러리를 추가하는 문제가 아니다.
3. **권장: 브라우저에서 yoga를 직접 구동하지 말 것(옵션 B 기각).** 이미 `pdf.js` 미리보기가 yoga의 실제 결과를 픽셀 단위로 보여준다. 별도 yoga WASM을 브라우저에 얹어 레이아웃을 재계산하는 것은 **진실의 원천이 둘로 갈라지는** 손해만 있다.
4. **권장: `Block`에 얇은 `style` 필드를 추가하고, props 패널에 "레이아웃" 섹션을 붙이는 것(옵션 A + C).** 어휘는 새로 설계하지 말고 **`@pkg/migrator`의 `css.utils.ts`가 이미 확정해 둔 속성 집합**을 그대로 재사용한다.

---

## 1. 현재 상태 진단

### 1.1 빌더는 레이아웃을 전혀 노출하지 않는다

`packages/preview/src/builder/builder.types.ts`의 `Block`은 **콘텐츠 props만** 가진다:

```ts
export type Block = { id: string; children: Block[] } & (
  | { type: 'Section'; props: { title: string } }
  | { type: 'Heading'; props: { level: 1 | 2 | 3; text: string } }
  | { type: 'Field'; props: { label: string; value: string } }
  | { type: 'Text'; props: { text: string } }
  | { type: 'Table'; props: { columns: TableColumnSpec[]; data: Record<string, string>[] } }
)
```

`flexDirection` · `gap` · `width` · `padding` · `alignItems` 같은 배치 축이 **하나도 없다.** 그 결과 빌더로는:

- 두 `Field`를 **가로로 나란히** 놓을 수 없다 (항상 세로 스택).
- 표가 아닌 곳에서 **2단 레이아웃**(라벨 열 / 값 열)을 만들 수 없다.
- 블록 사이 **여백**을 조절할 수 없다 (토큰 마진 고정).
- 특정 블록에 **폭/정렬**을 줄 수 없다.

배치는 전적으로 `block-render.tsx`의 `<Page style={{ padding: 48, ... }}>` + 각 키트 컴포넌트에 박힌 토큰 마진에 의존한다. 즉 **빌더는 "리플로우 문서"를 표방하면서 정작 리플로우의 핵심 축(flex)을 사용자에게 주지 않고 있다.**

### 1.2 그런데 배치는 이미 100% yoga가 한다

react-pdf의 `View`/`Page`는 web과 달리 **기본 `flexDirection: 'column'`**, 이 규칙부터 이미 yoga다. `Section`(`section.tsx`)이 `<View>`로 감싸고 자식이 세로로 쌓이는 것 — 전부 yoga 계산. 우리가 안 건드릴 뿐, 엔진은 이미 붙어 있고 매 미리보기마다 실행된다.

### 1.3 migrator가 "쓸 만한 yoga 어휘"를 이미 확정해 뒀다

`packages/migrator/src/css.utils.ts`의 `SUPPORTED` 집합은 사실상 **이 프로젝트가 검증한 yoga/flex 속성 화이트리스트**다:

```
flexDirection, justifyContent, alignItems, flexGrow, flexShrink, flex, gap,
padding(+TRBL), margin(+TRBL), width, height, display, position, top/right/bottom/left,
borderWidth, borderColor, borderRadius, backgroundColor, opacity, textAlign …
```

`element-map.ts`의 `tagDefaultStyle`도 `tr → flexDirection:'row'`, `td → flex:1` 처럼 **이미 yoga 속성으로 레이아웃을 표현**하고 있다. **빌더의 레이아웃 어휘를 새로 설계할 이유가 없다. 이 집합이 곧 스펙이다.**

---

## 2. "빌더에 yoga" 의 세 가지 해석과 판정

| 옵션                          | 내용                                                                                     | 판정                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **A. 속성 노출**              | props 패널에 flex/spacing/size 컨트롤을 추가, `Block.style`로 저장 → `View style`로 주입 | ✅ **채택.** 저비용·고효용. 리플로우 문서의 실사용 요구를 직접 해결                                       |
| **B. 브라우저 yoga 구동**     | `yoga-layout` WASM을 preview에 직접 로드해 드래그 가이드/치수 오버레이/스냅을 자체 계산  | ❌ **기각.** 진실의 원천 이원화. pdf.js가 이미 실제 결과를 렌더. 절대좌표 캔버스도 아님(우리는 흐름 모델) |
| **C. 스키마에 레이아웃 반영** | `Block`에 `style` 필드 추가, `block-emit`/`block-render`가 함께 처리                     | ✅ **채택(A의 전제).** 단 "얇게" — 자유 CSS가 아니라 큐레이트된 어휘만                                    |

### 왜 B를 버리는가 (핵심 논거)

react-pdf는 **좌표가 사양이 아니라 구조가 사양**인 모델(DESIGN.md §3). pdfme식 절대위치 캔버스라면 브라우저에서 yoga를 돌려 드래그 스냅 가이드를 그리는 게 의미 있지만, 우리는 블록/트리 리플로우다. 사용자가 조작하는 것은 좌표가 아니라 **트리 구조 + 각 노드의 flex 속성**이고, 그 결과는 pdf.js가 즉시(디바운스+더블버퍼) 그려 준다. 여기에 두 번째 yoga 인스턴스를 브라우저에 얹으면:

- react-pdf 내부 yoga와 **버전/기본값 드리프트** 위험 (예: `flexDirection` 기본값, `flexBasis: auto` 처리).
- 유지비만 늘고 사용자가 얻는 것은 이미 pdf.js가 주는 것과 중복.

**결론: yoga는 "런타임 엔진"으로만 두고, 빌더는 그 엔진에 넣을 입력(속성)을 편집하는 UI에 집중.**

---

## 3. 권장 설계 (옵션 A + C)

### 3.1 스키마: `Block`에 얇은 `style` 추가

자유 CSS 텍스트 입력이 아니라 **타입 안전한 큐레이트 부분집합**. migrator의 `ReactPdfStyle`과 정렬시킨다.

```ts
// builder.types.ts
import type { Style } from '@react-pdf/types'

// 빌더가 편집을 허용하는 레이아웃 속성만 추린 부분집합.
// css.utils.ts SUPPORTED 와 의도적으로 동일 어휘.
export type BlockStyle = Pick<
  Style,
  | 'flexDirection'
  | 'justifyContent'
  | 'alignItems'
  | 'gap'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexBasis'
  | 'width'
  | 'height'
  | 'padding'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'marginTop'
  | 'marginBottom'
  | 'backgroundColor'
  | 'borderWidth'
  | 'borderColor'
  | 'borderRadius'
  | 'textAlign'
>

// 모든 블록에 옵셔널 style 을 붙인다. 콘텐츠 props 와는 분리.
export type Block = { id: string; children: Block[]; style?: BlockStyle } &
  // 기존 판별 유니언(Section | Heading | Field | Text | Table)은 그대로 유지
  Record<never, never>
```

> P1 구현 반영: 위 스키마는 실제로 `packages/preview/src/builder/builder.types.ts` 에 적용되어 있다. 아래 3.2~3.4 는 초안 스케치이고, 최종 구현은 "Section 은 자식 컨테이너를, 리프는 자기 박스를 `<View>` 로 래핑" 방식으로 통일했다(§7 참고).

`style`를 콘텐츠 `props`와 **분리**하는 게 중요하다: props는 컴포넌트 의미(무엇), style은 배치(어떻게). 이 분리가 있어야 `block-emit`이 `<Section title=… style={{…}}>`처럼 자연스럽게 낸다.

### 3.2 렌더: `View`로 style 주입

`Section`/`Field` 등 키트 컴포넌트는 이미 `style?: Style | Style[]` prop을 받고 `mergeStyles`로 합친다(`section.tsx`, `style.utils.ts`). 그래서 주입 지점이 이미 있다. `Text`/`Heading`처럼 style을 안 받거나 flex 컨테이너가 아닌 경우엔 래핑 `<View style={block.style}>`로 감싼다.

```tsx
// block-render.tsx — style 있는 블록만 View로 감싸는 헬퍼
function withLayout(style: BlockStyle | undefined, node: ReactNode, key: string): ReactNode {
  return style ? (
    <View key={key} style={style}>
      {node}
    </View>
  ) : (
    node
  )
}
```

키트 컴포넌트가 `style`을 받는 타입이면 직접 전달(`<Section style={block.style}>`)이 더 깔끔하다 — `SectionProps.style`이 이미 존재하므로 Section·Field·Table은 그 경로를 쓰고, `Heading`/`Text`만 래핑한다.

### 3.3 방출(emit): style를 TSX로 직렬화

`block-emit.ts`의 각 `emitBlock` 케이스에 `style` 어트리뷰트를 추가한다. 이미 `strAttr`/`JSON.stringify` 유틸이 있어 확장은 국소적이다:

```ts
function styleAttr(style: BlockStyle | undefined): string {
  if (!style || Object.keys(style).length === 0) return ''
  return ` style={${JSON.stringify(style)}}`
}
// 예: `${indent}<Field ${strAttr('label', …)} ${strAttr('value', …)}${styleAttr(block.style)} />`
```

방출된 TSX가 여전히 손으로 읽고 diff 가능한 react-pdf 코드라는 원칙(DESIGN.md §8)을 지킨다.

### 3.4 UI: props 패널 "레이아웃" 섹션

`block-props.tsx`의 콘텐츠 필드 아래에 공통 레이아웃 컨트롤을 붙인다(모든 블록 공통). 자유 입력이 아니라 **세그먼트 버튼 + 소수의 숫자/색 입력**:

- **방향**: `column`(기본) / `row` — 이게 "두 필드 나란히"를 푸는 핵심 한 방.
- **정렬**: `justifyContent`, `alignItems` (row일 때만 노출).
- **간격**: `gap`(숫자), `paddingTop/Bottom`, `marginTop/Bottom`.
- **크기**: `width`(숫자 pt 또는 `%` 문자열), `flexGrow`(0/1 토글).
- **표면**: `backgroundColor`, `borderWidth`+`borderColor`, `borderRadius`.

값 파서는 migrator `css.utils.ts`의 `parseValue`(px/unitless → number, 그 외 문자열)를 재사용하거나 동일 규칙을 따른다.

---

## 4. 알아야 할 함정 (yoga 3.2.1 / react-pdf 특성)

빌더 UI가 사용자에게 "먹히는 값만" 주려면 아래를 인지해야 한다:

1. **`flexDirection` 기본값이 `column`.** web 습관(row 기본)과 반대. UI에서 기본 선택을 명시적으로 `column`으로 표시할 것.
2. **CSS `gap`은 yoga 3.x에서 지원**되나(그래서 migrator가 화이트리스트에 넣음), 값은 pt 숫자. `%` gap은 피할 것.
3. **`width`/`height`**: 숫자(pt)와 `'50%'`(부모 대비) 모두 됨. 단 `%` 높이는 부모 높이가 정해져야 의미 있어 문서 흐름에선 대개 무용 → UI에서 height는 신중히.
4. **`position: 'absolute'`는 지원**되지만 흐름/페이지 나눔과 상호작용이 까다롭다. **v1 빌더에서는 노출하지 말 것**(migrator가 캡처용으로만 다룸).
5. **grid 없음.** yoga는 flexbox만. 다단은 `flexDirection:'row'` + `flex`/`width`로 표현. UI에 grid 개념을 넣지 말 것.
6. **`Text` 자식엔 flex 컨테이너 속성이 대체로 무의미.** 레이아웃 컨트롤은 `View` 계열(Section 등) 또는 래핑된 블록에만 노출하고, 순수 텍스트 블록엔 spacing/textAlign 정도로 제한.
7. **페이지 나눔(`break`, `wrap`, `minPresenceAhead`)은 yoga가 아니라 react-pdf 확장.** 레이아웃 검토 범위 밖이지만, "블록이 페이지 경계에서 쪼개짐" 요구가 나오면 별도 축으로 다룰 것.

---

## 5. 단계별 적용 제안

| 단계             | 범위                          | 산출                                                                                                |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| **P0 (이 문서)** | 검토·결정                     | 옵션 A+C 채택, B 기각                                                                               |
| **P1**           | 스키마+렌더+방출 배선         | `Block.style` 추가, `block-render`/`block-emit` 통과. UI는 방향(column/row)+gap만                   |
| **P2**           | props 패널 레이아웃 섹션 확장 | 정렬·spacing·size·표면 컨트롤. `css.utils` 값 파서 공유                                             |
| **P3**           | 회귀 방어                     | `block-emit`/`builder` 스냅샷 테스트에 style 케이스 추가(`tests/builder.test.tsx`, `__snapshots__`) |

P1만 해도 "두 Field 가로 배치"라는 가장 흔한 요구가 풀린다. 비용 대비 효과가 가장 큰 최소 절단면이다.

---

## 6. P1 구현 결과 (이 커밋)

문서의 P1을 실제로 반영했다. 배선 요약:

- **스키마** (`builder.types.ts`): `BlockStyle`(§3.1 어휘) + `Block.style?` 추가.
- **렌더** (`block-render.tsx`): `style` 있는 리프는 `<View style>` 로 자기 박스를 감싸고, **Section 은 자식만** `<View style>` 로 감싸 제목을 흐름에서 분리했다. 그래서 Section 을 `방향: 가로` 로 두면 제목은 위, 필드들은 한 줄로 놓인다.
- **방출** (`block-emit.ts`): 동일 규칙으로 `<View style={…}>` 를 TSX 로 직렬화. 하나라도 style 이 있으면 react-pdf import 에 `View` 를 추가한다.
- **상태** (`builder.utils.ts`): `updateBlockStyle(blocks, id, patch)` — 패치 병합 + `undefined` 키 제거 + 빈 style 은 노드에서 삭제(깔끔한 방출 유지).
- **UI** (`block-props.tsx`): Section 속성 아래 "레이아웃" 섹션 — 방향(세로/가로 세그먼트) + 간격(gap, pt). yoga 기본이 column 이라 세로가 기본 선택.
- **테스트** (`tests/builder.test.tsx`): row+gap 방출 시 `View` import·래핑 확인, `updateBlockStyle` 병합/삭제, styled 트리의 PDF 렌더 유효성.

리프 블록(`Field`/`Text` 등)에도 `style` 배선은 통과하지만, P1 UI 는 컨테이너인 **Section 에만** 방향/gap 을 노출한다(리프에 방향/gap 은 무의미하므로). spacing·size·표면 컨트롤과 리프 대상 확장은 **P2** 로 남긴다.

---

## 7. P2 구현 결과 (이 커밋)

레이아웃 컨트롤을 정렬·크기·여백·표면까지 확장하고, 모든 블록 타입으로 노출 대상을 넓혔다.

- **값 파서 공유** (`@pkg/migrator`): `css.utils.ts` 의 길이 파싱을 `parseLength(raw)` 로 추출해 export(`@pkg/migrator/browser`). 인라인 스타일 파서(`parseValue`)와 빌더 입력이 같은 규칙(`px`/unitless → number, `50%` 등 → 문자열, 빈 값 → undefined)을 공유한다.
- **컨트롤 확장** (`block-props.tsx`):
  - **컨테이너(Section) 전용**: 방향(세로/가로), 교차축 정렬(alignItems), 주축 정렬(justifyContent, row 일 때만), 간격(gap).
  - **모든 블록 공통**: 폭(width, pt 또는 %), 남는 공간 채우기(flexGrow 토글), 바깥 위/아래 여백(marginTop/Bottom), 안쪽 여백(padding), 배경색·테두리 두께·테두리 색·모서리 반경. 색은 네이티브 컬러 스와치 + hex 입력.
- **구조 정리**: `BlockProps` 를 `ContentFields`(콘텐츠) + `LayoutControls`(스타일)로 분리. `Segment`/`Toggle`/`NumberField`/`LengthField`/`ColorField` 프리미티브로 반복 제거.
- **리프 스타일**: 리프 블록에 width/padding/배경/테두리 등을 주면 P1 래핑 규칙대로 `<View style>` 박스로 감싸 렌더·방출된다(예: 폭 50% + 배경 카드형 필드).
- **테스트**: 리프 블록 style 이 `<View>` 박스로 감싸이고 `View` import 가 붙는지 추가 검증.

다음(P3) 후보: `block-emit` 스냅샷에 style 케이스 추가, position/absolute·페이지 나눔 축(별도 모델), 개별 padding TRBL·margin 좌우 등 세밀 컨트롤.

---

## 8. P3 구현 결과 (이 커밋)

세밀한 여백 컨트롤과 방출 회귀 방어를 추가했다.

- **스키마 보강** (`builder.types.ts`): `BlockStyle` 에 `margin`·`marginRight`·`marginLeft` 를 더해 4방향 여백 어휘를 완성(padding TRBL 은 P1 부터 이미 포함).
- **4방향 여백 에디터** (`block-props.tsx`): 단일 padding/marginTop·Bottom 입력을 `EdgesField`(위·오/아·왼 4칸 그리드) 두 개로 대체 — 안쪽(padding) / 바깥(margin) 여백을 축별로 편집. 빈 칸은 style 에서 제거된다.
- **스냅샷 회귀 테스트** (`tests/builder.test.tsx`, `__snapshots__/builder.test.tsx.snap`): row+정렬 컨테이너 + 폭 50%·TRBL 여백·표면을 가진 리프를 함께 방출한 TSX 를 스냅샷으로 고정. 중첩 `View` 래핑과 style 직렬화가 회귀하면 즉시 잡힌다.

**yoga 축 안에서의 레이아웃 편집은 여기서 실용 범위가 대체로 닫힌다.** 남는 것은 yoga 밖의 축이다:

- **페이지 나눔** (`wrap`/`break`/`minPresenceAhead`) — react-pdf 확장(스타일이 아니라 엘리먼트 prop). 별도 모델·UI 축으로 다뤄야 함.
- **`position: 'absolute'` + top/right/bottom/left** — 흐름/페이지 나눔과의 상호작용 때문에 신중히. migrator 캡처 경로에만 있고 빌더 UI 에는 아직 미노출.
- 이 둘은 "리플로우 문서" 기본 사용성에는 필수가 아니라 후속 과제로 남긴다.

---

## 9. 요약 한 줄

**yoga는 이미 엔진으로 돌고 있으니 새로 들일 것은 없다. 할 일은 그 엔진의 flex 속성을 — migrator가 이미 확정한 어휘 그대로 — `Block.style`과 props 패널에 얇게 노출해, 빌더가 표방하는 "리플로우 문서"를 실제로 편집 가능하게 만드는 것이다. 브라우저에서 yoga를 별도로 돌리는 길(옵션 B)은 pdf.js 미리보기와 중복이라 가지 않는다.**

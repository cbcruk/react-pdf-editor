# @pkg/components

의견 있는 `@react-pdf/renderer` 컴포넌트 키트 + 디자인 토큰.

## 컴포넌트

| 컴포넌트      | 용도                                       |
| ------------- | ------------------------------------------ |
| `<Section>`   | 제목(선택) + 하단 여백을 가진 블록         |
| `<Heading>`   | `level` 1~3 제목                           |
| `<Field>`     | `label` / `value` 한 줄 필드               |
| `<Signature>` | 서명선 + 라벨                              |
| `<Table>`     | `columns` / `data` 표                      |
| `<List>`      | `items` 목록 (`ordered`로 번호 매기기)     |
| `<Callout>`   | `variant` `"info"` / `"warning"` 강조 박스 |
| `<Divider>`   | 가로 구분선                                |
| `<Spacer>`    | `size` 토큰/숫자 만큼의 세로 여백          |
| `<KeyValue>`  | 라벨(작게) 위, 값 아래로 쌓는 항목         |

## 디자인 토큰

`tokens`(= `defaultTokens`)는 `fontFamily`, `color`, `space`, `fontSize`, `fontWeight`, `lineHeight`, `radius`, `page` 카테고리를 가집니다. 타입은 `Tokens`.

```tsx
import { tokens } from '@pkg/components'

const styles = StyleSheet.create({
  page: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.base,
    color: tokens.color.text,
  },
})
```

## 테마

키트 컴포넌트는 `useTokens()`로 토큰을 컨텍스트에서 읽습니다. `ThemeProvider` 없이 쓰면 `defaultTokens`를 사용합니다.

### 토큰 오버라이드

`createTokens(overrides)`는 카테고리별로 기본 토큰에 얕은 병합을 적용합니다.

```tsx
import { ThemeProvider, createTokens } from '@pkg/components'

const brand = createTokens({
  color: { accent: '#7c3aed' },
  fontSize: { xl: 28 },
})

;<ThemeProvider tokens={brand}>
  <Heading level={1}>제목</Heading>
</ThemeProvider>
```

### 다크 프리셋

`darkTheme`는 밝은 텍스트/테두리로 미리 구성된 `Tokens`입니다. 어두운 `Page` 배경과 함께 쓰세요.

```tsx
import { ThemeProvider, darkTheme } from '@pkg/components'
;<Page size="A4" style={{ backgroundColor: '#111827', padding: 24 }}>
  <ThemeProvider tokens={darkTheme}>
    <Heading level={1}>다크 문서</Heading>
  </ThemeProvider>
</Page>
```

> 폰트는 호스트(프리뷰 앱 / `@pkg/render`)가 `Font.register`로 등록합니다. 키트는 `tokens.fontFamily`("Pretendard")만 참조합니다.

# react-pdf-editor

**react-email for PDFs** — `@react-pdf/renderer` 위에 깐 dev-first 툴킷. JSX가 source of truth, GUI는 핫리로드 미리보기 보조.

자세한 배경과 설계 결정은 [DESIGN.md](./DESIGN.md) 참고.

## 패키지 (pnpm + Vite+ 모노레포)

| 패키지            | 역할                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `@pkg/components` | 의견 있는 컴포넌트 키트 + 디자인 토큰/테마 ([README](./packages/components/README.md)) |
| `@pkg/render`     | Node 렌더 함수(`renderPdf`) + Pretendard 폰트 등록(`registerFonts`)                    |
| `@pkg/preview`    | dev 서버: `pdf/` 자동 발견 + HMR 미리보기 + props 패널 + 마이그레이트 탭               |
| `@pkg/migrator`   | HTML → react-pdf TSX 변환 (browserless + Playwright 캡처 + CLI)                        |

## 명령어

```bash
vp install              # 의존성 설치
vp dev packages/preview # 미리보기 dev 서버 (또는 pnpm dev)
vp check                # format + lint + type check
vp test                 # 테스트
vp run -r build         # 모든 패키지 빌드(tsdown)
```

### 마이그레이터 CLI

```bash
pnpm migrate <input.html|url> [--out file] [--name Name] [--mode reconstruct|faithful] [--browser]
```

URL 입력 또는 `--browser`는 시스템 Chrome(`playwright-core` + `channel: "chrome"`)으로 computed style을 캡처합니다.

## 퍼블리시

패키지는 개발 중 **소스 export**(`exports` → `./src/*.ts`)로 동작해 빌드 없이 워크스페이스가 연결됩니다. npm 퍼블리시 시:

1. 대상 패키지의 `private: true` 제거
2. `exports`를 빌드 산출물로 변경 (`./dist/index.mjs`, `types` → `./dist/index.d.mts`)
3. `files: ["dist"]` 추가
4. `@pkg/migrator`는 `bin`을 `./dist/cli.mjs`로 변경
5. `vp run -r build` 후 `pnpm publish`

`@pkg/migrator`의 browserless 진입점(`@pkg/migrator/browser`)은 Playwright 의존 없이 `html-to-react-pdf` 단독 OSS로 분리 퍼블리시할 수 있습니다.

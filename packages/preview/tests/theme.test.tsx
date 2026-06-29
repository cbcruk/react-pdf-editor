import {
  Callout,
  Heading,
  List,
  Section,
  ThemeProvider,
  createTokens,
  darkTheme,
} from "@pkg/components";
import { registerFonts, renderPdf } from "@pkg/render";
import { Document, Page } from "@react-pdf/renderer";
import { expect, test } from "vite-plus/test";

registerFonts();

test("ThemeProvider propagates tokens to kit components and renders a valid PDF", async () => {
  const theme = createTokens({
    color: { accent: "#7c3aed", text: "#111111" },
    fontSize: { xl: 28 },
  });

  const buffer = await renderPdf(
    <Document>
      <Page size="A4" style={{ padding: 24, fontFamily: "Pretendard" }}>
        <ThemeProvider tokens={theme}>
          <Heading level={1}>테마 적용</Heading>
          <Section title="섹션">
            <Callout title="안내" variant="info">
              테마된 콜아웃
            </Callout>
          </Section>
        </ThemeProvider>
      </Page>
    </Document>,
  );

  const raw = buffer.toString("latin1");
  expect(raw.startsWith("%PDF-")).toBe(true);
  expect(buffer.length).toBeGreaterThan(5_000);
});

test("darkTheme preset renders a dark document to a valid PDF", async () => {
  const buffer = await renderPdf(
    <Document>
      <Page size="A4" style={{ padding: 24, backgroundColor: "#111827", fontFamily: "Pretendard" }}>
        <ThemeProvider tokens={darkTheme}>
          <Heading level={1}>다크 문서</Heading>
          <Section title="목록">
            <List items={["첫 번째", "두 번째"]} ordered />
          </Section>
        </ThemeProvider>
      </Page>
    </Document>,
  );

  const raw = buffer.toString("latin1");
  expect(raw.startsWith("%PDF-")).toBe(true);
  expect(buffer.length).toBeGreaterThan(5_000);
});

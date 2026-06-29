import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Font, renderToBuffer } from "@react-pdf/renderer";

const fontsDir = fileURLToPath(new URL("../fonts/", import.meta.url));

export function registerFonts(): void {
  Font.register({
    family: "Pretendard",
    fonts: [
      { src: join(fontsDir, "Pretendard-Regular.otf"), fontWeight: 400 },
      { src: join(fontsDir, "Pretendard-Bold.otf"), fontWeight: 700 },
    ],
  });
}

export function renderPdf(
  document: Parameters<typeof renderToBuffer>[0],
): ReturnType<typeof renderToBuffer> {
  return renderToBuffer(document);
}

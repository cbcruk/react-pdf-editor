import { expect, test } from "vite-plus/test";
import { htmlToReactPdfViaBrowser } from "../src/index.ts";

const browserTest = process.env.MIGRATOR_BROWSER ? test : test.skip;

browserTest(
  "captures stylesheet-computed styles via chrome and emits react-pdf TSX",
  async () => {
    const html = `<!doctype html><html><head><style>
      .title { color: #1a1a1a; font-size: 24px; font-weight: 700; }
      .muted { color: #6b7280; }
    </style></head><body>
      <div style="padding: 24px">
        <h1 class="title">Invoice</h1>
        <p class="muted">June 2026</p>
      </div>
    </body></html>`;

    const tsx = await htmlToReactPdfViaBrowser(html, {
      componentName: "Invoice",
      mode: "reconstruct",
    });

    expect(tsx).toContain("export function Invoice");
    expect(tsx).toContain("Invoice");
    expect(tsx).toContain("June 2026");
    expect(tsx).toContain("fontSize: 24");
    expect(tsx).toContain('color: "#6b7280"');
  },
  30_000,
);

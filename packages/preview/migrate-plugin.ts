import { writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "@pkg/migrator";
import type { CaptureSource, MigrateMode } from "@pkg/migrator";

interface MigrateRequest {
  source: CaptureSource;
  mode?: MigrateMode;
  media?: "print" | "screen";
  componentName?: string;
}

interface MiddlewareServer {
  middlewares: {
    use: (
      path: string,
      handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
    ) => void;
  };
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(req)) as MigrateRequest;
    const result = await migrate(payload.source, {
      mode: payload.mode,
      media: payload.media,
      componentName: payload.componentName,
    });
    sendJson(res, 200, { tsx: result.tsx, nodes: result.nodes });
  } catch (cause) {
    sendJson(res, 500, {
      error: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

function toSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "migrated"
  );
}

async function handleSave(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(req)) as {
      name?: string;
      tsx?: string;
    };

    if (!payload.tsx) {
      sendJson(res, 400, { error: "Missing tsx" });
      return;
    }

    const slug = toSlug(payload.name ?? "migrated");
    const dir = fileURLToPath(new URL("./pdf/", import.meta.url));
    await writeFile(join(dir, `${slug}.tsx`), payload.tsx, "utf8");
    sendJson(res, 200, { path: `pdf/${slug}.tsx`, slug });
  } catch (cause) {
    sendJson(res, 500, {
      error: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

export function migratePlugin(): {
  name: string;
  configureServer: (server: MiddlewareServer) => void;
} {
  return {
    name: "migrate-endpoint",
    configureServer(server) {
      server.middlewares.use("/api/migrate", (req, res) => {
        void handle(req, res);
      });
      server.middlewares.use("/api/save-doc", (req, res) => {
        void handleSave(req, res);
      });
    },
  };
}

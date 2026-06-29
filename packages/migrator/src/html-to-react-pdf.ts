import { emitModule } from "./emit.ts";
import { collectFromHtml } from "./font-collect.ts";
import type { MigrateOptions } from "./migrator.types.ts";
import { transform } from "./transform.ts";

export function htmlToReactPdf(html: string, options: MigrateOptions = {}): string {
  return emitModule(transform(html), options.componentName ?? "Migrated", collectFromHtml(html));
}

import { capture } from './capture.ts'
import { capturedToFaithful, capturedToIr } from './captured-transform.ts'
import { emitModule } from './emit.ts'
import { collectFromCaptured } from './font-collect.ts'
import type {
  BrowserMigrateOptions,
  CaptureSource,
  CapturedNode,
  IrNode,
  MigrateMode,
  ReactPdfStyle,
  RequiredFont,
} from './migrator.types.ts'

function capturedToNodes(captured: CapturedNode | null, mode: MigrateMode): IrNode[] {
  if (!captured) {
    return []
  }

  if (mode === 'faithful') {
    return capturedToFaithful(captured)
  }

  const root = capturedToIr(captured)
  return root?.type === 'element' ? root.children : root ? [root] : []
}

export interface MigrateResult {
  tsx: string
  nodes: IrNode[]
  requiredFonts: RequiredFont[]
}

export async function migrate(
  source: string | CaptureSource,
  options: BrowserMigrateOptions = {},
): Promise<MigrateResult> {
  const normalized: CaptureSource = typeof source === 'string' ? { html: source } : source
  const mode = options.mode ?? 'reconstruct'
  const captured = await capture(normalized, { media: options.media })
  const nodes = capturedToNodes(captured, mode)
  const requiredFonts = collectFromCaptured(captured)
  const pageStyle: ReactPdfStyle = mode === 'faithful' ? {} : { padding: 24 }
  const tsx = emitModule(nodes, options.componentName ?? 'Migrated', requiredFonts, pageStyle)

  return { tsx, nodes, requiredFonts }
}

export async function htmlToReactPdfViaBrowser(
  source: string | CaptureSource,
  options: BrowserMigrateOptions = {},
): Promise<string> {
  const { tsx } = await migrate(source, options)
  return tsx
}

export { htmlToReactPdf } from './html-to-react-pdf.ts'
export { transform } from './transform.ts'
export { capture } from './capture.ts'
export { capturedToFaithful, capturedToIr } from './captured-transform.ts'
export { collectFromCaptured, collectFromHtml } from './font-collect.ts'
export type {
  BrowserMigrateOptions,
  CapturedNode,
  CaptureSource,
  IrElementNode,
  IrNode,
  MigrateMode,
  MigrateOptions,
  ReactPdfStyle,
  RequiredFont,
} from './migrator.types.ts'

#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { htmlToReactPdf } from './html-to-react-pdf.ts'
import { htmlToReactPdfViaBrowser } from './index.ts'
import type { MigrateMode } from './migrator.types.ts'

interface CliOptions {
  input: string
  out?: string
  name?: string
  mode: MigrateMode
  browser: boolean
  media: 'print' | 'screen'
}

interface CliResult {
  code: number
  stdout: string
  stderr?: string
}

const HELP = `Usage: migrate <input.html|url> [options]

Convert an HTML file or URL into a @react-pdf/renderer component.

Options:
  -o, --out <file>     Write the generated .tsx to a file (default: stdout)
  -n, --name <name>    Component name (default: derived from the input)
  -m, --mode <mode>    "reconstruct" (default) or "faithful"
  -b, --browser        Capture an HTML file through a real browser
      --media <media>  "print" (default) or "screen" for browser capture
  -h, --help           Show this help

A URL input always uses browser capture.
`

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function deriveName(input: string): string {
  const base = isUrl(input) ? new URL(input).pathname : basename(input)
  const stem = base.replace(/\.[^.]+$/, '')
  const name = stem
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return name || 'Migrated'
}

function parseArgs(argv: string[]): {
  options?: CliOptions
  help?: boolean
  error?: string
} {
  const positionals: string[] = []
  let out: string | undefined
  let name: string | undefined
  let mode = 'reconstruct'
  let browser = false
  let media = 'print'

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    switch (arg) {
      case '-h':
      case '--help':
        return { help: true }
      case '-o':
      case '--out':
        out = argv[(i += 1)]
        break
      case '-n':
      case '--name':
        name = argv[(i += 1)]
        break
      case '-m':
      case '--mode':
        mode = argv[(i += 1)] ?? mode
        break
      case '-b':
      case '--browser':
        browser = true
        break
      case '--media':
        media = argv[(i += 1)] ?? media
        break
      default:
        if (arg?.startsWith('-')) {
          return { error: `Unknown option: ${arg}` }
        }
        if (arg) {
          positionals.push(arg)
        }
    }
  }

  const input = positionals[0]
  if (!input) {
    return { error: 'Missing input (an HTML file or URL is required)' }
  }

  if (mode !== 'reconstruct' && mode !== 'faithful') {
    return { error: `Invalid mode: ${mode}` }
  }

  if (media !== 'print' && media !== 'screen') {
    return { error: `Invalid media: ${media}` }
  }

  return { options: { input, out, name, mode, browser, media } }
}

export async function runCli(argv: string[]): Promise<CliResult> {
  const parsed = parseArgs(argv)

  if (parsed.help) {
    return { code: 0, stdout: HELP }
  }

  if (parsed.error || !parsed.options) {
    return { code: 1, stdout: '', stderr: `${parsed.error}\n\n${HELP}` }
  }

  const options = parsed.options
  const componentName = options.name ?? deriveName(options.input)

  let tsx: string
  if (isUrl(options.input)) {
    tsx = await htmlToReactPdfViaBrowser(
      { url: options.input },
      { componentName, mode: options.mode, media: options.media },
    )
  } else {
    const html = await readFile(options.input, 'utf8')
    tsx = options.browser
      ? await htmlToReactPdfViaBrowser(
          { html },
          { componentName, mode: options.mode, media: options.media },
        )
      : htmlToReactPdf(html, { componentName })
  }

  if (options.out) {
    await writeFile(options.out, tsx, 'utf8')
    return { code: 0, stdout: `Wrote ${options.out}\n` }
  }

  return { code: 0, stdout: tsx }
}

async function main(): Promise<void> {
  const result = await runCli(process.argv.slice(2))

  if (result.stdout) {
    process.stdout.write(result.stdout)
  }

  if (result.stderr) {
    process.stderr.write(result.stderr)
  }

  process.exitCode = result.code
}

const entry = process.argv[1]
if (entry && import.meta.url === pathToFileURL(entry).href) {
  void main()
}

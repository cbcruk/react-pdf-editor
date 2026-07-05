import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { runCli } from '../src/cli.ts'

async function withHtml(
  html: string,
  run: (file: string, dir: string) => Promise<void>,
): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), 'migrator-'))
  const file = join(dir, 'invoice.html')
  await writeFile(file, html, 'utf8')

  try {
    await run(file, dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('migrates an html file to stdout with a derived component name', async () => {
  await withHtml(`<div><h1>Invoice</h1></div>`, async (file) => {
    const result = await runCli([file])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('export function Invoice')
    expect(result.stdout).toContain('<Text')
  })
})

test('writes to --out and honors --name', async () => {
  await withHtml(`<p>hi</p>`, async (file, dir) => {
    const out = join(dir, 'Doc.tsx')
    const result = await runCli([file, '--out', out, '--name', 'Doc'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Wrote')

    const written = await readFile(out, 'utf8')
    expect(written).toContain('export function Doc')
  })
})

test('reports an error when input is missing', async () => {
  const result = await runCli([])

  expect(result.code).toBe(1)
  expect(result.stderr).toContain('Missing input')
})

test('rejects an invalid mode', async () => {
  const result = await runCli(['page.html', '--mode', 'nope'])

  expect(result.code).toBe(1)
  expect(result.stderr).toContain('Invalid mode')
})

test('--help returns usage', async () => {
  const result = await runCli(['--help'])

  expect(result.code).toBe(0)
  expect(result.stdout).toContain('Usage:')
})

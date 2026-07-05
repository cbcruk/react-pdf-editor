import { registerFonts, renderPdf } from '@pkg/render'
import { expect, test } from 'vite-plus/test'
import { Consent } from '../pdf/consent.tsx'
import { Invoice } from '../pdf/invoice.tsx'
import { KitShowcase } from '../pdf/kit-showcase.tsx'
import { Report } from '../pdf/report.tsx'

registerFonts()

test('consent renders to a valid PDF with Pretendard embedded', async () => {
  const buffer = await renderPdf(<Consent />)
  const raw = buffer.toString('latin1')

  expect(buffer.length).toBeGreaterThan(10_000)
  expect(raw.startsWith('%PDF-')).toBe(true)
  expect(raw).toContain('Pretendard')
})

test('invoice renders to a valid PDF through the component kit', async () => {
  const buffer = await renderPdf(<Invoice />)
  const raw = buffer.toString('latin1')

  expect(buffer.length).toBeGreaterThan(10_000)
  expect(raw.startsWith('%PDF-')).toBe(true)
  expect(raw).toContain('Pretendard')
})

test('report renders List and Callout components to a valid PDF', async () => {
  const buffer = await renderPdf(<Report />)
  const raw = buffer.toString('latin1')

  expect(buffer.length).toBeGreaterThan(10_000)
  expect(raw.startsWith('%PDF-')).toBe(true)
  expect(raw).toContain('Pretendard')
})

test('kit showcase renders Divider, Spacer and KeyValue to a valid PDF', async () => {
  const buffer = await renderPdf(<KitShowcase />)
  const raw = buffer.toString('latin1')

  expect(buffer.length).toBeGreaterThan(10_000)
  expect(raw.startsWith('%PDF-')).toBe(true)
  expect(raw).toContain('Pretendard')
})

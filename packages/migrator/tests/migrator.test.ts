import { expect, test } from 'vite-plus/test'
import { htmlToReactPdf } from '../src/index.ts'

test('maps img to an Image component and imports Image', () => {
  const tsx = htmlToReactPdf(
    `<div><img src="https://example.com/logo.png" style="width: 80px" /></div>`,
  )

  expect(tsx).toContain('import { Document, Image, Page, Text, View }')
  expect(tsx).toContain('<Image src="https://example.com/logo.png"')
  expect(tsx).toContain('width: 80')
})

test('maps table rows and cells to flex rows', () => {
  const tsx = htmlToReactPdf(`<table><tr><td>A</td><td>B</td></tr></table>`)

  expect(tsx).toContain('flexDirection: "row"')
  expect(tsx).toContain('flex: 1')
  expect(tsx).not.toContain('Image')
})

test('parses the border shorthand into borderWidth and borderColor', () => {
  const tsx = htmlToReactPdf(`<div style="border: 2px solid #cccccc">x</div>`)

  expect(tsx).toContain('borderWidth: 2')
  expect(tsx).toContain('borderColor: "#cccccc"')
})

test('adds bullet markers for ul and numbers for ol', () => {
  const ul = htmlToReactPdf(`<ul><li>first</li><li>second</li></ul>`)
  expect(ul).toContain('•')
  expect(ul).toContain('first')

  const ol = htmlToReactPdf(`<ol><li>alpha</li><li>beta</li></ol>`)
  expect(ol).toContain('1.')
  expect(ol).toContain('2.')
})

test('maps block elements to View and inline elements to Text', () => {
  const tsx = htmlToReactPdf(
    `<div style="padding: 16px"><h1 style="color: #1a1a1a">청구서</h1><p>합계 1,000원</p></div>`,
  )

  expect(tsx).toContain('<View')
  expect(tsx).toContain('<Text')
  expect(tsx).toContain('청구서')
  expect(tsx).toContain('합계 1,000원')
})

test('converts px lengths to numbers and applies tag defaults', () => {
  const tsx = htmlToReactPdf(`<h1 style="padding: 16px">제목</h1>`)

  expect(tsx).toContain('fontSize: 24')
  expect(tsx).toContain('padding: 16')
  expect(tsx).not.toContain('16px')
})

test('drops unsupported css properties', () => {
  const tsx = htmlToReactPdf(`<div style="color: red; float: left; cursor: pointer">x</div>`)

  expect(tsx).toContain('color: "red"')
  expect(tsx).not.toContain('float')
  expect(tsx).not.toContain('cursor')
})

test('wraps bare text in a View inside a Text element', () => {
  const tsx = htmlToReactPdf(`<div>raw</div>`)

  expect(tsx).toContain('<View>')
  expect(tsx).toContain('<Text>raw</Text>')
})

test('honors a custom component name', () => {
  const tsx = htmlToReactPdf(`<p>hi</p>`, { componentName: 'Invoice' })

  expect(tsx).toContain('export function Invoice')
  expect(tsx).toContain('export default Invoice')
})

test('emits requiredFonts metadata for custom font families', () => {
  const tsx = htmlToReactPdf(
    `<div style="font-family: Pretendard; font-weight: 700">청구서</div><span style="font-family: Pretendard">합계</span>`,
  )

  expect(tsx).toContain('export const requiredFonts')
  expect(tsx).toContain('"family": "Pretendard"')
  expect(tsx).toContain('400')
  expect(tsx).toContain('700')
})

test('omits requiredFonts when only generic families are used', () => {
  const tsx = htmlToReactPdf(`<div style="font-family: Arial, sans-serif">x</div>`)

  expect(tsx).not.toContain('requiredFonts')
})

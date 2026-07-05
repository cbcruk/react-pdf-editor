import { expect, test } from 'vite-plus/test'
import { htmlToReactPdf } from '../src/index.ts'

test('snapshot: document with heading, list and table', () => {
  const tsx = htmlToReactPdf(
    `<div style="padding: 16px">
      <h1>보고서</h1>
      <ol><li>설계</li><li>구현</li></ol>
      <table><tr><th>항목</th><th>값</th></tr><tr><td>A</td><td>1</td></tr></table>
    </div>`,
    { componentName: 'Report' },
  )

  expect(tsx).toMatchSnapshot()
})

test('snapshot: img with border shorthand', () => {
  const tsx = htmlToReactPdf(
    `<div style="border: 1px solid #cccccc"><img src="logo.png" style="width: 48px" /></div>`,
  )

  expect(tsx).toMatchSnapshot()
})

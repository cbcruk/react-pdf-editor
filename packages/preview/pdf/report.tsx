import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import { Callout, Heading, List, Section, tokens } from '@pkg/components'

const styles = StyleSheet.create({
  page: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.normal,
    color: tokens.color.text,
    paddingVertical: tokens.page.paddingVertical,
    paddingHorizontal: tokens.page.paddingHorizontal,
  },
})

export interface ReportProps {
  title?: string
  highlights?: string[]
  note?: string
}

export const previewProps: ReportProps = {
  title: '2026년 2분기 운영 보고서',
  highlights: [
    '월간 활성 사용자 38% 증가',
    'PDF 렌더링 평균 응답 시간 220ms 달성',
    '신규 컴포넌트 키트(List, Callout) 도입',
  ],
  note: '다음 분기에는 마이그레이터 Playwright 경로를 정식 출시할 예정입니다.',
}

export function Report({
  title = previewProps.title,
  highlights = previewProps.highlights,
  note = previewProps.note,
}: ReportProps): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Heading level={1}>{title}</Heading>

        <Section title="주요 성과">
          <List items={highlights ?? []} ordered />
        </Section>

        <Section title="비고">
          <Callout title="안내" variant="info">
            {note}
          </Callout>
          <Callout title="주의" variant="warning">
            본 수치는 잠정치이며 확정 시 갱신됩니다.
          </Callout>
        </Section>
      </Page>
    </Document>
  )
}

export default Report

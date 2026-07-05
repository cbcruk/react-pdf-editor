import { Document, Page, StyleSheet, View } from '@react-pdf/renderer'
import {
  Callout,
  Divider,
  Field,
  Heading,
  KeyValue,
  List,
  Section,
  Signature,
  Spacer,
  Table,
  tokens,
} from '@pkg/components'

const styles = StyleSheet.create({
  page: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.normal,
    color: tokens.color.text,
    paddingVertical: tokens.page.paddingVertical,
    paddingHorizontal: tokens.page.paddingHorizontal,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.space.xl,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.space.lg,
  },
})

export interface KitShowcaseProps {
  title?: string
}

export const previewProps: KitShowcaseProps = {
  title: '컴포넌트 키트 쇼케이스',
}

export function KitShowcase({ title = previewProps.title }: KitShowcaseProps): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Heading level={1}>{title}</Heading>

        <Section title="KeyValue / Field">
          <View style={styles.row}>
            <KeyValue label="문서 번호" value="DOC-2026-001" />
            <KeyValue label="작성일" value="2026년 6월 29일" />
          </View>
          <Field label="작성자" value="이은수" />
        </Section>

        <Divider />

        <Section title="List">
          <List items={['디자인 토큰', '컴포넌트 키트', '마이그레이터']} ordered />
        </Section>

        <Spacer size="md" />

        <Section title="Table">
          <Table
            columns={[
              { key: 'name', header: '항목' },
              { key: 'value', header: '값', width: 120, align: 'right' },
            ]}
            data={[
              { name: '컴포넌트', value: '10개' },
              { name: '테스트', value: '통과' },
            ]}
          />
        </Section>

        <Section title="Callout">
          <Callout title="안내" variant="info">
            모든 컴포넌트는 ThemeProvider로 테마를 바꿀 수 있습니다.
          </Callout>
          <Callout title="주의" variant="warning">
            폰트는 호스트가 등록해야 합니다.
          </Callout>
        </Section>

        <View style={styles.signatureRow}>
          <Signature label="확인" />
          <Signature label="승인" />
        </View>
      </Page>
    </Document>
  )
}

export default KitShowcase

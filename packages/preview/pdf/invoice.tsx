import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Heading, Table, tokens } from '@pkg/components'

const styles = StyleSheet.create({
  page: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.base,
    color: tokens.color.text,
    paddingVertical: tokens.page.paddingVertical,
    paddingHorizontal: tokens.page.paddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.space.xl,
  },
  meta: {
    fontSize: tokens.fontSize.sm,
    color: tokens.color.muted,
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: tokens.space.md,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
  },
})

interface LineItem {
  name: string
  amount: string
  [key: string]: string
}

export interface InvoiceProps {
  invoiceNo?: string
  date?: string
  items?: LineItem[]
  total?: string
}

export const previewProps: InvoiceProps = {
  invoiceNo: 'INV-2026-0042',
  date: '2026년 6월 28일',
  items: [
    { name: '디자인 컨설팅 (16시간)', amount: '1,600,000원' },
    { name: '프론트엔드 개발 (40시간)', amount: '4,000,000원' },
    { name: 'PDF 렌더링 엔진 통합', amount: '1,200,000원' },
  ],
  total: '6,800,000원',
}

export function Invoice({
  invoiceNo = previewProps.invoiceNo,
  date = previewProps.date,
  items = previewProps.items,
  total = previewProps.total,
}: InvoiceProps): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Heading level={1}>청구서</Heading>
          <Text style={styles.meta}>
            {invoiceNo}
            {'\n'}
            {date}
          </Text>
        </View>

        <Table
          columns={[
            { key: 'name', header: '항목' },
            { key: 'amount', header: '금액', width: 120, align: 'right' },
          ]}
          data={items ?? []}
        />

        <View style={styles.total}>
          <Text>합계 {total}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default Invoice

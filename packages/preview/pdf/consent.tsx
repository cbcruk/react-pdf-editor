import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Field, Heading, Section, Signature, tokens } from '@pkg/components'

const styles = StyleSheet.create({
  page: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.normal,
    color: tokens.color.text,
    paddingVertical: tokens.page.paddingVertical,
    paddingHorizontal: tokens.page.paddingHorizontal,
  },
  subtitle: {
    fontSize: tokens.fontSize.base,
    color: tokens.color.muted,
    marginBottom: tokens.space.lg,
  },
  weightRow: {
    flexDirection: 'row',
    gap: tokens.space.md,
    marginTop: tokens.space.sm,
  },
  weightSample: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.sm,
    padding: tokens.space.md,
  },
  weightLabel: {
    fontSize: tokens.fontSize.sm,
    color: tokens.color.muted,
    marginBottom: tokens.space.xs,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.space.xl,
  },
})

export interface ConsentProps {
  patientName?: string
  procedure?: string
  date?: string
}

export const previewProps: ConsentProps = {
  patientName: '홍길동',
  procedure: '위내시경 검사',
  date: '2026년 6월 28일',
}

export function Consent({
  patientName = previewProps.patientName,
  procedure = previewProps.procedure,
  date = previewProps.date,
}: ConsentProps): React.ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Heading level={1}>의료행위 동의서</Heading>
        <Text style={styles.subtitle}>Medical Procedure Consent Form</Text>

        <Section title="1. 환자 정보">
          <Field label="성명" value={patientName} />
          <Field label="시술명" value={procedure} />
          <Field label="작성일" value={date} />
        </Section>

        <Section title="2. 시술 설명">
          <Text>
            본 동의서는 한글 글리프와 폰트 weight 렌더링을 검증하기 위한 예시입니다.
            가나다라마바사아자차카타파하, 영문 ABCDEFG, 숫자 1234567890이 동일한 Pretendard 폰트로
            일관되게 출력되는지 확인합니다. 환자는 시술의 목적과 위험성을 충분히 이해하였습니다.
          </Text>
        </Section>

        <Section title="3. Weight 렌더링 검증">
          <View style={styles.weightRow}>
            <View style={styles.weightSample}>
              <Text style={styles.weightLabel}>fontWeight: 400 (Regular)</Text>
              <Text style={{ fontWeight: tokens.fontWeight.regular }}>
                다람쥐 헌 쳇바퀴에 타고파 — Regular 400
              </Text>
            </View>
            <View style={styles.weightSample}>
              <Text style={styles.weightLabel}>fontWeight: 700 (Bold)</Text>
              <Text style={{ fontWeight: tokens.fontWeight.bold }}>
                다람쥐 헌 쳇바퀴에 타고파 — Bold 700
              </Text>
            </View>
          </View>
          <Text style={{ marginTop: tokens.space.sm }}>
            아래 문장에서 <Text style={{ fontWeight: tokens.fontWeight.bold }}>굵은 글씨</Text>
            가 얇은 글씨와 명확히 구분되면 weight 폴백 문제가 해결된 것입니다.
          </Text>
        </Section>

        <View style={styles.signatureRow}>
          <Signature label="환자 서명" />
          <Signature label="담당의 서명" />
        </View>
      </Page>
    </Document>
  )
}

export default Consent

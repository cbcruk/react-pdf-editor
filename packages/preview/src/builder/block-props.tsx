import type { ReactNode } from 'react'
import { useState } from 'react'
import { parseLength } from '@pkg/migrator/browser'
import type { Block, BlockStyle } from './builder.types.ts'

interface BlockPropsProps {
  block: Block
  onChange: (patch: Record<string, unknown>) => void
  onStyleChange: (patch: BlockStyle) => void
}

export function BlockProps({
  block,
  onChange,
  onStyleChange,
}: BlockPropsProps): React.ReactElement {
  return (
    <>
      <ContentFields block={block} onChange={onChange} />
      <LayoutControls block={block} onChange={onStyleChange} />
    </>
  )
}

function ContentFields({
  block,
  onChange,
}: {
  block: Block
  onChange: (patch: Record<string, unknown>) => void
}): React.ReactElement {
  switch (block.type) {
    case 'Section':
      return (
        <TextInput
          label="제목"
          value={block.props.title}
          onChange={(title) => onChange({ title })}
        />
      )
    case 'Heading':
      return (
        <>
          <label style={styles.label}>
            레벨
            <select
              value={block.props.level}
              onChange={(event) => onChange({ level: Number(event.target.value) })}
              style={styles.input}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <TextInput
            label="텍스트"
            value={block.props.text}
            onChange={(text) => onChange({ text })}
          />
        </>
      )
    case 'Field':
      return (
        <>
          <TextInput
            label="라벨"
            value={block.props.label}
            onChange={(label) => onChange({ label })}
          />
          <TextInput
            label="값"
            value={block.props.value}
            onChange={(value) => onChange({ value })}
          />
        </>
      )
    case 'Text':
      return (
        <label style={styles.label}>
          텍스트
          <textarea
            value={block.props.text}
            onChange={(event) => onChange({ text: event.target.value })}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>
      )
    case 'Table':
      return (
        <>
          <JsonInput
            label="columns"
            value={block.props.columns}
            onChange={(columns) => onChange({ columns })}
          />
          <JsonInput
            label="data"
            value={block.props.data}
            onChange={(data) => onChange({ data })}
          />
        </>
      )
  }
}

// 교차축 정렬(alignItems): column 이면 가로 정렬, row 이면 세로 정렬.
const ALIGN_OPTIONS = [
  { value: 'flex-start', label: '시작' },
  { value: 'center', label: '가운데' },
  { value: 'flex-end', label: '끝' },
  { value: 'stretch', label: '채움' },
] as const

// 주축 정렬(justifyContent): row 에서 자식들의 가로 분포.
const JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: '시작' },
  { value: 'center', label: '가운데' },
  { value: 'flex-end', label: '끝' },
  { value: 'space-between', label: '양끝' },
] as const

function LayoutControls({
  block,
  onChange,
}: {
  block: Block
  onChange: (patch: BlockStyle) => void
}): React.ReactElement {
  const style = block.style
  // 컨테이너(자식을 가진 Section)만 방향/정렬/간격이 의미 있다.
  const isContainer = block.type === 'Section'
  const isRow = style?.flexDirection === 'row'

  return (
    <>
      <div style={styles.sectionLabel}>레이아웃</div>

      {isContainer ? (
        <>
          <Row label="방향">
            <Segment
              value={isRow ? 'row' : 'column'}
              options={[
                { value: 'column', label: '세로' },
                { value: 'row', label: '가로' },
              ]}
              // react-pdf/yoga 기본이 column 이라 세로는 style 에서 제거한다.
              onChange={(value) => onChange({ flexDirection: value === 'row' ? 'row' : undefined })}
            />
          </Row>
          <Row label="교차축 정렬">
            <Segment
              value={style?.alignItems ?? 'default'}
              options={[{ value: 'default', label: '기본' }, ...ALIGN_OPTIONS]}
              onChange={(value) =>
                onChange({
                  alignItems: value === 'default' ? undefined : (value as BlockStyle['alignItems']),
                })
              }
            />
          </Row>
          {isRow ? (
            <Row label="주축 정렬">
              <Segment
                value={style?.justifyContent ?? 'default'}
                options={[{ value: 'default', label: '기본' }, ...JUSTIFY_OPTIONS]}
                onChange={(value) =>
                  onChange({
                    justifyContent:
                      value === 'default' ? undefined : (value as BlockStyle['justifyContent']),
                  })
                }
              />
            </Row>
          ) : null}
          <NumberField
            label="간격 (gap, pt)"
            value={style?.gap}
            onChange={(gap) => onChange({ gap })}
          />
        </>
      ) : null}

      <LengthField
        label="폭 (width, pt 또는 %)"
        value={style?.width}
        onChange={(width) => onChange({ width })}
      />
      <Row label="남는 공간">
        <Toggle
          on={style?.flexGrow === 1}
          label="채우기 (flexGrow)"
          onChange={(on) => onChange({ flexGrow: on ? 1 : undefined })}
        />
      </Row>

      <NumberField
        label="바깥 위 여백 (marginTop)"
        value={style?.marginTop}
        onChange={(marginTop) => onChange({ marginTop })}
      />
      <NumberField
        label="바깥 아래 여백 (marginBottom)"
        value={style?.marginBottom}
        onChange={(marginBottom) => onChange({ marginBottom })}
      />
      <NumberField
        label="안쪽 여백 (padding)"
        value={style?.padding}
        onChange={(padding) => onChange({ padding })}
      />

      <ColorField
        label="배경색"
        value={style?.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
      <NumberField
        label="테두리 두께 (borderWidth)"
        value={style?.borderWidth}
        onChange={(borderWidth) => onChange({ borderWidth })}
      />
      <ColorField
        label="테두리 색"
        value={style?.borderColor}
        onChange={(borderColor) => onChange({ borderColor })}
      />
      <NumberField
        label="모서리 반경 (borderRadius)"
        value={style?.borderRadius}
        onChange={(borderRadius) => onChange({ borderRadius })}
      />
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }): React.ReactElement {
  return (
    <div style={styles.label}>
      {label}
      {children}
    </div>
  )
}

function Segment({
  value,
  options,
  onChange,
}: {
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}): React.ReactElement {
  return (
    <div style={styles.segment}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            ...styles.segmentButton,
            ...(value === option.value ? styles.segmentActive : null),
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  on,
  label,
  onChange,
}: {
  on: boolean
  label: string
  onChange: (on: boolean) => void
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{ ...styles.segmentButton, ...(on ? styles.segmentActive : null) }}
    >
      {label}
    </button>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | string | undefined
  onChange: (next: number | undefined) => void
}): React.ReactElement {
  return (
    <Row label={label}>
      <input
        type="number"
        value={typeof value === 'number' ? value : ''}
        placeholder="0"
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === '' ? undefined : Number(raw))
        }}
        style={styles.input}
      />
    </Row>
  )
}

function LengthField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | string | undefined
  onChange: (next: number | string | undefined) => void
}): React.ReactElement {
  return (
    <Row label={label}>
      <input
        type="text"
        value={value ?? ''}
        placeholder="auto"
        onChange={(event) => onChange(parseLength(event.target.value))}
        style={styles.input}
      />
    </Row>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (next: string | undefined) => void
}): React.ReactElement {
  const swatch = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'

  return (
    <Row label={label}>
      <div style={styles.colorRow}>
        <input
          type="color"
          value={swatch}
          onChange={(event) => onChange(event.target.value)}
          style={styles.colorSwatch}
        />
        <input
          type="text"
          value={value ?? ''}
          placeholder="없음"
          onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
          style={{ ...styles.input, flex: 1 }}
        />
      </div>
    </Row>
  )
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}): React.ReactElement {
  return (
    <label style={styles.label}>
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  )
}

function JsonInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: unknown
  onChange: (next: unknown) => void
}): React.ReactElement {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  const handleChange = (next: string): void => {
    setText(next)
    try {
      onChange(JSON.parse(next))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid JSON')
    }
  }

  return (
    <label style={styles.label}>
      {label}
      <textarea
        spellCheck={false}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        style={{
          ...styles.input,
          ...styles.textarea,
          ...(error ? styles.invalid : null),
        }}
      />
      {error ? <span style={styles.error}>{error}</span> : null}
    </label>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 8,
  },
  segment: {
    display: 'flex',
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    appearance: 'none',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#374151',
    fontSize: 12,
    padding: '5px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  segmentActive: {
    background: '#eff6ff',
    borderColor: '#2563eb',
    color: '#1d4ed8',
  },
  colorRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 32,
    height: 30,
    padding: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    background: 'none',
    cursor: 'pointer',
  },
  input: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 12,
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    minHeight: 72,
    resize: 'vertical',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    lineHeight: 1.5,
  },
  invalid: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
  },
}

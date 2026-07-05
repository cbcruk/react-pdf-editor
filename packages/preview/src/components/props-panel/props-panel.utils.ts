export type FieldKind = 'string' | 'number' | 'boolean' | 'array' | 'json'

export function getFieldKind(value: unknown): FieldKind {
  if (typeof value === 'string') {
    return 'string'
  }

  if (typeof value === 'number') {
    return 'number'
  }

  if (typeof value === 'boolean') {
    return 'boolean'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return 'json'
}

export function emptyLike(sample: unknown): unknown {
  if (Array.isArray(sample)) {
    return []
  }

  if (sample && typeof sample === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(sample)) {
      result[key] = emptyLike(value)
    }
    return result
  }

  if (typeof sample === 'number') {
    return 0
  }

  if (typeof sample === 'boolean') {
    return false
  }

  return ''
}

export function parseReviewContent(value?: string | null): Record<string, unknown> {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return { value: parsed }
  } catch {
    // 相容既有 Java toString 快照：CodeDescription(...) 或 {codeGroup=..., codeField=...}。
    const body = value.match(/^[^(]+\((.*)\)$/s)?.[1] ?? value.match(/^\{(.*)\}$/s)?.[1]
    if (!body) return { value }
    return Object.fromEntries(
      body.split(/, (?=[A-Za-z][A-Za-z0-9]*=)/).map((entry) => {
        const separator = entry.indexOf('=')
        return separator < 0 ? ['value', entry] : [entry.slice(0, separator), entry.slice(separator + 1)]
      })
    )
  }
}

export function hasDetailValue(value: unknown) {
  return value != null && value !== ''
}

/** 將巢狀物件與陣列拆成可逐列比較的 path -> scalar value。 */
export function flattenReviewContent(content: Record<string, unknown>) {
  const flattened: Record<string, unknown> = {}
  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      if (!value.length) flattened[path] = []
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      if (!entries.length) flattened[path] = {}
      entries.forEach(([key, item]) => visit(item, path ? `${path}.${key}` : key))
      return
    }
    flattened[path] = value
  }
  Object.entries(content).forEach(([key, value]) => visit(value, key))
  return flattened
}

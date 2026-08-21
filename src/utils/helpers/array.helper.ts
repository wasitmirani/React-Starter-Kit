export function uniqueBy<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<unknown>()
  return items.filter((item) => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key])
    acc[groupKey] ??= []
    acc[groupKey].push(item)
    return acc
  }, {})
}

export function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

/** Money for operations screens: PKR without decimals, other currencies with two. */
export function formatMoney(value: number, currency: string): string {
  const whole = currency === 'PKR'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }).format(value)
}

export function formatCurrency(value: number, currency = "USDT"): string {
  return `${value.toLocaleString()} ${currency}`
}

export function formatCryptoAmount(value: string | number): string {
  return Number(value).toFixed(7)
}

export function formatPercentage(value: number, sign = true): string {
  return `${sign && value > 0 ? "+" : ""}${value}%`
}

export function formatPnl(value: number, currency = "USDT"): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value.toFixed(2)} ${currency}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString()
}

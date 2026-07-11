/**
 * Formats a number as Brazilian Real (BRL) currency string.
 * Output format: "R$ X.XXX,XX"
 *
 * Guards against NaN/undefined with fallback to "R$ 0,00".
 */
export function formatBRL(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "R$ 0,00";
  }

  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `R$ ${formatted}`;
}

/**
 * Formats a number as a percentage string with configurable decimal places.
 * Default is 1 decimal place.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0,0%";
  }

  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formatted}%`;
}

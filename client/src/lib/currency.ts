import { CURRENCY_OPTIONS, Currency } from "@shared/schema";

// Format a number as currency with proper symbol
export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  const { symbol } = CURRENCY_OPTIONS[currency];
  
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Convert amount between currencies
export function convertCurrency(
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const { conversionRate } = CURRENCY_OPTIONS[fromCurrency];
  return parseFloat((amount * conversionRate[toCurrency]).toFixed(2));
}

// Get currency options for a select component
export function getCurrencyOptions() {
  return Object.entries(CURRENCY_OPTIONS).map(([code, { name, symbol }]) => ({
    value: code,
    label: `${code} (${symbol})`,
    name
  }));
}

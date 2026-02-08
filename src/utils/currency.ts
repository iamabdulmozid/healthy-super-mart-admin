// src/utils/currency.ts

/**
 * Centralized Currency Manager
 * 
 * This module provides a single source of truth for currency formatting
 * across the entire application. It uses Bangladeshi Taka (৳) as the default currency.
 */

// Currency configuration
const CURRENCY_CONFIG = {
  symbol: '৳',
  code: 'BDT',
  locale: 'en-BD',
  decimals: 2,
} as const;

/**
 * Format a number as currency using the application's default currency (BDT/৳)
 * 
 * @param amount - The numeric amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string with ৳ symbol
 * 
 * @example
 * formatCurrency(1000) // "৳1,000.00"
 * formatCurrency(1234.56) // "৳1,234.56"
 * formatCurrency(1000, { showDecimals: true }) // "৳1,000.00"
 */
export const formatCurrency = (
  amount: number | string,
  options: {
    showDecimals?: boolean;
    decimals?: number;
  } = {}
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return `${CURRENCY_CONFIG.symbol}0`;
  }

  const decimals = options.decimals ?? (options.showDecimals ? 2 : CURRENCY_CONFIG.decimals);

  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
};

/**
 * Format a price for display (alias for formatCurrency)
 * Common use case in POS and product listings
 */
export const formatPrice = formatCurrency;

/**
 * Get the currency symbol
 * @returns The currency symbol (৳)
 */
export const getCurrencySymbol = (): string => {
  return CURRENCY_CONFIG.symbol;
};

/**
 * Get the currency code
 * @returns The currency code (BDT)
 */
export const getCurrencyCode = (): string => {
  return CURRENCY_CONFIG.code;
};

/**
 * Format currency with explicit sign for positive/negative amounts
 * Useful for transaction displays and accounting
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted currency string with +/- prefix
 * 
 * @example
 * formatCurrencyWithSign(1000) // "+৳1,000.00"
 * formatCurrencyWithSign(-500) // "-৳500.00"
 */
export const formatCurrencyWithSign = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const absAmount = Math.abs(numAmount);
  const formatted = formatCurrency(absAmount);
  
  return numAmount >= 0 ? `+${formatted}` : `-${formatted}`;
};

/**
 * Parse a currency string to a number
 * Removes currency symbols and formatting
 * 
 * @param currencyString - The formatted currency string
 * @returns The numeric value
 * 
 * @example
 * parseCurrency("৳1,000") // 1000
 * parseCurrency("৳1,234.56") // 1234.56
 */
export const parseCurrency = (currencyString: string): number => {
  // Keep only numeric characters, decimal point, and negative sign
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Export configuration for advanced use cases
export const currencyConfig = CURRENCY_CONFIG;

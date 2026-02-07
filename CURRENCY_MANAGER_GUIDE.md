# Currency Manager - Quick Reference Guide

## Import
```typescript
import { 
  formatCurrency, 
  formatPrice, 
  formatCurrencyWithSign,
  getCurrencySymbol,
  getCurrencyCode,
  parseCurrency 
} from '@/utils/currency';
```

## Common Use Cases

### 1. Format Product Prices
```typescript
// Simple price formatting
const price = formatPrice(1234.56);  // "¥1,235"

// With decimals (for detailed views)
const price = formatPrice(1234.56, { showDecimals: true });  // "¥1,234.56"
```

### 2. Format Currency Amounts
```typescript
// Same as formatPrice
const total = formatCurrency(5000);  // "¥5,000"

// With custom decimal places
const amount = formatCurrency(100, { decimals: 2 });  // "¥100.00"
```

### 3. Transaction Amounts (with +/- signs)
```typescript
// Positive amount
const credit = formatCurrencyWithSign(1000);  // "+¥1,000"

// Negative amount
const debit = formatCurrencyWithSign(-500);  // "-¥500"
```

### 4. Currency Symbol in Input Fields
```tsx
// Dynamic currency symbol
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
    {getCurrencySymbol()}
  </span>
  <input type="number" className="pl-8" />
</div>
```

### 5. Get Currency Code
```typescript
// For API calls or exports
const code = getCurrencyCode();  // "JPY"
```

### 6. Parse Currency String to Number
```typescript
// Remove currency symbols and get numeric value
const value = parseCurrency("¥1,234.56");  // 1234.56
const value2 = parseCurrency("¥1,000");     // 1000
```

## Function Reference

### `formatCurrency(amount, options?)`
Format a number as currency.

**Parameters:**
- `amount: number | string` - The amount to format
- `options?: { showDecimals?: boolean, decimals?: number }` - Optional formatting options

**Returns:** `string` - Formatted currency string

**Examples:**
```typescript
formatCurrency(1000)                        // "¥1,000"
formatCurrency(1234.56)                     // "¥1,235"
formatCurrency(1234.56, { showDecimals: true })  // "¥1,234.56"
formatCurrency(100, { decimals: 2 })        // "¥100.00"
formatCurrency("1500")                      // "¥1,500"
```

---

### `formatPrice(amount, options?)`
Alias for `formatCurrency`. Commonly used in POS and product contexts.

**Parameters:** Same as `formatCurrency`

**Returns:** `string` - Formatted currency string

---

### `formatCurrencyWithSign(amount)`
Format currency with explicit +/- sign prefix.

**Parameters:**
- `amount: number | string` - The amount to format

**Returns:** `string` - Formatted currency with sign

**Examples:**
```typescript
formatCurrencyWithSign(1000)   // "+¥1,000"
formatCurrencyWithSign(-500)   // "-¥500"
formatCurrencyWithSign(0)      // "+¥0"
```

---

### `getCurrencySymbol()`
Get the current currency symbol.

**Returns:** `string` - Currency symbol ("¥")

**Example:**
```typescript
const symbol = getCurrencySymbol();  // "¥"
```

---

### `getCurrencyCode()`
Get the current currency code.

**Returns:** `string` - Currency code ("JPY")

**Example:**
```typescript
const code = getCurrencyCode();  // "JPY"
```

---

### `parseCurrency(currencyString)`
Parse a formatted currency string to a number.

**Parameters:**
- `currencyString: string` - The formatted currency string

**Returns:** `number` - Numeric value

**Examples:**
```typescript
parseCurrency("¥1,234.56")  // 1234.56
parseCurrency("¥1,000")     // 1000
parseCurrency("1500")       // 1500
```

---

## Configuration

The currency configuration is defined in `src/utils/currency.ts`:

```typescript
const CURRENCY_CONFIG = {
  symbol: '¥',           // Currency symbol
  code: 'JPY',           // ISO currency code
  locale: 'ja-JP',       // Locale for number formatting
  decimals: 0,           // Default decimal places (JPY standard)
};
```

### To Change Currency:
1. Open `src/utils/currency.ts`
2. Update the `CURRENCY_CONFIG` object
3. Save the file - all components will use the new currency automatically

Example for USD:
```typescript
const CURRENCY_CONFIG = {
  symbol: '$',
  code: 'USD',
  locale: 'en-US',
  decimals: 2,
};
```

## Best Practices

### ✅ DO
```typescript
// Use centralized formatter
import { formatPrice } from '@/utils/currency';
const price = formatPrice(product.price);
```

### ❌ DON'T
```typescript
// Don't create custom formatters
const price = `¥${product.price.toFixed(2)}`;  // ❌ Don't do this

// Don't hardcode currency symbols
<span>¥{amount}</span>  // ❌ Don't do this
```

### ✅ DO
```typescript
// Use getCurrencySymbol() for dynamic symbols
<span>{getCurrencySymbol()}</span>
```

## Component Examples

### Product Card
```tsx
import { formatPrice } from '@/utils/currency';

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.retailPrice, { showDecimals: true })}</p>
    </div>
  );
}
```

### Transaction Row
```tsx
import { formatCurrencyWithSign } from '@/utils/currency';

function TransactionRow({ transaction }) {
  return (
    <tr>
      <td>{transaction.description}</td>
      <td className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
        {formatCurrencyWithSign(transaction.amount)}
      </td>
    </tr>
  );
}
```

### Cart Total
```tsx
import { formatCurrency } from '@/utils/currency';

function CartSummary({ cart }) {
  return (
    <div>
      <div>Subtotal: {formatCurrency(cart.subtotal)}</div>
      <div>Tax: {formatCurrency(cart.tax)}</div>
      <div className="font-bold">
        Total: {formatCurrency(cart.total)}
      </div>
    </div>
  );
}
```

### Amount Input
```tsx
import { getCurrencySymbol } from '@/utils/currency';

function AmountInput({ value, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        {getCurrencySymbol()}
      </span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="pl-8 pr-4 py-2 border rounded"
        placeholder="0.00"
      />
    </div>
  );
}
```

## Troubleshooting

### Issue: Import not found
```
Error: Cannot find module '@/utils/currency'
```
**Solution:** Make sure the alias `@` is configured in your `tsconfig.json` and `vite.config.ts`

### Issue: Wrong decimal places
```
Expected: ¥1,234.56
Got: ¥1,235
```
**Solution:** Use the `showDecimals` option:
```typescript
formatCurrency(1234.56, { showDecimals: true })
```

### Issue: Need different currency
**Solution:** Update `CURRENCY_CONFIG` in `src/utils/currency.ts`

---

**Last Updated:** November 8, 2025

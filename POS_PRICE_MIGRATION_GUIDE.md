# POS Price Migration Guide

## Issue Fixed
**Error**: `Cannot read properties of undefined (reading 'toFixed')`

This error occurred because existing products in the database don't have the `posPrice` field set, but the frontend was trying to format it without checking for undefined values.

## Frontend Fixes Applied

### 1. **ProductList Component**
- ✅ **Enhanced formatPrice function** to handle undefined/null values
- ✅ **Added fallback display** for products without posPrice
- ✅ **Shows "Not set" for missing posPrice values**

### 2. **CartContext Component** 
- ✅ **Fallback logic** in cart pricing
- ✅ **Uses posPrice if available, otherwise falls back to retailPrice**
- ✅ **Prevents cart errors** for products without posPrice

## Database Migration Recommendations

Since existing products may not have `posPrice` values, consider running a database migration:

### Option 1: Copy Retail Price (Recommended)
```sql
-- Update existing products to use retail price as default POS price
UPDATE products 
SET posPrice = retailPrice 
WHERE posPrice IS NULL OR posPrice = 0;
```

### Option 2: Set Default POS Price with Markup
```sql
-- Set POS price as retail price + 5% markup
UPDATE products 
SET posPrice = retailPrice * 1.05 
WHERE posPrice IS NULL OR posPrice = 0;
```

### Option 3: Set Minimum POS Price
```sql
-- Set POS price as wholesale price + minimum margin
UPDATE products 
SET posPrice = GREATEST(wholesalePrice * 1.2, retailPrice) 
WHERE posPrice IS NULL OR posPrice = 0;
```

## Verification Steps

### 1. **Check Product List**
- ✅ Products without posPrice show "Not set"
- ✅ Products with posPrice show formatted price
- ✅ No more formatting errors

### 2. **Test POS Cart**
- ✅ Add products without posPrice (uses retailPrice)
- ✅ Add products with posPrice (uses posPrice)
- ✅ Cart calculations work correctly

### 3. **Test Product Form**
- ✅ Create new product with posPrice
- ✅ Edit existing product to add posPrice
- ✅ Save and verify changes

## Current Behavior

### For Products WITHOUT posPrice:
- **Product List**: Shows "Not set" in gray italic text
- **POS Cart**: Uses retailPrice as fallback
- **Product Form**: Can be edited to add posPrice

### For Products WITH posPrice:
- **Product List**: Shows formatted posPrice in blue
- **POS Cart**: Uses posPrice for calculations
- **Product Form**: Shows current posPrice value

## Benefits of This Approach

1. **Backward Compatibility**: Existing products continue to work
2. **Graceful Degradation**: Clear indication when posPrice is missing
3. **No Data Loss**: Preserves existing pricing structure
4. **Smooth Migration**: Admins can update posPrice gradually

## Next Steps

1. **Run Database Migration** (choose one of the options above)
2. **Update Products Manually** through the admin interface
3. **Set Business Rules** for posPrice calculation
4. **Train Staff** on the new pricing structure

## Monitoring

After migration, monitor for:
- Products still showing "Not set" for posPrice
- POS transactions using correct pricing
- Admin users updating product pricing correctly
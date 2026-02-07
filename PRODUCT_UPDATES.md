# Product API Updates - Barcode and Purchase Price Integration

## Overview
Added support for the new `barcode` and `purchasePrice` fields in the products table. The `barcode` field was already supported, so minimal changes were required to integrate the `purchasePrice` field.

## Changes Made

### 1. Type Definitions (`src/types/product.ts`)
- ✅ Added `purchasePrice?: string | number` to `Product` interface
- ✅ Added `purchasePrice?: number` to `CreateProductRequest` interface  
- ✅ Barcode field was already present in both interfaces

### 2. ProductForm Component (`src/modules/admin/components/ProductForm.tsx`)
- ✅ Added `purchasePrice: 0` to initial form data state
- ✅ Added `barcode: ''` to initial form data state (was missing)
- ✅ Updated product data initialization for editing to include `purchasePrice` and `barcode`
- ✅ Added Purchase Price input field to the pricing section
- ✅ Updated pricing grid layout from 3 columns to 4 columns (sm:grid-cols-2 lg:grid-cols-4)
- ✅ Updated form submission to properly handle `purchasePrice` field
- ✅ Barcode field was already properly implemented with generate functionality

## API Request Format
The form now sends the following fields as per your updated cURL example:

```json
{
  "name": "Product Name",
  "slug": "product-slug", 
  "description": "Product description",
  "categoryId": 1,
  "subcategoryId": 1,
  "shopId": 3,
  "barcode": "1000000000001",
  "purchasePrice": 80.00,
  "retailPrice": 99.99,
  "wholesalePrice": 79.99,
  "oldPrice": 120.00,
  "weight": 0.5,
  "stockQuantity": 100,
  "image": "https://example.com/image.jpg",
  "shippingType": "dry",
  "status": "active",
  "isFeatured": true
}
```

## User Interface Changes

### Pricing Section Layout
The pricing section now displays:
1. **Purchase Price** (optional) - New field added
2. **Retail Price** (required) - Existing field
3. **Wholesale Price** (required) - Existing field  
4. **Old Price** (optional) - Existing field

### Responsive Design
- Mobile (1 column): All price fields stack vertically
- Tablet (2 columns): Price fields arranged in 2x2 grid
- Desktop (4 columns): All price fields in a single row

### Barcode Field
- Already properly implemented with:
  - Manual entry input
  - Auto-generate button functionality
  - Form validation and submission

## Backward Compatibility
- All changes are backward compatible
- Optional fields (`purchasePrice`, `barcode`) won't break existing functionality
- Form handles both create and update operations correctly

## Testing Checklist
- [ ] Create new product with purchase price
- [ ] Create new product without purchase price
- [ ] Edit existing product and add purchase price
- [ ] Barcode generation functionality
- [ ] Form validation for required fields
- [ ] Responsive design on different screen sizes
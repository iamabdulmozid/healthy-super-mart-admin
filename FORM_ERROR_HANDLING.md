# Form Error Handling Best Practices

## Overview

Forms should display errors in TWO places for the best user experience:
1. **Toast Notifications** (top-right) - Auto-dismiss popup for immediate feedback
2. **Inline Error Banners** (within form) - Persistent context for users filling out the form

## Implementation Pattern

### Complete Form Error Handling Example

```typescript
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

export default function ProductForm({ onClose, onSubmit }: FormProps) {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({...});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      await apiService.submitForm(formData);
      
      // Show success toast
      showSuccess('Form submitted successfully', 'Success');
      
      // Close form or navigate away
      onSubmit();
    } catch (error: any) {
      // 1. Set inline error for form context
      setError(error.message || 'Failed to submit form');
      
      // 2. Show toast notification with ALL validation errors
      showError(
        error.message || 'Failed to submit form',
        `Validation Error${error.code ? ` (${error.code})` : ''}`,
        error.errors // Array of all validation messages
      );
      
      // 3. Scroll to top to make inline error visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Inline Error Banner - Stays visible while form is open */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs mt-1 text-red-600">
                Please check the validation errors above and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form fields... */}
      
      {/* Submit button with loading state */}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-primary-600 text-white rounded-lg"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Why Both Inline AND Toast Errors?

### Toast Notifications (Top-Right Popup)
**Purpose**: Immediate, attention-grabbing feedback
- ✅ **Visible**: Appears on top of everything
- ✅ **Auto-dismiss**: Doesn't clutter the UI
- ✅ **Multiple errors**: Shows all validation issues at once
- ✅ **Contextual**: User knows immediately if something went wrong

**When to use**:
- Form submission failures
- API validation errors
- Any user action that needs immediate feedback

### Inline Error Banners (Within Form)
**Purpose**: Persistent context for form correction
- ✅ **Stays visible**: User can reference while fixing issues
- ✅ **Contextual**: Right next to the form being edited
- ✅ **Scrollable**: User can scroll to it if needed

**When to use**:
- Always in combination with toast for form errors
- Helps users who dismiss the toast too quickly
- Provides context when multiple forms are visible

## Error Response Handling

### API Response Format
```json
{
  "code": "E_BAD_REQUEST",
  "message": "Bad Request",
  "errors": [
    "barcode must be longer than or equal to 1 characters",
    "image must be a URL address",
    "name is required"
  ]
}
```

### How Errors are Displayed

#### Toast Notification (Auto-dismiss after 5 seconds)
```
┌─────────────────────────────────────────────┐
│ ⚠ Validation Error (E_BAD_REQUEST)    [X]  │
│                                             │
│ barcode must be longer than or equal to 1   │
│ characters                                  │
│                                             │
│ • image must be a URL address               │
│ • name is required                          │
└─────────────────────────────────────────────┘
```

#### Inline Banner (Stays until form is closed)
```
┌─────────────────────────────────────────────┐
│ ❌ barcode must be longer than or equal to  │
│    1 characters                             │
│                                             │
│    Please check the validation errors and   │
│    try again.                               │
└─────────────────────────────────────────────┘
```

## Field-Level Validation (Optional Enhancement)

For even better UX, you can add field-level error messages:

```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

catch (error: any) {
  // Parse validation errors into field-specific messages
  const errors: Record<string, string> = {};
  
  if (error.errors) {
    error.errors.forEach((err: string) => {
      if (err.includes('barcode')) errors.barcode = err;
      if (err.includes('image')) errors.image = err;
      if (err.includes('name')) errors.name = err;
      // ... etc
    });
  }
  
  setFieldErrors(errors);
  
  // Still show toast AND inline banner
  setError(error.message);
  showError(error.message, 'Validation Error', error.errors);
}
```

Then in your form:
```tsx
<div>
  <label>Barcode</label>
  <input
    type="text"
    value={formData.barcode}
    className={fieldErrors.barcode ? 'border-red-500' : ''}
  />
  {fieldErrors.barcode && (
    <p className="text-red-600 text-sm mt-1">{fieldErrors.barcode}</p>
  )}
</div>
```

## Client-Side Validation

Prevent errors BEFORE submission with client-side validation:

```typescript
const validateForm = (): boolean => {
  const errors: string[] = [];

  if (!formData.barcode || formData.barcode.length < 1) {
    errors.push('Barcode is required and must be at least 1 character');
  }

  if (!formData.image || !isValidURL(formData.image)) {
    errors.push('Image must be a valid URL address');
  }

  if (!formData.name || formData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (errors.length > 0) {
    const primaryError = errors[0];
    setError(primaryError);
    showError(primaryError, 'Validation Error', errors);
    return false;
  }

  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate before submitting
  if (!validateForm()) {
    return;
  }

  // ... submit to API
};
```

## Summary Checklist

When implementing form error handling:

- [ ] Import `useToast` hook
- [ ] Add `error` state for inline banner
- [ ] Clear error state (`setError(null)`) on submit
- [ ] In catch block:
  - [ ] Set inline error: `setError(error.message)`
  - [ ] Show toast: `showError(message, title, errors)`
  - [ ] Scroll to top: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- [ ] Display inline error banner in JSX
- [ ] Show success toast on successful submit
- [ ] Test with actual API validation errors
- [ ] Verify both toast AND inline errors appear

## Updated Components

The following components have been updated with dual error handling:
- ✅ ProductForm
- ✅ ProductsPage (list view errors)
- ✅ AdminKPIs (data loading errors)

All form components should follow this pattern for consistent UX.

# Error Handling Guide

## API Error Response Format

The API returns errors in the following format:

```json
{
  "code": "E_BAD_REQUEST",
  "message": "Bad Request",
  "errors": [
    "image must be a URL address",
    "name is required",
    "price must be a positive number"
  ]
}
```

### Error Fields

- **`code`**: Error code for programmatic error handling (e.g., `E_BAD_REQUEST`, `E_UNAUTHORIZED`, `E_NOT_FOUND`)
- **`message`**: General error message (fallback if errors array is empty)
- **`errors`**: Array of specific validation error messages

## Error Handling Strategy

### 1. API Client Processing

The API client (`src/lib/api-client.ts`) automatically processes error responses:

```typescript
interface ApiError {
  message: string;        // Primary error message (from errors[0] or message field)
  status: number;         // HTTP status code
  code?: string;          // Error code from API
  errors?: string[];      // Array of all validation errors
  validationErrors?: Record<string, string[]>; // Legacy format support
}
```

**Logic**:
1. If `errors` array exists and has items, use `errors[0]` as the primary message
2. Store all errors in the `errors` array for display
3. Include the error `code` for conditional logic
4. Fallback to `message` field if `errors` is empty

### 2. Displaying Errors to Users

Use the `useToast` hook to display errors:

```typescript
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const { showError } = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
    } catch (error: any) {
      showError(
        error.message || 'Operation failed',
        `Error${error.code ? ` (${error.code})` : ''}`,
        error.errors // Pass all errors for display
      );
    }
  };
}
```

**Toast Behavior**:
- Primary message (`errors[0]`) displays as main text
- Additional errors (`errors[1]`, `errors[2]`, etc.) display as bullet points
- Error code appears in the title for debugging

### 3. Error Code Based Logic

Use error codes for conditional handling:

```typescript
try {
  await productService.createProduct(data);
} catch (error: any) {
  switch (error.code) {
    case 'E_BAD_REQUEST':
      // Show validation errors
      showError(
        error.message,
        'Validation Error',
        error.errors
      );
      break;
      
    case 'E_UNAUTHORIZED':
      // Redirect to login (handled automatically by API client)
      break;
      
    case 'E_NOT_FOUND':
      showError('Resource not found', 'Not Found');
      break;
      
    case 'E_CONFLICT':
      showError('A conflict occurred. Please check your data.', 'Conflict');
      break;
      
    default:
      showError(error.message || 'An unexpected error occurred', 'Error');
  }
}
```

## Common Error Codes

| Code | Description | Typical Usage |
|------|-------------|---------------|
| `E_BAD_REQUEST` | Validation errors | Form validation failures |
| `E_UNAUTHORIZED` | Authentication failed | Invalid/expired token |
| `E_FORBIDDEN` | Permission denied | Insufficient permissions |
| `E_NOT_FOUND` | Resource not found | Invalid ID or deleted resource |
| `E_CONFLICT` | Data conflict | Duplicate entries, version conflicts |
| `E_INTERNAL_SERVER_ERROR` | Server error | Unexpected server issues |

## Best Practices

### ✅ Do's

1. **Always pass all errors to toast**:
   ```typescript
   showError(error.message, `Error (${error.code})`, error.errors);
   ```

2. **Provide context in error titles**:
   ```typescript
   showError(error.message, 'Failed to Create Product', error.errors);
   ```

3. **Use error codes for specific handling**:
   ```typescript
   if (error.code === 'E_BAD_REQUEST') {
     // Handle validation errors specially
   }
   ```

4. **Fallback to generic messages**:
   ```typescript
   error.message || 'An unexpected error occurred'
   ```

### ❌ Don'ts

1. **Don't ignore error arrays**:
   ```typescript
   // ❌ Bad
   showError(error.message);
   
   // ✅ Good
   showError(error.message, 'Error', error.errors);
   ```

2. **Don't hardcode error messages**:
   ```typescript
   // ❌ Bad
   showError('Product creation failed');
   
   // ✅ Good
   showError(error.message || 'Product creation failed');
   ```

3. **Don't show console errors to users**:
   ```typescript
   // ❌ Bad
   console.error(error);
   
   // ✅ Good
   console.error(error);
   showError(error.message, 'Error', error.errors);
   ```

## Visual Examples

### Single Error
```
┌─────────────────────────────────────┐
│ ⚠ Error (E_BAD_REQUEST)            │
│                                     │
│ image must be a URL address         │
└─────────────────────────────────────┘
```

### Multiple Errors
```
┌─────────────────────────────────────┐
│ ⚠ Error (E_BAD_REQUEST)            │
│                                     │
│ image must be a URL address         │
│                                     │
│ • name is required                  │
│ • price must be positive            │
└─────────────────────────────────────┘
```

## Integration Checklist

When adding error handling to a new component:

- [ ] Import `useToast` hook
- [ ] Wrap API calls in try-catch
- [ ] Pass error.message as first parameter
- [ ] Include error code in title if available
- [ ] Pass error.errors array for validation messages
- [ ] Provide user-friendly fallback messages
- [ ] Test with various error scenarios
- [ ] Verify all validation errors display correctly

## Testing Error Handling

To test error responses in development:

1. **Network errors**: Disconnect internet or use browser DevTools to throttle
2. **Validation errors**: Submit forms with invalid data
3. **Authorization errors**: Use expired/invalid tokens
4. **Not found errors**: Request non-existent resources

Example test scenarios:
```typescript
// Simulate validation error
mockApiCall.mockRejectedValue({
  code: 'E_BAD_REQUEST',
  message: 'image must be a URL address',
  errors: [
    'image must be a URL address',
    'name is required',
    'price must be positive'
  ],
  status: 400
});
```

## Support

For questions about error handling:
- Check API documentation for available error codes
- Review existing components for patterns
- Refer to `src/lib/api-client.ts` for error processing logic
- See `src/context/ToastContext.tsx` for toast functionality

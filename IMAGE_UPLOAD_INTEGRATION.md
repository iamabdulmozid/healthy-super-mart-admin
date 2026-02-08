# Image Upload Integration for Product Form

This document explains the image upload functionality integrated into the ProductForm component.

## Overview

The ProductForm now supports uploading product images directly through a file picker, which automatically uploads the image to the `/uploads/products` API endpoint and sets the returned `publicUrl` to the product's image field.

## Features

### 1. File Upload Interface
- **Upload Button**: Click to select an image file from the device
- **Drag & Drop Support**: (Can be added in future enhancement)
- **Image Preview**: Shows selected image before and after upload
- **Remove Button**: Allows removing the selected image
- **Manual URL Input**: Fallback option to enter image URL manually

### 2. File Validation
- **File Type**: Only image files (JPG, PNG, GIF) are accepted
- **File Size**: Maximum 5MB file size limit
- **Error Handling**: Clear error messages for invalid files

### 3. Upload Process
1. User selects an image file
2. File is validated (type and size)
3. Preview is immediately shown using `URL.createObjectURL()`
4. File is uploaded to `/uploads/products` API endpoint
5. Response contains `publicUrl` which is set to the product's image field
6. Preview is updated to use the public URL
7. Object URL is cleaned up to prevent memory leaks

## API Integration

### Upload Endpoint
```
POST /uploads/products
Content-Type: multipart/form-data

Body:
- file: [Image File]
```

### Response Format
```json
{
  "key": "products/e3b1a02c-2928-4659-ab40-92277dd1ad88-rice.jpg",
  "publicUrl": "https://cdn.healthysupermart.com/products/e3b1a02c-2928-4659-ab40-92277dd1ad88-rice.jpg"
}
```

## Implementation Details

### New Files Created
- `src/services/uploadService.ts`: Service for handling file uploads

### Modified Files
- `src/modules/admin/components/ProductForm.tsx`: Enhanced with image upload functionality

### New Dependencies Used
- `@heroicons/react/24/outline`: PhotoIcon, TrashIcon for UI
- `useRef` hook: For file input reference
- FormData API: For multipart form upload

### State Management
- `imageUploading`: Boolean state for upload progress
- `previewImage`: Current preview image URL
- `previewObjectUrl`: Ref to track object URLs for cleanup

### Memory Management
- Object URLs are properly cleaned up using `URL.revokeObjectURL()`
- Cleanup happens on component unmount, image removal, and upload completion
- Prevents memory leaks from blob URLs

## User Experience

### Upload Flow
1. Click "Upload Image" button
2. Select image from file picker
3. See immediate preview
4. Upload progress shown with spinner
5. Success: Preview updates to final image
6. Error: Clear error message with reset option

### Visual Elements
- **Image Preview**: 128x128px rounded preview with border
- **Remove Button**: Red circular button with trash icon
- **Upload Button**: Blue button with photo icon
- **Loading State**: Spinner animation during upload
- **Error Messages**: Red background error alerts

## Error Handling

### Client-side Validation
- File type validation (image/* only)
- File size validation (5MB limit)
- Clear error messages for user

### Server-side Errors
- Network errors handled gracefully
- Server response errors displayed to user
- Form state reset on errors

## Future Enhancements

1. **Drag & Drop**: Add drag and drop support for easier file selection
2. **Multiple Images**: Support for multiple product images
3. **Image Cropping**: Built-in image cropping tool
4. **Progress Bar**: Show detailed upload progress
5. **Image Optimization**: Client-side image compression before upload
6. **Bulk Upload**: Upload multiple images at once

## Testing

To test the image upload functionality:

1. Navigate to Products page
2. Click "Create New Product" or edit existing product
3. In the "Inventory & Shipping" section, find "Product Image"
4. Click "Upload Image" button
5. Select an image file
6. Verify preview appears immediately
7. Wait for upload to complete
8. Verify image URL is set in the form
9. Submit the form to save the product

## Security Considerations

- File type validation prevents non-image uploads
- File size limits prevent large uploads
- Server-side validation should be maintained
- Consider adding image scanning for malicious content
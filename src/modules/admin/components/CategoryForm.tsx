// src/modules/admin/components/CategoryForm.tsx
import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../services/categoryService';
import { uploadService } from '@/services/uploadService';
import type { Category, CreateCategoryRequest } from '@/types/category';

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CategoryForm({ category, onClose, onSubmit }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentCategoryId: null,
    status: 'active',
    sortOrder: 1,
    isFeatured: false,
    metadata: {
      seoKeywords: []
    }
  });

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        parentCategoryId: category.parentCategoryId,
        status: category.status,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        metadata: {
          seoKeywords: category.metadata?.seoKeywords || []
        }
      });

      // Set preview image if category has an image
      if (category.imageUrl) {
        setPreviewImage(category.imageUrl);
      }
    }

    // Load parent categories
    loadParentCategories();
  }, [category]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }
    };
  }, []);

  const loadParentCategories = async () => {
    try {
      const response = await categoryService.getParentCategories();
      setParentCategories(response);
    } catch (err) {
      console.error('Failed to load parent categories:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'parentCategoryId') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? null : parseInt(value) 
      }));
    } else if (name === 'sortOrder') {
      setFormData(prev => ({
        ...prev,
        sortOrder: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from name
    if (name === 'name' && !isEditing) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, seoKeywords: keywords }
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB');
      return;
    }

    setImageUploading(true);
    setError(null);

    try {
      // Clean up previous object URL
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      previewObjectUrl.current = previewUrl;
      setPreviewImage(previewUrl);

      // Upload image
      const uploadResponse = await uploadService.uploadCategoryImage(file);
      
      // Sanitize the URL (encode spaces and special characters)
      const sanitizedUrl = encodeURI(uploadResponse.publicUrl.trim());
      
      // Update form data with the sanitized public URL
      setFormData(prev => ({ ...prev, imageUrl: sanitizedUrl }));
      
      // Update preview to use the sanitized public URL
      setPreviewImage(sanitizedUrl);
      
      // Clean up the object URL since we now have the public URL
      URL.revokeObjectURL(previewUrl);
      previewObjectUrl.current = null;
    } catch (error: any) {
      setError(error.message || 'Failed to upload image');
      setPreviewImage(null);
      // Clean up object URL on error
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
        previewObjectUrl.current = null;
      }
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewImage(null);
    // Clean up object URL
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure image URL is properly encoded (no spaces)
      const sanitizedImageUrl = formData.imageUrl ? encodeURI(formData.imageUrl.trim()) : '';
      
      const submitData = {
        ...formData,
        imageUrl: sanitizedImageUrl
      };

      if (isEditing && category) {
        await categoryService.updateCategory(category.id, submitData);
      } else {
        await categoryService.createCategory(submitData);
      }
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label htmlFor="parentCategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="parentCategoryId"
                  name="parentCategoryId"
                  value={formData.parentCategoryId || ''}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">None (Root Category)</option>
                  {parentCategories
                    .filter(cat => !category || cat.id !== category.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  min="1"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-200 rounded"
                />
                <label htmlFor="isFeatured" className="ml-3 text-sm font-medium text-gray-700">
                  Featured Category
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Additional Information</h4>
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                  placeholder="Enter category description..."
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image preview and upload area */}
                <div className="space-y-4">
                  {previewImage ? (
                    <div className="relative inline-block">
                      <img
                        src={previewImage}
                        alt="Category preview"
                        className="w-32 h-32 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-sm transition-colors"
                        title="Remove image"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={imageUploading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
                    >
                      {imageUploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <PhotoIcon className="h-4 w-4" />
                          <span>{previewImage ? 'Change Image' : 'Upload Image'}</span>
                        </>
                      )}
                    </button>

                    {previewImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Upload a category image (JPG, PNG, GIF). Maximum file size: 5MB
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  value={formData.metadata?.seoKeywords?.join(', ') || ''}
                  onChange={handleKeywordsChange}
                  className="block w-full px-4 py-3 border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-neutral-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
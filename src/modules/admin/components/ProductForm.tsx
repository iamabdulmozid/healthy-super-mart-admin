// src/modules/admin/components/ProductForm.tsx
import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ArrowPathIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { productTagService } from '../services/productTagService';
import { shopService } from '../services/shopService';
import { uploadService } from '@/services/uploadService';
import { BarcodeService } from '@/lib/barcode-service';
import { getCurrencySymbol } from '@/utils/currency';
import { useToast } from '@/context/ToastContext';
import type { Product, CreateProductRequest, ProductTag } from '@/types/product';
import type { Category } from '@/types/category';
import type { Shop } from '@/types/shop';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ProductForm({ product, onClose, onSubmit }: ProductFormProps) {
  const currencySymbol = getCurrencySymbol();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);
  const loadingCategoriesRef = useRef(false);
  const loadingSubcategoriesRef = useRef<number | null>(null);
  const [unitPriceExcludingVAT, setUnitPriceExcludingVAT] = useState<number>(0);
  const [vatPercentage, setVatPercentage] = useState<number>(8);
  const [weightInput, setWeightInput] = useState<string>('');
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    slug: '',
    description: '',
    categoryId: 0,
    subcategoryId: 0,
    shopId: 1, // Default shop ID from the API example
    purchasePrice: 0,
    retailPrice: 0,
    posPrice: 0,
    wholesalePrice: 0,
    oldPrice: 0,
    weight: 0,
    stockQuantity: 0,
    image: '',
    shippingType: 'dry',
    status: 'active',
    isFeatured: false,
    barcode: '',
    supplier: '',
    minOrderQuantity: 1,
    maxOrderQuantity: undefined,
    metadata: null
  });

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        shopId: product.shopId,
        purchasePrice: product.purchasePrice ? (typeof product.purchasePrice === 'string' ? parseFloat(product.purchasePrice) : product.purchasePrice) : 0,
        retailPrice: typeof product.retailPrice === 'string' ? parseFloat(product.retailPrice) : product.retailPrice,
        posPrice: typeof product.posPrice === 'string' ? parseFloat(product.posPrice) : product.posPrice,
        wholesalePrice: typeof product.wholesalePrice === 'string' ? parseFloat(product.wholesalePrice) : product.wholesalePrice,
        oldPrice: product.oldPrice ? (typeof product.oldPrice === 'string' ? parseFloat(product.oldPrice) : product.oldPrice) : 0,
        weight: product.weight ? (typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight) : 0,
        stockQuantity: product.stockQuantity,
        image: product.image || '',
        shippingType: product.shippingType,
        status: product.status,
        isFeatured: product.isFeatured,
        barcode: product.barcode || '',
        supplier: product.supplier || '',
        minOrderQuantity: product.minOrderQuantity,
        maxOrderQuantity: product.maxOrderQuantity,
        metadata: product.metadata
      });
      
      // Initialize selected tags from product data
      if (product.tags && product.tags.length > 0) {
        setSelectedTagIds(product.tags.map(tag => tag.id));
      }
      
      // Initialize VAT calculation fields when editing
      const purchasePrice = product.purchasePrice ? (typeof product.purchasePrice === 'string' ? parseFloat(product.purchasePrice) : product.purchasePrice) : 0;
      if (purchasePrice > 0) {
        // Assume default 8% VAT and calculate backwards
        const unitPriceExVAT = purchasePrice / 1.08;
        setUnitPriceExcludingVAT(unitPriceExVAT);
        setVatPercentage(8);
      }
      
      // Initialize weight input string
      const weight = product.weight ? (typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight) : 0;
      setWeightInput(weight > 0 ? weight.toString() : '');
      
      // Subcategories will be loaded by the useEffect watching formData.categoryId

      // Set preview image if product has an image
      if (product.image) {
        setPreviewImage(product.image);
      }
    }
  }, [product]);

  useEffect(() => {
    loadCategories();
    loadTags();
    loadShops();
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }
    };
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      loadSubcategories(formData.categoryId);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: 0 }));
    }
  }, [formData.categoryId]);
//includeChildren=false&sortBy=name&sortOrder=ASC
  const loadCategories = async () => {
    if (loadingCategoriesRef.current) return;
    
    try {
      loadingCategoriesRef.current = true;
      const categories = await categoryService.getParentCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      loadingCategoriesRef.current = false;
    }
  };

  const loadSubcategories = async (parentCategoryId: number) => {
    if (loadingSubcategoriesRef.current === parentCategoryId) return;
    
    try {
      loadingSubcategoriesRef.current = parentCategoryId;
      const subcategories = await categoryService.getCategoryChildren(parentCategoryId);
      setSubcategories(subcategories);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    } finally {
      loadingSubcategoriesRef.current = null;
    }
  };

  const loadTags = async () => {
    try {
      const response = await productTagService.getActiveTags();
      setTags(response.tags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      setTags([]);
    }
  };

  const loadShops = async () => {
    try {
      const shopsList = await shopService.getAllShops();
      setShops(shopsList);
      
      // For new product creation, select all active shops by default
      if (!product) {
        const activeShopIds = shopsList
          .filter(shop => shop.status === 'active')
          .map(shop => shop.id);
        setSelectedShopIds(activeShopIds);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
      setShops([]);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Calculate purchase price including VAT
  const calculatePurchasePriceWithVAT = (unitPrice: number, vat: number) => {
    return unitPrice * (1 + vat / 100);
  };

  // Handle unit price change (excluding VAT)
  const handleUnitPriceChange = (unitPrice: number) => {
    setUnitPriceExcludingVAT(unitPrice);
    const purchasePriceWithVAT = calculatePurchasePriceWithVAT(unitPrice, vatPercentage);
    setFormData(prev => ({ ...prev, purchasePrice: purchasePriceWithVAT }));
  };

  // Handle VAT percentage change
  const handleVATPercentageChange = (vat: number) => {
    setVatPercentage(vat);
    const purchasePriceWithVAT = calculatePurchasePriceWithVAT(unitPriceExcludingVAT, vat);
    setFormData(prev => ({ ...prev, purchasePrice: purchasePriceWithVAT }));
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !isEditing ? generateSlug(name) : prev.slug
    }));
  };

  const generateBarcode = () => {
    try {
      const newBarcode = BarcodeService.generateBarcodeNumber(product?.id);
      setFormData(prev => ({ ...prev, barcode: newBarcode }));
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
  };

  const handleShopToggle = (shopId: number) => {
    setSelectedShopIds(prev => {
      if (prev.includes(shopId)) {
        return prev.filter(id => id !== shopId);
      } else {
        return [...prev, shopId];
      }
    });
  };

  const handleRemoveShop = (shopId: number) => {
    setSelectedShopIds(prev => prev.filter(id => id !== shopId));
  };

  const handleSelectAllShops = () => {
    const allActiveShopIds = shops
      .filter(shop => shop.status === 'active')
      .map(shop => shop.id);
    setSelectedShopIds(allActiveShopIds);
  };

  const handleDeselectAllShops = () => {
    setSelectedShopIds([]);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file', 'Invalid File');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image file size should be less than 5MB', 'File Too Large');
      return;
    }

    setImageUploading(true);

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
      const uploadResponse = await uploadService.uploadProductImage(file);
      
      // Sanitize the URL (encode spaces and special characters)
      const sanitizedUrl = encodeURI(uploadResponse.publicUrl.trim());
      
      // Update form data with the sanitized public URL
      setFormData(prev => ({ ...prev, image: sanitizedUrl }));
      
      // Update preview to use the sanitized public URL
      setPreviewImage(sanitizedUrl);
      
      // Clean up the object URL since we now have the public URL
      URL.revokeObjectURL(previewUrl);
      previewObjectUrl.current = null;
    } catch (error: any) {
      showError(error.message || 'Failed to upload image', 'Upload Error');
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
    setFormData(prev => ({ ...prev, image: '' }));
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

    try {
      // Validate shop selection for new products
      if (!isEditing && selectedShopIds.length === 0) {
        showError('Please select at least one shop for the product', 'Validation Error');
        setLoading(false);
        return;
      }

      // Ensure image URL is properly encoded (no spaces)
      const sanitizedImageUrl = formData.image ? encodeURI(formData.image.trim()) : '';
      
      // Create submit data with proper type handling
      const submitData: CreateProductRequest = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        // For editing, use shopId; for creating, use shopIds
        ...(isEditing ? { shopId: formData.shopId } : { shopIds: selectedShopIds }),
        // Round purchase price to 2 decimal places for backend validation
        purchasePrice: formData.purchasePrice ? Math.round(formData.purchasePrice * 100) / 100 : 0,
        retailPrice: Math.round(formData.retailPrice * 100) / 100,
        posPrice: Math.round(formData.posPrice * 100) / 100,
        wholesalePrice: Math.round(formData.wholesalePrice * 100) / 100,
        oldPrice: formData.oldPrice ? Math.round(formData.oldPrice * 100) / 100 : undefined,
        weight: formData.weight || 0,
        stockQuantity: formData.stockQuantity,
        image: sanitizedImageUrl,
        shippingType: formData.shippingType,
        status: formData.status,
        isFeatured: formData.isFeatured,
        sku: formData.sku,
        barcode: formData.barcode,
        supplier: formData.supplier,
        minOrderQuantity: formData.minOrderQuantity || 1,
        maxOrderQuantity: formData.maxOrderQuantity || undefined,
        metadata: formData.metadata,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
      };

      if (isEditing && product) {
        await productService.updateProduct(product.id, submitData);
        showSuccess('Product updated successfully', 'Success');
      } else {
        // Use multi-shop endpoint for new products
        await productService.createMultiShopProduct(submitData);
        showSuccess('Product created successfully', 'Success');
      }
      
      onSubmit();
    } catch (error: any) {
      // Show toast notification with all validation errors
      const hasValidationErrors = error.errors && error.errors.length > 0;
      const toastMessage = hasValidationErrors
        ? 'Please fix the following issues:'
        : (error.message || 'Failed to save product');
      
      showError(
        toastMessage,
        `${isEditing ? 'Update' : 'Create'} Error${error.code ? ` (${error.code})` : ''}`,
        hasValidationErrors ? error.errors : undefined
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "block w-full px-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create New Product'}
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={inputClassName}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={inputClassName}
                  placeholder="product-slug"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full px-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                  className={inputClassName}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.subcategoryId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: parseInt(e.target.value) || 0 }))}
                  className={inputClassName}
                  disabled={!formData.categoryId}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shop Selection - Only for new products */}
              {!isEditing && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Shops *
                  </label>
                  
                  {/* Selected Shops Display */}
                  {selectedShopIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedShopIds.map(shopId => {
                        const shop = shops.find(s => s.id === shopId);
                        if (!shop) return null;
                        return (
                          <span
                            key={shopId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                          >
                            {shop.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveShop(shopId)}
                              className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                              title={`Remove ${shop.name}`}
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Shop Selection Buttons */}
                  <div className="border border-neutral-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs text-gray-600">
                        Select shops where this product will be available
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllShops}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Select All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllShops}
                          className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shops.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No shops available</p>
                      ) : (
                        shops.map(shop => {
                          const isSelected = selectedShopIds.includes(shop.id);
                          const isActive = shop.status === 'active';
                          return (
                            <button
                              key={shop.id}
                              type="button"
                              onClick={() => handleShopToggle(shop.id)}
                              disabled={!isActive}
                              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                                isSelected
                                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                  : isActive
                                  ? 'bg-white text-gray-700 border-neutral-200 hover:bg-gray-100'
                                  : 'bg-gray-100 text-gray-400 border-neutral-200 cursor-not-allowed'
                              }`}
                            >
                              {shop.name}
                              {!isActive && ' (Inactive)'}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      className={inputClassName}
                      placeholder="Enter barcode or generate one"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-neutral-200 flex items-center space-x-2 transition-colors"
                    title="Generate Barcode"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span className="text-sm">Generate</span>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Barcode will be used for POS scanning. Click generate to create a unique barcode.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className={inputClassName}
                  placeholder="Enter supplier name"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Name of the supplier or vendor for this product.
                </p>
              </div>

              {/* Product Tags Section */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Tags
                </label>
                
                {/* Selected Tags Display */}
                {selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTagIds.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tagId)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            title={`Remove ${tag.name}`}
                          >
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Available Tags Selection */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-3">
                    Select tags to categorize this product (multiple selections allowed)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No tags available</p>
                    ) : (
                      tags.map(tag => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                : 'bg-white text-gray-700 border-neutral-200 hover:bg-gray-100'
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Pricing</h4>
            
            {/* Purchase Price Calculator Section */}
            <div className="border border-blue-200 rounded-lg p-4 mb-6">
              <h5 className="text-sm font-medium text-blue-900 mb-3">Purchase Price Calculator (with VAT)</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (Excluding VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitPriceExcludingVAT || ''}
                      onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                      className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter the price you paid (without VAT)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Percentage
                  </label>
                  <select
                    value={vatPercentage}
                    onChange={(e) => handleVATPercentageChange(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value={8}>8%</option>
                    <option value={10}>10%</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select applicable VAT rate</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price (Including VAT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                    <input
                      type="number"
                      value={formData.purchasePrice?.toFixed(2) || '0.00'}
                      readOnly
                      className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm bg-gray-50 text-gray-700"
                    />
                  </div>
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    Auto-calculated: {currencySymbol}{unitPriceExcludingVAT.toFixed(2)} + {vatPercentage}% VAT
                  </p>
                </div>
              </div>
            </div>

            {/* Other Pricing Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.posPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, posPrice: parseFloat(e.target.value) || 0 }))}
                    className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Price for POS/Shop sales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.retailPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, retailPrice: parseFloat(e.target.value) || 0 }))}
                    className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Price for online sales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wholesale Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.wholesalePrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) || 0 }))}
                    className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Price for bulk orders</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 text-base">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.oldPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldPrice: parseFloat(e.target.value) || 0 }))}
                    className="block w-full pl-10 pr-4 py-3 text-base border border-neutral-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Previous price (for discount display)</p>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Inventory & Shipping</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  className={inputClassName}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty, numbers, and decimal points
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setWeightInput(value);
                      // Update formData with parsed number
                      const numValue = value === '' ? 0 : parseFloat(value);
                      if (!isNaN(numValue) || value === '') {
                        setFormData(prev => ({ ...prev, weight: value === '' ? 0 : numValue }));
                      }
                    }
                  }}
                  onBlur={() => {
                    // Format the value when user leaves the field
                    if (weightInput && !isNaN(parseFloat(weightInput))) {
                      const num = parseFloat(weightInput);
                      setWeightInput(num.toString());
                      setFormData(prev => ({ ...prev, weight: num }));
                    } else if (weightInput === '') {
                      setWeightInput('');
                      setFormData(prev => ({ ...prev, weight: 0 }));
                    }
                  }}
                  className={inputClassName}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Order Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minOrderQuantity || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      minOrderQuantity: value === '' ? undefined : parseInt(value) || 1 
                    }));
                  }}
                  className={inputClassName}
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Order Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxOrderQuantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxOrderQuantity: parseInt(e.target.value) || undefined }))}
                  className={inputClassName}
                  placeholder="No limit"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
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
                        alt="Product preview"
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
                    Upload a product image (JPG, PNG, GIF). Maximum file size: 5MB
                  </p>

                  {/* Manual URL input as fallback */}
                  {/* <div className="border-t border-gray-200 pt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Or enter image URL manually
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image: e.target.value }));
                        setPreviewImage(e.target.value || null);
                      }}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div> */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Type
                </label>
                <select
                  value={formData.shippingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingType: e.target.value as 'dry' | 'chilled' }))}
                  className={inputClassName}
                >
                  <option value="dry">Dry</option>
                  <option value="chilled">Chilled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className={inputClassName}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-200 rounded"
                />
                <label htmlFor="isFeatured" className="ml-3 block text-sm font-medium text-gray-700">
                  Mark as Featured Product
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">Featured products will be highlighted in the storefront.</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
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
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                isEditing ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

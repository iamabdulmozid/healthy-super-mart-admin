// src/modules/pos/components/BarcodeSearch.tsx
import { useState, useEffect, useRef } from 'react';
import { productService } from '@/modules/admin/services/productService';
import { useCart } from '@/context/CartContext';
import type { ProductAutocompleteItem } from '@/types/product';

export default function BarcodeSearch() {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ProductAutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { addItem } = useCart();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch autocomplete suggestions with debounce
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await productService.searchAutocomplete(query);
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    setError(null);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  };

  const handleProductSelect = async (item: ProductAutocompleteItem) => {
    setShowSuggestions(false);
    setSearchValue('');
    setSuggestions([]);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch full product details by barcode
      const product = await productService.getProductByBarcode(item.barcode, true);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product is active and has stock
      if (product.status !== 'active') {
        throw new Error('Product is not available for sale');
      }

      if (product.stockQuantity <= 0) {
        throw new Error('Product is out of stock');
      }

      // Add product to cart
      addItem(product);
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a barcode');
      return;
    }

    // Cancel any pending debounced autocomplete request
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      // Search product by barcode with shop inventory
      const barcode = searchValue.trim();
      const product = await productService.getProductByBarcode(barcode, true);
      
      if (!product) {
        throw new Error('Product not found. Please check the barcode.');
      }

      // Check if product is active and has stock
      if (product.status !== 'active') {
        throw new Error('Product is not available for sale');
      }

      if (product.stockQuantity <= 0) {
        throw new Error('Product is out of stock');
      }

      // Add product to cart
      addItem(product);
      setSearchValue(''); // Clear search after successful add
      setError(null);

    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Product not found. Please check the barcode.');
      } else {
        setError(err.message || 'Failed to find product');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Close suggestions and perform barcode search
      setShowSuggestions(false);
      setSuggestions([]);
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scan barcode or search product name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleProductSelect(item)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  type="button"
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.barcode}</div>
                </button>
              ))}
            </div>
          )}

          {/* Loading indicator for suggestions */}
          {isLoadingSuggestions && searchValue.length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg px-4 py-2">
              <div className="text-gray-500 text-sm">Loading...</div>
            </div>
          )}
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading || !searchValue.trim()}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
// src/modules/admin/components/LowQuantityAlert.tsx
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/product';

interface LowQuantityAlertProps {
  products: Product[];
  onFilterLowQuantity: () => void;
  totalLowQuantityCount?: number; // For when we need to show total count across all pages
}

export default function LowQuantityAlert({ 
  products, 
  onFilterLowQuantity, 
  totalLowQuantityCount 
}: LowQuantityAlertProps) {
  // Use provided total count, or count from current products
  const lowQuantityCount = totalLowQuantityCount ?? products.filter(product => product.stockQuantity < 10).length;
  
  if (lowQuantityCount === 0) {
    return null;
  }

  return (
    <div 
      onClick={onFilterLowQuantity}
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-yellow-100 transition-colors duration-200"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Low Stock Alert
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            <span className="font-semibold">{lowQuantityCount}</span> 
            {lowQuantityCount === 1 ? ' product has' : ' products have'} low quantity (less than 10 units).
            <span className="ml-1 underline">Click here to view them.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
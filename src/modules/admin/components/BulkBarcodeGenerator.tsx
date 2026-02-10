// src/modules/admin/components/BulkBarcodeGenerator.tsx
import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PrinterIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { BarcodeService, type PrintableBarcodeData } from '@/lib/barcode-service';
import type { Product } from '@/types/product';
import { useReactToPrint } from 'react-to-print';

interface BulkBarcodeGeneratorProps {
  products: Product[];
  onClose: () => void;
  isOpen: boolean;
}

interface BarcodeLayout {
  name: string;
  columns: number;
  rows: number;
  labelWidth: string;
  labelHeight: string;
  fontSize: string;
  barcodeHeight: number;
}

const LAYOUT_PRESETS: BarcodeLayout[] = [
  {
    name: 'Standard Labels (3x8)',
    columns: 3,
    rows: 8,
    labelWidth: '2.625in',
    labelHeight: '1in',
    fontSize: '8px',
    barcodeHeight: 30,
  },
  {
    name: 'Address Labels (2x10)',
    columns: 2,
    rows: 10,
    labelWidth: '4in',
    labelHeight: '0.8in',
    fontSize: '9px',
    barcodeHeight: 32,
  },
  {
    name: 'Small Labels (4x10)',
    columns: 4,
    rows: 10,
    labelWidth: '2in',
    labelHeight: '0.75in',
    fontSize: '7px',
    barcodeHeight: 28,
  },
  {
    name: 'Custom Single Column',
    columns: 1,
    rows: 10,
    labelWidth: '6in',
    labelHeight: '1.2in',
    fontSize: '10px',
    barcodeHeight: 40,
  }
];

export default function BulkBarcodeGenerator({ 
  products, 
  onClose, 
  isOpen 
}: BulkBarcodeGeneratorProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_PRESETS[0]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<Array<{
    product: PrintableBarcodeData;
    barcodeDataURL: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Barcodes-${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: letter;
        margin: 0.5in;
      }
      @media print {
        .no-print { display: none !important; }
        body { -webkit-print-color-adjust: exact; }
      }
    `
  });

  useEffect(() => {
    if (isOpen && products.length > 0) {
      // Select all products by default
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  }, [isOpen, products]);

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const generateBarcodes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const selectedProductData = products
        .filter(p => selectedProducts.has(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode || BarcodeService.generateBarcodeNumber(p.id),
          price: BarcodeService.formatPrice(p.retailPrice),
          sku: p.sku,
        }));

      const results = await BarcodeService.generateBulkBarcodes(
        selectedProductData,
        BarcodeService.getPrintOptions({
          height: selectedLayout.barcodeHeight,
        })
      );

      setGeneratedBarcodes(results);
    } catch (err) {
      console.error('Error generating bulk barcodes:', err);
      setError('Failed to generate barcodes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Barcode Generator
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - Controls */}
          <div className="w-80 border-r border-neutral-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Layout Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Label Layout
                </label>
                <select
                  value={LAYOUT_PRESETS.findIndex(l => l.name === selectedLayout.name)}
                  onChange={(e) => setSelectedLayout(LAYOUT_PRESETS[parseInt(e.target.value)])}
                  className="block w-full px-3 py-2 border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {LAYOUT_PRESETS.map((layout, index) => (
                    <option key={index} value={index}>
                      {layout.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedLayout.columns} columns × {selectedLayout.rows} rows
                </p>
              </div>

              {/* Product Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Products ({selectedProducts.size} selected)
                  </label>
                  <button
                    onClick={toggleAllProducts}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-md">
                  {products.map(product => (
                    <label
                      key={product.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-200 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {BarcodeService.formatPrice(product.retailPrice)}
                          {product.barcode && (
                            <span className="ml-2 font-mono text-xs">
                              {product.barcode}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={generateBarcodes}
                  disabled={selectedProducts.size === 0 || loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Barcodes'}
                </button>

                {generatedBarcodes.length > 0 && (
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <PrinterIcon className="h-4 w-4" />
                    <span>Print Labels</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Preview */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            <div 
              ref={printRef}
              className="bg-white shadow-lg rounded-lg p-8 mx-auto"
              style={{ 
                width: '8.5in', 
                minHeight: '11in',
              }}
            >
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${selectedLayout.columns}, 1fr)`,
                }}
              >
                {generatedBarcodes.map(({ product, barcodeDataURL }, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="border border-neutral-200 flex flex-col items-center justify-center text-center p-2 bg-white"
                    style={{
                      width: selectedLayout.labelWidth,
                      height: selectedLayout.labelHeight,
                      fontSize: selectedLayout.fontSize,
                      lineHeight: '1.2',
                    }}
                  >
                    <div className="font-semibold mb-1 truncate w-full text-xs">
                      {product.name}
                    </div>
                    <img
                      src={barcodeDataURL}
                      alt={`Barcode for ${product.name}`}
                      className="max-w-full"
                      style={{ maxHeight: selectedLayout.barcodeHeight }}
                    />
                    <div className="text-xs font-medium mt-1">
                      {product.price}
                    </div>
                  </div>
                ))}

                {/* Fill remaining slots with empty labels if needed */}
                {(() => {
                  const totalSlots = selectedLayout.columns * selectedLayout.rows;
                  const emptySlots = totalSlots - (generatedBarcodes.length % totalSlots);
                  return emptySlots < totalSlots ? Array.from({ length: emptySlots }, (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="border border-neutral-200 bg-gray-50"
                      style={{
                        width: selectedLayout.labelWidth,
                        height: selectedLayout.labelHeight,
                      }}
                    />
                  )) : null;
                })()}
              </div>
            </div>

            {generatedBarcodes.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-12">
                <QrCodeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select products and click "Generate Barcodes" to see preview</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Generating barcodes...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
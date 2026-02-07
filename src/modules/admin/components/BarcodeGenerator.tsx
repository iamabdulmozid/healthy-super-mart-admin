// src/modules/admin/components/BarcodeGenerator.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowDownTrayIcon, PrinterIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { BarcodeService, type BarcodeOptions } from '@/lib/barcode-service';
import type { Product } from '@/types/product';

interface BarcodeGeneratorProps {
  product: Product;
  options?: BarcodeOptions;
  showControls?: boolean;
  onBarcodeUpdate?: (barcode: string) => void;
  className?: string;
}

export default function BarcodeGenerator({
  product,
  options = {},
  showControls = true,
  onBarcodeUpdate,
  className = ''
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcode, setBarcode] = useState(product.barcode || '');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (barcode && canvasRef.current) {
      generateBarcodeOnCanvas();
    }
  }, [barcode, options]);

  useEffect(() => {
    setBarcode(product.barcode || '');
  }, [product.barcode]);

  const generateBarcodeOnCanvas = () => {
    if (!canvasRef.current || !barcode) return;

    try {
      setError(null);
      BarcodeService.generateBarcodeOnCanvas(canvasRef.current, barcode, {
        ...options,
        width: options.width || 2,
        height: options.height || 50,
        displayValue: options.displayValue !== false,
      });
    } catch (err) {
      console.error('Error generating barcode:', err);
      setError('Failed to generate barcode');
    }
  };

  const handleGenerateNewBarcode = async () => {
    setIsGenerating(true);
    try {
      const newBarcode = BarcodeService.generateBarcodeNumber(product.id);
      setBarcode(newBarcode);
      if (onBarcodeUpdate) {
        onBarcodeUpdate(newBarcode);
      }
    } catch (err) {
      console.error('Error generating new barcode:', err);
      setError('Failed to generate new barcode');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBarcode = async () => {
    if (!barcode) return;
    
    try {
      await BarcodeService.downloadBarcodeImage(
        barcode,
        `barcode-${product.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        options
      );
    } catch (err) {
      console.error('Error downloading barcode:', err);
      setError('Failed to download barcode');
    }
  };

  const handlePrintBarcode = () => {
    if (!canvasRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${product.name}</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            text-align: center;
            font-family: Arial, sans-serif;
          }
          .barcode-container {
            display: inline-block;
            border: 1px solid #ccc;
            padding: 15px;
            margin: 10px;
            background: white;
          }
          .product-info {
            margin-bottom: 10px;
            font-size: 12px;
            color: #333;
          }
          .product-name {
            font-weight: bold;
            font-size: 14px;
          }
          .price {
            font-size: 12px;
            color: #666;
          }
          img { max-width: 100%; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="barcode-container">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="price">${BarcodeService.formatPrice(product.retailPrice)}</div>
          </div>
          <img src="${dataURL}" alt="Barcode for ${product.name}" />
        </div>
        <script>window.print(); window.onafterprint = function() { window.close(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!barcode && showControls) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-gray-500 mb-3">No barcode generated for this product</p>
        <button
          onClick={handleGenerateNewBarcode}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate Barcode'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="text-center bg-white p-4 rounded-lg border">
        <canvas
          ref={canvasRef}
          className="mx-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {barcode && (
          <div className="mt-2 text-xs text-gray-500 font-mono">
            {barcode}
          </div>
        )}
      </div>

      {showControls && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleGenerateNewBarcode}
            disabled={isGenerating}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Regenerate</span>
          </button>
          
          <button
            onClick={handleDownloadBarcode}
            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium flex items-center space-x-1"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Download</span>
          </button>
          
          <button
            onClick={handlePrintBarcode}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium flex items-center space-x-1"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
}
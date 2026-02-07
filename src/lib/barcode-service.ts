// src/lib/barcode-service.ts
import JsBarcode from 'jsbarcode';
import { formatCurrency } from '@/utils/currency';

export interface BarcodeOptions {
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top';
  textMargin?: number;
  fontOptions?: string;
  font?: string;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export interface PrintableBarcodeData {
  id: number;
  name: string;
  barcode: string;
  price: string;
  sku?: string;
}

export class BarcodeService {
  private static readonly DEFAULT_OPTIONS: BarcodeOptions = {
    format: 'CODE128',
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 12,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontOptions: '',
    font: 'monospace',
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10,
  };

  private static readonly PRINT_OPTIONS: BarcodeOptions = {
    format: 'CODE128',
    width: 1.5,
    height: 40,
    displayValue: true,
    fontSize: 10,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontOptions: '',
    font: 'Arial, sans-serif',
    background: '#ffffff',
    lineColor: '#000000',
    margin: 5,
  };

  /**
   * Generate a unique barcode based on timestamp and random number
   * Format: 10 + 5-digit timestamp + 5-digit random = 12 digits total
   * This provides 100x better collision resistance than the previous 3-digit random suffix
   * 
   * @param _productId - Product ID (reserved for future use, currently not used in generation)
   * @returns A 12-digit barcode string
   */
  static generateBarcodeNumber(_productId?: number): string {
    // Use prefix '10' for internal/custom products (non-universal barcodes)
    // Prefix '10' ensures no conflict with standard EAN/UPC ranges
    const prefix = '10';
    
    // Get last 5 digits of timestamp for better distribution
    const timestamp = Date.now().toString().slice(-5);
    
    // Generate 5-digit random number (0-99999) for 100x better collision resistance
    // This reduces collision probability from 0.1% to 0.001%
    const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    // Create a 12-digit barcode: 10 + 5-digit-timestamp + 5-digit-random
    const barcode = `${prefix}${timestamp}${randomSuffix}`;
    return barcode;
  }

  /**
   * Generate EAN-13 barcode with check digit
   */
  static generateEAN13(productId?: number): string {
    const base = this.generateBarcodeNumber(productId);
    const checkDigit = this.calculateEAN13CheckDigit(base);
    return base + checkDigit;
  }

  /**
   * Calculate EAN-13 check digit
   */
  private static calculateEAN13CheckDigit(barcode: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  /**
   * Validate barcode format
   */
  static isValidBarcode(barcode: string, format: string = 'CODE128'): boolean {
    if (!barcode || typeof barcode !== 'string') return false;

    switch (format) {
      case 'CODE128':
        return /^[a-zA-Z0-9\-\.\$\/\+\%\s]+$/.test(barcode) && barcode.length >= 1;
      case 'CODE39':
        return /^[A-Z0-9\-\.\$\/\+\%\s]+$/.test(barcode);
      case 'EAN13':
        return /^\d{13}$/.test(barcode);
      case 'EAN8':
        return /^\d{8}$/.test(barcode);
      case 'UPC':
        return /^\d{12}$/.test(barcode);
      default:
        return true;
    }
  }

  /**
   * Generate barcode as SVG string
   */
  static generateBarcodeSVG(barcode: string, options: BarcodeOptions = {}): string {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (!this.isValidBarcode(barcode, mergedOptions.format)) {
      throw new Error(`Invalid barcode format for ${mergedOptions.format}: ${barcode}`);
    }

    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, barcode, mergedOptions);
      
      // Convert canvas to SVG-like string representation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, barcode, mergedOptions);
      
      return new XMLSerializer().serializeToString(svg);
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw new Error('Failed to generate barcode');
    }
  }

  /**
   * Generate barcode on canvas element
   */
  static generateBarcodeOnCanvas(
    canvas: HTMLCanvasElement, 
    barcode: string, 
    options: BarcodeOptions = {}
  ): void {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (!this.isValidBarcode(barcode, mergedOptions.format)) {
      throw new Error(`Invalid barcode format for ${mergedOptions.format}: ${barcode}`);
    }

    try {
      JsBarcode(canvas, barcode, mergedOptions);
    } catch (error) {
      console.error('Error generating barcode on canvas:', error);
      throw new Error('Failed to generate barcode on canvas');
    }
  }

  /**
   * Generate barcode as data URL (base64 image)
   */
  static async generateBarcodeDataURL(
    barcode: string, 
    options: BarcodeOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, barcode, mergedOptions);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to convert to data URL'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get print-optimized barcode options
   */
  static getPrintOptions(customOptions: Partial<BarcodeOptions> = {}): BarcodeOptions {
    return { ...this.PRINT_OPTIONS, ...customOptions };
  }

  /**
   * Format price for display on barcode labels
   */
  static formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Use centralized currency manager with 2 decimals for barcode labels
    return formatCurrency(numPrice, { showDecimals: true });
  }

  /**
   * Generate multiple barcodes for bulk printing
   */
  static async generateBulkBarcodes(
    products: PrintableBarcodeData[], 
    options: BarcodeOptions = {}
  ): Promise<Array<{
    product: PrintableBarcodeData;
    barcodeDataURL: string;
  }>> {
    const printOptions = this.getPrintOptions(options);
    const results = [];

    for (const product of products) {
      try {
        const barcodeDataURL = await this.generateBarcodeDataURL(product.barcode, printOptions);
        results.push({ product, barcodeDataURL });
      } catch (error) {
        console.error(`Failed to generate barcode for product ${product.id}:`, error);
        // Skip products with invalid barcodes
      }
    }

    return results;
  }

  /**
   * Download barcode as image
   */
  static async downloadBarcodeImage(
    barcode: string, 
    filename: string, 
    options: BarcodeOptions = {}
  ): Promise<void> {
    try {
      const dataURL = await this.generateBarcodeDataURL(barcode, options);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      throw new Error('Failed to download barcode image');
    }
  }
}
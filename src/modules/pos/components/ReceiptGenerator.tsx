// src/modules/pos/components/ReceiptGenerator.tsx
import { useState } from 'react';
import ThermalReceipt from './ThermalReceipt';
import type { Order } from '../services/orderService';
import { ESCPOSService } from '../../../lib/escpos-service';

// Frontend-only interface for cash payment details
interface CashPaymentDetails {
  receivedAmount: number;
  change: number;
}

// Extended order with frontend cash details
interface OrderWithCashDetails extends Order {
  cashDetails?: CashPaymentDetails;
}

interface ReceiptGeneratorProps {
  order?: OrderWithCashDetails;
  onClose?: () => void;
  compact?: boolean; // New prop for compact view
}

export default function ReceiptGenerator({ order, onClose, compact = false }: ReceiptGeneratorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrintReceipt = () => {
    if (!order) return;
    
    // Open print-optimized modal
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    // Custom print function for thermal printer optimization
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const receiptContent = document.getElementById('thermal-receipt-content');
    if (!receiptContent) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 58mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 8pt;
                line-height: 1.2;
                margin: 0;
                padding: 0;
                width: 54mm;
              }
              .thermal-receipt-content {
                width: 54mm !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              line-height: 1.2;
              margin: 0;
              padding: 4mm;
              width: 58mm;
              background: white;
            }
            .text-center { text-align: center; }
            .text-xs { font-size: 8pt; }
            .text-sm { font-size: 9pt; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .mb-1 { margin-bottom: 2px; }
            .mb-2 { margin-bottom: 4px; }
            .mb-3 { margin-bottom: 6px; }
            .mb-4 { margin-bottom: 8px; }
            .my-1 { margin-top: 2px; margin-bottom: 2px; }
            .my-2 { margin-top: 4px; margin-bottom: 4px; }
            .border-t { border-top: 1px dashed black; }
            .leading-tight { line-height: 1.1; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .uppercase { text-transform: uppercase; }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
          <script>
            // Auto-print when ready
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 100);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Close modal and handle cash drawer
    setTimeout(() => {
      setIsModalOpen(false);
      if (onClose) onClose();
      
      // Open cash drawer after printing (only for cash payments)
      if (order?.paymentMethod === 'cash') {
        handleCashDrawerOpen();
      }
    }, 1000);
  };

  const handleCashDrawerOpen = async () => {
    try {
      const success = await ESCPOSService.openCashDrawer();
      if (success) {
        console.log('Cash drawer opened successfully');
      } else {
        console.warn('Failed to open cash drawer');
        // Show user notification
        alert('Could not open cash drawer automatically. Please check printer connection and try again.');
      }
    } catch (error) {
      console.error('Error opening cash drawer:', error);
      alert('Error opening cash drawer. Please open manually or check printer settings.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  if (!order) {
    return compact ? (
      <button 
        className="p-1 text-gray-400 cursor-not-allowed"
        disabled
        title="Print Receipt"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
      </button>
    ) : (
      <button 
        className="bg-gray-300 text-sm px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Print Receipt
      </button>
    );
  }

  return (
    <>
      {compact ? (
        // Compact view - just printer icon
        <button 
          onClick={handlePrintReceipt}
          className="p-1 text-blue-600 hover:text-blue-700 transition"
          title="Print Receipt"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
        </button>
      ) : (
        // Full view - print button
        <button 
          onClick={handlePrintReceipt}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Print Receipt
        </button>
      )}

      {/* Receipt Preview Modal - centered over POS interface */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
          {/* Centered receipt card */}
          <div className="relative bg-white rounded-lg shadow-2xl border border-neutral-200 w-96 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Receipt Preview</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          
          {/* Scrollable Receipt Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <ThermalReceipt order={order} />
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
            <button 
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Print
            </button>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
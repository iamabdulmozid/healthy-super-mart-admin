// src/modules/pos/components/ThermalReceipt.tsx
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { formatCurrency as formatPrice } from '@/utils/currency';
import type { Order } from '../services/orderService';

// Frontend-only interface for cash payment details
interface CashPaymentDetails {
  receivedAmount: number;
  change: number;
}

// Extended order with frontend cash details
interface OrderWithCashDetails extends Order {
  cashDetails?: CashPaymentDetails;
}

interface ThermalReceiptProps {
  order: OrderWithCashDetails;
  className?: string;
}

export default function ThermalReceipt({ order, className = '' }: ThermalReceiptProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatPrice(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate barcode for order ID
  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, order.id.toString(), {
        format: 'CODE128',
        width: 2,
        height: 25,
        displayValue: true,
        fontSize: 12,
        margin: 10,
        marginTop: 5,
        marginBottom: 5,
      });
    }
  }, [order.id]);

  return (
    <div className={`thermal-receipt ${className}`}>
      {/* Receipt content - styled for thermal printer */}
      <div 
        id="thermal-receipt-content"
        className="thermal-receipt-content font-mono text-xs bg-white text-black p-4 mx-auto"
        style={{
          fontFamily: 'Courier, monospace',
          lineHeight: '1.2',
          width: '58mm',
          maxWidth: '58mm',
          minWidth: '58mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="font-bold text-sm mb-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{order.shop.name}</div>
          <div className="text-xs leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
            {order.shop.address}
          </div>
          <div className="text-xs" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>Tel: {order.shop.phone}</div>
          <div className="text-xs" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{order.shop.email}</div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Order Info */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="uppercase">{order.paymentMethod === 'cash' ? 'CASH' : 'CARD'}</span>
          </div>
          {/* <div className="flex justify-between">
            <span>Location:</span>
            <span>{order.locationCode}</span>
          </div> */}
          {/* <div className="flex justify-between">
            <span>Source:</span>
            <span className="uppercase">{order.orderSource}</span>
          </div> */}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Items */}
        <div className="mb-3">
          {order.orderItems.map((item, index) => {
            // Database price includes VAT, so we need to remove it for display
            const priceWithVAT = parseFloat(item.priceAtOrderTime);
            const priceWithoutVAT = priceWithVAT / 1.08;
            const itemSubtotal = priceWithoutVAT * item.quantity;
            
            return (
              <div key={index} className="mb-2">
                <div className="font-semibold">
                  {item.product.name}
                </div>
                <div className="flex justify-between text-xs">
                  <span>{item.quantity} x {formatCurrency(priceWithoutVAT)}</span>
                  <span>{formatCurrency(itemSubtotal)}</span>
                </div>
                {/* {item.product.weight && (
                  <div className="text-xs text-gray-600">
                    Weight: {item.product.weight}kg
                  </div>
                )} */}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totals */}
        <div className="mb-3">
          {(() => {
            // Calculate subtotal from VAT-excluded prices
            const subtotalWithoutVAT = order.orderItems.reduce((sum, item) => {
              const priceWithVAT = parseFloat(item.priceAtOrderTime);
              const priceWithoutVAT = priceWithVAT / 1.08;
              return sum + (priceWithoutVAT * item.quantity);
            }, 0);
            
            // Calculate VAT amount (8% of subtotal)
            const vatAmount = subtotalWithoutVAT * 0.08;
            
            // Total = Subtotal + VAT
            const totalWithVAT = subtotalWithoutVAT + vatAmount;
            
            return (
              <>
                <div className="flex justify-between">
                  <span>Subtotal :</span>
                  <span>{formatCurrency(subtotalWithoutVAT)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>VAT (8%):</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
                
                <div className="border-t border-dashed border-black my-1"></div>
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(totalWithVAT)}</span>
                </div>

                {/* Cash Payment Details */}
                {order.paymentMethod === 'cash' && order.cashDetails && (
                  <>
                    <div className="border-t border-dashed border-black my-1"></div>
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>{formatCurrency(order.cashDetails.receivedAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Change:</span>
                      <span>{formatCurrency(order.cashDetails.change)}</span>
                    </div>
                  </>
                )}
              </>
            );
          })()}
          
          {/* {order.weight && (
            <div className="flex justify-between text-xs mt-1">
              <span>Total Weight:</span>
              <span>{order.weight}kg</span>
            </div>
          )} */}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Footer */}
        <div className="text-center text-xs">
          {/* <div className="mb-1">Status: <span className="uppercase font-semibold">{order.status}</span></div> */}
          <div className="mb-2">Thank you for your purchase!</div>
          {/* <div className="text-xs">
            For support, please contact:<br />
            {order.shop.phone}
          </div> */}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Print timestamp */}
        <div className="text-center text-xs mb-2">
          {new Date().toLocaleString()}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Barcode for Order ID */}
        <div className="text-center">
          <svg ref={barcodeRef} className="mx-auto"></svg>
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            
            #thermal-receipt-content,
            #thermal-receipt-content * {
              visibility: visible;
            }
            
            #thermal-receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 58mm !important;
              font-size: 8pt !important;
              margin: 0 !important;
              padding: 2mm !important;
            }
            
            .thermal-receipt-content {
              box-shadow: none !important;
              border: none !important;
            }
          }
        `
      }} />
    </div>
  );
}
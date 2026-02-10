// src/modules/pos/components/CheckoutButton.tsx
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { orderService } from '../services/orderService';
import ReceiptGenerator from './ReceiptGenerator';
import { formatPrice } from '@/utils/currency';
import type { Order } from '../services/orderService';

type PaymentMethod = 'cash' | 'card';

// Frontend-only interface for cash payment details
interface CashPaymentDetails {
  receivedAmount: number;
  change: number;
}

// Extended order with frontend cash details
interface OrderWithCashDetails extends Order {
  cashDetails?: CashPaymentDetails;
}

export default function CheckoutButton() {
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderWithCashDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [receivedAmount, setReceivedAmount] = useState<string>('');

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      setError('Cart is empty. Please add items before checkout.');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method to continue.');
      return;
    }

    // For cash payments, validate received amount
    if (paymentMethod === 'cash') {
      const received = parseFloat(receivedAmount);
      if (!receivedAmount || isNaN(received) || received <= 0) {
        setError('Please enter a valid received amount.');
        return;
      }
      if (received < cart.totalAmount) {
        setError(`Received amount must be at least ${formatPrice(cart.totalAmount)}.`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the checkout API
      const response = await orderService.checkout(cart.items, {
        userId: 1, // Should come from auth context
        shopId: 1, // Should be configurable
        locationCode: 'POS', // Should be configurable
        orderSource: 'pos',
        paymentMethod: paymentMethod as PaymentMethod
      });

      console.log('Checkout successful:', response);
      console.log('Selected payment method:', paymentMethod);
      console.log('Order payment method from API:', response.order.paymentMethod);
      
      // Create order with cash details for frontend use
      const orderWithCashDetails: OrderWithCashDetails = {
        ...response.order,
        // Ensure payment method is correctly set from frontend state
        paymentMethod: paymentMethod as PaymentMethod,
        ...(paymentMethod === 'cash' && receivedAmount && {
          cashDetails: {
            receivedAmount: parseFloat(receivedAmount),
            change: parseFloat(receivedAmount) - parseFloat(response.order.total)
          }
        })
      };
      
      console.log('Order with cash details:', orderWithCashDetails);
      
      // Set the completed order for receipt generation
      setCompletedOrder(orderWithCashDetails);
      
      // Clear the cart and reset payment method after successful checkout
      clearCart();
      setPaymentMethod('');
      setReceivedAmount('');
      
      // Show success message
      const changeAmount = paymentMethod === 'cash' ? parseFloat(receivedAmount) - parseFloat(response.order.total) : 0;
      const successMessage = paymentMethod === 'cash' && receivedAmount
        ? `Order #${response.order.id} created successfully!\nTotal: ${formatPrice(parseFloat(response.order.total))}\nReceived: ${formatPrice(parseFloat(receivedAmount))}\nChange: ${formatPrice(changeAmount)}`
        : `Order #${response.order.id} created successfully!\nTotal: ${formatPrice(parseFloat(response.order.total))}`;
      
      alert(successMessage);

    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptClose = () => {
    setCompletedOrder(null);
  };

  if (completedOrder) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-green-800 font-semibold">Order #{completedOrder.id} completed!</span>
          </div>
          
          {/* Payment Summary */}
          <div className="text-sm text-green-700 space-y-1">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{formatPrice(parseFloat(completedOrder.total))}</span>
            </div>
            
            {/* Cash Payment Details */}
            {completedOrder.paymentMethod === 'cash' && completedOrder.cashDetails && (
              <>
                <div className="flex justify-between">
                  <span>Received:</span>
                  <span className="font-medium">{formatPrice(completedOrder.cashDetails.receivedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-medium">{formatPrice(completedOrder.cashDetails.change)}</span>
                </div>
              </>
            )}
            
            {/* Card Payment */}
            {completedOrder.paymentMethod === 'card' && (
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-medium">💳 Card Payment</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <ReceiptGenerator order={completedOrder} onClose={handleReceiptClose} />
          <button 
            onClick={handleReceiptClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition text-sm"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Compact Payment & Checkout Section */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        {/* Payment Method Selection */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPaymentMethod('cash')}
            disabled={isLoading}
            className={`flex-1 p-2 rounded-md border transition-all duration-200 flex items-center justify-center gap-1.5 text-sm font-medium ${
              paymentMethod === 'cash'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-neutral-200 bg-gray-50 text-gray-600 hover:border-neutral-200 hover:bg-gray-100'
            }`}
          >
            <span>💵</span>
            <span>Cash</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('card')}
            disabled={isLoading}
            className={`flex-1 p-2 rounded-md border transition-all duration-200 flex items-center justify-center gap-1.5 text-sm font-medium ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-neutral-200 bg-gray-50 text-gray-600 hover:border-neutral-200 hover:bg-gray-100'
            }`}
          >
            <span>💳</span>
            <span>Card</span>
          </button>
        </div>

        {/* Received Amount Input for Cash Payments */}
        {paymentMethod === 'cash' && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder={`Enter amount (min: ${formatPrice(cart.totalAmount)})`}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {receivedAmount && parseFloat(receivedAmount) >= cart.totalAmount && (
                <div className="text-sm font-medium text-green-600">
                  Change: {formatPrice(parseFloat(receivedAmount) - cart.totalAmount)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Checkout Button */}
        <button 
          onClick={handleCheckout}
          disabled={cart.items.length === 0 || !paymentMethod || isLoading || (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < cart.totalAmount))}
          className={`w-full px-4 py-3 rounded-md font-semibold transition-all duration-200 flex items-center justify-center ${
            cart.items.length === 0 || !paymentMethod || isLoading || (paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < cart.totalAmount))
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cart.items.length === 0 
                ? 'Add Items to Checkout' 
                : !paymentMethod
                ? 'Select Payment Method'
                : paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < cart.totalAmount)
                ? 'Enter Valid Amount'
                : `Checkout ${formatPrice(cart.totalAmount)}`
              }
            </>
          )}
        </button>
      </div>
    </div>
  );
}
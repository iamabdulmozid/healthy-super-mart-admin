// src/modules/pos/components/LiveCart.tsx
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';

export default function LiveCart() {
  const { cart, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateQuantity(productId, newQuantity);
  };

  return (
    <div className="bg-white p-4 shadow rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Live Cart</h3>
        {cart.totalItems > 0 && (
          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
            {cart.totalItems} items
          </span>
        )}
      </div>
      
      {cart.items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🛒</div>
          <p>Cart is empty</p>
          <p className="text-sm mt-1">Scan a barcode or enter product ID to add items</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">{item.product.name}</h4>
                  <p className="text-xs text-gray-500">ID: {item.product.id}</p>
                  <p className="text-xs text-gray-600">
                    {formatPrice(item.unitPrice / 1.08)} each (excl. VAT)
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-white text-center min-w-[2rem]">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatPrice(item.total)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3 mt-3 space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span>Subtotal (excl. VAT):</span>
              <span>{formatPrice(cart.totalAmount / 1.08)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>VAT (8%):</span>
              <span>{formatPrice(cart.totalAmount - (cart.totalAmount / 1.08))}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total (incl. VAT):</span>
              <span className="text-primary-600">
                {formatPrice(cart.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
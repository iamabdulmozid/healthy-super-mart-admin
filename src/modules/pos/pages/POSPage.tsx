// src/modules/pos/pages/POSPage.tsx
import BarcodeSearch from '../components/Barcodesearch';
import LiveCart from '../components/LiveCart';
import CheckoutButton from '../components/CheckoutButton';
import PrinterSettings from '../components/PrinterSettings';
import { CartProvider } from '@/context/CartContext';

export default function POSPage() {
  return (
    <CartProvider>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">POS System</h2>
          <PrinterSettings />
        </div>
        <BarcodeSearch />
        <LiveCart />
        <div className="flex justify-end">
          <CheckoutButton />
        </div>
      </div>
    </CartProvider>
  );
}
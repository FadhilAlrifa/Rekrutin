import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

import MobileOnlyGuard from './MobileOnlyGuard';
import WelcomeScreen from './WelcomeScreen';
import MenuCatalog from './MenuCatalog';
import CartModal from './CartModal';
import SuccessScreen from './SuccessScreen';

export default function SelfOrderModule({ products = [], ingredients = [], onCheckout, setActiveTab }) {
  const [step, setStep] = useState(1);
  const [tableNumber, setTableNumber] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const updateQuantity = (menu, change) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        const newQty = existing.qty + change;
        if (newQty <= 0) return prev.filter((item) => item.id !== menu.id);
        return prev.map((item) => (item.id === menu.id ? { ...item, qty: newQty } : item));
      }
      if (change > 0) return [...prev, { ...menu, qty: change }];
      return prev;
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckoutProcess = async () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);

    // Kirim cart dan nomor meja ke App.jsx untuk dicatat ke database & potong stok BOM
    await onCheckout(cart, `Meja ${tableNumber}`);

    setStep(3);
  };

  return (
    <MobileOnlyGuard onBackToDashboard={() => setActiveTab?.('pos')}>
      {/* TAMPILAN MOBILE ONLY (Layar Penuh HP <= 768px) */}
      <div className="w-full min-h-screen pt-16 bg-[#FAFAFA] relative overflow-hidden flex flex-col">
        {step === 1 && (
          <WelcomeScreen
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <>
            <MenuCatalog
              products={products}
              ingredients={ingredients}
              cart={cart}
              updateQuantity={updateQuantity}
            />

            {cart.length > 0 && (
              <div className="fixed bottom-6 left-5 right-5 z-20">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-[#141414] text-white rounded-2xl p-4 shadow-xl flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center relative">
                      <ShoppingBag size={14} />
                      <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-[#141414] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-200">Lihat Keranjang</span>
                  </div>
                  <span className="font-mono font-black text-sm text-[#F59E0B]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <SuccessScreen
            tableNumber={tableNumber}
            onReset={() => {
              setStep(1);
              setTableNumber('');
              setCart([]);
            }}
          />
        )}

        <AnimatePresence>
          {isCartOpen && (
            <CartModal
              cart={cart}
              tableNumber={tableNumber}
              onClose={() => setIsCartOpen(false)}
              onCheckout={handleCheckoutProcess}
            />
          )}
        </AnimatePresence>
      </div>
    </MobileOnlyGuard>
  );
}

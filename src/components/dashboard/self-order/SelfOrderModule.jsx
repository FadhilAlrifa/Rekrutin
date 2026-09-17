import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag, Smartphone, ArrowLeft } from 'lucide-react';

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
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        const newQty = existing.qty + change;
        if (newQty <= 0) return prev.filter(item => item.id !== menu.id);
        return prev.map(item => item.id === menu.id ? { ...item, qty: newQty } : item);
      }
      if (change > 0) return [...prev, { ...menu, qty: change }];
      return prev;
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckoutProcess = async () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    
    // Kirim cart dan nomor meja ke App.jsx untuk dicatat ke database & potong stok BOM
    await onCheckout(cart, `Meja ${tableNumber}`);
    
    setStep(3);
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-col items-center justify-center p-0 md:p-6">
      
      {/* TAMPILAN DESKTOP (Mockup Kiosk HP) */}
      <div className="hidden md:flex flex-col items-center w-full">
        <div className="w-full max-w-md mb-4 flex justify-between items-center px-2">
          <button 
            onClick={() => setActiveTab('pos')}
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </button>
          <span className="text-[11px] font-bold text-zinc-400 bg-zinc-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Smartphone size={12} /> Preview Mode Kiosk Mobile
          </span>
        </div>

        <div className="w-full max-w-md h-[84vh] bg-zinc-50 rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl relative overflow-hidden flex flex-col">
          {step === 1 && (
            <WelcomeScreen tableNumber={tableNumber} setTableNumber={setTableNumber} onNext={() => setStep(2)} />
          )}
          
          {step === 2 && (
            <>
              <MenuCatalog products={products} ingredients={ingredients} cart={cart} updateQuantity={updateQuantity} />
              
              {cart.length > 0 && (
                <div className="absolute bottom-6 left-5 right-5 z-20">
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full bg-zinc-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center relative">
                        <ShoppingBag size={14} />
                        <span className="absolute -top-1 -right-1 bg-[#E87F24] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {totalItems}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-300">Lihat Keranjang</span>
                    </div>
                    <span className="font-mono font-black text-sm">Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <SuccessScreen tableNumber={tableNumber} onReset={() => { setStep(1); setTableNumber(''); setCart([]); }} />
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
      </div>

      {/* TAMPILAN MOBILE (Layar Penuh HP) */}
      <div className="block md:hidden w-full min-h-screen bg-zinc-50 relative overflow-hidden flex flex-col -m-6 p-0">
        {step === 1 && (
          <WelcomeScreen tableNumber={tableNumber} setTableNumber={setTableNumber} onNext={() => setStep(2)} />
        )}
        
        {step === 2 && (
          <>
            <MenuCatalog products={products} ingredients={ingredients} cart={cart} updateQuantity={updateQuantity} />
            
            {cart.length > 0 && (
              <div className="fixed bottom-6 left-5 right-5 z-20">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-zinc-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center relative">
                      <ShoppingBag size={14} />
                      <span className="absolute -top-1 -right-1 bg-[#E87F24] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-300">Lihat Keranjang</span>
                  </div>
                  <span className="font-mono font-black text-sm">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </button>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <SuccessScreen tableNumber={tableNumber} onReset={() => { setStep(1); setTableNumber(''); setCart([]); }} />
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

    </div>
  );
}
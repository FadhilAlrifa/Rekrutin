import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, CheckCircle, ShoppingBag } from 'lucide-react';

export default function CartModal({ cart, tableNumber, onClose, onCheckout }) {
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/60 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 100 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 100 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[85vh] sm:h-auto max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-zinc-100"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-base tracking-tight">Ringkasan Pesanan</h3>
              <p className="text-xs font-bold text-zinc-400 flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-[#E87F24]"/> Meja {tableNumber}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-9 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List Item Keranjang */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-zinc-50/50">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs font-bold">
              Keranjang belanja Anda masih kosong.
            </div>
          ) : (
            cart.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.03 }}
                key={item.id || idx} 
                className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs gap-3"
              >
                {/* Foto Mini Menu */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-100 shadow-2xs" 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-zinc-900 text-xs sm:text-sm truncate">{item.name}</p>
                    <p className="text-[11px] font-mono font-bold text-[#E87F24] mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                {/* Total Harga & Qty */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="font-mono font-black text-zinc-900 text-xs sm:text-sm block">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 block">{item.qty} item</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal Footer / Tagihan & Checkout */}
        <div className="p-6 bg-white border-t border-zinc-100 space-y-4">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60 space-y-2">
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>Subtotal Produk</span>
              <span className="font-mono font-bold text-zinc-800">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>Pajak & Layanan (0%)</span>
              <span className="font-mono font-bold text-zinc-800">Rp 0</span>
            </div>
            <div className="pt-2 border-t border-zinc-200/80 flex justify-between text-base font-black text-zinc-900">
              <span>Total Tagihan</span>
              <span className="font-mono text-[#E87F24]">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`w-full font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cart.length > 0 
                ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 active:scale-95 shadow-orange-500/10' 
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle size={18} /> Konfirmasi & Pesan Sekarang
          </button>
        </div>
      </motion.div>
    </div>
  );
}
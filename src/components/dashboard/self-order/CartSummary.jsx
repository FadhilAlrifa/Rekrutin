import React from 'react';
import { ShoppingBag, MapPin } from 'lucide-react';

export default function CartSummary({ cart, tableNumber, onCheckout }) {
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 shadow-xl space-y-5 h-fit sticky top-24 relative overflow-hidden">
      {/* Aksen Puncak Struk */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#E87F24]"></div>

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black text-zinc-900 text-lg flex items-center gap-2">
            Pesanan Anda
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mt-1">
            <MapPin size={12} className="text-[#E87F24]" /> Makan di Tempat — Meja <span className="text-[#E87F24]">{tableNumber}</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-orange-50 text-[#E87F24] rounded-full flex items-center justify-center">
          <ShoppingBag size={18} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-zinc-100 my-2"></div>

      {cart.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={20} />
          </div>
          <p className="text-xs text-zinc-400 font-bold">Keranjang masih kosong</p>
          <p className="text-[10px] text-zinc-400 font-medium">Silakan pilih menu favorit Anda</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <div className="flex gap-2">
                <span className="font-black text-zinc-900">{item.qty}x</span>
                <div>
                  <p className="font-bold text-zinc-700 leading-tight">{item.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">@ Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="font-mono font-bold text-zinc-900 text-right">
                Rp {(item.price * item.qty).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t-2 border-dashed border-zinc-200 pt-4 space-y-2">
        <div className="flex justify-between text-base font-black text-zinc-900">
          <span>Total</span>
          <span className="font-mono text-[#E87F24]">Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <button 
        onClick={onCheckout}
        disabled={cart.length === 0}
        className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black py-4 rounded-2xl shadow-lg cursor-pointer disabled:opacity-50 disabled:grayscale transition-transform hover:scale-[1.02]"
      >
        Pesan Sekarang
      </button>
    </div>
  );
}
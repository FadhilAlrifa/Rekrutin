import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Layers, Tag } from 'lucide-react';

export default function MenuCard({ prod, idx, onEdit, onDelete }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: idx * 0.04 }}
      className="bg-white border border-black/[0.04] rounded-[20px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Gambar & Kategori */}
        <div className="relative w-full h-40 rounded-[14px] overflow-hidden bg-black/[0.02] mb-4">
          <img 
            src={prod.image} 
            alt={prod.name} 
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/80 backdrop-blur-md text-zinc-900 border border-black/[0.04] px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide shadow-sm flex items-center gap-1.5">
              <Tag size={12} className="text-[#E87F24]" /> {prod.category}
            </span>
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="space-y-1 px-1">
          <h4 className="font-semibold text-zinc-900 text-[15px] leading-tight line-clamp-1">{prod.name}</h4>
          <p className="font-bold text-zinc-500 text-[13px]">
            Rp {Number(prod.price).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Komposisi Resep (BOM Preview) */}
        <div className="mt-4 pt-3 border-t border-black/[0.04] px-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 flex items-center gap-1.5 mb-2">
            <Layers size={12} className="text-[#E87F24]" /> Komposisi (BOM)
          </p>
          {prod.recipe && prod.recipe.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto hide-scrollbar">
              {prod.recipe.map((rc, i) => (
                <span key={i} className="bg-black/[0.04] text-zinc-700 px-2.5 py-1 rounded-lg text-[12px] font-medium border border-black/[0.02]">
                  {rc.name} <strong className="text-zinc-900 font-semibold ml-0.5">({rc.qty}{rc.unit})</strong>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400 italic text-[12px]">Tanpa resep bahan baku</span>
          )}
        </div>
      </div>

      {/* Aksi / Tombol */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-black/[0.04] px-1">
        <button 
          onClick={() => onEdit(prod)} 
          className="flex-1 py-2 bg-black/[0.04] hover:bg-black/[0.08] text-zinc-700 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(prod.id)} 
          className="py-2 px-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
          title="Hapus Menu"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
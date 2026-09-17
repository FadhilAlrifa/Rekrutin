import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Layers, Tag } from 'lucide-react';

export default function MenuCard({ prod, idx, onEdit, onDelete }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: idx * 0.04 }}
      className="bg-white border border-zinc-200/80 rounded-[2.2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Gambar & Kategori */}
        <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-zinc-100 mb-4">
          <img 
            src={prod.image} 
            alt={prod.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-md text-zinc-900 border border-zinc-200/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Tag size={10} className="text-[#E87F24]" /> {prod.category}
            </span>
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="space-y-1.5 px-1">
          <h4 className="font-black text-zinc-900 text-base leading-tight line-clamp-1">{prod.name}</h4>
          <p className="font-mono font-bold text-emerald-600 text-sm">
            Rp {Number(prod.price).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Komposisi Resep (BOM Preview) */}
        <div className="mt-4 pt-3 border-t border-zinc-100 px-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1 mb-2">
            <Layers size={12} className="text-[#E87F24]" /> Komposisi Resep (BOM)
          </p>
          {prod.recipe && prod.recipe.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto hide-scrollbar">
              {prod.recipe.map((rc, i) => (
                <span key={i} className="bg-zinc-50 text-zinc-700 px-2.5 py-1 rounded-xl text-[10px] font-medium border border-zinc-200/60">
                  {rc.name} <strong className="text-zinc-900 font-bold">({rc.qty} {rc.unit})</strong>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400 italic text-[10px]">Tanpa resep bahan baku</span>
          )}
        </div>
      </div>

      {/* Aksi / Tombol */}
      <div className="flex items-center gap-2 mt-6 pt-3 border-t border-zinc-100 px-1">
        <button 
          onClick={() => onEdit(prod)} 
          className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 rounded-xl text-xs font-black transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <Edit3 size={14} /> Edit
        </button>
        <button 
          onClick={() => onDelete(prod.id)} 
          className="py-2.5 px-3.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl text-xs font-black transition-colors cursor-pointer inline-flex items-center justify-center"
          title="Hapus Menu"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
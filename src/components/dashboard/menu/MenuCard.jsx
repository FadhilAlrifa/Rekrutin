import { motion } from 'framer-motion';
import { Edit3, Trash2, Layers, Tag, Lock, Calculator } from 'lucide-react';
import { calculateMenuCogs } from '../../../utils/cogsCalculator';

export default function MenuCard({
  prod,
  idx,
  onEdit,
  onDelete,
  ingredients = [],
  subscriptionPlan = 'pro'
}) {
  const isStarter = subscriptionPlan === 'starter';
  const cogsData = calculateMenuCogs(prod, ingredients);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Gambar & Kategori */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-100 mb-4">
          <img
            src={prod.image}
            alt={prod.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/95 text-[#141414] border border-zinc-200 px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1.5">
              <Tag size={11} className="text-[#D97706]" /> {prod.category}
            </span>
          </div>
          {!isStarter && cogsData.hasRecipe && (
            <div className="absolute top-3 right-3">
              <span
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border shadow-sm inline-flex items-center gap-1 ${cogsData.status.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cogsData.status.dotClass}`} />
                Margin {cogsData.grossMarginPct}%
              </span>
            </div>
          )}
        </div>

        {/* Informasi Utama */}
        <div className="space-y-1 px-1">
          <h4 className="font-bold text-[#141414] text-[15px] leading-tight line-clamp-1">{prod.name}</h4>
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-[#D97706] font-mono text-[13px]">
              Rp {Number(prod.price).toLocaleString('id-ID')}
            </p>
            {!isStarter && cogsData.hasRecipe && (
              <span className="font-mono text-[10px] font-bold text-[#52525B]">
                {cogsData.status.label}
              </span>
            )}
          </div>
        </div>

        {/* Ringkasan HPP (COGS) & Laba Kotor */}
        {!isStarter && (
          <div className="mt-3 grid grid-cols-2 gap-2 px-1">
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1">
                <Calculator size={10} className="text-[#D97706]" /> HPP / Porsi
              </span>
              <p className="font-mono text-xs font-extrabold text-[#141414] mt-0.5">
                Rp {cogsData.cogs.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] block">
                Laba Kotor
              </span>
              <p className={`font-mono text-xs font-extrabold mt-0.5 ${cogsData.status.textClass}`}>
                Rp {cogsData.grossProfit.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}

        {/* Komposisi Resep (BOM Preview) */}
        <div className="mt-3.5 pt-3 border-t border-zinc-100 px-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Layers size={12} className="text-[#D97706]" /> Komposisi (BOM)
            </span>
            {isStarter && (
              <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <Lock size={9} /> PRO
              </span>
            )}
          </p>
          {isStarter ? (
            <p className="text-[11px] text-[#52525B] font-medium bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              Pemotongan resep & kalkulasi HPP (BOM) tidak aktif pada <strong>Paket Starter</strong>.
            </p>
          ) : prod.recipe && prod.recipe.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto hide-scrollbar">
              {prod.recipe.map((rc, i) => {
                const cleanIngName = (rc.name || '').split(' | ')[0];
                if (!cleanIngName) return null;
                return (
                  <span
                    key={i}
                    className="bg-[#FAFAFA] text-[#52525B] px-2.5 py-1 rounded-lg text-[11px] font-medium border border-zinc-200"
                  >
                    {cleanIngName}{' '}
                    <strong className="text-[#141414] font-mono font-bold ml-0.5">
                      ({rc.qty}{rc.unit})
                    </strong>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-zinc-400 italic text-[12px]">Tanpa resep bahan baku</span>
          )}
        </div>
      </div>

      {/* Aksi / Tombol */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-zinc-100 px-1">
        <button
          onClick={() => onEdit(prod)}
          className="flex-1 py-2 bg-[#FAFAFA] hover:bg-[#141414] hover:text-white border border-zinc-200 text-[#141414] rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Edit3 size={13} /> Edit Menu & HPP
        </button>
        <button
          onClick={() => onDelete(prod.id)}
          className="py-2 px-3 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
          title="Hapus Menu"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

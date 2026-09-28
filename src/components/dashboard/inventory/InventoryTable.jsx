import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, AlertTriangle, Edit3, Trash2, CalendarDays, Package } from 'lucide-react';

export default function InventoryTable({
    activeSub,
    filteredProducts = [],
    filteredIngredients = [],
    checkExpiryStatus,
    handleOpenEdit,
    handleDeleteIngredient
}) {
    const formatTanggal = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (activeSub === 'products') {
        return (
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                            <th className="pb-4 px-3 md:px-4">Nama Produk Akhir</th>
                            <th className="pb-4 px-3 md:px-4">Kategori</th>
                            <th className="pb-4 px-3 md:px-4">Stok Kasir</th>
                            <th className="pb-4 px-3 md:px-4">Masa Kedaluwarsa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-xs font-medium">
                        {filteredProducts.map((p, idx) => {
                            const expiryStatus = checkExpiryStatus(p.expiryDate);
                            let rowColor = 'hover:bg-zinc-50/80';
                            if (expiryStatus === 'expired') rowColor = 'bg-red-50/50 hover:bg-red-50';
                            else if (expiryStatus === 'hampir') rowColor = 'bg-orange-50/50 hover:bg-orange-50';

                            return (
                                <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} key={p.id} className={`${rowColor} transition-colors`}>
                                    <td className="py-4 px-3 md:px-4 font-black text-zinc-900 text-xs md:text-sm flex items-center gap-2.5">
                                        <img src={p.image} alt={p.name} className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover border border-zinc-200 shrink-0" />
                                        <span className="truncate max-w-[160px] sm:max-w-xs">{p.name}</span>
                                    </td>
                                    <td className="py-4 px-3 md:px-4">
                                        <span className="bg-orange-50 text-[#E87F24] border border-orange-200 px-2.5 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 md:px-4 font-mono font-bold text-zinc-800 whitespace-nowrap">{p.stock} unit</td>
                                    <td className="py-4 px-3 md:px-4 text-zinc-600 font-semibold whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className={expiryStatus === 'aman' ? 'text-zinc-400' : 'text-red-500'} />
                                            <span className={expiryStatus !== 'aman' ? 'font-black text-red-600' : ''}>{p.expiryDate || 'Tidak ada'}</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                    <tr className="border-b border-black/[0.04] text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                        <th className="pb-3 px-3 md:px-4">Nama Barang Gudang</th>
                        <th className="pb-3 px-3 md:px-4">Total Stok</th>
                        <th className="pb-3 px-3 md:px-4">Tgl. Masuk</th>
                        <th className="pb-3 px-3 md:px-4">Kedaluwarsa</th>
                        <th className="pb-3 px-3 md:px-4">Status</th>
                        <th className="pb-3 px-3 md:px-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-[13px] font-medium text-zinc-700">
                    {filteredIngredients.map((ing, idx) => {
                        const nameParts = (ing.name || '').split(' | ');
                        const ingName = nameParts[0];
                        const ingCategory = nameParts[1] || 'Bahan Umum';
                        
                        const isBelowMin = ing.stock <= ing.minLimit;
                        const expiryStatus = checkExpiryStatus(ing.expiryDate);

                        let rowColor = 'hover:bg-black/[0.02]';
                        if (expiryStatus === 'expired' || isBelowMin) rowColor = 'bg-red-50/30 hover:bg-red-50/60';
                        else if (expiryStatus === 'hampir') rowColor = 'bg-orange-50/30 hover:bg-orange-50/60';

                        return (
                            <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} key={ing.id} className={`${rowColor} transition-colors`}>
                                <td className="py-3.5 px-3 md:px-4 font-semibold text-zinc-900 text-[14px] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-black/[0.04] text-[#E87F24] flex items-center justify-center shrink-0 border border-black/[0.02]">
                                        <Package size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs">{ingName}</span>
                                        <span className="text-[11px] font-medium text-zinc-400">{ingCategory}</span>
                                    </div>
                                </td>

                                <td className={`py-3.5 px-3 md:px-4 font-mono font-semibold text-[14px] whitespace-nowrap ${isBelowMin ? 'text-red-600' : 'text-zinc-900'}`}>
                                    {ing.stock} <span className="text-[11px] text-zinc-500 font-medium ml-0.5">{ing.unit}</span>
                                </td>

                                <td className="py-3.5 px-3 md:px-4 text-zinc-600 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays size={14} className="text-zinc-400 shrink-0" />
                                        <span>{formatTanggal(ing.entryDate)}</span>
                                    </div>
                                </td>

                                <td className="py-3.5 px-3 md:px-4 text-zinc-600 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className={expiryStatus === 'aman' ? 'text-zinc-400 shrink-0' : 'text-red-500 shrink-0'} />
                                        <span className={expiryStatus !== 'aman' ? 'font-semibold text-red-600' : ''}>
                                            {formatTanggal(ing.expiryDate)}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-3.5 px-3 md:px-4 whitespace-nowrap">
                                    {isBelowMin ? (
                                        <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1">
                                            <AlertTriangle size={12} /> Restock
                                        </span>
                                    ) : expiryStatus === 'hampir' ? (
                                        <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap">
                                            Hampir Exp
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                                            <ShieldCheck size={12} /> Aman
                                        </span>
                                    )}
                                </td>

                                <td className="py-3.5 px-3 md:px-4 text-right space-x-1.5 whitespace-nowrap">
                                    <button 
                                        onClick={() => handleOpenEdit(ing)} 
                                        className="px-2.5 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] text-zinc-700 rounded-[8px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 text-[12px] active:scale-95"
                                        title="Edit Barang"
                                    >
                                        <Edit3 size={12} /> <span className="hidden lg:inline">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteIngredient(ing.id, ing.name)} 
                                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-[8px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 text-[12px] active:scale-95"
                                        title="Hapus Barang"
                                    >
                                        <Trash2 size={12} /> <span className="hidden lg:inline">Hapus</span>
                                    </button>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
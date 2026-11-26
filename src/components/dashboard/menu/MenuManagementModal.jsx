import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, LayoutGrid, Coffee, Utensils, Croissant, Cake, History, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import {
  syncMenuRecipesToDb,
  saveProductWithRetailFields,
  updateRetailProductStock,
  unregisterCompanyProductId
} from '../../../services/stockoService';
import { calculateMenuCogs } from '../../../utils/cogsCalculator';
import { useNotify } from '../../common/NotificationContext';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';
import { getProductFallbackImage } from '../../../data/simulationCatalog';

export default function MenuManagementModule({
  products,
  setProducts,
  ingredients = [],
  subscriptionPlan = 'pro',
  businessType = 'fnb',
  userRole = 'superadmin',
  isSimulationMode = false,
  retailPriceHistory = [],
  onRetailPriceHistoryAdded,
  onRecordAudit,
  currentOperator,
  onUpgradePlan
}) {
  const { showAlert, showConfirm, showToast } = useNotify();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const isRetail = businessType === 'retail';
  const isStarter = subscriptionPlan === 'starter';
  const canEditMenu = userRole !== 'kasir';
  const canQuickRestock = canEditMenu || (isStarter && userRole === 'kasir');

  const normalizeMenuCategory = (cat) => {
    if (isStarter && !isRetail && (cat === 'Bakery' || cat === 'Dessert')) {
      return 'Makanan';
    }
    return cat;
  };

  const [formData, setFormData] = useState({
    name: '',
    category: isRetail ? 'Minuman Kemasan' : 'Minuman',
    price: '',
    expiryDate: '25 Oct 2026',
    image: '',
    sku: '',
    unit: 'pcs',
    variantLabel: '',
    purchasePrice: '',
    stock: '',
    minLimit: '5',
    priceChangeNote: '',
    productMode: businessType,
    recipe: [{ name: '', qty: '', unit: 'gram' }]
  });

  const categories = useMemo(() => {
    const baseCats = isRetail
      ? [
          'Semua',
          'Minuman Kemasan',
          'Makanan Ringan',
          'Sembako & Kebutuhan',
          'Aksesoris & Elektronik',
          'Fashion & Varian',
          ...products.map((p) => p.category).filter(Boolean)
        ]
      : isStarter
      ? ['Semua', 'Minuman', 'Makanan']
      : ['Semua', 'Minuman', 'Makanan', 'Bakery', 'Dessert', ...products.map((p) => p.category).filter(Boolean)];

    const unique = Array.from(new Set(baseCats));
    return unique.map((name) => ({
      name,
      icon:
        name === 'Semua'
          ? LayoutGrid
          : name.includes('Minuman')
          ? Coffee
          : name.includes('Bakery')
          ? Croissant
          : name.includes('Dessert')
          ? Cake
          : Utensils
    }));
  }, [isRetail, isStarter, products]);

  const cogsSummary = useMemo(() => {
    const calculated = products.map((p) => calculateMenuCogs(p, ingredients, businessType));
    const avgMargin =
      calculated.length > 0
        ? Number(
            (
              calculated.reduce((sum, item) => sum + item.grossMarginPct, 0) / calculated.length
            ).toFixed(1)
          )
        : 0;
    const criticalCount = calculated.filter((item) => item.grossMarginPct < 30).length;
    const healthyCount = calculated.filter((item) => item.grossMarginPct > 50).length;
    return { avgMargin, criticalCount, healthyCount };
  }, [products, ingredients, businessType]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: isRetail ? 'Minuman Kemasan' : 'Minuman',
      price: '',
      expiryDate: '25 Oct 2026',
      image: '',
      sku: '',
      unit: 'pcs',
      variantLabel: '',
      purchasePrice: '',
      stock: subscriptionPlan === 'starter' ? '10' : '',
      minLimit: subscriptionPlan === 'starter' ? '3' : '5',
      priceChangeNote: '',
      productMode: businessType,
      recipe: [{ name: '', qty: '', unit: 'gram' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      sku: prod.sku || '',
      unit: prod.unit || 'pcs',
      variantLabel: prod.variantLabel || '',
      purchasePrice: prod.purchasePrice ?? '',
      stock: prod.stock ?? 0,
      minLimit: prod.minLimit ?? 5,
      priceChangeNote: '',
      productMode: prod.productMode || businessType,
      recipe: prod.recipe && prod.recipe.length > 0 ? prod.recipe : [{ name: '', qty: '', unit: 'gram' }]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const label = isRetail ? 'produk' : 'menu';
    const targetProd = products.find((p) => p.id === id);
    const confirmed = await showConfirm({
      title: `Hapus ${isRetail ? 'Produk' : 'Menu'}?`,
      message: `Yakin ingin menghapus ${label} "${targetProd?.name || 'terpilih'}" dari sistem? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      confirmText: `Ya, Hapus ${isRetail ? 'Produk' : 'Menu'}`,
      cancelText: 'Batal'
    });
    if (!confirmed) return;

    if (!isSimulationMode && !String(id).startsWith('SIM-')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        await showAlert({
          title: `Gagal Menghapus ${isRetail ? 'Produk' : 'Menu'}`,
          message: error.message,
          variant: 'danger'
        });
        return;
      }
      await unregisterCompanyProductId(id);
    }
    setProducts(products.filter((p) => p.id !== id));
    showToast({
      title: `${isRetail ? 'Produk' : 'Menu'} dihapus`,
      message: `"${targetProd?.name || label}" berhasil dihapus dari katalog.`,
      variant: 'info'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      await showAlert({
        title: 'Form Belum Lengkap',
        message: 'Mohon isi nama dan harga jual produk terlebih dahulu.',
        variant: 'warning'
      });
      return;
    }

    const cleanRecipe =
      subscriptionPlan === 'starter' || isRetail
        ? editingProduct?.recipe && !isRetail
          ? editingProduct.recipe
          : []
        : formData.recipe.filter((r) => r.name && r.qty);

    const isSimItem = isSimulationMode || (editingProduct && String(editingProduct.id).startsWith('SIM-'));

    let savedProd;
    let priceHistoryEntry = null;

    if (isSimItem) {
      const nextStock = Math.max(0, Number(formData.stock) || 0);
      const nextPurchasePrice = Math.max(0, Number(formData.purchasePrice) || 0);
      savedProd = {
        id: editingProduct ? editingProduct.id : `SIM-${isRetail ? 'RTL' : 'FNB'}-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        expiryDate: formData.expiryDate || '',
        image: formData.image || getProductFallbackImage(formData.name, formData.category),
        recipe: isRetail ? [] : cleanRecipe,
        sku: (formData.sku || '').trim(),
        unit: formData.unit || (isRetail ? 'pcs' : 'porsi'),
        variantLabel: (formData.variantLabel || '').trim(),
        purchasePrice: nextPurchasePrice,
        stock: nextStock,
        minLimit: Math.max(0, Number(formData.minLimit ?? (subscriptionPlan === 'starter' ? 3 : 5))),
        productMode: isRetail ? 'retail' : 'fnb'
      };
    } else {
      const res = await saveProductWithRetailFields({
        formData,
        editingProduct,
        cleanRecipe,
        businessType,
        operatorName: currentOperator?.name || 'Admin'
      });

      if (!res.success) {
        await showAlert({
          title: 'Gagal Menyimpan Produk',
          message: res.message || 'Terjadi kesalahan saat menyimpan data produk.',
          variant: 'danger'
        });
        return;
      }

      savedProd = res.product;
      priceHistoryEntry = res.priceHistoryEntry;
    }

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? savedProd : p)));
      if (!isRetail && !isSimItem) {
        syncMenuRecipesToDb(editingProduct.id, cleanRecipe, ingredients);
      }

      if (isRetail && Number(savedProd.stock) !== Number(editingProduct.stock ?? 0)) {
        const diff = Number((Number(savedProd.stock) - Number(editingProduct.stock ?? 0)).toFixed(3));
        onRecordAudit?.({
          actionType: 'Manual Adjustment',
          entityType: 'product',
          entityId: savedProd.id,
          entityName: savedProd.name,
          beforeValue: `${editingProduct.stock ?? 0} ${savedProd.unit}`,
          afterValue: `${savedProd.stock} ${savedProd.unit}`,
          deltaLabel: `${diff >= 0 ? `+${diff}` : diff} ${savedProd.unit}`,
          reason: 'Penyesuaian stok produk ritel dari form kelola produk',
          movementType: 'MANUAL_ADJUSTMENT',
          qtyChange: diff,
          beforeStock: Number(editingProduct.stock ?? 0),
          afterStock: Number(savedProd.stock),
          unit: savedProd.unit,
          stockerName: currentOperator?.name || 'Admin'
        });
      }
    } else {
      setProducts([savedProd, ...products]);
      if (!isRetail && !isSimItem) {
        syncMenuRecipesToDb(savedProd.id, cleanRecipe, ingredients);
      } else if (isRetail && Number(savedProd.stock) > 0) {
        onRecordAudit?.({
          actionType: 'Stock In',
          entityType: 'product',
          entityId: savedProd.id,
          entityName: savedProd.name,
          beforeValue: `0 ${savedProd.unit}`,
          afterValue: `${savedProd.stock} ${savedProd.unit}`,
          deltaLabel: `+${savedProd.stock} ${savedProd.unit}`,
          reason: 'Stok awal registrasi produk ritel',
          movementType: 'STOCK_IN',
          qtyChange: Number(savedProd.stock),
          beforeStock: 0,
          afterStock: Number(savedProd.stock),
          unit: savedProd.unit,
          stockerName: currentOperator?.name || 'Admin'
        });
      }
    }

    if (priceHistoryEntry) {
      onRetailPriceHistoryAdded?.(priceHistoryEntry);
      onRecordAudit?.({
        actionType: 'Price Update',
        entityType: 'product',
        entityId: savedProd.id,
        entityName: savedProd.name,
        beforeValue: `Rp ${priceHistoryEntry.oldPrice.toLocaleString('id-ID')}`,
        afterValue: `Rp ${priceHistoryEntry.newPrice.toLocaleString('id-ID')}`,
        deltaLabel: `${priceHistoryEntry.changePct > 0 ? `+${priceHistoryEntry.changePct}%` : `${priceHistoryEntry.changePct}%`}`,
        reason: priceHistoryEntry.notes
      });
    }

    showToast({
      title: editingProduct
        ? `${isRetail ? 'Produk' : 'Menu'} diperbarui`
        : `${isRetail ? 'Produk' : 'Menu'} baru ditambahkan`,
      message: `${savedProd.name} berhasil disimpan ke katalog.`,
      variant: 'success'
    });

    setIsModalOpen(false);
  };

  const handleQuickRestock = async (prod, addedQty) => {
    if (!canQuickRestock || !prod) return;
    const addAmount = Math.max(1, Math.floor(Number(addedQty) || 0));
    const beforeStock = Math.max(0, Number(prod.stock ?? 0));
    const nextStock = beforeStock + addAmount;

    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(prod.id) ? { ...p, stock: nextStock } : p))
    );
    if (!isSimulationMode && !String(prod.id).startsWith('SIM-')) {
      await updateRetailProductStock(prod.id, nextStock);
    }

    const unitLabel = isRetail ? prod.unit || 'pcs' : 'porsi';
    showToast({
      title: `Stok ${prod.name} ditambah`,
      message: `+${addAmount} ${unitLabel} ditambahkan (sekarang ${nextStock} ${unitLabel}).`,
      variant: 'success'
    });
  };

  const activeFilterCategory = categories.some((c) => c.name === activeCategory) ? activeCategory : 'Semua';

  const filteredProducts = products.filter((p) => {
    const matchCat = activeFilterCategory === 'Semua' || normalizeMenuCategory(p.category) === activeFilterCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.variantLabel || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Banner Header Modern */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            {isRetail
              ? 'Kelola Produk & Stok Ritel'
              : subscriptionPlan === 'starter'
              ? 'Kelola Menu Dasar'
              : 'Kelola Menu, Resep & Modal'}
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            {isRetail
              ? 'Atur nama barang, varian, jumlah stok, harga beli, dan keuntungan per produk.'
              : subscriptionPlan === 'starter'
              ? 'Atur daftar menu dan harga jual untuk kasir dasar.'
              : 'Atur daftar menu, takaran resep bahan baku, dan lihat keuntungan kotor per porsi.'}
          </p>
        </div>
        {canEditMenu && (
          <button
            onClick={handleOpenAddModal}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> {isRetail ? 'Tambah Produk Ritel' : 'Tambah Menu Baru'}
          </button>
        )}
      </div>

      {/* Ringkasan HPP & Margin Katalog */}
      {subscriptionPlan !== 'starter' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
              {isRetail ? 'Total SKU Ritel Aktif' : 'Total Menu Aktif'}
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{products.length}</p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              {cogsSummary.healthyCount} item margin sehat (&gt; 50%)
            </span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
              Rata-Rata Gross Margin
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{cogsSummary.avgMargin}%</p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              {isRetail ? 'Harga Jual vs Harga Beli terbaru' : 'Berdasarkan harga bahan baku terbaru'}
            </span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600">
              Margin Kritis (&lt; 30%)
            </span>
            <p className={`text-2xl font-extrabold font-mono mt-1 ${cogsSummary.criticalCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {cogsSummary.criticalCount}
            </p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              {cogsSummary.criticalCount > 0 ? 'Perlu evaluasi harga jual' : 'Tidak ada margin kritis'}
            </span>
          </div>
        </div>
      )}

      {/* Filter Kategori & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl overflow-x-auto hide-scrollbar w-fit max-w-full">
          {categories.map((cat) => {
            const isActive = activeFilterCategory === cat.name;
            const catCount =
              cat.name === 'Semua'
                ? products.length
                : products.filter((p) => normalizeMenuCategory(p.category) === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`font-mono text-[10px] ${isActive ? 'text-[#F59E0B]' : 'text-zinc-400'}`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={isRetail ? 'Cari produk, SKU, atau varian...' : 'Cari nama menu...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 text-[#141414] text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Grid Kartu Menu / Produk */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-16 text-center text-[#52525B] text-xs font-bold">
          Tidak ada produk ditemukan dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod, idx) => (
            <MenuCard
              key={prod.id}
              prod={prod}
              idx={idx}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onQuickRestock={handleQuickRestock}
              canEditMenu={canEditMenu}
              canQuickRestock={canQuickRestock}
              ingredients={ingredients}
              subscriptionPlan={subscriptionPlan}
              businessType={businessType}
            />
          ))}
        </div>
      )}

      {/* Riwayat Perubahan Harga Beli Supplier (Khusus Mode Ritel) */}
      {isRetail && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                <History size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#141414]">
                  Riwayat Perubahan Harga Beli Supplier
                </h3>
                <p className="text-[11px] text-[#52525B] font-medium">
                  Log otomatis setiap perubahan harga beli SKU ritel untuk memantau tren margin.
                </p>
              </div>
            </div>
          </div>

          {retailPriceHistory.length === 0 ? (
            <p className="text-xs text-[#52525B] text-center py-6 font-medium">
              Belum ada perubahan harga beli produk ritel yang tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B]">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Produk / SKU</th>
                    <th className="py-2.5 px-3">Harga Lama → Baru</th>
                    <th className="py-2.5 px-3">Perubahan</th>
                    <th className="py-2.5 px-3">Petugas &amp; Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {retailPriceHistory.slice(0, 20).map((h) => (
                    <tr key={h.id} className="hover:bg-[#FAFAFA]">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#52525B]">
                        {new Date(h.changedAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#141414]">
                        {h.productName}
                        {h.sku && <span className="block font-mono text-[10px] text-[#52525B]">{h.sku}</span>}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-[#52525B]">Rp {Number(h.oldPrice).toLocaleString('id-ID')}</span>
                        {' → '}
                        <span className="font-bold text-[#141414]">Rp {Number(h.newPrice).toLocaleString('id-ID')}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            h.changePct > 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : h.changePct < 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-[#52525B] border-zinc-200'
                          }`}
                        >
                          {h.changePct > 0 ? <TrendingUp size={10} /> : h.changePct < 0 ? <TrendingDown size={10} /> : null}
                          {h.changePct > 0 ? `+${h.changePct}%` : `${h.changePct}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#52525B]">
                        <span className="font-bold text-[#141414]">{h.changedBy}</span> • {h.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <AnimatePresence>
        <MenuFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          ingredients={ingredients}
          subscriptionPlan={subscriptionPlan}
          businessType={businessType}
          availableCategories={categories.map((c) => c.name).filter((name) => name !== 'Semua')}
          onUpgradePlan={onUpgradePlan}
        />
      </AnimatePresence>
    </div>
  );
}

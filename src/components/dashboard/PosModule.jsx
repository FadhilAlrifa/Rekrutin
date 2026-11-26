import { useState } from 'react';
import { evaluateMenuStockStatus, getSmartUpsellRecommendations } from '../../utils/cogsCalculator';
import { ORDER_CHANNEL_LABELS } from '../../utils/orderStateMachine';
import { getProductFallbackImage } from '../../data/simulationCatalog';
import MerchantWorkflowModal from './pos/MerchantWorkflowModal';
import KitchenOrdersDrawer from './pos/KitchenOrdersDrawer';
import { OrderModificationModal, OrderCancelModal, CashierShiftModal } from './pos/OrderActionModals';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, CheckCircle2, MessageSquare, 
  Search, Trash2, Plus, Minus, CreditCard, Wallet, QrCode, AlertTriangle, ShieldAlert, Sparkles, ChefHat, SlidersHorizontal, UserCheck, X 
} from 'lucide-react';

export default function PosModule({
  products,
  ingredients = [],
  onCheckout,
  subscriptionPlan = 'pro',
  activeOutlet = 'Cabang Utama - Makassar',
  orders = [],
  merchantSettings = { defaultOrderChannel: 'dine_in', paymentFlow: 'pay_first', closedKitchenEnabled: true, requireCashierShift: true },
  onSaveMerchantSettings,
  currentOperator,
  onUpdateOperatorShift,
  onPlaceWorkflowOrder,
  onTransitionOrderKitchenStatus,
  onModifyOrder,
  onCancelOrder,
  onSettleOpenBill,
  onReceiveClosedKitchenDemo,
  isSimulationMode = false
}) {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteModalItem, setNoteModalItem] = useState(null);
  const [customNote, setCustomNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [successMsg, setSuccessMsg] = useState(false);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [posView, setPosView] = useState('catalog');
  const [orderChannel, setOrderChannel] = useState(merchantSettings?.defaultOrderChannel || 'dine_in');
  const [tableLabel, setTableLabel] = useState('');
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [modifyingOrder, setModifyingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [settlingBillOrder, setSettlingBillOrder] = useState(null);

  const isStarter = subscriptionPlan === 'starter';
  const businessType = merchantSettings?.businessType || 'fnb';
  const isRetailBusiness = businessType === 'retail';
  const isTakeAwayOnlyFnb =
    !isRetailBusiness && merchantSettings?.fnbServiceMode === 'take_away_only';
  const availableChannels = [
    ...(isTakeAwayOnlyFnb ? [] : [{ id: 'dine_in', label: 'Dine-In' }]),
    { id: 'take_away', label: 'Take-Away' },
    ...(merchantSettings?.closedKitchenEnabled
      ? [{ id: 'online_closed_kitchen', label: 'Online Order' }]
      : [])
  ];
  const effectiveOrderChannel = availableChannels.some((ch) => ch.id === orderChannel)
    ? orderChannel
    : availableChannels[0]?.id || 'take_away';
  const modeLabel = isRetailBusiness
    ? 'Toko Ritel'
    : isTakeAwayOnlyFnb
    ? 'F&B Take-Away'
    : 'F&B / Resto';
  const activeKitchenCount = orders.filter(
    (o) =>
      (o.kitchenStatus !== 'served' &&
        o.kitchenStatus !== 'cancelled' &&
        o.kitchenStatus !== 'cancelled_waste') ||
      (o.paymentStatus === 'unpaid' && o.kitchenStatus === 'served')
  ).length;
  const isPayLaterMode = !isStarter && merchantSettings?.paymentFlow === 'pay_later';

  const [stockAlertModal, setStockAlertModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const normalizePosCategory = (cat) =>
    isStarter && !isRetailBusiness && (cat === 'Bakery' || cat === 'Dessert') ? 'Makanan' : cat;

  const categories =
    isStarter && !isRetailBusiness
      ? ['Semua', 'Minuman', 'Makanan']
      : ['Semua', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const getSubDescription = (prod) => {
    if (isRetailBusiness || prod.productMode === 'retail') {
      const parts = [];
      if (prod.sku) parts.push(`SKU: ${prod.sku}`);
      if (prod.variantLabel) parts.push(prod.variantLabel);
      if (parts.length > 0) return parts.join(' • ');
      return `Produk ritel (${prod.unit || 'pcs'})`;
    }
    const name = prod.name.toLowerCase();
    if (name.includes('kopi') || name.includes('americano')) return 'Espresso shot & fresh milk';
    if (name.includes('croissant') || name.includes('pain')) return 'Freshly baked buttery pastry';
    if (name.includes('ricebowl') || name.includes('nasi') || name.includes('spaghetti')) return 'Disajikan hangat dengan saus pilihan';
    if (name.includes('matcha') || name.includes('tea')) return 'Premium Japanese leaf extract';
    if (name.includes('cake')) return 'Rich chocolate & soft sponge';
    return 'Menu pilihan favorit berkualitas';
  };

  const convertToStandardBase = (qty, unit) => {
    const u = (unit || '').toLowerCase().trim();
    const q = Number(qty) || 0;
    if (u === 'kg' || u === 'kilogram') return q * 1000;
    if (u === 'gram' || u === 'g') return q;
    if (u === 'liter' || u === 'l') return q * 1000;
    if (u === 'ml' || u === 'milliliter') return q;
    return q;
  };

  const calculateDeductionInStorageUnit = (neededQty, neededUnit, storageUnit) => {
    const neededBase = convertToStandardBase(neededQty, neededUnit);
    const storageUnitLower = (storageUnit || '').toLowerCase().trim();
    if (storageUnitLower === 'kg' || storageUnitLower === 'kilogram' || storageUnitLower === 'liter' || storageUnitLower === 'l') {
      return neededBase / 1000;
    }
    return neededBase;
  };

  // FUNGSI UTAMA: Mensimulasikan penambahan kuantitas item dan memeriksa apakah stok / kuota porsi mencukupi
  const validateCartWithNewItem = (currentCart, targetProduct, deltaQty) => {
    let simulatedCart = [...currentCart];
    const existingIndex = simulatedCart.findIndex(item => item.id === targetProduct.id);

    if (existingIndex >= 0) {
      const newQty = simulatedCart[existingIndex].qty + deltaQty;
      if (newQty <= 0) {
        simulatedCart.splice(existingIndex, 1);
      } else {
        simulatedCart[existingIndex] = { ...simulatedCart[existingIndex], qty: newQty };
      }
    } else if (deltaQty > 0) {
      simulatedCart.push({ ...targetProduct, qty: 1 });
    }

    if (isStarter) {
      for (const cartItem of simulatedCart) {
        const availableQuota = Math.max(0, Math.floor(Number(cartItem.stock ?? 0)));
        if (cartItem.qty > availableQuota) {
          return {
            isValid: false,
            exceededIngredient: cartItem.name,
            required: cartItem.qty,
            stock: availableQuota,
            unit: isRetailBusiness || cartItem.productMode === 'retail' ? (cartItem.unit || 'pcs') : 'porsi'
          };
        }
      }
      return { isValid: true };
    }

    const accumulatedDemand = {};

    for (const cartItem of simulatedCart) {
      const hasBomRecipe = Array.isArray(cartItem.recipe) && cartItem.recipe.length > 0;
      const isRetailItem = cartItem.productMode === 'retail' || (isRetailBusiness && !hasBomRecipe);

      if (isRetailItem) {
        const availableSkuStock = Number(cartItem.stock ?? 0);
        if (cartItem.qty > availableSkuStock) {
          return {
            isValid: false,
            exceededIngredient: cartItem.name,
            required: cartItem.qty,
            stock: availableSkuStock,
            unit: cartItem.unit || 'pcs'
          };
        }
        continue;
      }

      if (hasBomRecipe) {
        cartItem.recipe.forEach(req => {
          const reqClean = (req.name || '').split(' | ')[0].toLowerCase().trim();
          const foundIng = ingredients.find(
            ing => (ing.name || '').toLowerCase().includes(reqClean)
          );
          if (foundIng) {
            const ingKey = foundIng.name.toLowerCase().trim();
            const deductionPerPortion = calculateDeductionInStorageUnit(req.qty, req.unit, foundIng.unit);
            
            if (!accumulatedDemand[ingKey]) {
              accumulatedDemand[ingKey] = {
                name: (foundIng.name || '').split(' | ')[0],
                stock: foundIng.stock,
                unit: foundIng.unit,
                required: 0
              };
            }
            accumulatedDemand[ingKey].required += deductionPerPortion * cartItem.qty;
          }
        });
      }
    }

    for (let key in accumulatedDemand) {
      const demand = accumulatedDemand[key];
      if (demand.required > demand.stock) {
        return {
          isValid: false,
          exceededIngredient: demand.name,
          required: demand.required.toFixed(2),
          stock: demand.stock,
          unit: demand.unit
        };
      }
    }

    return { isValid: true };
  };

  // Hitung maksimal porsi / unit tersisa untuk satu produk mandiri
  const getMaxPossiblePortions = (product) => {
    if (isStarter) {
      return Math.max(0, Math.floor(Number(product?.stock ?? 0)));
    }
    const hasBomRecipe = Array.isArray(product?.recipe) && product.recipe.length > 0;
    if (product?.productMode === 'retail' || (isRetailBusiness && !hasBomRecipe)) {
      return Math.max(0, Math.floor(Number(product?.stock ?? 0)));
    }
    if (!hasBomRecipe) return 999;
    const safeIngredients = ingredients || [];
    let limits = [];

    for (let req of product.recipe) {
      const reqClean = (req.name || '').split(' | ')[0].toLowerCase().trim();
      const foundIng = safeIngredients.find(
        ing => (ing.name || '').toLowerCase().includes(reqClean)
      );
      if (!foundIng || foundIng.stock <= 0) return 0;

      const deductionPerPortion = calculateDeductionInStorageUnit(req.qty, req.unit, foundIng.unit);
      if (deductionPerPortion <= 0) continue;

      const possiblePortions = Math.floor(foundIng.stock / deductionPerPortion);
      limits.push(possiblePortions);
    }

    if (limits.length === 0) return 999;
    return Math.min(...limits);
  };

  const checkIsIngredientAvailable = (product) => {
    return getMaxPossiblePortions(product) > 0;
  };

  const addToCart = (product) => {
    const validation = validateCartWithNewItem(cart, product, 1);
    
    if (!validation.isValid) {
      setStockAlertModal({
        isOpen: true,
        title: isStarter ? 'Kuota Porsi Tidak Cukup' : 'Stok Bahan Gudang Tidak Cukup',
        message: isStarter
          ? `Sisa "${validation.exceededIngredient}" hanya ${validation.stock} ${validation.unit}. Tambah kuota porsi di Daftar Menu jika sudah belanja bahan.`
          : `Penghitungan kolektif gagal: Bahan "${validation.exceededIngredient}" di gudang tidak mencukupi untuk kombinasi pesanan ini. Stok tersedia: ${validation.stock} ${validation.unit}.`
      });
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1, note: '' }]);
    }
  };

  const updateQty = (id, delta) => {
    const targetItem = cart.find(item => item.id === id);
    if (!targetItem) return;

    const validation = validateCartWithNewItem(cart, targetItem, delta);

    if (!validation.isValid && delta > 0) {
      setStockAlertModal({
        isOpen: true,
        title: isStarter ? 'Batas Kuota Porsi Tercapai' : 'Batas Akumulasi Bahan Tercapai',
        message: isStarter
          ? `Jumlah "${validation.exceededIngredient}" sudah mencapai batas sisa (${validation.stock} ${validation.unit}).`
          : `Tidak dapat menambah jumlah pesanan karena bahan "${validation.exceededIngredient}" telah mencapai batas maksimal kombinasi di keranjang. Stok gudang: ${validation.stock} ${validation.unit}.`
      });
      return;
    }

    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return null;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));

  const saveNote = () => {
    setCart(cart.map(item => item.id === noteModalItem.id ? { ...item, note: customNote } : item));
    setNoteModalItem(null);
    setCustomNote('');
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const activeBillAmount = settlingBillOrder ? Number(settlingBillOrder.totalAmount || 0) : totalPrice;

  const handleProcessPayment = () => {
    if (cart.length === 0) return;

    if (merchantSettings?.requireCashierShift && !currentOperator?.shiftActive) {
      setShiftModalOpen(true);
      return;
    }

    if (isPayLaterMode) {
      const targetTable =
        tableLabel.trim() ||
        (effectiveOrderChannel === 'online_closed_kitchen'
          ? 'Online Order'
          : isTakeAwayOnlyFnb
          ? 'Take-Away Open Bill'
          : 'Meja Open Bill');

      if (onPlaceWorkflowOrder) {
        onPlaceWorkflowOrder({
          items: cart,
          orderChannel: effectiveOrderChannel,
          paymentFlow: 'pay_later',
          paymentMethod: 'open_bill',
          tableNumber: targetTable
        });
      } else {
        onCheckout(cart, targetTable, 'open_bill');
      }
      setCart([]);
      setTableLabel('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      return;
    }

    setSettlingBillOrder(null);
    if (paymentMethod === 'cash') {
      setCashModalOpen(true);
      setCashReceived('');
    } else {
      finalizeCheckout();
    }
  };

  const handleTriggerSettleOpenBill = (order) => {
    if (merchantSettings?.requireCashierShift && !currentOperator?.shiftActive) {
      setShiftModalOpen(true);
      return;
    }
    setSettlingBillOrder(order);
    setCashModalOpen(true);
    setCashReceived('');
  };

  const finalizeCheckout = (received = 0, overrideMethod = null) => {
    const usedMethod = overrideMethod || paymentMethod;
    const cashierName = currentOperator?.name || 'Kasir Aktif';

    if (settlingBillOrder) {
      const billTotal = Number(settlingBillOrder.totalAmount || 0);
      onSettleOpenBill?.(settlingBillOrder, usedMethod);
      const kembalian = usedMethod === 'cash' ? Math.max(0, received - billTotal) : 0;

      setReceiptData({
        orderNumber: settlingBillOrder.orderNumber,
        cart: [...(settlingBillOrder.items || [])],
        total: billTotal,
        paymentMethod: usedMethod,
        cashierName,
        orderChannelLabel: ORDER_CHANNEL_LABELS[settlingBillOrder.orderChannel] || 'Dine-In',
        outlet: settlingBillOrder.tableNumber || 'Open Bill',
        received: usedMethod === 'cash' ? received : billTotal,
        change: kembalian,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      });

      setSettlingBillOrder(null);
      setCashModalOpen(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      return;
    }

    const baseOutlet =
      subscriptionPlan === 'enterprise'
        ? `Kasir (${activeOutlet.replace('Semua Cabang (Terpusat)', 'Cabang Utama - Makassar')})`
        : isTakeAwayOnlyFnb
        ? 'Take-Away Counter'
        : 'Kasir Utama';
    const sourceLabel = tableLabel.trim() ? `${tableLabel.trim()} • ${baseOutlet}` : baseOutlet;

    const placedOrder = onPlaceWorkflowOrder
      ? onPlaceWorkflowOrder({
          items: cart,
          orderChannel: effectiveOrderChannel,
          paymentFlow: 'pay_first',
          paymentMethod: usedMethod,
          tableNumber: sourceLabel
        })
      : null;

    if (!onPlaceWorkflowOrder) {
      onCheckout(cart, sourceLabel, usedMethod);
    }

    const kembalian = usedMethod === 'cash' ? received - totalPrice : 0;

    setReceiptData({
      orderNumber: placedOrder?.orderNumber || `POS-${new Date().getTime().toString().slice(-5)}`,
      cart: [...cart],
      total: totalPrice,
      paymentMethod: usedMethod,
      cashierName,
      orderChannelLabel: ORDER_CHANNEL_LABELS[effectiveOrderChannel] || (isTakeAwayOnlyFnb ? 'Take-Away' : 'Dine-In'),
      outlet: sourceLabel,
      received: usedMethod === 'cash' ? received : totalPrice,
      change: kembalian,
      date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    });

    setCart([]);
    setTableLabel('');
    setCashModalOpen(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const upsellItems = isStarter
    ? []
    : getSmartUpsellRecommendations(cart, products, ingredients, 2, businessType);

  const activePosCategory = categories.includes(selectedCategory) ? selectedCategory : 'Semua';

  const filteredProducts = products.filter(p => {
    const matchesCategory =
      activePosCategory === 'Semua' || normalizePosCategory(p.category) === activePosCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.variantLabel || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-16">
      
      {/* 1. Header POS Light Editorial (posisi kontrol terkunci stabil antara tab Katalog & Dapur) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div className="min-w-0">
          {subscriptionPlan === 'enterprise' && (
            <div className="mb-2">
              <span className="text-[11px] font-bold text-[#52525B] bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full">
                {activeOutlet}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">Katalog Penjualan</h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            {isStarter
              ? 'Catat pesanan pelanggan. Porsi menu otomatis berkurang saat terjual dan muncul peringatan jika hampir habis.'
              : 'Pilih menu pesanan. Stok bahan atau barang otomatis dicek dan langsung terpotong saat transaksi.'}
          </p>
        </div>

        {!isStarter && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isSimulationMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setShiftModalOpen(true)}
                  className={`h-9 px-3 rounded-xl text-[11px] font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                    currentOperator?.shiftActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                  }`}
                >
                  <UserCheck size={13} className="shrink-0" />
                  <span>{currentOperator?.name || 'Verifikasi Shift'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkflowModalOpen(true)}
                  className="h-9 px-3 rounded-xl bg-white hover:bg-[#FAFAFA] border border-zinc-200 text-[#141414] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <SlidersHorizontal size={13} className="text-[#D97706] shrink-0" />
                  <span>
                    {modeLabel} • {isPayLaterMode ? 'Bayar Nanti' : 'Bayar di Awal'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <span className="h-9 px-3 rounded-xl text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap">
                  <UserCheck size={13} className="shrink-0" />
                  <span>{currentOperator?.name || 'Petugas Aktif'}</span>
                </span>

                <span className="h-9 px-3 rounded-xl bg-[#FAFAFA] border border-zinc-200 text-[#52525B] text-[11px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap">
                  {modeLabel} • {isPayLaterMode ? 'Bayar Nanti' : 'Bayar di Awal'}
                </span>
              </>
            )}

            <div className="h-9 flex items-center bg-zinc-200/70 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setPosView('catalog')}
                className={`h-7 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  posView === 'catalog'
                    ? 'bg-[#141414] text-[#F59E0B]'
                    : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                Katalog
              </button>
              <button
                type="button"
                onClick={() => setPosView('kitchen')}
                className={`h-7 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap tabular-nums ${
                  posView === 'kitchen'
                    ? 'bg-[#141414] text-[#F59E0B]'
                    : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <ChefHat size={12} className="shrink-0" />
                <span>Dapur &amp; Bill ({activeKitchenCount})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {posView === 'kitchen' && !isStarter ? (
        <KitchenOrdersDrawer
          orders={orders}
          merchantSettings={merchantSettings}
          onTransitionStatus={onTransitionOrderKitchenStatus}
          onOpenModify={(order) => setModifyingOrder(order)}
          onOpenCancel={(order) => setCancellingOrder(order)}
          onSettleOpenBill={handleTriggerSettleOpenBill}
          onReceiveClosedKitchenDemo={isSimulationMode ? onReceiveClosedKitchenDemo : undefined}
          onViewReceipt={(order) =>
            setReceiptData({
              orderNumber: order.orderNumber,
              cart: order.items || [],
              total: order.totalAmount || 0,
              paymentMethod: order.paymentMethod || 'cash',
              cashierName: order.cashierName || currentOperator?.name || 'Kasir Aktif',
              orderChannelLabel: ORDER_CHANNEL_LABELS[order.orderChannel] || 'Dine-In',
              outlet: order.tableNumber || 'Kasir',
              received: order.totalAmount || 0,
              change: 0,
              date: new Date(order.createdAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            })
          }
        />
      ) : (
        <>
          {/* 2. Toolbar Filter Kategori & Pencarian Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl overflow-x-auto hide-scrollbar w-fit max-w-full">
          {categories.map((cat, idx) => {
            const isActive = activePosCategory === cat;
            const catCount =
              cat === 'Semua'
                ? products.length
                : products.filter((p) => normalizePosCategory(p.category) === cat).length;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#141414] text-white shadow-sm'
                    : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <span>{cat}</span>
                <span className={`font-mono text-[10px] tabular-nums ${isActive ? 'text-[#F59E0B]' : 'text-zinc-400'}`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari menu pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 text-[#141414] text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* 3. Grid Menu dan Keranjang Penjualan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Katalog Produk (Kiri) */}
        <div className="lg:col-span-7 xl:col-span-8">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-[#52525B] text-xs font-medium space-y-2">
              <p className="font-bold text-[#141414] text-sm">Menu tidak ditemukan</p>
              <p>Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => {
                  const stockEval = evaluateMenuStockStatus(
                    prod,
                    ingredients,
                    businessType,
                    isStarter
                  );
                  const isAvailable = stockEval.status !== 'out' && checkIsIngredientAvailable(prod);
                  const isLowStock = isAvailable && stockEval.status === 'low';
                  const maxPortions = stockEval.maxPortions;
                  const unitSuffix =
                    isRetailBusiness || prod.productMode === 'retail' ? (prod.unit || 'pcs') : 'porsi';
                  const cartEntry = cart.find(item => item.id === prod.id);
                  const inCartQty = cartEntry ? cartEntry.qty : 0;

                  return (
                    <motion.div 
                      layout 
                      initial={{ opacity: 0, scale: 0.96 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.96 }} 
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} 
                      key={prod.id} 
                      onClick={() => isAvailable && addToCart(prod)} 
                      className={`bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all relative group ${
                        !isAvailable 
                          ? 'border-red-200 bg-red-50/20 opacity-60 cursor-not-allowed' 
                          : inCartQty > 0
                          ? 'border-[#F59E0B] ring-1 ring-[#F59E0B]/40 shadow-sm cursor-pointer'
                          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="relative h-36 w-full overflow-hidden bg-zinc-100">
                        <img 
                          src={prod.image || getProductFallbackImage(prod.name, prod.category)} 
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getProductFallbackImage(prod.name, prod.category);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="bg-white/95 text-[#141414] px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide border border-zinc-200 shadow-sm">
                            {normalizePosCategory(prod.category)}
                          </span>
                          {inCartQty > 0 && (
                            <span className="bg-[#F59E0B] text-[#141414] px-2 py-1 rounded-md font-mono text-[10px] font-extrabold shadow-sm">
                              {inCartQty}x
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm ${!isAvailable ? 'bg-red-600 text-white' : isLowStock ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' : 'bg-[#141414]/90 text-white'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!isAvailable ? 'bg-white' : isLowStock ? 'bg-[#F59E0B]' : 'bg-emerald-400'}`}></span>
                            {!isAvailable
                              ? 'Habis'
                              : isLowStock
                              ? `Menipis • Sisa ${maxPortions}`
                              : isStarter
                              ? `Sisa: ${maxPortions} ${unitSuffix}`
                              : maxPortions >= 999
                              ? 'Tersedia'
                              : isRetailBusiness || prod.productMode === 'retail'
                              ? `Stok: ${maxPortions} ${unitSuffix}`
                              : `Maks: ${maxPortions}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between space-y-3 flex-1 bg-white">
                        <div className="space-y-1">
                          <h3 className="font-bold text-[#141414] text-sm leading-snug group-hover:text-[#D97706] transition-colors line-clamp-1">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-[#52525B] font-medium line-clamp-1">
                            {getSubDescription(prod)}
                          </p>
                        </div>

                        {!isAvailable && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-1.5">
                            <AlertTriangle size={13} className="shrink-0" />{' '}
                            {isRetailBusiness || prod.productMode === 'retail'
                              ? 'Stok unit produk habis'
                              : isStarter
                              ? 'Kuota porsi menu habis'
                              : 'Stok bahan baku gudang habis'}
                          </div>
                        )}

                        {isLowStock && (
                          <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] px-2.5 py-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-1.5">
                            <AlertTriangle size={13} className="shrink-0" /> Stok menipis (sisa {maxPortions} {unitSuffix})
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100">
                          <span className="font-mono font-extrabold text-[#141414] text-sm">
                            Rp {prod.price.toLocaleString('id-ID')}
                          </span>
                          <button 
                            type="button"
                            disabled={!isAvailable}
                            aria-label={`Tambah ${prod.name}`}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              !isAvailable 
                                ? 'bg-zinc-100 text-zinc-400' 
                                : 'bg-[#141414] group-hover:bg-[#F59E0B] text-white group-hover:text-[#141414] active:scale-95'
                            }`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Keranjang Pesanan (Kanan) */}
        <div id="pos-cart-panel" className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col h-fit sticky top-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold border border-[#FDE68A]">
                <ShoppingCart size={17} />
              </div>
              <div>
                <h3 className="font-bold text-[#141414] text-sm">Keranjang Pesanan</h3>
                <p className="text-[10px] text-[#52525B] font-medium">Kasir Siap Dipakai</p>
              </div>
              <span className="ml-auto bg-[#141414] text-[#F59E0B] font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                {cart.reduce((t, i) => t + i.qty, 0)} Item
              </span>
            </div>

            {/* Daftar Item Keranjang */}
            <div className="min-h-[200px] max-h-[360px] overflow-y-auto pr-1 space-y-2.5 hide-scrollbar">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-44 flex flex-col items-center justify-center text-[#52525B] space-y-2 text-center p-4">
                    <ShoppingCart size={28} className="text-zinc-300" />
                    <p className="text-xs font-semibold text-[#141414]">Keranjang masih kosong</p>
                    <p className="text-[11px] text-[#52525B]">Pilih menu dari katalog di sebelah kiri untuk memulai pesanan.</p>
                  </motion.div>
                ) : (
                  cart.map(item => (
                    <motion.div 
                      layout 
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} 
                      key={item.id} 
                      className="bg-[#FAFAFA] border border-zinc-200 p-3 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-200" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#141414] leading-tight truncate">{item.name}</p>
                            <p className="text-[11px] font-mono font-bold text-[#52525B] mt-0.5">
                              Rp {(item.price * item.qty).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 shrink-0">
                          <button 
                            type="button"
                            aria-label={`Kurangi ${item.name}`}
                            onClick={() => updateQty(item.id, -1)} 
                            className="w-7 h-7 flex items-center justify-center bg-[#FAFAFA] hover:bg-zinc-100 rounded-md text-[#141414] cursor-pointer active:scale-95 transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono text-xs font-bold w-5 text-center text-[#141414]">{item.qty}</span>
                          <button 
                            type="button"
                            aria-label={`Tambah ${item.name}`}
                            onClick={() => updateQty(item.id, 1)} 
                            className="w-7 h-7 flex items-center justify-center bg-[#FAFAFA] hover:bg-zinc-100 rounded-md text-[#141414] cursor-pointer active:scale-95 transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-200/70 text-[11px]">
                        <span className="text-[#52525B] italic truncate max-w-[140px]">
                          {item.note ? `* ${item.note}` : 'Tanpa catatan dapur'}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => { setNoteModalItem(item); setCustomNote(item.note); }} 
                            className="text-[#D97706] font-bold hover:underline cursor-pointer"
                          >
                            Catatan
                          </button>
                          <button 
                            type="button"
                            aria-label={`Hapus ${item.name}`}
                            onClick={() => removeItem(item.id)} 
                            className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Smart Upselling Engine: Margin Tinggi + Stok Aman */}
            {cart.length > 0 && upsellItems.length > 0 && (
              <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-[#141414] leading-tight">
                      Tawarkan Tambahan ke Pelanggan
                    </p>
                    <p className="text-[10px] text-[#52525B] font-medium">
                      Untung besar &amp; stoknya masih aman
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upsellItems.map((u) => (
                    <div
                      key={u.product.id}
                      className="bg-white border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between gap-2.5 hover:border-[#F59E0B] transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#141414] truncate">
                            {u.product.name}
                          </span>
                          <span className="font-mono text-[9px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-1.5 py-0.5 rounded-md shrink-0">
                            Untung Besar • Stok Aman
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525B]">
                          <span className="font-bold text-[#141414]">
                            Rp {Number(u.sellingPrice || 0).toLocaleString('id-ID')}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            Margin {u.grossMarginPct}% (+Rp {Number(u.grossProfit || 0).toLocaleString('id-ID')})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(u.product)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#F59E0B] text-white hover:text-[#141414] text-[10px] font-extrabold shrink-0 transition-all cursor-pointer active:scale-95"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kanal Order & Nomor Meja / Antrean */}
            {!isStarter && (
              <div className="space-y-2 pt-1">
                <p className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#52525B]">
                  {isTakeAwayOnlyFnb ? 'Kanal Order Take-Away' : 'Kanal & Tujuan Order'}
                </p>
                <div
                  className={`grid gap-1.5 ${
                    availableChannels.length === 1
                      ? 'grid-cols-1'
                      : availableChannels.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {availableChannels.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setOrderChannel(ch.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                        effectiveOrderChannel === ch.id
                          ? 'bg-[#141414] text-[#F59E0B] border-[#141414]'
                          : 'bg-[#FAFAFA] text-[#52525B] border-zinc-200 hover:text-[#141414]'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={
                    isTakeAwayOnlyFnb
                      ? 'Nama Pelanggan / No. Antrean (Opsional)'
                      : 'No. Meja / Nama Pelanggan (Opsional)'
                  }
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            )}

            {/* Pilihan Metode Pembayaran */}
            {!isPayLaterMode && (
            <div className="space-y-1.5 pt-1">
              <p className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#52525B]">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setPaymentMethod('qris')} 
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'qris' 
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] shadow-sm' 
                      : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                  }`}
                >
                  <QrCode size={15} /> QRIS
                </button>
                <button 
                  onClick={() => setPaymentMethod('cash')} 
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'cash' 
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] shadow-sm' 
                      : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                  }`}
                >
                  <Wallet size={15} /> Tunai
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')} 
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'card' 
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] shadow-sm' 
                      : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                  }`}
                >
                  <CreditCard size={15} /> Kartu
                </button>
              </div>
            </div>

            )}

            {/* Total & Checkout */}
            <div className="border-t border-zinc-100 pt-3.5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#52525B] font-medium">Subtotal Produk</span>
                <span className="font-mono font-bold text-[#141414]">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-1.5 border-t border-zinc-100">
                <span className="text-[#141414]">Total Pembayaran</span>
                <span className="font-mono text-lg text-emerald-700 font-extrabold">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <AnimatePresence>
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.25 }} 
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600" /> {isStarter ? 'Transaksi Berhasil • Porsi menu berkurang' : 'Transaksi Sukses • Stok gudang terpotong'}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleProcessPayment} 
                disabled={cart.length === 0} 
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-[#141414] font-extrabold py-3.5 rounded-xl text-xs shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                {isPayLaterMode ? 'Simpan Open Bill & Kirim ke Dapur' : 'Proses Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      </div>

        </>
      )}

      {/* Mobile Floating Quick-Jump Cart Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-30">
          <button
            type="button"
            onClick={() => document.getElementById('pos-cart-panel')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full bg-[#141414] text-white border border-zinc-800 rounded-2xl px-4 py-3.5 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-[#141414] flex items-center justify-center font-extrabold text-xs font-mono">
                {cart.reduce((t, i) => t + i.qty, 0)}
              </div>
              <span className="text-xs font-bold">Lihat Keranjang & Bayar</span>
            </div>
            <span className="font-mono text-sm font-extrabold text-[#F59E0B]">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </button>
        </div>
      )}

      {/* MODAL CATATAN DAPUR */}
      <AnimatePresence>
        {noteModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNoteModalItem(null)} className="absolute inset-0 bg-zinc-950/40 cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[#141414] text-base flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#D97706]" /> Catatan Dapur
                </h4>
                <span className="font-mono text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] px-3 py-1 rounded-full border border-[#FDE68A]">{noteModalItem.name}</span>
              </div>
              <textarea 
                placeholder="Contoh: Kurang manis, tanpa es batu..." 
                value={customNote} 
                onChange={(e) => setCustomNote(e.target.value)} 
                rows={3} 
                className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3.5 text-xs font-medium text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 resize-none transition-all" 
              />
              <div className="flex justify-end gap-2.5 pt-1">
                <button onClick={() => setNoteModalItem(null)} className="px-4 py-2 text-xs font-bold text-[#52525B] hover:bg-zinc-100 rounded-lg cursor-pointer">Batal</button>
                <button onClick={saveNote} className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold rounded-lg shadow-sm cursor-pointer transition-colors">Simpan Catatan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ALERT STOK TIDAK CUKUP */}
      <AnimatePresence>
        {stockAlertModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockAlertModal({ ...stockAlertModal, isOpen: false })}
              className="absolute inset-0 bg-[#141414]/40 backdrop-blur-[4px] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.85 }}
              className="relative w-full max-w-[420px] bg-white rounded-3xl border border-[#E5E5E5] shadow-[0_24px_64px_-16px_rgba(20,20,20,0.22)] overflow-hidden"
            >
              <div className="h-1.5 w-full bg-red-600" />
              <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Validasi Stok
                </span>
                <button
                  type="button"
                  onClick={() => setStockAlertModal({ ...stockAlertModal, isOpen: false })}
                  aria-label="Tutup peringatan stok"
                  className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200/70 border border-[#E5E5E5] text-zinc-500 hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="px-6 pt-2 pb-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 ring-4 ring-red-50/80 flex items-center justify-center shrink-0">
                  <ShieldAlert size={22} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-[17px] font-extrabold text-[#141414] tracking-tight leading-snug">
                    {stockAlertModal.title}
                  </h3>
                  <p className="text-[13px] text-[#52525B] font-medium leading-relaxed mt-1.5">
                    {stockAlertModal.message}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setStockAlertModal({ ...stockAlertModal, isOpen: false })}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KEMBALIAN TUNAI DENGAN QUICK SHORTCUT BUTTONS */}
      <AnimatePresence>
        {cashModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-950/40 cursor-pointer" onClick={() => setCashModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-[#141414] text-base">{settlingBillOrder ? `Bayar Open Bill (${settlingBillOrder.orderNumber})` : 'Pembayaran Tunai'}</h3>
                {settlingBillOrder && (
                  <div className="grid grid-cols-2 gap-2 py-2">
                    <button
                      type="button"
                      onClick={() => finalizeCheckout(activeBillAmount, 'qris')}
                      className="py-2 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] text-[#B45309] text-xs font-extrabold cursor-pointer"
                    >
                      Bayar via QRIS
                    </button>
                    <button
                      type="button"
                      onClick={() => finalizeCheckout(activeBillAmount, 'card')}
                      className="py-2 rounded-xl bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-xs font-extrabold cursor-pointer"
                    >
                      Bayar via Kartu
                    </button>
                  </div>
                )}
                <p className="text-xs text-[#52525B] font-medium">Total Tagihan: <span className="font-mono font-extrabold text-[#D97706]">Rp {activeBillAmount.toLocaleString('id-ID')}</span></p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#52525B]">Nominal Uang Diterima (Rp)</label>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="Masukkan nominal uang" 
                  value={cashReceived} 
                  onChange={(e) => setCashReceived(e.target.value)} 
                  className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 text-base font-bold focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all text-center font-mono text-[#141414]"
                />

                {/* Tombol Cepat Nominal Uang (Quick Cash Buttons untuk Kemudahan Kasir) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCashReceived(String(activeBillAmount))}
                    className="py-1.5 px-2 bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived(String(amt))}
                      className="py-1.5 px-2 bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                    </button>
                  ))}
                </div>
              </div>

              {Number(cashReceived) >= activeBillAmount && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-0.5">
                  <p className="font-mono text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Kembalian</p>
                  <p className="font-mono text-lg text-emerald-700 font-extrabold">Rp {(Number(cashReceived) - activeBillAmount).toLocaleString('id-ID')}</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button onClick={() => setCashModalOpen(false)} className="w-full px-4 py-2.5 text-xs font-bold text-[#52525B] hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors">Batal</button>
                <button 
                  onClick={() => finalizeCheckout(Number(cashReceived), 'cash')} 
                  disabled={!cashReceived || Number(cashReceived) < activeBillAmount}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-[#141414] text-xs font-extrabold rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  Selesaikan Transaksi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL STRUK (RECEIPT) */}
      <AnimatePresence>
        {receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div id="receipt-content" className="p-6 bg-white overflow-y-auto no-scrollbar">
                <div className="text-center space-y-1 border-b border-dashed border-zinc-300 pb-4 mb-4">
                  <img src="/logo-stocko.png" alt="Stocko Logo" className="w-10 h-10 object-contain mx-auto mb-2 grayscale opacity-80" />
                  <h2 className="font-black text-xl text-zinc-900 tracking-tight">STOCKO.</h2>
                  <p className="text-[10px] text-zinc-500 font-medium">{receiptData.outlet || 'Sistem Kasir Pintar UMKM'}</p>
                  <p className="text-[10px] text-zinc-400">{receiptData.date}</p>
                  <p className="text-[10px] text-zinc-900 font-bold pt-1">
                    Kasir: {receiptData.cashierName || currentOperator?.name || 'Kasir Aktif'}
                  </p>
                  {(receiptData.orderNumber || receiptData.orderChannelLabel) && (
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {receiptData.orderNumber ? `${receiptData.orderNumber} • ` : ''}
                      {receiptData.orderChannelLabel || 'Dine-In'}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3 mb-4">
                  {receiptData.cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs font-medium text-zinc-700">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-[10px] text-zinc-400">{item.qty} x {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-mono">{(item.qty * item.price).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-zinc-300 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between font-black text-zinc-900 text-sm">
                    <span>Total</span>
                    <span className="font-mono">Rp {receiptData.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span className="uppercase text-[10px] font-black">{receiptData.paymentMethod}</span>
                    <span className="font-mono">Rp {receiptData.received.toLocaleString('id-ID')}</span>
                  </div>
                  {receiptData.paymentMethod === 'cash' && (
                    <div className="flex justify-between text-zinc-600 pt-1">
                      <span>Kembalian</span>
                      <span className="font-mono">Rp {receiptData.change.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="text-center mt-6 pt-4 border-t border-dashed border-zinc-300">
                  <p className="text-[10px] font-bold text-zinc-500">Terima Kasih</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
                <button 
                  onClick={() => {
                    const printContents = document.getElementById('receipt-content').innerHTML;
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(`
                      <html>
                        <head>
                          <style>
                            body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 10px; font-size: 12px; }
                            .text-center { text-align: center; }
                            .font-black { font-weight: bold; }
                            .text-xl { font-size: 18px; }
                            .text-sm { font-size: 14px; }
                            .text-xs { font-size: 12px; }
                            .text-\\[10px\\] { font-size: 10px; }
                            .font-medium { font-weight: 500; }
                            .font-mono { font-family: 'Courier New', Courier, monospace; }
                            .flex { display: flex; }
                            .justify-between { justify-content: space-between; }
                            .items-start { align-items: flex-start; }
                            .border-b { border-bottom: 1px dashed #000; }
                            .border-t { border-top: 1px dashed #000; }
                            .border-dashed { border-style: dashed; }
                            .pb-4 { padding-bottom: 16px; }
                            .mb-4 { margin-bottom: 16px; }
                            .pt-3 { padding-top: 12px; }
                            .pt-4 { padding-top: 16px; }
                            .pt-1 { padding-top: 4px; }
                            .space-y-1 > * + * { margin-top: 4px; }
                            .space-y-3 > * + * { margin-top: 12px; }
                            .mt-6 { margin-top: 24px; }
                            .uppercase { text-transform: uppercase; }
                            img { display: none; }
                            p { margin: 0; }
                            * { color: #000 !important; }
                          </style>
                        </head>
                        <body>
                          <div style="max-width: 300px; margin: 0 auto;">
                            ${printContents}
                          </div>
                        </body>
                      </html>
                    `);
                    iframe.contentWindow.document.close();
                    
                    setTimeout(() => {
                      iframe.contentWindow.focus();
                      iframe.contentWindow.print();
                      setTimeout(() => {
                        document.body.removeChild(iframe);
                      }, 1000);
                    }, 300);
                  }} 
                  className="flex-1 bg-white border border-zinc-200 text-zinc-700 text-xs font-black py-3 rounded-xl shadow-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cetak Struk
                </button>
                <button 
                  onClick={() => setReceiptData(null)} 
                  className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold py-3 rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Selesai
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PENGATURAN ALUR TOKO & DAPUR */}
      <MerchantWorkflowModal
        key={workflowModalOpen ? 'wf-open' : 'wf-closed'}
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        settings={merchantSettings}
        onSave={(next) => {
          onSaveMerchantSettings?.(next);
          if (next?.defaultOrderChannel) setOrderChannel(next.defaultOrderChannel);
        }}
      />

      {/* MODAL AUTENTIKASI SHIFT KASIR */}
      <CashierShiftModal
        key={shiftModalOpen ? 'shift-open' : 'shift-closed'}
        isOpen={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        currentOperator={currentOperator}
        onVerifyShift={(op) => onUpdateOperatorShift?.(op)}
      />

      {/* MODAL NOTA CORET / REVISI ITEM */}
      {modifyingOrder && (
        <OrderModificationModal
          key={`${modifyingOrder.id}-${modifyingOrder.kitchenStatus}`}
          order={modifyingOrder}
          products={products}
          ingredients={ingredients}
          onClose={() => setModifyingOrder(null)}
          onConfirm={(payload) => {
            onModifyOrder?.(payload);
            setModifyingOrder(null);
          }}
        />
      )}

      {/* MODAL PEMBATALAN ORDER (KONDISI A VS KONDISI B) */}
      {cancellingOrder && (
        <OrderCancelModal
          key={`${cancellingOrder.id}-${cancellingOrder.kitchenStatus}`}
          order={cancellingOrder}
          ingredients={ingredients}
          onClose={() => setCancellingOrder(null)}
          onConfirm={(payload) => {
            onCancelOrder?.(payload);
            setCancellingOrder(null);
          }}
        />
      )}
    </div>
  );
}

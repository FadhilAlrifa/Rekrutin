import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Building2, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import LandingPage from './components/landing/LandingPage';
import Register from './Page/auth/Register';
import Login from './Page/auth/Login';
import DashboardNavbar from './components/dashboard/DashboardNavbar';
import PosModule from './components/dashboard/PosModule';
import MenuManagementModule from './components/dashboard/menu/MenuManagementModal';
import InventoryModule from './components/dashboard/inventory/InventoryModule';
import AlertsModule from './components/dashboard/AlertsModule';
import ReportingModule from './components/dashboard/reporting/ReportingModule';
import ProfitabilityAiModule from './components/dashboard/reporting/ProfitabilityAiModule';
import SeasonalAnalyticsModule from './components/dashboard/reporting/SeasonalAnalyticsModule';
import AuditTrailModule from './components/dashboard/audit/AuditTrailModule';
import SelfOrderModule from './components/dashboard/self-order/SelfOrderModule';
import EmployeeModule from './components/dashboard/employee/EmployeeModule';
import { supabase } from './services/supabaseClient';
import {
  fetchProducts,
  fetchIngredients,
  saveTransaction,
  updateIngredientStock,
  fetchPriceHistory,
  updateIngredientPrice,
  seedMarketPricesForMissing,
  recordStockMutationLog,
  DEFAULT_MERCHANT_SETTINGS,
  fetchMerchantSettings,
  saveMerchantSettings,
  fetchOrders,
  createOrderRecord,
  updateOrderRecord,
  fetchAuditLogs,
  recordAuditLog,
  fetchStockMovements,
  recordStockMovement,
  fetchSeasonalEvents,
  clearUnavailableTablesCache
} from './services/stockoService';
import {
  fetchStaffProfiles,
  resolveAuthenticatedEmployeeProfile,
  recordEmployeeSessionEvent
} from './services/employeeAuditService';
import {
  createOrderPayload,
  computeBomRequirementsForItems,
  resolveOrderCancellation,
  resolveOrderModification
} from './utils/orderStateMachine';
import { DEFAULT_SEASONAL_EVENTS } from './utils/seasonalForecasting';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('pos');

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [userRole, setUserRole] = useState('superadmin');

  // Iterasi 2 States: Operator Shift, Workflow Settings, Orders/KDS, Audit Trail & Seasonal Events
  const [currentOperator, setCurrentOperator] = useState({
    id: 'OP-SHIFT-DEFAULT',
    name: 'Kasir Shift Utama',
    role: 'superadmin',
    shiftActive: true
  });
  const [merchantSettings, setMerchantSettings] = useState(DEFAULT_MERCHANT_SETTINGS);
  const [orders, setOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [seasonalEvents, setSeasonalEvents] = useState(DEFAULT_SEASONAL_EVENTS);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const activeSessionIdRef = useRef(null);

  const refreshAuditData = async () => {
    setIsRefreshingAudit(true);
    clearUnavailableTablesCache();
    const [dbAudit, dbMovements, staffRes] = await Promise.all([
      fetchAuditLogs(),
      fetchStockMovements(),
      fetchStaffProfiles()
    ]);
    if (Array.isArray(dbAudit)) setAuditLogs(dbAudit);
    if (Array.isArray(dbMovements)) setStockMovements(dbMovements);
    if (staffRes?.success && Array.isArray(staffRes.data)) setStaffProfiles(staffRes.data);
    setIsRefreshingAudit(false);
  };

  const handleChangeTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'audit-trail') {
      refreshAuditData();
    }
  };

  // State Paket Langganan ('starter' | 'pro' | 'enterprise') - Default 'pro' (Core Product)
  const [subscriptionPlan, setSubscriptionPlan] = useState('pro');
  // State Cabang Aktif (Khusus Paket Enterprise / Multi-Outlet)
  const [activeOutlet, setActiveOutlet] = useState('Semua Cabang (Terpusat)');

  // State Riwayat Mutasi Stok (Keluar-Masuk Gudang & Antar-Cabang)
  const [stockLogs, setStockLogs] = useState(() => [
    {
      id: 'LOG-INIT-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      itemName: 'Biji Kopi Arabika',
      type: 'TRANSFER CENTRAL KITCHEN',
      qty: '+5 kg',
      outlet: 'Cabang Utama - Makassar',
      note: 'Pasokan rutin mingguan dari Gudang Pusat'
    },
    {
      id: 'LOG-INIT-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      itemName: 'Susu Segar UHT',
      type: 'MASUK (Restock Supplier)',
      qty: '+12 liter',
      outlet: 'Cabang 2 - Bandung',
      note: 'Penerimaan faktur supplier pagi'
    },
    {
      id: 'LOG-INIT-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      itemName: 'Biji Kopi Arabika',
      type: 'KELUAR (Otomatis BOM POS)',
      qty: '-0.036 kg',
      outlet: 'Cabang Utama - Makassar',
      note: 'Pemotongan otomatis penjualan 2x Kopi Susu'
    }
  ]);

  const resolvedOutletLabel =
    activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet;

  const handleAddStockLog = (newLog) => {
    setStockLogs((prev) => [newLog, ...prev]);
  };

  const handleRecordAudit = async (payload) => {
    const auditRecord = await recordAuditLog({
      userId: currentOperator?.id || 'operator-active',
      userName: currentOperator?.name || 'Admin Operasional',
      role: currentOperator?.role || userRole,
      outlet: resolvedOutletLabel,
      ...payload
    });
    setAuditLogs((prev) => [auditRecord, ...prev]);

    if (payload.movementType) {
      const mov = await recordStockMovement({
        ingredientId: payload.entityId || null,
        ingredientName: payload.entityName || 'Bahan Baku',
        movementType: payload.movementType,
        qtyChange: payload.qtyChange || 0,
        beforeStock: payload.beforeStock ?? 0,
        afterStock: payload.afterStock ?? 0,
        unit: payload.unit || 'pcs',
        costImpact: payload.costImpact || 0,
        orderId: payload.orderId || null,
        userId: currentOperator?.id || 'operator-active',
        userName: currentOperator?.name || 'Admin Operasional',
        role: currentOperator?.role || userRole,
        reason: payload.reason || ''
      });
      setStockMovements((prev) => [mov, ...prev]);
    }
  };

  const handleUpdateIngredientPrice = async (arg1, arg2, arg3) => {
    const ingredient = arg1?.ingredient ? arg1.ingredient : arg1;
    const newPrice = arg1?.ingredient ? arg1.newPrice : arg2;
    const notes = arg1?.ingredient ? arg1.notes : arg3;

    const oldPrice = Number(ingredient?.unitPrice ?? ingredient?.unit_price ?? 0);
    const res = await updateIngredientPrice({ ingredient, newPrice, notes });
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === ingredient.id ? { ...ing, unitPrice: Number(newPrice) } : ing
      )
    );
    if (res?.entry) {
      setPriceHistory((prev) => [res.entry, ...prev]);
    }

    await handleRecordAudit({
      actionType: 'Price Update',
      entityType: 'ingredient',
      entityId: ingredient?.id,
      entityName: String(ingredient?.name || '').split(' | ')[0],
      beforeValue: `Rp ${oldPrice.toLocaleString('id-ID')}`,
      afterValue: `Rp ${Number(newPrice || 0).toLocaleString('id-ID')}`,
      deltaLabel: res?.entry?.changePct
        ? `${res.entry.changePct > 0 ? `+${res.entry.changePct}%` : `${res.entry.changePct}%`}`
        : '',
      reason: notes || 'Pembaruan harga pasar bahan baku'
    });

    return res;
  };

  const handleBatchFillMarketPrices = async () => {
    const res = await seedMarketPricesForMissing(ingredients);
    if (res?.updated && res.updated.length > 0) {
      setIngredients(res.updated);
    }
    if (res?.entries && res.entries.length > 0) {
      setPriceHistory((prev) => [...res.entries, ...prev]);
    }
    return res;
  };

  const applyStockDeltas = async (
    deltas = [],
    { movementType, actionType, reason, orderId, logType, isAddition = false }
  ) => {
    if (subscriptionPlan === 'starter' || !Array.isArray(deltas) || deltas.length === 0) {
      return;
    }

    let updatedIngredients = [...ingredients];
    const newLogs = [];

    for (const d of deltas) {
      const idx = updatedIngredients.findIndex((ing) => String(ing.id) === String(d.ingredientId));
      if (idx < 0) continue;

      const cur = updatedIngredients[idx];
      const deltaSigned = isAddition ? Math.abs(Number(d.amount || 0)) : -Math.abs(Number(d.amount || 0));
      const beforeStock = Number(cur.stock) || 0;
      const afterStock = Math.max(0, Number((beforeStock + deltaSigned).toFixed(3)));

      updatedIngredients[idx] = { ...cur, stock: afterStock };
      await updateIngredientStock(cur.id, afterStock);

      const cleanName = String(cur.name || '').split(' | ')[0];
      const logEntry = {
        id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        itemName: cleanName,
        type: logType,
        qty: `${deltaSigned >= 0 ? `+${deltaSigned}` : deltaSigned} ${cur.unit}`,
        outlet: resolvedOutletLabel,
        note: reason
      };
      newLogs.push(logEntry);
      recordStockMutationLog({ ...logEntry, ingredientId: cur.id });

      await handleRecordAudit({
        actionType,
        entityType: 'ingredient',
        entityId: cur.id,
        entityName: cleanName,
        beforeValue: `${beforeStock} ${cur.unit}`,
        afterValue: `${afterStock} ${cur.unit}`,
        deltaLabel: `${deltaSigned >= 0 ? `+${deltaSigned}` : deltaSigned} ${cur.unit}`,
        reason,
        movementType,
        qtyChange: deltaSigned,
        beforeStock,
        afterStock,
        unit: cur.unit,
        costImpact: movementType === 'WASTE_LOSS' ? Math.round(Math.abs(deltaSigned) * Number(cur.unitPrice || 0)) : 0,
        orderId
      });
    }

    setIngredients(updatedIngredients);
    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }
  };

  const checkUserRole = async (user) => {
    if (!user?.id) return;
    const profile = await resolveAuthenticatedEmployeeProfile(user);
    if (!profile) return;

    if (!profile.hasRoleAccess || profile.isActive === false) {
      await recordEmployeeSessionEvent({
        userId: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        outletName: profile.outletName,
        eventType: 'blocked_inactive'
      });
      setAuthNotice(
        profile.isActive === false
          ? `Akun karyawan atas nama "${profile.fullName}" berstatus nonaktif / resign. Hubungi Owner untuk aktivasi.`
          : 'Akses karyawan telah dicabut. Hubungi Owner/Admin.'
      );
      await supabase.auth.signOut();
      setUserRole('superadmin');
      setCurrentView('login');
      return;
    }

    setAuthNotice('');
    setUserRole(profile.role);
    setCurrentOperator({
      id: profile.id,
      name: profile.fullName,
      email: profile.email,
      role: profile.role,
      outlet: profile.outletName,
      shiftActive: true,
      isAuthenticatedEmployee: profile.role === 'kasir' || profile.role === 'stocker'
    });

    if (!activeSessionIdRef.current) {
      const ses = await recordEmployeeSessionEvent({
        userId: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        outletName: profile.outletName,
        eventType: 'login'
      });
      activeSessionIdRef.current = ses?.id || null;
    }

    if (profile.role === 'stocker') {
      setActiveTab('inventory');
    } else {
      setActiveTab('pos');
    }
  };

  useEffect(() => {
    async function loadBackendData() {
      const [
        dbProducts,
        dbIngredients,
        historyRes,
        savedSettings,
        dbOrders,
        dbAudit,
        dbMovements,
        dbEvents,
        staffRes
      ] = await Promise.all([
        fetchProducts(),
        fetchIngredients(),
        fetchPriceHistory(),
        fetchMerchantSettings(),
        fetchOrders(),
        fetchAuditLogs(),
        fetchStockMovements(),
        fetchSeasonalEvents(),
        fetchStaffProfiles()
      ]);

      if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
      if (dbIngredients && dbIngredients.length > 0) setIngredients(dbIngredients);
      if (historyRes?.data) setPriceHistory(historyRes.data);
      if (savedSettings) setMerchantSettings(savedSettings);
      if (Array.isArray(dbOrders)) setOrders(dbOrders);
      if (Array.isArray(dbAudit)) setAuditLogs(dbAudit);
      if (Array.isArray(dbMovements)) setStockMovements(dbMovements);
      if (Array.isArray(dbEvents) && dbEvents.length > 0) setSeasonalEvents(dbEvents);
      if (staffRes?.success && Array.isArray(staffRes.data)) setStaffProfiles(staffRes.data);
    }
    loadBackendData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRole(session.user);
        setCurrentView('app');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkUserRole(session.user);
        setCurrentView('app');
      } else if (event === 'SIGNED_OUT') {
        setCurrentView('landing');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkExpiryAlert = (dateString) => {
    if (!dateString) return false;
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const lowStockIngredients = ingredients.filter(
    (ing) => Number(ing.stock) <= Number(ing.minLimit ?? 5)
  );
  const lowStockCount = lowStockIngredients.length;
  const alertCount = ingredients.filter(
    (ing) => Number(ing.stock) <= Number(ing.minLimit ?? 5) || checkExpiryAlert(ing.expiryDate)
  ).length;

  const handleCheckout = async (cartItems, tableNumber = 'Kasir Utama', paymentMethod = 'cash') => {
    const reqs = computeBomRequirementsForItems(cartItems, ingredients);
    await applyStockDeltas(reqs, {
      movementType: 'BOM_SALE',
      actionType: 'Stock Out',
      reason: `Penjualan POS (${tableNumber})`,
      orderId: null,
      logType: 'KELUAR (Otomatis BOM POS)',
      isAddition: false
    });

    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    await saveTransaction(currentSubtotal, cartItems, tableNumber, paymentMethod, {
      orderChannel: 'dine_in',
      paymentFlow: 'pay_first',
      paymentStatus: 'paid',
      kitchenStatus: 'served',
      cashierId: currentOperator?.id,
      cashierName: currentOperator?.name || 'Kasir Aktif'
    });
  };

  const handleSaveMerchantSettings = async (nextSettings) => {
    const saved = await saveMerchantSettings(nextSettings, currentOperator?.name || 'Owner');
    setMerchantSettings(saved);
  };

  const handlePlaceWorkflowOrder = ({
    items,
    orderChannel,
    paymentFlow,
    paymentMethod,
    tableNumber,
    isClosedKitchenOrder = false
  }) => {
    const order = createOrderPayload({
      items,
      orderChannel,
      paymentFlow,
      paymentMethod,
      tableNumber,
      operator: currentOperator,
      outlet: resolvedOutletLabel,
      isClosedKitchenOrder
    });

    // Untuk order langsung dari POS (Pay First atau Pay Later preparing), potong stok BOM saat masuk proses
    const shouldDeductNow =
      subscriptionPlan !== 'starter' &&
      (order.kitchenStatus === 'preparing' || order.paymentFlow === 'pay_first') &&
      !isClosedKitchenOrder;

    const finalOrder = { ...order, stockDeducted: shouldDeductNow };
    setOrders((prev) => [finalOrder, ...prev]);
    createOrderRecord(finalOrder);

    if (shouldDeductNow) {
      const reqs = computeBomRequirementsForItems(items, ingredients);
      applyStockDeltas(reqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Order ${finalOrder.orderNumber} (${finalOrder.paymentFlow === 'pay_later' ? 'Open Bill / Preparing' : 'Pay First'})`,
        orderId: finalOrder.id,
        logType: 'KELUAR (Otomatis BOM POS)',
        isAddition: false
      });
    }

    if (finalOrder.paymentStatus === 'paid' && !isClosedKitchenOrder) {
      saveTransaction(finalOrder.totalAmount, finalOrder.items, finalOrder.tableNumber, finalOrder.paymentMethod, {
        orderChannel: finalOrder.orderChannel,
        paymentFlow: finalOrder.paymentFlow,
        paymentStatus: 'paid',
        kitchenStatus: finalOrder.kitchenStatus,
        cashierId: finalOrder.cashierId,
        cashierName: finalOrder.cashierName
      });
    }

    return finalOrder;
  };

  const handleTransitionOrderKitchenStatus = async (order, nextStatus) => {
    if (!order) return;
    let nextStockDeducted = order.stockDeducted;

    // Jika masuk ke 'preparing' (misal order Closed Kitchen baru mulai dimasak), potong stok bahan sekarang
    if (nextStatus === 'preparing' && !order.stockDeducted && subscriptionPlan !== 'starter') {
      const reqs = computeBomRequirementsForItems(order.items, ingredients);
      await applyStockDeltas(reqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Mulai masak order ${order.orderNumber} (${order.orderChannel})`,
        orderId: order.id,
        logType: 'KELUAR (Dapur Preparing BOM)',
        isAddition: false
      });
      nextStockDeducted = true;
    }

    const updated = {
      ...order,
      kitchenStatus: nextStatus,
      orderStatus: nextStatus === 'served' && order.paymentStatus === 'paid' ? 'closed' : order.orderStatus,
      stockDeducted: nextStockDeducted,
      updatedAt: new Date().toISOString()
    };

    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    await updateOrderRecord(updated);
  };

  const handleModifyOrder = async ({ order, nextItems, reason, treatRemovedAsWaste }) => {
    const { updatedOrder, revisionEntry, bomDeltas, addedWasteCost } = resolveOrderModification({
      order,
      nextItems,
      reason,
      operator: currentOperator,
      ingredients,
      treatRemovedAsWaste
    });

    setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    await updateOrderRecord(updatedOrder);

    await handleRecordAudit({
      actionType: 'Order Modified',
      entityType: 'order',
      entityId: order.id,
      entityName: `Nota Coret ${order.orderNumber}`,
      beforeValue: `Rp ${revisionEntry.beforeTotal.toLocaleString('id-ID')}`,
      afterValue: `Rp ${revisionEntry.afterTotal.toLocaleString('id-ID')}`,
      deltaLabel: revisionEntry.summary,
      reason
    });

    if (order.stockDeducted && subscriptionPlan !== 'starter' && bomDeltas.length > 0) {
      for (const delta of bomDeltas) {
        if (delta.deltaAmount > 0) {
          // Penambahan item susulan -> potong tambahan stok
          await applyStockDeltas(
            [{ ...delta, amount: delta.deltaAmount }],
            {
              movementType: 'BOM_SALE',
              actionType: 'Stock Out',
              reason: `Item susulan Nota Coret ${order.orderNumber}: ${reason}`,
              orderId: order.id,
              logType: 'KELUAR (Item Susulan Order)',
              isAddition: false
            }
          );
        } else if (delta.deltaAmount < 0 && !treatRemovedAsWaste) {
          // Item dicoret sebelum dimasak -> kembalikan stok ke gudang
          await applyStockDeltas(
            [{ ...delta, amount: Math.abs(delta.deltaAmount) }],
            {
              movementType: 'RESTOCK_REVERSAL',
              actionType: 'Stock In',
              reason: `Pengembalian bahan Nota Coret ${order.orderNumber}: ${reason}`,
              orderId: order.id,
              logType: 'MASUK (Reversal Nota Coret)',
              isAddition: true
            }
          );
        }
      }
    }

    if (addedWasteCost > 0) {
      const mv = await recordStockMovement({
        ingredientId: null,
        ingredientName: `Waste Nota Coret (${order.orderNumber})`,
        movementType: 'WASTE_LOSS',
        qtyChange: 0,
        beforeStock: 0,
        afterStock: 0,
        unit: 'porsi',
        costImpact: addedWasteCost,
        orderId: order.id,
        userId: currentOperator?.id,
        userName: currentOperator?.name,
        role: currentOperator?.role,
        reason
      });
      setStockMovements((prev) => [mv, ...prev]);
    }
  };

  const handleCancelOrder = async ({ order, condition, reason }) => {
    const { updatedOrder, stockAction, wasteCost, bomRequirements } = resolveOrderCancellation({
      order,
      condition,
      reason,
      operator: currentOperator,
      ingredients
    });

    setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    await updateOrderRecord(updatedOrder);

    await handleRecordAudit({
      actionType: 'Order Void/Cancelled',
      entityType: 'order',
      entityId: order.id,
      entityName: `${order.orderNumber} (${condition === 'after_cooking' ? 'Pasca-Proses/Waste' : 'Pra-Masak'})`,
      beforeValue: `Rp ${Number(order.totalAmount || 0).toLocaleString('id-ID')}`,
      afterValue:
        condition === 'after_cooking'
          ? `Rp 0 (Waste: Rp ${wasteCost.toLocaleString('id-ID')})`
          : 'Rp 0 (Stok Utuh)',
      deltaLabel: updatedOrder.paymentStatus === 'refunded' ? 'Refund' : 'Void',
      reason
    });

    if (stockAction === 'restore') {
      await applyStockDeltas(bomRequirements, {
        movementType: 'RESTOCK_REVERSAL',
        actionType: 'Stock In',
        reason: `Pembatalan pra-masak ${order.orderNumber}: ${reason}`,
        orderId: order.id,
        logType: 'MASUK (Reversal Order Batal)',
        isAddition: true
      });
    } else if (stockAction === 'deduct_as_waste') {
      await applyStockDeltas(bomRequirements, {
        movementType: 'WASTE_LOSS',
        actionType: 'Stock Out',
        reason: `Waste pembatalan pasca-produksi ${order.orderNumber}: ${reason}`,
        orderId: order.id,
        logType: 'WASTE (Order Batal Pasca-Masak)',
        isAddition: false
      });
    } else if (stockAction === 'keep_as_waste') {
      const mv = await recordStockMovement({
        ingredientId: null,
        ingredientName: `Waste Order ${order.orderNumber}`,
        movementType: 'WASTE_LOSS',
        qtyChange: 0,
        beforeStock: 0,
        afterStock: 0,
        unit: 'order',
        costImpact: wasteCost,
        orderId: order.id,
        userId: currentOperator?.id,
        userName: currentOperator?.name,
        role: currentOperator?.role,
        reason
      });
      setStockMovements((prev) => [mv, ...prev]);

      await saveTransaction(0, updatedOrder.items, updatedOrder.tableNumber, 'refund_waste', {
        orderChannel: updatedOrder.orderChannel,
        paymentFlow: updatedOrder.paymentFlow,
        paymentStatus: updatedOrder.paymentStatus,
        kitchenStatus: 'cancelled_waste',
        cashierId: currentOperator?.id,
        cashierName: currentOperator?.name || 'Kasir Aktif',
        wasteCost,
        cancelReason: reason,
        revisionHistory: updatedOrder.revisionHistory
      });
    }
  };

  const handleSettleOpenBill = async (order, method = 'cash') => {
    const updated = {
      ...order,
      paymentStatus: 'paid',
      orderStatus: order.kitchenStatus === 'served' ? 'closed' : 'active',
      paymentMethod: method,
      cashierId: currentOperator?.id,
      cashierName: currentOperator?.name || order.cashierName || 'Kasir Aktif',
      updatedAt: new Date().toISOString()
    };

    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    await updateOrderRecord(updated);

    await saveTransaction(updated.totalAmount, updated.items, updated.tableNumber, method, {
      orderChannel: updated.orderChannel,
      paymentFlow: 'pay_later',
      paymentStatus: 'paid',
      kitchenStatus: updated.kitchenStatus,
      cashierId: updated.cashierId,
      cashierName: updated.cashierName,
      revisionHistory: updated.revisionHistory
    });
  };

  const handleReceiveClosedKitchenDemo = () => {
    if (!products || products.length === 0) return;
    const sampleItem = products[0];
    handlePlaceWorkflowOrder({
      items: [{ ...sampleItem, qty: 1, note: 'Order Online Closed Kitchen' }],
      orderChannel: 'online_closed_kitchen',
      paymentFlow: 'pay_first',
      paymentMethod: 'qris',
      tableNumber: 'Online / Grab-GoFood',
      isClosedKitchenOrder: true
    });
  };

  // Komponen Tampilan Pengunci Fitur saat berada di Paket Starter
  const renderStarterLockedFeature = (featureTitle, featureDesc, highlights) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm max-w-3xl mx-auto my-8 text-center space-y-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center mx-auto">
        <Lock size={26} />
      </div>
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] px-3.5 py-1 rounded-full bg-[#141414] text-[#F59E0B]">
          <ShieldCheck size={13} /> Fitur Paket Pro & Enterprise
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#141414] tracking-tight pt-1">
          {featureTitle}
        </h2>
        <p className="text-xs md:text-sm text-[#52525B] font-medium max-w-xl mx-auto leading-relaxed">
          {featureDesc}
        </p>
      </div>

      <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52525B]">
          Keunggulan yang Akan Terbuka:
        </p>
        {highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs font-semibold text-[#141414]">
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={12} />
            </div>
            <span>{h}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setSubscriptionPlan('pro')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-bold text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
        >
          Aktifkan Paket Pro (Rp149.000/bln)
        </button>
        <button
          onClick={() => setSubscriptionPlan('enterprise')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141414] hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all"
        >
          Coba Paket Enterprise (Multi-Outlet)
        </button>
      </div>
    </motion.div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-screen"
          >
            <LandingPage
              onOpenApp={() => setCurrentView('app')}
              onOpenRegister={() => setCurrentView('register')}
              onOpenLogin={() => setCurrentView('login')}
              onSelectPlan={(planId) => {
                setSubscriptionPlan(planId);
                setCurrentView('register');
              }}
              onSimulatePlan={(planId) => {
                setSubscriptionPlan(planId);
                setCurrentView('app');
              }}
            />
          </motion.div>
        );

      case 'register':
        return (
          <motion.div
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-screen"
          >
            <Register
              key={subscriptionPlan}
              onBack={() => setCurrentView('landing')}
              onOpenLogin={() => setCurrentView('login')}
              initialPlan={subscriptionPlan}
              onPlanChange={setSubscriptionPlan}
            />
          </motion.div>
        );

      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-screen"
          >
            <Login
              onBack={() => setCurrentView('landing')}
              onOpenRegister={() => setCurrentView('register')}
              onLoginSuccess={() => {
                setAuthNotice('');
                setCurrentView('app');
              }}
              externalError={authNotice}
            />
          </motion.div>
        );

      case 'app':
      default:
        return (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans flex flex-col lg:flex-row relative selection:bg-[#F59E0B] selection:text-[#141414]">
              {/* Navbar Samping */}
              <DashboardNavbar
                activeTab={activeTab}
                setActiveTab={handleChangeTab}
                alertCount={alertCount}
                lowStockCount={lowStockCount}
                userRole={userRole}
                subscriptionPlan={subscriptionPlan}
                setSubscriptionPlan={setSubscriptionPlan}
                onBackToLanding={async () => {
                  if (activeSessionIdRef.current) {
                    await recordEmployeeSessionEvent({
                      sessionId: activeSessionIdRef.current,
                      eventType: 'logout'
                    });
                    activeSessionIdRef.current = null;
                  }
                  await supabase.auth.signOut();
                  setCurrentView('landing');
                  setActiveTab('pos');
                }}
              />

              {/* Konten Utama */}
              <main
                className={`flex-1 w-full min-h-screen transition-all duration-300 ${
                  activeTab === 'self-order' && subscriptionPlan !== 'starter'
                    ? 'p-0 ml-0'
                    : 'p-5 sm:p-6 md:p-10 pt-20 lg:pt-8 lg:ml-72'
                }`}
              >
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* BAR KHUSUS PAKET ENTERPRISE: MANAJEMEN MULTI-OUTLET & CENTRAL KITCHEN */}
                  {subscriptionPlan === 'enterprise' && !(activeTab === 'self-order') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#111111] text-[#FAFAFA] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-zinc-800 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold tracking-tight">
                              Enterprise Multi-Outlet & Central Kitchen
                            </span>
                            <span className="font-mono text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              Sinkronisasi Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Pantau inventaris, mutasi stok antar-cabang, dan laporan penjualan terpusat.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">
                          Cabang:
                        </span>
                        <select
                          value={activeOutlet}
                          onChange={(e) => setActiveOutlet(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                        >
                          <option value="Semua Cabang (Terpusat)">Semua Cabang (Terpusat)</option>
                          <option value="Cabang Utama - Makassar">Cabang Utama - Makassar</option>
                          <option value="Cabang 2 - Bandung">Cabang 2 - Bandung</option>
                          <option value="Cabang 3 - Jakarta">Cabang 3 - Jakarta</option>
                          <option value="Central Kitchen (Gudang Pusat)">
                            Central Kitchen (Gudang Pusat)
                          </option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* REAL-TIME BUFFER INVENTORY / LOW-STOCK ALERT BANNER */}
                  {lowStockIngredients.length > 0 &&
                    (userRole === 'superadmin' || userRole === 'stocker') &&
                    activeTab !== 'self-order' &&
                    subscriptionPlan !== 'starter' && (
                      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-[#141414]">
                                {lowStockIngredients.length} Bahan Baku Menyentuh Batas Minimum (Buffer Stock)
                              </span>
                              <span className="font-mono text-[9px] font-bold uppercase bg-white text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                                Low Stock Alert
                              </span>
                            </div>
                            <p className="text-[11px] text-[#78350F] font-medium mt-0.5">
                              {lowStockIngredients
                                .slice(0, 3)
                                .map((ing) => `${(ing.name || '').split(' | ')[0]} (${ing.stock} ${ing.unit})`)
                                .join(', ')}
                              {lowStockIngredients.length > 3
                                ? ` dan ${lowStockIngredients.length - 3} bahan lainnya`
                                : ''}
                            </p>
                          </div>
                        </div>

                        {activeTab !== 'inventory' && (
                          <button
                            onClick={() => setActiveTab('inventory')}
                            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                          >
                            Cek Gudang & Restock <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )}

                  <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
                    <motion.div
                      key={`${activeTab}-${subscriptionPlan}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {activeTab === 'pos' && (
                        <PosModule
                          products={products}
                          ingredients={ingredients}
                          onCheckout={handleCheckout}
                          subscriptionPlan={subscriptionPlan}
                          activeOutlet={activeOutlet}
                          orders={orders}
                          merchantSettings={merchantSettings}
                          onSaveMerchantSettings={handleSaveMerchantSettings}
                          currentOperator={currentOperator}
                          onUpdateOperatorShift={setCurrentOperator}
                          onPlaceWorkflowOrder={handlePlaceWorkflowOrder}
                          onTransitionOrderKitchenStatus={handleTransitionOrderKitchenStatus}
                          onModifyOrder={handleModifyOrder}
                          onCancelOrder={handleCancelOrder}
                          onSettleOpenBill={handleSettleOpenBill}
                          onReceiveClosedKitchenDemo={handleReceiveClosedKitchenDemo}
                        />
                      )}

                      {activeTab === 'self-order' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Modul Self-Order Kiosk (Pemesanan Meja)',
                            'Pada Paket Starter, pemesanan hanya dilakukan melalui kasir utama. Tingkatkan ke Paket Pro untuk mengaktifkan QR Self-Order agar pelanggan dapat memesan langsung dari meja.',
                            [
                              'Pelanggan pesan mandiri dari meja tanpa instal aplikasi',
                              'Pesanan otomatis terhubung ke stok bahan baku (BOM)',
                              'Mengurangi antrean kasir & beban staf pelayan hingga 40%'
                            ]
                          )
                        ) : (
                          <SelfOrderModule
                            products={products}
                            ingredients={ingredients}
                            onCheckout={handleCheckout}
                            setActiveTab={setActiveTab}
                          />
                        ))}

                      {activeTab === 'menu-management' && userRole !== 'stocker' && (
                        <MenuManagementModule
                          products={products}
                          setProducts={setProducts}
                          ingredients={ingredients}
                          subscriptionPlan={subscriptionPlan}
                          onUpgradePlan={setSubscriptionPlan}
                        />
                      )}

                      {activeTab === 'inventory' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Smart Inventory & Automated BOM Engine',
                            'Paket Starter tidak mencakup manajemen stok bahan mentah dan pemotongan resep otomatis. Upgrade ke Paket Pro (Core Product) untuk mengendalikan gudang dan mencegah food waste.',
                            [
                              'Pemotongan stok bahan mentah otomatis (gram/ml ke kg/liter presisi 3 angka desimal)',
                              'Validasi lintas menu di keranjang untuk mencegah stok minus',
                              'Pelacakan tanggal masuk & masa kedaluwarsa bahan (FIFO/FEFO)'
                            ]
                          )
                        ) : (
                          <InventoryModule
                            products={products}
                            ingredients={ingredients}
                            setIngredients={setIngredients}
                            priceHistory={priceHistory}
                            onUpdateIngredientPrice={handleUpdateIngredientPrice}
                            onBatchFillMarketPrices={handleBatchFillMarketPrices}
                            subscriptionPlan={subscriptionPlan}
                            activeOutlet={activeOutlet}
                            stockLogs={stockLogs}
                            onAddStockLog={handleAddStockLog}
                            onRecordAudit={handleRecordAudit}
                            currentOperator={currentOperator}
                            onUpgradePlan={setSubscriptionPlan}
                          />
                        ))}

                      {activeTab === 'alerts' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'FIFO/FEFO Early Warning & Smart Alerts',
                            'Fitur peringatan dini bahan baku kritis dan deteksi masa kedaluwarsa (≤ 30 hari) merupakan bagian dari Paket Pro / Business & Enterprise.',
                            [
                              'Deteksi otomatis bahan baku yang mendekati tanggal expired (≤ 30 hari)',
                              'Notifikasi instan saat stok bahan menyentuh batas minimum aman',
                              'Mencegah kerugian akibat bahan baku basi di gudang'
                            ]
                          )
                        ) : (
                          <AlertsModule ingredients={ingredients} setActiveTab={setActiveTab} />
                        ))}

                      {activeTab === 'employees' && (
                        <EmployeeModule
                          subscriptionPlan={subscriptionPlan}
                          onUpgradePlan={setSubscriptionPlan}
                          onRecordAudit={handleRecordAudit}
                        />
                      )}

                      {activeTab === 'reporting' && (
                        <ReportingModule
                          subscriptionPlan={subscriptionPlan}
                          activeOutlet={activeOutlet}
                          onUpgradePlan={setSubscriptionPlan}
                        />
                      )}

                      {activeTab === 'profitability' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Profitability Matrix & Stocko AI Insights',
                            'Analitik Menu Engineering (Stars, Plowhorses, Puzzles, Dogs), tren laba kotor vs kuantitas penjualan, serta Stocko AI Business Analyst tersedia di Paket Pro & Enterprise.',
                            [
                              'Klasifikasi otomatis menu berdasarkan volume penjualan & margin COGS aktual',
                              'Deteksi lonjakan harga bahan baku yang menekan margin di bawah batas aman',
                              'Rekomendasi upselling berbasis margin tinggi & prediksi restock gudang'
                            ]
                          )
                        ) : (
                          <ProfitabilityAiModule
                            products={products}
                            ingredients={ingredients}
                            priceHistory={priceHistory}
                            stockMovements={stockMovements}
                            seasonalEvents={seasonalEvents}
                            onNavigateTab={setActiveTab}
                          />
                        ))}

                      {activeTab === 'seasonal-analytics' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Historical Data Analysis & Seasonal Demand Forecasting',
                            'Analisis historis multi-periode (Harian–Tahunan), penandaan kalender musiman, serta proyeksi kebutuhan stok tersedia di Paket Pro & Enterprise.',
                            [
                              'Tren omzet & konsumsi bahan baku dari harian hingga tahunan',
                              'Komparasi Baseline vs Seasonal Lift % (Ramadan, Idulfitri, Libur Sekolah, Promo)',
                              'Rekomendasi kenaikan buffer stok & strategi menu musiman'
                            ]
                          )
                        ) : (
                          <SeasonalAnalyticsModule
                            products={products}
                            ingredients={ingredients}
                            stockMovements={stockMovements}
                            seasonalEvents={seasonalEvents}
                            setSeasonalEvents={setSeasonalEvents}
                            currentOperator={currentOperator}
                            onNavigateTab={setActiveTab}
                          />
                        ))}

                      {activeTab === 'audit-trail' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Audit Trail & Akuntabilitas Operasional',
                            'Rekam jejak penuh setiap perubahan stok, harga bahan baku, Nota Coret, dan pembatalan pesanan tersedia di Paket Pro & Enterprise.',
                            [
                              'Identitas petugas & role tercatat di setiap log mutasi dan pembatalan',
                              'Pelacakan before/after stock opname & alasan revisi transaksi',
                              'Pemisahan jelas antara pembatalan pra-masak dan waste pasca-produksi'
                            ]
                          )
                        ) : (
                          <AuditTrailModule
                            auditLogs={auditLogs}
                            stockMovements={stockMovements}
                            staffProfiles={staffProfiles}
                            onRefresh={refreshAuditData}
                            isRefreshing={isRefreshingAudit}
                          />
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      {renderCurrentView()}
    </AnimatePresence>
  );
}

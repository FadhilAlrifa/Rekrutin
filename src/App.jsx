import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Check,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  History,
  X
} from 'lucide-react';
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
import NotificationProvider from './components/common/NotificationProvider';
import { useNotify } from './components/common/NotificationContext';
import HolidayReminderModal from './components/dashboard/inventory/HolidayReminderModal';
import SimulationSetupModal from './components/dashboard/pos/SimulationSetupModal';
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
  clearUnavailableTablesCache,
  clearOperationalLocalCaches,
  setActiveCompanyId,
  fetchOrInitCompanyWorkspace,
  updateRetailProductStock,
  fetchRetailPurchasePriceHistory,
  fetchTransactions,
  fetchDailySalesHistory,
  syncDailySalesHistoryEntries,
  syncIngredientBatchesToDb
} from './services/stockoService';
import {
  fetchStaffProfiles,
  resolveAuthenticatedEmployeeProfile,
  recordEmployeeSessionEvent,
  clearEmployeeLocalCaches
} from './services/employeeAuditService';
import {
  createOrderPayload,
  computeBomRequirementsForItems,
  computeRetailSkuRequirementsForItems,
  resolveOrderCancellation,
  resolveOrderModification
} from './utils/orderStateMachine';
import {
  DEFAULT_SEASONAL_EVENTS,
  getUpcomingHolidayReminders,
  getHistoricalPurchaseReferenceForEvent
} from './utils/seasonalForecasting';
import { buildDailySalesHistory } from './utils/dailySalesHistory';
import { checkExpiryStatus } from './utils/inventoryStatus';
import { deductBatchesFefo, restoreBatchesFefo } from './utils/fefoBatchEngine';
import {
  createSimulationFnbProducts,
  createSimulationFnbIngredients,
  createSimulationRetailProducts,
  createSimulationAnalyticsData
} from './data/simulationCatalog';

function AppContent() {
  const { showToast } = useNotify();
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('pos');

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [retailPriceHistory, setRetailPriceHistory] = useState([]);
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
  const [transactions, setTransactions] = useState([]);
  const [dailySalesRows, setDailySalesRows] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [selectedReminderEvent, setSelectedReminderEvent] = useState(null);
  const [dismissedReminderBanner, setDismissedReminderBanner] = useState(false);
  const [simulationSetupOpen, setSimulationSetupOpen] = useState(false);
  const [pendingSimulationPlan, setPendingSimulationPlan] = useState(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const activeSessionIdRef = useRef(null);
  const holidayToastShownRef = useRef(false);
  const stockerToastShownRef = useRef(false);
  const starterShowcaseAppliedRef = useRef(false);
  const currentViewRef = useRef(currentView);
  const expectedLoginRoleRef = useRef(null);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

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
  const [stockLogs, setStockLogs] = useState([]);

  const resetWorkspaceState = () => {
    setProducts([]);
    setIngredients([]);
    setPriceHistory([]);
    setRetailPriceHistory([]);
    setOrders([]);
    setAuditLogs([]);
    setStockMovements([]);
    setStockLogs([]);
    setTransactions([]);
    setDailySalesRows([]);
    setStaffProfiles([]);
  };

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
        cashierName: payload.cashierName || '',
        reason: payload.reason || ''
      });
      setStockMovements((prev) => [mov, ...prev]);
    }
  };

  const handleUpdateIngredientPrice = async (arg1, arg2, arg3) => {
    const ingredient = arg1?.ingredient ? arg1.ingredient : arg1;
    const newPrice = arg1?.ingredient ? arg1.newPrice : arg2;
    const initialPrice = arg1?.ingredient ? arg1.initialPrice : undefined;
    const notes = arg1?.ingredient ? arg1.notes : arg3;

    const oldPrice = Number(
      ingredient?.currentMarketPrice ?? ingredient?.unitPrice ?? ingredient?.unit_price ?? 0
    );
    const res = await updateIngredientPrice({ ingredient, newPrice, initialPrice, notes });
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === ingredient.id
          ? {
              ...ing,
              unitPrice: Number(res?.currentMarketPrice ?? newPrice),
              currentMarketPrice: Number(res?.currentMarketPrice ?? newPrice),
              initialPurchasePrice: Number(
                res?.initialPurchasePrice ?? ing.initialPurchasePrice ?? oldPrice
              )
            }
          : ing
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

    showToast({
      title: 'Harga bahan baku berhasil diperbarui',
      message: `${String(ingredient?.name || '').split(' | ')[0]}: Rp ${Number(newPrice || 0).toLocaleString('id-ID')}`,
      variant: 'success'
    });

    return res;
  };

  const handleBatchFillMarketPrices = async () => {
    const res = await seedMarketPricesForMissing(ingredients);
    if (res?.updated && res.updated.length > 0) {
      setIngredients(res.updated);
      showToast({
        title: 'Estimasi harga pasar diterapkan',
        message: `${res.entries?.length || 0} bahan baku diperbarui untuk kalkulasi HPP.`,
        variant: 'success'
      });
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
      const absAmount = Math.abs(Number(d.amount || 0));
      const beforeStock = Number(cur.stock) || 0;

      let nextItemState;
      let actualSignedDelta;
      let batchTraceLabel = '';

      if (isAddition) {
        const restored = restoreBatchesFefo(cur, absAmount);
        nextItemState = restored.updatedIngredient;
        actualSignedDelta = absAmount;
      } else {
        const deducted = deductBatchesFefo(cur, absAmount);
        nextItemState = deducted.updatedIngredient;
        actualSignedDelta = -Number(deducted.deductedTotal || 0);
        if (deducted.allocations && deducted.allocations.length > 0) {
          batchTraceLabel =
            ' [FEFO: ' +
            deducted.allocations
              .map((a) => `${a.batchCode} (-${a.deductedQty}, exp ${a.expiryDate})`)
              .join('; ') +
            ']';
        }
      }

      const afterStock = Math.max(0, Number(nextItemState.stock) || 0);
      updatedIngredients[idx] = nextItemState;
      if (!isSimulationMode && !String(cur.id).startsWith('SIM-')) {
        await updateIngredientStock(cur.id, afterStock, nextItemState.expiryDate);
        await syncIngredientBatchesToDb(cur.id, nextItemState.batches || []);
      }

      const cleanName = String(cur.name || '').split(' | ')[0];
      const fullReason = `${reason}${batchTraceLabel}`;
      const logEntry = {
        id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        itemName: cleanName,
        type: logType,
        qty: `${actualSignedDelta >= 0 ? `+${actualSignedDelta}` : actualSignedDelta} ${cur.unit}`,
        outlet: resolvedOutletLabel,
        note: fullReason
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
        deltaLabel: `${actualSignedDelta >= 0 ? `+${actualSignedDelta}` : actualSignedDelta} ${cur.unit}`,
        reason: fullReason,
        movementType,
        qtyChange: actualSignedDelta,
        beforeStock,
        afterStock,
        unit: cur.unit,
        costImpact:
          movementType === 'WASTE_LOSS'
            ? Math.round(Math.abs(actualSignedDelta) * Number(cur.currentMarketPrice ?? cur.unitPrice ?? 0))
            : 0,
        orderId
      });
    }

    setIngredients(updatedIngredients);
    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }
  };

  const applyRetailStockDeltas = async (
    deltas = [],
    { movementType, actionType, reason, orderId, logType, isAddition = false }
  ) => {
    if (subscriptionPlan === 'starter' || !Array.isArray(deltas) || deltas.length === 0) {
      return;
    }

    let updatedProducts = [...products];
    const newLogs = [];
    const activeCashierName = currentOperator?.name || 'Kasir Aktif';

    for (const d of deltas) {
      const idx = updatedProducts.findIndex((p) => String(p.id) === String(d.productId));
      if (idx < 0) continue;

      const cur = updatedProducts[idx];
      const deltaSigned = isAddition ? Math.abs(Number(d.amount || 0)) : -Math.abs(Number(d.amount || 0));
      const beforeStock = Number(cur.stock ?? 0);
      const afterStock = Math.max(0, Number((beforeStock + deltaSigned).toFixed(3)));
      const unit = cur.unit || 'pcs';

      updatedProducts[idx] = { ...cur, stock: afterStock };
      if (!isSimulationMode && !String(cur.id).startsWith('SIM-')) {
        await updateRetailProductStock(cur.id, afterStock);
      }

      const logEntry = {
        id: `MOV-RET-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        itemName: cur.name,
        type: logType || (isAddition ? 'MASUK (Reversal Ritel)' : 'KELUAR (Otomatis POS Ritel)'),
        qty: `${deltaSigned >= 0 ? `+${deltaSigned}` : deltaSigned} ${unit}`,
        outlet: resolvedOutletLabel,
        note: reason
      };
      newLogs.push(logEntry);
      recordStockMutationLog({ ...logEntry, ingredientId: cur.id });

      await handleRecordAudit({
        actionType,
        entityType: 'product',
        entityId: cur.id,
        entityName: cur.sku ? `${cur.name} (${cur.sku})` : cur.name,
        beforeValue: `${beforeStock} ${unit}`,
        afterValue: `${afterStock} ${unit}`,
        deltaLabel: `${deltaSigned >= 0 ? `+${deltaSigned}` : deltaSigned} ${unit}`,
        reason,
        movementType,
        qtyChange: deltaSigned,
        beforeStock,
        afterStock,
        unit,
        cashierName: activeCashierName,
        costImpact:
          movementType === 'WASTE_LOSS'
            ? Math.round(Math.abs(deltaSigned) * Number(cur.purchasePrice || d.purchasePrice || 0))
            : 0,
        orderId
      });
    }

    setProducts(updatedProducts);
    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }
  };

  const checkUserRole = async (user) => {
    if (!user?.id) return;
    const profile = await resolveAuthenticatedEmployeeProfile(user);
    if (!profile) return;

    const expectedRole = expectedLoginRoleRef.current;
    if (expectedRole && profile.role !== expectedRole) {
      const roleLabels = {
        superadmin: 'Admin',
        kasir: 'Kasir',
        stocker: 'Stocker'
      };
      expectedLoginRoleRef.current = null;
      setAuthNotice(
        `Akun ini terdaftar sebagai ${roleLabels[profile.role] || profile.role}, bukan ${roleLabels[expectedRole] || expectedRole}. Pilih kategori ${roleLabels[profile.role] || profile.role} untuk masuk.`
      );
      currentViewRef.current = 'login';
      setCurrentView('login');
      await supabase.auth.signOut();
      setUserRole('superadmin');
      return;
    }
    expectedLoginRoleRef.current = null;

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
          ? `Akun karyawan atas nama "${profile.fullName}" berstatus nonaktif / resign. Hubungi Admin untuk aktivasi.`
          : 'Akses karyawan telah dicabut. Hubungi Admin.'
      );
      await supabase.auth.signOut();
      setUserRole('superadmin');
      setCurrentView('login');
      return;
    }

    setAuthNotice('');
    setIsSimulationMode(false);
    starterShowcaseAppliedRef.current = false;
    setUserRole(profile.role);

    const resolvedCompanyId = profile.companyId || user.user_metadata?.company_id || user.id;
    const workspace = await fetchOrInitCompanyWorkspace({
      companyId: resolvedCompanyId,
      adminId: profile.role === 'superadmin' ? user.id : resolvedCompanyId,
      adminEmail: profile.role === 'superadmin' ? profile.email : '',
      adminName: profile.role === 'superadmin' ? profile.fullName : 'Admin',
      businessName: user.user_metadata?.business_name || 'Usaha Utama',
      businessType: user.user_metadata?.business_type || 'fnb',
      paymentFlow: user.user_metadata?.payment_flow || 'pay_first',
      subscriptionPlan: user.user_metadata?.subscription_plan || 'pro',
      forceReset: false
    });

    const resolvedPlan =
      workspace?.subscriptionPlan || user.user_metadata?.subscription_plan || 'pro';
    setSubscriptionPlan(resolvedPlan);

    const resolvedBusinessType =
      workspace?.businessType || user.user_metadata?.business_type || 'fnb';
    const resolvedPaymentFlow =
      workspace?.paymentFlow || user.user_metadata?.payment_flow || 'pay_first';
    setMerchantSettings((prev) => ({
      ...prev,
      businessType: resolvedBusinessType,
      paymentFlow: resolvedPaymentFlow
    }));

    const [
      dbProducts,
      dbIngredients,
      historyRes,
      dbOrders,
      dbAudit,
      dbMovements,
      staffRes,
      retailHistoryRes,
      dbTransactions,
      dbDailySales
    ] = await Promise.all([
      fetchProducts(),
      fetchIngredients(),
      fetchPriceHistory(),
      fetchOrders(),
      fetchAuditLogs(),
      fetchStockMovements(),
      fetchStaffProfiles(),
      fetchRetailPurchasePriceHistory(),
      fetchTransactions(),
      fetchDailySalesHistory()
    ]);

    const safeProducts = Array.isArray(dbProducts) ? dbProducts : [];
    const safeIngredients = Array.isArray(dbIngredients) ? dbIngredients : [];
    setProducts(safeProducts);
    setIngredients(safeIngredients);
    const validIngIds = new Set(safeIngredients.map((i) => String(i.id)));
    setPriceHistory(
      Array.isArray(historyRes?.data)
        ? historyRes.data.filter((h) => validIngIds.has(String(h.ingredientId)))
        : []
    );
    setRetailPriceHistory(Array.isArray(retailHistoryRes) ? retailHistoryRes : []);
    setOrders(Array.isArray(dbOrders) ? dbOrders : []);
    setAuditLogs(Array.isArray(dbAudit) ? dbAudit : []);
    setStockMovements(Array.isArray(dbMovements) ? dbMovements : []);
    setStaffProfiles(staffRes?.success && Array.isArray(staffRes.data) ? staffRes.data : []);
    setTransactions(Array.isArray(dbTransactions) ? dbTransactions : []);
    setDailySalesRows(Array.isArray(dbDailySales) ? dbDailySales : []);
    setStockLogs([]);
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
        staffRes,
        retailHistoryRes,
        dbTransactions,
        dbDailySales
      ] = await Promise.all([
        fetchProducts(),
        fetchIngredients(),
        fetchPriceHistory(),
        fetchMerchantSettings(),
        fetchOrders(),
        fetchAuditLogs(),
        fetchStockMovements(),
        fetchSeasonalEvents(),
        fetchStaffProfiles(),
        fetchRetailPurchasePriceHistory(),
        fetchTransactions(),
        fetchDailySalesHistory()
      ]);

      const safeProducts = Array.isArray(dbProducts) ? dbProducts : [];
      const safeIngredients = Array.isArray(dbIngredients) ? dbIngredients : [];
      setProducts(
        starterShowcaseAppliedRef.current
          ? buildStarterShowcaseProducts(safeProducts)
          : safeProducts
      );
      setIngredients(safeIngredients);
      const validIngIds = new Set(safeIngredients.map((i) => String(i.id)));
      if (historyRes?.data) {
        setPriceHistory(historyRes.data.filter((h) => validIngIds.has(String(h.ingredientId))));
      }
      if (Array.isArray(retailHistoryRes?.data)) setRetailPriceHistory(retailHistoryRes.data);
      if (savedSettings) setMerchantSettings(savedSettings);
      if (Array.isArray(dbOrders)) setOrders(dbOrders);
      if (Array.isArray(dbAudit)) setAuditLogs(dbAudit);
      if (Array.isArray(dbMovements)) setStockMovements(dbMovements);
      if (Array.isArray(dbEvents) && dbEvents.length > 0) setSeasonalEvents(dbEvents);
      if (staffRes?.success && Array.isArray(staffRes.data)) setStaffProfiles(staffRes.data);
      if (Array.isArray(dbTransactions)) setTransactions(dbTransactions);
      if (Array.isArray(dbDailySales)) setDailySalesRows(dbDailySales);
    }
    loadBackendData();

    const isRegistrationActive = () => {
      if (currentViewRef.current === 'register') return true;
      try {
        return window.sessionStorage.getItem('stocko_registration_active') === '1';
      } catch {
        return false;
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !isRegistrationActive()) {
        checkUserRole(session.user);
        setCurrentView('app');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (isRegistrationActive()) {
          return;
        }
        checkUserRole(session.user);
        setCurrentView('app');
      } else if (event === 'SIGNED_OUT') {
        if (currentViewRef.current !== 'login' && !isRegistrationActive()) {
          setCurrentView('landing');
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkExpiryAlert = (dateString) => {
    const status = checkExpiryStatus(dateString);
    return status === 'expired' || status === 'hampir';
  };

  const holidayReminderSummary = useMemo(
    () => getUpcomingHolidayReminders(seasonalEvents),
    [seasonalEvents]
  );
  const activeHolidayReminders = holidayReminderSummary.activeReminders;

  const selectedReminderMeta = useMemo(() => {
    if (!selectedReminderEvent) return null;
    return (
      holidayReminderSummary.allEventsWithStatus.find(
        (e) => String(e.id) === String(selectedReminderEvent.id)
      ) || getUpcomingHolidayReminders([selectedReminderEvent]).allEventsWithStatus[0]
    );
  }, [selectedReminderEvent, holidayReminderSummary]);

  const holidayReferenceData = useMemo(() => {
    if (!selectedReminderMeta) return null;
    return getHistoricalPurchaseReferenceForEvent(selectedReminderMeta, {
      stockMovements,
      stockLogs,
      priceHistory,
      ingredients
    });
  }, [selectedReminderMeta, stockMovements, stockLogs, priceHistory, ingredients]);

  useEffect(() => {
    if (
      currentView === 'app' &&
      !holidayToastShownRef.current &&
      activeHolidayReminders.length > 0 &&
      userRole === 'superadmin' &&
      subscriptionPlan !== 'starter'
    ) {
      holidayToastShownRef.current = true;
      const topEvt = activeHolidayReminders[0];
      showToast({
        title: `Pengingat ${topEvt.countdownBadge} Hari Besar`,
        message: `${topEvt.name} (${topEvt.startDate}) — Siapkan stok dan perbarui harga bahan sebelum pemasok libur.`,
        variant: 'warning',
        duration: 6000
      });
    }
  }, [currentView, activeHolidayReminders, userRole, subscriptionPlan, showToast]);

  const businessType = merchantSettings?.businessType || 'fnb';

  const favoriteMenuQuotas = useMemo(() => {
    const built = buildDailySalesHistory({
      transactions,
      products,
      ingredients,
      seasonalEvents,
      persistedDailyRows: dailySalesRows,
      businessType
    });
    return (built.menuQuotaSummary || []).slice(0, 4);
  }, [transactions, products, ingredients, seasonalEvents, dailySalesRows, businessType]);
  const lowStockIngredients = ingredients.filter(
    (ing) => Number(ing.stock) <= Number(ing.minLimit ?? 5)
  );
  const expiringIngredients = ingredients.filter((ing) => checkExpiryAlert(ing.expiryDate));
  const lowStockCount = lowStockIngredients.length;
  const retailLowStockProducts = products.filter(
    (p) => (p.productMode === 'retail' || businessType === 'retail') && Number(p.stock ?? 0) <= Number(p.minLimit ?? 5)
  );
  const starterLowStockProducts = products.filter(
    (p) => Number(p.stock ?? 0) <= Number(p.minLimit ?? 3)
  );
  const retailLowStockCount = retailLowStockProducts.length;
  const alertCount = ingredients.filter(
    (ing) => Number(ing.stock) <= Number(ing.minLimit ?? 5) || checkExpiryAlert(ing.expiryDate)
  ).length;

  const buildStarterShowcaseProducts = (list = []) => {
    if (!Array.isArray(list) || list.length === 0) return list;
    const presetStocks = [15, 3, 0, 10];
    return list.map((p, idx) => ({
      ...p,
      stock: presetStocks[idx] !== undefined ? presetStocks[idx] : 10,
      minLimit: 3
    }));
  };

  const ensureStarterDemoQuotas = () => {
    if (starterShowcaseAppliedRef.current) return;
    setProducts((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      starterShowcaseAppliedRef.current = true;
      return buildStarterShowcaseProducts(prev);
    });
  };

  const handleChangeSubscriptionPlan = (nextPlan) => {
    setSubscriptionPlan(nextPlan);
    if (nextPlan === 'starter') {
      if (userRole === 'stocker') {
        setUserRole('superadmin');
        setCurrentOperator((prev) => ({
          ...prev,
          id: 'OP-SIM-OWNER',
          name: 'Admin',
          role: 'superadmin'
        }));
        setActiveTab('pos');
      }
      if (isSimulationMode) {
        ensureStarterDemoQuotas();
      }
    }
  };

  useEffect(() => {
    if (
      currentView === 'app' &&
      !stockerToastShownRef.current &&
      userRole === 'stocker' &&
      subscriptionPlan !== 'starter' &&
      (lowStockCount > 0 || expiringIngredients.length > 0)
    ) {
      stockerToastShownRef.current = true;
      showToast({
        title: 'Peringatan Bahan Gudang',
        message: `${lowStockCount} bahan stoknya menipis dan ${expiringIngredients.length} bahan mendekati / lewat kedaluwarsa.`,
        variant: 'warning',
        duration: 5500
      });
    }
  }, [currentView, userRole, subscriptionPlan, lowStockCount, expiringIngredients.length, showToast]);

  const handleRequestSimulation = (planId = null) => {
    setPendingSimulationPlan(planId);
    setSimulationSetupOpen(true);
  };

  useEffect(() => {
    if (
      currentView === 'app' &&
      subscriptionPlan === 'starter' &&
      isSimulationMode &&
      products.length > 0 &&
      !starterShowcaseAppliedRef.current
    ) {
      ensureStarterDemoQuotas();
    }
  }, [currentView, subscriptionPlan, isSimulationMode, products.length]);

  const handleConfirmSimulation = async ({ businessType: nextBusinessType, paymentFlow: nextPaymentFlow }) => {
    if (pendingSimulationPlan) {
      setSubscriptionPlan(pendingSimulationPlan);
    }
    setActiveCompanyId(null);
    starterShowcaseAppliedRef.current = true;
    if (nextBusinessType === 'retail') {
      setProducts(createSimulationRetailProducts());
      setIngredients([]);
    } else {
      setProducts(createSimulationFnbProducts());
      setIngredients(createSimulationFnbIngredients());
    }
    const simAnalytics = createSimulationAnalyticsData(nextBusinessType);
    setTransactions(simAnalytics.transactions);
    setStockMovements(simAnalytics.stockMovements);
    setPriceHistory(simAnalytics.priceHistory);
    setRetailPriceHistory(simAnalytics.retailPriceHistory);
    setAuditLogs(simAnalytics.auditLogs);
    setStockLogs(simAnalytics.stockLogs);
    setDailySalesRows([]);
    setOrders([]);
    const nextSettings = {
      ...merchantSettings,
      businessType: nextBusinessType,
      paymentFlow: nextPaymentFlow
    };
    setMerchantSettings(nextSettings);

    setIsSimulationMode(true);
    setUserRole('superadmin');
    setCurrentOperator({
      id: 'OP-SIM-OWNER',
      name: 'Admin',
      role: 'superadmin',
      shiftActive: true,
      isAuthenticatedEmployee: false
    });
    setActiveTab('pos');
    setSimulationSetupOpen(false);
    setPendingSimulationPlan(null);
    holidayToastShownRef.current = false;
    stockerToastShownRef.current = false;
    setCurrentView('app');

    showToast({
      title: 'Simulasi POS Siap Dicoba',
      message: `Mode ${nextBusinessType === 'retail' ? 'Toko Ritel & Minimarket' : 'F&B / Kafe'} • ${
        nextPaymentFlow === 'pay_later' ? 'Bayar Nanti (Open Bill)' : 'Bayar di Awal'
      }.`,
      variant: 'success',
      duration: 5000
    });
  };

  const handleSwitchSimulationRole = (nextRole) => {
    if (subscriptionPlan === 'starter' && nextRole === 'stocker') {
      showToast({
        title: 'Role Stocker Khusus Paket Pro',
        message: 'Paket Starter khusus untuk 1 Admin & 1 Kasir (stok porsi per menu). Pilih Paket Pro untuk mencoba Stocker & gudang bahan.',
        variant: 'info',
        duration: 4500
      });
      return;
    }

    const roleNames = {
      superadmin: 'Admin',
      kasir: 'Kasir',
      stocker: 'Petugas Gudang'
    };

    setUserRole(nextRole);
    setCurrentOperator((prev) => ({
      ...prev,
      id: `OP-SIM-${nextRole.toUpperCase()}`,
      name: roleNames[nextRole] || 'Petugas',
      role: nextRole,
      shiftActive: true,
      isAuthenticatedEmployee: false
    }));

    if (nextRole === 'kasir' && !['pos', 'menu-management'].includes(activeTab)) {
      setActiveTab('pos');
    } else if (nextRole === 'stocker' && !['inventory', 'alerts'].includes(activeTab)) {
      setActiveTab('inventory');
    }
  };

  const handleCheckout = async (cartItems, tableNumber = 'Kasir Utama', paymentMethod = 'cash') => {
    let starterDeducted = false;
    let reqs = [];
    let retailReqs = [];

    if (subscriptionPlan === 'starter') {
      const qtyById = new Map();
      cartItems.forEach((item) => {
        const key = String(item.id);
        qtyById.set(key, (qtyById.get(key) || 0) + (Number(item.qty) || 0));
      });

      const updatedProducts = [];
      const changedTargets = [];
      for (const prod of products) {
        const soldQty = qtyById.get(String(prod.id)) || 0;
        if (soldQty > 0) {
          const beforeStock = Math.max(0, Number(prod.stock ?? 0));
          const afterStock = Math.max(0, Number((beforeStock - soldQty).toFixed(3)));
          updatedProducts.push({ ...prod, stock: afterStock });
          changedTargets.push({ id: prod.id, afterStock });
          starterDeducted = true;
        } else {
          updatedProducts.push(prod);
        }
      }

      if (starterDeducted) {
        setProducts(updatedProducts);
        for (const t of changedTargets) {
          if (!isSimulationMode && !String(t.id).startsWith('SIM-')) {
            await updateRetailProductStock(t.id, t.afterStock);
          }
        }
      }
    } else {
      reqs = computeBomRequirementsForItems(cartItems, ingredients);
      await applyStockDeltas(reqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Penjualan POS (${tableNumber})`,
        orderId: null,
        logType: 'KELUAR (Otomatis BOM POS)',
        isAddition: false
      });

      retailReqs = computeRetailSkuRequirementsForItems(cartItems, products, businessType);
      await applyRetailStockDeltas(retailReqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Penjualan POS Ritel (${tableNumber})`,
        orderId: null,
        logType: 'KELUAR (Otomatis POS Ritel)',
        isAddition: false
      });
    }

    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    let savedTxRows = null;
    if (isSimulationMode) {
      savedTxRows = [
        {
          id: `SIM-TX-${Date.now()}`,
          total_amount: currentSubtotal,
          items: cartItems,
          table_number: tableNumber || 'Takeaway / Kasir',
          payment_method: paymentMethod,
          created_at: new Date().toISOString(),
          order_channel: 'dine_in',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_id: currentOperator?.id,
          cashier_name: currentOperator?.name || 'Kasir Simulasi'
        }
      ];
    } else {
      savedTxRows = await saveTransaction(currentSubtotal, cartItems, tableNumber, paymentMethod, {
        orderChannel: 'dine_in',
        paymentFlow: 'pay_first',
        paymentStatus: 'paid',
        kitchenStatus: 'served',
        cashierId: currentOperator?.id,
        cashierName: currentOperator?.name || 'Kasir Aktif'
      });
    }

    if (Array.isArray(savedTxRows) && savedTxRows.length > 0) {
      const nextTxList = [savedTxRows[0], ...transactions];
      setTransactions(nextTxList);
      if (!isSimulationMode) {
        const rebuiltDaily = buildDailySalesHistory({
          transactions: nextTxList,
          products,
          ingredients,
          seasonalEvents,
          persistedDailyRows: dailySalesRows,
          businessType
        });
        syncDailySalesHistoryEntries(rebuiltDaily.flatRows, resolvedOutletLabel);
      }
    }

    showToast({
      title: 'Transaksi POS tercatat',
      message: starterDeducted
        ? `Kuota porsi menu berkurang untuk ${tableNumber}.`
        : reqs.length > 0 || retailReqs.length > 0
        ? `Stok otomatis terpotong untuk ${tableNumber}.`
        : `Pembayaran ${tableNumber} berhasil diproses.`,
      variant: 'success'
    });
  };

  const handleSaveMerchantSettings = async (nextSettings) => {
    const prevBusinessType = merchantSettings?.businessType || 'fnb';
    const saved = await saveMerchantSettings(nextSettings, currentOperator?.name || 'Owner');
    setMerchantSettings(saved);

    if (isSimulationMode && saved?.businessType && saved.businessType !== prevBusinessType) {
      if (saved.businessType === 'retail') {
        setProducts(createSimulationRetailProducts());
        setIngredients([]);
      } else {
        setProducts(createSimulationFnbProducts());
        setIngredients(createSimulationFnbIngredients());
      }
      const simAnalytics = createSimulationAnalyticsData(saved.businessType);
      setTransactions(simAnalytics.transactions);
      setStockMovements(simAnalytics.stockMovements);
      setPriceHistory(simAnalytics.priceHistory);
      setRetailPriceHistory(simAnalytics.retailPriceHistory);
      setAuditLogs(simAnalytics.auditLogs);
      setStockLogs(simAnalytics.stockLogs);
    }

    showToast({
      title: 'Pengaturan toko tersimpan',
      message: `Jenis usaha aktif: ${saved?.businessType === 'retail' ? 'Toko Ritel & Minimarket' : 'F&B / Kafe'}.`,
      variant: 'success'
    });
  };

  const handlePlaceWorkflowOrder = async ({
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
      await applyStockDeltas(reqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Order ${finalOrder.orderNumber} (${finalOrder.paymentFlow === 'pay_later' ? 'Open Bill / Preparing' : 'Pay First'})`,
        orderId: finalOrder.id,
        logType: 'KELUAR (Otomatis BOM POS)',
        isAddition: false
      });

      const retailReqs = computeRetailSkuRequirementsForItems(items, products, businessType);
      await applyRetailStockDeltas(retailReqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Order Ritel ${finalOrder.orderNumber} (${finalOrder.paymentFlow === 'pay_later' ? 'Open Bill / Preparing' : 'Pay First'})`,
        orderId: finalOrder.id,
        logType: 'KELUAR (Otomatis POS Ritel)',
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

      const retailReqs = computeRetailSkuRequirementsForItems(order.items, products, businessType);
      await applyRetailStockDeltas(retailReqs, {
        movementType: 'BOM_SALE',
        actionType: 'Stock Out',
        reason: `Proses order ritel ${order.orderNumber} (${order.orderChannel})`,
        orderId: order.id,
        logType: 'KELUAR (Otomatis POS Ritel)',
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

    if (order.stockDeducted && subscriptionPlan !== 'starter') {
      const prevRetailReqs = computeRetailSkuRequirementsForItems(order.items, products, businessType);
      const nextRetailReqs = computeRetailSkuRequirementsForItems(nextItems, products, businessType);
      const retailDeltaMap = new Map();

      nextRetailReqs.forEach((r) => {
        retailDeltaMap.set(String(r.productId), { ...r, deltaAmount: r.amount });
      });
      prevRetailReqs.forEach((r) => {
        const key = String(r.productId);
        const cur = retailDeltaMap.get(key);
        if (cur) {
          cur.deltaAmount = Number((cur.deltaAmount - r.amount).toFixed(3));
        } else {
          retailDeltaMap.set(key, { ...r, deltaAmount: Number((-r.amount).toFixed(3)) });
        }
      });

      for (const rDelta of retailDeltaMap.values()) {
        if (rDelta.deltaAmount > 0) {
          await applyRetailStockDeltas([{ ...rDelta, amount: rDelta.deltaAmount }], {
            movementType: 'BOM_SALE',
            actionType: 'Stock Out',
            reason: `Item susulan Nota Coret ${order.orderNumber}: ${reason}`,
            orderId: order.id,
            logType: 'KELUAR (Item Susulan Ritel)',
            isAddition: false
          });
        } else if (rDelta.deltaAmount < 0 && !treatRemovedAsWaste) {
          await applyRetailStockDeltas([{ ...rDelta, amount: Math.abs(rDelta.deltaAmount) }], {
            movementType: 'RESTOCK_REVERSAL',
            actionType: 'Stock In',
            reason: `Pengembalian stok ritel Nota Coret ${order.orderNumber}: ${reason}`,
            orderId: order.id,
            logType: 'MASUK (Reversal Nota Coret Ritel)',
            isAddition: true
          });
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

    const retailReqs = computeRetailSkuRequirementsForItems(order.items, products, businessType);

    if (stockAction === 'restore') {
      await applyStockDeltas(bomRequirements, {
        movementType: 'RESTOCK_REVERSAL',
        actionType: 'Stock In',
        reason: `Pembatalan pra-masak ${order.orderNumber}: ${reason}`,
        orderId: order.id,
        logType: 'MASUK (Reversal Order Batal)',
        isAddition: true
      });
      await applyRetailStockDeltas(retailReqs, {
        movementType: 'RESTOCK_REVERSAL',
        actionType: 'Stock In',
        reason: `Pembatalan / Retur ritel ${order.orderNumber}: ${reason}`,
        orderId: order.id,
        logType: 'MASUK (Reversal / Retur Ritel)',
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
      await applyRetailStockDeltas(retailReqs, {
        movementType: 'WASTE_LOSS',
        actionType: 'Stock Out',
        reason: `Barang rusak / retur batal ${order.orderNumber}: ${reason}`,
        orderId: order.id,
        logType: 'WASTE (Batal Ritel)',
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

    showToast({
      title: `Pesanan ${order.orderNumber} dibatalkan`,
      message:
        stockAction === 'restore'
          ? 'Stok berhasil dikembalikan dan dicatat di Audit Trail.'
          : 'Pembatalan & kerugian waste tercatat di Audit Trail.',
      variant: stockAction === 'restore' ? 'info' : 'warning'
    });
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

      {isSimulationMode ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setSubscriptionPlan('pro')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-bold text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
          >
            Coba Simulasi Paket Pro (Rp149.000/bln)
          </button>
          <button
            onClick={() => setSubscriptionPlan('enterprise')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141414] hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Coba Simulasi Paket Enterprise (Multi-Outlet)
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs font-bold">
            <Lock size={14} /> Akun perusahaan Anda terdaftar pada Paket Starter
          </span>
        </div>
      )}
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
              onOpenApp={() => handleRequestSimulation(null)}
              onOpenRegister={() => setCurrentView('register')}
              onOpenLogin={() => setCurrentView('login')}
              onSelectPlan={(planId) => {
                setSubscriptionPlan(planId);
                setCurrentView('register');
              }}
              onSimulatePlan={(planId) => {
                handleRequestSimulation(planId);
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
              onBack={() => setCurrentView('landing')}
              onOpenLogin={() => {
                setAuthNotice('');
                setCurrentView('login');
              }}
              initialPlan={subscriptionPlan}
              onPlanChange={setSubscriptionPlan}
              onCompleteRegistration={async ({
                subscriptionPlan: chosenPlan,
                businessType: chosenBusinessType,
                paymentFlow: chosenPaymentFlow,
                username,
                email,
                user
              }) => {
                clearOperationalLocalCaches({ preserveMerchantSettings: true });
                clearEmployeeLocalCaches();
                resetWorkspaceState();
                setIsSimulationMode(false);
                starterShowcaseAppliedRef.current = false;
                if (chosenPlan) setSubscriptionPlan(chosenPlan);
                setMerchantSettings((prev) => ({
                  ...prev,
                  businessType: chosenBusinessType || 'fnb',
                  paymentFlow: chosenPaymentFlow || 'pay_first'
                }));
                setUserRole('superadmin');
                setActiveTab('pos');
                setCurrentOperator({
                  id: user?.id || 'OWNER-NEW',
                  name: username || 'Admin',
                  email: email || user?.email || '',
                  role: 'superadmin',
                  outlet: 'Cabang Utama',
                  shiftActive: true,
                  isAuthenticatedEmployee: false
                });
                const staffRes = await fetchStaffProfiles();
                setStaffProfiles(
                  staffRes?.success && Array.isArray(staffRes.data) ? staffRes.data : []
                );
                setCurrentView('app');
              }}
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
              onBack={() => {
                setAuthNotice('');
                setCurrentView('landing');
              }}
              onOpenRegister={() => {
                setAuthNotice('');
                setCurrentView('register');
              }}
              onPrepareLoginRole={(role) => {
                expectedLoginRoleRef.current = role;
                setAuthNotice('');
              }}
              onLoginSuccess={() => {
                setAuthNotice('');
                setIsSimulationMode(false);
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
                retailLowStockCount={retailLowStockCount}
                businessType={businessType}
                userRole={userRole}
                isSimulationMode={isSimulationMode}
                canSwitchRole={isSimulationMode}
                onSwitchRole={isSimulationMode ? handleSwitchSimulationRole : undefined}
                subscriptionPlan={subscriptionPlan}
                setSubscriptionPlan={isSimulationMode ? handleChangeSubscriptionPlan : undefined}
                onBackToLanding={async () => {
                  if (activeSessionIdRef.current) {
                    await recordEmployeeSessionEvent({
                      sessionId: activeSessionIdRef.current,
                      eventType: 'logout'
                    });
                    activeSessionIdRef.current = null;
                  }
                  await supabase.auth.signOut();
                  setActiveCompanyId(null);
                  setIsSimulationMode(false);
                  starterShowcaseAppliedRef.current = false;
                  resetWorkspaceState();
                  setUserRole('superadmin');
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
                              Pengelolaan Banyak Cabang &amp; Gudang Pusat
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

                  {/* PENGINGAT JADWAL MUSIMAN / HARI BESAR (KHUSUS PEMILIK / SUPERADMIN) */}
                  {!dismissedReminderBanner &&
                    activeHolidayReminders.length > 0 &&
                    userRole === 'superadmin' &&
                    activeTab !== 'self-order' &&
                    subscriptionPlan !== 'starter' && (() => {
                      const topReminder = activeHolidayReminders[0];
                      return (
                        <div className="bg-white border-2 border-[#F59E0B] rounded-2xl px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
                              <CalendarClock size={20} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-[#141414]">
                                  {topReminder.countdownBadge} Menuju Hari H
                                </span>
                                <span className="text-xs sm:text-sm font-extrabold text-[#141414]">
                                  Pengingat Hari Besar: {topReminder.name} ({topReminder.startDate})
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-[#78350F]">
                                Segera perbarui daftar harga bahan &amp; siapkan stok tambahan sebelum pemasok tutup.{' '}
                                <span className="font-medium text-[#52525B]">
                                  (Mengacu pada catatan penjualan periode sebelumnya.)
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedReminderEvent(topReminder)}
                              className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-zinc-100 border border-[#E5E5E5] text-[#141414] text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <History size={13} className="text-[#D97706]" />
                              Lihat Tahun Lalu
                            </button>
                            {activeTab !== 'inventory' && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('inventory')}
                                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                              >
                                Cek Harga Bahan <ArrowRight size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDismissedReminderBanner(true)}
                              aria-label="Tutup banner pengingat hari besar"
                              className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-[#141414] flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  {/* PERINGATAN PRODUK RITEL MENIPIS (PEMILIK & STOCKER) */}
                  {businessType === 'retail' &&
                    retailLowStockProducts.length > 0 &&
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
                                {retailLowStockProducts.length} Produk Toko Hampir Habis
                              </span>
                              <span className="text-[10px] font-bold bg-white text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                                Stok Menipis
                              </span>
                            </div>
                            <p className="text-[11px] text-[#78350F] font-medium mt-0.5">
                              {retailLowStockProducts
                                .slice(0, 3)
                                .map((p) => `${p.name} (${Number(p.stock ?? 0)} ${p.unit || 'pcs'})`)
                                .join(', ')}
                              {retailLowStockProducts.length > 3
                                ? ` dan ${retailLowStockProducts.length - 3} produk lainnya`
                                : ''}
                            </p>
                          </div>
                        </div>

                        {activeTab !== 'menu-management' && userRole !== 'stocker' && (
                          <button
                            onClick={() => setActiveTab('menu-management')}
                            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                          >
                            Tambah Stok Produk <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )}

                  {/* PERINGATAN KUOTA PORSI MENU (PAKET STARTER • PEMILIK & KASIR) */}
                  {subscriptionPlan === 'starter' &&
                    starterLowStockProducts.length > 0 &&
                    (userRole === 'superadmin' || userRole === 'kasir') && (
                      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-[#141414]">
                                {starterLowStockProducts.length} Menu Hampir Habis atau Sudah Habis
                              </span>
                              <span className="text-[10px] font-bold bg-white text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                                Peringatan Kuota Menu
                              </span>
                            </div>
                            <p className="text-[11px] text-[#78350F] font-medium mt-0.5">
                              {starterLowStockProducts
                                .slice(0, 3)
                                .map((p) => {
                                  const qty = Math.max(0, Number(p.stock ?? 0));
                                  const unit = businessType === 'retail' || p.productMode === 'retail' ? (p.unit || 'pcs') : 'porsi';
                                  return qty <= 0 ? `${p.name} (Habis)` : `${p.name} (sisa ${qty} ${unit})`;
                                })
                                .join(', ')}
                              {starterLowStockProducts.length > 3
                                ? ` dan ${starterLowStockProducts.length - 3} menu lainnya`
                                : ''}
                            </p>
                          </div>
                        </div>

                        {(userRole === 'superadmin' || userRole === 'kasir') && activeTab !== 'menu-management' && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('menu-management')}
                            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                          >
                            Tambah Stok Menu <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )}

                  {/* PERINGATAN BAHAN BAKU MENIPIS (KHUSUS PETUGAS GUDANG / STOCKER) */}
                  {lowStockIngredients.length > 0 &&
                    userRole === 'stocker' &&
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
                                {lowStockIngredients.length} Bahan Baku Sudah Hampir Habis
                              </span>
                              <span className="text-[10px] font-bold bg-white text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                                Perlu Belanja Ulang
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
                            Cek Gudang &amp; Tambah Stok <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )}

                  {/* PERINGATAN BAHAN HAMPIR KEDALUWARSA / EXPIRED (KHUSUS PETUGAS GUDANG / STOCKER) */}
                  {expiringIngredients.length > 0 &&
                    userRole === 'stocker' &&
                    activeTab !== 'self-order' &&
                    subscriptionPlan !== 'starter' && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                            <CalendarClock size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-[#141414]">
                                {expiringIngredients.length} Bahan Baku Hampir atau Sudah Kedaluwarsa
                              </span>
                              <span className="text-[10px] font-bold bg-white text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                                Pakai Duluan / Tarik
                              </span>
                            </div>
                            <p className="text-[11px] text-red-800 font-medium mt-0.5">
                              {expiringIngredients
                                .slice(0, 3)
                                .map((ing) => `${(ing.name || '').split(' | ')[0]} (${ing.expiryDate || '-'})`)
                                .join(', ')}
                              {expiringIngredients.length > 3
                                ? ` dan ${expiringIngredients.length - 3} bahan lainnya`
                                : ''}
                            </p>
                          </div>
                        </div>

                        {activeTab !== 'alerts' && (
                          <button
                            onClick={() => setActiveTab('alerts')}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                          >
                            Lihat Peringatan Bahan <ArrowRight size={13} />
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
                          isSimulationMode={isSimulationMode}
                        />
                      )}

                      {activeTab === 'self-order' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Pesan Mandiri dari Meja (QR)',
                            'Di Paket Starter, pesanan hanya dicatat lewat kasir. Upgrade ke Paket Pro supaya pelanggan bisa scan QR dan pesan langsung dari meja.',
                            [
                              'Pelanggan pesan sendiri dari meja tanpa instal aplikasi',
                              'Pesanan langsung cek dan potong stok bahan di gudang',
                              'Mengurangi antrean di kasir saat jam ramai'
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
                          onUpgradePlan={isSimulationMode ? handleChangeSubscriptionPlan : undefined}
                          businessType={businessType}
                          userRole={userRole}
                          isSimulationMode={isSimulationMode}
                          retailPriceHistory={retailPriceHistory}
                          onRetailPriceHistoryAdded={(entry) =>
                            setRetailPriceHistory((prev) => [entry, ...prev])
                          }
                          onRecordAudit={handleRecordAudit}
                          currentOperator={currentOperator}
                        />
                      )}

                      {activeTab === 'inventory' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Stok Gudang & Potong Resep Otomatis',
                            'Paket Starter belum mencakup pengelolaan bahan baku dan potong stok resep otomatis. Upgrade ke Paket Pro agar stok gudang terkontrol dan tidak banyak bahan terbuang.',
                            [
                              'Stok bahan baku otomatis terpotong sesuai takaran resep setiap kali ada penjualan',
                              'Mencegah kasir menerima pesanan jika bahan di gudang sudah habis',
                              'Catat tanggal masuk dan pengingat bahan yang hampir kedaluwarsa'
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
                            isSimulationMode={isSimulationMode}
                            onUpgradePlan={isSimulationMode ? setSubscriptionPlan : undefined}
                            holidayReminders={userRole === 'superadmin' ? activeHolidayReminders : []}
                            onOpenHolidayReminder={setSelectedReminderEvent}
                          />
                        ))}

                      {activeTab === 'alerts' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Peringatan Stok Habis & Bahan Hampir Basi',
                            'Fitur pengingat bahan yang stoknya menipis dan mendekati tanggal kedaluwarsa (≤ 30 hari) tersedia di Paket Pro dan Enterprise.',
                            [
                              'Pengingat otomatis jika ada bahan yang hampir kedaluwarsa (≤ 30 hari)',
                              'Peringatan langsung saat stok bahan menyentuh batas minimum',
                              'Membantu mengurangi kerugian karena bahan terbuang basi'
                            ]
                          )
                        ) : (
                          <AlertsModule ingredients={ingredients} setActiveTab={setActiveTab} />
                        ))}

                      {activeTab === 'employees' && (
                        <EmployeeModule
                          subscriptionPlan={subscriptionPlan}
                          onUpgradePlan={isSimulationMode ? setSubscriptionPlan : undefined}
                          onRecordAudit={handleRecordAudit}
                          isSimulationMode={isSimulationMode}
                        />
                      )}

                      {activeTab === 'reporting' && (
                        <ReportingModule
                          subscriptionPlan={subscriptionPlan}
                          activeOutlet={activeOutlet}
                          onUpgradePlan={isSimulationMode ? setSubscriptionPlan : undefined}
                          products={products}
                          ingredients={ingredients}
                          seasonalEvents={seasonalEvents}
                          businessType={businessType}
                          isSimulationMode={isSimulationMode}
                          externalTransactions={transactions}
                          externalDailyRows={dailySalesRows}
                        />
                      )}

                      {activeTab === 'profitability' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Analisis Keuntungan & Saran AI',
                            'Lihat menu mana yang paling laku dan paling untung, pantau modal bahan baku, serta dapatkan saran bisnis otomatis di Paket Pro & Enterprise.',
                            [
                              'Pengelompokan menu berdasarkan laris tidaknya dan besarnya keuntungan',
                              'Peringatan jika kenaikan harga bahan membuat keuntungan menipis',
                              'Saran menu tambahan untuk ditawarkan ke pembeli dan saran belanja ulang'
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
                            businessType={businessType}
                          />
                        ))}

                      {activeTab === 'seasonal-analytics' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Analisis Hari Besar & Perkiraan Stok',
                            'Pantau penjualan harian hingga tahunan, tandai momen hari besar/liburan, dan perkirakan stok bahan yang perlu disiapkan di Paket Pro & Enterprise.',
                            [
                              'Grafik penjualan dan pemakaian bahan dari harian sampai tahunan',
                              'Perbandingan hari biasa vs hari ramai (Ramadan, Lebaran, Libur, Promo)',
                              'Pengingat persiapan stok menjelang hari besar'
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
                            onOpenHolidayReminder={setSelectedReminderEvent}
                            businessType={businessType}
                          />
                        ))}

                      {activeTab === 'audit-trail' &&
                        (subscriptionPlan === 'starter' ? (
                          renderStarterLockedFeature(
                            'Catatan Aktivitas & Riwayat Karyawan',
                            'Lihat riwayat lengkap setiap perubahan stok, update harga bahan, revisi nota, dan pembatalan pesanan di Paket Pro & Enterprise.',
                            [
                              'Nama petugas tercatat jelas di setiap perubahan stok dan pembatalan',
                              'Riwayat stok sebelum dan sesudah perubahan plus alasan revisi nota',
                              'Pemisahan jelas antara pesanan batal sebelum dimasak dan bahan terbuang'
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
    <>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {renderCurrentView()}
      </AnimatePresence>

      <SimulationSetupModal
        isOpen={simulationSetupOpen}
        onClose={() => {
          setSimulationSetupOpen(false);
          setPendingSimulationPlan(null);
        }}
        initialBusinessType={merchantSettings?.businessType || 'fnb'}
        initialPaymentFlow={merchantSettings?.paymentFlow || 'pay_first'}
        pendingPlan={pendingSimulationPlan}
        onConfirm={handleConfirmSimulation}
      />

      <AnimatePresence>
        {selectedReminderMeta && (
          <HolidayReminderModal
            key={selectedReminderMeta.id}
            isOpen={Boolean(selectedReminderMeta)}
            onClose={() => setSelectedReminderEvent(null)}
            reminder={selectedReminderMeta}
            referenceData={holidayReferenceData}
            favoriteMenuQuotas={favoriteMenuQuotas}
            onNavigateInventory={() => setActiveTab('inventory')}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Building2, ShieldCheck } from 'lucide-react';
import LandingPage from './components/landing/LandingPage';
import Register from './Page/auth/Register';
import Login from './Page/auth/Login';
import DashboardNavbar from './components/dashboard/DashboardNavbar';
import PosModule from './components/dashboard/PosModule';
import MenuManagementModule from './components/dashboard/menu/MenuManagementModal'; 
import InventoryModule from './components/dashboard/inventory/InventoryModule';
import AlertsModule from './components/dashboard/AlertsModule';
import ReportingModule from './components/dashboard/reporting/ReportingModule';
import SelfOrderModule from './components/dashboard/self-order/SelfOrderModule';
import EmployeeModule from './components/dashboard/employee/EmployeeModule';
import { supabase } from './services/supabaseClient';
import { fetchProducts, fetchIngredients, saveTransaction, updateIngredientStock } from './services/stockoService';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('pos'); 

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [userRole, setUserRole] = useState('superadmin');

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

  const handleAddStockLog = (newLog) => {
    setStockLogs(prev => [newLog, ...prev]);
  };

  const checkUserRole = async (userId) => {
    try {
      const { data } = await supabase.from('user_roles').select('role').eq('id', userId).single();
      if (data && data.role) {
        setUserRole(data.role);
        if (data.role === 'stocker') {
          setActiveTab('inventory');
        } else {
          setActiveTab('pos');
        }
      } else {
        setUserRole('superadmin'); 
        setActiveTab('pos');
      }
    } catch {
      setUserRole('superadmin');
      setActiveTab('pos');
    }
  };

  useEffect(() => {
    async function loadBackendData() {
      const dbProducts = await fetchProducts();
      const dbIngredients = await fetchIngredients();

      if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
      if (dbIngredients && dbIngredients.length > 0) setIngredients(dbIngredients);
    }
    loadBackendData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRole(session.user.id);
        setCurrentView('app'); 
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkUserRole(session.user.id);
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

  const alertCount = ingredients.filter(ing => ing.stock <= ing.minLimit || checkExpiryAlert(ing.expiryDate)).length;

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

  const handleCheckout = async (cartItems, tableNumber = 'Kasir Utama', paymentMethod = 'cash') => {
    // Jika Paket Pro atau Enterprise aktif, jalankan mesin pemotong stok otomatis (BOM Engine)
    if (subscriptionPlan !== 'starter') {
      let updatedIngredients = [...ingredients];
      const newLogs = [];

      for (let cartItem of cartItems) {
        if (cartItem.recipe && Array.isArray(cartItem.recipe)) {
          for (let ingredientNeeded of cartItem.recipe) {
            const cleanTarget = (ingredientNeeded.name || '').split(' | ')[0].toLowerCase().trim();
            const index = updatedIngredients.findIndex(
              ing => (ing.name || '').toLowerCase().includes(cleanTarget)
            );

            if (index >= 0) {
              const storageUnit = updatedIngredients[index].unit;
              const deductionPerUnit = calculateDeductionInStorageUnit(ingredientNeeded.qty, ingredientNeeded.unit, storageUnit);
              const totalDeduction = Number((deductionPerUnit * cartItem.qty).toFixed(3));
              
              const currentStock = updatedIngredients[index].stock;
              const newStock = Math.max(0, Number((currentStock - totalDeduction).toFixed(3)));
              
              updatedIngredients[index] = {
                ...updatedIngredients[index],
                stock: newStock
              };

              await updateIngredientStock(updatedIngredients[index].id, newStock);

              newLogs.push({
                id: 'BOM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                timestamp: new Date().toISOString(),
                itemName: (updatedIngredients[index].name || '').split(' | ')[0],
                type: 'KELUAR (Otomatis BOM POS)',
                qty: `-${totalDeduction} ${storageUnit}`,
                outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
                note: `Penjualan ${cartItem.qty}x ${cartItem.name}`
              });
            }
          }
        }
      }

      setIngredients(updatedIngredients);
      if (newLogs.length > 0) {
        setStockLogs(prev => [...newLogs, ...prev]);
      }
    }

    const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    await saveTransaction(currentSubtotal, cartItems, tableNumber, paymentMethod);
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
              onLoginSuccess={() => setCurrentView('app')}
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
                setActiveTab={setActiveTab} 
                alertCount={alertCount} 
                userRole={userRole}
                subscriptionPlan={subscriptionPlan}
                setSubscriptionPlan={setSubscriptionPlan}
                onBackToLanding={async () => {
                  await supabase.auth.signOut();
                  setCurrentView('landing');
                  setActiveTab('pos');
                }}
              />
              
              {/* Konten Utama */}
              <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${
                activeTab === 'self-order' && subscriptionPlan !== 'starter'
                  ? 'p-0 ml-0'
                  : 'p-5 sm:p-6 md:p-10 pt-20 lg:pt-8 lg:ml-72'
              }`}>
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
                            <span className="text-xs font-extrabold tracking-tight">Enterprise Multi-Outlet & Central Kitchen</span>
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
                        <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">Cabang:</span>
                        <select
                          value={activeOutlet}
                          onChange={(e) => setActiveOutlet(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                        >
                          <option value="Semua Cabang (Terpusat)">Semua Cabang (Terpusat)</option>
                          <option value="Cabang Utama - Makassar">Cabang Utama - Makassar</option>
                          <option value="Cabang 2 - Bandung">Cabang 2 - Bandung</option>
                          <option value="Cabang 3 - Jakarta">Cabang 3 - Jakarta</option>
                          <option value="Central Kitchen (Gudang Pusat)">Central Kitchen (Gudang Pusat)</option>
                        </select>
                      </div>
                    </motion.div>
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
                        />
                      )}

                      {activeTab === 'self-order' && (
                        subscriptionPlan === 'starter' ? (
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
                        )
                      )}

                      {activeTab === 'menu-management' && (
                        <MenuManagementModule
                          products={products}
                          setProducts={setProducts}
                          ingredients={ingredients}
                          subscriptionPlan={subscriptionPlan}
                          onUpgradePlan={setSubscriptionPlan}
                        />
                      )}

                      {activeTab === 'inventory' && (
                        subscriptionPlan === 'starter' ? (
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
                            subscriptionPlan={subscriptionPlan}
                            activeOutlet={activeOutlet}
                            stockLogs={stockLogs}
                            onAddStockLog={handleAddStockLog}
                            onUpgradePlan={setSubscriptionPlan}
                          />
                        )
                      )}

                      {activeTab === 'alerts' && (
                        subscriptionPlan === 'starter' ? (
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
                        )
                      )}

                      {activeTab === 'employees' && (
                        <EmployeeModule
                          subscriptionPlan={subscriptionPlan}
                          onUpgradePlan={setSubscriptionPlan}
                        />
                      )}

                      {activeTab === 'reporting' && (
                        <ReportingModule
                          subscriptionPlan={subscriptionPlan}
                          activeOutlet={activeOutlet}
                          onUpgradePlan={setSubscriptionPlan}
                        />
                      )}
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

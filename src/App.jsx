import React, { useState, useEffect } from 'react';
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
import { supabase } from './services/supabaseClient';
import { fetchProducts, fetchIngredients, saveTransaction, updateIngredientStock } from './services/stockoService';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('pos'); 

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

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
        setCurrentView('app'); 
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentView('app');
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

  const handleCheckout = async (cartItems, tableNumber = 'Kasir Utama') => {
    let updatedIngredients = [...ingredients];

    for (let cartItem of cartItems) {
      if (cartItem.recipe && Array.isArray(cartItem.recipe)) {
        for (let ingredientNeeded of cartItem.recipe) {
          const index = updatedIngredients.findIndex(
            ing => ing.name.toLowerCase().includes(ingredientNeeded.name.toLowerCase().trim())
          );

          if (index >= 0) {
            const storageUnit = updatedIngredients[index].unit;
            const deductionPerUnit = calculateDeductionInStorageUnit(ingredientNeeded.qty, ingredientNeeded.unit, storageUnit);
            const totalDeduction = deductionPerUnit * cartItem.qty;
            
            const currentStock = updatedIngredients[index].stock;
            const newStock = Math.max(0, Number((currentStock - totalDeduction).toFixed(3)));
            
            updatedIngredients[index] = {
              ...updatedIngredients[index],
              stock: newStock
            };

            await updateIngredientStock(updatedIngredients[index].id, newStock);
          }
        }
      }
    }

    setIngredients(updatedIngredients);

    const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setTotalRevenue(prev => prev + currentSubtotal);
    setTransactionCount(prev => prev + 1);

    await saveTransaction(currentSubtotal, cartItems, tableNumber);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onOpenApp={() => setCurrentView('app')} 
        onOpenRegister={() => setCurrentView('register')}
        onOpenLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onBack={() => setCurrentView('landing')} 
        onOpenLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <Login 
        onBack={() => setCurrentView('landing')} 
        onOpenRegister={() => setCurrentView('register')}
        onLoginSuccess={() => setCurrentView('app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-zinc-900 font-sans flex flex-col md:flex-row relative">
      
      {/* Navbar Samping */}
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={alertCount} 
        onBackToLanding={() => {
          setCurrentView('landing');
          setActiveTab('pos');
        }}
      />
      
      {/* Konten Utama: Jika di self-order margin kiri 0, jika di menu lain di desktop diberi margin kiri md:ml-72 */}
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${
        activeTab === 'self-order' ? 'p-0 ml-0' : 'p-6 md:p-10 md:ml-72'
      }`}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'pos' && (
            <PosModule products={products} ingredients={ingredients} onCheckout={handleCheckout} />
          )}
          {activeTab === 'self-order' && (
            <SelfOrderModule 
              products={products} 
              ingredients={ingredients} 
              onCheckout={handleCheckout} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'menu-management' && (
            <MenuManagementModule products={products} setProducts={setProducts} />
          )}
          {activeTab === 'inventory' && (
            <InventoryModule products={products} ingredients={ingredients} setIngredients={setIngredients} />
          )}
          {activeTab === 'alerts' && (
            <AlertsModule ingredients={ingredients} />
          )}
          {activeTab === 'reporting' && (
            <ReportingModule totalRevenue={totalRevenue} transactionCount={transactionCount} />
          )}
        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import Register from './Page/auth/Register';
import Login from './Page/auth/Login';
import DashboardNavbar from './components/dashboard/DashboardNavbar';
import PosModule from './components/dashboard/PosModule';
import MenuManagementModule from './components/dashboard/MenuManagementModal'; 
import InventoryModule from './components/dashboard/InventoryModule';
import AlertsModule from './components/dashboard/AlertsModule';
import ReportingModule from './components/dashboard/ReportingModule';

export default function App() {
  // Pengatur Tampilan Utama: 'landing' | 'register' | 'login' | 'app'
  const [currentView, setCurrentView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('pos'); 
  

  // --- VARIAN MENU KASIR POS ---
  const [products, setProducts] = useState([
    { 
      id: 1, name: "Kopi Susu Gula Aren", category: "Minuman", price: 18000, expiryDate: "25 Oct 2026", 
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Biji Kopi Arabika", qty: 20, unit: "gram" },
        { name: "Susu Segar UHT", qty: 100, unit: "ml" },
        { name: "Gula Aren Cair", qty: 30, unit: "ml" },
        { name: "Gelas Plastik 16oz", qty: 1, unit: "pcs" }
      ]
    },
    { 
      id: 2, name: "Matcha Latte", category: "Minuman", price: 24000, expiryDate: "30 Nov 2026", 
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Bubuk Matcha Premium", qty: 15, unit: "gram" },
        { name: "Susu Segar UHT", qty: 120, unit: "ml" },
        { name: "Gelas Plastik 16oz", qty: 1, unit: "pcs" }
      ]
    },
    { 
      id: 3, name: "Croissant Butter", category: "Bakery", price: 22000, expiryDate: "18 Sep 2026", 
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Tepung Terigu Premium", qty: 100, unit: "gram" },
        { name: "Butter Unsalted", qty: 30, unit: "gram" }
      ]
    },
    { 
      id: 4, name: "Chicken Katsu Ricebowl", category: "Makanan", price: 35000, expiryDate: "20 Sep 2026", 
      image: "https://images.unsplash.com/photo-1604908176997-125f2596f378?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Daging Ayam Fillet", qty: 150, unit: "gram" },
        { name: "Beras Putih", qty: 200, unit: "gram" }
      ]
    },
    { 
      id: 5, name: "Americano Ice", category: "Minuman", price: 15000, expiryDate: "10 Dec 2026", 
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Biji Kopi Arabika", qty: 25, unit: "gram" },
        { name: "Gelas Plastik 16oz", qty: 1, unit: "pcs" }
      ]
    },
    { 
      id: 6, name: "Spaghetti Carbonara", category: "Makanan", price: 38000, expiryDate: "05 Oct 2026", 
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80",
      recipe: [
        { name: "Pasta Spaghetti", qty: 120, unit: "gram" },
        { name: "Susu Segar UHT", qty: 80, unit: "ml" },
        { name: "Keju Cheddar Parut", qty: 25, unit: "gram" }
      ]
    }
  ]);

  // --- DATA BAHAN BAKU GUDANG ---
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Biji Kopi Arabika", stock: 2500, unit: "gram", minLimit: 500, expiryDate: "20 Dec 2026" },
    { id: 2, name: "Susu Segar UHT", stock: 1.5, unit: "liter", minLimit: 2, expiryDate: "20 Sep 2026" },
    { id: 3, name: "Gula Aren Cair", stock: 18, unit: "liter", minLimit: 5, expiryDate: "30 Nov 2026" },
    { id: 4, name: "Bubuk Matcha Premium", stock: 500, unit: "gram", minLimit: 100, expiryDate: "15 Jan 2027" },
    { id: 5, name: "Tepung Terigu Premium", stock: 30, unit: "kg", minLimit: 5, expiryDate: "10 Feb 2027" },
    { id: 6, name: "Butter Unsalted", stock: 2, unit: "kg", minLimit: 0.5, expiryDate: "05 Oct 2026" },
    { id: 7, name: "Daging Ayam Fillet", stock: 10, unit: "kg", minLimit: 2, expiryDate: "22 Sep 2026" },
    { id: 8, name: "Beras Putih", stock: 25, unit: "kg", minLimit: 5, expiryDate: "30 Dec 2027" },
    { id: 9, name: "Pasta Spaghetti", stock: 5, unit: "kg", minLimit: 1, expiryDate: "12 Nov 2027" },
    { id: 10, name: "Keju Cheddar Parut", stock: 1.2, unit: "kg", minLimit: 0.3, expiryDate: "28 Sep 2026" },
    { id: 11, name: "Gelas Plastik 16oz", stock: 150, unit: "pcs", minLimit: 30, expiryDate: "31 Dec 2028" }
  ]);

  const [totalRevenue, setTotalRevenue] = useState(2995000);
  const [transactionCount, setTransactionCount] = useState(124);

  // Cek Peringatan Kadaluwarsa (<= 30 hari)
  const checkExpiryAlert = (dateString) => {
    if (!dateString) return false;
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30; 
  };

  // Jumlah Alert di Sidebar
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

  // Logika Checkout POS: Mengurangi Stok Gudang Berdasarkan Resep BOM
  const handleCheckout = (cartItems) => {
    setIngredients(prevIngredients => {
      let updatedIngredients = [...prevIngredients];

      cartItems.forEach(cartItem => {
        if (cartItem.recipe && Array.isArray(cartItem.recipe)) {
          cartItem.recipe.forEach(ingredientNeeded => {
            const index = updatedIngredients.findIndex(
              ing => ing.name.toLowerCase().includes(ingredientNeeded.name.toLowerCase().trim())
            );

            if (index >= 0) {
              const storageUnit = updatedIngredients[index].unit;
              const deductionPerUnit = calculateDeductionInStorageUnit(ingredientNeeded.qty, ingredientNeeded.unit, storageUnit);
              const totalDeduction = deductionPerUnit * cartItem.qty;
              
              const currentStock = updatedIngredients[index].stock;
              updatedIngredients[index] = {
                ...updatedIngredients[index],
                stock: Math.max(0, Number((currentStock - totalDeduction).toFixed(3)))
              };
            }
          });
        }
      });

      return updatedIngredients;
    });

    const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setTotalRevenue(prev => prev + currentSubtotal);
    setTransactionCount(prev => prev + 1);
  };

  // Render Tampilan Berdasarkan State `currentView`
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
    <div className="min-h-screen bg-[#f8f9fb] text-zinc-900 font-sans flex flex-col md:flex-row">
      <DashboardNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertCount={alertCount} 
        onBackToLanding={() => {
          setCurrentView('landing');
          setActiveTab('pos');
        }}
      />
      
      <main className="flex-1 w-full p-6 md:p-10 md:ml-72">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'pos' && (
            <PosModule products={products} ingredients={ingredients} onCheckout={handleCheckout} />
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
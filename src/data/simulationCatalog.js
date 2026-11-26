const svgFallback = (label, bg = '#FEF3C7', accent = '#D97706') => {
  const safe = String(label || 'Stocko').slice(0, 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" fill="${bg}"/><circle cx="200" cy="115" r="46" fill="${accent}" opacity="0.16"/><rect x="172" y="87" width="56" height="56" rx="14" fill="${accent}"/><text x="200" y="196" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#141414">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function getProductFallbackImage(name, category) {
  return svgFallback(name || category || 'Produk');
}

const daysFromNowIso = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export function createSimulationFnbIngredients() {
  const today = daysFromNowIso(0);
  return [
    {
      id: 'SIM-ING-1',
      name: 'Biji Kopi Arabika | Bahan Minuman',
      stock: 4.5,
      unit: 'kg',
      minLimit: 1.5,
      unitPrice: 185000,
      currentMarketPrice: 185000,
      initialPurchasePrice: 175000,
      entryDate: daysFromNowIso(-10),
      expiryDate: daysFromNowIso(150),
      batches: [
        {
          id: 'SIM-B-1',
          batchCode: 'KOPI-01',
          qty: 4.5,
          initialQty: 5,
          unit: 'kg',
          entryDate: daysFromNowIso(-10),
          expiryDate: daysFromNowIso(150),
          stockerName: 'Stok Awal'
        }
      ]
    },
    {
      id: 'SIM-ING-2',
      name: 'Susu Segar UHT | Bahan Minuman',
      stock: 2.4,
      unit: 'liter',
      minLimit: 3,
      unitPrice: 22000,
      currentMarketPrice: 22000,
      initialPurchasePrice: 20500,
      entryDate: daysFromNowIso(-7),
      expiryDate: daysFromNowIso(12),
      batches: [
        {
          id: 'SIM-B-2',
          batchCode: 'SUSU-A1',
          qty: 2.4,
          initialQty: 6,
          unit: 'liter',
          entryDate: daysFromNowIso(-7),
          expiryDate: daysFromNowIso(12),
          stockerName: 'Stok Awal'
        }
      ]
    },
    {
      id: 'SIM-ING-3',
      name: 'Gula Aren Cair | Bahan Minuman',
      stock: 3.2,
      unit: 'liter',
      minLimit: 1,
      unitPrice: 28000,
      currentMarketPrice: 28000,
      initialPurchasePrice: 28000,
      entryDate: daysFromNowIso(-12),
      expiryDate: daysFromNowIso(90),
      batches: [
        {
          id: 'SIM-B-3',
          batchCode: 'AREN-01',
          qty: 3.2,
          initialQty: 4,
          unit: 'liter',
          entryDate: daysFromNowIso(-12),
          expiryDate: daysFromNowIso(90),
          stockerName: 'Stok Awal'
        }
      ]
    },
    {
      id: 'SIM-ING-4',
      name: 'Bubuk Matcha | Bahan Minuman',
      stock: 0,
      unit: 'kg',
      minLimit: 0.5,
      unitPrice: 240000,
      currentMarketPrice: 240000,
      initialPurchasePrice: 225000,
      entryDate: daysFromNowIso(-20),
      expiryDate: daysFromNowIso(110),
      batches: []
    },
    {
      id: 'SIM-ING-5',
      name: 'Cup Plastik 12oz | Kemasan',
      stock: 120,
      unit: 'pcs',
      minLimit: 30,
      unitPrice: 950,
      currentMarketPrice: 950,
      initialPurchasePrice: 900,
      entryDate: daysFromNowIso(-5),
      expiryDate: daysFromNowIso(365),
      batches: [
        {
          id: 'SIM-B-5',
          batchCode: 'CUP-01',
          qty: 120,
          initialQty: 150,
          unit: 'pcs',
          entryDate: daysFromNowIso(-5),
          expiryDate: daysFromNowIso(365),
          stockerName: 'Stok Awal'
        }
      ]
    },
    {
      id: 'SIM-ING-6',
      name: 'Croissant Butter Beku | Bahan Bakery',
      stock: 18,
      unit: 'pcs',
      minLimit: 6,
      unitPrice: 9500,
      currentMarketPrice: 9500,
      initialPurchasePrice: 9000,
      entryDate: today,
      expiryDate: daysFromNowIso(18),
      batches: [
        {
          id: 'SIM-B-6',
          batchCode: 'BKR-01',
          qty: 18,
          initialQty: 24,
          unit: 'pcs',
          entryDate: today,
          expiryDate: daysFromNowIso(18),
          stockerName: 'Stok Awal'
        }
      ]
    }
  ];
}

export function createSimulationFnbProducts() {
  return [
    {
      id: 'SIM-FNB-1',
      name: 'Kopi Susu Gula Aren',
      category: 'Minuman',
      price: 22000,
      stock: 15,
      minLimit: 3,
      unit: 'porsi',
      productMode: 'fnb',
      image:
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
      recipe: [
        { name: 'Biji Kopi Arabika | Bahan Minuman', qty: 18, unit: 'gram' },
        { name: 'Susu Segar UHT | Bahan Minuman', qty: 120, unit: 'ml' },
        { name: 'Gula Aren Cair | Bahan Minuman', qty: 25, unit: 'ml' },
        { name: 'Cup Plastik 12oz | Kemasan', qty: 1, unit: 'pcs' }
      ],
      expiryDate: daysFromNowIso(30)
    },
    {
      id: 'SIM-FNB-2',
      name: 'Caffe Latte Dingin',
      category: 'Minuman',
      price: 25000,
      stock: 3,
      minLimit: 3,
      unit: 'porsi',
      productMode: 'fnb',
      image:
        'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
      recipe: [
        { name: 'Biji Kopi Arabika | Bahan Minuman', qty: 18, unit: 'gram' },
        { name: 'Susu Segar UHT | Bahan Minuman', qty: 150, unit: 'ml' },
        { name: 'Cup Plastik 12oz | Kemasan', qty: 1, unit: 'pcs' }
      ],
      expiryDate: daysFromNowIso(30)
    },
    {
      id: 'SIM-FNB-3',
      name: 'Matcha Latte Premium',
      category: 'Minuman',
      price: 26000,
      stock: 0,
      minLimit: 3,
      unit: 'porsi',
      productMode: 'fnb',
      image:
        'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
      recipe: [
        { name: 'Bubuk Matcha | Bahan Minuman', qty: 15, unit: 'gram' },
        { name: 'Susu Segar UHT | Bahan Minuman', qty: 150, unit: 'ml' },
        { name: 'Cup Plastik 12oz | Kemasan', qty: 1, unit: 'pcs' }
      ],
      expiryDate: daysFromNowIso(30)
    },
    {
      id: 'SIM-FNB-4',
      name: 'Butter Croissant',
      category: 'Bakery',
      price: 24000,
      stock: 10,
      minLimit: 3,
      unit: 'porsi',
      productMode: 'fnb',
      image:
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      recipe: [{ name: 'Croissant Butter Beku | Bahan Bakery', qty: 1, unit: 'pcs' }],
      expiryDate: daysFromNowIso(18)
    }
  ];
}

export function createSimulationRetailProducts() {
  return [
    {
      id: 'SIM-RTL-1',
      name: 'Air Mineral Botol 600ml',
      category: 'Minuman Kemasan',
      sku: 'MNM-001',
      variantLabel: 'Botol 600ml',
      unit: 'botol',
      price: 4000,
      purchasePrice: 2200,
      stock: 24,
      minLimit: 6,
      productMode: 'retail',
      image: '/images/retail/air-mineral-600ml.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(180)
    },
    {
      id: 'SIM-RTL-2',
      name: 'Teh Melati Botol 350ml',
      category: 'Minuman Kemasan',
      sku: 'MNM-002',
      variantLabel: 'Dingin / Original',
      unit: 'botol',
      price: 6000,
      purchasePrice: 3800,
      stock: 4,
      minLimit: 5,
      productMode: 'retail',
      image: '/images/retail/teh-melati-350ml.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(90)
    },
    {
      id: 'SIM-RTL-3',
      name: 'Kopi Susu Kaleng 220ml',
      category: 'Minuman Kemasan',
      sku: 'MNM-003',
      variantLabel: 'Kaleng Siap Minum',
      unit: 'pcs',
      price: 9000,
      purchasePrice: 5800,
      stock: 0,
      minLimit: 5,
      productMode: 'retail',
      image: '/images/retail/kopi-susu-kaleng-220ml.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(120)
    },
    {
      id: 'SIM-RTL-4',
      name: 'Keripik Kentang Original 68g',
      category: 'Makanan Ringan',
      sku: 'SNK-001',
      variantLabel: 'Rasa Original 68g',
      unit: 'pack',
      price: 12000,
      purchasePrice: 7800,
      stock: 16,
      minLimit: 5,
      productMode: 'retail',
      image: '/images/retail/keripik-kentang-68g.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(150)
    },
    {
      id: 'SIM-RTL-5',
      name: 'Roti Tawar Kupas 400g',
      category: 'Makanan Ringan',
      sku: 'SNK-002',
      variantLabel: 'Isi 10 Lembar',
      unit: 'pack',
      price: 16500,
      purchasePrice: 11500,
      stock: 3,
      minLimit: 4,
      productMode: 'retail',
      image: '/images/retail/roti-tawar-kupas-400g.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(5)
    },
    {
      id: 'SIM-RTL-6',
      name: 'Minyak Goreng Pouch 1L',
      category: 'Sembako & Kebutuhan',
      sku: 'SMB-001',
      variantLabel: 'Pouch 1 Liter',
      unit: 'pack',
      price: 19000,
      purchasePrice: 15200,
      stock: 12,
      minLimit: 4,
      productMode: 'retail',
      image: '/images/retail/minyak-goreng-1l.jpg',
      recipe: [],
      expiryDate: daysFromNowIso(240)
    }
  ];
}

function hoursAgoIso(hours) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export function createSimulationAnalyticsData(businessType = 'fnb') {
  const isRetail = businessType === 'retail';

  const transactions = isRetail
    ? [
        {
          id: 'SIM-TX-RTL-1',
          total_amount: 68000,
          table_number: 'Kasir Ritel #1',
          payment_method: 'qris',
          order_channel: 'take_away',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(1.5),
          items: [
            { id: 'SIM-RTL-6', name: 'Minyak Goreng Pouch 1L', price: 19000, qty: 2, category: 'Sembako & Kebutuhan' },
            { id: 'SIM-RTL-4', name: 'Keripik Kentang Original 68g', price: 12000, qty: 1, category: 'Makanan Ringan' },
            { id: 'SIM-RTL-1', name: 'Air Mineral Botol 600ml', price: 4000, qty: 3, category: 'Minuman Kemasan' },
            { id: 'SIM-RTL-2', name: 'Teh Melati Botol 350ml', price: 6000, qty: 1, category: 'Minuman Kemasan' }
          ]
        },
        {
          id: 'SIM-TX-RTL-2',
          total_amount: 48500,
          table_number: 'Kasir Ritel #1',
          payment_method: 'cash',
          order_channel: 'takeaway',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(4),
          items: [
            { id: 'SIM-RTL-5', name: 'Roti Tawar Kupas 400g', price: 16500, qty: 1, category: 'Makanan Ringan' },
            { id: 'SIM-RTL-4', name: 'Keripik Kentang Original 68g', price: 12000, qty: 2, category: 'Makanan Ringan' },
            { id: 'SIM-RTL-1', name: 'Air Mineral Botol 600ml', price: 4000, qty: 2, category: 'Minuman Kemasan' }
          ]
        },
        {
          id: 'SIM-TX-RTL-3',
          total_amount: 91000,
          table_number: 'Kasir Ritel #1',
          payment_method: 'qris',
          order_channel: 'takeaway',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(26),
          items: [
            { id: 'SIM-RTL-6', name: 'Minyak Goreng Pouch 1L', price: 19000, qty: 3, category: 'Sembako & Kebutuhan' },
            { id: 'SIM-RTL-3', name: 'Kopi Susu Kaleng 220ml', price: 9000, qty: 2, category: 'Minuman Kemasan' },
            { id: 'SIM-RTL-1', name: 'Air Mineral Botol 600ml', price: 4000, qty: 4, category: 'Minuman Kemasan' }
          ]
        },
        {
          id: 'SIM-TX-RTL-4',
          total_amount: 75000,
          table_number: 'Kasir Ritel #2',
          payment_method: 'card',
          order_channel: 'takeaway',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(72),
          items: [
            { id: 'SIM-RTL-5', name: 'Roti Tawar Kupas 400g', price: 16500, qty: 2, category: 'Makanan Ringan' },
            { id: 'SIM-RTL-2', name: 'Teh Melati Botol 350ml', price: 6000, qty: 5, category: 'Minuman Kemasan' },
            { id: 'SIM-RTL-4', name: 'Keripik Kentang Original 68g', price: 12000, qty: 1, category: 'Makanan Ringan' }
          ]
        }
      ]
    : [
        {
          id: 'SIM-TX-FNB-1',
          total_amount: 92000,
          table_number: 'Meja 04',
          payment_method: 'qris',
          order_channel: 'dine_in',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(1.2),
          items: [
            { id: 'SIM-FNB-1', name: 'Kopi Susu Gula Aren', price: 22000, qty: 2, category: 'Minuman' },
            { id: 'SIM-FNB-4', name: 'Butter Croissant', price: 24000, qty: 2, category: 'Bakery' }
          ]
        },
        {
          id: 'SIM-TX-FNB-2',
          total_amount: 76000,
          table_number: 'Meja 02',
          payment_method: 'cash',
          order_channel: 'dine_in',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(3.5),
          items: [
            { id: 'SIM-FNB-3', name: 'Matcha Latte Premium', price: 26000, qty: 1, category: 'Minuman' },
            { id: 'SIM-FNB-2', name: 'Iced Americano', price: 25000, qty: 2, category: 'Minuman' }
          ]
        },
        {
          id: 'SIM-TX-FNB-3',
          total_amount: 118000,
          table_number: 'Meja 07',
          payment_method: 'qris',
          order_channel: 'dine_in',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(25),
          items: [
            { id: 'SIM-FNB-1', name: 'Kopi Susu Gula Aren', price: 22000, qty: 3, category: 'Minuman' },
            { id: 'SIM-FNB-3', name: 'Matcha Latte Premium', price: 26000, qty: 2, category: 'Minuman' }
          ]
        },
        {
          id: 'SIM-TX-FNB-4',
          total_amount: 97000,
          table_number: 'Takeaway #12',
          payment_method: 'card',
          order_channel: 'takeaway',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(52),
          items: [
            { id: 'SIM-FNB-4', name: 'Butter Croissant', price: 24000, qty: 2, category: 'Bakery' },
            { id: 'SIM-FNB-2', name: 'Iced Americano', price: 25000, qty: 1, category: 'Minuman' },
            { id: 'SIM-FNB-1', name: 'Kopi Susu Gula Aren', price: 22000, qty: 1, category: 'Minuman' }
          ]
        },
        {
          id: 'SIM-TX-FNB-5',
          total_amount: 140000,
          table_number: 'Meja 01',
          payment_method: 'qris',
          order_channel: 'dine_in',
          payment_flow: 'pay_first',
          payment_status: 'paid',
          kitchen_status: 'served',
          cashier_name: 'Kasir Simulasi',
          created_at: hoursAgoIso(120),
          items: [
            { id: 'SIM-FNB-1', name: 'Kopi Susu Gula Aren', price: 22000, qty: 4, category: 'Minuman' },
            { id: 'SIM-FNB-3', name: 'Matcha Latte Premium', price: 26000, qty: 2, category: 'Minuman' }
          ]
        }
      ];

  const stockMovements = isRetail
    ? [
        {
          id: 'SIM-MOV-RTL-1',
          ingredientId: 'SIM-RTL-6',
          ingredientName: 'Minyak Goreng Pouch 1L',
          movementType: 'BOM_SALE',
          qtyChange: -2,
          beforeStock: 14,
          afterStock: 12,
          unit: 'pack',
          costImpact: 30400,
          orderId: 'SIM-TX-RTL-1',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Penjualan POS Minimarket (2 pack Minyak Goreng)',
          createdAt: hoursAgoIso(1.5)
        },
        {
          id: 'SIM-MOV-RTL-2',
          ingredientId: 'SIM-RTL-5',
          ingredientName: 'Roti Tawar Kupas 400g',
          movementType: 'BOM_SALE',
          qtyChange: -1,
          beforeStock: 4,
          afterStock: 3,
          unit: 'pack',
          costImpact: 11500,
          orderId: 'SIM-TX-RTL-2',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Penjualan POS Minimarket (1 pack Roti Tawar Kupas)',
          createdAt: hoursAgoIso(4)
        },
        {
          id: 'SIM-MOV-RTL-3',
          ingredientId: 'SIM-RTL-1',
          ingredientName: 'Air Mineral Botol 600ml',
          movementType: 'STOCK_IN',
          qtyChange: 24,
          beforeStock: 0,
          afterStock: 24,
          unit: 'botol',
          costImpact: 52800,
          orderId: null,
          userId: 'OP-SIM-STOCKER',
          userName: 'Petugas Gudang',
          role: 'stocker',
          stockerName: 'Petugas Gudang',
          reason: 'Restock 1 karton Air Mineral Botol 600ml dari distributor',
          createdAt: hoursAgoIso(24)
        },
        {
          id: 'SIM-MOV-RTL-4',
          ingredientId: 'SIM-RTL-2',
          ingredientName: 'Teh Melati Botol 350ml',
          movementType: 'BOM_SALE',
          qtyChange: -5,
          beforeStock: 9,
          afterStock: 4,
          unit: 'botol',
          costImpact: 19000,
          orderId: 'SIM-TX-RTL-4',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Penjualan POS Minimarket (5 botol Teh Melati)',
          createdAt: hoursAgoIso(72)
        }
      ]
    : [
        {
          id: 'SIM-MOV-1',
          ingredientId: 'SIM-ING-1',
          ingredientName: 'Biji Kopi Arabika',
          movementType: 'BOM_SALE',
          qtyChange: -0.18,
          beforeStock: 2.58,
          afterStock: 2.4,
          unit: 'kg',
          costImpact: 33300,
          orderId: 'SIM-TX-FNB-1',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Pemotongan otomatis resep POS (10 porsi kopi)',
          createdAt: hoursAgoIso(1.5)
        },
        {
          id: 'SIM-MOV-2',
          ingredientId: 'SIM-ING-2',
          ingredientName: 'Susu Segar UHT',
          movementType: 'BOM_SALE',
          qtyChange: -1.35,
          beforeStock: 9.35,
          afterStock: 8.0,
          unit: 'liter',
          costImpact: 29700,
          orderId: 'SIM-TX-FNB-2',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Pemotongan otomatis resep Kopi Susu & Matcha Latte',
          createdAt: hoursAgoIso(3.5)
        },
        {
          id: 'SIM-MOV-3',
          ingredientId: 'SIM-ING-1',
          ingredientName: 'Biji Kopi Arabika',
          movementType: 'STOCK_IN',
          qtyChange: 2.0,
          beforeStock: 0.58,
          afterStock: 2.58,
          unit: 'kg',
          costImpact: 370000,
          orderId: null,
          userId: 'OP-SIM-STOCKER',
          userName: 'Petugas Gudang',
          role: 'stocker',
          stockerName: 'Petugas Gudang',
          reason: 'Restock batch baru Biji Kopi Arabika #KP-02',
          createdAt: hoursAgoIso(28)
        },
        {
          id: 'SIM-MOV-4',
          ingredientId: 'SIM-ING-4',
          ingredientName: 'Bubuk Matcha',
          movementType: 'BOM_SALE',
          qtyChange: -0.075,
          beforeStock: 0.255,
          afterStock: 0.18,
          unit: 'kg',
          costImpact: 21000,
          orderId: 'SIM-TX-FNB-3',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          reason: 'Pemotongan otomatis resep Matcha Latte Premium',
          createdAt: hoursAgoIso(48)
        }
      ];

  const priceHistory = isRetail
    ? []
    : [
        {
          id: 'SIM-PH-1',
          ingredientId: 'SIM-ING-1',
          ingredientName: 'Biji Kopi Arabika',
          unit: 'kg',
          oldPrice: 170000,
          newPrice: 185000,
          changePct: 8.8,
          notes: 'Kenaikan harga supplier kopi roastery (+8.8%)',
          changedAt: hoursAgoIso(18)
        },
        {
          id: 'SIM-PH-2',
          ingredientId: 'SIM-ING-2',
          ingredientName: 'Susu Segar UHT',
          unit: 'liter',
          oldPrice: 20500,
          newPrice: 22000,
          changePct: 7.3,
          notes: 'Penyesuaian harga karton Susu UHT distributor',
          changedAt: hoursAgoIso(42)
        },
        {
          id: 'SIM-PH-3',
          ingredientId: 'SIM-ING-4',
          ingredientName: 'Bubuk Matcha',
          unit: 'kg',
          oldPrice: 260000,
          newPrice: 280000,
          changePct: 7.7,
          notes: 'Update harga impor Bubuk Matcha Uji',
          changedAt: hoursAgoIso(96)
        }
      ];

  const retailPriceHistory = [
    {
      id: 'SIM-RPH-1',
      productId: 'SIM-RTL-6',
      productName: 'Minyak Goreng Pouch 1L',
      sku: 'SMB-001',
      unit: 'pack',
      oldPrice: 14500,
      newPrice: 15200,
      changePct: 4.8,
      notes: 'Kenaikan harga beli distributor sembako',
      changedBy: 'Admin',
      changedAt: hoursAgoIso(20)
    },
    {
      id: 'SIM-RPH-2',
      productId: 'SIM-RTL-5',
      productName: 'Roti Tawar Kupas 400g',
      sku: 'SNK-002',
      unit: 'pack',
      oldPrice: 11000,
      newPrice: 11500,
      changePct: 4.5,
      notes: 'Update faktur pengiriman pabrik roti pagi',
      changedBy: 'Admin',
      changedAt: hoursAgoIso(60)
    }
  ];

  const auditLogs = isRetail
    ? [
        {
          id: 'SIM-AUD-RTL-1',
          userId: 'OP-SIM-STOCKER',
          userName: 'Petugas Gudang',
          role: 'stocker',
          stockerName: 'Petugas Gudang',
          actionType: 'Stock In',
          entityType: 'product',
          entityId: 'SIM-RTL-1',
          entityName: 'Air Mineral Botol 600ml (MNM-001)',
          beforeValue: '0 botol',
          afterValue: '24 botol',
          deltaLabel: '+24 botol',
          reason: 'Penerimaan stok masuk 1 karton dari distributor',
          outlet: 'Utama',
          createdAt: hoursAgoIso(24)
        },
        {
          id: 'SIM-AUD-RTL-2',
          userId: 'OP-SIM-OWNER',
          userName: 'Admin',
          role: 'superadmin',
          actionType: 'Price Update',
          entityType: 'product',
          entityId: 'SIM-RTL-6',
          entityName: 'Minyak Goreng Pouch 1L (SMB-001)',
          beforeValue: 'Rp 14.500/pack',
          afterValue: 'Rp 15.200/pack',
          deltaLabel: '+4.8%',
          reason: 'Pembaruan harga beli supplier sembako',
          outlet: 'Utama',
          createdAt: hoursAgoIso(20)
        },
        {
          id: 'SIM-AUD-RTL-3',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          actionType: 'Stock Out',
          entityType: 'product',
          entityId: 'SIM-RTL-6',
          entityName: 'Minyak Goreng Pouch 1L (SMB-001)',
          beforeValue: '14 pack',
          afterValue: '12 pack',
          deltaLabel: '-2 pack',
          reason: 'Penjualan POS Minimarket (Kasir Ritel #1)',
          outlet: 'Utama',
          createdAt: hoursAgoIso(1.5)
        }
      ]
    : [
        {
          id: 'SIM-AUD-1',
          userId: 'OP-SIM-STOCKER',
          userName: 'Petugas Gudang',
          role: 'stocker',
          stockerName: 'Petugas Gudang',
          actionType: 'Stock In',
          entityType: 'ingredient',
          entityId: 'SIM-ING-1',
          entityName: 'Biji Kopi Arabika',
          beforeValue: '0.58 kg',
          afterValue: '2.58 kg',
          deltaLabel: '+2 kg',
          reason: 'Penerimaan stok batch baru #KP-02 dari supplier',
          outlet: 'Utama',
          createdAt: hoursAgoIso(28)
        },
        {
          id: 'SIM-AUD-2',
          userId: 'OP-SIM-OWNER',
          userName: 'Admin',
          role: 'superadmin',
          actionType: 'Price Update',
          entityType: 'ingredient',
          entityId: 'SIM-ING-1',
          entityName: 'Biji Kopi Arabika',
          beforeValue: 'Rp 170.000/kg',
          afterValue: 'Rp 185.000/kg',
          deltaLabel: '+8.8%',
          reason: 'Penyesuaian harga pasar bahan baku kopi',
          outlet: 'Utama',
          createdAt: hoursAgoIso(18)
        },
        {
          id: 'SIM-AUD-3',
          userId: 'OP-SIM-KASIR',
          userName: 'Kasir Simulasi',
          role: 'kasir',
          cashierName: 'Kasir Simulasi',
          actionType: 'Stock Out',
          entityType: 'ingredient',
          entityId: 'SIM-ING-2',
          entityName: 'Susu Segar UHT',
          beforeValue: '9.35 liter',
          afterValue: '8.00 liter',
          deltaLabel: '-1.35 liter',
          reason: 'Pemotongan otomatis BOM penjualan POS',
          outlet: 'Utama',
          createdAt: hoursAgoIso(3.5)
        }
      ];

  const stockLogs = isRetail
    ? [
        {
          id: 'LOG-SIM-RTL-1',
          timestamp: hoursAgoIso(24),
          itemName: 'Air Mineral Botol 600ml',
          type: 'MASUK (Restock Supplier)',
          qty: '+24 botol',
          outlet: 'Utama',
          note: 'Stok masuk 1 karton dicatat ke rak toko'
        },
        {
          id: 'LOG-SIM-RTL-2',
          timestamp: hoursAgoIso(4),
          itemName: 'Roti Tawar Kupas 400g',
          type: 'KELUAR (Otomatis POS Ritel)',
          qty: '-1 pack',
          outlet: 'Utama',
          note: 'Penjualan POS Minimarket (sisa mendekati batas minimum)'
        },
        {
          id: 'LOG-SIM-RTL-3',
          timestamp: hoursAgoIso(1.5),
          itemName: 'Minyak Goreng Pouch 1L',
          type: 'KELUAR (Otomatis POS Ritel)',
          qty: '-2 pack',
          outlet: 'Utama',
          note: 'Penjualan kasir ritel otomatis potong stok SKU SMB-001'
        }
      ]
    : [
        {
          id: 'LOG-SIM-1',
          timestamp: hoursAgoIso(28),
          itemName: 'Biji Kopi Arabika',
          type: 'MASUK (Restock Supplier)',
          qty: '+2 kg',
          outlet: 'Utama',
          note: 'Batch baru #KP-02 diterima oleh Petugas Gudang'
        },
        {
          id: 'LOG-SIM-2',
          timestamp: hoursAgoIso(3.5),
          itemName: 'Susu Segar UHT',
          type: 'KELUAR (Otomatis BOM POS)',
          qty: '-1.35 liter',
          outlet: 'Utama',
          note: 'Pemotongan otomatis penjualan Kopi Susu & Matcha Latte'
        },
        {
          id: 'LOG-SIM-3',
          timestamp: hoursAgoIso(1.5),
          itemName: 'Biji Kopi Arabika',
          type: 'KELUAR (Otomatis BOM POS)',
          qty: '-0.18 kg',
          outlet: 'Utama',
          note: 'Pemotongan otomatis penjualan Kopi Susu Gula Aren'
        }
      ];

  return {
    transactions,
    stockMovements,
    priceHistory,
    retailPriceHistory,
    auditLogs,
    stockLogs
  };
}

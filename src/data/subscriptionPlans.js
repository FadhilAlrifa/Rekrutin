import { Store, Layers, Building2 } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Paket Starter',
    subtitle: 'Basic POS & Kasir Mandiri',
    price: 'Rp79.000',
    period: '/ bulan',
    badge: 'UMKM Mikro & Pemula',
    icon: Store,
    target: 'UMKM F&B mikro, kedai kopi kecil, atau pedagang pop-up pemula yang baru beralih dari kasir konvensional.',
    highlight: false,
    included: [
      'Modul POS Kasir lengkap (pencarian menu & catatan dapur)',
      'Pembayaran Tunai (kalkulator kembalian), QRIS, & Kartu',
      'Cetak struk senyap (Silent Hidden Iframe)',
      'Manajemen Menu dasar (Katalog Produk)',
      'Akses terbatas: 1 Superadmin & maks. 1 Kasir'
    ],
    excluded: [
      'Mesin pemotong stok resep otomatis (BOM Engine)',
      'Validasi stok lintas menu & Peringatan FIFO/FEFO',
      'Modul Self-Order Kiosk Meja & Role Stocker Gudang'
    ]
  },
  {
    id: 'pro',
    name: 'Paket Pro / Business',
    subtitle: 'Smart Inventory & Automated BOM',
    price: 'Rp149.000',
    period: '/ bulan',
    badge: 'Core Product • Paling Populer',
    icon: Layers,
    target: 'Kafe, restoran menengah, atau kedai dengan inventaris bahan baku aktif yang ingin mencegah kerugian & food waste.',
    highlight: true,
    included: [
      'Real-Time Automated BOM Engine (konversi gram/ml ke kg/liter presisi 3 desimal)',
      'Cross-Menu Validation (cegah pesanan jika stok bahan gudang kurang)',
      'FIFO/FEFO Early Warning (peringatan bahan ≤ 30 hari & stok kritis)',
      'Modul Self-Order Kiosk (pesan mandiri dari meja pelanggan)',
      'Full RBAC: Superadmin, Kasir POS, dan Stocker Gudang',
      'Advanced Reporting (4 metrik utama, tren, produk terlaris, metode bayar, & CSV)'
    ],
    excluded: [
      'Manajemen Multi-Outlet & Central Kitchen Sync',
      'Advanced Log Mutasi Stok Antar-Cabang'
    ]
  },
  {
    id: 'enterprise',
    name: 'Paket Enterprise / Franchise',
    subtitle: 'Multi-Outlet & Central Kitchen',
    price: 'Rp299.000',
    period: '/ outlet / bln',
    badge: 'Waralaba & Cloud Kitchen',
    icon: Building2,
    target: 'Bisnis F&B berantai, waralaba (franchise), atau cloud kitchen dengan banyak cabang dan gudang pusat.',
    highlight: false,
    included: [
      'Seluruh fitur lengkap dari Paket Pro / Business',
      'Manajemen Multi-Outlet (inventaris & laporan terpusat semua cabang)',
      'Central Kitchen Integration (sinkronisasi pasokan gudang pusat ke gerai)',
      'Advanced Log Mutasi Stok (pelacakan riwayat keluar-masuk antar-cabang)',
      'Akun karyawan tanpa batas & Dukungan teknis prioritas 24/7'
    ],
    excluded: []
  }
];

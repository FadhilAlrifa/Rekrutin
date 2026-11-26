import { Store, Layers, Building2 } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Paket Starter',
    subtitle: 'Kasir & Kuota Stok Menu',
    price: 'Rp79.000',
    period: '/ bulan',
    badge: 'UMKM Mikro & Pemula',
    icon: Store,
    target: 'Kedai kecil, booth minuman, atau toko pemula yang butuh kasir cepat dengan kontrol kuota porsi per menu.',
    highlight: false,
    included: [
      'Kasir POS lengkap (Tunai, QRIS, Kartu, & catatan dapur)',
      'Cetak struk transaksi langsung tanpa tab baru',
      'Kuota porsi/stok per menu (berkurang otomatis saat terjual & peringatan menipis)',
      'Laporan penjualan harian & unduh rekap CSV',
      'Akses untuk 1 Admin & maks. 1 Kasir'
    ],
    excluded: [
      'Potong stok bahan baku otomatis sesuai resep (BOM)',
      'Pengingat bahan kedaluwarsa (FEFO) & akun Stocker gudang',
      'Pesan mandiri dari meja (QR), Bayar Nanti (Open Bill), & Saran AI'
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

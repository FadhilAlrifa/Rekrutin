# DOKUMENTASI LENGKAP & KONTEKS PROYEK: STOCKO ENTERPRISE POS
> **Panduan untuk AI Assistant Baru:**  
> Dokumen ini berisi seluruh konteks teknis, arsitektur kode, skema database Supabase, aturan desain UI/UX, *workaround* khusus, serta riwayat pengembangan aplikasi **STOCKO**. Bacalah seluruh isi dokumen ini dengan saksama sebelum melakukan perubahan kode atau menjawab pertanyaan pengguna.

---

## 1. IDENTITAS PROYEK & KONTEKS BISNIS
* **Nama Aplikasi:** **STOCKO** (*Smart Tracking of Operations, Commerce & Knowledge*)
* **Tagline:** *Turning Transactions into Smart Inventory Decisions*
* **Deskripsi Singkat:** Aplikasi *Cloud-Native Smart Point of Sale (POS)* dan *Inventory Management* berbasis web yang dilengkapi mesin pemotong stok bahan baku otomatis (**Real-Time Automated BOM / Bill of Materials**), pemesanan mandiri dari meja (**Self-Order Kiosk**), sistem peringatan kedaluwarsa (**FIFO/FEFO Early Warning**), manajemen akses karyawan (**RBAC**), serta laporan analitik bisnis untuk UMKM F&B dan Retail di Indonesia.
* **Tim Pengembang (OUR TEAM):**
  * **Ketua Tim:** Adel Zain Filadelfia
  * **Anggota Tim:**
    1. Balanza Ariyandi *(Tech / System Architecture & Web Development)*
    2. Baso Rafiansyah
    3. Muh Fadhil
    4. Clarissa Putri

---

## 2. LOKASI FOLDER & CARA MENJALANKAN
* **Folder Induk Proyek:** `C:\Stocko`
* **Folder Kode Sumber Aplikasi (React + Vite):** `C:\Stocko\Rekrutin`
* **Perintah Terminal:**
  * Menjalankan server lokal: `cd C:\Stocko\Rekrutin` lalu `npm run dev`
  * Memverifikasi build produksi: `cd C:\Stocko\Rekrutin` lalu `npm run build`
* **Lokasi Aset & Berkas Pendukung:**
  * Logo Resmi Aplikasi: `C:\Stocko\Rekrutin\public\logo-stocko.png`
  * Dokumen Proposal Tahap 2 (Word): `C:\Stocko\Proposal_STOCKO_Tahap2.docx`
  * File Diagram Arsitektur/Flowchart (PNG): `C:\Stocko\diagrams\` (`arsitektur_sistem.png`, `user_flow.png`, `roadmap_ekspansi.png`)
  * File Presentasi PowerPoint: `C:\Stocko\Pitch_Deck_STOCKO.pptx`

---

## 3. TECH STACK & DEPENDENSI UTAMA
* **Framework Frontend:** React 18/19 (SPA - *Single Page Application*)
* **Build Tool:** Vite (`v8.2.2`)
* **Styling:** Tailwind CSS (Utility-first CSS)
* **Animasi:** `framer-motion`
* **Ikonografi:** `lucide-react` (`^1.38.0`)
* **Backend & Database (BaaS):** `@supabase/supabase-js` (PostgreSQL, Supabase Auth, Row-Level Security)

---

## 4. ATURAN DESAIN UI/UX & PREFERENSI PENGGUNA (WAJIB DITAATI AI!)

1. **Tema & Palet Warna Konsisten:**
   * **Warna Aksen Utama (Brand):** Oranye Stocko `#E87F24` dan Kuning Emas `#FFC81E` (sering dipadukan sebagai gradasi `bg-gradient-to-r from-[#E87F24] to-[#FFC81E]`).
   * **Warna Netral & Permukaan:** Background dasbor `bg-[#f5f5f7]`, kartu/modal `bg-white`, border `border-zinc-200/80` atau `border-zinc-100`, teks utama `text-zinc-900`, teks sekunder `text-zinc-500` / `text-zinc-400`.
   * **LARANGAN KERAS:** **JANGAN** menggunakan warna biru iOS (`#007AFF`) pada tombol modal, form input, atau teks! Semua modal form (`MenuFormModal.jsx`, `StockInModal.jsx`, `EditItemModal.jsx`, `EmployeeModule.jsx`) sudah diseragamkan menggunakan tema kartu putih bersih dengan aksen `#E87F24` (Oranye-Emas), input `bg-zinc-50` dengan *focus ring* oranye (`focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15`), dan tombol aksi di *footer* modal.
2. **Estetika Landing Page:**
   * Pengguna menyukai tampilan *Landing Page* yang bersih, rapi, dan elegan ala Apple HIG (monokrom modern dengan aksen logo/brand seperlunya). Jangan mengubah keseluruhan Landing Page menjadi warna oranye/kuning mencolok.
3. **Aturan Animasi (Non-Bouncy!):**
   * Pengguna **TIDAK SUKA** animasi yang memantul berlebihan (*bouncy spring*).
   * Selalu gunakan kurva transisi yang elegan dan halus:
     ```js
     transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
     ```
4. **Aturan Encoding File di Windows (Kritis):**
   * Saat memodifikasi file menggunakan skrip atau PowerShell di Windows, **PASTIKAN file selalu disimpan dalam format encoding `UTF-8`** (bukan `UTF-16`). Jika file `.jsx` tersimpan sebagai `UTF-16`, Vite akan gagal mem-parsing file tersebut di browser dan menyebabkan layar putih kosong (*blank white screen*).

---

## 5. STRUKTUR DIREKTORI & FUNGSI SETIAP FILE (`C:\Stocko\Rekrutin`)

```text
C:\Stocko\Rekrutin\
├── index.html                  # HTML utama (Favicon: /logo-stocko.png, Title: Stocko Enterprise POS)
├── package.json                # Daftar dependensi npm
├── public\
│   └── logo-stocko.png         # Logo resmi STOCKO (Huruf C oranye-emas dengan kubus $)
└── src\
    ├── main.jsx                # Entry point React DOM
    ├── index.css               # Konfigurasi global CSS & Tailwind
    ├── App.jsx                 # State induk, routing view ('landing' | 'login' | 'register' | 'app'), RBAC, & fungsi handleCheckout (BOM deduction)
    ├── services\
    │   ├── supabaseClient.js   # Inisialisasi client Supabase (supabase & supabaseAdminAuth)
    │   └── stockoService.js    # Semua fungsi API CRUD ke Supabase (Products, Ingredients, Transactions, Auth, Employees, Restock)
    ├── Page\
    │   └── auth\
    │       ├── Login.jsx       # Halaman Login (2 Mode: Magic Link untuk Superadmin & Email+Password untuk Karyawan)
    │       └── Register.jsx    # Halaman Registrasi Tenant/Owner baru via Magic Link
    └── components\
        ├── landing\            # Komponen Halaman Depan (Landing Page)
        │   ├── LandingPage.jsx
        │   ├── Navbar.jsx      # Navbar Landing Page (Logo resmi + navigasi + tombol Simulasi POS)
        │   ├── Hero.jsx
        │   ├── Features.jsx
        │   ├── Benefits.jsx
        │   ├── WhyChooseUs.jsx
        │   ├── FAQ.jsx
        │   ├── CTA.jsx
        │   └── Footer.jsx      # Footer (Logo resmi + info kontak + badge PSE Kominfo)
        └── dashboard\          # Komponen Sistem Utama (Dashboard & Operasional)
            ├── DashboardNavbar.jsx         # Sidebar navigasi desktop & header mobile (mendukung filter menu berdasarkan userRole)
            ├── PosModule.jsx               # Modul Kasir POS (Katalog, Keranjang, Validasi Stok BOM, Kalkulator Tunai, QRIS, Kartu, Cetak Struk Iframe)
            ├── AlertsModule.jsx            # Modul Peringatan Gudang (Filter Stok Kritis & Kedaluwarsa/FIFO <= 30 hari)
            ├── menu\
            │   ├── MenuManagementModal.jsx # Halaman Kelola Menu & Resep (Filter kategori, search, grid kartu menu)
            │   ├── MenuCard.jsx            # Kartu tampilan tiap produk beserta preview komposisi BOM
            │   └── MenuFormModal.jsx       # Modal Form Tambah & Edit Menu + Input Komposisi Resep (BOM)
            ├── inventory\
            │   ├── InventoryModule.jsx     # Halaman Stok Gudang (Filter Semua/Kritis/Hampir Exp/Aman, CRUD bahan baku)
            │   ├── InventoryTable.jsx      # Tabel daftar bahan baku gudang beserta indikator status & aksi Edit/Hapus
            │   ├── StockInModal.jsx        # Modal Form Catat Barang Masuk (Tambah bahan baru / akumulasi stok bahan lama)
            │   └── EditItemModal.jsx       # Modal Form Edit Barang Gudang
            ├── self-order\
            │   ├── SelfOrderModule.jsx     # Kontainer utama Kiosk Pemesanan Mandiri Pelanggan (Meja)
            │   ├── WelcomeScreen.jsx       # Layar input nomor meja pelanggan (dengan logo resmi Stocko)
            │   ├── MenuCatalog.jsx         # Katalog pemesanan mandiri pelanggan
            │   ├── CartSummary.jsx         # Ringkasan keranjang mengambang di bawah layar
            │   ├── CartModal.jsx           # Modal detail pesanan meja sebelum konfirmasi
            │   └── SuccessScreen.jsx       # Layar sukses pesanan terkirim ke dapur/kasir
            ├── employee\
            │   └── EmployeeModule.jsx      # Modul Kelola Karyawan (Daftar staf, tambah akun Kasir/Stocker, cabut akses)
            └── reporting\
                ├── ReportingModule.jsx     # Kontainer Laporan & Analitik (Kalkulasi omzet, tren harian, produk terlaris, breakdown pembayaran, unduh CSV)
                ├── ReportingHeader.jsx     # Header laporan dengan filter waktu (Semua, Hari Ini, Kemarin, Bulan Ini, Pilih Tanggal Kalender)
                ├── ReportingMetrics.jsx    # 4 Kartu Metrik Utama (Pendapatan Kotor, Produk Terjual, Total Transaksi, Distribusi Metode Pembayaran)
                ├── BestSellersTable.jsx    # Tabel 5 Produk Terlaris berdasarkan kuantitas terjual & kontribusi omzet
                ├── TransactionHistory.jsx  # Tabel riwayat transaksi lengkap dengan badge metode bayar (QRIS/CASH/CARD)
                └── ReceiptModal.jsx        # Modal struk digital historis ketika baris transaksi diklik
```

---

## 6. SKEMA DATABASE SUPABASE & WORKAROUND PENTING

### 6.1 Konfigurasi Client (`src/services/supabaseClient.js`)
Terdapat **2 instance client Supabase**:
1. `supabase`: Client utama untuk autentikasi pengguna dan operasi database reguler.
2. `supabaseAdminAuth`: Client kedua dengan opsi `{ auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }`.
   * **Alasan:** Digunakan khusus pada fungsi `addEmployee(email, password, role)`. Ketika Superadmin mendaftarkan akun karyawan baru lewat `signUp()`, penggunaan `supabaseAdminAuth` mencegah sesi login Superadmin yang sedang aktif tertimpa/ter-logout oleh akun karyawan yang baru dibuat!

### 6.2 Tabel-Tabel di Supabase
1. **Tabel `products` (Menu / Produk Jualan):**
   * `id` (UUID / int8, Primary Key)
   * `name` (text) — Nama menu, misal `"Kopi Susu Aren"`
   * `category` (text) — `"Minuman"`, `"Makanan"`, `"Bakery"`, `"Dessert"`
   * `price` (numeric) — Harga jual dalam Rupiah
   * `image` (text) — URL gambar produk
   * `expiry_date` (text/date, opsional)
   * `recipe` (jsonb) — Array objek komposisi bahan baku (BOM), format:
     ```json
     [
       { "name": "Biji Kopi Arabika | Bahan Minuman", "qty": 18, "unit": "gram" },
       { "name": "Susu Segar UHT | Bahan Minuman", "qty": 120, "unit": "ml" }
     ]
     ```

2. **Tabel `ingredients` (Stok Bahan Baku Gudang):**
   * `id` (UUID / int8, Primary Key)
   * `name` (text) — Menyimpan Nama Bahan sekaligus Kategori dengan pemisah `' | '`
   * `stock` (numeric) — Jumlah stok saat ini (mendukung desimal hingga 3 angka di belakang koma, misal `1.982`)
   * `unit` (text) — Satuan penyimpanan di gudang (`"kg"`, `"gram"`, `"liter"`, `"ml"`, `"pcs"`)
   * `min_limit` (numeric) — Ambang batas minimum stok untuk memicu peringatan *Restock Alert*
   * `entry_date` (date/text) — Tanggal barang masuk
   * `expiry_date` (date/text) — Tanggal kedaluwarsa barang (FIFO/FEFO)

   > ⚠️ **WORKAROUND KRITIS PADA TABEL `ingredients` (WAJIB DIPERHATIKAN):**  
   > Tabel `ingredients` di database Supabase **tidak memiliki kolom `category`**.  
   > Sebagai solusinya, kategori digabungkan ke dalam kolom `name` dengan format:  
   > **`"${nama_barang} | ${kategori}"`** (Contoh: `"Biji Kopi Arabika | Bahan Minuman"`).  
   > - Saat **menampilkan** nama bahan di UI mana pun (`InventoryTable.jsx`, `AlertsModule.jsx`, dropdown `MenuFormModal.jsx`), **WAJIB** memisahkan string dengan:  
   >   `const ingName = (ing.name || '').split(' | ')[0];`  
   > - Saat **menyimpan/mengedit** bahan di `InventoryModule.jsx`, **WAJIB** menggabungkannya kembali:  
   >   `const finalName = "${nameOnly.trim()} | ${category}";`

3. **Tabel `transactions` (Riwayat Transaksi POS & Self-Order):**
   * `id` (UUID / int8, Primary Key)
   * `total_amount` (numeric) — Total nominal belanja (Rp)
   * `items` (jsonb) — Array item yang dibeli (`[{ id, name, price, qty, note, ... }]`)
   * `table_number` (text) — Nomor meja (dari *Self-Order*) atau `"Takeaway / Kasir"` (dari *POS*)
   * `payment_method` (text) — `"qris"`, `"cash"`, atau `"card"`
   * `created_at` (timestamptz) — Waktu transaksi

4. **Tabel `user_roles` (Hak Akses & Akun Karyawan - RBAC):**
   * `id` (UUID, terhubung dengan `auth.users`)
   * `email` (text)
   * `role` (text) — `"superadmin"`, `"kasir"`, atau `"stocker"`

---

## 7. PENJELASAN LOGIKA INTI SISTEM (CORE MECHANISMS)

### 7.1 Mesin Pemotong Stok Resep Otomatis (BOM Engine & Konversi Satuan)
Terdapat di `src/App.jsx` (`handleCheckout`) dan `src/components/dashboard/PosModule.jsx`:
* **Masalah yang Diselesaikan:** Gudang biasanya menyimpan bahan dalam satuan besar (`kg` atau `liter`), sedangkan resep menu menggunakan satuan takaran kecil (`gram` atau `ml`).
* **Cara Kerja Konversi (`calculateDeductionInStorageUnit`):**
  1. Mengubah takaran resep ke satuan dasar (*standard base*: `kg` $\rightarrow \times 1000$ `gram`, `liter` $\rightarrow \times 1000$ `ml`).
  2. Jika satuan bahan di gudang adalah `kg` atau `liter`, nilai dasar tadi dibagi `1000` (`neededBase / 1000`).
  3. Mengurangi stok bahan di state React dan memanggil `updateIngredientStock(id, newStock)` ke Supabase dengan pembulatan `Number(newStock.toFixed(3))` untuk menghindari bug *floating-point* JavaScript.

### 7.2 Validasi Stok Lintas Menu Sebelum Checkout (`validateCartWithNewItem` di `PosModule.jsx`)
* Setiap kali kasir menekan tombol tambah (`+`) pada suatu menu, sistem tidak hanya mengecek stok untuk 1 menu itu saja, melainkan **mensimulasikan akumulasi seluruh kebutuhan bahan baku dari semua menu yang ada di dalam keranjang**.
* Misalnya *Menu A* dan *Menu B* sama-sama memakai *Susu Segar UHT*. Jika total susu yang dibutuhkan oleh gabungan *Menu A + Menu B* di keranjang melebihi sisa stok *Susu Segar UHT* di gudang, sistem akan menolak penambahan dan menampilkan modal peringatan **Stok Bahan Gudang Tidak Mencukupi!** beserta rincian kekurangannya.

### 7.3 Mesin Cetak Struk Senyap (`Silent Hidden Iframe Printing` di `PosModule.jsx`)
* **Riwayat Bug Penting:** Dahulu, fitur cetak struk menggunakan cara mengubah `document.body.innerHTML` lalu memanggil `window.location.reload()`. Hal itu menyebabkan bug fatal: ketika kasir menekan *Cancel* atau selesai print pada metode bayar QRIS/Tunai, seluruh web me-reload dan terlempar kembali ke *Landing Page*.
* **Solusi Saat Ini (Jangan Diubah ke Cara Lama):**
  Saat tombol `Cetak Struk` diklik, sistem membuat elemen `<iframe>` tersembunyi (`display: none`), menyuntikkan HTML struk beserta CSS khusus printer thermal (`Courier New`, lebar `300px`), memanggil `iframe.contentWindow.print()`, lalu menghapus `iframe` tersebut setelah selesai. Halaman POS Kasir tetap utuh tanpa *reload*!

### 7.4 Role-Based Access Control (RBAC)
Diatur di `App.jsx` dan `DashboardNavbar.jsx`:
* **`superadmin`**: Bisa melihat dan mengakses seluruh 6 menu: *POS & Kasir*, *Self-Order (Meja)*, *Kelola Menu*, *Stok Gudang*, *Peringatan*, *Karyawan*, dan *Laporan*.
* **`kasir`**: Hanya bisa mengakses *POS & Kasir* serta *Kelola Menu*. Saat login otomatis diarahkan ke tab `pos`.
* **`stocker`**: Hanya bisa mengakses *Stok Gudang*, *Kelola Menu*, dan *Peringatan*. Saat login otomatis diarahkan ke tab `inventory`.

### 7.5 Penanganan Posisi Scroll Antar Halaman (`AnimatePresence`)
* Di `App.jsx`, transisi antar view (`landing`, `login`, `register`, `app`) dan antar tab dashboard dibungkus dengan:
  `<AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>`
* Ini memastikan saat pengguna mengklik **"Simulasi POS"** dari bagian bawah *Landing Page*, halaman POS Kasir selalu terbuka rapi dari bagian paling atas (tidak ikut ter-scroll ke bawah).

---

## 8. STATUS FITUR SAAT INI & RENCANA PENGEMBANGAN SELANJUTNYA (ROADMAP TEKNIS)

### ✅ Fitur yang Sudah Selesai & Stabil:
1. **Landing Page Modern + Logo Resmi STOCKO** di seluruh komponen (*Navbar*, *Footer*, *Sidebar Admin*, *Header Mobile*, *Welcome Screen Self-Order*, *Struk Nota*, dan *Favicon*).
2. **Autentikasi Ganda:** Magic Link untuk Owner/Superadmin & Login Email/Password untuk Karyawan (Kasir/Stocker).
3. **POS Kasir Lengkap:** Pencarian, filter kategori, catatan dapur per item, validasi stok lintas keranjang, pembayaran Tunai (kalkulator kembalian otomatis), QRIS, & Kartu, serta cetak struk via *hidden iframe*.
4. **Modul Laporan & Analitik (`ReportingModule.jsx`):**
   * 4 Kartu Metrik: *Pendapatan Kotor (dengan tren % dibanding kemarin)*, *Produk Terjual*, *Total Transaksi*, dan *Distribusi Metode Pembayaran (QRIS, Tunai, Kartu)*.
   * Filter waktu: *Semua*, *Hari Ini*, *Kemarin*, *Bulan Ini*, dan *Filter Tanggal Kalender Bebas*.
   * Tabel 5 Produk Terlaris, Tabel Riwayat Transaksi dengan badge metode bayar, Modal Struk Digital, dan fitur **Unduh Laporan CSV**.
5. **Penyeragaman Desain Seluruh Form Modal:** Semua form (`MenuFormModal.jsx`, `StockInModal.jsx`, `EditItemModal.jsx`, `EmployeeModule.jsx`) sudah menggunakan tema Oranye-Emas Stocko (`#E87F24` & `#FFC81E`) yang seragam.

### 📋 Daftar Rencana / Fitur Berikutnya (Jika Diminta oleh Pengguna):
1. **Upload Foto Menu dari File Lokal Laptop (Supabase Storage):**
   * Saat ini input foto di `MenuFormModal.jsx` menggunakan URL gambar (dengan *live preview*). Pengguna sempat menanyakan apakah bisa upload file gambar langsung dari laptop dan memilih untuk mengerjakannya di tahap berikutnya.
2. **Tabel Riwayat Keluar/Masuk Barang Gudang (Log Mutasi Stok):**
   * Menambahkan tampilan tabel riwayat pencatatan barang masuk (`restock_logs`) di dalam modul `InventoryModule.jsx` agar Stocker/Owner bisa melacak kapan terakhir kali suatu bahan di-restock dan berapa jumlahnya.

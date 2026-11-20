import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileEdit,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  UserCheck,
  ShieldAlert,
  Check
} from 'lucide-react';
import { calculateOrderItemsWasteCost } from '../../../utils/orderStateMachine';
import { validatePersonalEmployeeName } from '../../../services/employeeAuditService';

export function OrderModificationModal({
  order,
  products = [],
  ingredients = [],
  onClose,
  onConfirm
}) {
  const [draftItems, setDraftItems] = useState(() =>
    (order?.items || []).map((i) => ({ ...i }))
  );
  const [reason, setReason] = useState('');
  const [treatRemovedAsWaste, setTreatRemovedAsWaste] = useState(
    () => order?.kitchenStatus === 'preparing' || order?.kitchenStatus === 'ready'
  );
  const [addProductId, setAddProductId] = useState('');

  const beforeTotal = Number(order?.totalAmount) || 0;
  const afterTotal = draftItems.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
    0
  );

  const handleQtyChange = (id, delta) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? { ...item, qty: Math.max(0, Number(item.qty) + delta) }
          : item
      )
    );
  };

  const handleAddProduct = () => {
    if (!addProductId) return;
    const prod = products.find((p) => String(p.id) === String(addProductId));
    if (!prod) return;
    setDraftItems((prev) => {
      const existing = prev.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        return prev.map((i) =>
          String(i.id) === String(prod.id) ? { ...i, qty: Number(i.qty) + 1 } : i
        );
      }
      return [...prev, { ...prod, qty: 1, note: 'Item susulan / revisi' }];
    });
    setAddProductId('');
  };

  const wastePreview = useMemo(() => {
    if (!treatRemovedAsWaste) return 0;
    const removedItems = [];
    (order?.items || []).forEach((oldItem) => {
      const cur = draftItems.find((d) => String(d.id) === String(oldItem.id));
      const newQty = cur ? Number(cur.qty) : 0;
      if (newQty < Number(oldItem.qty)) {
        removedItems.push({ ...oldItem, qty: Number(oldItem.qty) - newQty });
      }
    });
    return calculateOrderItemsWasteCost(removedItems, ingredients);
  }, [treatRemovedAsWaste, order, draftItems, ingredients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm({
      order,
      nextItems: draftItems.filter((i) => Number(i.qty) > 0),
      reason: reason.trim(),
      treatRemovedAsWaste
    });
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-zinc-950/40 cursor-pointer" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
              <FileEdit size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-base">
                Nota Coret / Tambah Item ({order.orderNumber})
              </h3>
              <p className="text-[11px] font-medium text-[#52525B]">
                Revisi tercatat di Audit Trail tanpa menghapus riwayat nota lama.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-[#52525B] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {draftItems.map((item) => {
              const orig = (order.items || []).find((o) => String(o.id) === String(item.id));
              const isStruck = Number(item.qty) === 0;
              const isReduced = orig && Number(item.qty) < Number(orig.qty);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isStruck
                      ? 'bg-red-50/50 border-red-200 opacity-75'
                      : 'bg-[#FAFAFA] border-zinc-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold text-[#141414] ${
                        isStruck ? 'line-through text-red-700' : ''
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="font-mono text-[10px] text-[#52525B]">
                      Rp {Number(item.price).toLocaleString('id-ID')}
                      {isReduced && (
                        <span className="ml-2 text-[#B45309] font-bold">
                          (Awal: {orig.qty} → {item.qty})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#141414] cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center font-mono text-xs font-extrabold text-[#141414]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#141414] cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.id, -Number(item.qty))}
                      className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Coret item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tambah Item Susulan */}
          <div className="flex gap-2">
            <select
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
              className="flex-1 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141414]"
            >
              <option value="">+ Tambah item menu susulan...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Rp {Number(p.price).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={!addProductId}
              className="px-3.5 py-2 rounded-xl bg-[#141414] disabled:opacity-40 text-[#F59E0B] text-xs font-bold cursor-pointer"
            >
              Tambah
            </button>
          </div>

          {(order.kitchenStatus === 'preparing' || order.kitchenStatus === 'ready') && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] cursor-pointer">
              <input
                type="checkbox"
                checked={treatRemovedAsWaste}
                onChange={(e) => setTreatRemovedAsWaste(e.target.checked)}
                className="w-4 h-4 accent-[#F59E0B] mt-0.5"
              />
              <div className="text-[11px] text-[#78350F]">
                <span className="font-bold text-[#141414] block">
                  Item yang dicoret sudah terlanjur diproses dapur
                </span>
                Stok bahan yang sudah dipakai tetap terpotong sebagai waste
                {wastePreview > 0 ? ` (Estimasi HPP Waste: Rp ${wastePreview.toLocaleString('id-ID')})` : ''}.
              </div>
            </label>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#141414] mb-1">
              Alasan Revisi / Nota Coret <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pelanggan ganti menu / tambah pesanan meja 4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-[#52525B] font-medium">
              Tagihan Awal: <span className="font-mono line-through">Rp {beforeTotal.toLocaleString('id-ID')}</span>
            </span>
            <span className="font-extrabold text-[#141414] font-mono">
              Tagihan Baru: Rp {afterTotal.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-[#52525B] cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || draftItems.every((i) => Number(i.qty) === 0)}
              className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 text-[#141414] text-xs font-extrabold cursor-pointer"
            >
              Simpan Revisi Nota
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function OrderCancelModal({ order, ingredients = [], onClose, onConfirm }) {
  const isDefaultAfterCook =
    order?.kitchenStatus === 'preparing' || order?.kitchenStatus === 'ready';
  const [condition, setCondition] = useState(
    isDefaultAfterCook ? 'after_cooking' : 'before_cooking'
  );
  const [reason, setReason] = useState('');

  const estimatedWasteCost = useMemo(
    () => calculateOrderItemsWasteCost(order?.items || [], ingredients),
    [order, ingredients]
  );

  if (!order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm({ order, condition, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-zinc-950/40 cursor-pointer" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-base">
                Batalkan Pesanan ({order.orderNumber})
              </h3>
              <p className="text-[11px] font-medium text-[#52525B]">
                Pilih kondisi bahan dapur agar stok &amp; HPP tetap sinkron.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-[#52525B] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setCondition('before_cooking')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                condition === 'before_cooking'
                  ? 'bg-[#FEF3C7] border-[#F59E0B]'
                  : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="text-xs font-extrabold text-[#141414]">
                Kondisi A — Belum Masuk Proses Dapur (Queued)
              </p>
              <p className="text-[11px] text-[#52525B] mt-1">
                Status menjadi <span className="font-mono font-bold">cancelled</span>.{' '}
                {order.paymentStatus === 'paid' ? 'Pembayaran dicatat refund. ' : ''}
                Stok bahan baku <strong>tidak dipotong / dikembalikan utuh</strong> (Waste Rp 0).
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCondition('after_cooking')}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                condition === 'after_cooking'
                  ? 'bg-red-50 border-red-400'
                  : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="text-xs font-extrabold text-red-700">
                Kondisi B — Sudah Diproses Dapur (Preparing / Ready)
              </p>
              <p className="text-[11px] text-[#52525B] mt-1">
                Status menjadi <span className="font-mono font-bold">cancelled_waste</span>.{' '}
                Tidak dihitung omzet bersih, namun stok bahan <strong>tetap terpotong sebagai kerugian</strong>{' '}
                (<span className="font-mono font-bold text-red-700">Waste Cost: Rp {estimatedWasteCost.toLocaleString('id-ID')}</span>).
              </p>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#141414] mb-1">
              Alasan Pembatalan (Wajib untuk Audit Trail) <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Salah input meja / pelanggan batal tunggu / pesanan tumpah"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-[#52525B] cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-extrabold cursor-pointer"
            >
              Konfirmasi Pembatalan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function CashierShiftModal({
  isOpen,
  onClose,
  currentOperator,
  onVerifyShift
}) {
  const isLockedPersonalAccount = Boolean(currentOperator?.isAuthenticatedEmployee);
  const [name, setName] = useState(currentOperator?.name || '');
  const [role, setRole] = useState(currentOperator?.role || 'kasir');
  const [pin, setPin] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setNameError('');
    if (isLockedPersonalAccount) {
      onVerifyShift({
        ...currentOperator,
        verifiedAt: new Date().toISOString(),
        shiftActive: true
      });
      onClose();
      return;
    }

    const validation = validatePersonalEmployeeName(name, []);
    if (!validation.valid) {
      setNameError(validation.message);
      return;
    }

    onVerifyShift({
      ...currentOperator,
      id: currentOperator?.id || `SHIFT-${Date.now().toString().slice(-5)}`,
      name: validation.cleanName,
      role,
      verifiedAt: new Date().toISOString(),
      shiftActive: true
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={onClose} className="fixed inset-0 bg-zinc-950/40 cursor-pointer" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 z-10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#141414] text-base">
                  Autentikasi Shift Kasir
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  Identitas ini dicetak otomatis di setiap struk &amp; Audit Trail.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isLockedPersonalAccount && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] font-bold text-emerald-800">
                  Akun Pribadi Terverifikasi (1 Akun = 1 Karyawan). Identitas dikunci sesuai sesi login Anda.
                </div>
              )}

              {nameError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-[11px] font-bold text-red-700">
                  {nameError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#141414] mb-1">
                  Nama Lengkap Kasir <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly={isLockedPersonalAccount}
                  placeholder="Contoh: Rina Wijaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B] ${
                    isLockedPersonalAccount ? 'bg-zinc-100 cursor-not-allowed' : 'bg-[#FAFAFA]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#141414] mb-1">
                    Jabatan
                  </label>
                  <select
                    value={role}
                    disabled={isLockedPersonalAccount}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#141414] disabled:opacity-70"
                  >
                    <option value="kasir">Kasir</option>
                    <option value="superadmin">Owner / Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#141414] mb-1">
                    PIN Shift (Opsional)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#141414]"
                  />
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-[#52525B]">
                <ShieldAlert size={13} className="text-[#D97706] shrink-0" />
                <span>Setiap nota coret &amp; pembatalan akan tercatat atas nama petugas shift ini.</span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#52525B] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Aktifkan Shift
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

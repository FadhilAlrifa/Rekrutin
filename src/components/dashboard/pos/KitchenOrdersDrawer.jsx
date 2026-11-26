import { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  FileEdit,
  XCircle,
  Wallet,
  Globe,
  UserCheck,
  Receipt,
  Package
} from 'lucide-react';
import {
  ORDER_CHANNEL_LABELS,
  PAYMENT_FLOW_LABELS,
  getOrderStatusMeta
} from '../../../utils/orderStateMachine';

export default function KitchenOrdersDrawer({
  orders = [],
  merchantSettings,
  businessType = 'fnb',
  onTransitionStatus,
  onOpenModify,
  onOpenCancel,
  onSettleOpenBill,
  onReceiveClosedKitchenDemo,
  onViewReceipt
}) {
  const isRetail = businessType === 'retail';
  const [viewFilter, setViewFilter] = useState('active'); // 'active' | 'history'

  const activeOrders = orders.filter(
    (o) =>
      o.kitchenStatus !== 'served' &&
      o.kitchenStatus !== 'cancelled' &&
      o.kitchenStatus !== 'cancelled_waste' ||
      (o.paymentStatus === 'unpaid' && o.kitchenStatus === 'served')
  );

  const historyOrders = orders.filter(
    (o) =>
      (o.kitchenStatus === 'served' && o.paymentStatus !== 'unpaid') ||
      o.kitchenStatus === 'cancelled' ||
      o.kitchenStatus === 'cancelled_waste'
  );

  const displayedOrders = viewFilter === 'active' ? activeOrders : historyOrders;

  const formatTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141414] text-[#F59E0B] flex items-center justify-center shrink-0">
            {isRetail ? <Receipt size={19} /> : <ChefHat size={19} />}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#141414]">
              {isRetail ? 'Antrean Online Order & Riwayat Nota' : 'Antrean Dapur (KDS) & Open Bill'}
            </h2>
            <p className="text-[11px] text-[#52525B] font-medium">
              {isRetail
                ? 'Siapkan pesanan online, cetak ulang struk, revisi nota barang, atau proses retur.'
                : 'Kelola status masak, pembayaran Open Bill, Nota Coret, dan pembatalan (Kondisi A/B).'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {merchantSettings?.closedKitchenEnabled && (
            <button
              type="button"
              onClick={onReceiveClosedKitchenDemo}
              className="px-3.5 py-2 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] text-[#B45309] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Globe size={14} /> Terima Online Order
            </button>
          )}

          <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewFilter === 'active'
                  ? 'bg-[#141414] text-[#F59E0B]'
                  : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              Aktif ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setViewFilter('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewFilter === 'history'
                  ? 'bg-[#141414] text-[#F59E0B]'
                  : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              Selesai / Batal ({historyOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid Kartu Order */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-2">
          {isRetail ? (
            <Receipt size={32} className="mx-auto text-zinc-300" />
          ) : (
            <ChefHat size={32} className="mx-auto text-zinc-300" />
          )}
          <p className="text-sm font-bold text-[#141414]">
            {viewFilter === 'active'
              ? isRetail
                ? 'Belum ada Online Order yang perlu disiapkan'
                : 'Belum ada antrean dapur atau Open Bill aktif'
              : isRetail
              ? 'Belum ada riwayat nota / batal'
              : 'Belum ada riwayat order dapur / batal'}
          </p>
          <p className="text-xs text-[#52525B]">
            {isRetail
              ? 'Transaksi kasir langsung otomatis tercatat sebagai Selesai. Gunakan Terima Online Order jika ada pesanan online.'
              : 'Buat transaksi dari tab Katalog POS atau klik Terima Online Order.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedOrders.map((order) => {
            const kMeta = getOrderStatusMeta(order.kitchenStatus, businessType);
            const isClosedOrCancelled =
              order.kitchenStatus === 'cancelled' || order.kitchenStatus === 'cancelled_waste';
            const channelText =
              isRetail && order.orderChannel === 'take_away'
                ? 'Belanja di Toko'
                : ORDER_CHANNEL_LABELS[order.orderChannel] || order.orderChannel;

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 ${
                  order.paymentStatus === 'unpaid' && !isClosedOrCancelled
                    ? 'border-[#F59E0B]'
                    : order.kitchenStatus === 'cancelled_waste'
                    ? 'border-red-200'
                    : 'border-zinc-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-[#141414]">
                          {order.orderNumber}
                        </span>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${kMeta.badgeClass}`}>
                          {kMeta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B] font-medium mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {formatTime(order.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{channelText}</span>
                        <span>•</span>
                        <span>{order.tableNumber}</span>
                      </p>
                    </div>

                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-1 rounded-lg border uppercase shrink-0 ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.paymentStatus === 'refunded'
                          ? 'bg-zinc-100 text-[#52525B] border-zinc-200'
                          : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Cashier & Flow Badges */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-[#52525B]">
                    <span className="inline-flex items-center gap-1 font-bold text-[#141414]">
                      <UserCheck size={12} className="text-[#D97706]" /> {order.cashierName || 'Kasir'}
                    </span>
                    <span className="bg-[#FAFAFA] border border-zinc-200 px-2 py-0.5 rounded">
                      {PAYMENT_FLOW_LABELS[order.paymentFlow] || order.paymentFlow}
                    </span>
                  </div>

                  {/* Item Pesanan */}
                  <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 space-y-1.5">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="font-semibold text-[#141414]">
                          <span className="font-mono font-extrabold text-[#B45309] mr-1.5">
                            {item.qty}x
                          </span>
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-[#52525B]">
                          Rp {((Number(item.price) || 0) * (Number(item.qty) || 0)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Transparansi Nota Coret / Riwayat Revisi */}
                  {Array.isArray(order.revisionHistory) && order.revisionHistory.length > 0 && (
                    <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-xl p-2.5 space-y-1">
                      <p className="font-mono text-[9px] font-bold uppercase text-[#B45309]">
                        Jejak Revisi / Pembatalan ({order.revisionHistory.length})
                      </p>
                      {order.revisionHistory.slice(0, 2).map((rev) => (
                        <p key={rev.id} className="text-[10px] text-[#78350F] leading-snug">
                          • <span className="font-bold">{rev.summary}</span> — {rev.reason} (
                          {rev.operatorName})
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Waste Cost Info jika Cancelled Waste */}
                  {order.kitchenStatus === 'cancelled_waste' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-[11px] text-red-700 font-semibold">
                      {isRetail ? 'Kerugian Barang Rusak / Retur:' : 'Kerugian Waste HPP Tercatat:'}{' '}
                      <span className="font-mono font-extrabold">Rp {Number(order.wasteCost || 0).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {/* Footer Total & Actions */}
                <div className="pt-3 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#52525B]">Total Tagihan</span>
                    <span
                      className={`font-mono text-base font-extrabold ${
                        isClosedOrCancelled ? 'line-through text-zinc-400' : 'text-[#141414]'
                      }`}
                    >
                      Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {!isClosedOrCancelled && (
                    <div className="flex flex-wrap gap-1.5">
                      {order.kitchenStatus === 'queued' && (
                        <button
                          type="button"
                          onClick={() => onTransitionStatus(order, 'preparing')}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-[11px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isRetail ? <Package size={13} /> : <Flame size={13} />}{' '}
                          {isRetail ? 'Siapkan Barang' : 'Mulai Masak'}
                        </button>
                      )}
                      {order.kitchenStatus === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => onTransitionStatus(order, 'ready')}
                          className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} /> {isRetail ? 'Siap Diambil' : 'Siap Saji'}
                        </button>
                      )}
                      {order.kitchenStatus === 'ready' && (
                        <button
                          type="button"
                          onClick={() => onTransitionStatus(order, 'served')}
                          className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} /> {isRetail ? 'Selesai / Diserahkan' : 'Selesai Saji'}
                        </button>
                      )}

                      {!isRetail && order.paymentStatus === 'unpaid' && (
                        <button
                          type="button"
                          onClick={() => onSettleOpenBill(order)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-[11px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Wallet size={13} /> Bayar Bill
                        </button>
                      )}

                      {order.kitchenStatus === 'served' && (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(order)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Receipt size={13} /> Lihat Nota
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenModify(order)}
                        className="px-2.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="Nota Coret / Tambah Item"
                      >
                        <FileEdit size={13} /> Coret
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCancel(order)}
                        className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="Batalkan Pesanan"
                      >
                        <XCircle size={13} /> Batal
                      </button>
                    </div>
                  )}

                  {isClosedOrCancelled && (
                    <button
                      type="button"
                      onClick={() => onViewReceipt(order)}
                      className="w-full py-2 rounded-xl bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 text-[#141414] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Receipt size={13} /> Lihat Detail Nota
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

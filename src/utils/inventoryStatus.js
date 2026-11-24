/**
 * Utilitas normalisasi tanggal & evaluasi status bahan baku gudang Stocko.
 * Menjamin konsistensi antara KPI card, filter tab, kolom kedaluwarsa, dan kolom STATUS.
 */

export const NEAR_EXPIRY_DAYS_THRESHOLD = 30;

/**
 * Mengubah string tanggal (terutama format ISO date-only YYYY-MM-DD) menjadi Date pada jam 00:00 waktu lokal
 * agar tidak terjadi pergeseran hari akibat perbedaan zona waktu UTC.
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null;

  if (typeof dateString === 'string') {
    const isoDateOnly = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      const year = Number(isoDateOnly[1]);
      const month = Number(isoDateOnly[2]) - 1;
      const day = Number(isoDateOnly[3]);
      const localDate = new Date(year, month, day, 0, 0, 0, 0);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
}

/**
 * Menghitung selisih hari kalender dari hari ini ke tanggal kedaluwarsa.
 * Nilai negatif berarti sudah lewat (expired).
 */
export function getExpiryDays(dateString, referenceDate = new Date()) {
  const expDate = parseLocalDate(dateString);
  if (!expDate) return null;

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0
  );

  return Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Mengembalikan status kedaluwarsa: 'expired' | 'hampir' | 'aman'.
 */
export function checkExpiryStatus(dateString, referenceDate = new Date()) {
  const diffDays = getExpiryDays(dateString, referenceDate);
  if (diffDays === null) return 'aman';
  if (diffDays < 0) return 'expired';
  if (diffDays <= NEAR_EXPIRY_DAYS_THRESHOLD) return 'hampir';
  return 'aman';
}

/**
 * Evaluasi status gabungan stok & kedaluwarsa untuk satu item bahan baku (mendukung multi-batch FEFO).
 * Urutan prioritas status: Expired -> Kritis (Restock) -> Hampir Exp -> Aman.
 */
export function evaluateIngredientStatus(ingredient, referenceDate = new Date()) {
  const rawBatches = Array.isArray(ingredient?.batches) ? ingredient.batches : [];
  const activeBatches = rawBatches
    .filter((b) => Number(b.qty) > 0 && !b.disposedAsWaste)
    .sort((a, b) => {
      const da = parseLocalDate(a?.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = parseLocalDate(b?.expiryDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    });

  let effectiveExpiryDate = ingredient?.expiryDate || '';
  let usableStock = Number(ingredient?.stock) || 0;
  let expiredStock = 0;
  let expiredBatchCount = 0;
  let batchCount = activeBatches.length;

  if (activeBatches.length > 0) {
    const earliestWithExp = activeBatches.find((b) => Boolean(b.expiryDate)) || activeBatches[0];
    effectiveExpiryDate = earliestWithExp?.expiryDate || ingredient?.expiryDate || '';

    usableStock = 0;
    activeBatches.forEach((b) => {
      const qty = Math.max(0, Number(b.qty) || 0);
      const bDiff = getExpiryDays(b.expiryDate, referenceDate);
      if (bDiff !== null && bDiff < 0) {
        expiredBatchCount += 1;
        expiredStock = Number((expiredStock + qty).toFixed(3));
      } else {
        usableStock = Number((usableStock + qty).toFixed(3));
      }
    });
  } else {
    const legacyDiff = getExpiryDays(effectiveExpiryDate, referenceDate);
    if (legacyDiff !== null && legacyDiff < 0 && usableStock > 0) {
      expiredBatchCount = 1;
      expiredStock = usableStock;
      usableStock = 0;
    }
    if (usableStock > 0 || expiredStock > 0) {
      batchCount = 1;
    }
  }

  const diffDays = getExpiryDays(effectiveExpiryDate, referenceDate);
  let expiryStatus = 'aman';
  if (expiredBatchCount > 0 || (diffDays !== null && diffDays < 0)) {
    expiryStatus = 'expired';
  } else if (diffDays !== null && diffDays <= NEAR_EXPIRY_DAYS_THRESHOLD) {
    expiryStatus = 'hampir';
  }

  const isExpired = expiryStatus === 'expired';
  const isNearExpiry = expiryStatus === 'hampir';
  const isBelowMin = usableStock <= Number(ingredient?.minLimit);

  let primaryStatus = 'aman';
  if (isExpired) primaryStatus = 'expired';
  else if (isBelowMin) primaryStatus = 'kritis';
  else if (isNearExpiry) primaryStatus = 'hampir';

  const isHealthy = !isBelowMin && !isExpired && !isNearExpiry;

  return {
    diffDays,
    expiryStatus,
    effectiveExpiryDate,
    usableStock,
    expiredStock,
    batchCount,
    expiredBatchCount,
    isExpired,
    isNearExpiry,
    isBelowMin,
    isHealthy,
    primaryStatus
  };
}

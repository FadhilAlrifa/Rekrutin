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
 * Evaluasi status gabungan stok & kedaluwarsa untuk satu item bahan baku.
 * Urutan prioritas status: Expired -> Kritis (Restock) -> Hampir Exp -> Aman.
 */
export function evaluateIngredientStatus(ingredient, referenceDate = new Date()) {
  const diffDays = getExpiryDays(ingredient?.expiryDate, referenceDate);
  let expiryStatus = 'aman';
  if (diffDays !== null) {
    if (diffDays < 0) expiryStatus = 'expired';
    else if (diffDays <= NEAR_EXPIRY_DAYS_THRESHOLD) expiryStatus = 'hampir';
  }

  const isExpired = expiryStatus === 'expired';
  const isNearExpiry = expiryStatus === 'hampir';
  const isBelowMin = Number(ingredient?.stock) <= Number(ingredient?.minLimit);

  let primaryStatus = 'aman';
  if (isExpired) primaryStatus = 'expired';
  else if (isBelowMin) primaryStatus = 'kritis';
  else if (isNearExpiry) primaryStatus = 'hampir';

  const isHealthy = !isBelowMin && !isExpired && !isNearExpiry;

  return {
    diffDays,
    expiryStatus,
    isExpired,
    isNearExpiry,
    isBelowMin,
    isHealthy,
    primaryStatus
  };
}

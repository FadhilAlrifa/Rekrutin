// Standarisasi satuan berat/volume
export const convertToStandardBase = (qty, unit) => {
  const u = (unit || '').toLowerCase().trim();
  const q = Number(qty) || 0;
  if (u === 'kg' || u === 'kilogram') return q * 1000;
  if (u === 'gram' || u === 'g') return q;
  if (u === 'liter' || u === 'l') return q * 1000;
  if (u === 'ml' || u === 'milliliter') return q;
  return q;
};

export const calculateDeductionInStorageUnit = (neededQty, neededUnit, storageUnit) => {
  const neededBase = convertToStandardBase(neededQty, neededUnit);
  const storageUnitLower = (storageUnit || '').toLowerCase().trim();
  if (storageUnitLower === 'kg' || storageUnitLower === 'kilogram' || storageUnitLower === 'liter' || storageUnitLower === 'l') {
    return neededBase / 1000;
  }
  return neededBase;
};

// Fungsi untuk mengecek ketersediaan seluruh bahan sebuah menu
export const checkMenuStockAvailability = (menu, ingredients = [], currentQtyInCart = 0) => {
  if (!menu.recipe || !Array.isArray(menu.recipe) || menu.recipe.length === 0) {
    return { isAvailable: true, message: '' };
  }

  for (let itemNeeded of menu.recipe) {
    const foundIng = ingredients.find(
      ing => ing.name.toLowerCase().includes(itemNeeded.name.toLowerCase().trim())
    );

    if (!foundIng) {
      return { isAvailable: false, message: 'Bahan tidak ditemukan' };
    }

    const storageUnit = foundIng.unit;
    const deductionPerUnit = calculateDeductionInStorageUnit(itemNeeded.qty, itemNeeded.unit, storageUnit);
    const totalNeeded = deductionPerUnit * (currentQtyInCart + 1);

    if (foundIng.stock < totalNeeded) {
      return { isAvailable: false, message: 'Stok Habis' };
    }
  }

  return { isAvailable: true, message: '' };
};
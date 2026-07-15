export function formatPrice(price: number, dealType?: 'sale' | 'rent'): string {
  const formatted = price.toLocaleString();
  if (dealType === 'rent') {
    return `$${formatted}/oy`;
  }
  return `$${formatted}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "Noma'lum";
  try {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return "Ulanmagan";
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
  return phone;
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  // standard Uzbekistan phone: +998901234567 or 998901234567 or 901234567 (9 digits minimum)
  const pattern = /^(?:\+?998)?\s?(?:\d{2})\s?(?:\d{3})\s?(?:\d{2})\s?(?:\d{2})$/;
  return pattern.test(cleaned);
}

export function isValidPrice(price: number): boolean {
  return price > 0 && !isNaN(price);
}

export function isValidArea(area: number): boolean {
  return area > 0 && !isNaN(area);
}

export function formatPrice(price: number, currency: string, dealType?: string) {
  const formatted = new Intl.NumberFormat("en-US").format(price);
  const suffix = dealType === "rent" ? "/oy" : "";
  return `${currency === "USD" ? "$" : ""}${formatted}${currency === "UZS" ? " so'm" : ""}${suffix}`;
}

export function formatPriceShort(price: number, currency: string = "USD") {
  if (price >= 1_000_000) {
    return `${currency === "USD" ? "$" : ""}${(price / 1_000_000).toFixed(1)}M${currency === "UZS" ? " so'm" : ""}`;
  }
  if (price >= 1_000) {
    return `${currency === "USD" ? "$" : ""}${(price / 1_000).toFixed(0)}K${currency === "UZS" ? " so'm" : ""}`;
  }
  return `${currency === "USD" ? "$" : ""}${price}${currency === "UZS" ? " so'm" : ""}`;
}

export function timeAgo(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hozir";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} daq`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kecha";
  if (days < 30) return `${days} kun`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy`;
  return `${Math.floor(months / 12)} yil`;
}

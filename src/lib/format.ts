export function formatPrice(price: string | number, currency: string = "UZS"): string {
  const value = typeof price === "string" ? parseFloat(price) : price;
  if (!Number.isFinite(value)) return "-";

  if (currency === "USD") {
    return `$${value.toLocaleString("en-US")}`;
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 1)} mlrd so'm`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} mln so'm`;
  }
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

export function formatArea(area: string | number): string {
  const value = typeof area === "string" ? parseFloat(area) : area;
  return `${value} m²`;
}

export function timeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "hozirgina";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy oldin`;
  return `${Math.floor(months / 12)} yil oldin`;
}

export const DEAL_TYPE_LABELS: Record<string, string> = {
  sale: "Sotuv",
  rent: "Ijara",
  daily_rent: "Kunlik ijara",
  monthly_rent: "Oylik ijara",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Kvartira",
  house: "Uy / Hovli",
  villa: "Villa",
  cottage: "Kottej",
  commercial: "Tijorat binosi",
  office: "Ofis",
  land: "Yer uchastkasi",
  warehouse: "Omborxona",
  new_building: "Yangi qurilgan bino",
};

export const AMENITY_LABELS: Record<string, string> = {
  parking: "Avtoturargoh",
  elevator: "Lift",
  internet: "Internet",
  gas: "Gaz",
  water: "Suv",
  electricity: "Elektr",
  security: "Xavfsizlik",
  furniture: "Mebel",
  ac: "Konditsioner",
  heating: "Isitish",
  garden: "Bog'",
  pool: "Basseyn",
  playground: "Bolalar maydonchasi",
};

// Catálogo y precios de Lamine Resell. Un único sitio para que la portada,
// la página de producto y el pedido muestren siempre lo mismo.

export const TIERS = [
  { n: 5, price: 5000 },
  { n: 10, price: 9000 },
  { n: 15, price: 12500 },
  { n: 20, price: 16000 },
];

export const PRECIO_EXTRA = 900; // 9 € por valoración adicional al tramo (pago único)
export const PRECIO_MENSUAL_UNIDAD = 600; // 6 € por valoración al mes (suscripción)
export const COMISION_POR_DEFECTO = 10; // % de comisión de referido por defecto

export const TELEGRAM_URL = "https://t.me/LAMINE_RESELL";
export const PLAZO_ENTREGA = "4 semanas";

// 12500 -> "125 €" · 833 -> "8,33 €"   (espacio duro antes del €)
export function eur(cents) {
  const v = (Number(cents) || 0) / 100;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ",");
  return `${s} €`;
}

// Siempre con dos decimales: 5000 -> "50,00 €"
export function eurExacto(cents) {
  return `${((Number(cents) || 0) / 100).toFixed(2).replace(".", ",")} €`;
}

export function porValoracion(tier) {
  return Math.round(tier.price / tier.n);
}

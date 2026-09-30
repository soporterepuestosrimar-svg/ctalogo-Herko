import { CartItem, Advisor, CustomerOrderInfo, Product } from '../types';
import { ADVISORS, COMPANY_INFO } from '../data/products';

export const IVA_RATE = 0.19; // 19% IVA Colombia

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    subtotal,
    iva,
    total,
    totalItemsCount,
  };
}

export function getAdvisorById(advisorId: string): Advisor {
  const found = ADVISORS.find((a) => a.id === advisorId);
  return found || ADVISORS[0];
}

export function buildWhatsAppCartUrl(
  items: CartItem[],
  customer: CustomerOrderInfo,
  advisorOverride?: Advisor
): string {
  const advisor = advisorOverride || getAdvisorById(customer.advisorId);
  const { subtotal, iva, total, totalItemsCount } = calculateCartTotals(items);

  let message = `*SOLICITUD DE PEDIDO / COTIZACIÓN - REPUESTOS RIMAR*\n`;
  message += `🌐 Web: ${COMPANY_INFO.website}\n`;
  message += `👤 *Asesor Comercial:* ${advisor.name} (${advisor.phone})\n\n`;

  message += `📋 *DATOS DEL CLIENTE:*\n`;
  message += `• Nombre: ${customer.customerName.trim() || 'Cliente Repuestos Rimar'}\n`;
  if (customer.phone.trim()) {
    message += `• Celular: ${customer.phone.trim()}\n`;
  }
  if (customer.city.trim()) {
    message += `• Ciudad / Destino: ${customer.city.trim()}\n`;
  }
  if (customer.vehicleModel.trim()) {
    message += `• Vehículo (Marca/Modelo/Año): ${customer.vehicleModel.trim()}\n`;
  }
  if (customer.notes.trim()) {
    message += `• Observaciones: ${customer.notes.trim()}\n`;
  }

  message += `\n📦 *LISTADO DE REPUESTOS (${totalItemsCount} unid.):*\n`;
  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    message += `${index + 1}. *[Ref. ${item.product.code}]* ${item.product.description}\n`;
    message += `   Cant: ${item.quantity} x ${formatCOP(item.product.price)} = ${formatCOP(itemSubtotal)} (+ IVA)\n`;
  });

  message += `\n💰 *RESUMEN DE COTIZACIÓN:*\n`;
  message += `• Subtotal (antes de IVA): *${formatCOP(subtotal)}*\n`;
  message += `• IVA (19%): *${formatCOP(iva)}*\n`;
  message += `• *TOTAL ESTIMADO (con IVA): ${formatCOP(total)}*\n\n`;

  message += `Quedo atento a la confirmación de disponibilidad, tiempo de entrega y medios de pago. ¡Muchas gracias!`;

  return `https://wa.me/${advisor.rawPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppProductInquiryUrl(
  product: Product,
  advisor: Advisor,
  quantity: number = 1
): string {
  const itemTotal = product.price * quantity;
  const iva = itemTotal * IVA_RATE;
  const grandTotal = itemTotal + iva;

  let message = `¡Hola ${advisor.name}! Te escribo desde el catálogo digital de *${COMPANY_INFO.name}* (${COMPANY_INFO.website}).\n\n`;
  message += `Deseo consultar disponibilidad y comprar el siguiente repuesto:\n`;
  message += `• *Artículo Ref:* ${product.code}\n`;
  message += `• *Descripción:* ${product.description}\n`;
  message += `• *Precio Unitario:* ${formatCOP(product.price)} + IVA\n`;
  if (product.vehicleCompatibility) {
    message += `• *Compatibilidad:* ${product.vehicleCompatibility}\n`;
  }
  message += `• *Cantidad:* ${quantity}\n`;
  message += `• *Subtotal:* ${formatCOP(itemTotal)} (+ IVA 19%: ${formatCOP(iva)})\n`;
  message += `• *Total con IVA:* ${formatCOP(grandTotal)}\n\n`;
  message += `¿Tienen stock disponible para entrega o despacho inmediato?`;

  return `https://wa.me/${advisor.rawPhone}?text=${encodeURIComponent(message)}`;
}

export function getProductDisplayImage(product: Product, defaultCategoryImages: Record<string, string>): string {
  if (product.imageUrl && product.imageUrl.trim().length > 0) {
    if (product.imageUrl.includes('unsplash.com/photo-1486262715619')) {
      return defaultCategoryImages[product.category] || defaultCategoryImages['Otros'] || product.imageUrl;
    }
    return product.imageUrl;
  }
  return defaultCategoryImages[product.category] || defaultCategoryImages['Otros'] || getCategoryFallbackSvg(product.category, product.code);
}

/**
 * Generates an ultra-reliable, embedded inline SVG graphic for any automotive category.
 * Never fails, has 0 network latency, immune to CORS or adblockers.
 */
export function getCategoryFallbackSvg(category: string, code?: string): string {
  const cleanCat = category || 'Repuesto Automotriz';
  const cleanCode = code ? `Ref. ${code}` : 'Repuestos Rimar';

  // Category specific accent colors & icon path
  let accentColor = '#ef4444'; // default red
  let iconPath = '';

  switch (cleanCat) {
    case 'Bombas de Gasolina':
      accentColor = '#f59e0b'; // amber
      // Fuel pump silhouette
      iconPath = '<path d="M40 30h40v60H40z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 45h20v20H50z" fill="currentColor" opacity="0.3"/><path d="M80 40h15c5 0 10 5 10 10v30c0 5-5 10-10 10h-5" fill="none" stroke="currentColor" stroke-width="4"/><path d="M95 40v-10l15-5v15" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="60" cy="75" r="4" fill="currentColor"/>';
      break;

    case 'Sensores':
      accentColor = '#06b6d4'; // cyan
      // Sensor probe with wave
      iconPath = '<path d="M35 70l25-25 15 15-25 25z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M60 45l15-15 10 10-15 15z" fill="currentColor" opacity="0.3"/><circle cx="35" cy="70" r="6" fill="currentColor"/><path d="M75 25c10-10 25-10 35 0M82 32c5-5 15-5 20 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>';
      break;

    case 'Bobinas y Encendido':
      accentColor = '#eab308'; // yellow/amber
      // Spark coil & lightning bolt
      iconPath = '<rect x="45" y="30" width="30" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M45 45h30M45 60h30M45 75h30" stroke="currentColor" stroke-width="2"/><path d="M60 15v15M60 90v15" stroke="currentColor" stroke-width="4"/><path d="M90 40l-15 25h12l-8 25 20-30h-12z" fill="currentColor"/>';
      break;

    case 'Válvulas e Inyección':
      accentColor = '#a855f7'; // purple
      // Valve / fuel injector nozzle
      iconPath = '<path d="M50 25h20l5 35-10 25-5 15h-4l-5-15-10-25z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M42 45h36M46 65h28" stroke="currentColor" stroke-width="2"/><circle cx="60" cy="110" r="3" fill="currentColor"/><circle cx="50" cy="115" r="2" fill="currentColor"/><circle cx="70" cy="115" r="2" fill="currentColor"/>';
      break;

    case 'Refrigeración y Lubricación':
      accentColor = '#10b981'; // emerald
      // Oil droplet & thermometer
      iconPath = '<path d="M55 35c0-10 15-25 15-25s15 15 15 25a15 15 0 1 1-30 0z" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="3"/><rect x="35" y="45" width="10" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="40" cy="90" r="10" fill="currentColor"/><path d="M40 55v25" stroke="#fff" stroke-width="3"/>';
      break;

    case 'Frenos y Suspensión':
      accentColor = '#f43f5e'; // rose
      // Brake rotor & caliper
      iconPath = '<circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="60" cy="60" r="18" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="4 4"/><circle cx="60" cy="60" r="8" fill="currentColor"/><path d="M30 35c-5 15-5 35 0 50h18c-3-15-3-35 0-50z" fill="currentColor" opacity="0.5"/>';
      break;

    case 'Filtros y Químicos':
      accentColor = '#3b82f6'; // blue
      // Canister filter
      iconPath = '<rect x="40" y="25" width="40" height="65" rx="8" fill="none" stroke="currentColor" stroke-width="4"/><path d="M40 45h40M40 70h40" stroke="currentColor" stroke-width="3"/><path d="M50 25v-10h20v10" stroke="currentColor" stroke-width="3"/><path d="M48 50l6 10 8-10 8 10" fill="none" stroke="currentColor" stroke-width="2"/>';
      break;

    default:
      accentColor = '#ef4444'; // red
      // Crossed wrench & gear
      iconPath = '<path d="M35 85l30-30m0 0l-5-15 15-5 10 10 15-5 5 15-10 10 5 15-15 5-5-15" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="6" fill="currentColor"/>';
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
    </defs>
    
    <!-- Background card with subtle border -->
    <rect width="400" height="300" fill="url(#bgGrad)" />
    <rect x="1" y="1" width="398" height="298" rx="16" fill="none" stroke="#334155" stroke-width="2" />
    
    <!-- Header banner -->
    <rect x="0" y="0" width="400" height="42" fill="#020617" opacity="0.75" />
    <text x="20" y="26" fill="#f87171" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="13" letter-spacing="1.5">REPUESTOS RIMAR</text>
    <text x="380" y="26" text-anchor="end" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">${cleanCode}</text>
    
    <!-- Central Icon Container -->
    <g transform="translate(140, 65)" color="${accentColor}">
      <circle cx="60" cy="60" r="54" fill="#0f172a" stroke="${accentColor}" stroke-width="2" opacity="0.8" />
      ${iconPath}
    </g>
    
    <!-- Bottom Category Label & Badge -->
    <rect x="30" y="208" width="340" height="46" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
    <text x="200" y="236" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14" letter-spacing="0.5">${cleanCat}</text>
    <text x="200" y="278" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11">FOTO ILUSTRATIVA • PIEZA GARANTIZADA</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

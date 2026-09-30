import { Product, Advisor, CartItem, CustomerOrderInfo } from '../types';
import { COMPANY_INFO, CATEGORY_DEFAULT_IMAGES } from '../data/products';
import { formatCOP, IVA_RATE, calculateCartTotals, getProductDisplayImage, getCategoryFallbackSvg } from './formatters';

/**
 * Exports products as a CSV file compatible with Excel and Google Sheets
 */
export function exportCatalogToCSV(
  products: Product[],
  filename: string,
  activeAdvisor: Advisor
): void {
  const headers = [
    'Item',
    'Referencia / Código',
    'Descripción del Repuesto',
    'Marca',
    'Categoría',
    'Compatibilidad Vehicular',
    'Precio Unitario Sin IVA (COP)',
    'IVA 19% (COP)',
    'Precio Total Con IVA (COP)',
    'Estado',
    'Asesor de Contacto',
    'Teléfono WhatsApp Asesor'
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = products.map((p, index) => {
    const iva = p.price * IVA_RATE;
    const total = p.price + iva;
    return [
      index + 1,
      escapeCSV(p.code),
      escapeCSV(p.description),
      escapeCSV(p.brand),
      escapeCSV(p.category),
      escapeCSV(p.vehicleCompatibility || 'Consultar'),
      Math.round(p.price),
      Math.round(iva),
      Math.round(total),
      escapeCSV(p.stockStatus || 'Disponible'),
      escapeCSV(activeAdvisor.name),
      escapeCSV(activeAdvisor.phone)
    ].join(';');
  });

  // Include UTF-8 BOM so Excel opens accented Spanish characters without encoding glitches
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a dedicated print preview window styled for high-resolution PDF printing
 */
export function printCatalogPDF(
  products: Product[],
  title: string,
  filterDescription: string,
  activeAdvisor: Advisor
): void {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank');
  } catch (e) {
    console.warn('Popup blocked, falling back to iframe print', e);
  }

  const rowsHtml = products
    .map((p, index) => {
      const iva = p.price * IVA_RATE;
      const total = p.price + iva;
      const imgUrl = getProductDisplayImage(p, CATEGORY_DEFAULT_IMAGES);
      const fallbackSvg = getCategoryFallbackSvg(p.category, p.code);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
          <td style="padding: 6px 8px; font-weight: 700; color: #64748b; font-size: 11px; text-align: center;">${index + 1}</td>
          <td style="padding: 6px 8px; text-align: center;">
            <div style="width: 56px; height: 56px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; display: inline-flex; align-items: center; justify-content: center; padding: 2px; box-sizing: border-box; overflow: hidden;">
              <img src="${imgUrl}" alt="${p.code}" referrerpolicy="no-referrer" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block;" onerror="this.onerror=null; this.src='${fallbackSvg}';" />
            </div>
          </td>
          <td style="padding: 6px 8px; font-family: monospace; font-weight: 800; color: #dc2626; font-size: 12px; white-space: nowrap;">${p.code}</td>
          <td style="padding: 6px 8px; font-weight: 600; color: #0f172a; font-size: 11px;">${p.description}</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #1e293b; font-size: 11px; text-transform: uppercase;">${p.brand}</td>
          <td style="padding: 6px 8px; color: #475569; font-size: 11px;">${p.category}</td>
          <td style="padding: 6px 8px; color: #64748b; font-size: 10px;">${p.vehicleCompatibility || 'Consultar con asesor'}</td>
          <td style="padding: 6px 8px; text-align: right; font-weight: 800; color: #0f172a; font-size: 11px; white-space: nowrap;">${formatCOP(p.price)}</td>
          <td style="padding: 6px 8px; text-align: right; font-weight: 800; color: #047857; font-size: 12px; white-space: nowrap;">${formatCOP(total)}</td>
        </tr>
      `;
    })
    .join('');

  const buildPageHtml = () => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Repuestos Rimar</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 15mm 10mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }
        .brand-title span {
          color: #dc2626;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 600;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #475569;
        }
        .filter-badge {
          display: inline-block;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          text-align: left;
        }
        th.text-right {
          text-align: right;
        }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #64748b;
        }
        .highlight {
          color: #dc2626;
          font-weight: 700;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
          tr { page-break-inside: avoid; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="brand-title">Repuestos <span>Rimar</span></h1>
          <div class="brand-sub">Especialistas en Ford • Jeep • Dodge • RAM • Chrysler • Chevrolet</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
            Bogotá, Colombia • Despachos a nivel nacional | Web: <strong>${COMPANY_INFO.website}</strong>
          </div>
        </div>
        <div class="meta-box">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">CATÁLOGO OFICIAL DE PRECIOS</div>
          <div>Fecha: <strong>${currentDate}</strong></div>
          <div>Total Repuestos: <strong>${products.length}</strong></div>
          <div style="margin-top: 4px; font-weight: 600; color: #047857;">
            Asesor Comercial: ${activeAdvisor.name} (${activeAdvisor.phone})
          </div>
        </div>
      </div>

      <div class="filter-badge">
        <span>Alcance: <strong>${filterDescription}</strong> (${products.length} repuestos disponibles)</span>
      </div>

      <div class="no-print" style="margin-bottom: 12px; padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span><strong>Listo para imprimir o guardar como PDF:</strong> Haz clic en el botón a la derecha o presiona Ctrl+P (Cmd+P).</span>
        <button onclick="window.print()" style="background: #dc2626; color: white; border: none; padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          🖨️ Imprimir / Guardar en PDF
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 25px; text-align: center;">#</th>
            <th style="width: 66px; text-align: center;">Foto</th>
            <th style="width: 75px;">Código</th>
            <th>Descripción del Repuesto</th>
            <th style="width: 65px;">Marca</th>
            <th style="width: 105px;">Categoría</th>
            <th>Compatibilidad</th>
            <th class="text-right" style="width: 90px;">Precio</th>
            <th class="text-right" style="width: 95px;">Total (c/IVA)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>
          * Los precios oficiales se muestran en Pesos Colombianos (COP). El valor no incluye costos de transporte a otras ciudades.
        </div>
        <div>
          Pedidos y despacho inmediato por WhatsApp: <strong class="highlight">${activeAdvisor.phone}</strong>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(buildPageHtml());
      printWindow.document.close();
      return;
    } catch (e) {
      console.warn('Error writing to print popup, falling back to hidden iframe', e);
    }
  }

  // Safe fallback for iFrames and browsers with strict popup blocking
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(buildPageHtml());
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
    }, 450);
  }
}

/**
 * Copies a compact formatted catalog list to the clipboard
 */
export async function copyCatalogToClipboard(
  products: Product[],
  filterName: string,
  activeAdvisor: Advisor
): Promise<boolean> {
  try {
    let text = `*CATÁLOGO DE PRECIOS - REPUESTOS RIMAR*\n`;
    text += `🌐 Web: ${COMPANY_INFO.website}\n`;
    text += `📍 Bogotá, Colombia • Despachos a nivel nacional\n`;
    text += `👤 Asesor WhatsApp: ${activeAdvisor.name} (${activeAdvisor.phone})\n`;
    text += `📋 Alcance: ${filterName} (${products.length} repuestos)\n\n`;

    products.forEach((p, i) => {
      const totalConIva = p.price * (1 + IVA_RATE);
      text += `${i + 1}. [Ref. ${p.code}] ${p.description}\n`;
      text += `   Marca: ${p.brand} | Precio: ${formatCOP(p.price)} + IVA (${formatCOP(totalConIva)} c/IVA)\n`;
      if (p.vehicleCompatibility) {
        text += `   Aplica: ${p.vehicleCompatibility}\n`;
      }
    });

    text += `\nPara cotizaciones o despachos inmediatos a toda Colombia, escríbenos a WhatsApp: ${activeAdvisor.phone}`;

    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying catalog to clipboard:', err);
    return false;
  }
}

/**
 * Prints an official, elegant formal Quote / Proforma invoice for a customer cart order
 */
export function printOrderQuotePDF(
  items: CartItem[],
  customer: CustomerOrderInfo,
  advisor: Advisor
): void {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;
  const { subtotal, iva, total, totalItemsCount } = calculateCartTotals(items);

  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank');
  } catch (e) {
    console.warn('Popup blocked, falling back to iframe print', e);
  }

  const rowsHtml = items
    .map((item, index) => {
      const itemSubtotal = item.product.price * item.quantity;
      const itemIva = itemSubtotal * IVA_RATE;
      const itemTotal = itemSubtotal + itemIva;
      const imgUrl = getProductDisplayImage(item.product, CATEGORY_DEFAULT_IMAGES);
      const fallbackSvg = getCategoryFallbackSvg(item.product.category, item.product.code);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
          <td style="padding: 8px 10px; font-weight: 700; color: #64748b; font-size: 11px; text-align: center;">${index + 1}</td>
          <td style="padding: 6px 8px; text-align: center;">
            <div style="width: 52px; height: 52px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; display: inline-flex; align-items: center; justify-content: center; padding: 2px; box-sizing: border-box; overflow: hidden;">
              <img src="${imgUrl}" alt="${item.product.code}" referrerpolicy="no-referrer" loading="lazy" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block;" onerror="this.onerror=null; this.src='${fallbackSvg}';" />
            </div>
          </td>
          <td style="padding: 8px 10px; font-family: monospace; font-weight: 800; color: #dc2626; font-size: 12px; white-space: nowrap;">${item.product.code}</td>
          <td style="padding: 8px 10px; font-weight: 600; color: #0f172a; font-size: 12px;">
            ${item.product.description}
            ${item.product.vehicleCompatibility ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Aplica: ${item.product.vehicleCompatibility}</div>` : ''}
          </td>
          <td style="padding: 8px 10px; font-weight: 700; color: #1e293b; font-size: 11px; text-transform: uppercase;">${item.product.brand}</td>
          <td style="padding: 8px 10px; text-align: center; font-weight: 800; color: #0f172a; font-size: 12px;">${item.quantity}</td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #0f172a; font-size: 12px; white-space: nowrap;">${formatCOP(item.product.price)}</td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #0f172a; font-size: 12px; white-space: nowrap;">${formatCOP(itemSubtotal)}</td>
        </tr>
      `;
    })
    .join('');

  const buildQuoteHtml = () => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Cotización Oficial ${quoteNumber} - Repuestos Rimar</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 15mm 10mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }
        .brand-title span {
          color: #dc2626;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 600;
        }
        .customer-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          text-align: left;
        }
        th.text-right {
          text-align: right;
        }
        th.text-center {
          text-align: center;
        }
        .totals-table {
          margin-left: auto;
          width: 320px;
          margin-top: 14px;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 6px 10px;
        }
        .footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #64748b;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
          tr { page-break-inside: avoid; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="brand-title">Repuestos <span>Rimar</span></h1>
          <div class="brand-sub">Especialistas en Ford • Jeep • Dodge • RAM • Chrysler • Chevrolet</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
            Bogotá, Colombia • Despachos a nivel nacional | Web: <strong>${COMPANY_INFO.website}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 900; font-size: 14px; color: #dc2626;">COTIZACIÓN FORMAL</div>
          <div style="font-family: monospace; font-weight: 800; font-size: 12px; color: #0f172a;">${quoteNumber}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Fecha: <strong>${currentDate}</strong></div>
          <div style="margin-top: 3px; font-weight: 600; color: #047857; font-size: 11px;">
            Atendido por: Asesor Comercial ${advisor.name} (${advisor.phone})
          </div>
        </div>
      </div>

      <div class="customer-card">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Cliente / Destinatario:</div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${customer.customerName.trim() || 'Cliente Mostrador / Taller'}</div>
          ${customer.phone.trim() ? `<div style="font-size: 11px; color: #475569;">Tel / Celular: ${customer.phone.trim()}</div>` : ''}
          ${customer.city.trim() ? `<div style="font-size: 11px; color: #475569;">Ciudad Destino: ${customer.city.trim()}</div>` : ''}
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Datos del Vehículo / Nota:</div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${customer.vehicleModel.trim() || 'No especificado'}</div>
          ${customer.notes.trim() ? `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 2px;">Nota: ${customer.notes.trim()}</div>` : ''}
        </div>
      </div>

      <div class="no-print" style="margin-bottom: 12px; padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span><strong>Cotización lista para imprimir o guardar en PDF:</strong></span>
        <button onclick="window.print()" style="background: #dc2626; color: white; border: none; padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          🖨️ Imprimir / Guardar en PDF
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 25px; text-align: center;">#</th>
            <th style="width: 62px; text-align: center;">Foto</th>
            <th style="width: 75px;">Código</th>
            <th>Descripción del Repuesto</th>
            <th style="width: 75px;">Marca</th>
            <th class="text-center" style="width: 45px;">Cant</th>
            <th class="text-right" style="width: 100px;">Precio</th>
            <th class="text-right" style="width: 105px;">Subtotal (sin IVA)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table class="totals-table">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="color: #64748b; font-weight: 600;">Subtotal repuestos (${totalItemsCount} unid.):</td>
          <td style="text-align: right; font-weight: 800; color: #0f172a;">${formatCOP(subtotal)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="color: #64748b; font-weight: 600;">IVA correspondiente (19%):</td>
          <td style="text-align: right; font-weight: 700; color: #dc2626;">${formatCOP(iva)}</td>
        </tr>
        <tr style="background-color: #f1f5f9; border-top: 2px solid #0f172a;">
          <td style="font-weight: 900; font-size: 13px; color: #0f172a; padding: 8px 10px;">TOTAL A PAGAR (con IVA):</td>
          <td style="text-align: right; font-weight: 900; font-size: 14px; color: #047857; padding: 8px 10px;">${formatCOP(total)}</td>
        </tr>
      </table>

      <div class="footer">
        <div>
          * Validez de la cotización: 8 días calendario. Precios sujetos a cambio sin previo aviso. Despachos contra confirmación de pago.
        </div>
        <div>
          Confirmar y despachar por WhatsApp: <strong style="color: #dc2626; font-weight: 800;">${advisor.phone}</strong>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(buildQuoteHtml());
      printWindow.document.close();
      return;
    } catch (e) {
      console.warn('Error writing quote to print popup, falling back to hidden iframe', e);
    }
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(buildQuoteHtml());
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
    }, 450);
  }
}

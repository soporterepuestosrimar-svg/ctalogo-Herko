import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  Smartphone, 
  Image as ImageIcon, 
  ShieldCheck, 
  Search,
  Sparkles,
  Tag,
  QrCode
} from 'lucide-react';
import { COMPANY_INFO } from '../data/products';
import { Product } from '../types';

interface ShareCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [searchRef, setSearchRef] = useState('');

  if (!isOpen) return null;

  // Base public link
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.origin + window.location.pathname 
    : 'https://www.repuestosrimar.com';

  const handleCopyGeneral = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareGeneralWhatsApp = () => {
    const text = encodeURIComponent(
      `🚗 *Catálogo Digital Oficial - REPUESTOS RIMAR*\n\n` +
      `Te comparto nuestro catálogo completo de repuestos para Ford, Jeep, Dodge, RAM y Chevrolet. ` +
      `Puedes consultar referencias, fotos con zoom de alta resolución, compatibilidad y cotizar directamente por WhatsApp sin pasarela de pago ni registro:\n\n` +
      `🔗 ${currentUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyProductRef = async (product: Product) => {
    const refUrl = `${currentUrl}?ref=${encodeURIComponent(product.code)}`;
    try {
      await navigator.clipboard.writeText(refUrl);
      setCopiedRef(product.code);
      setTimeout(() => setCopiedRef(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareProductWhatsApp = (product: Product) => {
    const refUrl = `${currentUrl}?ref=${encodeURIComponent(product.code)}`;
    const text = encodeURIComponent(
      `🚗 *Repuesto en Repuestos Rimar*\n` +
      `📌 *Ref:* ${product.code}\n` +
      `⚙️ *Descripción:* ${product.description}\n` +
      `🚘 *Aplicación:* ${product.vehicleCompatibility || 'Consultar'}\n` +
      `🔗 *Ver foto y detalles:* ${refUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Filter products for quick reference testing
  const filteredQuickProducts = products.filter((p) => {
    if (!searchRef.trim()) return false;
    const q = searchRef.toLowerCase().trim();
    return p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  }).slice(0, 5);

  const featuredSamples = products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-950/40 border border-red-500/40">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
                Enlace Público Gratuito del Catálogo
              </h2>
              <p className="text-xs text-slate-300">
                Comparte el catálogo o repuestos específicos con clientes sin costo alguno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {/* Key Guarantees Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">100% Gratuito y Sin Registro</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Sin pasarelas de pago, sin suscripciones ni cobros. Todos los pedidos se tramitan vía WhatsApp.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Cualquier Dispositivo</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Optimizado para abrir al instante en Android, iPhone, tablets y computadores.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Fotos 100% Garantizadas</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Fotografías de alta definición integradas directamente, sin enlaces rotos ni dependencias.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Carga Rápida por Referencia</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Al hacer clic en cualquier referencia se abre la imagen con zoom y compatibilidad de modelo.
                </div>
              </div>
            </div>
          </div>

          {/* Enlace General del Catálogo */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs uppercase tracking-wider block flex items-center justify-between">
              <span>Enlace Directo del Catálogo General:</span>
              <span className="text-[11px] font-normal text-emerald-600 font-semibold">Listo para compartir</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all truncate flex items-center">
                {currentUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyGeneral}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0"
              >
                {copiedGeneral ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareGeneralWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar por WhatsApp a Clientes</span>
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Nueva Pestaña</span>
              </a>
            </div>
          </div>

          {/* Compartir Referencia Específica con Imagen */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-red-600" />
                <span>Compartir un Repuesto o Referencia Específica</span>
              </div>
              <span className="text-[11px] text-slate-500">Carga la foto y ficha técnica directa</span>
            </div>

            {/* Search Ref input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="Escribe el número de referencia (ej. 10582, 10583, 11391)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* If search result */}
            {filteredQuickProducts.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {filteredQuickProducts.map((p) => {
                  const isCopied = copiedRef === p.code;
                  return (
                    <div 
                      key={p.id}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-600 text-xs bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            Ref: {p.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{p.brand}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                          {p.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProduct?.(p);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-colors"
                          title="Ver en pantalla"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyProductRef(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-300" />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareProductWhatsApp(p)}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                          title="Compartir por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-500 font-medium mb-1">
                  Referencias populares disponibles para compartir de inmediato:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {featuredSamples.map((p) => {
                    const isCopied = copiedRef === p.code;
                    return (
                      <div 
                        key={p.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono font-bold text-red-600 text-xs">
                            Ref: {p.code}
                          </span>
                          <div className="text-[11px] text-slate-700 truncate font-medium">
                            {p.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyProductRef(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors text-[10px] font-bold flex items-center gap-1"
                            title="Copiar link directo de este repuesto"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-300" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareProductWhatsApp(p)}
                            className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                            title="Compartir repuesto en WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 fill-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {COMPANY_INFO.name} • {COMPANY_INFO.website}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  ShoppingCart, 
  Check, 
  Car, 
  Tag, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Move,
  Share2
} from 'lucide-react';
import { Product, Advisor } from '../types';
import { formatCOP, buildWhatsAppProductInquiryUrl, IVA_RATE, getProductDisplayImage, getCategoryFallbackSvg } from '../utils/formatters';
import { CATEGORY_DEFAULT_IMAGES, ADVISORS } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  activeAdvisor: Advisor;
  onSelectAdvisor?: (advisor: Advisor) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isInCart: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  activeAdvisor,
  onSelectAdvisor,
  onAddToCart,
  isInCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const resolvedImageUrl = product ? getProductDisplayImage(product, CATEGORY_DEFAULT_IMAGES) : '';
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
    setZoomLevel(1);
    setPanPosition({ x: 50, y: 50 });
  }, [product?.id]);

  if (!product) return null;

  const currentImg = (!hasImgError && resolvedImageUrl && resolvedImageUrl.trim().length > 0)
    ? resolvedImageUrl
    : getCategoryFallbackSvg(product.category, product.code);

  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(product.code)}`;
    const shareText = `Consulta este repuesto en Repuestos Rimar: ${product.description} (Ref: ${product.code})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ref. ${product.code} - Repuestos Rimar`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Fallback
    }
  };
  const ivaAmount = product.price * IVA_RATE;
  const unitPriceWithIva = product.price + ivaAmount;
  const totalPriceWithoutIva = product.price * quantity;
  const totalIva = ivaAmount * quantity;
  const grandTotal = unitPriceWithIva * quantity;

  const whatsappInquiryUrl = buildWhatsAppProductInquiryUrl(product, activeAdvisor, quantity);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 50, y: 50 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 50, y: 50 });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel === 1) {
      // Calculate origin
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPanPosition({ x, y });
      setZoomLevel(2);
    } else if (zoomLevel < 3) {
      setZoomLevel((prev) => prev + 0.8);
    } else {
      handleResetZoom();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPanPosition({ x, y });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors shadow-md"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto flex-1">
            {/* Image side with Zoom Controls */}
            <div className="relative bg-gradient-to-b from-slate-100 to-slate-200/90 min-h-[280px] md:min-h-[420px] flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-200 select-none overflow-hidden group">
              
              {/* Floating Zoom Control Bar */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-700/60 text-white">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3.5}
                  className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  title="Acercar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  title="Alejar (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-300 transition-colors text-xs font-bold px-1.5"
                    title="Restablecer vista 1x"
                  >
                    1x
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFullscreenZoom(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Pantalla completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Level Indicator */}
              {zoomLevel > 1 && (
                <div className="absolute top-3 right-3 z-20 bg-red-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow">
                  Zoom {zoomLevel.toFixed(1)}x
                </div>
              )}

              {/* Main Interactive Zoom Box */}
              <div 
                ref={imageContainerRef}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                className={`relative w-full h-full max-h-[360px] flex items-center justify-center p-2 rounded-2xl overflow-hidden cursor-${zoomLevel > 1 ? 'move' : 'zoom-in'}`}
                title={zoomLevel > 1 ? 'Mueve el cursor para explorar • Clic para alejar' : 'Haz clic para hacer zoom'}
              >
                <img
                  src={currentImg}
                  alt={product.description}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (!hasImgError) {
                      setHasImgError(true);
                    }
                  }}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: `${panPosition.x}% ${panPosition.y}%`,
                    transition: zoomLevel > 1 ? 'transform 0.15s ease-out' : 'transform 0.3s ease',
                  }}
                  className="max-w-full max-h-[340px] w-auto h-auto object-contain object-center drop-shadow-md pointer-events-none"
                />
              </div>

              {/* Instructions Bar */}
              <div className="mt-2 flex items-center justify-between w-full px-2 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-600">
                  <ZoomIn className="w-3.5 h-3.5 text-red-600" />
                  {zoomLevel > 1 ? 'Desplaza el cursor para ver detalles' : 'Clic sobre la foto para hacer zoom'}
                </span>
                <span className="font-mono text-slate-700 font-bold bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
                  Ref: {product.code}
                </span>
              </div>
            </div>

            {/* Details side */}
            <div className="p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs uppercase tracking-wider font-bold text-red-600">
                    {product.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                    Marca: {product.brand}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mb-3">
                  {product.description}
                </h2>

                {product.vehicleCompatibility && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-xs text-slate-700">
                    <div className="font-bold flex items-center gap-1.5 text-slate-900 mb-0.5">
                      <Car className="w-3.5 h-3.5 text-red-600" />
                      Vehículos y Modelos Compatibles
                    </div>
                    <div className="font-medium text-slate-800">{product.vehicleCompatibility}</div>
                  </div>
                )}

                {/* Price section with "+ IVA" banner */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl mb-4 shadow-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {formatCOP(product.price)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider">
                      + IVA
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex justify-between border-t border-slate-800 pt-1.5">
                    <span>IVA (19%): {formatCOP(ivaAmount)}</span>
                    <span className="font-bold text-amber-300">Total con IVA: {formatCOP(unitPriceWithIva)}</span>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-bold text-slate-700 uppercase">Cantidad a cotizar:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-black text-slate-900 min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {quantity > 1 && (
                  <div className="text-xs text-slate-600 mb-4 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Total {quantity} unidades: <strong className="text-slate-900">{formatCOP(grandTotal)} con IVA</strong>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>Agregar {quantity} al Cotizador</span>
                </button>

                {/* Advisor Selector */}
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Asesor para consultar este repuesto:</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{activeAdvisor.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ADVISORS.map((adv) => {
                      const isSelected = activeAdvisor.id === adv.id;
                      return (
                        <button
                          key={adv.id}
                          type="button"
                          onClick={() => onSelectAdvisor?.(adv)}
                          className={`p-1.5 px-2 rounded-lg text-left border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50/90 border-red-500 ring-1 ring-red-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{adv.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{adv.phone}</div>
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${adv.avatarColor}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>Consultar por WhatsApp con {activeAdvisor.name} ({activeAdvisor.phone})</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-all active:scale-95"
                    title="Copiar enlace directo de este repuesto"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{copiedShare ? '✓ ¡Enlace copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(product.code)}`;
                      const text = encodeURIComponent(
                        `🚗 *Repuesto en Repuestos Rimar*\n` +
                        `📌 *Ref:* ${product.code}\n` +
                        `⚙️ *Descripción:* ${product.description}\n` +
                        `🚘 *Compatibilidad:* ${product.vehicleCompatibility || 'Consultar'}\n` +
                        `🔗 *Ver foto y ficha técnica:* ${shareUrl}`
                      );
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                    title="Enviar enlace directo a WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>Enviar a WhatsApp</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Repuesto Nuevo Garantizado
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Despachos Inmediatos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {isFullscreenZoom && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsFullscreenZoom(false)}
        >
          {/* Header controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold flex items-center gap-2">
              <span className="text-red-400">Ref: {product.code}</span>
              <span className="text-slate-400">•</span>
              <span className="truncate max-w-[260px] sm:max-w-md">{product.description}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                title="Acercar"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                title="Alejar"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-2.5"
                title="Reset 1x"
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenZoom(false)}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                title="Cerrar pantalla completa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen interactive image */}
          <div 
            className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center overflow-hidden cursor-move p-4"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
          >
            <img
              src={currentImg}
              alt={product.description}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => {
                if (!hasImgError) {
                  setHasImgError(true);
                }
              }}
              style={{
                transform: `scale(${Math.max(zoomLevel, 1.5)})`,
                transformOrigin: `${panPosition.x}% ${panPosition.y}%`,
                transition: 'transform 0.12s ease-out',
              }}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
            />
          </div>

          <div className="absolute bottom-4 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            Desplaza el cursor sobre la foto para explorar cada detalle del repuesto • Clic en la X para salir
          </div>
        </div>
      )}
    </>
  );
};

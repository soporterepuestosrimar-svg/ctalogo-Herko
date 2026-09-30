import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ShoppingCart, 
  Check, 
  Edit, 
  Trash2, 
  Maximize2,
  Car,
  Tag,
  Sparkles
} from 'lucide-react';
import { Product, Advisor } from '../types';
import { formatCOP, buildWhatsAppProductInquiryUrl, IVA_RATE, getProductDisplayImage } from '../utils/formatters';
import { CATEGORY_DEFAULT_IMAGES } from '../data/products';
import { ImageFallback } from './ImageFallback';

interface ProductCardProps {
  product: Product;
  activeAdvisor: Advisor;
  isInCart: boolean;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isAdmin: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  activeAdvisor,
  isInCart,
  onAddToCart,
  onViewDetails,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const resolvedImageUrl = getProductDisplayImage(product, CATEGORY_DEFAULT_IMAGES);

  const ivaAmount = (Number(product.price) || 0) * IVA_RATE;
  const priceWithIva = (Number(product.price) || 0) + ivaAmount;

  const brandStyles: Record<string, { badge: string; border: string }> = {
    Ford: { badge: 'bg-blue-600/15 text-blue-700 border-blue-200', border: 'hover:border-blue-300' },
    Jeep: { badge: 'bg-emerald-600/15 text-emerald-800 border-emerald-200', border: 'hover:border-emerald-300' },
    'Dodge/RAM': { badge: 'bg-red-600/15 text-red-700 border-red-200', border: 'hover:border-red-300' },
    Chevrolet: { badge: 'bg-amber-600/15 text-amber-800 border-amber-200', border: 'hover:border-amber-300' },
    Multimarca: { badge: 'bg-purple-600/15 text-purple-800 border-purple-200', border: 'hover:border-purple-300' },
  };

  const currentBrand = brandStyles[product.brand] || brandStyles['Multimarca'];
  const whatsappUrl = buildWhatsAppProductInquiryUrl(product, activeAdvisor, 1);

  return (
    <div className={`group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${currentBrand.border}`}>
      {/* Admin Action overlay badges */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-slate-700">
          <button
            onClick={() => onEdit?.(product)}
            className="p-1.5 text-slate-200 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Editar artículo"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete?.(product)}
            className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Eliminar artículo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Product Image Area */}
      <div 
        className="relative w-full h-44 sm:h-48 bg-gradient-to-b from-slate-50 to-slate-100/90 p-3 flex items-center justify-center overflow-hidden cursor-pointer group/img border-b border-slate-100"
        onClick={() => onViewDetails(product)}
        title="Clic para ver detalles y ampliar imagen con Zoom"
      >
        <ImageFallback
          src={resolvedImageUrl}
          alt={product.description || 'Repuesto automotriz'}
          category={product.category}
          code={product.code}
          lazy={true}
          className="max-w-full max-h-full w-auto h-auto object-contain object-center group-hover/img:scale-105 transition-transform duration-300 drop-shadow-sm"
        />
        
        {/* Subtle zoom hint overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[11px] font-bold backdrop-blur-sm shadow-md flex items-center gap-1 scale-95 group-hover/img:scale-100 transition-transform">
            🔍 Ver y Ampliar
          </span>
        </div>

        {/* Article Code Badge - Interactive click to load reference details */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-slate-950/90 hover:bg-red-600 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide border border-white/15 hover:border-red-500 shadow-md transition-all active:scale-95 cursor-pointer"
          title={`Ver foto ampliada y compatibilidad de Ref. ${product.code}`}
        >
          <Tag className="w-3 h-3 text-red-400" />
          <span>Ref: {product.code}</span>
        </button>

        {/* Brand Tag Top Left */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${currentBrand.badge} bg-white/95 backdrop-blur-sm`}>
            <Car className="w-3 h-3" />
            {product.brand}
          </span>
        </div>

        {/* Zoom trigger icon */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-lg">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {product.stockStatus || 'Disponible'}
            </span>
          </div>

          {/* Description */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm sm:text-base font-bold text-slate-900 hover:text-red-600 transition-colors leading-snug line-clamp-2 cursor-pointer mb-2"
            title={product.description}
          >
            {product.description}
          </h3>

          {/* Vehicle compatibility badge */}
          {product.vehicleCompatibility && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg p-2 mb-3 line-clamp-2">
              <span className="font-semibold text-slate-700">Aplicación:</span> {product.vehicleCompatibility}
            </p>
          )}
        </div>

        {/* Pricing Block with "+ IVA" clearly highlighted */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mb-1">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatCOP(product.price)}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-black text-red-700 bg-red-100 border border-red-300 rounded-md uppercase tracking-wider animate-none shadow-xs">
              + IVA
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mb-3.5 flex items-center justify-between">
            <span>Con IVA (19%): <strong className="text-slate-800 font-semibold">{formatCOP(priceWithIva)}</strong></span>
            <span className="text-[10px] text-slate-400">COP</span>
          </div>

          {/* Actions: Add to Cart + WhatsApp */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                isInCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span className="truncate">En Cotización</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">+ Cotizar Repuesto</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 text-center"
              title={`Pedir información a ${activeAdvisor.name} por WhatsApp`}
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span className="truncate">Pedir por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

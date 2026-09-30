import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  Printer, 
  Car, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CartItem, Advisor, CustomerOrderInfo } from '../types';
import { ADVISORS, COMPANY_INFO } from '../data/products';
import { formatCOP, calculateCartTotals, buildWhatsAppCartUrl } from '../utils/formatters';
import { printOrderQuotePDF } from '../utils/exportCatalog';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  activeAdvisor: Advisor;
  onSelectAdvisor: (advisor: Advisor) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  activeAdvisor,
  onSelectAdvisor,
}) => {
  const [customer, setCustomer] = useState<CustomerOrderInfo>({
    customerName: '',
    city: '',
    phone: '',
    vehicleModel: '',
    advisorId: activeAdvisor.id,
    notes: '',
  });

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>(activeAdvisor.id);

  // Sincronizar inmediatamente cuando cambia el asesor activo en la app o se abre el modal
  useEffect(() => {
    if (activeAdvisor?.id) {
      setSelectedAdvisorId(activeAdvisor.id);
      setCustomer((prev) => ({ ...prev, advisorId: activeAdvisor.id }));
    }
  }, [activeAdvisor.id, isOpen]);

  const currentAdvisor = useMemo(() => {
    return ADVISORS.find((a) => a.id === selectedAdvisorId) || activeAdvisor;
  }, [selectedAdvisorId, activeAdvisor]);

  const { subtotal, iva, total, totalItemsCount } = calculateCartTotals(items);

  const whatsappUrl = useMemo(() => {
    if (items.length === 0) return '#';
    return buildWhatsAppCartUrl(
      items, 
      { ...customer, advisorId: currentAdvisor.id }, 
      currentAdvisor
    );
  }, [items, customer, currentAdvisor]);

  if (!isOpen) return null;

  const handleAdvisorPick = (advisor: Advisor) => {
    setSelectedAdvisorId(advisor.id);
    setCustomer((prev) => ({ ...prev, advisorId: advisor.id }));
    onSelectAdvisor(advisor);
  };

  const handlePrintQuote = () => {
    if (items.length === 0) return;
    printOrderQuotePDF(
      items, 
      { ...customer, advisorId: currentAdvisor.id }, 
      currentAdvisor
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <span>Cotizador de Repuestos</span>
              <span className="text-xs font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-800/60">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {COMPANY_INFO.name} • Los precios unitarios no incluyen IVA (+ 19%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Tu lista de cotización está vacía</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Navega en el catálogo y haz clic en &quot;+ Cotizar&quot; en cualquier repuesto para agregarlo aquí.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow"
              >
                Volver al Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Product items table / list */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase pb-1 border-b border-slate-200">
                  <span>Artículos Seleccionados</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors lowercase first-letter:uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vaciar lista
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {items.map(({ product, quantity }) => {
                    const itemTotal = product.price * quantity;
                    return (
                      <div
                        key={product.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              Ref {product.code}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              {product.brand}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {product.description}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {formatCOP(product.price)} <span className="text-red-600 font-bold">+ IVA</span> c/u
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-300 bg-white rounded-xl shadow-xs">
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-l-xl transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 font-black text-xs text-slate-900 min-w-[24px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-r-xl transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <div className="text-xs sm:text-sm font-black text-slate-900">
                              {formatCOP(itemTotal)}
                            </div>
                            <div className="text-[10px] text-slate-500">sin IVA</div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Quitar de cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal calculations block */}
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal repuestos (sin IVA):</span>
                    <span className="font-bold text-slate-900">{formatCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>IVA correspondiente (19%):</span>
                    <span className="font-bold text-red-600">{formatCOP(iva)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between text-sm sm:text-base font-black text-slate-900">
                    <span>Total estimado con IVA:</span>
                    <span className="text-emerald-700">{formatCOP(total)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    * El valor final puede variar según costos de envío a destino.
                  </div>
                </div>
              </div>

              {/* Order Form & Advisor Selection */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    1. ¿Qué asesor te atenderá?
                  </h3>

                  {/* Advisor selector cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADVISORS.map((adv) => {
                      const isSelected = selectedAdvisorId === adv.id;
                      return (
                        <button
                          key={adv.id}
                          type="button"
                          onClick={() => handleAdvisorPick(adv)}
                          className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">{adv.name}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${adv.avatarColor}`} />
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">{adv.phone}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{adv.role}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tu cotización se enviará directamente a: <strong>{currentAdvisor.name}</strong> ({currentAdvisor.phone})</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-red-600" />
                    2. Tus datos para el pedido (Opcional)
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Nombre completo o Taller:
                      </label>
                      <input
                        type="text"
                        value={customer.customerName}
                        onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                        placeholder="Ej. Juan Carlos Pérez / Taller Mecánico"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Ciudad / Destino:
                        </label>
                        <input
                          type="text"
                          value={customer.city}
                          onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                          placeholder="Ej. Bogotá, Medellín..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Teléfono / Celular:
                        </label>
                        <input
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="Ej. 310..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Vehículo (Marca, Modelo, Motor, Año):
                      </label>
                      <input
                        type="text"
                        value={customer.vehicleModel}
                        onChange={(e) => setCustomer({ ...customer, vehicleModel: e.target.value })}
                        placeholder="Ej. Ford Explorer 2012 Motor 3.5L"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Observaciones / Notas adicionales:
                      </label>
                      <textarea
                        value={customer.notes}
                        onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                        placeholder="¿Requieres envío urgente, cotización formal, etc.?"
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="submit-whatsapp-order"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                    <div className="flex flex-col items-center leading-tight">
                      <span>Enviar Pedido a {currentAdvisor.name} por WhatsApp</span>
                      <span className="text-[11px] font-normal text-emerald-100">
                        Destino WhatsApp: {currentAdvisor.phone}
                      </span>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={handlePrintQuote}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimir o Guardar Cotización en PDF (Asesor: {currentAdvisor.name})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

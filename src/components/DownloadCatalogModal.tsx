import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Filter, 
  Layers, 
  Sparkles,
  FileText,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Advisor } from '../types';
import { COMPANY_INFO, ADVISORS } from '../data/products';
import { printCatalogPDF } from '../utils/exportCatalog';

interface DownloadCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  filteredProducts: Product[];
  currentBrand: string;
  currentCategory: string;
  searchTerm: string;
  activeAdvisor: Advisor;
  onSelectAdvisor?: (advisor: Advisor) => void;
}

export const DownloadCatalogModal: React.FC<DownloadCatalogModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  filteredProducts,
  currentBrand,
  currentCategory,
  searchTerm,
  activeAdvisor,
  onSelectAdvisor,
}) => {
  const isFiltered = 
    filteredProducts.length !== allProducts.length ||
    currentBrand !== 'all' ||
    currentCategory !== 'all' ||
    Boolean(searchTerm);

  const [downloadScope, setDownloadScope] = useState<'filtered' | 'all'>(
    isFiltered ? 'filtered' : 'all'
  );

  if (!isOpen) return null;

  const targetProducts = downloadScope === 'filtered' ? filteredProducts : allProducts;

  // Build descriptive label of current filter
  let filterDescription = 'Catálogo Completo';
  if (downloadScope === 'filtered' && isFiltered) {
    const parts: string[] = [];
    if (currentBrand !== 'all') parts.push(`Marca: ${currentBrand}`);
    if (currentCategory !== 'all') parts.push(`Categoría: ${currentCategory}`);
    if (searchTerm) parts.push(`Búsqueda: "${searchTerm}"`);
    filterDescription = parts.join(' • ') || 'Catálogo Filtrado';
  }

  const handlePrintPDF = () => {
    printCatalogPDF(
      targetProducts,
      downloadScope === 'all' ? 'Catálogo Completo' : 'Catálogo Filtrado',
      filterDescription,
      activeAdvisor
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Download className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Descargar Catálogo en PDF</span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                  {targetProducts.length} repuestos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {COMPANY_INFO.name} • Incluye fotos de referencias y precios con IVA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* 1. Selector de Alcance (Completo o Filtrado) */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              1. Selecciona los repuestos a incluir en el PDF:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option: All Catalog */}
              <button
                type="button"
                onClick={() => setDownloadScope('all')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  downloadScope === 'all'
                    ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${downloadScope === 'all' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Catálogo Completo</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {allProducts.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Todas las marcas y repuestos en el inventario con fotografía.
                  </p>
                </div>
              </button>

              {/* Option: Current Filter */}
              <button
                type="button"
                onClick={() => setDownloadScope('filtered')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  downloadScope === 'filtered'
                    ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${downloadScope === 'filtered' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Filter className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Catálogo Filtrado</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                      {filteredProducts.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {isFiltered ? filterDescription : 'Muestra el filtro actual en pantalla'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Scope Summary Preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-slate-600">
                Se generará el PDF con <strong>{targetProducts.length}</strong> repuestos ({downloadScope === 'all' ? 'Todo el inventario' : filterDescription})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              {new Date().toLocaleDateString('es-CO')}
            </span>
          </div>

          {/* PDF Details Notice */}
          <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200/80 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
              <ImageIcon className="w-4 h-4 text-red-600 shrink-0" />
              <span>Fotos e Información incluidas en el Catálogo PDF:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
              <li>Fotografía a color de cada referencia de repuesto</li>
              <li>Código oficial, marca y descripción detallada</li>
              <li>Compatibilidad vehicular y notas técnicas</li>
              <li>Precios unitarios desglosados y precio total con IVA (19%)</li>
              <li>Membrete oficial de Repuestos Rimar</li>
            </ul>
          </div>

          {/* 2. Advisor Selection for PDF */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-red-600" />
                <span>2. Asesor Comercial en el PDF:</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">{activeAdvisor.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ADVISORS.map((adv) => {
                const isSelected = activeAdvisor.id === adv.id;
                return (
                  <button
                    key={adv.id}
                    type="button"
                    onClick={() => onSelectAdvisor?.(adv)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-50/90 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{adv.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{adv.phone}</div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${adv.avatarColor}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. PDF Download Action Button */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              3. Generar y Descargar:
            </label>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-between gap-3 shadow-lg shadow-red-950/20 transition-all active:scale-95 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm flex items-center gap-2">
                    <span>Descargar Catálogo en PDF con Fotos</span>
                  </div>
                  <div className="text-xs text-red-100 mt-0.5">
                    Se abrirá la vista de impresión/guardado en PDF con todas las fotos
                  </div>
                </div>
              </div>
              <FileText className="w-6 h-6 text-red-200 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Línea WhatsApp: <strong>{activeAdvisor.phone}</strong></span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

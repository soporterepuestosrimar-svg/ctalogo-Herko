import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FolderUp, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  Check
} from 'lucide-react';
import { Product } from '../types';

interface BulkImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onBatchUpdateImages: (updates: { productId: string; imageUrl: string }[]) => void;
}

interface ProcessedImage {
  id: string;
  file: File;
  fileName: string;
  previewUrl: string;
  matchedProduct: Product | null;
  status: 'matched' | 'unmatched';
}

// Compress and resize image to fit in browser storage comfortably (~40KB per image)
function compressImage(file: File, maxWidth = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Extract article/reference number from filename
function findMatchingProduct(fileName: string, products: Product[]): Product | null {
  // Strip extension
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim();

  // 1. Direct exact match (e.g. "10582.jpg")
  const exact = products.find((p) => p.code === baseName);
  if (exact) return exact;

  // 2. Extract sequences of digits from filename (e.g. "Ref-10582", "10582_bomba", "bomba_10582")
  const digits = baseName.match(/\d+/g) || [];
  for (const digitGroup of digits) {
    const found = products.find((p) => p.code === digitGroup);
    if (found) return found;
  }

  // 3. Fallback: check if product code is contained in the filename
  for (const prod of products) {
    if (baseName.includes(prod.code)) {
      return prod;
    }
  }

  return null;
}

export const BulkImageUploadModal: React.FC<BulkImageUploadModalProps> = ({
  isOpen,
  onClose,
  products,
  onBatchUpdateImages,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    setAppliedCount(null);

    const newProcessed: ProcessedImage[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const compressedBase64 = await compressImage(file);
        const matched = findMatchingProduct(file.name, products);

        newProcessed.push({
          id: `upload-${Date.now()}-${i}`,
          file,
          fileName: file.name,
          previewUrl: compressedBase64,
          matchedProduct: matched,
          status: matched ? 'matched' : 'unmatched',
        });
      } catch {
        // ignore single failed file
      }
    }

    setProcessedImages((prev) => [...newProcessed, ...prev]);
    setIsProcessing(false);
  };

  const handleManualMatchChange = (imageId: string, targetProductId: string) => {
    const targetProduct = products.find((p) => p.id === targetProductId) || null;
    setProcessedImages((prev) =>
      prev.map((item) => {
        if (item.id === imageId) {
          return {
            ...item,
            matchedProduct: targetProduct,
            status: targetProduct ? 'matched' : 'unmatched',
          };
        }
        return item;
      })
    );
  };

  const handleRemoveImage = (imageId: string) => {
    setProcessedImages((prev) => prev.filter((item) => item.id !== imageId));
  };

  const handleClearAll = () => {
    setProcessedImages([]);
    setAppliedCount(null);
  };

  const handleApplyAll = () => {
    const matchedItems = processedImages.filter((item) => item.matchedProduct !== null);
    if (matchedItems.length === 0) return;

    const updates = matchedItems.map((item) => ({
      productId: item.matchedProduct!.id,
      imageUrl: item.previewUrl,
    }));

    onBatchUpdateImages(updates);
    setAppliedCount(matchedItems.length);
  };

  const matchedCount = processedImages.filter((p) => p.status === 'matched').length;
  const unmatchedCount = processedImages.filter((p) => p.status === 'unmatched').length;

  const filteredItems = processedImages.filter((item) => {
    if (filterTab === 'matched' && item.status !== 'matched') return false;
    if (filterTab === 'unmatched' && item.status !== 'unmatched') return false;

    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      const matchName = item.fileName.toLowerCase().includes(query);
      const matchCode = item.matchedProduct?.code.toLowerCase().includes(query);
      const matchDesc = item.matchedProduct?.description.toLowerCase().includes(query);
      return matchName || matchCode || matchDesc;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
              <UploadCloud className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                  Subida Masiva de Fotos por Referencia
                </h2>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Organizador Automático
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sube una carpeta o múltiples fotos con el número del artículo (ej. <code className="text-slate-200 font-bold">10582.jpg</code>, <code className="text-slate-200 font-bold">51069.png</code>). La app las asignará a cada repuesto automáticamente.
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            className={`p-6 rounded-3xl border-2 border-dashed text-center transition-all ${
              isDragging
                ? 'border-red-500 bg-red-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/80'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center mx-auto text-red-600">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Arrastra aquí tus fotos o selecciona desde tu equipo
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Formatos soportados: JPG, PNG, WEBP. La app buscará el número de referencia dentro del nombre de cada archivo.
                </p>
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar Múltiples Fotos</span>
                </button>

                {/* Folder upload */}
                <input
                  ref={folderInputRef}
                  type="file"
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <FolderUp className="w-4 h-4 text-red-600" />
                  <span>Subir Carpeta Completa</span>
                </button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-red-600 font-bold animate-pulse pt-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Optimizando y organizando imágenes por referencia...</span>
                </div>
              )}
            </div>
          </div>

          {/* Success Banner when applied */}
          {appliedCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2.5 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  ¡Éxito! Se actualizaron correctamente {appliedCount} fotos en el catálogo de Repuestos Rimar.
                </span>
              </div>
              <button
                onClick={() => setAppliedCount(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
              >
                Cerrar aviso
              </button>
            </div>
          )}

          {/* Review & Matches list */}
          {processedImages.length > 0 && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800">
                    {processedImages.length} fotos cargadas:
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {matchedCount} asociadas
                  </span>
                  {unmatchedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {unmatchedCount} sin asociar
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar lista</span>
                  </button>

                  <button
                    onClick={handleApplyAll}
                    disabled={matchedCount === 0}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Aplicar {matchedCount} Fotos al Catálogo</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas ({processedImages.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('matched')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      filterTab === 'matched' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Asociadas ({matchedCount})
                  </button>
                  <button
                    onClick={() => setFilterTab('unmatched')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      filterTab === 'unmatched' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por Asignar ({unmatchedCount})
                  </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por archivo o referencia..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Image Match Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      item.status === 'matched'
                        ? 'bg-white border-slate-200/90 shadow-xs'
                        : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">📷</div>
                      )}
                    </div>

                    {/* Details & Assignment */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-slate-500 truncate" title={item.fileName}>
                        📄 {item.fileName}
                      </div>

                      {item.status === 'matched' && item.matchedProduct ? (
                        <div className="mt-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono text-[10px]">
                              Ref. {item.matchedProduct.code}
                            </span>
                            <span className="truncate">{item.matchedProduct.description}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Marca: {item.matchedProduct.brand} • {item.matchedProduct.category}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block mb-1">
                            ⚠️ No se detectó referencia en el nombre
                          </span>
                          <select
                            value={item.matchedProduct?.id || ''}
                            onChange={(e) => handleManualMatchChange(item.id, e.target.value)}
                            className="w-full text-xs p-1 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value="">Selecciona el artículo correspondiente...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.code}] {p.description.slice(0, 40)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Remove individual photo button */}
                    <button
                      onClick={() => handleRemoveImage(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {processedImages.length > 0 && `${matchedCount} listas para aplicar`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
            >
              Cerrar
            </button>
            {matchedCount > 0 && (
              <button
                onClick={() => {
                  handleApplyAll();
                  setTimeout(() => onClose(), 600);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar y Cerrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

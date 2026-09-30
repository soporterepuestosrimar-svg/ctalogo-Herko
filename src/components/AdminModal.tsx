import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Search,
  UploadCloud,
  LogOut,
  Cloud,
  Database,
  RefreshCw
} from 'lucide-react';
import { Product } from '../types';
import { COMPANY_INFO, INITIAL_PRODUCTS } from '../data/products';
import { formatCOP } from '../utils/formatters';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (email: string) => boolean;
  onLogout: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
  onOpenBulkUpload?: () => void;
  onForceSyncCloud?: () => Promise<void>;
  isSyncingCloud?: boolean;
  isCloudSynced?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLogin,
  onLogout,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetCatalog,
  onOpenBulkUpload,
  onForceSyncCloud,
  isSyncingCloud,
  isCloudSynced,
}) => {
  // Login states
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing / Adding product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formBrand, setFormBrand] = useState<Product['brand']>('Ford');
  const [formCategory, setFormCategory] = useState<Product['category']>('Bombas de Gasolina');
  const [formCompatibility, setFormCompatibility] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<Product['stockStatus']>('Disponible');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const success = onLogin(cleanEmail);
    if (!success) {
      setLoginError(
        `La cuenta "${emailInput}" no tiene permisos de administrador. El modo administración solo es visible y operable desde la cuenta de Google: ${COMPANY_INFO.adminEmail}`
      );
    } else {
      setLoginError('');
    }
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormCode('');
    setFormDescription('');
    setFormPrice('');
    setFormBrand('Ford');
    setFormCategory('Bombas de Gasolina');
    setFormCompatibility('');
    setFormImageUrl('');
    setFormStatus('Disponible');
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    setFormCode(product.code);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormBrand(product.brand);
    setFormCategory(product.category);
    setFormCompatibility(product.vehicleCompatibility || '');
    setFormImageUrl(product.imageUrl || '');
    setFormStatus(product.stockStatus || 'Disponible');
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formDescription || formPrice === '') return;

    const numericPrice = typeof formPrice === 'number' ? formPrice : parseFloat(formPrice) || 0;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        code: formCode.trim(),
        description: formDescription.trim(),
        price: numericPrice,
        brand: formBrand,
        category: formCategory,
        vehicleCompatibility: formCompatibility.trim(),
        imageUrl: formImageUrl.trim(),
        stockStatus: formStatus,
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${formCode.trim()}-${Date.now()}`,
        code: formCode.trim(),
        description: formDescription.trim(),
        price: numericPrice,
        brand: formBrand,
        category: formCategory,
        vehicleCompatibility: formCompatibility.trim(),
        imageUrl: formImageUrl.trim(),
        stockStatus: formStatus,
      };
      onAddProduct(newProd);
    }

    handleCancelForm();
  };

  // Quick photo upload via FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `catalogo_repuestos_rimar_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredProducts = products.filter((p) => {
    const query = adminSearch.toLowerCase();
    return (
      p.code.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                Panel de Administración
              </h2>
              <p className="text-xs text-slate-400">
                Gestión de Catálogo • Autorizado para <span className="text-amber-300 font-semibold">{COMPANY_INFO.adminEmail}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                title="Cerrar sesión de Administrador"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir de Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isAdminLoggedIn ? (
            /* Google Login view */
            <div className="max-w-md mx-auto py-6 sm:py-8 text-center">
              {/* Google G Brand Icon */}
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                Acceso con Cuenta de Google
              </h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Este panel de administración está restringido y configurado para ser visible y operable únicamente desde la cuenta oficial de Google:
                <strong className="text-slate-900 block font-bold text-xs sm:text-sm mt-1">
                  {COMPANY_INFO.adminEmail}
                </strong>
              </p>

              {/* Fast Google Login Button */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    const success = onLogin(COMPANY_INFO.adminEmail);
                    if (success) {
                      setLoginError('');
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Acceder como Administrador</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Autenticación de propietario sin contraseñas
                </p>
              </div>
            </div>
          ) : (
            /* Admin active dashboard */
            <div className="space-y-6">
              {/* Top controls: Add button, export, reset, logout */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleStartAdd}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Producto</span>
                  </button>

                  {onOpenBulkUpload && (
                    <button
                      onClick={onOpenBulkUpload}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Subir fotos masivas y asociarlas por referencia"
                    >
                      <UploadCloud className="w-4 h-4 text-amber-600" />
                      <span>Subida Masiva Fotos</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportJSON}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    title="Exportar respaldo de datos en JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar JSON</span>
                  </button>

                  {onForceSyncCloud && (
                    <button
                      onClick={() => {
                        onForceSyncCloud();
                      }}
                      disabled={isSyncingCloud}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      title="Subir todos los productos y fotos a Firebase Firestore para que se vean en todos los dispositivos"
                    >
                      <Database className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                      <span>{isSyncingCloud ? 'Subiendo a Nube...' : 'Subir a Base de Datos'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('¿Deseas restablecer el catálogo original de 104 productos? Los cambios no guardados se reiniciarán.')) {
                        onResetCatalog();
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    title="Restablecer lista original"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Conectado: <strong className="text-slate-800">{COMPANY_INFO.adminEmail}</strong>
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir de Admin</span>
                  </button>
                </div>
              </div>

              {/* Firestore Cloud Status Banner */}
              <div className="flex items-center justify-between p-3 px-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>Base de Datos Firebase Firestore activa</span>
                  </div>
                  <span className="text-emerald-700 hidden sm:inline">• Todos los dispositivos (móvil y PC) ven las fotos y productos en tiempo real</span>
                </div>
                <span className="text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[11px]">
                  {products.length} artículos en la nube
                </span>
              </div>

              {/* Add / Edit Form Modal Inline */}
              {(isAddingNew || editingProduct) && (
                <div className="p-5 bg-white rounded-2xl border-2 border-red-500 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-red-600" />
                      <span>{isAddingNew ? 'Agregar Nuevo Repuesto' : `Editar Ref. ${editingProduct?.code}`}</span>
                    </h3>
                    <button
                      onClick={handleCancelForm}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Código de Artículo (Ref): *
                        </label>
                        <input
                          type="text"
                          required
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                          placeholder="Ej. 10582"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Marca Vehículo:
                        </label>
                        <select
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value as Product['brand'])}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                        >
                          <option value="Ford">Ford (F)</option>
                          <option value="Jeep">Jeep (J)</option>
                          <option value="Dodge/RAM">Dodge / RAM (D)</option>
                          <option value="Chevrolet">Chevrolet (C)</option>
                          <option value="Multimarca">Multimarca</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Precio sin IVA (COP): *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step="any"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="450000"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Descripción Completa del Repuesto: *
                        </label>
                        <input
                          type="text"
                          required
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="BOMBA GASOLINA MOTOR F 3.0L 24V 07/08 ESCAPE"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 uppercase focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Categoría:
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                        >
                          <option value="Bombas de Gasolina">Bombas de Gasolina</option>
                          <option value="Sensores">Sensores</option>
                          <option value="Bobinas y Encendido">Bobinas y Encendido</option>
                          <option value="Válvulas e Inyección">Válvulas e Inyección</option>
                          <option value="Refrigeración y Lubricación">Refrigeración y Lubricación</option>
                          <option value="Frenos y Suspensión">Frenos y Suspensión</option>
                          <option value="Filtros y Químicos">Filtros y Químicos</option>
                          <option value="Otros">Otros</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Compatibilidad / Modelos y Años:
                        </label>
                        <input
                          type="text"
                          value={formCompatibility}
                          onChange={(e) => setFormCompatibility(e.target.value)}
                          placeholder="Escape 3.0L 24V (2007-2008)"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Foto del Repuesto (Subir imagen o URL):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            placeholder="https://... o sube una foto"
                            className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1 border border-slate-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {Boolean(formImageUrl && formImageUrl.trim()) && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <img
                          src={formImageUrl.trim()}
                          alt="Vista previa"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-emerald-600">✓ Foto asignada para este artículo.</span>
                          <button
                            type="button"
                            onClick={() => setFormImageUrl('')}
                            className="block text-red-500 hover:underline mt-1 font-semibold"
                          >
                            Eliminar foto
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelForm}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                      >
                        Guardar Producto
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product catalog search & table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Buscar por código, repuesto o marca..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Total: {filteredProducts.length} repuestos
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          <th className="p-3">Ref</th>
                          <th className="p-3">Descripción</th>
                          <th className="p-3">Marca</th>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-right">Precio + IVA</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-red-600">
                              {prod.code}
                            </td>
                            <td className="p-3 font-medium text-slate-900 max-w-[240px] truncate">
                              {prod.description}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border">
                                {prod.brand}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {prod.category}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">
                              {formatCOP(prod.price)} <span className="text-red-600 text-[10px]">+ IVA</span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleStartEdit(prod)}
                                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar repuesto Ref. ${prod.code}: ${prod.description}?`)) {
                                      onDeleteProduct(prod.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

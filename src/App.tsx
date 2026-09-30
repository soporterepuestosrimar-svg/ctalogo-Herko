import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Car, 
  ShoppingCart, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Check, 
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Plus,
  UploadCloud,
  Download,
  LogOut,
  Layers,
  Share2
} from 'lucide-react';
import { Product, CartItem, Advisor } from './types';
import { INITIAL_PRODUCTS, ADVISORS, COMPANY_INFO, CATEGORY_DEFAULT_IMAGES } from './data/products';
import { formatCOP, calculateCartTotals, IVA_RATE, buildWhatsAppProductInquiryUrl } from './utils/formatters';
import { 
  subscribeToProducts, 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  batchUpdateImagesInFirestore, 
  seedFirestoreCatalog 
} from './services/productService';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { AdminModal } from './components/AdminModal';
import { BulkImageUploadModal } from './components/BulkImageUploadModal';
import { DownloadCatalogModal } from './components/DownloadCatalogModal';
import { ShareCatalogModal } from './components/ShareCatalogModal';
import { Footer } from './components/Footer';

const STORAGE_KEYS = {
  PRODUCTS: 'repuestos_rimar_catalog_v5',
  CART: 'repuestos_rimar_cart_v1',
  ADVISOR: 'repuestos_rimar_advisor_v1',
  ADMIN_AUTH: 'repuestos_rimar_admin_session_v1',
};

export default function App() {
  // Products state (loaded from localStorage or initial products with article-specific images)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS) 
        || localStorage.getItem('repuestos_rimar_catalog_v2')
        || localStorage.getItem('repuestos_rimar_catalog_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
          return parsed.map((p: Product) => {
            const initial = initialMap.get(p.id);
            // If the item doesn't have an image, has a relative /parts/ URL, or has an old unsplash url, upgrade to real embedded photo
            if (!p.imageUrl || p.imageUrl.trim() === '' || p.imageUrl.startsWith('/parts/') || p.imageUrl.includes('unsplash.com')) {
              return { ...p, imageUrl: initial?.imageUrl || p.imageUrl };
            }
            return p;
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Active advisor
  const [activeAdvisor, setActiveAdvisor] = useState<Advisor>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADVISOR);
      if (saved) {
        const found = ADVISORS.find((a) => a.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return ADVISORS[0]; // Duban Perez by default
  });

  // Admin login state strictly authorized for Google account soporterepuestosrimar@gmail.com
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const sessionAuth = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      const localAuth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      const authorizedEmail = COMPANY_INFO.adminEmail.toLowerCase();
      return (
        sessionAuth === authorizedEmail ||
        localAuth === authorizedEmail ||
        sessionAuth === 'true'
      );
    } catch {
      return false;
    }
  });

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'code-asc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [copiedCatalogLink, setCopiedCatalogLink] = useState(false);

  // Cloud Database Sync state
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null);

  // Real-time Firestore Cloud Database listener:
  // Ensures any device opening the app instantly loads the cloud database products and photos
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          setIsCloudSynced(true);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local cache):', error);
        setIsCloudSynced(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync to localStorage as backup cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Check URL query parameters or hash for direct shared product link (?ref=10582 or #ref-10582)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace(/^#/, '');
      const refParam = 
        params.get('ref') || 
        params.get('referencia') || 
        params.get('code') || 
        params.get('codigo') || 
        params.get('articulo') || 
        params.get('id') ||
        (hash.startsWith('ref-') ? hash.replace(/^ref-/, '') : (hash ? hash : null));

      if (refParam && products.length > 0) {
        const cleanRef = refParam.trim().toLowerCase();
        const matched = products.find(
          (p) =>
            p.code.toLowerCase() === cleanRef ||
            p.id.toLowerCase() === cleanRef ||
            p.code.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanRef.replace(/[^a-z0-9]/g, '')
        );
        if (matched) {
          setViewingProduct(matched);
        }
      }
    } catch {
      // ignore
    }
  }, [products]);

  // Sync viewingProduct with browser URL history without reload
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        if (viewingProduct) {
          const newUrl = `${window.location.pathname}?ref=${encodeURIComponent(viewingProduct.code)}`;
          window.history.replaceState(null, '', newUrl);
        } else {
          // If viewingProduct is closed, clear ?ref param cleanly
          const params = new URLSearchParams(window.location.search);
          if (params.has('ref') || params.has('referencia') || params.has('code') || params.has('codigo')) {
            params.delete('ref');
            params.delete('referencia');
            params.delete('code');
            params.delete('codigo');
            params.delete('articulo');
            const searchStr = params.toString();
            const cleanUrl = searchStr ? `${window.location.pathname}?${searchStr}` : window.location.pathname;
            window.history.replaceState(null, '', cleanUrl);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [viewingProduct]);

  const handleShareCatalog = async () => {
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const handleAdvisorChange = (adv: Advisor) => {
    setActiveAdvisor(adv);
    try {
      localStorage.setItem(STORAGE_KEYS.ADVISOR, adv.id);
    } catch {
      // ignore
    }
  };

  const handleAdminLogin = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const authorizedEmail = COMPANY_INFO.adminEmail.toLowerCase();
    if (cleanEmail === authorizedEmail) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, authorizedEmail);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, authorizedEmail);
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin Catalog actions with cloud database persistence
  const handleAddProduct = async (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    try {
      await saveProductToFirestore(newProd);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Error saving product to Firestore:', e);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    // Also update in cart if present
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
    try {
      await saveProductToFirestore(updated);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Error updating product in Firestore:', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    try {
      await deleteProductFromFirestore(productId);
    } catch (e) {
      console.error('Error deleting product in Firestore:', e);
    }
  };

  const handleResetCatalog = async () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    try {
      await seedFirestoreCatalog(INITIAL_PRODUCTS);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Error resetting Firestore catalog:', e);
    }
  };

  const handleBatchUpdateImages = async (updates: { productId: string; imageUrl: string }[]) => {
    const updateMap = new Map(updates.map((u) => [u.productId, u.imageUrl]));
    setProducts((prev) =>
      prev.map((p) => {
        if (updateMap.has(p.id)) {
          return { ...p, imageUrl: updateMap.get(p.id)! };
        }
        return p;
      })
    );
    // Also update in cart if present
    setCart((prev) =>
      prev.map((item) => {
        if (updateMap.has(item.product.id)) {
          return {
            ...item,
            product: { ...item.product, imageUrl: updateMap.get(item.product.id)! },
          };
        }
        return item;
      })
    );
    try {
      await batchUpdateImagesInFirestore(updates);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Error batch updating images in Firestore:', e);
    }
  };

  // Manual trigger to force upload / sync entire catalog with all photos to Firestore
  const handleForceSyncCloud = async () => {
    setIsSyncingCloud(true);
    try {
      await seedFirestoreCatalog(products);
      setIsCloudSynced(true);
      setCloudSyncMessage('¡Catálogo y fotos sincronizados con éxito en Firebase Firestore!');
      setTimeout(() => setCloudSyncMessage(null), 4500);
    } catch (err) {
      console.error('Error syncing to Firestore:', err);
      setCloudSyncMessage('Hubo un inconveniente al sincronizar con la nube.');
      setTimeout(() => setCloudSyncMessage(null), 4500);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((prod) => {
      // Search term (cleans prefixes like "ref", "ref:", "#" for effortless reference lookup)
      if (searchTerm.trim()) {
        const rawTerm = searchTerm.toLowerCase().trim();
        const cleanTerm = rawTerm.replace(/^(ref|referencia|art|articulo|código|codigo)[:.\s#-]*/i, '').trim();
        const term = cleanTerm || rawTerm;

        const matchesCode = 
          prod.code.toLowerCase().includes(rawTerm) || 
          prod.code.toLowerCase().includes(term);
        const matchesDesc = prod.description.toLowerCase().includes(rawTerm);
        const matchesBrand = prod.brand.toLowerCase().includes(rawTerm);
        const matchesCompat = prod.vehicleCompatibility?.toLowerCase().includes(rawTerm);
        const matchesCat = prod.category.toLowerCase().includes(rawTerm);

        if (!matchesCode && !matchesDesc && !matchesBrand && !matchesCompat && !matchesCat) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        if (selectedBrand === 'Ford' && prod.brand !== 'Ford') return false;
        if (selectedBrand === 'Jeep' && prod.brand !== 'Jeep') return false;
        if (selectedBrand === 'Dodge/RAM' && prod.brand !== 'Dodge/RAM') return false;
        if (selectedBrand === 'Chevrolet' && prod.brand !== 'Chevrolet') return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (prod.category !== selectedCategory) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.description.localeCompare(b.description));
    } else if (sortBy === 'code-asc') {
      result.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    return result;
  }, [products, searchTerm, selectedBrand, selectedCategory, sortBy]);

  const { subtotal: cartSubtotal, totalItemsCount } = calculateCartTotals(cart);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header
        cartCount={totalItemsCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
        onOpenShareCatalog={() => setIsShareModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        activeAdvisor={activeAdvisor}
        onChangeAdvisor={handleAdvisorChange}
        isCloudSynced={isCloudSynced}
      />

      {/* Cloud Sync Toast Notification */}
      {cloudSyncMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-fade-in max-w-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{cloudSyncMessage}</p>
            <p className="text-[11px] text-slate-400">Las fotos y precios se ven en tiempo real en todos los dispositivos</p>
          </div>
        </div>
      )}

      {/* Admin Mode Persistent Notification Bar */}
      {isAdminLoggedIn && (
        <div className="bg-amber-400 text-slate-950 px-3 sm:px-6 py-2 border-b border-amber-500 shadow-sm w-full">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
              <div className="truncate">
                <span className="font-extrabold">Modo Administrador Activo: </span>
                <span className="text-slate-900 font-semibold">{COMPANY_INFO.adminEmail}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleForceSyncCloud}
                disabled={isSyncingCloud}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-50"
                title="Sincronizar todo a Firebase Firestore"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Sincronizando...' : 'Subir a Nube'}</span>
              </button>
              <button
                onClick={() => setIsAdminOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
              >
                Panel de Catálogo
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                title="Cerrar sesión de Administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero / Catalog Header Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-slate-800 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Catálogo Oficial de Repuestos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white hover:text-amber-300 border border-slate-700 text-xs font-bold transition-all shadow-xs"
                  title="Descargar catálogo completo o filtrado en PDF / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Descargar Catálogo</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareCatalog}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white hover:text-emerald-300 border border-slate-700 text-xs font-bold transition-all shadow-xs active:scale-95"
                  title="Compartir link del catálogo con vista previa e imágenes para WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{copiedCatalogLink ? '✓ ¡Link Copiado!' : 'Compartir Catálogo'}</span>
                </button>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={() => setIsBulkUploadOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Subir Fotos</span>
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
                Repuestos <span className="text-red-500">Rimar</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
                Bombas de gasolina, sensores de cigüeñal y árbol de levas, bobinas de encendido, válvulas IAC, amortiguadores y peras. Pedidos y cotizaciones directas por WhatsApp con despacho inmediato a toda Colombia.
              </p>
            </div>

            {/* Advisor direct WhatsApp highlight card */}
            <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl max-w-sm w-full">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Línea de Atención Seleccionada
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${activeAdvisor.avatarColor} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                  {activeAdvisor.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{activeAdvisor.name}</div>
                  <div className="text-[11px] text-amber-400 font-semibold leading-tight">{activeAdvisor.role}</div>
                  <div className="text-xs text-slate-300 flex items-center gap-1 font-mono mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {activeAdvisor.phone}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${activeAdvisor.rawPhone}?text=Hola%20${encodeURIComponent(activeAdvisor.name)},%20tengo%20una%20consulta%20sobre%20un%20repuesto%20en%20Repuestos%20Rimar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95"
                  title="Escribir por WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                <span>¿Deseas cambiar de asesor?</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextAdvisor = ADVISORS.find((a) => a.id !== activeAdvisor.id) || ADVISORS[0];
                    handleAdvisorChange(nextAdvisor);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                >
                  Cambiar a {ADVISORS.find((a) => a.id !== activeAdvisor.id)?.name}
                </button>
              </div>
            </div>
          </div>

          {/* Search bar inside Hero */}
          <div className="mt-8">
            <div className="relative max-w-3xl">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código (ej. 10582, 51069), descripción, motor (ej. 3.0L, 5.7L), modelo (Escape, Cherokee, F-150, Journey)..."
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-500/40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Catalog Section */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 flex-1 w-full space-y-5">
        {/* Brand Selection Chips */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              Filtrar por Marca
            </span>
            {selectedBrand !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className="text-[11px] text-red-600 font-semibold hover:underline"
              >
                Ver todas ({products.length})
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                selectedBrand === 'all'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
              }`}
            >
              Todas las Marcas ({products.length})
            </button>

            <button
              onClick={() => setSelectedBrand('Ford')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                selectedBrand === 'Ford'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              Ford (F)
            </button>

            <button
              onClick={() => setSelectedBrand('Jeep')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                selectedBrand === 'Jeep'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/30'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Jeep (J)
            </button>

            <button
              onClick={() => setSelectedBrand('Dodge/RAM')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                selectedBrand === 'Dodge/RAM'
                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              Dodge / RAM (D)
            </button>

            <button
              onClick={() => setSelectedBrand('Chevrolet')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                selectedBrand === 'Chevrolet'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Chevrolet (C)
            </button>
          </div>
        </div>

        {/* Category Filter Pills - Highly visible, wrapped on mobile & comfortably scrollable */}
        <div className="w-full bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-600" />
                Categorías de Repuestos
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded-full">
                {categories.length - 1} tipos
              </span>
            </div>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>Mostrar todas</span>
              </button>
            )}
          </div>

          {/* Buttons container: flex-wrap so they are completely visible and never cut off on mobile devices */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const label = cat === 'all' ? 'Todas las Categorías' : cat;
              const count = cat === 'all'
                ? products.length
                : products.filter((p) => p.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border active:scale-95 text-left ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 shadow-xs'
                  }`}
                  title={`Filtrar por ${label}`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action bar: Results count, download catalog button, sorting, view mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-y border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'repuesto' : 'repuestos'}
            </span>
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 border border-slate-700"
              title="Descargar catálogo en formato PDF con fotos de las referencias"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Descargar Catálogo (PDF)</span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-extrabold">
                {filteredProducts.length === products.length ? 'Completo' : `${filteredProducts.length}`}
              </span>
            </button>
            {(searchTerm || selectedBrand !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('all');
                  setSelectedCategory('all');
                }}
                className="text-red-600 hover:underline font-semibold flex items-center gap-1 py-1 px-1.5"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="default">Catálogo oficial</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="code-asc">Código / Referencia</option>
                <option value="name-asc">Nombre (A - Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista en cuadrícula"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista en lista detallada"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No se encontraron repuestos con esos criterios
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              Intenta buscar por el número de artículo, cambiando los filtros de marca o categoría, o contáctanos directamente por WhatsApp para conseguir cualquier pieza bajo pedido especial.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('all');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Ver todos los repuestos
              </button>
              <a
                href={`https://wa.me/${activeAdvisor.rawPhone}?text=Hola%20${encodeURIComponent(activeAdvisor.name)},%20busco%20un%20repuesto%20que%20no%20encontr%C3%A9%20en%20el%20cat%C3%A1logo`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Consultar con {activeAdvisor.name}</span>
              </a>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isInCart = cart.some((item) => item.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  activeAdvisor={activeAdvisor}
                  isInCart={isInCart}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setViewingProduct}
                  isAdmin={isAdminLoggedIn}
                  onEdit={() => {
                    setIsAdminOpen(true);
                  }}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              );
            })}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Ref</th>
                    <th className="p-3.5">Repuesto / Descripción</th>
                    <th className="p-3.5">Marca</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Compatibilidad</th>
                    <th className="p-3.5 text-right">Precio + IVA</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.map((product) => {
                    const isInCart = cart.some((item) => item.product.id === product.id);
                    const whatsappUrl = buildWhatsAppProductInquiryUrl(product, activeAdvisor, 1);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setViewingProduct(product)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-2.5 py-1 rounded-lg border border-red-200 hover:border-red-600 transition-all cursor-pointer text-xs active:scale-95 shadow-2xs"
                            title={`Ver foto ampliada y detalles de Ref. ${product.code}`}
                          >
                            <Tag className="w-3 h-3" />
                            <span>{product.code}</span>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setViewingProduct(product)}
                            className="font-bold text-slate-900 hover:text-red-600 text-left transition-colors line-clamp-1"
                          >
                            {product.description}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-700 border">
                            {product.brand}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {product.category}
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                          {product.vehicleCompatibility || 'Consultar'}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                          {formatCOP(product.price)} <span className="text-red-600 text-[10px] font-black">+ IVA</span>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                                isInCart
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                              title={isInCart ? 'En cotización' : 'Agregar a cotización'}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                              title="Consultar por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating WhatsApp Quick Action Button (Compact) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {totalItemsCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl hover:bg-slate-800 border border-slate-700 transition-transform active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <span>Cotización ({totalItemsCount})</span>
          </button>
        )}

        <a
          href={`https://wa.me/${activeAdvisor.rawPhone}?text=Hola%20${encodeURIComponent(activeAdvisor.name)},%20te%20contacto%20desde%20el%20cat%C3%A1logo%20de%20Repuestos%20Rimar`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg hover:shadow-emerald-900/30 transition-all active:scale-95 border border-white/80"
          title={`WhatsApp: ${activeAdvisor.name}`}
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline">WhatsApp: {activeAdvisor.name}</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

      {/* Modals */}
      {viewingProduct && (
        <ProductModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          activeAdvisor={activeAdvisor}
          onSelectAdvisor={handleAdvisorChange}
          onAddToCart={handleAddToCart}
          isInCart={cart.some((i) => i.product.id === viewingProduct.id)}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        activeAdvisor={activeAdvisor}
        onSelectAdvisor={handleAdvisorChange}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetCatalog={handleResetCatalog}
        onOpenBulkUpload={() => {
          setIsAdminOpen(false);
          setIsBulkUploadOpen(true);
        }}
        onForceSyncCloud={handleForceSyncCloud}
        isSyncingCloud={isSyncingCloud}
        isCloudSynced={isCloudSynced}
      />

      <BulkImageUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        products={products}
        onBatchUpdateImages={handleBatchUpdateImages}
      />

      <DownloadCatalogModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        allProducts={products}
        filteredProducts={filteredProducts}
        currentBrand={selectedBrand}
        currentCategory={selectedCategory}
        searchTerm={searchTerm}
        activeAdvisor={activeAdvisor}
        onSelectAdvisor={handleAdvisorChange}
      />

      <ShareCatalogModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        products={products}
        onSelectProduct={(p) => setViewingProduct(p)}
      />

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} isAdminLoggedIn={isAdminLoggedIn} />
    </div>
  );
}

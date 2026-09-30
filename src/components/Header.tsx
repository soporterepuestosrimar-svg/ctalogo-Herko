import React from 'react';
import { 
  Wrench, 
  ShoppingCart, 
  ShieldCheck, 
  Globe, 
  PhoneCall, 
  ExternalLink,
  MessageCircle,
  Sparkles,
  UploadCloud,
  LogOut,
  Cloud,
  Share2
} from 'lucide-react';
import { COMPANY_INFO, ADVISORS } from '../data/products';
import { Advisor } from '../types';
import { formatCOP } from '../utils/formatters';

interface HeaderProps {
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onLogoutAdmin?: () => void;
  onOpenBulkUpload: () => void;
  onOpenShareCatalog?: () => void;
  isAdminLoggedIn: boolean;
  activeAdvisor: Advisor;
  onChangeAdvisor: (advisor: Advisor) => void;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartSubtotal,
  onOpenCart,
  onOpenAdmin,
  onLogoutAdmin,
  onOpenBulkUpload,
  onOpenShareCatalog,
  isAdminLoggedIn,
  activeAdvisor,
  onChangeAdvisor,
  isCloudSynced = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-all w-full max-w-full overflow-hidden">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white text-xs py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 font-bold tracking-wide uppercase text-[10px] sm:text-[11px] bg-black/25 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              Especialistas
            </span>
            <span className="hidden md:inline text-slate-100 text-[11px] truncate">
              Ford • Jeep • Dodge • RAM • Chrysler • Chevrolet
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
            <a
              href={COMPANY_INFO.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-200 transition-colors flex items-center gap-1 font-medium text-[10px] sm:text-[11px]"
            >
              <Globe className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="truncate">{COMPANY_INFO.website}</span>
            </a>

            {/* Google Admin access icon button in top bar */}
            {!isAdminLoggedIn ? (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hover:text-amber-200 transition-colors inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-200/90 hover:text-white font-medium pl-1.5 border-l border-white/20"
                title="Acceso Administrativo Google (soporterepuestosrimar@gmail.com)"
              >
                <ShieldCheck className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Admin Google</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-300 font-bold pl-1.5 border-l border-white/20">
                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Admin: {COMPANY_INFO.adminEmail}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <div className="shrink-0 relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md shadow-red-900/40 border border-red-500/40">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[7px] sm:text-[8px] font-black">
              R
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-lg lg:text-xl font-black tracking-tight text-white uppercase truncate block">
                Repuestos <span className="text-red-500">Rimar</span>
              </span>
              <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-md shrink-0">
                Catálogo Digital
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden sm:block">
              Bombas, sensores, bobinas, válvulas y peras
            </p>
          </div>
        </div>

        {/* Social media pills (desktop only) */}
        <div className="hidden xl:flex items-center gap-2">
          <a
            href={COMPANY_INFO.social.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook: rimarrepuestos"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-blue-400 border border-slate-700 text-xs transition-colors"
          >
            <span className="font-bold text-blue-400 text-xs">f</span>
            <span>rimarrepuestos</span>
          </a>

          <a
            href={COMPANY_INFO.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram: @repuestos.rimar"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-pink-600/30 text-slate-300 hover:text-pink-400 border border-slate-700 text-xs transition-colors"
          >
            <span className="font-bold text-pink-400 text-xs">IG</span>
            <span>@repuestos.rimar</span>
          </a>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Advisor selector button / dropdown (desktop only) */}
          <div className="relative group hidden lg:block">
            <button
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition-all whitespace-nowrap"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${activeAdvisor.avatarColor} shrink-0`} />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">Asesor Comercial:</div>
                <div className="font-semibold text-white leading-tight">{activeAdvisor.name}</div>
              </div>
            </button>
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 hidden group-hover:block transition-all z-50">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 mb-1">
                Selecciona Asesor Comercial para tus pedidos:
              </div>
              {ADVISORS.map((adv) => (
                <button
                  key={adv.id}
                  onClick={() => onChangeAdvisor(adv)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeAdvisor.id === adv.id
                      ? 'bg-red-600/30 text-red-200 border border-red-500/40'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{adv.name}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{adv.role}</div>
                    <div className="text-[10px] text-slate-400">{adv.phone}</div>
                  </div>
                  {activeAdvisor.id === adv.id && (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                      Activo
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Database indicator */}
          <div 
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300 shrink-0" 
            title={isCloudSynced ? "Catálogo y fotos sincronizados en tiempo real en la nube de Firebase Firestore" : "Conectando a la nube..."}
          >
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-semibold text-slate-200">{isCloudSynced ? 'Nube Conectada' : 'Sincronizando'}</span>
          </div>

          {/* If Admin is logged in via Google, show compact Admin controls */}
          {isAdminLoggedIn && (
            <>
              {/* Bulk upload photos (accessible on all screens) */}
              <button
                onClick={onOpenBulkUpload}
                id="bulk-upload-button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shrink-0"
                title="Subir fotos masivas organizadas por número de artículo"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Subir Fotos</span>
                <span className="sm:hidden text-[11px]">Fotos</span>
              </button>

              {/* Admin Panel Button & Logout */}
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 rounded-xl p-0.5 sm:p-1 shrink-0">
                <button
                  onClick={onOpenAdmin}
                  id="admin-panel-button"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all"
                  title="Abrir Panel de Catálogo (soporterepuestosrimar@gmail.com)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs">Admin</span>
                </button>
                {onLogoutAdmin && (
                  <button
                    onClick={onLogoutAdmin}
                    id="admin-logout-header-button"
                    className="p-1 sm:px-2 sm:py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                    title="Salir del Modo Administrador"
                  >
                    <LogOut className="w-3 h-3 shrink-0" />
                    <span className="hidden md:inline text-[11px]">Salir</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Free Public Link / Share Catalog button */}
          <button
            type="button"
            onClick={onOpenShareCatalog}
            id="share-catalog-header-button"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 border border-slate-700 text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0"
            title="Compartir enlace gratuito del catálogo y referencias para clientes"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {/* Cart / Quotation button - always fully visible, never clipped */}
          <button
            onClick={onOpenCart}
            id="open-cart-button"
            className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-950/40 border border-red-500/40 transition-all active:scale-95 shrink-0"
            title="Ver lista de cotización"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="font-bold">Cotizar</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-white text-red-700 font-black text-[10px] sm:text-[11px] shadow shrink-0">
                {cartCount}
              </span>
            )}
            {cartSubtotal > 0 && (
              <span className="hidden 2xl:inline text-xs text-red-200 border-l border-red-500/50 pl-2 font-normal">
                {formatCOP(cartSubtotal)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Globe, 
  MessageCircle, 
  Phone, 
  Car, 
  ShieldCheck, 
  Clock, 
  Heart,
  ExternalLink,
  Wrench,
  Sparkles
} from 'lucide-react';
import { COMPANY_INFO, ADVISORS } from '../data/products';

interface FooterProps {
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 transition-all">
      {/* Top Banner with Key Highlights */}
      <div className="border-b border-slate-900 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-0.5">Marcas Americanas Especializadas</h4>
              <p className="text-xs text-slate-400">Ford, Jeep, Dodge, RAM, Chrysler y Chevrolet.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-0.5">Garantía y Calidad</h4>
              <p className="text-xs text-slate-400">Repuestos nuevos con especificación técnica exacta.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-0.5">Despachos Nacionales</h4>
              <p className="text-xs text-slate-400">Envíos rápidos a toda Colombia con transportadoras.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-0.5">Asesoría Inmediata</h4>
              <p className="text-xs text-slate-400">Atención personalizada directa en WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
              R
            </div>
            <span className="text-lg font-black text-white uppercase tracking-tight">
              Repuestos <span className="text-red-500">Rimar</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu aliado confiable en bombas de gasolina, sensores automotrices, bobinas de encendido, válvulas y peras para vehículos de alta gama americana.
          </p>
          <div className="pt-1">
            <a
              href={COMPANY_INFO.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{COMPANY_INFO.website}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Social Media Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Nuestras Redes Sociales
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={COMPANY_INFO.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Página Web: <strong className="text-slate-200">{COMPANY_INFO.website}</strong></span>
              </a>
            </li>
            <li>
              <a
                href={COMPANY_INFO.social.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">f</span>
                <span>Facebook: <strong className="text-slate-200">{COMPANY_INFO.social.facebook.handle}</strong></span>
              </a>
            </li>
            <li>
              <a
                href={COMPANY_INFO.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-4 h-4 rounded bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-[9px]">IG</span>
                <span>Instagram: <strong className="text-slate-200">{COMPANY_INFO.social.instagram.handle}</strong></span>
              </a>
            </li>
            <li>
              <a
                href={COMPANY_INFO.social.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="w-4 h-4 rounded bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center font-bold text-[9px]">TT</span>
                <span>TikTok: <strong className="text-slate-200">{COMPANY_INFO.social.tiktok.handle}</strong></span>
              </a>
            </li>
          </ul>
        </div>

        {/* Asesores Comerciales Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Líneas de Atención y Pedidos
          </h4>
          <div className="space-y-2.5">
            {ADVISORS.map((adv) => (
              <a
                key={adv.id}
                href={`https://wa.me/${adv.rawPhone}?text=Hola%20${encodeURIComponent(adv.name)},%20deseo%20consultar%20repuestos%20en%20Repuestos%20Rimar`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-colors block"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {adv.name}
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-medium">Asesor Comercial</div>
                  <div className="text-[11px] text-slate-400">{adv.phone}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Legal and Pricing note */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Información de Precios
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Todos los precios publicados en este catálogo son base en pesos colombianos (COP) y <strong className="text-white">+ IVA (19%)</strong> según reglamentación tributaria vigente.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
            Correo de contacto:
            <div className="text-slate-300 font-mono mt-0.5">{COMPANY_INFO.adminEmail}</div>

            {onOpenAdmin && (
              <div className="mt-2 pt-2 border-t border-slate-800">
                {!isAdminLoggedIn ? (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-400 transition-colors font-medium"
                    title="Acceso Administrativo Google (soporterepuestosrimar@gmail.com)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Acceso Administrador Google</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Sesión Activa ({COMPANY_INFO.adminEmail})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Signature Bar */}
      <div className="border-t border-slate-900 bg-black/70 py-4 px-4 sm:px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            © {new Date().getFullYear()} <strong className="text-white">Repuestos Rimar</strong>. Todos los derechos reservados.
          </div>

          {/* Requested specific signature: creado por Enerique gonzalez whatsapp 3123048648 para repuestos rimar */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
            <span>creado por <strong>Enerique gonzalez</strong> whatsapp</span>
            <a
              href="https://wa.me/573123048648?text=Hola%20Enrique%20Gonzalez,%20te%20contacto%20desde%20el%20cat%C3%A1logo%20digital%20de%20Repuestos%20Rimar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>3123048648</span>
            </a>
            <span>para <strong>repuestos rimar</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

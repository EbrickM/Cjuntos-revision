import { useState } from 'react';
import {
  Zap, CheckCircle2, Clock, Leaf,
  Building2, Briefcase, ShieldCheck,
  ArrowLeft, Mail, Lock, Eye, EyeOff,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

const features = [
  { Icon: Zap,          title: 'Liquidez rápida',        sub: 'En menos de 72 horas' },
  { Icon: CheckCircle2, title: 'Sin comisiones',          sub: 'Cero costes dentro de la red' },
  { Icon: Clock,        title: 'Siempre disponible',      sub: 'Operaciones 24/7' },
  { Icon: Leaf,         title: '100% digital',            sub: 'Paperless · ESG · Bajo carbono' },
];

const roles = [
  { id: 'empDash',   label: 'Empresa Contratante',   Icon: Building2,   desc: 'Corporaciones y organismos' },
  { id: 'epHome',    label: 'Empresa Pequeña (PYME)', Icon: Briefcase,   desc: 'Pequeñas y medianas empresas' },
  { id: 'adminDash', label: 'Administrador Bonafide', Icon: ShieldCheck, desc: 'Equipo interno Bonafide Microbank' },
];

const ORANGE = '#E8521A';
const NAVY   = '#1D3557';

/* Easing S-curve suave: arranca despacio, acelera al centro, frena al final */
const SLIDE_TRANSITION = 'transform 0.72s cubic-bezier(0.4, 0, 0.2, 1)';

export default function Login() {
  const { go } = useApp();
  const [showRoles, setShowRoles] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  return (
    <div className="h-screen w-screen bg-white overflow-hidden relative">

      {/* ─── PANEL IZQUIERDO: LOGIN ─────────────────────────────────────────── */}
      <div className="absolute inset-y-0 left-0 w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="w-full max-w-[400px] mx-auto flex flex-col justify-center align-center">

          {/* Logo */}
          <div className="mb-1.5 flex justify-center ">
            <img
              src="/B-Mori.png"
              alt="B-Morï"
              style={{ height: 36 }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'inline';
              }}
            />
            <span style={{ display: 'none', fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: '-0.5px' }}>
              B-MOR<span style={{ color: ORANGE }}>ï</span>
            </span>
           
          </div>

          <h2 className="text-[26px] font-bold mb-1.5 text-center" style={{ color: NAVY }}>
            Iniciar Sesión
          </h2>
          <p className="text-[14px] text-text-3 mb-7 text-center">
            Ingresa tus credenciales para continuar
          </p>

          {/* Email */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[12px] font-semibold text-text-2">Email corporativo o usuario</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
              <input
                type="email"
                defaultValue="operaciones@totalenerge.com"
                placeholder="tu@empresa.com"
                className="h-12 border border-input-border rounded-[10px] pl-11 pr-4 text-[14px] text-text-1 bg-[#FAFAFA] outline-none w-full transition-all focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,82,26,0.08)]"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[12px] font-semibold text-text-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
              <input
                type={showPass ? 'text' : 'password'}
                defaultValue="password"
                className="h-12 border border-input-border rounded-[10px] pl-11 pr-11 text-[14px] text-text-1 bg-[#FAFAFA] outline-none w-full transition-all focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,82,26,0.08)]"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2 transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right mb-6">
            <a className="text-[13px] text-orange font-semibold cursor-pointer hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            onClick={() => setShowRoles(true)}
            className="w-full h-[52px] text-white font-bold text-[15px] rounded-[10px] cursor-pointer transition-all duration-200"
            style={{ backgroundColor: ORANGE, boxShadow: '0 4px 16px rgba(232,82,26,0.32)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C43D0E'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ORANGE; }}
          >
            Iniciar Sesión →
          </button>


        </div>
      </div>

      {/* ─── PANEL DERECHO: SELECCIÓN DE ROL ──────────────────────────────── */}
      <div className="absolute inset-y-0 right-0 w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="w-full max-w-[400px] mx-auto">

          <h2 className="text-[26px] font-bold mb-2 leading-tight" style={{ color: NAVY }}>
            Selecciona tu perfil<br />de acceso
          </h2>
          <p className="text-[14px] text-text-3 mb-8">
            Elige el rol con el que deseas continuar en B-Morï
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {roles.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="group w-full flex items-center gap-4 px-4 py-3.5 border-2 border-input-border rounded-[12px] text-left bg-white hover:border-orange hover:bg-orange-tint transition-all duration-200 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-[10px] bg-page-bg group-hover:bg-white flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-1 group-hover:text-orange transition-colors duration-200">
                    {label}
                  </div>
                  <div className="text-[12px] text-text-4">{desc}</div>
                </div>
                <span className="text-text-4 group-hover:text-orange transition-colors duration-200 text-[16px]">→</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRoles(false)}
            className="flex items-center gap-2 text-[13px] text-text-3 hover:text-orange transition-colors duration-200 cursor-pointer font-medium mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
        </div>
      </div>

      {/* ─── OVERLAY NARANJA DESLIZANTE ────────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 z-10 overflow-hidden flex flex-col items-center justify-center px-10 py-12"
        style={{
          background: 'linear-gradient(150deg, #F0622A 0%, #E8521A 45%, #C8390A 100%)',
          transform: showRoles ? 'translateX(0%)' : 'translateX(100%)',
          transition: SLIDE_TRANSITION,
          willChange: 'transform',
        }}
      >
        {/* Logo centrado 
        <div className="flex flex-col items-center mb-8">
          <img
            src="/B-Mori.png"
            alt="B-Morï"
            style={{ height: 38, filter: 'brightness(0) invert(1)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 500, marginTop: 5, letterSpacing: '0.04em' }}>
            BONAFIDE MICROBANK
          </p>
        </div>
        */}

        {/* Titular centrado */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-extrabold text-white leading-tight mb-2">
            ¡Bienvenido!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>
            Impulsa tu negocio sin esperar liquidez.
          </p>
        </div>

        {/* Grid 2×2 de feature cards */}
        <div
          className="grid grid-cols-2 gap-3 w-full"
          style={{ maxWidth: 500 }}
        >
          {features.map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-4 rounded-[14px]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.13)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Icono */}
              <div
                className="w-15 h-15 rounded-full flex items-center justify-center mb-3"
                
              >
                <Icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              {/* Textos */}
              <span className="text-[16px] font-semibold text-white leading-snug mb-0.5">
                {title}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.45 }}>
                {sub}
              </span>
            </div>
          ))}
        </div>

        {/* Punto de confianza inferior */}
        <p
          className="mt-8 text-center text-[11px] font-medium tracking-wide"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Plataforma regulada · Guinea Ecuatorial
        </p>

        {/* Blob decorativo inferior derecho */}
        <div
          className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(35%, 35%)' }}
        />
        {/* Blob decorativo superior izquierdo */}
        <div
          className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(-35%, -35%)' }}
        />
      </div>
    </div>
  );
}

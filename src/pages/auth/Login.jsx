import { useApp } from '../../state/AppContext';
import Logo from '../../components/layout/Logo';
import Button from '../../components/ui/Button';

const features = [
  ['⚡', 'Liquidez en menos de 72 horas', 'Anticipo del 98% del valor de tu factura'],
  ['🚫', 'Zero comisiones dentro de la red', 'Sin costes ocultos para operar en B-Morï'],
  ['🕐', 'Disponible 24/7 incluyendo fines de semana', 'Operaciones en tiempo real, cualquier día'],
  ['🌿', 'Plataforma 100% digital y sostenible', 'Paperless · Etiquetas ESG · Bajo carbono'],
];

export default function Login() {
  const { go } = useApp();

  return (
    <div className="min-h-screen flex flex-col fade-in">
      {/* Nav */}
      <div className="h-[60px] bg-white border-b border-border flex items-center px-10 gap-3 shrink-0 sticky top-0 z-10">
        <Logo size={18} />
        <div className="w-px h-5 bg-border" />
        <span className="text-[13px] text-text-4">Bonafide Microbank</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm">🌐 ES</Button>
      </div>

      <div className="flex-1 flex min-h-[calc(100vh-60px)]">
        {/* Left panel */}
        <div className="w-[48%] bg-gradient-to-br from-[#FFFAF8] to-[#FFF5F0] border-r border-border px-16 py-15 flex flex-col justify-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 bg-orange-tint text-orange text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-orange-border mb-6 w-fit">
            <span className="w-1.5 h-1.5 bg-orange rounded-full" />
            Plataforma activa en Guinea Ecuatorial
          </div>
          <h1 className="text-[38px] font-extrabold text-text-1 leading-[1.15] mb-4">
            Impulsa tu negocio<br />
            <span className="text-orange">sin esperar</span><br />
            liquidez
          </h1>
          <p className="text-[15px] text-text-3 leading-[1.7] max-w-[380px] mb-12">
            B-Morï conecta empresas y proveedores locales para agilizar pagos y desbloquear el potencial de la cadena de suministro.
          </p>
          {features.map(([ico, t, s]) => (
            <div key={t} className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 bg-orange-tint rounded-[10px] flex items-center justify-center text-[18px] shrink-0">{ico}</div>
              <div>
                <strong className="block text-[14px] font-semibold text-text-1">{t}</strong>
                <span className="text-[12px] text-text-4">{s}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="w-[52%] bg-white overflow-y-auto px-20 py-12 flex flex-col justify-center">
          <div className="w-full max-w-[420px] mx-auto">
            <h2 className="text-[24px] font-bold text-text-1 mb-1.5">Bienvenido a B-Morï</h2>
            <p className="text-[14px] text-text-3 mb-8">Ingresa tus credenciales para acceder a tu cuenta</p>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[12px] font-semibold text-text-2">Email o usuario</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-text-4">✉</span>
                <input type="email" defaultValue="operaciones@totalenerge.com"
                  className="h-12 border border-input-border rounded-[10px] pl-11 pr-3.5 text-[14px] text-text-1 bg-[#FAFAFA] outline-none w-full focus:border-orange focus:bg-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[12px] font-semibold text-text-2">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-text-4">🔒</span>
                <input type="password" defaultValue="password"
                  className="h-12 border border-input-border rounded-[10px] pl-11 pr-3.5 text-[14px] text-text-1 bg-[#FAFAFA] outline-none w-full focus:border-orange focus:bg-white" />
              </div>
            </div>
            <div className="text-right mb-6">
              <a className="text-[13px] text-orange font-semibold cursor-pointer">¿Olvidaste tu contraseña?</a>
            </div>

            <Button variant="primary" full className="h-[52px] text-[15px] mb-0" onClick={() => go('roleSelect')}>
              Iniciar Sesión →
            </Button>

            <div className="flex items-center gap-3 text-text-5 text-[13px] my-5">
              <div className="flex-1 h-px bg-input-border" /><span>o</span><div className="flex-1 h-px bg-input-border" />
            </div>

            <Button variant="secondary" full className="h-[52px] text-[14px] mb-4" onClick={() => go('kyc1')}>
              🏪 Soy empresa pequeña — Registrarme gratis
            </Button>

            <div className="bg-page-bg border border-border rounded-[12px] p-3.5 mb-4">
              <div className="flex gap-3 items-start">
                <span className="text-[22px] shrink-0">🏢</span>
                <div>
                  <strong className="block text-[13px] font-semibold text-text-1 mb-0.5">¿Eres una Empresa Contratante?</strong>
                  <span className="text-[12px] text-text-3 leading-[1.5]">
                    Tu acceso es gestionado por Bonafide Microbank. Contacta a tu gestor o escribe a{' '}
                    <span className="text-orange">onboarding@bonafide-microbank.com</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-[13px] text-text-3">
              ¿Eres del equipo Bonafide?{' '}
              <a className="text-orange font-semibold cursor-pointer" onClick={() => go('adminDash')}>
                Acceso administrador
              </a>
            </p>

            <div className="flex justify-center gap-5 mt-8 pt-5 border-t border-border">
              {['🔒 HTTPS/TLS', '✅ COBAC', '🛡 KYC/AML'].map(b => (
                <div key={b} className="flex items-center gap-1.5 text-[11px] text-text-4 font-medium">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

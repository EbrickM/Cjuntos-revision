import { useApp } from '../../state/AppContext';
import Logo from '../../components/layout/Logo';
import Button from '../../components/ui/Button';

export default function RoleSelect() {
  const { go } = useApp();
  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <div className="h-[60px] bg-white border-b border-border flex items-center px-10">
        <Logo size={18} />
        <div className="flex-1" />
        <a className="text-[13px] text-orange font-semibold cursor-pointer" onClick={() => go('login')}>
          ¿Ya tienes cuenta? Iniciar sesión →
        </a>
      </div>
      <div className="max-w-[1100px] mx-auto px-10 py-16 text-center">
        <div className="inline-flex items-center gap-1.5 bg-orange-tint text-orange text-[12px] font-semibold px-4 py-1.5 rounded-full border border-orange-border mb-4">
          Elige cómo acceder
        </div>
        <h2 className="text-[28px] font-bold text-text-1 mb-2">¿Cómo quieres acceder a B-Morï?</h2>
        <p className="text-[15px] text-text-3 mb-12">Selecciona tu perfil para continuar</p>

        <div className="grid grid-cols-2 gap-6 max-w-[860px] mx-auto">
          {/* Empresa Contratante */}
          <div
            onClick={() => go('empDash')}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-7 cursor-pointer transition-all text-left shadow-sm hover:border-orange hover:shadow-[0_8px_32px_rgba(232,82,26,.12)]"
          >
            <div className="w-14 h-14 rounded-[14px] bg-orange-tint flex items-center justify-center text-[28px] mb-4">🏢</div>
            <div className="text-[18px] font-bold text-text-1 mb-1.5">Empresa Contratante</div>
            <div className="text-[13px] text-text-4 mb-4">Corporaciones y organismos</div>
            <hr className="border-border mb-4" />
            <ul className="list-none flex flex-col gap-1.5 mb-5">
              {['Aprueba facturas y solicitudes confirming', 'Dashboard de riesgos de proveedores', 'Verifica contratos de empresas PYME', 'Reportes ESG de tu cadena'].map(f => (
                <li key={f} className="text-[13px] text-text-3 before:content-['✓_'] before:text-green before:font-bold">{f}</li>
              ))}
            </ul>
            <Button variant="primary" full className="h-11" onClick={(e) => { e.stopPropagation(); go('empDash'); }}>
              Acceder como Empresa →
            </Button>
            <div className="text-center text-[11px] text-text-5 mt-2">Acceso por invitación de Bonafide</div>
          </div>

          {/* Empresa Pequeña */}
          <div
            onClick={() => go('epHome')}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-7 cursor-pointer transition-all text-left shadow-sm hover:border-orange hover:shadow-[0_8px_32px_rgba(232,82,26,.12)]"
          >
            <div className="w-14 h-14 rounded-[14px] bg-green-bg flex items-center justify-center text-[28px] mb-4">🏪</div>
            <div className="text-[18px] font-bold text-text-1 mb-1.5">Empresa Pequeña (PYME)</div>
            <div className="text-[13px] text-text-4 mb-4">Pequeñas y medianas empresas</div>
            <hr className="border-border mb-4" />
            <ul className="list-none flex flex-col gap-1.5 mb-5">
              {['Solicita préstamos contra tu contrato', 'Gestiona tus proveedores y pagos', 'Distribuye tu crédito (nómina, reserva, proveedores)', 'Libera fondos para pagar a tus proveedores'].map(f => (
                <li key={f} className="text-[13px] text-text-3 before:content-['✓_'] before:text-green before:font-bold">{f}</li>
              ))}
            </ul>
            <Button variant="secondary" full className="h-11" onClick={(e) => { e.stopPropagation(); go('epHome'); }}>
              Acceder como Empresa Pequeña →
            </Button>
            <div className="text-center text-[11px] text-text-5 mt-2">Registro gratuito · KYC en 3–5 días</div>
          </div>
        </div>
        <p className="mt-8 text-[14px] text-text-4">
          ¿Eres del equipo Bonafide?{' '}
          <a className="text-orange font-semibold cursor-pointer" onClick={() => go('adminDash')}>→ Acceso administrador</a>
        </p>
      </div>
    </div>
  );
}

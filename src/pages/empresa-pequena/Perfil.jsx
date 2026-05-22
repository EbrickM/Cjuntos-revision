import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

export default function EpPerfil() {
  const { go } = useApp();
  return (
    <AppShell active="epPerfil" role="empresa-pequena" title="Mi Perfil" sub="Información de cuenta">
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* Left column */}
        <div>
          <div className="bg-white rounded-[14px] border border-border p-7 text-center mb-4">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[28px] mx-auto mb-4">CS</div>
            <div className="text-[18px] font-bold">Construcciones Silva Ltd.</div>
            <div className="text-[13px] text-text-3 mt-1">Carlos Esono Mbá · Director</div>
            <div className="text-[12px] text-text-4 font-mono mt-1">GE-2021-00234</div>
            <div className="flex gap-2 justify-center mt-3.5">
              <span className="bg-green-bg text-green-text text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border border-green-border">🟢 Verde</span>
              <span className="bg-green-bg text-green-text text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border border-green-border">🌿 Verde Bonafide</span>
            </div>
          </div>
          <div className="bg-white rounded-[14px] border border-border p-5 mb-3">
            <div className="text-[12px] font-semibold text-text-4 uppercase tracking-[1px] mb-3">Seguridad</div>
            {[['🔑','Contraseña','Cambiar →','text-orange'],['📱','2FA','Activo ✅','text-green-text'],['🔔','Notificaciones','Activo ✅','text-green-text']].map(([ico,lbl,val,c]) => (
              <div key={lbl} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="text-[18px]">{ico}</span>
                <span className="text-[13px] flex-1">{lbl}</span>
                <span className={`text-[12px] font-semibold cursor-pointer ${c}`}>{val}</span>
              </div>
            ))}
          </div>
          <Button variant="danger" full className="h-11 rounded-[10px]" onClick={() => go('login')}>
            Cerrar sesión
          </Button>
        </div>

        {/* Right column */}
        <div>
          <div className="bg-white rounded-[14px] border border-border p-6 mb-4">
            <div className="text-[14px] font-bold mb-4">Datos de la empresa</div>
            <div className="grid grid-cols-2 gap-x-4">
              <FormGroup label="Razón Social"><Input type="text" defaultValue="Construcciones Silva Ltd." /></FormGroup>
              <FormGroup label="RUC / NIF"><Input type="text" defaultValue="GE-2021-00234" /></FormGroup>
              <FormGroup label="Sector"><Select><option>Construcción</option></Select></FormGroup>
              <FormGroup label="Empleados"><Select><option>11–25</option></Select></FormGroup>
              <FormGroup label="Teléfono"><Input type="text" defaultValue="+240 222 456 789" /></FormGroup>
              <FormGroup label="Email"><Input type="email" defaultValue="carlos@construccionessilva.gq" /></FormGroup>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="primary">Guardar cambios</Button>
            </div>
          </div>
          <div className="bg-white rounded-[14px] border border-border p-6">
            <div className="text-[14px] font-bold mb-4">📄 Documentos KYC</div>
            {[['Cédula / Pasaporte','✅ Vigente hasta 2029','green'],['RUC Comercial','⚠ Vence Jun 2026','yellow'],['Estado de cuenta bancario','✅ Actualizado abr 2026','green'],['KYC Bonafide','✅ Aprobado ene 2025','green'],['Contrato B-Morï','✅ Firmado ene 2025','green']].map(([name,st,cls]) => (
              <div key={name} className="flex items-center gap-3 py-3 border-b border-page-bg last:border-0">
                <div className="w-9 h-9 bg-page-bg rounded-[8px] flex items-center justify-center text-[18px]">📄</div>
                <div className="flex-1 text-[13px] font-semibold">{name}</div>
                <Badge variant={cls}>{st}</Badge>
                <Button variant="ghost" size="sm">Ver</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

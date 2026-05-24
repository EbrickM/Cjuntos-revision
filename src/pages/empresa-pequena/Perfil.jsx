import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import FormGroup, { Input } from '../../components/ui/FormGroup';

export default function EpPerfil() {
  const { go } = useApp();
  return (
    <AppShell active="epPerfil" role="empresa-pequena" title="Mi Perfil" sub="Información de cuenta">
      <div className="fade-in space-y-5">

        {/* Resumen empresa — ancho completo */}
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[28px] shrink-0">
              CS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-bold text-text-1">Construcciones Silva Ltd.</div>
              <div className="text-[13px] text-text-3 mt-0.5">Carlos Esono Mbá · Director General</div>
              <div className="text-[12px] text-text-5 font-mono mt-0.5">GE-2021-00234</div>
              <div className="flex gap-2 mt-2.5">
                <span className="bg-green-bg text-green-text text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border border-green-border flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />Semáforo Verde
                </span>
                <span className="bg-green-bg text-green-text text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border border-green-border">
                  Verde Bonafide
                </span>
              </div>
            </div>
            <Button variant="danger" onClick={() => go('login')}>Cerrar sesión</Button>
          </div>
        </div>

        {/* Datos de la empresa — ancho completo, solo lectura */}
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div className="mb-5">
            <div className="text-[14px] font-bold text-text-1">Datos de la empresa</div>
            <div className="text-[12px] text-text-4">Información registrada en la plataforma. Contacta con Bonafide para solicitar modificaciones.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormGroup label="Razón Social">
              <Input value="Construcciones Silva Ltd." disabled />
            </FormGroup>
            <FormGroup label="RUC / NIF">
              <Input value="GE-2021-00234" disabled />
            </FormGroup>
            <FormGroup label="Sector Productivo">
              <Input value="Construcción" disabled />
            </FormGroup>
            <FormGroup label="Número de empleados">
              <Input value="11 – 25" disabled />
            </FormGroup>
            <FormGroup label="Teléfono corporativo">
              <Input value="+240 222 456 789" disabled />
            </FormGroup>
            <FormGroup label="Correo corporativo">
              <Input value="carlos@construccionessilva.gq" disabled />
            </FormGroup>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

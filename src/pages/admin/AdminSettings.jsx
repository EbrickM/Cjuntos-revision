import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import FormGroup, { Input } from '../../components/ui/FormGroup';

/* ─── Admin Settings ─── */
export default function AdminSettings() {
  return (
    <AppShell active="adminSettings" role="admin" title="Configuración" sub="Parámetros del sistema">
      <div className="fade-in max-w-[600px]">
        <div className="bg-white rounded-[14px] border border-border p-6 mb-4">
          <div className="text-[14px] font-bold mb-4">Confirming</div>
          <FormGroup label="Porcentaje anticipo estándar (%)">
            <Input type="number" defaultValue="98" />
          </FormGroup>
          <FormGroup label="Días máximos plazo factura">
            <Input type="number" defaultValue="90" />
          </FormGroup>
        </div>
        <Button variant="primary">Guardar configuración</Button>
      </div>
    </AppShell>
  );
}

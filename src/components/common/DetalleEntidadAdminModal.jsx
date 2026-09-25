import { CheckCircle2, XCircle, Building2, Phone, Mail, FileText, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const InfoRow = ({ label, value, Icon }) => (
  <div className="flex items-start gap-2.5">
    {Icon && <Icon className="w-4 h-4 shrink-0 mt-0.5 text-text-4" />}
    <div className="min-w-0">
      <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-[13px] text-text-1 truncate">{value || '—'}</div>
    </div>
  </div>
);

const fmtMontoDetalle = (n) => `${new Intl.NumberFormat('de-DE').format(Number(n) || 0)} XAF`;

// Detalle de la entidad (Empresa Contratada / Proveedor / Suministrador)
// recién agregada por un portal, visto desde el panel de notificaciones de
// Bonafide (Admin) — permite aprobar o rechazar directamente desde aquí.
export default function DetalleEntidadAdminModal({ notif, onAprobar, onRechazar, onClose }) {
  const d = notif.detalle ?? {};
  return (
    <Modal
      title={notif.nombreEntidad}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onRechazar}>
              <XCircle className="w-3.5 h-3.5" />Rechazar
            </Button>
            <Button variant="success" onClick={onAprobar}>
              <CheckCircle2 className="w-3.5 h-3.5" />Aprobar
            </Button>
          </div>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
          <div className="bona-gradient-bg w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-text-1 leading-snug">{notif.nombreEntidad}</p>
            <p className="text-[12px] text-text-4">
              {notif.tipoEntidad} agregado por {notif.rolLabel}{notif.quien ? ` · ${notif.quien}` : ''}
            </p>
            <p className="text-[11px] text-text-5 mt-0.5">{notif.fecha}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nombre Comercial" value={d.nombreComercial} Icon={Building2} />
          <InfoRow label="Sector Productivo" value={d.sector} Icon={FileText} />
          <InfoRow label="Teléfono" value={d.telefono} Icon={Phone} />
          <InfoRow label="Correo" value={d.correo} Icon={Mail} />
          <InfoRow label="Registrado por" value={notif.quien} Icon={User} />
          {d.contratoId && (
            <>
              <InfoRow label="Contrato vinculado" value={d.contratoId} Icon={FileText} />
              <InfoRow label="Monto asignado" value={fmtMontoDetalle(d.monto)} Icon={FileText} />
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

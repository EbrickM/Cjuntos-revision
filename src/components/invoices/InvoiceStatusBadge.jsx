// ── Badge de estado de factura (unificado por rol) ───────────────────────────
// Envuelve el Badge base del sistema usando el mapa de variantes por estado
// definido en invoiceStates (reemplaza los `facturaBadge` y `estadoStyle`
// duplicados en contratanteData/provData/Facturacion).
import Badge from '../ui/Badge';
import { estadoLabel, estadoBadge } from '../../lib/invoiceStates';

export default function InvoiceStatusBadge({ estado, className = '' }) {
  return (
    <Badge variant={estadoBadge(estado)} className={className}>
      {estadoLabel(estado)}
    </Badge>
  );
}
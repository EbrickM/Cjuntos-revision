import { useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell';
import RegistrosTabla from '../../components/contratos/RegistrosTabla';
import FiltroClienteSelect from './FiltroClienteSelect';
import { facturaService } from '../../services/factura.service';
import { contratoService } from '../../services/contrato.service';
import { CST } from '../../lib/contractStates';
import { BANCO, porFechaDesc, fechaContrato } from './fondeadorShared';

// ── REGISTROS (portal Banco Fondeador) ─────────────────────────────────────────
// Tabla igual a la de la pestaña "Registros" del detalle de contrato, restringida:
// referentes = Empresas Contratantes; asuntos ∈ {contrato, facturas, administración, cliente}.
const fmtRegistro = (n) => `${new Intl.NumberFormat('de-DE').format(Number(n) || 0)} XAF`;

function registrosFondeador() {
  const contracts = contratoService.listar();
  const facturas  = facturaService.listar();

  // Empresas Contratantes reales de la plataforma (desde los contratos).
  const mapaContratante = new Map();
  contracts.forEach(c => {
    const nombre = c.contratante?.razonSocial?.trim();
    if (nombre) mapaContratante.set(nombre, { nombre, fecha: fechaContrato(c) });
  });
  const validos = new Set(mapaContratante.keys());

  const ev = [];
  const push = (referente, fecha, asunto, registro) => ev.push({ referente, fecha: fecha ?? '01/07/2026', asunto, registro });

  mapaContratante.forEach(({ nombre, fecha }) => {
    push(nombre, fecha, 'cliente', 'Se registró como Empresa Contratante en la plataforma.');
    push(nombre, fecha, 'administración', 'Presentó y completó la documentación administrativa exigida por Bonafide.');
  });

  contracts.forEach(c => {
    const ref = c.contratante?.razonSocial?.trim() || 'Empresa Contratante';
    const base = fechaContrato(c);
    push(ref, base, 'contrato', `Registró el contrato ${c.id} por ${fmtRegistro(c.monto)}.`);
    push(ref, base, 'administración', `Completó la documentación administrativa del contrato ${c.id}.`);
    if (c.estado === CST.activo) {
      push(ref, c.fechaInicio ?? base, 'contrato', `Aceptó las condiciones y quedó activo el contrato ${c.id}.`);
    }
    // `c.facturas` en el esquema canónico es un CONTEO (número), no un array;
    // los registros de cada factura salen del listado global de facturas.
    if (Array.isArray(c.facturas)) {
      c.facturas.forEach(f => {
        push(ref, f.fecha ?? base, 'facturas', `Registró la factura ${f.id} del contrato ${c.id} por ${fmtRegistro(f.monto)}.`);
      });
    }
  });

  facturas.forEach(f => {
    if (!f.contratante || !validos.has(f.contratante)) return;
    push(f.contratante, f.fecha, 'facturas', `Emitió la factura ${f.id} por ${fmtRegistro(f.monto)} (${f.pyme ?? '—'}).`);
  });

  return ev.sort(porFechaDesc);
}

export default function FondRegistros() {
  const [filtroCliente, setFiltroCliente] = useState('');
  const registros = useMemo(() => registrosFondeador(), []);
  const registrosFiltrados = filtroCliente ? registros.filter(r => r.referente === filtroCliente) : registros;

  return (
    <AppShell active="fondRegistros" role="fondeador" title="Registros" sub={`Movimientos y actuaciones vistos por ${BANCO}`}>
      <div className="fade-in space-y-4">
        <div className="flex justify-end">
          <FiltroClienteSelect value={filtroCliente} onChange={setFiltroCliente} />
        </div>
        <RegistrosTabla
          noAnim
          registros={registrosFiltrados}
          titulo="Registros"
          sub={filtroCliente ? `Movimientos y actuaciones de ${filtroCliente} sobre la plataforma.` : 'Movimientos y actuaciones de las Empresas Contratantes sobre la plataforma.'}
        />
      </div>
    </AppShell>
  );
}

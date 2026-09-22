
import { useState, useCallback, useEffect } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { AlertTriangle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { adminService } from '../../services';
import { localDb } from '../../lib/localDb';

const DOCS_REQUIRED = ['DNI Rep. Legal', 'RUC Registro', 'Estados Financieros 2025', 'Escritura social'];

const ESTADO_CLS = {
  'Aprobado':               'green',
  'Desestimado':            'red',
  'En revisión':            'blue',
  'Pendiente':              'amber',
  'Documentos incompletos': 'gold',
};

const ESTADOS_TERMINALES = new Set(['Aprobado', 'Desestimado']);

const INITIAL_ROWS = [
  {
    id: 'KYC-2026-011', nombre: 'Tradex', ruc: 'GE-2020-00112',
    tipo: 'Empresa Pequeña', rep: 'Carlos Silva Nguema', email: 'c.silva@constsilva.gq',
    sector: 'Construcción', docs: ['DNI Rep. Legal', 'RUC Registro', 'Estados Financieros 2025', 'Escritura social'],
    estado: 'Aprobado', dt: '05/05/26',
  },
  {
    id: 'KYC-2026-012', nombre: 'MH Pinturas', ruc: 'GE-2022-00341',
    tipo: 'Empresa Pequeña', rep: 'María Eyeang', email: 'm.eyeang@pinturasbata.gq',
    sector: 'Industria', docs: ['DNI Rep. Legal', 'RUC Registro', 'Estados Financieros 2025'],
    estado: 'Pendiente', dt: '10/05/26',
  },
  {
    id: 'KYC-2026-013', nombre: 'Conexxia Agro GE', ruc: 'GE-2023-00567',
    tipo: 'Empresa Pequeña', rep: 'Jean-Pierre Mba', email: 'jp.mba@agriecopyme.gq',
    sector: 'Agricultura', docs: ['DNI Rep. Legal', 'RUC Registro'],
    estado: 'Documentos incompletos', dt: '12/05/26',
  },
  {
    id: 'KYC-2026-014', nombre: 'Conexxia Log', ruc: 'GE-2021-00789',
    tipo: 'Empresa Pequeña', rep: 'Pedro Ela Nguema', email: 'p.ela@logige.gq',
    sector: 'Transporte', docs: ['DNI Rep. Legal', 'RUC Registro', 'Estados Financieros 2025', 'Plan de negocio'],
    estado: 'En revisión', dt: '12/05/26',
  },
];

// modalMode: null | 'reevaluar' | 'desestimar' | 'rechazar'
export default function AdminKYC() {
  const [rows,          setRows]          = useState(() => localDb.get('admin_kyc', INITIAL_ROWS));
  const [selected,      setSelected]      = useState(null);
  const [modalMode,     setModalMode]     = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading,       setLoading]       = useState(false);
  const [toast,         setToast]         = useState(null);

  useEffect(() => { localDb.set('admin_kyc', rows); }, [rows]);

  const e = rows.find(x => x.id === selected);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  function updateEstado(id, nuevoEstado) {
    if (!nuevoEstado) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
  }

  function closeModal() {
    setSelected(null);
    setModalMode(null);
    setObservaciones('');
  }

  function backToDetail() {
    setModalMode(null);
    setObservaciones('');
  }

  async function handleAprobar(id, fromModal = false) {
    setLoading(true);
    try {
      const json = await adminService.aprobarKyc(id);
      if (json.success) updateEstado(id, json.data?.estado ?? 'Aprobado');
      if (fromModal) closeModal();
      showToast(json.success ? 'success' : 'error', json.message ?? (json.success ? 'KYC aprobado correctamente.' : 'Ocurrió un error.'));
    } catch {
      if (fromModal) closeModal();
      showToast('error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReevaluar() {
    if (!observaciones.trim()) return;
    setLoading(true);
    try {
      const json = await adminService.reevaluarKyc(e.id, observaciones);
      if (json.success) updateEstado(e.id, json.data?.estado);
      closeModal();
      showToast(json.success ? 'success' : 'error', json.message ?? (json.success ? 'Reevaluación enviada.' : 'Ocurrió un error.'));
    } catch {
      closeModal();
      showToast('error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDesestimar() {
    setLoading(true);
    try {
      const json = await adminService.desestimarKyc(e.id);
      if (json.success) updateEstado(e.id, json.data?.estado ?? 'Desestimado');
      closeModal();
      showToast(json.success ? 'success' : 'error', json.message ?? (json.success ? 'Cliente desestimado.' : 'Ocurrió un error.'));
    } catch {
      closeModal();
      showToast('error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const modalTitle = {
    reevaluar:  `Reevaluar — ${e?.nombre}`,
    desestimar: `Desestimar cliente — ${e?.nombre}`,
  }[modalMode] ?? `KYC — ${e?.nombre}`;

  const animTotal    = useCountUp(4, 900, 100);
  const animPend     = useCountUp(2, 900, 200);
  const animAprobados= useCountUp(1, 900, 300);
  const animIncompl  = useCountUp(1, 900, 400);

  return (
    <AppShell active="adminKYC" role="admin" title="KYC Empresas" sub="Verificación de identidad">
      <div className="fade-in">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['👁',animTotal,'Total KYC','text-text-1'],['⏳',animPend,'Pendientes revisión','text-yellow-text'],['✅',animAprobados,'Aprobados','text-green-text'],['❌',animIncompl,'Incompletos','text-red-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[24px] mb-2">{ico}</div>
              <div className={`text-[22px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Cola de Verificación KYC</span>
            <Button variant="ghost" size="sm">📥 Exportar</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{['Empresa','RUC','Tipo','Representante Legal','Docs','Estado',''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map(em => {
                  const terminal     = ESTADOS_TERMINALES.has(em.estado);
                  const puedeAprobar = !terminal && em.docs.length >= DOCS_REQUIRED.length;
                  return (
                    <tr key={em.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                      <td className="px-4 py-3 font-semibold text-[13px]">{em.nombre}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-4">{em.ruc}</td>
                      <td className="px-4 py-3 text-[12px] text-text-3">{em.tipo}</td>
                      <td className="px-4 py-3 text-[12px]">{em.rep}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-semibold ${em.docs.length >= DOCS_REQUIRED.length ? 'text-green-text' : 'text-red-text'}`}>
                          {em.docs.length}/{DOCS_REQUIRED.length} docs
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ESTADO_CLS[em.estado] ?? 'gray'}>{em.estado}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {em.estado !== 'Desestimado' && (
                          <div className="flex gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => setSelected(em.id)}>Ver →</Button>
                            {puedeAprobar && (
                              <Button variant="success" size="sm" onClick={() => handleAprobar(em.id, false)}>✅ Aprobar</Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal KYC ── */}
      {e && (
        <Modal
          title={modalTitle}
          onClose={closeModal}
          footer={
            modalMode === 'reevaluar' ? (
              <>
                <Button variant="ghost" onClick={backToDetail} disabled={loading}>Cancelar</Button>
                <Button variant="primary" onClick={handleReevaluar} disabled={!observaciones.trim() || loading}>
                  {loading ? 'Enviando…' : 'Confirmar reevaluación'}
                </Button>
              </>
            ) : modalMode === 'desestimar' ? (
              <>
                <Button variant="ghost" onClick={backToDetail} disabled={loading}>Cancelar</Button>
                <Button variant="danger" onClick={handleDesestimar} disabled={loading}>
                  {loading ? 'Procesando…' : 'Sí, desestimar'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={closeModal}>Cerrar</Button>
                <div className="flex gap-2 ml-auto flex-wrap">
                  {!ESTADOS_TERMINALES.has(e.estado) && (
                    <Button variant="danger" size="sm" onClick={() => setModalMode('desestimar')}>
                      Desestimar
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setModalMode('reevaluar')}>
                    🔄 Reevaluar
                  </Button>
                  {!ESTADOS_TERMINALES.has(e.estado) && e.docs.length >= DOCS_REQUIRED.length && (
                    <Button variant="success" onClick={() => handleAprobar(e.id, true)}>
                      ✅ Aprobar KYC
                    </Button>
                  )}
                </div>
              </>
            )
          }
        >
          {/* Reevaluar */}
          {modalMode === 'reevaluar' && (
            <div className="space-y-4">
              <p className="text-[13px] text-text-3 leading-relaxed">
                Indica los motivos o criterios de la reevaluación. Esta información quedará registrada en el historial del cliente.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-1.5">
                  Observaciones <span className="text-red-text">*</span>
                </label>
                <textarea
                  value={observaciones}
                  onChange={ev => setObservaciones(ev.target.value)}
                  rows={5}
                  placeholder="Describe los motivos de la reevaluación…"
                  className="w-full px-3 py-2.5 text-[13px] rounded-[10px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange resize-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Confirmación desestimar */}
          {modalMode === 'desestimar' && (
            <div className="flex items-start gap-3 p-4 rounded-[12px] bg-red-bg border border-red/20">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-text" />
              <p className="text-[13px] text-red-text leading-relaxed">
                ¿Estás seguro de que deseas desestimar a <strong>{e.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
          )}

          {/* Detalle normal */}
          {!modalMode && (
            <>
              <div className="bg-page-bg rounded-[12px] p-4 mb-4">
                {[['Empresa',e.nombre],['RUC',e.ruc],['Tipo',e.tipo],['Sector',e.sector],['Rep. Legal',e.rep],['Email',e.email]].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-[12px] text-text-4">{k}</span>
                    <span className="text-[13px] font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[12px] font-bold text-text-3 mb-2">Documentos aportados</div>
              <div className="flex flex-col gap-2">
                {DOCS_REQUIRED.map(doc => {
                  const tiene = e.docs.includes(doc);
                  return (
                    <div key={doc} className={`flex items-center gap-2.5 p-2.5 rounded-[8px] ${tiene ? 'bg-green-bg' : 'bg-red-bg'}`}>
                      <span>{tiene ? '✅' : '❌'}</span>
                      <span className={`text-[12px] font-medium ${tiene ? 'text-green-text' : 'text-red-text'}`}>{doc}</span>
                      {tiene && <span className="ml-auto text-[11px] text-orange cursor-pointer">📥 Ver</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Modal>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  );
}

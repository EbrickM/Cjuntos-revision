import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Upload, FileText, Download } from 'lucide-react';

const docs = [
  { cat:'Préstamos', items:[
    { nombre:'Contrato préstamo PRE-2026-001.pdf', dt:'05/05/26', size:'842 KB', estado:'Vigente', cls:'green' },
    { nombre:'Domiciliación bancaria CTR-2026-001.pdf', dt:'05/05/26', size:'214 KB', estado:'Vigente', cls:'green' },
    { nombre:'Plan de amortización PRE-2026-001.pdf', dt:'05/05/26', size:'156 KB', estado:'Vigente', cls:'green' },
  ]},
  { cat:'KYC y Constitución', items:[
    { nombre:'RUC Registro GE-2020-00112.pdf', dt:'01/01/25', size:'530 KB', estado:'Vigente', cls:'green' },
    { nombre:'Escritura constitución social.pdf', dt:'15/03/20', size:'1.2 MB', estado:'Vigente', cls:'green' },
    { nombre:'DNI Carlos Silva Nguema.pdf', dt:'01/01/25', size:'298 KB', estado:'Vigente', cls:'green' },
  ]},
  { cat:'Contratos con Contratante', items:[
    { nombre:'CTR-2026-001 — Chevron.pdf', dt:'01/04/26', size:'678 KB', estado:'Activo', cls:'green' },
    { nombre:'Addenda CTR-2026-001 — Fase 2.pdf', dt:'05/05/26', size:'124 KB', estado:'Activo', cls:'green' },
  ]},
  { cat:'Facturas emitidas', items:[
    { nombre:'FAC-2026-0933 — XAF 18,000,000.pdf', dt:'10/05/26', size:'98 KB', estado:'Pendiente', cls:'yellow' },
    { nombre:'FAC-2026-0892 — XAF 12,500,000.pdf', dt:'01/05/26', size:'102 KB', estado:'Pagada',   cls:'green' },
  ]},
];

export default function EpDocumentos() {
  return (
    <AppShell active="epDocs" role="empresa-pequena" title="Documentos" sub="Repositorio de archivos"
      extra={<Button variant="primary" size="sm"><Upload size={16} className="mr-2" />Subir documento</Button>}
    >
      <div className="fade-in">
        {docs.map(cat => (
          <div key={cat.cat} className="mb-6">
            <div className="text-[12px] font-bold text-text-4 uppercase tracking-[1px] mb-3">{cat.cat}</div>
            <div className="bg-white rounded-[14px] border border-border overflow-hidden">
              {cat.items.map((doc, i) => (
                <div key={doc.nombre}
                  className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#FFFAF8]
                    ${i < cat.items.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="w-9 h-9 rounded-[10px] bg-orange-tint flex items-center justify-center text-[18px] shrink-0"><FileText size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text-1 truncate">{doc.nombre}</div>
                    <div className="text-[11px] text-text-4">{doc.dt} · {doc.size}</div>
                  </div>
                  <Badge variant={doc.cls}>{doc.estado}</Badge>
                  <Button variant="ghost" size="sm"><Download size={16} className="mr-2" />Descargar</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

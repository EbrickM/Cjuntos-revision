import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Timeline from '../../components/ui/Timeline';

// ── CONFIRMING DETALLE ──
export function EmpConfDet() {
  const { go } = useApp();
  const timeline = [
    { icon: '✓', title: 'Enviada', timestamp: '12/05/2026 11:00', sub: 'Solicitud creada por TotalEnerGE', done: true },
    { icon: '✓', title: 'Recibida', timestamp: '12/05/2026 14:20', sub: 'Documentos verificados', done: true },
    { icon: '✓', title: 'En revisión', timestamp: '13/05/2026 09:15', sub: 'Asignada a analista', done: true },
    { icon: '✓', title: 'Aprobada', timestamp: '13/05/2026 16:45', sub: 'Anticipo desembolsado', done: true },
    { icon: '⏳', title: 'Cobro empresa', timestamp: '60–90 días', sub: 'TotalEnerGE paga a Bonafide', done: false },
  ];
  return (
    <AppShell active="empConf" role="contratante" title="Solicitud CONF-2026-04821">
      <div className="fade-in">
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="sm" onClick={() => go('empConf')}>← Volver</Button>
          <Badge variant="green">Aprobada</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-[14px] border border-border p-6">
            <div className="text-[14px] font-bold mb-4">Datos de la Solicitud</div>
            {[['Proveedor','Construcciones Silva Ltd.'],['RUC','GE-2021-00234'],['Semáforo','🟢 Verde — Bajo Riesgo'],['Nº Factura','FAC-2026-0892'],['Fecha','12/05/2026'],['Monto factura','XAF 12,500,000'],['Anticipo (98%)','XAF 12,250,000'],['Comisión','XAF 0'],['Documento','📄 factura_silva_0892.pdf']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-page-bg last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
            <div className="mt-4">
              <Button variant="ghost" size="sm">📄 Ver Factura PDF</Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] border border-border p-6">
              <div className="text-[14px] font-bold mb-4">Estado del Proceso</div>
              <Timeline items={timeline} />
              <div className="mt-3 p-3 bg-green-bg border border-green-border rounded-[10px]">
                <div className="text-[12px] font-bold text-green-text">⚡ Tiempo total: 38 horas</div>
                <div className="text-[11px] text-text-4">Meta: menos de 72h — ✅ Cumplida</div>
              </div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Gestor Asignado</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[13px]">AM</div>
                <div>
                  <div className="text-[13px] font-semibold">Ana Martínez</div>
                  <div className="text-[11px] text-text-4">Operaciones Bonafide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ── PROVEEDORES ──
export function EmpProv() {
  const { go } = useApp();
  const provs = [
    ['Const. Silva','CS','Construcción','45 emp.','b-green','🟢 Verde','87'],
    ['Tech Bata SL','TB','Tecnología','12 emp.','b-green','🟢 Verde','82'],
    ['LogiGE S.A.','LG','Transporte','28 emp.','b-green','🟢 Verde','79'],
    ['AgriEco PYME','AE','Agricultura','8 emp.','b-yellow','⚠ Amarillo','61'],
    ['Mader. Bata','MB','Maderería','23 emp.','b-green','🟢 Verde','75'],
    ['ServLog GE','SL','Logística','15 emp.','b-red','🔴 Rojo','32'],
  ];
  return (
    <AppShell active="empProv" role="contratante" title="Proveedores" sub="Directorio"
      extra={<Button variant="primary" size="sm">+ Invitar PYME</Button>}
    >
      <div className="fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {provs.map(([name,ini,sec,emp,cls,sem,score]) => (
            <div key={name} onClick={() => go('empProvPerfil')} className="bg-white rounded-[14px] border border-border p-5 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[13px]">{ini}</div>
                  <div className="text-[14px] font-bold">{name}</div>
                </div>
                <Badge variant={cls.replace('b-','')}>{sem}</Badge>
              </div>
              <div className="text-[12px] text-text-4 mb-3">{sec} · {emp}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-text-4">Score {score}/100</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${score}%`, background: parseInt(score)<50?'#E53935':parseInt(score)<70?'#FFB300':'#C62828'}} />
              </div>
              <Button variant="ghost" size="sm" full className="mt-3">Ver perfil →</Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// ── PROVEEDOR PERFIL ──
export function EmpProvPerfil() {
  const { go } = useApp();
  return (
    <AppShell active="empProv" role="contratante" title="Construcciones Silva Ltd.">
      <div className="fade-in">
        <Button variant="ghost" size="sm" className="mb-5" onClick={() => go('empProv')}>← Directorio</Button>
        <div className="bg-white rounded-[14px] border border-border p-7 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] rounded-[14px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[20px]">CS</div>
            <div className="flex-1">
              <div className="text-[22px] font-bold mb-1">Construcciones Silva Ltd.</div>
              <div className="flex gap-4 text-[13px] text-text-4">
                <span>RUC: GE-2021-00234</span><span>·</span><span>Construcción</span><span>·</span><span>Activo desde Ene 2025</span>
              </div>
            </div>
            <div className="flex gap-3">
              {[['🟢 Verde','Bajo Riesgo','bg-green-bg border-green-border'],['🌿 Verde B.','Etiqueta ESG','bg-green-bg border-green-border'],['87/100','Score financiero','bg-orange-tint border-orange-border']].map(([val,lbl,cls]) => (
                <div key={lbl} className={`${cls} border rounded-[12px] p-3.5 text-center`}>
                  <div className="text-[18px] font-bold mb-0.5">{val}</div>
                  <div className="text-[11px] text-text-4">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="bg-white rounded-[14px] border border-border">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="text-[14px] font-bold">Historial Confirming</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{['ID','Monto','Estado','Fecha'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
              <tbody>
                {[['CONF-04821','12,500,000','green','Aprobada','12/05'],['CONF-04803','9,800,000','green','Aprobada','28/04'],['CONF-04789','7,200,000','green','Aprobada','15/04']].map(([id,a,cls,st,dt]) => (
                  <tr key={id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                    <td className="px-4 py-3 font-bold">{a}</td>
                    <td className="px-4 py-3"><Badge variant={cls}>{st}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Compliance / KYC</div>
              {[['✅','KYC verificado','green'],['✅','AML aprobado','green'],['✅','Documentos vigentes','green'],['⚠️','RUC vence Jun 2026','yellow']].map(([ico,lbl,cls]) => (
                <div key={lbl} className="flex items-center gap-2.5 py-2.5 border-b border-page-bg last:border-0">
                  <span className="text-[18px]">{ico}</span>
                  <span className="text-[13px] flex-1">{lbl}</span>
                  {cls === 'yellow' && <Button variant="ghost" size="sm">Notificar</Button>}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Contacto</div>
              {['👤 Carlos Esono Mbá','📧 c.esono@constsilva.gq','📞 +240 222 123 456'].map(c => (
                <div key={c} className="text-[13px] text-text-3 py-1">{c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ── RIESGOS ──
export function EmpRisk() {
  const { go } = useApp();
  return (
    <AppShell active="empRisk" role="contratante" title="Monitor de Riesgos">
      <div className="fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[14px] font-bold mb-4">Distribución de Riesgo</div>
            <div className="flex items-center gap-6">
              <div className="relative w-[130px] h-[130px] shrink-0">
                <svg width="130" height="130" viewBox="0 0 130 130" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#F0F2F5" strokeWidth="14"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#00C853" strokeWidth="14" strokeDasharray="226 113" strokeLinecap="round"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#FFB300" strokeWidth="14" strokeDasharray="75 264" strokeDashoffset="-226" strokeLinecap="round"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#E53935" strokeWidth="14" strokeDasharray="38 301" strokeDashoffset="-301" strokeLinecap="round"/>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="block text-[22px] font-extrabold">18</span>
                  <span className="block text-[10px] text-text-4">total</span>
                </div>
              </div>
              <div className="flex-1">
                {[['#00C853','Verde','67%','12 proveedores'],['#FFB300','Amarillo','22%','4 proveedores'],['#E53935','Rojo','11%','2 proveedores']].map(([c,l,p,cnt]) => (
                  <div key={l} className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{background:c}}/>
                    <span className="text-[13px] font-semibold flex-1">{l}</span>
                    <span className="text-[13px] font-bold" style={{color:c}}>{p}</span>
                    <span className="text-[12px] text-text-4 w-[90px]">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[13px] font-bold mb-3">⚠ Alertas Activas</div>
            {[['red','🔴','ServLog GE — Riesgo Alto','3 pagos tardíos desde 15/04/2026'],['yellow','🟡','AgriEco PYME — Docs','RUC vence 30/05/2026']].map(([typ,ico,t,d]) => (
              <div key={t} className={`flex items-center gap-3 rounded-[10px] p-3 mb-2 border ${typ==='red'?'bg-red-bg border-red/20':'bg-yellow-bg border-yellow/30'}`}>
                <span className="text-[20px]">{ico}</span>
                <div className="flex-1">
                  <div className="text-[12px] font-bold">{t}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">{d}</div>
                </div>
                <Button variant="ghost" size="sm">Revisar</Button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border text-[14px] font-bold">Todos los Proveedores</div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>{['Proveedor','Semáforo','Score','Facturas','Alertas','Acciones'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
            <tbody>
              {[['Const. Silva','green','🟢 Verde',87,3,'Ninguna'],['Tech Bata SL','green','🟢 Verde',82,1,'Ninguna'],['AgriEco PYME','yellow','⚠ Amarillo',61,2,'Docs por vencer'],['ServLog GE','red','🔴 Rojo',32,1,'3 pagos tardíos']].map(([name,cls,sem,score,fac,alert]) => (
                <tr key={name} onClick={() => go('empProvPerfil')} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                  <td className="px-4 py-3 font-semibold">{name}</td>
                  <td className="px-4 py-3"><Badge variant={cls}>{sem}</Badge></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold">{score}</span><div className="w-20 h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-orange rounded-full" style={{width:`${score}%`}}/></div></div></td>
                  <td className="px-4 py-3">{fac}</td>
                  <td className="px-4 py-3 text-[12px]" style={{color:alert==='Ninguna'?'#059669':'#D97706'}}>{alert}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm">Ver →</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ── ESG ──
export function EmpESG() {
  return (
    <AppShell active="empESG" role="contratante" title="Reportes ESG" sub="2026"
      extra={<Button variant="primary" size="sm">📥 Descargar PDF</Button>}
    >
      <div className="fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['🌿','bg-green-bg','23%','text-green-text','Cartera Verde','Meta superada en 3 puntos'],['📄','bg-blue-bg','100%','text-green-text','Operaciones Paperless','0 documentos físicos'],['🎓','bg-[#F5F3FF]','14/18','text-text-1','Proveedores Capacitados','78% completado'],['🌍','bg-green-bg','12 ton','text-green-text','CO₂ Ahorrado este Q','≈ 48 vuelos BTA→MAD']].map(([ico,bg,val,vc,lbl,sub]) => (
            <div key={lbl} className="bg-white rounded-[14px] p-5 border border-border">
              <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] ${bg} mb-3`}>{ico}</div>
              <div className={`text-[26px] font-extrabold leading-none mb-1 ${vc}`}>{val}</div>
              <div className="text-[12px] text-text-4 mb-1">{lbl}</div>
              <div className="text-[11px] text-text-3">{sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-[14px] border border-border p-6">
            <div className="text-[14px] font-bold mb-4">Distribución Etiquetas B-Morï</div>
            {[['🌿 Verde Bonafide','8 proveedores','44%','bg-green'],['🥉 Bronce Bonafide','6 proveedores','33%','bg-yellow'],['○ Sin etiqueta','4 proveedores','22%','bg-text-5']].map(([lbl,cnt,pct,bc]) => (
              <div key={lbl} className="mb-4">
                <div className="flex justify-between mb-1"><span className="text-[13px] font-semibold">{lbl}</span><span className="text-[13px] text-text-4">{cnt}</span></div>
                <div className="h-2 bg-border rounded-full overflow-hidden"><div className={`h-full ${bc} rounded-full`} style={{width:pct}}/></div>
                <div className="text-[11px] text-text-4 mt-1">{pct} del total</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[14px] border border-border p-6">
            <div className="text-[14px] font-bold mb-4">Cumplimiento Regulatorio</div>
            <div className="grid grid-cols-2 gap-3">
              {[['COBAC','Autorización bancaria','✅ Cumple'],['KYC/AML','Prevención lavado','✅ Al día'],['ISO 9001','Calidad operativa','🔄 En proceso'],['GDPR/COBAC','Protección datos','✅ Cumple']].map(([title,sub,st]) => (
                <div key={title} className="bg-page-bg rounded-[10px] p-3.5">
                  <div className="text-[13px] font-bold">{title}</div>
                  <div className="text-[11px] text-text-4 mb-1">{sub}</div>
                  <span className="text-[12px] font-semibold" style={{color:st.includes('✅')?'#059669':'#D97706'}}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ── NOTIFICACIONES ──
export function EmpNotif() {
  return (
    <AppShell active="empNotif" role="contratante" title="Notificaciones">
      <div className="fade-in max-w-[720px]">
        {[['Hoy',[['💰','Anticipo desembolsado','XAF 12,250,000 enviados a Construcciones Silva','09:32',true],['✅','Solicitud aprobada','CONF-04819 LogiGE aprobada','08:15',true]]],['Ayer',[['⚠','Alerta de riesgo','ServLog GE: 3 pagos tardíos','11:00',false],['📋','Contrato PYME','Construcciones Silva envió datos para verificar','10:00',false]]]].map(([grp,items]) => (
          <div key={grp} className="mb-6">
            <div className="text-[11px] font-semibold text-text-4 uppercase tracking-[1px] mb-3">{grp}</div>
            {items.map(([ico,title,desc,time,unread]) => (
              <div key={title} className="flex gap-3.5 p-3.5 bg-white border border-border rounded-[12px] mb-2 cursor-pointer hover:bg-[#FFFAF8]">
                <div className="w-10 h-10 bg-page-bg rounded-[10px] flex items-center justify-center text-[20px] shrink-0">{ico}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold">{title}</span>
                    {unread && <span className="w-[7px] h-[7px] bg-orange rounded-full"/>}
                  </div>
                  <div className="text-[12px] text-text-3">{desc}</div>
                </div>
                <span className="text-[11px] text-text-5 shrink-0">{time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppShell>
  );
}

// ── SETTINGS ──
export function EmpSettings() {
  return (
    <AppShell active="empSettings" role="contratante" title="Configuración">
      <div className="fade-in max-w-[700px]">
        {[['👤','Datos de empresa','TotalEnerGE · RUC GE-2020-00567'],['🔐','Seguridad','Contraseña, 2FA, sesiones activas'],['🔔','Notificaciones','Email, SMS, push'],['🌿','Preferencias ESG','Objetivos y umbrales de alerta'],['👥','Usuarios y permisos','Gestionar accesos del equipo'],['📄','Documentos','Contratos y acuerdos Bonafide']].map(([ico,title,sub]) => (
          <div key={title} className="flex items-center gap-4 p-4 bg-white border border-border rounded-[12px] mb-2 cursor-pointer hover:bg-[#FFFAF8]">
            <span className="text-[24px] w-10 text-center">{ico}</span>
            <div className="flex-1"><div className="text-[14px] font-semibold">{title}</div><div className="text-[12px] text-text-4">{sub}</div></div>
            <span className="text-text-5 text-[18px]">›</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

import AppShell from '../../components/layout/AppShell';

// ── SETTINGS ──
export default function EmpSettings() {
  return (
    <AppShell active="empSettings" role="contratante" title="Configuración">
      <div className="fade-in max-w-[700px]">
        {[['👤','Datos de empresa','Chevron · RUC GE-2020-00567'],['🔐','Seguridad','Contraseña, 2FA, sesiones activas'],['🔔','Notificaciones','Email, SMS, push'],['🌿','Preferencias ESG','Objetivos y umbrales de alerta'],['👥','Usuarios y permisos','Gestionar accesos del equipo'],['📄','Documentos','Contratos y acuerdos Bonafide']].map(([ico,title,sub]) => (
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

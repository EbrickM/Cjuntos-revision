import { useState } from 'react';
import { Mail, CheckCircle, X, Users } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const GREEN = '#2E7D5B';
const TEXT4 = '#A9A6A1';

export default function AppShell({ active, role, children }) {
  const [sideOpen,    setSideOpen]    = useState(false);
  const [showInvite,  setShowInvite]  = useState(false);
  const [invNombre,   setInvNombre]   = useState('');
  const [invCorreo,   setInvCorreo]   = useState('');
  const [toast,       setToast]       = useState(null);

  const handleInvitar = () => {
    const correo = invCorreo;
    setShowInvite(false);
    setInvNombre('');
    setInvCorreo('');
    setToast(correo);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar role={role} onMenuClick={() => setSideOpen(true)} onInvitarPyme={() => setShowInvite(true)} />

      <div className="flex-1 flex overflow-hidden min-h-0 p-2 sm:p-3 gap-2 sm:gap-3" style={{ background: '#f5f5f5' }}>

        {/* Sidebar — solo visible en md+ */}
        <div className="hidden md:block shrink-0">
          <Sidebar active={active} role={role} />
        </div>

        {/* Sidebar móvil — overlay */}
        {sideOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSideOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 p-3 md:hidden">
              <Sidebar active={active} role={role} onClose={() => setSideOpen(false)} />
            </div>
          </>
        )}

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {children}
        </div>
      </div>

      {/* ── Modal invitar PYME ── */}
      {showInvite && (
        <Modal
          title="Invitar PYME"
          onClose={() => setShowInvite(false)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" disabled={!invNombre.trim() || !invCorreo.trim()} onClick={handleInvitar}>
                <Mail className="w-3.5 h-3.5 mr-1" />Enviar invitación
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#F0FBF5', border: '1px solid #B6DFC9' }}>
              <Users className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
              <p className="text-[13px] leading-relaxed" style={{ color: GREEN }}>
                Se enviará una invitación para que se una a la plataforma Bonafide.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-4 block mb-1.5">Nombre de la empresa</label>
              <input
                value={invNombre}
                onChange={e => setInvNombre(e.target.value)}
                placeholder="Ej. Construcciones Silva Ltd."
                className="w-full px-3 py-2.5 text-[13px] rounded-[10px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-4 block mb-1.5">Correo electrónico de contacto</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input
                  type="email"
                  value={invCorreo}
                  onChange={e => setInvCorreo(e.target.value)}
                  placeholder="contacto@empresa.gq"
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-[10px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toast: invitación enviada ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white rounded-[14px] border border-border px-4 py-3.5"
             style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#E3F4EA' }}>
            <CheckCircle className="w-4 h-4" style={{ color: GREEN }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-1">Invitación enviada</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Correo enviado a {toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-1 p-1 rounded-lg hover:bg-page-bg transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5 text-text-4" />
          </button>
        </div>
      )}
    </div>
  );
}

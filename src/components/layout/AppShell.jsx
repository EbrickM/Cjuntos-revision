import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BackButton from '../common/BackButton';

export default function AppShell({ active, role, title, sub, back, headerRight, children }) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar role={role} onMenuClick={() => setSideOpen(true)} />

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
          {back && <BackButton to={back === true ? 'roleSelect' : back} />}
          {title && (
            <div className={`mb-4 ${headerRight ? 'flex items-center justify-between gap-4' : ''}`}>
              <div>
                <h1 className="text-[20px] font-bold text-text-1 leading-tight">{title}</h1>
                {sub && <p className="text-[13px] text-text-4 mt-0.5">{sub}</p>}
              </div>
              {headerRight}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

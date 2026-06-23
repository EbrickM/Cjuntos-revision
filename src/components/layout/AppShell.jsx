import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ active, role, title, sub, children }) {
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
          {children}
        </div>
      </div>
    </div>
  );
}

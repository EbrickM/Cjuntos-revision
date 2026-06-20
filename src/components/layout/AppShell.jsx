import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ active, role, title, sub, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Topbar full-width — igual que el Navbar de bonafide-identity */}
      <Topbar role={role} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#f5f5f5', padding: '12px', gap: '12px' }}>

        {/* Sidebar flotante */}
        <Sidebar active={active} role={role} />

        {/* Contenido scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', minHeight: 0 }}>
          {children}
        </div>

      </div>
    </div>
  );
}

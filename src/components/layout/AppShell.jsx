import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ active, role, title, sub, extra, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={active} role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title={title} sub={sub} role={role} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F8F9FB', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

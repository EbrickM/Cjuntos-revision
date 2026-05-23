import { Search, Bell } from 'lucide-react';

export default function Topbar({ title, sub = '', extra = null }) {
  return (
    <div style={{ height: 64, flexShrink: 0, background: 'white', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
      <div>
        <span className="text-[18px] font-bold text-text-1">{title}</span>
        {sub && <span className="text-[13px] text-text-4 ml-1">/ {sub}</span>}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 bg-page-bg border border-border rounded-[10px] px-3.5 py-2 text-[13px] text-text-4 cursor-pointer w-[220px]">
        <Search className="w-4 h-4 shrink-0" />
        Buscar...
      </div>
      <div className="w-9 h-9 bg-page-bg border border-border rounded-[10px] flex items-center justify-center cursor-pointer relative">
        <Bell className="w-4 h-4 text-text-3" />
        <div className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-orange rounded-full border-2 border-white" />
      </div>
  
    </div>
  );
}

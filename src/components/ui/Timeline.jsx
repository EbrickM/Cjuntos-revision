export default function Timeline({ items }) {
  return (
    <div className="flex flex-col gap-0">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex gap-3.5 relative">
            {!isLast && (
              <div className={`absolute left-[15px] top-8 bottom-[-4px] w-0.5
                ${item.done ? 'bg-orange' : 'bg-border'}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] shrink-0 border-2
              ${item.done   ? 'bg-orange-tint border-orange text-orange' : ''}
              ${item.active ? 'bg-orange-tint border-orange text-orange' : ''}
              ${!item.done && !item.active ? 'bg-page-bg border-input-border text-text-4' : ''}`}>
              {item.icon}
            </div>
            <div className="pb-5 flex-1">
              <div className={`text-[13px] font-bold ${item.active ? 'text-orange' : 'text-text-1'}`}>
                {item.title}
              </div>
              <div className="text-[11px] text-text-4 mt-0.5">{item.timestamp}</div>
              {item.sub && <div className="text-[11px] text-text-4 mt-0.5">{item.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Stepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((_, i) => {
        const done    = i < current;
        const active  = i === current;
        const future  = i > current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 z-10
              ${done   ? 'bg-orange text-white' : ''}
              ${active ? 'bg-orange text-white shadow-[0_0_0_4px_#FFF0EB]' : ''}
              ${future ? 'bg-page-bg text-text-4 border-2 border-input-border' : ''}`}>
              {done ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${done ? 'bg-orange' : 'bg-input-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

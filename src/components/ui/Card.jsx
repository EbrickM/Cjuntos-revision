export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[14px] border border-border ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }) {
  return (
    <div className="px-5 py-[18px] flex items-center justify-between border-b border-border">
      <span className="text-[14px] font-bold text-text-1">{title}</span>
      {action}
    </div>
  );
}

const variants = {
  green:  'bg-green-bg text-green-text before:bg-green',
  yellow: 'bg-yellow-bg text-yellow-text before:bg-yellow',
  red:    'bg-red-bg text-red-text before:bg-red',
  blue:   'bg-blue-bg text-blue-text before:bg-blue-text',
  orange: 'bg-orange-tint text-orange before:bg-orange',
};

export default function Badge({ variant = 'green', children, className = '' }) {
  const cls = variants[variant] || variants.green;
  return (
    <span className={`inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full text-[11px] font-semibold
      before:content-[''] before:w-[6px] before:h-[6px] before:rounded-full before:shrink-0
      ${cls} ${className}`}>
      {children}
    </span>
  );
}

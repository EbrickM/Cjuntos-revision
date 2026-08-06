const variants = {
  primary:   'bg-[#EF7A2C] text-white border border-transparent hover:bg-[#e06a20] hover:shadow-[0_4px_12px_rgba(239,122,44,0.35)]',
  secondary: 'bg-white text-orange border-2 border-orange hover:bg-orange hover:text-white',
  ghost:     'bg-transparent text-orange border border-transparent hover:bg-orange/10',
  danger:    'bg-red-bg text-red-text border border-red/30',
  success:   'bg-green-bg text-green-text border border-green-border',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bona-btn inline-flex items-center gap-[7px] font-medium rounded-lg select-none
        ${variants[variant]} ${sizes[size]}
        ${full ? 'w-full justify-center' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}`}
    >
      {children}
    </button>
  );
}

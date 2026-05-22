const variants = {
  primary:   'bg-orange text-white hover:bg-orange-dark border border-transparent',
  secondary: 'bg-white text-orange border border-orange hover:bg-orange-tint',
  ghost:     'bg-white text-text-3 border border-input-border hover:bg-page-bg',
  danger:    'bg-red-bg text-red-text border border-red/30',
  success:   'bg-green-bg text-green-text border border-green-border',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-5 py-2.5 text-[13px]',
  lg: 'px-6 py-3 text-[15px]',
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
      className={`inline-flex items-center gap-[7px] font-semibold rounded-[10px] cursor-pointer
        transition-all duration-200 select-none
        ${variants[variant]} ${sizes[size]}
        ${full ? 'w-full justify-center' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    >
      {children}
    </button>
  );
}

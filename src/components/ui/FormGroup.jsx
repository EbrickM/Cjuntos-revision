export default function FormGroup({ label, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 mb-4 ${className}`}>
      {label && (
        <label className="text-[12px] font-semibold text-text-2">
          {label}
          {required && <span className="text-orange ml-0.5">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputBase = `h-12 border border-input-border rounded-[10px] px-3.5
  text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all w-full
  focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,82,26,.1)]
  placeholder:text-text-5`;

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputBase} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`border border-input-border rounded-[10px] px-3.5 py-3
        text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all w-full h-20 resize-none
        focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,82,26,.1)]
        placeholder:text-text-5 ${className}`}
      {...props}
    />
  );
}

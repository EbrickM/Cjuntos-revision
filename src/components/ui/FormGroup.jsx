export default function FormGroup({ label, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 mb-4 ${className}`}>
      {label && (
        <label className="text-[12px] font-medium text-text-2">
          {label}
          {required && <span className="text-orange ml-0.5">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputBase = `h-12 border-0 rounded-lg px-3.5
  text-[14px] text-text-1 bg-[#fafafa] outline-none transition-all w-full
  focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)] focus:ring-1 focus:ring-orange
  placeholder:text-text-4`;

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
      className={`border-0 rounded-lg px-3.5 py-3
        text-[14px] text-text-1 bg-[#fafafa] outline-none transition-all w-full h-20 resize-none
        focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)] focus:ring-1 focus:ring-orange
        placeholder:text-text-4 ${className}`}
      {...props}
    />
  );
}

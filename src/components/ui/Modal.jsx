import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={`bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,.15)]
          ${wide ? 'sm:w-[780px]' : 'sm:w-[680px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-4 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-border flex items-center justify-between">
            <span className="text-[15px] sm:text-[17px] font-bold text-text-1">{title}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-page-bg border-none rounded-lg cursor-pointer flex items-center justify-center text-text-3 hover:bg-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-4 sm:px-7 py-4 sm:py-6">{children}</div>
        {footer && (
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-t border-border flex justify-between gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}

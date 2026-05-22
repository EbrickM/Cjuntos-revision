import { useState } from 'react';

export default function UploadZone({ label = 'Subir archivo', hint = 'PDF, JPG · máx 5 MB' }) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div
      onClick={() => setUploaded(true)}
      className={`border-2 rounded-[12px] p-6 text-center cursor-pointer transition-all
        ${uploaded
          ? 'border-solid border-green-border bg-green-bg'
          : 'border-dashed border-input-border bg-page-bg hover:border-orange hover:bg-orange-tint'
        }`}
    >
      {uploaded ? (
        <>
          <div className="text-3xl mb-2">✅</div>
          <div className="text-[13px] font-semibold text-green-text">Archivo cargado · 2.4 MB</div>
        </>
      ) : (
        <>
          <div className="text-3xl mb-2">📄</div>
          <div className="text-[14px] font-semibold text-text-1 mb-1">{label}</div>
          <div className="text-[12px] text-text-4">{hint}</div>
        </>
      )}
    </div>
  );
}

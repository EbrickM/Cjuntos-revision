import { useState } from 'react';
import { CheckCircle2, FileText } from 'lucide-react';

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
          <CheckCircle2 className="w-8 h-8 text-green-text mx-auto mb-2" />
          <div className="text-[13px] font-semibold text-green-text">Archivo cargado · 2.4 MB</div>
        </>
      ) : (
        <>
          <FileText className="w-8 h-8 text-text-4 mx-auto mb-2" />
          <div className="text-[14px] font-semibold text-text-1 mb-1">{label}</div>
          <div className="text-[12px] text-text-4">{hint}</div>
        </>
      )}
    </div>
  );
}

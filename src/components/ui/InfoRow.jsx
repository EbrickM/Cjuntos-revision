// ── InfoRow genérico (antes duplicado en provShared/contratanteShared) ────────
export default function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-[13px] text-text-1">{value || '—'}</div>
    </div>
  );
}
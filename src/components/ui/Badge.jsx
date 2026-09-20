// Paleta de estados alineada con el Anexo Digital MIC v1.0 (descripcion de
// diseño.txt): cada estado del flujo mapea a una variante distinta para poder
// distinguirlos de un vistazo. `yellow` no es alias de `amber`: tiene su propio
// tono oliva-dorado para que dos estados nunca compartan el mismo color.
const variants = {
  green:  'bg-green-bg text-green-text before:bg-green',              // Éxito MIC      #2E7D5B
  amber:  'bg-yellow-bg text-yellow-text before:bg-yellow',           // Proceso MIC    #C68A1D
  yellow: 'bg-[#F7F0C8] text-[#846A00] before:bg-[#846A00]',         // Aviso oliva     #846A00
  orange: 'bg-orange-tint text-orange-dark before:bg-orange-dark',   // Naranja CTA    #EF7A2C
  terra:  'bg-terra-bg text-terra before:bg-terra',                   // Naranja marca  #E04E14
  brand:  'bg-brand-bg text-brand-red before:bg-brand-red',           // Rojo Bonafide  #E0201C
  red:    'bg-red-bg text-red-text before:bg-red',                    // Rojo Error MIC #B8352A
  gray:   'bg-gray-bg text-gray-text before:bg-gray-text',            // Gris marca MIC #5B5B5F
  ink:    'bg-ink-bg text-ink-text before:bg-ink-text',               // Tinta MIC      #26262B
  muted:  'bg-muted-bg text-muted-text before:bg-muted-text',         // Gris suave MIC #A9A6A1
  blue:   'bg-blue-bg text-blue-text before:bg-blue-text',            // OK informativo
  gold:   'bg-gold-bg text-gold before:bg-gold',                      // Transición/OTP #D99E07
  copper: 'bg-copper-bg text-copper before:bg-copper',                // Fondeo         #8A4A1F
  slate:  'bg-slate-bg text-slate-text before:bg-slate-text',         // Neutro frío    #55606E
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

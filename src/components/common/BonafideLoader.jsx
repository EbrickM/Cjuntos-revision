import isotipo   from '../../assets/isotipo-blanco.webp';
import logoTexto from '../../assets/logo-texto-blanco.webp';

// Animación de carga de marca — usada tanto en el splash de "/" (Splash.jsx)
// como en el gate de arranque de App.jsx que se muestra al recargar
// cualquier página, para que ambas luzcan exactamente igual.
export default function BonafideLoader() {
  return (
    <div className="bona-gradient-bg min-h-screen flex flex-col items-center justify-center gap-6">
      <img
        src={isotipo}
        alt=""
        fetchPriority="high"
        className="w-32 h-32 sm:w-44 sm:h-44 object-contain"
        style={{ animation: 'spin 1.2s linear infinite' }}
      />

      <img
        src={logoTexto}
        alt="Bonafide"
        className="w-56 sm:w-72 object-contain"
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

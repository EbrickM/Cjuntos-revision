import bonafideLogo from '../../assets/bonafide-logo.png';

export default function Logo({ size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0">
      <img
        src={bonafideLogo}
        className="h-15 w-auto object-contain block"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'inline-flex';
        }}
        alt="Creciendo Juntos"
      />
      <span
        style={{ display: 'none', fontSize: size }}
        className="items-center font-extrabold tracking-tight"
      >
        <span className="text-text-1">Creciendo</span>
        <span className="text-orange"> Juntos</span>
      </span>
    </span>
  );
}

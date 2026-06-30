import bonafideLogo from '../../assets/logo-color.webp';

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-0">
      <img
        src={bonafideLogo}
        className="h-14 w-auto object-contain block"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'inline-flex';
        }}
        alt="Creciendo Juntos"
      />
    </span>
  );
}

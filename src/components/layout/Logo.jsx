import bmoriLogo from '../../assets/bmori_logo.png';

export default function Logo({ size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0">
      <img
        src={bmoriLogo}
        style={{ height: Math.round(size * 1.8) }}
        className="block"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'inline-flex';
        }}
        alt="B-Morï"
      />
      <span
        style={{ display: 'none', fontSize: size }}
        className="items-center font-extrabold tracking-tight"
      >
        <span className="text-text-1">B-MOR</span>
        <span className="text-orange">i</span>
      </span>
    </span>
  );
}

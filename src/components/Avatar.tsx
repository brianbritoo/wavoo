import Image from 'next/image';

export function Avatar({ name, src, size=56 }: { name?: string | null; src?: string | null; size?: number }) {
  const initial = (name?.trim()?.[0] || '?').toUpperCase();
  if (src) {
    return (
      <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <Image src={src} alt={name || 'avatar'} width={size} height={size} className="object-cover" />
      </div>
    );
  }
  return (
    <div className="rounded-full bg-gray-200 flex items-center justify-center"
      style={{ width: size, height: size }}>
      <span className="font-semibold">{initial}</span>
    </div>
  );
}

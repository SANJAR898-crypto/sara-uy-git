interface LogoProps {
  size?: number;
  variant?: "mark" | "full" | "white";
  className?: string;
}

/**
 * Sara Uylar emblem — three stylised towers rising behind a home silhouette,
 * rendered on the brand blue (#0082D5). This vector recreation matches the
 * official Sara Uylar identity and scales cleanly at any resolution.
 */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/25 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 400 400" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M140,240 L140,140 L170,120 L170,240 Z" fill="white" />
        <path d="M185,240 L185,85 L215,60 L215,85 L215,240 Z" fill="white" />
        <path d="M230,240 L230,120 L260,140 L260,240 Z" fill="white" />
        <path d="M86,238 L200,185 L314,238 L300,242 L200,196 L100,242 Z" fill="white" />
        <rect x="187" y="210" width="10" height="10" fill="white" />
        <rect x="203" y="210" width="10" height="10" fill="white" />
      </svg>
    </div>
  );
}

export default function Logo({ size = 40, variant = "full", className = "" }: LogoProps) {
  if (variant === "mark") return <LogoMark size={size} className={className} />;

  const textColor = variant === "white" ? "text-white" : "text-ink-900";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <div className="flex flex-col leading-none">
        <span className={`text-[15px] font-extrabold tracking-tight ${textColor}`}>Sara Uylar</span>
        <span className="text-[11px] font-medium text-ink-400">Ko&apos;chmas mulk platformasi</span>
      </div>
    </div>
  );
}

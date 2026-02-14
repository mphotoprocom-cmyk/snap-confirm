interface SectionBackgroundConfig {
  image_url: string;
  opacity: number;
}

interface SectionWithBackgroundProps {
  sectionKey: string;
  backgrounds?: Record<string, SectionBackgroundConfig>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function SectionWithBackground({
  sectionKey,
  backgrounds,
  className = '',
  style = {},
  children,
}: SectionWithBackgroundProps) {
  const bg = backgrounds?.[sectionKey];

  return (
    <section className={`relative ${className}`} style={style}>
      {bg?.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bg.image_url})`,
            opacity: bg.opacity ?? 0.3,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

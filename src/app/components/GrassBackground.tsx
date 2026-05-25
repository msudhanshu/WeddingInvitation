export function GrassBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div
        className="h-full w-full"
        style={{
          background: `
            linear-gradient(135deg, #7cb587 0%, #8fb899 25%, #a3c9ab 50%, #8fb899 75%, #7cb587 100%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
          `,
        }}
      />
    </div>
  );
}

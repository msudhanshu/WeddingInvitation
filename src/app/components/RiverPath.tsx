import { LAYER_ASSETS } from '../layerAssets';
import { ImageWithFallback } from './ImageWithFallback';

export function RiverPath() {
  return (
    <div className="river-path-layer pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <ImageWithFallback
        src={LAYER_ASSETS.river}
        alt=""
        draggable={false}
        className="h-full w-full object-cover object-center mix-blend-screen select-none opacity-[0.95]"
      />
      <style>{`
        @keyframes invite-river-shimmer {
          0%,
          100% {
            filter: brightness(1) contrast(1);
          }
          50% {
            filter: brightness(1.08) contrast(1.04);
          }
        }
        .river-path-layer img {
          animation: invite-river-shimmer 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

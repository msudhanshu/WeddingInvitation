import { LAYER_ASSETS } from '../layerAssets';
import { ImageWithFallback } from './ImageWithFallback';

/** Full-bleed forest / valley artwork (replaces per-tree sprites). */
export function ForestBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <ImageWithFallback
        src={LAYER_ASSETS.forestBackground}
        alt=""
        draggable={false}
        className="h-full w-full object-cover object-center select-none"
      />
    </div>
  );
}

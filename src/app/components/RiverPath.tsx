import React from 'react';
import { LAYER_ASSETS } from '../layerAssets';
import { RiverWaterShader } from './RiverWaterShader';

/** Winding river plate; WebGL fragment shader warps + glints the texture (falls back to static PNG). */
export function RiverPath() {
  return (
    <div className="invite-river-mount absolute inset-0 z-10 mix-blend-soft-light opacity-[0.84]">
      <RiverWaterShader
        textureSrc={LAYER_ASSETS.river}
        imgClassName="h-full w-full object-cover object-center select-none"
      />
    </div>
  );
}

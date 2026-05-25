/**
 * Image assets for the parallax-style scene. Replace files under /public/layers/
 * with your own PNG/WebP/JPEG artwork (recommended: PNG with transparency for
 * river, flower, and boat overlays).
 */
export const LAYER_ASSETS = {
  /** Portrait forest / valley plate (covers the frame under the river overlay) */
  forestBackground: '/layers/forest-bg.png',
  /** Full-bleed winding river plate (use alpha PNG, or black mat + `mix-blend-screen` in RiverPath) */
  river: '/layers/river-bg.png',
  /**
   * One image per river lotus: `[leg1 … leg4]` (4th is usually **wedding** near groom house).
   * Reuse paths until you drop in `flower4.png`.
   */
  flowers: ['/layers/flower1.png', '/layers/flower2.png', '/layers/flower3.png', '/layers/flower4.png'] as const,
  boat: '/layers/boat.png',
} as const;

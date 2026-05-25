import type { ReactNode } from 'react';

/**
 * Full-viewport "letterbox" around a portrait-width invite (max 480px wide).
 * Wider browsers see texture outside the panel; phone landscape insets a tall 9:16 slice.
 */
export function MobileInviteShell({ children }: { children: ReactNode }) {
  return (
    <div className="invite-chrome flex min-h-[100dvh] w-full flex-col items-center justify-center">
      <div className="invite-scene-root relative z-10 overflow-hidden bg-[#8fb899]">{children}</div>
    </div>
  );
}

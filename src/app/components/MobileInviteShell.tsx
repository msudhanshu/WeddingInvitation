import type { ReactNode } from 'react';

export function MobileInviteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="invite-desktop-only-message fixed inset-0 z-[100] flex-col items-center justify-center gap-3 bg-zinc-900 p-8 text-center text-white">
        <p className="text-lg font-medium">This invitation is designed for phones.</p>
        <p className="text-sm text-zinc-400">Open this link on your mobile device in portrait mode.</p>
      </div>

      <div className="invite-rotate-message fixed inset-0 z-[100] flex-col items-center justify-center gap-3 bg-zinc-900 p-8 text-center text-white">
        <p className="text-lg font-medium">Rotate your phone</p>
        <p className="text-sm text-zinc-400">This experience works best in portrait mode.</p>
      </div>

      <div className="invite-scene-root relative mx-auto h-[100dvh] w-full max-w-[480px] overflow-hidden bg-[#8fb899] shadow-2xl">
        {children}
      </div>
    </>
  );
}

import { useState } from 'react';

// Vite replaces BASE_URL with the configured deployment base path at build time.
const INTRO_VIDEO_URL = `${import.meta.env.BASE_URL}var-hr-intro.mp4`;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      aria-label="VAR HR introduction"
      role="status"
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#071a33]"
    >
      {/* Desktop-only cinematic backdrop; the original portrait video stays uncropped in front. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-35 blur-2xl md:block"
      >
        <source src={INTRO_VIDEO_URL} type="video/mp4" />
      </video>

      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setVisible(false)}
        onError={() => setVisible(false)}
        className="relative z-10 h-full w-full object-contain md:h-[92vh] md:w-auto md:max-w-[90vw] md:rounded-xl md:shadow-2xl"
      >
        <source src={INTRO_VIDEO_URL} type="video/mp4" />
      </video>
    </div>
  );
}

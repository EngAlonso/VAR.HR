import { useEffect, useState } from 'react';

const INTRO_VIDEO_URL = '/var-hr-intro.mp4';

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setPlayKey((current) => current + 1);
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="VAR HR introduction"
      role="status"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#071a33]"
    >
      <video
        key={playKey}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setVisible(false)}
        onError={() => setVisible(false)}
        className="h-full w-full object-contain"
      >
        <source src={INTRO_VIDEO_URL} type="video/mp4" />
      </video>
    </div>
  );
}

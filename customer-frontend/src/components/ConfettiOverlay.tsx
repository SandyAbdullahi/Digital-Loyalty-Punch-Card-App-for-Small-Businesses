import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type ConfettiOverlayProps = {
  visible: boolean;
  onComplete?: () => void;
};

const ConfettiOverlay = ({ visible, onComplete }: ConfettiOverlayProps) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const confettiPieces = useMemo(() => Array.from({ length: 80 }), []);

  useEffect(() => {
    if (!visible || prefersReducedMotion) return undefined;
    const timer = window.setTimeout(() => onComplete?.(), 1000);
    return () => window.clearTimeout(timer);
  }, [visible, onComplete, prefersReducedMotion]);

  if (!visible || prefersReducedMotion) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      {confettiPieces.map((_, index) => (
        <span
          key={index}
          className="absolute top-0 left-1/2 w-2 h-6 rounded-full"
          style={{
            transform: `translate3d(${(index - 40) * 10}px, 0, 0)`,
            background:
              index % 3 === 0
                ? 'var(--rudi-teal)'
                : index % 3 === 1
                ? 'var(--rudi-yellow)'
                : 'var(--rudi-coral)',
            animation: `confetti-fall 1s ease-out forwards`,
            animationDelay: `${index * 10}ms`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translate3d(0, -10%, 0) rotate(0deg);
              opacity: 0;
            }
            20% { opacity: 1; }
            100% {
              transform: translate3d(0, 110vh, 0) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>,
    document.body
  );
};

export default ConfettiOverlay;

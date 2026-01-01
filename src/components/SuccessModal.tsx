import { useEffect, useRef } from 'preact/hooks';
import { useTranslation } from '../i18n';

interface SuccessModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  elapsedTime?: number;
}

// Format seconds as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SuccessModal({ isOpen, onPlayAgain, elapsedTime }: SuccessModalProps) {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      // Focus the button when modal opens
      buttonRef.current?.focus();
    }

    return () => {
      // Restore focus when modal closes
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onPlayAgain();
    }
    // Focus trap: Tab cycles within modal (only one focusable element)
    if (e.key === 'Tab') {
      e.preventDefault();
      buttonRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black/15 flex items-center justify-center z-[1000] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      onKeyDown={handleKeyDown}
    >
      <div class="bg-white px-12 py-10 border-2 border-black text-center max-w-[90%] w-80 animate-slide-up">
        <h2 id="modal-title" class="font-serif text-[1.75rem] font-bold text-black mb-3">{t('congratulations')}</h2>
        <p id="modal-message" class="font-serif text-base text-gray-700 mb-4">{t('puzzleSolved')}</p>
        {elapsedTime !== undefined && (
          <p class="font-mono text-base text-gray-700 mb-6">
            {t('yourTime')}: <strong class="text-xl text-black">{formatTime(elapsedTime)}</strong>
          </p>
        )}
        <button
          ref={buttonRef}
          class="px-8 py-3 text-base font-medium border border-black bg-black text-white cursor-pointer transition-all duration-150 font-sans hover:bg-gray-800 active:bg-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          onClick={onPlayAgain}
        >
          {t('playAgain')}
        </button>
      </div>
    </div>
  );
}

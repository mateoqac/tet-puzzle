import { useEffect, useRef } from 'preact/hooks';
import './SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
}

export default function SuccessModal({ isOpen, onPlayAgain }: SuccessModalProps) {
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
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      onKeyDown={handleKeyDown}
    >
      <div class="modal-content">
        <h2 id="modal-title" class="modal-title">Congratulations!</h2>
        <p id="modal-message" class="modal-message">You solved the puzzle correctly!</p>
        <button
          ref={buttonRef}
          class="modal-btn"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

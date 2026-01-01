import { useEffect, useRef } from 'preact/hooks';
import { useTranslation } from '../i18n';

interface TimerProps {
  elapsedTime: number;
  isRunning: boolean;
  onTick: () => void;
}

// Format seconds as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Timer({ elapsedTime, isRunning, onTick }: TimerProps) {
  const { t } = useTranslation();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        onTick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick]);

  return (
    <div
      class="inline-flex items-center gap-1.5 font-mono text-base text-gray-700 px-2 py-1 bg-gray-100 rounded border border-gray-300"
      role="timer"
      aria-live="off"
      aria-label={t('time')}
    >
      <span class="flex items-center text-gray-500" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
      <span class="font-medium min-w-14 text-center">{formatTime(elapsedTime)}</span>
    </div>
  );
}

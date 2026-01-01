import { useTranslation } from '../i18n';
import type { GameStats } from '../lib/statistics';

interface ShareButtonProps {
  stats: GameStats;
}

export default function ShareButton({ stats }: ShareButtonProps) {
  const { t } = useTranslation();

  const totalPlayed =
    stats.gamesPlayed.easy + stats.gamesPlayed.moderate + stats.gamesPlayed.difficult;
  const totalWon = stats.gamesWon.easy + stats.gamesWon.moderate + stats.gamesWon.difficult;

  const generateShareText = () => {
    const lines = [
      'Tetonor Stats',
      `Games: ${totalPlayed} | Won: ${totalWon}`,
      `Streak: ${stats.currentStreak} | Best: ${stats.longestStreak}`,
      '',
      'Play at tetonor.app',
    ];
    return lines.join('\n');
  };

  const handleShare = () => {
    const text = generateShareText();
    const url = 'https://tetonor.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleShare}
      class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span>{t('share')}</span>
    </button>
  );
}

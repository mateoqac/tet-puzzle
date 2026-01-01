import { useTranslation } from '../i18n';

interface FooterProps {
  showLegalLinks?: boolean;
}

export default function Footer({ showLegalLinks = true }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer class="mt-12 py-6 px-4 border-t border-gray-200 text-center">
      <div class="max-w-[800px] mx-auto">
        <nav class="mb-3">
          <a href="/how-to-play" class="text-gray-500 text-sm no-underline hover:underline hover:text-gray-700">
            {t('footerHowToPlay')}
          </a>
          <span class="text-gray-300 mx-3">|</span>
          <a href="/faq" class="text-gray-500 text-sm no-underline hover:underline hover:text-gray-700">
            {t('footerFaq')}
          </a>
          {showLegalLinks && (
            <>
              <span class="text-gray-300 mx-3">|</span>
              <a href="/privacy" class="text-gray-500 text-sm no-underline hover:underline hover:text-gray-700">
                {t('footerPrivacy')}
              </a>
              <span class="text-gray-300 mx-3">|</span>
              <a href="/terms" class="text-gray-500 text-sm no-underline hover:underline hover:text-gray-700">
                {t('footerTerms')}
              </a>
            </>
          )}
        </nav>
        <p class="text-gray-400 text-sm m-0">
          {t('footerCopyright')}
        </p>
      </div>
    </footer>
  );
}

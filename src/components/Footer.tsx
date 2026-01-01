import { useTranslation } from '../i18n';

export default function Footer() {
  const { t } = useTranslation();

  const links = [
    { href: '/', label: t('footerDailyChallenge') },
    { href: '/daily/archive', label: t('footerArchive') },
    { href: '/how-to-play', label: t('footerHowToPlay') },
    { href: '/faq', label: t('footerFaq') },
    { href: '/privacy', label: t('footerPrivacy') },
    { href: '/terms', label: t('footerTerms') },
    { href: '/cookies', label: t('footerCookies') },
  ];

  return (
    <footer class="max-w-[800px] mx-auto mt-12 py-6 px-4 border-t border-gray-200 text-center">
      <div>
        <nav class="mb-3 flex flex-wrap justify-center gap-x-1 gap-y-2">
          {links.map((link, index) => (
            <>
              <a
                key={link.href}
                href={link.href}
                class="text-gray-500 text-sm no-underline hover:underline hover:text-gray-700 whitespace-nowrap"
              >
                {link.label}
              </a>
              {index < links.length - 1 && (
                <span class="text-gray-300">|</span>
              )}
            </>
          ))}
        </nav>
        <p class="text-gray-400 text-sm m-0">
          {t('footerCopyright')}
        </p>
      </div>
    </footer>
  );
}

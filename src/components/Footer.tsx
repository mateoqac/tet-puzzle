import { useTranslation } from '../i18n';

export default function Footer() {
  const { t, language } = useTranslation();
  const basePath = language === 'es' ? '/es' : '';

  const links = [
    { href: `${basePath}/`, label: t('footerDailyChallenge') },
    { href: `${basePath}/daily/archive/`, label: t('footerArchive') },
    { href: `${basePath}/how-to-play/`, label: t('footerHowToPlay') },
    { href: `${basePath}/faq/`, label: t('footerFaq') },
    { href: `${basePath}/privacy/`, label: t('footerPrivacy') },
    { href: `${basePath}/terms/`, label: t('footerTerms') },
    { href: `${basePath}/cookies/`, label: t('footerCookies') },
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
                class="text-gray-600 text-sm no-underline hover:underline hover:text-gray-700 whitespace-nowrap"
              >
                {link.label}
              </a>
              {index < links.length - 1 && (
                <span class="text-gray-300">|</span>
              )}
            </>
          ))}
        </nav>
        <p class="text-gray-500 text-sm m-0">
          {t('footerCopyright')}
        </p>
      </div>
    </footer>
  );
}

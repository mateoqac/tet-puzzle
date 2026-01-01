import { I18nContext, useI18n, useTranslation } from '../i18n';
import Footer from './Footer';

function CookiesInner() {
  const { t } = useTranslation();

  return (
    <main class="max-w-[800px] mx-auto py-8 px-4">
      <nav class="mb-8">
        <a href="/" class="text-gray-700 no-underline text-base hover:underline">
          {t('backToGame')}
        </a>
      </nav>

      <article>
        <h1 class="text-[2rem] mb-1 text-black font-serif">{t('cookiesTitle')}</h1>
        <p class="text-gray-500 text-lg mb-8">{t('cookiesSubtitle')}</p>

        <p class="text-gray-600 leading-relaxed mb-8">{t('cookiesIntro')}</p>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('cookiesWhat')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('cookiesWhatDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('cookiesHow')}</h2>
          <p class="text-gray-600 leading-relaxed mb-4">{t('cookiesHowDesc')}</p>

          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-black mb-2">{t('cookiesEssential')}</h3>
              <p class="text-gray-600 text-sm">{t('cookiesEssentialDesc')}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-black mb-2">{t('cookiesAnalytics')}</h3>
              <p class="text-gray-600 text-sm">{t('cookiesAnalyticsDesc')}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-black mb-2">{t('cookiesAds')}</h3>
              <p class="text-gray-600 text-sm">{t('cookiesAdsDesc')}</p>
            </div>
          </div>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('cookiesManage')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('cookiesManageDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('cookiesChanges')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('cookiesChangesDesc')}</p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl text-black mb-3 font-serif">{t('cookiesContact')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('cookiesContactDesc')}</p>
        </section>

        <div class="text-center mt-8 pt-4">
          <a
            href="/"
            class="inline-block px-8 py-3 bg-black text-white no-underline font-medium border border-black transition-all hover:bg-gray-800"
          >
            {t('playNow')}
          </a>
        </div>
      </article>

      <Footer />
    </main>
  );
}

export default function CookiesContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <CookiesInner />
    </I18nContext.Provider>
  );
}

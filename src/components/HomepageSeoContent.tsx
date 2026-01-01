import { I18nContext, useI18n, useTranslation } from '../i18n';

function SeoContentInner() {
  const { t } = useTranslation();

  return (
    <div class="max-w-[800px] mx-auto mt-12 px-4">
      {/* How to Play Section */}
      <section class="mb-10 pb-8 border-b border-gray-200">
        <h2 class="text-2xl font-serif text-black mb-4">{t('seoHowToPlay')}</h2>
        <p class="text-gray-600 leading-relaxed mb-4">{t('seoHowToPlayDesc')}</p>
        <ul class="text-gray-600 ml-6 space-y-2 list-disc">
          <li>{t('seoHowToPlayStep1')}</li>
          <li>{t('seoHowToPlayStep2')}</li>
          <li>{t('seoHowToPlayStep3')}</li>
          <li>{t('seoHowToPlayStep4')}</li>
        </ul>
        <a href="/how-to-play" class="inline-block mt-4 text-black underline hover:text-gray-600">
          {t('seoLearnMore')}
        </a>
      </section>

      {/* Rules Section */}
      <section class="mb-10 pb-8 border-b border-gray-200">
        <h2 class="text-2xl font-serif text-black mb-4">{t('seoRules')}</h2>
        <div class="bg-gray-50 p-5 border border-gray-200">
          <p class="text-gray-700 font-medium text-center">{t('seoRulesMain')}</p>
        </div>
        <p class="text-gray-600 leading-relaxed mt-4">{t('seoRulesDesc')}</p>
      </section>

      {/* FAQ Section */}
      <section class="mb-10">
        <h2 class="text-2xl font-serif text-black mb-4">{t('seoFaq')}</h2>
        <div class="space-y-4">
          <details class="border border-gray-200 group">
            <summary class="p-4 cursor-pointer font-medium text-black list-none flex items-center justify-between">
              <span>{t('seoFaqQ1')}</span>
              <span class="text-gray-400 group-open:hidden">+</span>
              <span class="text-gray-400 hidden group-open:inline">-</span>
            </summary>
            <div class="px-4 pb-4">
              <p class="text-gray-600">{t('seoFaqA1')}</p>
            </div>
          </details>
          <details class="border border-gray-200 group">
            <summary class="p-4 cursor-pointer font-medium text-black list-none flex items-center justify-between">
              <span>{t('seoFaqQ2')}</span>
              <span class="text-gray-400 group-open:hidden">+</span>
              <span class="text-gray-400 hidden group-open:inline">-</span>
            </summary>
            <div class="px-4 pb-4">
              <p class="text-gray-600">{t('seoFaqA2')}</p>
            </div>
          </details>
          <details class="border border-gray-200 group">
            <summary class="p-4 cursor-pointer font-medium text-black list-none flex items-center justify-between">
              <span>{t('seoFaqQ3')}</span>
              <span class="text-gray-400 group-open:hidden">+</span>
              <span class="text-gray-400 hidden group-open:inline">-</span>
            </summary>
            <div class="px-4 pb-4">
              <p class="text-gray-600">{t('seoFaqA3')}</p>
            </div>
          </details>
        </div>
        <a href="/faq" class="inline-block mt-4 text-black underline hover:text-gray-600">
          {t('seoViewAllFaq')}
        </a>
      </section>
    </div>
  );
}

export default function HomepageSeoContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <SeoContentInner />
    </I18nContext.Provider>
  );
}

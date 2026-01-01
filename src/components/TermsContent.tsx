import { I18nContext, useI18n, useTranslation } from '../i18n';
import Footer from './Footer';

function TermsInner() {
  const { t } = useTranslation();

  return (
    <main class="max-w-[800px] mx-auto py-8 px-4">
      <nav class="mb-8">
        <a href="/" class="text-gray-700 no-underline text-base hover:underline">
          {t('backToGame')}
        </a>
      </nav>

      <article>
        <h1 class="text-[2rem] mb-1 text-black font-serif">{t('termsTitle')}</h1>
        <p class="text-gray-500 text-lg mb-8">{t('termsSubtitle')}</p>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsAgreement')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsAgreementDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsDescription')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsDescriptionDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsUse')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('termsUseDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('termsUseItem1')}</li>
            <li>{t('termsUseItem2')}</li>
            <li>{t('termsUseItem3')}</li>
            <li>{t('termsUseItem4')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsIP')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsIPDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsAds')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsAdsDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsDisclaimer')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('termsDisclaimerDesc')}</p>
          <p class="text-gray-600 leading-relaxed mb-3">{t('termsDisclaimerDesc2')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('termsDisclaimerItem1')}</li>
            <li>{t('termsDisclaimerItem2')}</li>
            <li>{t('termsDisclaimerItem3')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsLiability')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsLiabilityDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsIndemnification')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsIndemnificationDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsChanges')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsChangesDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsGoverning')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsGoverningDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsSeverability')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsSeverabilityDesc')}</p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl text-black mb-3 font-serif">{t('termsContact')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('termsContactDesc')}</p>
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

export default function TermsContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <TermsInner />
    </I18nContext.Provider>
  );
}

import { I18nContext, useI18n, useTranslation } from '../i18n';
import Footer from './Footer';

function PrivacyInner() {
  const { t } = useTranslation();

  return (
    <main class="max-w-[800px] mx-auto py-8 px-4">
      <nav class="mb-8">
        <a href="/" class="text-gray-700 no-underline text-base hover:underline">
          {t('backToGame')}
        </a>
      </nav>

      <article>
        <h1 class="text-[2rem] mb-1 text-black font-serif">{t('privacyTitle')}</h1>
        <p class="text-gray-500 text-lg mb-8">{t('privacySubtitle')}</p>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyIntro')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('privacyIntroDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyInfoCollect')}</h2>

          <h3 class="font-medium text-black mb-2 mt-4">{t('privacyAutoCollect')}</h3>
          <p class="text-gray-600 leading-relaxed mb-3">{t('privacyAutoCollectDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2 mb-4">
            <li>{t('privacyAutoItem1')}</li>
            <li>{t('privacyAutoItem2')}</li>
            <li>{t('privacyAutoItem3')}</li>
            <li>{t('privacyAutoItem4')}</li>
            <li>{t('privacyAutoItem5')}</li>
          </ul>

          <h3 class="font-medium text-black mb-2 mt-4">{t('privacyCookiesTech')}</h3>
          <p class="text-gray-600 leading-relaxed mb-3">{t('privacyCookiesTechDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('privacyCookieItem1')}</li>
            <li>{t('privacyCookieItem2')}</li>
            <li>{t('privacyCookieItem3')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyThirdParty')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('privacyThirdPartyDesc1')}</p>
          <p class="text-gray-600 leading-relaxed mb-3">
            {t('privacyThirdPartyDesc2')}{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="text-black underline">
              {t('privacyGoogleAdsSettings')}
            </a>.
          </p>
          <p class="text-gray-600 leading-relaxed">
            {t('privacyThirdPartyDesc3')}{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="text-black underline">
              {t('privacyGooglePrivacy')}
            </a>.
          </p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyHowWeUse')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('privacyHowWeUseDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('privacyUseItem1')}</li>
            <li>{t('privacyUseItem2')}</li>
            <li>{t('privacyUseItem3')}</li>
            <li>{t('privacyUseItem4')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacySecurity')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('privacySecurityDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyRights')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('privacyRightsDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('privacyRightsItem1')}</li>
            <li>{t('privacyRightsItem2')}</li>
            <li>{t('privacyRightsItem3')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyChildren')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('privacyChildrenDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyChanges')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('privacyChangesDesc')}</p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl text-black mb-3 font-serif">{t('privacyContact')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('privacyContactDesc')}</p>
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

export default function PrivacyContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <PrivacyInner />
    </I18nContext.Provider>
  );
}

import { I18nContext, useI18n, useTranslation } from '../i18n';
import Footer from './Footer';

function HowToPlayInner() {
  const { t } = useTranslation();

  return (
    <main class="max-w-[800px] mx-auto py-8 px-4">
      <nav class="mb-8">
        <a href="/" class="text-gray-700 no-underline text-base hover:underline">
          {t('backToGame')}
        </a>
      </nav>

      <article>
        <h1 class="text-[2rem] mb-1 text-black font-serif">{t('howToPlayTitle')}</h1>
        <p class="text-gray-500 text-lg mb-8">{t('howToPlaySubtitle')}</p>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">1. {t('htpGrid')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('htpGridDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">2. {t('htpStrip')}</h2>
          <p class="text-gray-600 leading-relaxed">{t('htpStripDesc')}</p>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">3. {t('htpFill')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('htpFillDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('htpFillItem1')}</li>
            <li>{t('htpFillItem2')}</li>
            <li>{t('htpFillItem3')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">4. {t('htpKeyRule')}</h2>
          <div class="bg-gray-50 border-2 border-black p-5 mt-2">
            <p class="m-0 text-center font-medium">{t('htpKeyRuleDesc')}</p>
          </div>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">5. {t('htpExample')}</h2>
          <p class="text-gray-600 leading-relaxed mb-3">{t('htpExampleDesc')}</p>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('htpExampleItem1')}</li>
            <li>{t('htpExampleItem2')}</li>
          </ul>
        </section>

        <section class="mb-8 pb-6 border-b border-gray-100">
          <h2 class="text-xl text-black mb-3 font-serif">6. {t('htpDifficulty')}</h2>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('htpEasy')}</li>
            <li>{t('htpModerate')}</li>
            <li>{t('htpDifficult')}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl text-black mb-3 font-serif">7. {t('htpTips')}</h2>
          <ul class="text-gray-600 ml-6 space-y-2">
            <li>{t('htpTip1')}</li>
            <li>{t('htpTip2')}</li>
            <li>{t('htpTip3')}</li>
            <li>{t('htpTip4')}</li>
          </ul>
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

export default function HowToPlayContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <HowToPlayInner />
    </I18nContext.Provider>
  );
}

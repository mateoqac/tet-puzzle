import { I18nContext, useI18n, useTranslation, type TranslationKey } from '../i18n';
import Footer from './Footer';

function FaqInner() {
  const { t } = useTranslation();

  const faqs: Array<{ question: TranslationKey; answer: TranslationKey }> = [
    { question: 'faqQ1', answer: 'faqA1' },
    { question: 'faqQ2', answer: 'faqA2' },
    { question: 'faqQ3', answer: 'faqA3' },
    { question: 'faqQ4', answer: 'faqA4' },
    { question: 'faqQ5', answer: 'faqA5' },
    { question: 'faqQ6', answer: 'faqA6' },
    { question: 'faqQ7', answer: 'faqA7' },
    { question: 'faqQ8', answer: 'faqA8' },
    { question: 'faqQ9', answer: 'faqA9' },
    { question: 'faqQ10', answer: 'faqA10' },
  ];

  return (
    <main class="max-w-[800px] mx-auto py-8 px-4">
      <nav class="mb-8">
        <a href="/" class="text-gray-700 no-underline text-base hover:underline">
          {t('backToGame')}
        </a>
      </nav>

      <article>
        <h1 class="text-[2rem] mb-1 text-black font-serif">{t('faqTitle')}</h1>
        <p class="text-gray-500 text-lg mb-8">{t('faqSubtitle')}</p>

        <div class="mb-12 space-y-2">
          {faqs.map((faq, index) => (
            <details key={index} class="border border-gray-200 group open:border-black">
              <summary class="p-4 cursor-pointer font-medium text-black list-none flex items-start gap-3">
                <span class="bg-gray-100 text-gray-500 text-xs w-6 h-6 inline-flex items-center justify-center rounded-full shrink-0">
                  {index + 1}
                </span>
                <span class="flex-1">{t(faq.question)}</span>
                <span class="text-xl text-gray-400 shrink-0 group-open:hidden">+</span>
                <span class="text-xl text-gray-400 shrink-0 hidden group-open:inline">-</span>
              </summary>
              <div class="px-4 pb-4 pl-[3.25rem]">
                <p class="text-gray-600 leading-relaxed m-0">{t(faq.answer)}</p>
              </div>
            </details>
          ))}
        </div>

        <div class="text-center p-8 bg-gray-50 border border-gray-100">
          <h2 class="text-xl mb-3 text-black font-serif">{t('faqStillQuestions')}</h2>
          <p class="text-gray-500 mb-5">
            {t('faqCheckGuide').split('Cómo Jugar')[0]}
            <a href="/how-to-play" class="text-black underline">{t('footerHowToPlay')}</a>
            {t('faqCheckGuide').includes('How to Play')
              ? t('faqCheckGuide').split('How to Play')[1]
              : t('faqCheckGuide').split('Cómo Jugar')[1] || ''}
          </p>
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

export default function FaqContent() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <FaqInner />
    </I18nContext.Provider>
  );
}

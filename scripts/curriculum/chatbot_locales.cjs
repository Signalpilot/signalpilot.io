/* Every localised chatbot answers its own language's questions.
 *
 *     node scripts/curriculum/chatbot_locales.cjs
 *
 * chatbot_i18n.py checks the tables: the figures, the order of the keyword
 * list, and the four quick-action buttons. It cannot check the thing a reader
 * actually does, which is type a sentence, so this loads the real widget code
 * with each language file and asks a handful of ordinary questions in that
 * language. It caught four gaps the tables looked fine with: a Spanish and a
 * French trigger that carried the singular of a word the question used in the
 * plural, a Turkish one that carried a suffix the question did not, and an
 * Arabic one where the bare word for "work" sat inside "worksheets" and owned
 * it first.
 *
 * It also checks the two things a reader would notice immediately: that no
 * answer falls through to the English one, and that a lesson link lands in
 * their own tree rather than on the English page.
 */
const fs = require('fs');
const path = require('path').resolve(__dirname, '../..') + '/';
const src = fs.readFileSync(path + 'education/assets/chatbot.js', 'utf8');
const classSrc = src.slice(src.indexOf('class SignalPilotChatbot'),
                           src.indexOf('\n}\n', src.indexOf('class SignalPilotChatbot')) + 3);

const CASES = {
  de: [['Was kostet Trading?', 'cost'], ['Womit soll ich anfangen?', 'start'],
       ['Erklär den RSI', 'rsi'], ['Wie viele Trades bis ich es weiß?', 'expectancy'],
       ['Gibt es Stop-Jagden wirklich?', 'sweep'], ['Habt ihr Arbeitsblätter?', 'worksheets'],
       ['Kann ich vom Trading leben?', 'business'], ['Was ist ein Indikator?', 'indicators']],
  es: [['¿Qué cuesta operar?', 'cost'], ['¿Por dónde empiezo?', 'start'],
       ['Explica el RSI', 'rsi'], ['¿Cuántas operaciones hasta saberlo?', 'expectancy'],
       ['¿Existen las cazas de stops?', 'sweep'], ['¿Tenéis hojas de trabajo?', 'worksheets']],
  fr: [['Que coûte le trading ?', 'cost'], ['Par où commencer ?', 'start'],
       ['Explique le RSI', 'rsi'], ['Combien de trades avant de savoir ?', 'expectancy'],
       ['Les chasses aux stops existent ?', 'sweep'], ['Avez-vous des fiches de travail ?', 'worksheets']],
  it: [['Quanto costa fare trading?', 'cost'], ['Da dove comincio?', 'start'],
       ['Spiegami l’RSI', 'rsi'], ['Quante operazioni prima di saperlo?', 'expectancy'],
       ['Avete fogli di lavoro?', 'worksheets']],
  pt: [['Quanto custa negociar?', 'cost'], ['Por onde começo?', 'start'],
       ['Explica o RSI', 'rsi'], ['Têm folhas de trabalho?', 'worksheets']],
  nl: [['Wat kost traden?', 'cost'], ['Waar begin ik?', 'start'],
       ['Leg de RSI uit', 'rsi'], ['Hebben jullie werkbladen?', 'worksheets']],
  ru: [['Во что обходится торговля?', 'cost'],
       ['С чего начать?', 'start'],
       ['Объясни RSI', 'rsi'],
       ['Есть ли рабочие листы?', 'worksheets']],
  ja: [['トレードの費用は？', 'cost'],
       ['何から始めればいい？', 'start'],
       ['RSIを説明して', 'rsi'],
       ['ワークシートはありますか', 'worksheets']],
  tr: [['Trading neye mal olur?', 'cost'], ['Nereden başlamalıyım?', 'start'],
       ["RSI\u0131 anlat", 'rsi'], ['Çalışma sayfanız var mı?', 'worksheets']],
  hu: [['Mibe kerül a kereskedés?', 'cost'], ['Hol kezdjem?', 'start'],
       ['Magyarázd el az RSI-t', 'rsi'], ['Vannak munkalapjaitok?', 'worksheets']],
  ar: [['كم يكلّف التداول؟', 'cost'],
       ['من أين أبدأ؟', 'start'],
       ['اشرح RSI', 'rsi'],
       ['هل لديكم أوراق عمل؟', 'worksheets']],
};

let fail = 0, ran = 0;
for (const lang of Object.keys(CASES)) {
  const win = {};
  new Function('window', fs.readFileSync(path + 'education/assets/chatbot-i18n-' + lang + '.js', 'utf8'))(win);
  const C = new Function('window', classSrc + '\nreturn SignalPilotChatbot;')(win);
  const bot = Object.create(C.prototype);
  bot.lang = lang;
  bot.knowledgeBase = bot.initKnowledgeBase();
  bot.patterns = bot.initPatterns();
  for (const [q, want] of CASES[lang]) {
    ran++;
    const hit = bot.patterns.find(p => p.regex.test(q));
    const got = hit ? hit.key : null;
    if (got !== want) { fail++; console.log('  FAIL ' + lang + ': ' + q + ' -> ' + got + ', wanted ' + want); }
  }
  // every answer must be in the reader's language, not the English fallback
  const missing = Object.keys(bot.knowledgeBase).filter(k => !win.SP_CHATBOT_I18N.kb[lang][k]);
  if (missing.length) { fail++; console.log('  FAIL ' + lang + ': untranslated answers ' + missing.join(', ')); }
  // and its links must point into the reader's own tree
  const sample = bot.localiseLinks(bot.knowledgeBase.automation);
  if (!sample.includes('](/' + lang + '/education/')) { fail++; console.log('  FAIL ' + lang + ': links not localised'); }
  if (sample.includes('](/education/curriculum/')) { fail++; console.log('  FAIL ' + lang + ': a lesson link stayed English'); }
}
console.log(ran + ' localised questions routed, ' + fail + ' failures');
process.exit(fail ? 1 : 0);

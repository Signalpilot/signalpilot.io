# -*- coding: utf-8 -*-
"""Locale wording for the twelve education indexes, written by hand.

Everything here that names a lesson, a count or a tier boundary is computed
from the corpus by hubs.py. What lives in this file is only the wording that
cannot be derived: the four tier headings, the four blurbs under them, and the
handful of labels around the generated lists.

The tier names are not invented here either. They are the names the locale's
own lesson pages already print in their badges -- Mittelstufe, Intermédiaire,
Средний уровень -- so the index cannot call a tier something the lessons do
not. The index pages had drifted to the pre-renumber names (Institutionelle
Stufe, Fejlett szint) and to English lesson titles, which is what this fixes.

Format slots: {n} lessons, {w} words, {a}-{b} hours, {tier} tier name,
{last} the previous tier's last slot, {lo}-{hi} a module's slot range,
{k} the number of titles a panel did not list.
"""

# Thousands separator per locale. Decimal points do not occur on this page.
GROUP = {'de': '.', 'es': '.', 'fr': ' ', 'it': '.', 'pt': '.', 'nl': '.',
         'ru': ' ', 'ja': ',', 'tr': '.', 'hu': ' ', 'ar': ','}

# The badge glyphs the English index uses, in tier order.
DOT = ['\U0001F7E2', '\U0001F7E1', '&#128992;', '\U0001F534']

# What separates a tier's name from its subtitle in the heading. French sets a
# no-break space before a colon and Japanese uses the full-width one; the rest
# take the plain colon this file would otherwise have imposed on all eleven.
COLON = {'fr': '&nbsp;: ', 'ja': '\uff1a'}

L = {}

L['de'] = dict(
  tiers=['Anfänger', 'Mittelstufe', 'Fortgeschritten', 'Professionell'],
  sub=['Der Mechanismus, die Kosten und das Risiko',
       'Die Auktion lesen',
       'Die Gegenseite, und ein System bauen',
       'Portfolio und Praxis'],
  blurb=[
   'Wie ein Markt wirklich funktioniert, was das Traden dich kostet, bevor du recht '
   'oder unrecht hast, und was Risiko als Zahl ist. Nichts hier setzt voraus, dass du '
   'je einen Trade platziert hast.',
   'Volumen, Delta, das Tape und das Buch, gelesen als Antwort darauf, wer aggressiv '
   'war. Dann der Kontext, der entscheidet, wann diese Lesart gilt, und eine ehrliche '
   'Bilanz dessen, was Indikatoren beitragen.',
   'Wer sonst noch im Buch steht und was seine Aufgabe ist &mdash; market makers, '
   'Geschwindigkeit, außerbörslicher Handel, das Hedging der Dealer &mdash; und wie aus '
   'einer Lesart etwas Testbares und Einsetzbares wird, das über seinen eigenen Verfall '
   'ehrlich spricht.',
   'Korrelation und Portfolio-Hitze, der Betrieb und die Infrastruktur, um davon zu '
   'leben, und die Spezialisierungen, die sich lohnen, sobald der Kern steht.'],
  meta='{n} Lektionen &bull; ~{w} Wörter &bull; {a}-{b} Stunden',
  start=['Anfänger-Stufe starten',
         'Mittelstufe starten',
         'Fortgeschrittenen-Stufe starten',
         'Profi-Stufe starten'],
  prereq=['<strong>Voraussetzungen:</strong> Zuerst die Anfänger-Stufe abschließen (Lektionen 1&ndash;{last})',
          '<strong>Voraussetzungen:</strong> Zuerst die Mittelstufe abschließen (Lektionen 1&ndash;{last})',
          '<strong>Voraussetzungen:</strong> Zuerst die Fortgeschrittenen-Stufe abschließen (Lektionen 1&ndash;{last})'],
  range='Lektionen {lo}&ndash;{hi}', more='und {k} weitere',
  quiz='Quiz zu Modul {n}')

L['es'] = dict(
  tiers=['Principiante', 'Intermedio', 'Avanzado', 'Profesional'],
  sub=['el mecanismo, los costes y el riesgo',
       'leer la subasta',
       'el otro lado, y construir un sistema',
       'cartera y práctica'],
  blurb=[
   'Cómo funciona de verdad un mercado, qué te quita operar antes de que tengas razón '
   'o no, y qué es el riesgo como número. Nada de esto da por hecho que hayas colocado '
   'una operación alguna vez.',
   'El volumen, el delta, la cinta y el libro, convertidos en una lectura de quién fue '
   'agresivo. Después, el contexto que decide cuándo se aplica esa lectura, y un balance '
   'honesto de lo que aportan los indicadores.',
   'Quién más está en el libro y cuál es su trabajo: market makers, velocidad, '
   'negociación fuera de mercado, la cobertura de los dealers; y cómo convertir una '
   'lectura en algo comprobable, desplegable y honesto sobre su propio deterioro.',
   'La correlación y el calor de la cartera, la operativa y la infraestructura de vivir '
   'de esto, y las especializaciones que merecen la pena una vez que el núcleo es sólido.'],
  meta='{n} lecciones &bull; ~{w} palabras &bull; {a}-{b} horas',
  start=['Empezar el nivel principiante',
         'Empezar el nivel intermedio',
         'Empezar el nivel avanzado',
         'Empezar el nivel profesional'],
  prereq=['<strong>Requisitos previos:</strong> Completa primero el nivel principiante (lecciones 1&ndash;{last})',
          '<strong>Requisitos previos:</strong> Completa primero el nivel intermedio (lecciones 1&ndash;{last})',
          '<strong>Requisitos previos:</strong> Completa primero el nivel avanzado (lecciones 1&ndash;{last})'],
  range='Lecciones {lo}&ndash;{hi}', more='y {k} más',
  quiz='Cuestionario del módulo {n}')

L['fr'] = dict(
  tiers=['Débutant', 'Intermédiaire', 'Avancé', 'Professionnel'],
  sub=['le mécanisme, les coûts et le risque',
       'lire l&rsquo;enchère',
       'l&rsquo;autre côté, et construire un système',
       'portefeuille et pratique'],
  blurb=[
   'Comment un marché fonctionne vraiment, ce que le trading vous prend avant même que '
   'vous ayez raison ou tort, et ce qu&rsquo;est le risque en tant que nombre. Rien ici '
   'ne suppose que vous ayez déjà passé un ordre.',
   'Le volume, le delta, la bande et le carnet, transformés en une lecture de qui a été '
   'agressif. Puis le contexte qui décide quand cette lecture s&rsquo;applique, et un '
   'bilan honnête de ce que les indicateurs apportent.',
   'Qui d&rsquo;autre se trouve dans le carnet et quel est son métier&nbsp;: market '
   'makers, vitesse, hors marché, couverture des dealers&nbsp;; et comment transformer '
   'une lecture en quelque chose de testable, déployable et honnête sur sa propre usure.',
   'La corrélation et la chaleur du portefeuille, l&rsquo;exploitation et '
   'l&rsquo;infrastructure nécessaires pour en vivre, et les spécialisations qui valent '
   'la peine une fois le socle solide.'],
  meta='{n} leçons &bull; ~{w} mots &bull; {a}-{b} heures',
  start=['Commencer le niveau débutant',
         'Commencer le niveau intermédiaire',
         'Commencer le niveau avancé',
         'Commencer le niveau professionnel'],
  prereq=['<strong>Prérequis&nbsp;:</strong> Terminez d&rsquo;abord le niveau débutant (leçons 1&ndash;{last})',
          '<strong>Prérequis&nbsp;:</strong> Terminez d&rsquo;abord le niveau intermédiaire (leçons 1&ndash;{last})',
          '<strong>Prérequis&nbsp;:</strong> Terminez d&rsquo;abord le niveau avancé (leçons 1&ndash;{last})'],
  range='Leçons {lo}&ndash;{hi}', more='et {k} autres',
  quiz='Quiz du module {n}')

L['it'] = dict(
  tiers=['Principiante', 'Intermedio', 'Avanzato', 'Professionale'],
  sub=['il meccanismo, i costi e il rischio',
       'leggere l&rsquo;asta',
       'l&rsquo;altro lato, e costruire un sistema',
       'portafoglio e pratica'],
  blurb=[
   'Come funziona davvero un mercato, che cosa ti toglie il trading prima ancora che tu '
   'abbia ragione o torto, e che cos&rsquo;è il rischio come numero. Nulla qui dà per '
   'scontato che tu abbia mai piazzato un&rsquo;operazione.',
   'Il volume, il delta, il tape e il book, trasformati in una lettura di chi è stato '
   'aggressivo. Poi il contesto che decide quando quella lettura vale, e un bilancio '
   'onesto di ciò che gli indicatori aggiungono.',
   'Chi altro sta nel book e qual è il suo mestiere: market makers, velocità, fuori '
   'mercato, la copertura dei dealer; e come trasformare una lettura in qualcosa di '
   'testabile, utilizzabile e onesto sul proprio decadimento.',
   'La correlazione e il calore di portafoglio, le operazioni e l&rsquo;infrastruttura '
   'per viverci, e le specializzazioni che vale la pena prendere quando il nucleo è solido.'],
  meta='{n} lezioni &bull; ~{w} parole &bull; {a}-{b} ore',
  start=['Inizia il livello principiante',
         'Inizia il livello intermedio',
         'Inizia il livello avanzato',
         'Inizia il livello professionale'],
  prereq=['<strong>Prerequisiti:</strong> Completa prima il livello principiante (lezioni 1&ndash;{last})',
          '<strong>Prerequisiti:</strong> Completa prima il livello intermedio (lezioni 1&ndash;{last})',
          '<strong>Prerequisiti:</strong> Completa prima il livello avanzato (lezioni 1&ndash;{last})'],
  range='Lezioni {lo}&ndash;{hi}', more='e altre {k}',
  quiz='Quiz del modulo {n}')

L['pt'] = dict(
  tiers=['Iniciante', 'Intermédio', 'Avançado', 'Profissional'],
  sub=['o mecanismo, os custos e o risco',
       'ler o leilão',
       'o outro lado, e construir um sistema',
       'carteira e prática'],
  blurb=[
   'Como um mercado funciona de facto, o que a negociação te tira antes de teres razão '
   'ou não, e o que é o risco enquanto número. Nada aqui parte do princípio de que já '
   'colocaste uma ordem.',
   'O volume, o delta, a fita e o livro, transformados numa leitura de quem foi '
   'agressivo. Depois o contexto que decide quando essa leitura se aplica, e um balanço '
   'honesto do que os indicadores acrescentam.',
   'Quem mais está no livro e qual é o seu trabalho: market makers, velocidade, fora de '
   'bolsa, a cobertura dos dealers; e como transformar uma leitura em algo testável, '
   'aplicável e honesto quanto ao seu próprio desgaste.',
   'A correlação e o calor da carteira, a operação e a infraestrutura de viver disto, e '
   'as especializações que valem a pena assim que o núcleo está sólido.'],
  meta='{n} aulas &bull; ~{w} palavras &bull; {a}-{b} horas',
  start=['Começar o nível iniciante',
         'Começar o nível intermédio',
         'Começar o nível avançado',
         'Começar o nível profissional'],
  prereq=['<strong>Pré-requisitos:</strong> Conclui primeiro o nível iniciante (aulas 1&ndash;{last})',
          '<strong>Pré-requisitos:</strong> Conclui primeiro o nível intermédio (aulas 1&ndash;{last})',
          '<strong>Pré-requisitos:</strong> Conclui primeiro o nível avançado (aulas 1&ndash;{last})'],
  range='Aulas {lo}&ndash;{hi}', more='e mais {k}',
  quiz='Questionário do módulo {n}')

L['nl'] = dict(
  tiers=['Beginner', 'Gevorderd', 'Expert', 'Professioneel'],
  sub=['het mechanisme, de kosten en het risico',
       'de veiling lezen',
       'de andere kant, en een systeem bouwen',
       'portefeuille en praktijk'],
  blurb=[
   'Hoe een markt echt werkt, wat handelen je kost voordat je gelijk of ongelijk hebt, '
   'en wat risico als getal is. Niets hier gaat ervan uit dat je ooit een order hebt '
   'geplaatst.',
   'Volume, delta, de tape en het boek, gelezen als antwoord op wie agressief was. '
   'Daarna de context die bepaalt wanneer die lezing geldt, en een eerlijke balans van '
   'wat indicatoren toevoegen.',
   'Wie er nog meer in het boek staan en wat hun werk is: market makers, snelheid, '
   'buiten de beurs, de afdekking door dealers; en hoe je een lezing omzet in iets '
   'toetsbaars, inzetbaars en eerlijk over zijn eigen slijtage.',
   'Correlatie en portefeuillewarmte, de bedrijfsvoering en infrastructuur om hiervan te '
   'leven, en de specialisaties die de moeite waard zijn zodra de kern staat.'],
  meta='{n} lessen &bull; ~{w} woorden &bull; {a}-{b} uur',
  start=['Start het beginnersniveau',
         'Start het gevorderde niveau',
         'Start het expertniveau',
         'Start het professionele niveau'],
  prereq=['<strong>Vereisten:</strong> Rond eerst het beginnersniveau af (lessen 1&ndash;{last})',
          '<strong>Vereisten:</strong> Rond eerst het gevorderde niveau af (lessen 1&ndash;{last})',
          '<strong>Vereisten:</strong> Rond eerst het expertniveau af (lessen 1&ndash;{last})'],
  range='Lessen {lo}&ndash;{hi}', more='en {k} meer',
  quiz='Quiz module {n}')

L['ru'] = dict(
  tiers=['Начальный уровень', 'Средний уровень', 'Продвинутый уровень', 'Профессиональный уровень'],
  sub=['механизм, издержки и риск',
       'читать аукцион',
       'другая сторона и построение системы',
       'портфель и практика'],
  blurb=[
   'Как рынок работает на самом деле, что торговля забирает у тебя ещё до того, как ты '
   'прав или нет, и что такое риск как число. Ничего здесь не предполагает, что ты '
   'когда-либо совершал сделку.',
   'Объём, дельта, лента и книга, прочитанные как ответ на вопрос, кто был агрессивен. '
   'Затем контекст, который решает, когда это прочтение применимо, и честный итог того, '
   'что добавляют индикаторы.',
   'Кто ещё стоит в книге и в чём его работа: market makers, скорость, внебиржевая '
   'торговля, хеджирование дилеров; и как превратить прочтение в нечто проверяемое, '
   'применимое и честное насчёт собственного угасания.',
   'Корреляция и нагрев портфеля, операции и инфраструктура, чтобы этим жить, и '
   'специализации, которые стоит брать, когда основа надёжна.'],
  meta='{n} уроков &bull; ~{w} слов &bull; {a}-{b} часов',
  stem='урок',  # 83 урока in one sentence, 83 уроков in the next
  start=['Начать начальный уровень',
         'Начать средний уровень',
         'Начать продвинутый уровень',
         'Начать профессиональный уровень'],
  prereq=['<strong>Требования:</strong> Сначала пройди начальный уровень (уроки 1&ndash;{last})',
          '<strong>Требования:</strong> Сначала пройди средний уровень (уроки 1&ndash;{last})',
          '<strong>Требования:</strong> Сначала пройди продвинутый уровень (уроки 1&ndash;{last})'],
  range='Уроки {lo}&ndash;{hi}', more='и ещё {k}',
  quiz='Тест по модулю {n}')

L['ja'] = dict(
  tiers=['初級', '中級', '上級', 'プロフェッショナル'],
  sub=['仕組み、コスト、リスク',
       'オークションを読む',
       '相手側、そしてシステムを組む',
       'ポートフォリオと実務'],
  blurb=[
   '市場が実際にどう動くのか、当たるか外れるかの前にトレードが何を奪うのか、そしてリスクを数値と'
   'してどう見るのか。ここでは取引の経験を一切前提にしません。',
   '出来高、デルタ、テープ、そして板を、誰が攻めたのかという読みに変えます。次に、その読みがいつ'
   '通用するかを決める文脈と、インジケーターが何を足せるのかについての正直な評価。',
   '板の向こうに誰がいて、何を仕事にしているのか。market makers、速度、取引所外、ディーラーの'
   'ヘッジ。そして読みを、検証でき、運用でき、自らの劣化について正直なものへ変える方法。',
   '相関とポートフォリオの過熱、これで生計を立てるための運用と基盤、そして土台が固まってから取る'
   '価値のある専門領域。'],
  meta='{n}レッスン &bull; 約{w}語 &bull; {a}〜{b}時間',
  start=['初級ティアを始める',
         '中級ティアを始める',
         '上級ティアを始める',
         'プロフェッショナルティアを始める'],
  prereq=['<strong>前提条件:</strong> 先に初級ティアを修了してください（レッスン1〜{last}）',
          '<strong>前提条件:</strong> 先に中級ティアを修了してください（レッスン1〜{last}）',
          '<strong>前提条件:</strong> 先に上級ティアを修了してください（レッスン1〜{last}）'],
  range='レッスン{lo}〜{hi}', more='ほか{k}件',
  quiz='モジュール{n}のクイズ')

L['tr'] = dict(
  tiers=['Başlangıç', 'Orta seviye', 'İleri seviye', 'Profesyonel'],
  sub=['mekanizma, maliyetler ve risk',
       'açık artırmayı okumak',
       'karşı taraf ve bir sistem kurmak',
       'portföy ve pratik'],
  blurb=[
   'Bir piyasa gerçekte nasıl işler, haklı ya da haksız çıkmadan önce işlem yapmak senden '
   'ne alır ve risk bir sayı olarak nedir. Buradaki hiçbir şey daha önce işlem açmış '
   'olmanı varsaymaz.',
   'Hacim, delta, şerit ve defter; kimin saldırgan davrandığına dair bir okumaya '
   'dönüşüyor. Ardından bu okumanın ne zaman geçerli olduğunu belirleyen bağlam ve '
   'göstergelerin ne kattığına dair dürüst bir değerlendirme.',
   'Defterde başka kim var ve işi ne: market makers, hız, borsa dışı işlem, dealer '
   'tarafında korunma; ve bir okumayı sınanabilir, uygulanabilir ve kendi yıpranması '
   'konusunda dürüst bir şeye nasıl dönüştürürsün.',
   'Korelasyon ve portföy ısısı, bundan geçinmenin işleyişi ve altyapısı, ve çekirdek '
   'sağlamlaştığında almaya değer uzmanlıklar.'],
  meta='{n} ders &bull; ~{w} kelime &bull; {a}-{b} saat',
  start=['Başlangıç seviyesini başlat',
         'Orta seviyeyi başlat',
         'İleri seviyeyi başlat',
         'Profesyonel seviyeyi başlat'],
  prereq=['<strong>Ön koşullar:</strong> Önce başlangıç seviyesini tamamla (ders 1&ndash;{last})',
          '<strong>Ön koşullar:</strong> Önce orta seviyeyi tamamla (ders 1&ndash;{last})',
          '<strong>Ön koşullar:</strong> Önce ileri seviyeyi tamamla (ders 1&ndash;{last})'],
  range='Ders {lo}&ndash;{hi}', more='ve {k} tane daha',
  quiz='Modül {n} sınavı')

L['hu'] = dict(
  tiers=['Kezdő', 'Középhaladó', 'Haladó', 'Profi'],
  sub=['a mechanizmus, a költségek és a kockázat',
       'az aukció olvasása',
       'a másik oldal, és egy rendszer felépítése',
       'portfólió és gyakorlat'],
  blurb=[
   'Hogyan működik valójában egy piac, mit vesz el tőled a kereskedés még azelőtt, hogy '
   'igazad lenne vagy sem, és mi a kockázat számként. Itt semmi sem feltételezi, hogy '
   'valaha is nyitottál pozíciót.',
   'A forgalom, a delta, a szalag és a könyv, annak olvasatává alakítva, hogy ki volt az '
   'agresszív. Utána a szövegkörnyezet, amely eldönti, mikor érvényes ez az olvasat, és '
   'őszinte mérleg arról, mit tesznek hozzá az indikátorok.',
   'Ki más áll még a könyvben és mi a dolga: market makers, sebesség, tőzsdén kívüli '
   'kereskedés, a dealerek fedezése; és hogyan válik egy olvasat tesztelhetővé, '
   'üzembe helyezhetővé és a saját kopásáról őszintévé.',
   'A korreláció és a portfólió hője, a megélhetéshez szükséges működés és '
   'infrastruktúra, és azok a szakosodások, amelyeket érdemes felvenni, ha az alap már '
   'szilárd.'],
  meta='{n} lecke &bull; ~{w} szó &bull; {a}-{b} óra',
  start=['Kezdő szint indítása',
         'Középhaladó szint indítása',
         'Haladó szint indítása',
         'Profi szint indítása'],
  prereq=['<strong>Előfeltételek:</strong> Előbb végezd el a kezdő szintet (1&ndash;{last}. lecke)',
          '<strong>Előfeltételek:</strong> Előbb végezd el a középhaladó szintet (1&ndash;{last}. lecke)',
          '<strong>Előfeltételek:</strong> Előbb végezd el a haladó szintet (1&ndash;{last}. lecke)'],
  range='{lo}&ndash;{hi}. lecke', more='és további {k}',
  quiz='{n}. modul kvíz')

L['ar'] = dict(
  tiers=['مبتدئ', 'متوسط', 'متقدّم', 'احترافي'],
  sub=['الآلية والتكاليف والمخاطرة',
       'قراءة المزاد',
       'الجانب الآخر، وبناء نظام',
       'المحفظة والممارسة'],
  blurb=[
   'كيف تعمل السوق فعليًا، وما الذي يأخذه منك التداول قبل أن تكون على صواب أو خطأ، وما '
   'المخاطرة بوصفها رقمًا. لا شيء هنا يفترض أنك نفّذت صفقة من قبل.',
   'الحجم والدلتا والشريط والدفتر، محوَّلة إلى قراءة لمن كان المبادر. ثم السياق الذي '
   'يحدّد متى تصلح تلك القراءة، وحساب أمين لما تضيفه المؤشرات.',
   'من غيرك في الدفتر وما عمله: market makers، والسرعة، والتداول خارج البورصة، وتحوّط '
   'الوسطاء؛ وكيف تحوّل قراءةً إلى شيء قابل للاختبار والتشغيل وصادق بشأن تآكله.',
   'الارتباط وحرارة المحفظة، والتشغيل والبنية التحتية اللازمة للعيش من هذا، والتخصّصات '
   'التي تستحق الأخذ بها متى صار الأساس متينًا.'],
  meta='{n} درسًا &bull; نحو {w} كلمة &bull; {a}-{b} ساعة',
  start=['ابدأ مستوى المبتدئ',
         'ابدأ المستوى المتوسط',
         'ابدأ المستوى المتقدّم',
         'ابدأ المستوى الاحترافي'],
  prereq=['<strong>المتطلبات المسبقة:</strong> أكمل مستوى المبتدئ أولًا (الدروس 1&ndash;{last})',
          '<strong>المتطلبات المسبقة:</strong> أكمل المستوى المتوسط أولًا (الدروس 1&ndash;{last})',
          '<strong>المتطلبات المسبقة:</strong> أكمل المستوى المتقدّم أولًا (الدروس 1&ndash;{last})'],
  range='الدروس {lo}&ndash;{hi}', more='و{k} غير ذلك',
  quiz='اختبار الوحدة {n}')

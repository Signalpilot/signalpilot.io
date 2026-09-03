# -*- coding: utf-8 -*-
"""Hand-written card text for the Soro auto-posts, one entry per post per locale.

Title and excerpt only: these are what a locale blog index shows. The article
body stays English and the card says so, because 15 posts carry 21,014 words
and eleven locales of that is 231,154 words that grows with every auto-post.

Register follows the corpus: German du, French vous, Spanish tu, Italian tu,
Portuguese tu, Dutch je, Russian ty, Turkish sen, Hungarian and Arabic informal.
When fetch.py reports a new slug, add its two lines to every locale here.
"""

UI = {
    'de': {'latest': 'Neueste Beiträge', 'english': 'Dieser Beitrag wird auf Englisch geöffnet.',
           'prev': 'Vorherige Beiträge', 'next': 'Weitere Beiträge'},
    'es': {'latest': 'Lo más reciente', 'english': 'Este artículo se abre en inglés.',
           'prev': 'Artículos anteriores', 'next': 'Artículos siguientes'},
    'fr': {'latest': 'Derniers articles', 'english': 'Cet article s’ouvre en anglais.',
           'prev': 'Articles précédents', 'next': 'Articles suivants'},
    'it': {'latest': 'Ultimi articoli', 'english': 'Questo articolo si apre in inglese.',
           'prev': 'Articoli precedenti', 'next': 'Articoli successivi'},
    'pt': {'latest': 'Mais recentes', 'english': 'Este artigo abre em inglês.',
           'prev': 'Artigos anteriores', 'next': 'Artigos seguintes'},
    'nl': {'latest': 'Nieuwste artikelen', 'english': 'Dit artikel opent in het Engels.',
           'prev': 'Vorige artikelen', 'next': 'Volgende artikelen'},
    'ru': {'latest': 'Последние статьи', 'english': 'Статья открывается на английском.',
           'prev': 'Предыдущие статьи', 'next': 'Следующие статьи'},
    'ja': {'latest': '最新の記事', 'english': '記事は英語で開きます。',
           'prev': '前の記事', 'next': '次の記事'},
    'tr': {'latest': 'En yeni yazılar', 'english': 'Yazı İngilizce açılır.',
           'prev': 'Önceki yazılar', 'next': 'Sonraki yazılar'},
    'hu': {'latest': 'Legfrissebb cikkek', 'english': 'A cikk angolul nyílik meg.',
           'prev': 'Előző cikkek', 'next': 'Következő cikkek'},
    'ar': {'latest': 'أحدث المقالات', 'english': 'يُفتح المقال بالإنجليزية.',
           'prev': 'المقالات السابقة', 'next': 'المقالات التالية'},
}

CARDS = {
  'de': {
    'pentarch-cycle-phases-explained': (
      'Pentarch-Zyklusphasen erklärt für klarere Charts',
      'Pentarch-Zyklusphasen geben Tradern eine strukturierte Art, verändertes Kursverhalten zu lesen. Erfahre, was die Ereignisse TD, IGN, WRN, CAP und BDN zeigen sollen.'),
    'tradingview-indicators-free-trial': (
      'Was du in einer kostenlosen TradingView-Indikator-Testphase prüfen solltest',
      'Nutze eine kostenlose TradingView-Indikator-Testphase, um Chart-Klarheit, Dokumentation, Zugang und analytische Passung zu prüfen, bevor du ein Werkzeug für deinen Alltag wählst.'),
    'risk-management-rules-for-traders': (
      '7 Risikomanagement-Regeln für Trader, die Klarheit schätzen',
      'Risikomanagement-Regeln für Trader ziehen Grenzen um Unsicherheit, Exposure, Ausführung und Auswertung, damit nie eine einzelne Meinung das Konto steuert.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Leitfaden zum TradingView-Indikator für Ausbruchsbestätigung',
      'Ein TradingView-Indikator zur Ausbruchsbestätigung sollte Beteiligung, Folgebewegung und Invalidierung klären, ohne einen Chart in einen Signaldienst zu verwandeln.'),
    'how-to-avoid-late-trade-entries': (
      'Wie du späte Einstiege vermeidest, ohne hinterherzulaufen',
      'Erfahre, wie du späte Einstiege mit definierten Auslösern, Grenzen für Überdehnung und belegbaren Chart-Lesarten vermeidest und Hinterherlaufen täglich durch Disziplin ersetzt.'),
    'momentum-confirmation-trading-indicator-explained': (
      'Der Momentum-Bestätigungs-Indikator erklärt',
      'Erfahre, wie ein Momentum-Bestätigungs-Indikator Beteiligung am Kurs, zeitlichen Kontext und nachlassenden Druck klären kann, ohne dein Urteil zu ersetzen.'),
    'what-a-market-cycle-indicator-shows': (
      'Was ein Marktzyklus-Indikator wirklich zeigt',
      'Ein Marktzyklus-Indikator ordnet Kurs, Momentum und Volumen in lesbare Phasen und hilft Tradern, strukturelle Verschiebungen täglich mit größerer Klarheit zu untersuchen.'),
    'volume-regime-trading-strategy': (
      'Eine Volumenregime-Strategie für die Beteiligung',
      'Erfahre, wie eine Volumenregime-Strategie Beteiligung einordnet, ruhige von aktiven Phasen trennt und strukturierte Chartanalyse klar verbessert.'),
    'wyckoff-accumulation-indicator': (
      'Was ein Wyckoff-Akkumulations-Indikator misst',
      'Erfahre, was ein Wyckoff-Akkumulations-Indikator zeigen kann und was nicht, wie du Kurs- und Volumenkontext liest und warum Struktur klar mehr zählt als Alarme.'),
    'how-to-scan-stocks-on-tradingview': (
      'Wie du Aktien auf TradingView mit Absicht scannst',
      'Erfahre, wie du Aktien auf TradingView mit gezielten Filtern und sauberen Ergebnissen scannst und Titel wiederholbar recherchierst, ohne Rauschen oder Unordnung hinterherzujagen.'),
    'automatic-support-resistance-indicator-explained': (
      'Der automatische Support-Resistance-Indikator erklärt',
      'Erfahre, wie ein automatischer Support-Resistance-Indikator wechselnde Kursniveaus abbildet, Chart-Rauschen filtert und einen disziplinierten TradingView-Ablauf täglich stützt.'),
    'obv-divergence-strategy': (
      'OBV-Divergenz-Strategie zum Lesen des Volumens',
      'Lerne eine OBV-Divergenz-Strategie kennen, die Kurs- und Volumendruck vergleicht, schwache Messwerte filtert und Kontext schafft, ohne blinde Alarme oder vage Versprechen.'),
    'how-to-identify-accumulation-in-stocks': (
      'Wie du Akkumulation in Aktien klar erkennst',
      'Erfahre, wie du Akkumulation in Aktien erkennst, indem du Kursverdichtung, Volumenverhalten, gescheiterten Verkaufsdruck und Bestätigung liest, ohne täglichen Hype.'),
    'multi-timeframe-support-resistance': (
      'Support und Resistance über mehrere Zeitebenen, klar gelesen',
      'Erfahre, wie Support und Resistance über mehrere Zeitebenen Hierarchie, Konflikt und Entscheidungszonen im Kurs zeigen, ohne Unordnung, Gewissheitsversprechen oder blinde Alarme.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Wie du erkennst, ob ein Indikator auf TradingView neu zeichnet',
      'Erfahre, wie du erkennst, ob ein Indikator auf TradingView neu zeichnet. Prüfe historische Plots, Alarme und Multi-Timeframe-Logik, bevor du dich auf einen Live-Chart verlässt.'),
  },
  'es': {
    'pentarch-cycle-phases-explained': (
      'Las fases del ciclo Pentarch explicadas para gráficos más claros',
      'Las fases del ciclo Pentarch dan a los traders una forma estructurada de leer un comportamiento del precio que cambia. Descubre qué muestran los eventos TD, IGN, WRN, CAP y BDN.'),
    'tradingview-indicators-free-trial': (
      'Qué probar en una prueba gratuita de indicadores de TradingView',
      'Usa una prueba gratuita de indicadores de TradingView para evaluar la claridad del gráfico, la documentación, el acceso y el encaje analítico antes de elegir una herramienta para tu día a día.'),
    'risk-management-rules-for-traders': (
      '7 reglas de gestión del riesgo para traders que valoran la claridad',
      'Las reglas de gestión del riesgo para traders ponen límites a la incertidumbre, la exposición, la ejecución y la revisión para que una sola opinión nunca controle la cuenta.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Guía del indicador de confirmación de rupturas en TradingView',
      'Un indicador de confirmación de rupturas en TradingView debe aclarar la participación, la continuidad y la invalidación, sin convertir un gráfico en un servicio de señales.'),
    'how-to-avoid-late-trade-entries': (
      'Cómo evitar las entradas tardías sin perseguir el precio',
      'Descubre cómo evitar las entradas tardías con disparadores definidos, límites de extensión y lecturas del gráfico basadas en pruebas que sustituyen a diario la persecución por la disciplina.'),
    'momentum-confirmation-trading-indicator-explained': (
      'El indicador de confirmación de momento explicado',
      'Descubre cómo un indicador de confirmación de momento puede aclarar la participación en el precio, el contexto temporal y la presión que se agota, sin sustituir tu criterio.'),
    'what-a-market-cycle-indicator-shows': (
      'Qué muestra realmente un indicador de ciclo de mercado',
      'Un indicador de ciclo de mercado organiza precio, momento y volumen en fases legibles y ayuda a los traders a estudiar a diario los cambios estructurales con mayor claridad.'),
    'volume-regime-trading-strategy': (
      'Una estrategia de régimen de volumen para la participación',
      'Descubre cómo una estrategia de régimen de volumen clasifica la participación, separa las condiciones tranquilas de las activas y mejora con claridad el análisis estructurado del gráfico.'),
    'wyckoff-accumulation-indicator': (
      'Qué mide un indicador de acumulación de Wyckoff',
      'Descubre qué puede y qué no puede mostrar un indicador de acumulación de Wyckoff, cómo leer el contexto de precio y volumen y por qué la estructura importa con claridad más que las alertas.'),
    'how-to-scan-stocks-on-tradingview': (
      'Cómo escanear acciones en TradingView con un propósito',
      'Descubre cómo escanear acciones en TradingView con filtros centrados, resultados limpios y una forma repetible de investigar valores sin perseguir ruido ni desorden.'),
    'automatic-support-resistance-indicator-explained': (
      'El indicador automático de soportes y resistencias explicado',
      'Descubre cómo un indicador automático de soportes y resistencias traza los niveles de precio cambiantes, filtra el ruido del gráfico y sostiene a diario un flujo de trabajo disciplinado en TradingView.'),
    'obv-divergence-strategy': (
      'Estrategia de divergencias con OBV para leer el volumen',
      'Aprende una estrategia de divergencias con OBV que compara la presión del precio y la del volumen, filtra las lecturas débiles y enmarca el contexto sin alertas ciegas ni promesas vagas.'),
    'how-to-identify-accumulation-in-stocks': (
      'Cómo identificar la acumulación en acciones con claridad',
      'Descubre cómo identificar la acumulación en acciones leyendo la compresión del precio, el comportamiento del volumen, la presión vendedora fallida y la confirmación, sin bombo diario.'),
    'multi-timeframe-support-resistance': (
      'Soportes y resistencias en varias temporalidades, leídos con claridad',
      'Descubre cómo los soportes y resistencias en varias temporalidades revelan la jerarquía del precio, el conflicto y las zonas de decisión, sin desorden, promesas de certeza ni alertas ciegas.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Cómo saber si un indicador repinta en TradingView',
      'Descubre cómo saber si un indicador repinta en TradingView. Prueba los trazados históricos, las alertas y la lógica multitemporal antes de fiarte de cualquier gráfico en vivo.'),
  },
  'fr': {
    'pentarch-cycle-phases-explained': (
      'Les phases du cycle Pentarch expliquées pour des graphiques plus clairs',
      'Les phases du cycle Pentarch offrent aux traders une manière structurée de lire un comportement de prix qui change. Découvrez ce que les événements TD, IGN, WRN, CAP et BDN sont censés montrer.'),
    'tradingview-indicators-free-trial': (
      'Que tester pendant un essai gratuit des indicateurs TradingView',
      'Utilisez un essai gratuit des indicateurs TradingView pour évaluer la clarté du graphique, la documentation, l’accès et la pertinence analytique avant de choisir un outil pour votre travail quotidien.'),
    'risk-management-rules-for-traders': (
      '7 règles de gestion du risque pour les traders qui aiment la clarté',
      'Les règles de gestion du risque pour les traders posent des limites à l’incertitude, à l’exposition, à l’exécution et au bilan, pour qu’un seul avis ne pilote jamais le compte.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Guide de l’indicateur de confirmation de cassure TradingView',
      'Un indicateur de confirmation de cassure TradingView doit clarifier la participation, la poursuite du mouvement et l’invalidation, sans transformer un graphique en service de signaux.'),
    'how-to-avoid-late-trade-entries': (
      'Comment éviter les entrées tardives sans courir après le prix',
      'Découvrez comment éviter les entrées tardives grâce à des déclencheurs définis, des limites d’extension et des lectures de graphique fondées sur des preuves, qui remplacent chaque jour la course par la discipline.'),
    'momentum-confirmation-trading-indicator-explained': (
      'L’indicateur de confirmation de momentum expliqué',
      'Découvrez comment un indicateur de confirmation de momentum peut clarifier la participation au prix, le contexte temporel et la pression qui s’essouffle, sans remplacer votre jugement.'),
    'what-a-market-cycle-indicator-shows': (
      'Ce qu’un indicateur de cycle de marché montre vraiment',
      'Un indicateur de cycle de marché organise le prix, le momentum et le volume en phases lisibles et aide les traders à étudier chaque jour les changements de structure avec plus de clarté.'),
    'volume-regime-trading-strategy': (
      'Une stratégie de régime de volume au service de la participation',
      'Découvrez comment une stratégie de régime de volume classe la participation, sépare les périodes calmes des périodes actives et améliore clairement l’analyse structurée du graphique.'),
    'wyckoff-accumulation-indicator': (
      'Ce que mesure un indicateur d’accumulation de Wyckoff',
      'Découvrez ce qu’un indicateur d’accumulation de Wyckoff peut montrer et ce qu’il ne peut pas, comment lire le contexte de prix et de volume, et pourquoi la structure compte clairement plus que les alertes.'),
    'how-to-scan-stocks-on-tradingview': (
      'Comment scanner les actions sur TradingView avec une intention',
      'Découvrez comment scanner les actions sur TradingView avec des filtres ciblés, des résultats propres et une méthode reproductible pour étudier des titres sans courir après le bruit ni l’encombrement.'),
    'automatic-support-resistance-indicator-explained': (
      'L’indicateur automatique de supports et résistances expliqué',
      'Découvrez comment un indicateur automatique de supports et résistances cartographie les niveaux de prix mouvants, filtre le bruit du graphique et soutient chaque jour un travail discipliné sur TradingView.'),
    'obv-divergence-strategy': (
      'Stratégie de divergence OBV pour lire le volume',
      'Découvrez une stratégie de divergence OBV qui compare la pression du prix et celle du volume, filtre les lectures faibles et pose le contexte sans alertes aveugles ni promesses vagues.'),
    'how-to-identify-accumulation-in-stocks': (
      'Comment repérer clairement l’accumulation sur les actions',
      'Découvrez comment repérer l’accumulation sur les actions en lisant la compression du prix, le comportement du volume, la pression vendeuse qui échoue et la confirmation, sans battage quotidien.'),
    'multi-timeframe-support-resistance': (
      'Supports et résistances multi-échelles, lus clairement',
      'Découvrez comment les supports et résistances multi-échelles révèlent la hiérarchie du prix, les conflits et les zones de décision, sans encombrement, promesses de certitude ni alertes aveugles.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Comment savoir si un indicateur repeint sur TradingView',
      'Découvrez comment savoir si un indicateur repeint sur TradingView. Testez les tracés historiques, les alertes et la logique multi-échelles avant de vous fier à un graphique en direct.'),
  },
  'it': {
    'pentarch-cycle-phases-explained': (
      'Le fasi del ciclo Pentarch spiegate per grafici più chiari',
      'Le fasi del ciclo Pentarch danno ai trader un modo strutturato di leggere un comportamento del prezzo che cambia. Scopri che cosa mostrano gli eventi TD, IGN, WRN, CAP e BDN.'),
    'tradingview-indicators-free-trial': (
      'Che cosa provare in una prova gratuita degli indicatori TradingView',
      'Usa una prova gratuita degli indicatori TradingView per valutare la chiarezza del grafico, la documentazione, l’accesso e l’adeguatezza analitica prima di scegliere uno strumento per il lavoro quotidiano.'),
    'risk-management-rules-for-traders': (
      '7 regole di gestione del rischio per trader che tengono alla chiarezza',
      'Le regole di gestione del rischio per i trader mettono confini attorno a incertezza, esposizione, esecuzione e revisione, così una sola opinione non comanda mai il conto.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Guida all’indicatore di conferma dei breakout su TradingView',
      'Un indicatore di conferma dei breakout su TradingView deve chiarire partecipazione, prosecuzione del movimento e invalidazione, senza trasformare un grafico in un servizio di segnali.'),
    'how-to-avoid-late-trade-entries': (
      'Come evitare gli ingressi tardivi senza rincorrere il prezzo',
      'Scopri come evitare gli ingressi tardivi con trigger definiti, limiti di estensione e letture del grafico fondate su prove, che ogni giorno sostituiscono la rincorsa con la disciplina.'),
    'momentum-confirmation-trading-indicator-explained': (
      'L’indicatore di conferma del momentum spiegato',
      'Scopri come un indicatore di conferma del momentum può chiarire la partecipazione al prezzo, il contesto temporale e la pressione che si esaurisce, senza sostituire il tuo giudizio.'),
    'what-a-market-cycle-indicator-shows': (
      'Che cosa mostra davvero un indicatore di ciclo di mercato',
      'Un indicatore di ciclo di mercato organizza prezzo, momentum e volume in fasi leggibili e aiuta i trader a studiare ogni giorno i cambiamenti strutturali con maggiore chiarezza.'),
    'volume-regime-trading-strategy': (
      'Una strategia sui regimi di volume per la partecipazione',
      'Scopri come una strategia sui regimi di volume classifica la partecipazione, separa le condizioni tranquille da quelle attive e migliora con chiarezza l’analisi strutturata del grafico.'),
    'wyckoff-accumulation-indicator': (
      'Che cosa misura un indicatore di accumulazione di Wyckoff',
      'Scopri che cosa può e che cosa non può mostrare un indicatore di accumulazione di Wyckoff, come leggere il contesto di prezzo e volume e perché la struttura conta con chiarezza più degli avvisi.'),
    'how-to-scan-stocks-on-tradingview': (
      'Come cercare azioni su TradingView con uno scopo',
      'Scopri come cercare azioni su TradingView con filtri mirati, risultati puliti e un modo ripetibile di studiare i titoli senza rincorrere rumore o disordine.'),
    'automatic-support-resistance-indicator-explained': (
      'L’indicatore automatico di supporti e resistenze spiegato',
      'Scopri come un indicatore automatico di supporti e resistenze mappa i livelli di prezzo che cambiano, filtra il rumore del grafico e sostiene ogni giorno un lavoro disciplinato su TradingView.'),
    'obv-divergence-strategy': (
      'Strategia di divergenza OBV per leggere il volume',
      'Scopri una strategia di divergenza OBV che confronta la pressione del prezzo con quella del volume, filtra le letture deboli e inquadra il contesto senza avvisi ciechi né promesse vaghe.'),
    'how-to-identify-accumulation-in-stocks': (
      'Come riconoscere con chiarezza l’accumulazione sulle azioni',
      'Scopri come riconoscere l’accumulazione sulle azioni leggendo la compressione del prezzo, il comportamento del volume, la pressione di vendita che fallisce e la conferma, senza clamore quotidiano.'),
    'multi-timeframe-support-resistance': (
      'Supporti e resistenze su più timeframe, letti con chiarezza',
      'Scopri come i supporti e le resistenze su più timeframe rivelano la gerarchia del prezzo, i conflitti e le aree di decisione, senza disordine, promesse di certezza o avvisi ciechi.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Come capire se un indicatore ridisegna su TradingView',
      'Scopri come capire se un indicatore ridisegna su TradingView. Prova i tracciati storici, gli avvisi e la logica multi-timeframe prima di fidarti di un grafico in tempo reale.'),
  },
  'pt': {
    'pentarch-cycle-phases-explained': (
      'As fases do ciclo Pentarch explicadas para gráficos mais claros',
      'As fases do ciclo Pentarch dão aos traders uma forma estruturada de ler um comportamento do preço que muda. Descobre o que os eventos TD, IGN, WRN, CAP e BDN pretendem mostrar.'),
    'tradingview-indicators-free-trial': (
      'O que testar num teste gratuito dos indicadores da TradingView',
      'Usa um teste gratuito dos indicadores da TradingView para avaliar a clareza do gráfico, a documentação, o acesso e a adequação analítica antes de escolheres uma ferramenta para o teu dia a dia.'),
    'risk-management-rules-for-traders': (
      '7 regras de gestão de risco para traders que valorizam a clareza',
      'As regras de gestão de risco para traders criam limites à incerteza, à exposição, à execução e à revisão, para que uma única opinião nunca controle a conta.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Guia do indicador de confirmação de rutura na TradingView',
      'Um indicador de confirmação de rutura na TradingView deve clarificar a participação, a continuação do movimento e a invalidação, sem transformar um gráfico num serviço de sinais.'),
    'how-to-avoid-late-trade-entries': (
      'Como evitar entradas tardias sem correr atrás do preço',
      'Descobre como evitar entradas tardias com gatilhos definidos, limites de extensão e leituras do gráfico apoiadas em provas, que substituem todos os dias a corrida pela disciplina.'),
    'momentum-confirmation-trading-indicator-explained': (
      'O indicador de confirmação de momentum explicado',
      'Descobre como um indicador de confirmação de momentum pode clarificar a participação no preço, o contexto temporal e a pressão que se esgota, sem substituir o teu juízo.'),
    'what-a-market-cycle-indicator-shows': (
      'O que um indicador de ciclo de mercado mostra realmente',
      'Um indicador de ciclo de mercado organiza preço, momentum e volume em fases legíveis e ajuda os traders a estudar todos os dias as mudanças de estrutura com maior clareza.'),
    'volume-regime-trading-strategy': (
      'Uma estratégia de regimes de volume para a participação',
      'Descobre como uma estratégia de regimes de volume classifica a participação, separa as condições calmas das ativas e melhora com clareza a análise estruturada do gráfico.'),
    'wyckoff-accumulation-indicator': (
      'O que mede um indicador de acumulação de Wyckoff',
      'Descobre o que um indicador de acumulação de Wyckoff pode e não pode mostrar, como ler o contexto de preço e volume e porque a estrutura conta com clareza mais do que os alertas.'),
    'how-to-scan-stocks-on-tradingview': (
      'Como pesquisar ações na TradingView com um propósito',
      'Descobre como pesquisar ações na TradingView com filtros focados, resultados limpos e uma forma repetível de estudar títulos sem correr atrás de ruído ou confusão.'),
    'automatic-support-resistance-indicator-explained': (
      'O indicador automático de suportes e resistências explicado',
      'Descobre como um indicador automático de suportes e resistências mapeia os níveis de preço que mudam, filtra o ruído do gráfico e sustenta todos os dias um trabalho disciplinado na TradingView.'),
    'obv-divergence-strategy': (
      'Estratégia de divergência OBV para ler o volume',
      'Descobre uma estratégia de divergência OBV que compara a pressão do preço com a do volume, filtra as leituras fracas e enquadra o contexto sem alertas cegos nem promessas vagas.'),
    'how-to-identify-accumulation-in-stocks': (
      'Como identificar a acumulação em ações com clareza',
      'Descobre como identificar a acumulação em ações lendo a compressão do preço, o comportamento do volume, a pressão vendedora que falha e a confirmação, sem alarido diário.'),
    'multi-timeframe-support-resistance': (
      'Suportes e resistências em vários períodos, lidos com clareza',
      'Descobre como os suportes e resistências em vários períodos revelam a hierarquia do preço, o conflito e as zonas de decisão, sem confusão, promessas de certeza ou alertas cegos.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Como saber se um indicador repinta na TradingView',
      'Descobre como saber se um indicador repinta na TradingView. Testa os traçados históricos, os alertas e a lógica de vários períodos antes de confiares num gráfico ao vivo.'),
  },
  'nl': {
    'pentarch-cycle-phases-explained': (
      'De fasen van de Pentarch-cyclus uitgelegd voor helderdere grafieken',
      'De fasen van de Pentarch-cyclus geven traders een gestructureerde manier om veranderend koersgedrag te lezen. Ontdek wat de gebeurtenissen TD, IGN, WRN, CAP en BDN moeten tonen.'),
    'tradingview-indicators-free-trial': (
      'Wat je moet testen in een gratis proefperiode van TradingView-indicatoren',
      'Gebruik een gratis proefperiode van TradingView-indicatoren om grafiekhelderheid, documentatie, toegang en analytische aansluiting te beoordelen voordat je een hulpmiddel voor je dagelijkse werk kiest.'),
    'risk-management-rules-for-traders': (
      '7 regels voor risicobeheer voor traders die helderheid waarderen',
      'Regels voor risicobeheer trekken grenzen rond onzekerheid, blootstelling, uitvoering en evaluatie, zodat één enkele mening nooit de rekening stuurt.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Gids voor de TradingView-indicator die uitbraken bevestigt',
      'Een TradingView-indicator die uitbraken bevestigt hoort deelname, doorzetting en ongeldigheid te verhelderen, zonder een grafiek in een signalendienst te veranderen.'),
    'how-to-avoid-late-trade-entries': (
      'Hoe je late instappen vermijdt zonder de koers achterna te lopen',
      'Ontdek hoe je late instappen vermijdt met vaste triggers, grenzen aan uitrekking en onderbouwde grafiekmetingen die het achternalopen elke dag door discipline vervangen.'),
    'momentum-confirmation-trading-indicator-explained': (
      'De indicator die momentum bevestigt, uitgelegd',
      'Ontdek hoe een indicator die momentum bevestigt deelname aan de koers, tijdscontext en wegebbende druk kan verhelderen zonder je oordeel te vervangen.'),
    'what-a-market-cycle-indicator-shows': (
      'Wat een marktcyclus-indicator werkelijk laat zien',
      'Een marktcyclus-indicator ordent koers, momentum en volume in leesbare fasen en helpt traders om structurele verschuivingen elke dag met meer helderheid te bestuderen.'),
    'volume-regime-trading-strategy': (
      'Een volumeregime-strategie voor deelname',
      'Ontdek hoe een volumeregime-strategie deelname indeelt, rustige van actieve omstandigheden scheidt en gestructureerde grafiekanalyse helder verbetert.'),
    'wyckoff-accumulation-indicator': (
      'Wat een Wyckoff-accumulatie-indicator meet',
      'Ontdek wat een Wyckoff-accumulatie-indicator wel en niet kan tonen, hoe je koers- en volumecontext leest en waarom structuur helder meer telt dan meldingen.'),
    'how-to-scan-stocks-on-tradingview': (
      'Hoe je met een doel aandelen scant op TradingView',
      'Ontdek hoe je aandelen scant op TradingView met gerichte filters, schone resultaten en een herhaalbare manier om fondsen te onderzoeken zonder ruis of rommel achterna te lopen.'),
    'automatic-support-resistance-indicator-explained': (
      'De automatische steun- en weerstandsindicator uitgelegd',
      'Ontdek hoe een automatische steun- en weerstandsindicator veranderende koersniveaus in kaart brengt, ruis in de grafiek filtert en elke dag een gedisciplineerde werkwijze in TradingView ondersteunt.'),
    'obv-divergence-strategy': (
      'OBV-divergentiestrategie om volume te lezen',
      'Ontdek een OBV-divergentiestrategie die koersdruk en volumedruk vergelijkt, zwakke metingen filtert en context schetst zonder blinde meldingen of vage beloften.'),
    'how-to-identify-accumulation-in-stocks': (
      'Hoe je accumulatie in aandelen helder herkent',
      'Ontdek hoe je accumulatie in aandelen herkent door koerscompressie, volumegedrag, mislukte verkoopdruk en bevestiging te lezen, zonder dagelijkse ophef.'),
    'multi-timeframe-support-resistance': (
      'Steun en weerstand over meerdere tijdframes, helder gelezen',
      'Ontdek hoe steun en weerstand over meerdere tijdframes de rangorde van de koers, conflicten en beslissingszones tonen, zonder rommel, zekerheidsclaims of blinde meldingen.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Hoe je merkt of een indicator hertekent op TradingView',
      'Ontdek hoe je merkt of een indicator hertekent op TradingView. Test historische plots, meldingen en logica over meerdere tijdframes voordat je op een live grafiek vertrouwt.'),
  },
  'ru': {
    'pentarch-cycle-phases-explained': (
      'Фазы цикла Pentarch: объяснение для более чистых графиков',
      'Фазы цикла Pentarch дают трейдерам структурированный способ читать меняющееся поведение цены. Узнай, что должны показывать события TD, IGN, WRN, CAP и BDN.'),
    'tradingview-indicators-free-trial': (
      'Что проверить в бесплатном пробном периоде индикаторов TradingView',
      'Используй бесплатный пробный период индикаторов TradingView, чтобы оценить ясность графика, документацию, доступ и аналитическое соответствие, прежде чем выбирать инструмент для ежедневной работы.'),
    'risk-management-rules-for-traders': (
      '7 правил управления риском для трейдеров, ценящих ясность',
      'Правила управления риском для трейдеров очерчивают границы вокруг неопределённости, экспозиции, исполнения и разбора, чтобы одно мнение никогда не управляло счётом.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Руководство по индикатору подтверждения пробоя в TradingView',
      'Индикатор подтверждения пробоя в TradingView должен прояснять участие, продолжение движения и отмену сигнала, не превращая график в сервис сигналов.'),
    'how-to-avoid-late-trade-entries': (
      'Как избежать поздних входов и не гнаться за ценой',
      'Узнай, как избежать поздних входов с помощью заданных триггеров, пределов растяжения и подкреплённого чтения графика, которое каждый день заменяет погоню дисциплиной.'),
    'momentum-confirmation-trading-indicator-explained': (
      'Индикатор подтверждения импульса: объяснение',
      'Узнай, как индикатор подтверждения импульса проясняет участие в движении цены, временной контекст и угасающее давление, не заменяя твоё суждение.'),
    'what-a-market-cycle-indicator-shows': (
      'Что на самом деле показывает индикатор рыночного цикла',
      'Индикатор рыночного цикла раскладывает цену, импульс и объём на читаемые фазы и помогает трейдерам каждый день изучать структурные сдвиги с большей ясностью.'),
    'volume-regime-trading-strategy': (
      'Стратегия режимов объёма для оценки участия',
      'Узнай, как стратегия режимов объёма классифицирует участие, отделяет спокойные условия от активных и ясно улучшает структурный анализ графика.'),
    'wyckoff-accumulation-indicator': (
      'Что измеряет индикатор накопления по Вайкоффу',
      'Узнай, что индикатор накопления по Вайкоффу может показать, а что нет, как читать контекст цены и объёма и почему структура ясно важнее оповещений.'),
    'how-to-scan-stocks-on-tradingview': (
      'Как осмысленно сканировать акции в TradingView',
      'Узнай, как сканировать акции в TradingView с точными фильтрами, чистыми результатами и повторяемым способом изучать бумаги, не гоняясь за шумом и беспорядком.'),
    'automatic-support-resistance-indicator-explained': (
      'Автоматический индикатор поддержки и сопротивления: объяснение',
      'Узнай, как автоматический индикатор поддержки и сопротивления размечает меняющиеся уровни цены, отсеивает шум графика и каждый день поддерживает дисциплинированную работу в TradingView.'),
    'obv-divergence-strategy': (
      'Стратегия дивергенции OBV для чтения объёма',
      'Узнай стратегию дивергенции OBV, которая сравнивает давление цены и объёма, отсеивает слабые показания и задаёт контекст без слепых оповещений и туманных обещаний.'),
    'how-to-identify-accumulation-in-stocks': (
      'Как ясно распознать накопление в акциях',
      'Узнай, как распознать накопление в акциях, читая сжатие цены, поведение объёма, сорвавшееся давление продаж и подтверждение, без ежедневного шума.'),
    'multi-timeframe-support-resistance': (
      'Поддержка и сопротивление на нескольких таймфреймах, прочитанные ясно',
      'Узнай, как поддержка и сопротивление на нескольких таймфреймах раскрывают иерархию цены, конфликт и зоны решения, без беспорядка, обещаний определённости и слепых оповещений.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Как понять, что индикатор перерисовывает в TradingView',
      'Узнай, как понять, что индикатор перерисовывает в TradingView. Проверь исторические построения, оповещения и логику нескольких таймфреймов, прежде чем полагаться на живой график.'),
  },
  'ja': {
    'pentarch-cycle-phases-explained': (
      'ペンターク・サイクルの局面をわかりやすく解説',
      'ペンターク・サイクルの局面は、変化する値動きを読むための構造的な手がかりをトレーダーに与えます。TD、IGN、WRN、CAP、BDN の各イベントが何を示すのかを学びましょう。'),
    'tradingview-indicators-free-trial': (
      'TradingView インジケーターの無料トライアルで試すべきこと',
      'TradingView インジケーターの無料トライアルを使って、チャートの明快さ、ドキュメント、アクセス、分析上の適合を確かめてから、日々の作業に使うツールを選びましょう。'),
    'risk-management-rules-for-traders': (
      '明快さを重んじるトレーダーのためのリスク管理7原則',
      'トレーダーのためのリスク管理ルールは、不確実性、エクスポージャー、執行、振り返りに境界を引き、ひとつの意見が口座を支配しないようにします。'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'TradingView ブレイクアウト確認インジケーター入門',
      'TradingView のブレイクアウト確認インジケーターは、参加、追随、無効化を明らかにするべきであり、チャートをシグナル配信サービスに変えるものではありません。'),
    'how-to-avoid-late-trade-entries': (
      '追いかけずに遅いエントリーを避ける方法',
      '明確なトリガー、行き過ぎの上限、根拠にもとづくチャートの読み方で遅いエントリーを避け、日々の追いかけを規律に置き換える方法を学びましょう。'),
    'momentum-confirmation-trading-indicator-explained': (
      'モメンタム確認インジケーターの解説',
      'モメンタム確認インジケーターが、値動きへの参加、タイミングの文脈、衰えていく圧力を、判断を置き換えることなくどう明らかにするのかを学びましょう。'),
    'what-a-market-cycle-indicator-shows': (
      'マーケットサイクル・インジケーターが実際に示すもの',
      'マーケットサイクル・インジケーターは価格、モメンタム、出来高を読み取れる局面へ整理し、トレーダーが構造の変化を日々より明快に調べる助けになります。'),
    'volume-regime-trading-strategy': (
      '参加を捉えるための出来高レジーム戦略',
      '出来高レジーム戦略が参加をどう分類し、静かな状態と活発な状態をどう分け、構造的なチャート分析を明快に高めるのかを学びましょう。'),
    'wyckoff-accumulation-indicator': (
      'ワイコフ蓄積インジケーターが測るもの',
      'ワイコフ蓄積インジケーターに何が示せて何が示せないのか、価格と出来高の文脈をどう読むのか、そしてなぜ構造がアラートより明快に重要なのかを学びましょう。'),
    'how-to-scan-stocks-on-tradingview': (
      '目的をもって TradingView で銘柄をスクリーニングする方法',
      '絞り込んだフィルター、整理された結果、繰り返せる調べ方で、ノイズや雑然さを追わずに TradingView で銘柄をスクリーニングする方法を学びましょう。'),
    'automatic-support-resistance-indicator-explained': (
      '自動サポート・レジスタンス・インジケーターの解説',
      '自動サポート・レジスタンス・インジケーターが、動く価格水準をどう描き、チャートのノイズをどう除き、TradingView での規律ある作業を日々どう支えるのかを学びましょう。'),
    'obv-divergence-strategy': (
      '出来高を読むための OBV ダイバージェンス戦略',
      '価格の圧力と出来高の圧力を比べ、弱い読み取りを除き、盲目的なアラートや曖昧な約束なしに文脈を示す OBV ダイバージェンス戦略を学びましょう。'),
    'how-to-identify-accumulation-in-stocks': (
      '株式の蓄積を明快に見分ける方法',
      '価格の圧縮、出来高の振る舞い、失速した売り圧力、そして確認を読むことで、日々の誇大宣伝に頼らず株式の蓄積を見分ける方法を学びましょう。'),
    'multi-timeframe-support-resistance': (
      '複数時間軸のサポートとレジスタンスを明快に読む',
      '複数時間軸のサポートとレジスタンスが、雑然さも確実性の主張も盲目的なアラートもなしに、価格の階層、対立、判断の領域をどう明らかにするのかを学びましょう。'),
    'how-to-tell-if-an-indicator-repaints': (
      'TradingView でインジケーターがリペイントするか見分ける方法',
      'TradingView でインジケーターがリペイントするかを見分ける方法を学びましょう。ライブチャートに頼る前に、過去の描画、アラート、複数時間軸のロジックを試してください。'),
  },
  'tr': {
    'pentarch-cycle-phases-explained': (
      'Daha net grafikler için Pentarch döngü aşamaları',
      'Pentarch döngü aşamaları, değişen fiyat davranışını okumak için yatırımcılara yapılandırılmış bir yol sunar. TD, IGN, WRN, CAP ve BDN olaylarının neyi göstermek üzere tasarlandığını öğren.'),
    'tradingview-indicators-free-trial': (
      'TradingView göstergelerinin ücretsiz denemesinde neleri sınamalısın',
      'Günlük çalışmanda kullanacağın aracı seçmeden önce grafik netliğini, belgeleri, erişimi ve analitik uyumu değerlendirmek için TradingView göstergelerinin ücretsiz denemesini kullan.'),
    'risk-management-rules-for-traders': (
      'Netliğe önem veren yatırımcılar için 7 risk yönetimi kuralı',
      'Yatırımcılar için risk yönetimi kuralları; belirsizlik, maruziyet, uygulama ve gözden geçirme çevresine sınır çizer, böylece tek bir görüş hesabı asla yönetmez.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'TradingView kırılım onayı göstergesi rehberi',
      'TradingView kırılım onayı göstergesi; katılımı, hareketin sürmesini ve geçersizleşmeyi netleştirmeli, grafiği bir sinyal servisine dönüştürmemelidir.'),
    'how-to-avoid-late-trade-entries': (
      'Fiyatın peşinden koşmadan geç girişlerden nasıl kaçınılır',
      'Tanımlı tetikleyiciler, aşırı uzama sınırları ve kanıta dayalı grafik okumalarıyla geç girişlerden nasıl kaçınacağını öğren; her gün koşturmanın yerini disiplin alsın.'),
    'momentum-confirmation-trading-indicator-explained': (
      'Momentum onayı göstergesi açıklanıyor',
      'Bir momentum onayı göstergesinin, senin yargını değiştirmeden fiyata katılımı, zamanlama bağlamını ve zayıflayan baskıyı nasıl netleştirebileceğini öğren.'),
    'what-a-market-cycle-indicator-shows': (
      'Piyasa döngüsü göstergesi gerçekte neyi gösterir',
      'Piyasa döngüsü göstergesi fiyatı, momentumu ve hacmi okunabilir aşamalara ayırır; yatırımcıların yapısal kaymaları her gün daha net incelemesine yardım eder.'),
    'volume-regime-trading-strategy': (
      'Katılım için bir hacim rejimi stratejisi',
      'Bir hacim rejimi stratejisinin katılımı nasıl sınıflandırdığını, sakin koşulları hareketli olanlardan nasıl ayırdığını ve yapılandırılmış grafik analizini nasıl netleştirdiğini öğren.'),
    'wyckoff-accumulation-indicator': (
      'Wyckoff birikim göstergesi neyi ölçer',
      'Wyckoff birikim göstergesinin neyi gösterebildiğini ve neyi gösteremediğini, fiyat ile hacim bağlamını nasıl okuyacağını ve yapının uyarılardan neden net biçimde daha önemli olduğunu öğren.'),
    'how-to-scan-stocks-on-tradingview': (
      "TradingView'de hisseleri amaçlı biçimde nasıl tararsın",
      "Odaklı filtreler, temiz sonuçlar ve tekrarlanabilir bir yöntemle, gürültü ya da dağınıklık peşinde koşmadan TradingView'de hisseleri nasıl tarayacağını öğren."),
    'automatic-support-resistance-indicator-explained': (
      'Otomatik destek direnç göstergesi açıklanıyor',
      "Otomatik destek direnç göstergesinin değişen fiyat seviyelerini nasıl haritaladığını, grafik gürültüsünü nasıl elediğini ve TradingView'de disiplinli bir akışı her gün nasıl desteklediğini öğren."),
    'obv-divergence-strategy': (
      'Hacmi okumak için OBV uyumsuzluk stratejisi',
      'Fiyat ile hacim baskısını karşılaştıran, zayıf okumaları eleyen ve kör uyarılar ya da belirsiz vaatler olmadan bağlam kuran bir OBV uyumsuzluk stratejisi öğren.'),
    'how-to-identify-accumulation-in-stocks': (
      'Hisselerde birikimi net biçimde nasıl tanırsın',
      'Fiyat sıkışmasını, hacim davranışını, başarısız satış baskısını ve onayı okuyarak, günlük abartıya kapılmadan hisselerde birikimi nasıl tanıyacağını öğren.'),
    'multi-timeframe-support-resistance': (
      'Çoklu zaman diliminde destek ve direnci net okumak',
      'Çoklu zaman diliminde destek ve direncin, dağınıklık, kesinlik iddiası ya da kör uyarı olmadan fiyat hiyerarşisini, çatışmayı ve karar bölgelerini nasıl ortaya koyduğunu öğren.'),
    'how-to-tell-if-an-indicator-repaints': (
      "TradingView'de bir gösterge yeniden çiziyor mu, nasıl anlarsın",
      "TradingView'de bir göstergenin yeniden çizip çizmediğini nasıl anlayacağını öğren. Canlı bir grafiğe güvenmeden önce geçmiş çizimleri, uyarıları ve çoklu zaman dilimi mantığını sına."),
  },
  'hu': {
    'pentarch-cycle-phases-explained': (
      'A Pentarch ciklus fázisai a tisztább grafikonokért',
      'A Pentarch ciklus fázisai strukturált módot adnak a kereskedőknek a változó árfolyam-viselkedés olvasására. Tudd meg, mit hivatottak mutatni a TD, IGN, WRN, CAP és BDN események.'),
    'tradingview-indicators-free-trial': (
      'Mit érdemes kipróbálni a TradingView indikátorok ingyenes próbájában',
      'Használd a TradingView indikátorok ingyenes próbáját, hogy felmérd a grafikon áttekinthetőségét, a dokumentációt, a hozzáférést és az elemzési illeszkedést, mielőtt eszközt választasz a napi munkádhoz.'),
    'risk-management-rules-for-traders': (
      '7 kockázatkezelési szabály a tisztánlátást kereső kereskedőknek',
      'A kereskedők kockázatkezelési szabályai határt szabnak a bizonytalanságnak, a kitettségnek, a végrehajtásnak és a kiértékelésnek, hogy egyetlen vélemény se irányítsa a számlát.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'Útmutató a TradingView kitörésmegerősítő indikátorához',
      'A TradingView kitörésmegerősítő indikátorának a részvételt, a folytatást és az érvénytelenné válást kell tisztáznia, anélkül hogy a grafikonból jelzésszolgáltatás lenne.'),
    'how-to-avoid-late-trade-entries': (
      'Hogyan kerüld el a késői belépőket kapkodás nélkül',
      'Tudd meg, hogyan kerülöd el a késői belépőket meghatározott kiváltó jelekkel, túlnyúlási korlátokkal és bizonyítékra épülő grafikonolvasással, amely nap mint nap fegyelemre cseréli a kapkodást.'),
    'momentum-confirmation-trading-indicator-explained': (
      'A momentum-megerősítő indikátor bemutatása',
      'Tudd meg, hogyan tisztázhatja egy momentum-megerősítő indikátor az árfolyamban való részvételt, az időzítés összefüggéseit és a lanyhuló nyomást anélkül, hogy a saját ítéletedet helyettesítené.'),
    'what-a-market-cycle-indicator-shows': (
      'Mit mutat valójában egy piaci ciklus indikátor',
      'A piaci ciklus indikátor olvasható fázisokba rendezi az árat, a momentumot és a forgalmat, és segít a kereskedőknek nap mint nap tisztábban vizsgálni a szerkezeti elmozdulásokat.'),
    'volume-regime-trading-strategy': (
      'Forgalmi rezsim stratégia a részvétel megítéléséhez',
      'Tudd meg, hogyan sorolja be egy forgalmi rezsim stratégia a részvételt, hogyan választja el a csendes állapotot az élénktől, és hogyan javítja tisztán a szerkezetes grafikonelemzést.'),
    'wyckoff-accumulation-indicator': (
      'Mit mér egy Wyckoff-akkumulációs indikátor',
      'Tudd meg, mit tud és mit nem tud megmutatni egy Wyckoff-akkumulációs indikátor, hogyan olvasd az ár és a forgalom összefüggéseit, és miért számít a szerkezet tisztán többet a riasztásoknál.'),
    'how-to-scan-stocks-on-tradingview': (
      'Hogyan szűrj részvényeket a TradingView-on céltudatosan',
      'Tudd meg, hogyan szűrsz részvényeket a TradingView-on célzott szűrőkkel, tiszta találatokkal és ismételhető módszerrel, anélkül hogy zaj vagy zsúfoltság után futnál.'),
    'automatic-support-resistance-indicator-explained': (
      'Az automatikus támasz- és ellenállásindikátor bemutatása',
      'Tudd meg, hogyan térképezi fel egy automatikus támasz- és ellenállásindikátor a változó árszinteket, hogyan szűri a grafikon zaját, és hogyan támogat nap mint nap fegyelmezett TradingView-munkát.'),
    'obv-divergence-strategy': (
      'OBV-divergencia stratégia a forgalom olvasásához',
      'Ismerj meg egy OBV-divergencia stratégiát, amely összeveti az ár és a forgalom nyomását, kiszűri a gyenge jelzéseket, és összefüggést ad vak riasztások és ködös ígéretek nélkül.'),
    'how-to-identify-accumulation-in-stocks': (
      'Hogyan ismerd fel tisztán a részvények akkumulációját',
      'Tudd meg, hogyan ismered fel a részvények akkumulációját az ár összeszűkülésének, a forgalom viselkedésének, az elakadt eladói nyomásnak és a megerősítésnek az olvasásával, napi hájpolás nélkül.'),
    'multi-timeframe-support-resistance': (
      'Több idősík támasza és ellenállása, tisztán olvasva',
      'Tudd meg, hogyan tárja fel a több idősík támasza és ellenállása az árszintek rangsorát, az ellentmondást és a döntési zónákat, zsúfoltság, biztosságot ígérő állítások és vak riasztások nélkül.'),
    'how-to-tell-if-an-indicator-repaints': (
      'Hogyan derül ki, hogy egy indikátor újrarajzol a TradingView-on',
      'Tudd meg, hogyan derítheted ki, hogy egy indikátor újrarajzol-e a TradingView-on. Teszteld a múltbeli ábrázolást, a riasztásokat és a több idősíkos logikát, mielőtt élő grafikonra hagyatkoznál.'),
  },
  'ar': {
    'pentarch-cycle-phases-explained': (
      'شرح مراحل دورة Pentarch لرسوم بيانية أوضح',
      'تمنح مراحل دورة Pentarch المتداولين طريقة منظّمة لقراءة سلوك السعر المتغيّر. تعرّف على ما تهدف أحداث TD وIGN وWRN وCAP وBDN إلى إظهاره.'),
    'tradingview-indicators-free-trial': (
      'ما الذي تختبره في التجربة المجانية لمؤشرات TradingView',
      'استخدم التجربة المجانية لمؤشرات TradingView لتقييم وضوح الرسم البياني والتوثيق وسهولة الوصول والملاءمة التحليلية قبل اختيار أداة لعملك اليومي.'),
    'risk-management-rules-for-traders': (
      '7 قواعد لإدارة المخاطر للمتداولين الذين يقدّرون الوضوح',
      'تضع قواعد إدارة المخاطر للمتداولين حدودًا حول عدم اليقين والانكشاف والتنفيذ والمراجعة، حتى لا يتحكّم رأي واحد في الحساب أبدًا.'),
    'tradingview-breakout-confirmation-indicator-guide': (
      'دليل مؤشر تأكيد الاختراق على TradingView',
      'ينبغي لمؤشر تأكيد الاختراق على TradingView أن يوضّح المشاركة واستمرار الحركة وإبطال الإشارة، دون أن يحوّل الرسم البياني إلى خدمة توصيات.'),
    'how-to-avoid-late-trade-entries': (
      'كيف تتجنّب الدخول المتأخّر دون مطاردة السعر',
      'تعرّف على كيفية تجنّب الدخول المتأخّر عبر محفّزات محدّدة وحدود للامتداد وقراءات مدعومة بالأدلة تستبدل المطاردة بالانضباط يوميًا.'),
    'momentum-confirmation-trading-indicator-explained': (
      'شرح مؤشر تأكيد الزخم',
      'تعرّف على كيف يوضّح مؤشر تأكيد الزخم المشاركة في حركة السعر وسياق التوقيت والضغط المتلاشي دون أن يحلّ محلّ حكمك.'),
    'what-a-market-cycle-indicator-shows': (
      'ما الذي يظهره مؤشر دورة السوق فعليًا',
      'ينظّم مؤشر دورة السوق السعر والزخم والحجم في مراحل قابلة للقراءة، ويساعد المتداولين على دراسة التحوّلات البنيوية يوميًا بوضوح أكبر.'),
    'volume-regime-trading-strategy': (
      'استراتيجية أنظمة الحجم لقياس المشاركة',
      'تعرّف على كيف تصنّف استراتيجية أنظمة الحجم المشاركة، وتفصل الظروف الهادئة عن النشطة، وتحسّن تحليل الرسم البياني المنظّم بوضوح.'),
    'wyckoff-accumulation-indicator': (
      'ما الذي يقيسه مؤشر تجميع وايكوف',
      'تعرّف على ما يمكن لمؤشر تجميع وايكوف إظهاره وما لا يمكنه، وكيف تقرأ سياق السعر والحجم، ولماذا تهمّ البنية بوضوح أكثر من التنبيهات.'),
    'how-to-scan-stocks-on-tradingview': (
      'كيف تفحص الأسهم على TradingView بهدف واضح',
      'تعرّف على كيفية فحص الأسهم على TradingView بمرشّحات مركّزة ونتائج نظيفة وطريقة قابلة للتكرار لبحث الأسهم دون مطاردة الضجيج أو الفوضى.'),
    'automatic-support-resistance-indicator-explained': (
      'شرح مؤشر الدعم والمقاومة التلقائي',
      'تعرّف على كيف يرسم مؤشر الدعم والمقاومة التلقائي مستويات السعر المتغيّرة، ويصفّي ضجيج الرسم البياني، ويدعم سير عمل منضبطًا على TradingView يوميًا.'),
    'obv-divergence-strategy': (
      'استراتيجية تباعد OBV لقراءة الحجم',
      'تعرّف على استراتيجية تباعد OBV التي تقارن ضغط السعر بضغط الحجم، وتصفّي القراءات الضعيفة، وتضع السياق دون تنبيهات عمياء أو وعود غامضة.'),
    'how-to-identify-accumulation-in-stocks': (
      'كيف تتعرّف على التجميع في الأسهم بوضوح',
      'تعرّف على كيفية تمييز التجميع في الأسهم بقراءة انضغاط السعر وسلوك الحجم وضغط البيع المتعثّر والتأكيد، دون ضجيج يومي.'),
    'multi-timeframe-support-resistance': (
      'الدعم والمقاومة على أطر زمنية متعدّدة، بقراءة واضحة',
      'تعرّف على كيف يكشف الدعم والمقاومة على أطر زمنية متعدّدة تسلسل السعر والتعارض ومناطق القرار، دون فوضى أو ادّعاءات يقين أو تنبيهات عمياء.'),
    'how-to-tell-if-an-indicator-repaints': (
      'كيف تعرف أن مؤشرًا يعيد الرسم على TradingView',
      'تعرّف على كيفية معرفة ما إذا كان مؤشر يعيد الرسم على TradingView. اختبر الرسوم التاريخية والتنبيهات ومنطق الأطر الزمنية المتعدّدة قبل الاعتماد على أي رسم بياني حيّ.'),
  },
}

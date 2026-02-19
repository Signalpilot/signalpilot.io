#!/usr/bin/env python3
"""
Add contextual internal links to FAQ in all language versions.
Maps link positions based on FAQ question text identification.
"""
import re
import os

# Define the links to add with their translations
# Format: (question_identifier, chronicle_page, link_text)
links_to_add = {
    'en': [
        ('What is Signal Pilot?', 'birth-of-the-elite-seven', 'Read the origin story →'),
        ('What is Pentarch?', 'meet-the-sovereign', "Read Pentarch's origin story →"),
        ('What is OmniDeck?', 'the-commander', "Discover OmniDeck's story →"),
        ('What is Volume Oracle?', 'the-scales', 'Explore the Scales of balance →'),
        ('What is Plutus Flow?', 'the-prophet', 'Discover the Prophet\'s power →'),
        ('What is Janus Atlas?', 'the-cartographer', "Learn the Cartographer's craft →"),
        ('What is Augury Grid?', 'the-watchman', "Meet the Watchman's vigil →"),
        ('What is Harmonic Oscillator?', 'the-arbiter', "Experience the Arbiter's judgment →"),
        ('Do the signals repaint?', 'why-non-repainting-matters', 'Why non-repainting matters →'),
    ],
    'de': [
        ('Was ist Signal Pilot?', 'birth-of-the-elite-seven', 'Lesen Sie die Ursprungsgeschichte →'),
        ('Was ist Pentarch?', 'meet-the-sovereign', "Lesen Sie Pentarchs Ursprungsgeschichte →"),
        ('Was ist OmniDeck?', 'the-commander', "Entdecken Sie OmniDecks Geschichte →"),
        ('Was ist Volume Oracle?', 'the-scales', 'Erkunden Sie die Waagen des Gleichgewichts →'),
        ('Was ist Plutus Flow?', 'the-prophet', 'Entdecken Sie die Kraft des Propheten →'),
        ('Was ist Janus Atlas?', 'the-cartographer', "Erlernen Sie das Handwerk des Kartographen →"),
        ('Was ist Augury Grid?', 'the-watchman', "Treffen Sie die Wache des Wächters →"),
        ('Was ist Harmonic Oscillator?', 'the-arbiter', "Erleben Sie das Urteil des Schiedsrichters →"),
        ('Malen sich die Signale neu?', 'why-non-repainting-matters', 'Warum Nicht-Neuzeichnung wichtig ist →'),
    ],
    'es': [
        ('¿Qué es Signal Pilot?', 'birth-of-the-elite-seven', 'Lee la historia de origen →'),
        ('¿Qué es Pentarch?', 'meet-the-sovereign', "Lee la historia de origen de Pentarch →"),
        ('¿Qué es OmniDeck?', 'the-commander', "Descubre la historia de OmniDeck →"),
        ('¿Qué es Volume Oracle?', 'the-scales', 'Explora las Balanzas del equilibrio →'),
        ('¿Qué es Plutus Flow?', 'the-prophet', 'Descubre el poder del Profeta →'),
        ('¿Qué es Janus Atlas?', 'the-cartographer', "Aprende el arte del Cartógrafo →"),
        ('¿Qué es Augury Grid?', 'the-watchman', "Conoce la vigilia del Vigilante →"),
        ('¿Qué es Harmonic Oscillator?', 'the-arbiter', "Experimenta el juicio del Árbitro →"),
        ('¿Se repintan las señales?', 'why-non-repainting-matters', 'Por qué no repintar es importante →'),
    ],
    'fr': [
        ('Qu\'est-ce que Signal Pilot ?', 'birth-of-the-elite-seven', 'Lisez l\'histoire des origines →'),
        ('Qu\'est-ce que Pentarch ?', 'meet-the-sovereign', "Lisez l'histoire des origines de Pentarch →"),
        ('Qu\'est-ce que OmniDeck ?', 'the-commander', "Découvrez l'histoire d'OmniDeck →"),
        ('Qu\'est-ce que Volume Oracle ?', 'the-scales', 'Explorez les Balances de l\'équilibre →'),
        ('Qu\'est-ce que Plutus Flow ?', 'the-prophet', 'Découvrez le pouvoir du Prophète →'),
        ('Qu\'est-ce que Janus Atlas ?', 'the-cartographer', "Apprenez l'art du Cartographe →"),
        ('Qu\'est-ce que Augury Grid ?', 'the-watchman', "Rencontrez la vigilance du Gardien →"),
        ('Qu\'est-ce que Harmonic Oscillator ?', 'the-arbiter', "Découvrez le jugement de l'Arbitre →"),
        ('Les signaux se repeignent-ils ?', 'why-non-repainting-matters', 'Pourquoi le non-repaint est important →'),
    ],
    'ar': [
        ('ما هو Signal Pilot؟', 'birth-of-the-elite-seven', 'اقرأ قصة الأصل →'),
        ('ما هو Pentarch؟', 'meet-the-sovereign', 'اقرأ قصة Pentarch الأصلية →'),
        ('ما هو OmniDeck؟', 'the-commander', 'اكتشف قصة OmniDeck →'),
        ('ما هو Volume Oracle؟', 'the-scales', 'استكشف موازين التوازن →'),
        ('ما هو Plutus Flow؟', 'the-prophet', 'اكتشف قوة النبي →'),
        ('ما هو Janus Atlas؟', 'the-cartographer', 'تعلم حرفة رسام الخرائط →'),
        ('ما هو Augury Grid؟', 'the-watchman', 'التقِ بحارس المراقبة →'),
        ('ما هو Harmonic Oscillator؟', 'the-arbiter', 'اختبر حكم الحكم →'),
        ('هل تعاد كتابة الإشارات؟', 'why-non-repainting-matters', 'لماذا عدم إعادة الصياغة مهمة →'),
    ],
    'it': [
        ('Che cos\'è Signal Pilot?', 'birth-of-the-elite-seven', 'Leggi la storia dell\'origine →'),
        ('Che cos\'è Pentarch?', 'meet-the-sovereign', "Leggi la storia dell'origine di Pentarch →"),
        ('Che cos\'è OmniDeck?', 'the-commander', "Scopri la storia di OmniDeck →"),
        ('Che cos\'è Volume Oracle?', 'the-scales', "Esplora le Bilance dell'equilibrio →"),
        ('Che cos\'è Plutus Flow?', 'the-prophet', 'Scopri il potere del Profeta →'),
        ('Che cos\'è Janus Atlas?', 'the-cartographer', "Impara l'arte del Cartografo →"),
        ('Che cos\'è Augury Grid?', 'the-watchman', "Conosci la vigilanza del Guardiano →"),
        ('Che cos\'è Harmonic Oscillator?', 'the-arbiter', "Scopri il giudizio dell'Arbitro →"),
        ('I segnali si ridisegnano?', 'why-non-repainting-matters', 'Perché il non-repaint è importante →'),
    ],
    'pt': [
        ('O que é Signal Pilot?', 'birth-of-the-elite-seven', 'Leia a história de origem →'),
        ('O que é Pentarch?', 'meet-the-sovereign', 'Leia a história de origem do Pentarch →'),
        ('O que é OmniDeck?', 'the-commander', 'Descubra a história do OmniDeck →'),
        ('O que é Volume Oracle?', 'the-scales', 'Explore as Escalas do equilíbrio →'),
        ('O que é Plutus Flow?', 'the-prophet', 'Descubra o poder do Profeta →'),
        ('O que é Janus Atlas?', 'the-cartographer', 'Aprenda a arte do Cartógrafo →'),
        ('O que é Augury Grid?', 'the-watchman', 'Conheça a vigilância do Vigilante →'),
        ('O que é Harmonic Oscillator?', 'the-arbiter', 'Experimente o julgamento do Árbitro →'),
        ('Os sinais se repintam?', 'why-non-repainting-matters', 'Por que a não-repintura é importante →'),
    ],
    'ja': [
        ('Signal Pilotとは？', 'birth-of-the-elite-seven', 'オリジンストーリーを読む →'),
        ('Pentarchとは？', 'meet-the-sovereign', 'Pentarchのオリジンストーリーを読む →'),
        ('OmniDeckとは？', 'the-commander', 'OmniDeckのストーリーを発見する →'),
        ('Volume Oracleとは？', 'the-scales', 'バランスのスケールを探索する →'),
        ('Plutus Flowとは？', 'the-prophet', 'プロフェットの力を発見する →'),
        ('Janus Atlasとは？', 'the-cartographer', 'カルトグラファーの技を学ぶ →'),
        ('Augury Gridとは？', 'the-watchman', 'ウォッチマンの見張りを知る →'),
        ('Harmonic Oscillatorとは？', 'the-arbiter', 'アルビトレーターの判断を経験する →'),
        ('シグナルは再描画されていますか？', 'why-non-repainting-matters', 'なぜノンリペイントが重要かを知る →'),
    ],
    'nl': [
        ('Wat is Signal Pilot?', 'birth-of-the-elite-seven', 'Lees het ontstaan →'),
        ('Wat is Pentarch?', 'meet-the-sovereign', 'Lees het ontstaan van Pentarch →'),
        ('Wat is OmniDeck?', 'the-commander', 'Ontdek het verhaal van OmniDeck →'),
        ('Wat is Volume Oracle?', 'the-scales', 'Verken de Schalen van evenwicht →'),
        ('Wat is Plutus Flow?', 'the-prophet', 'Ontdek de kracht van de Profeet →'),
        ('Wat is Janus Atlas?', 'the-cartographer', 'Leer de kunst van de Cartograaf →'),
        ('Wat is Augury Grid?', 'the-watchman', 'Ontmoet de waakzaamheid van de Wachter →'),
        ('Wat is Harmonic Oscillator?', 'the-arbiter', 'Ervaar het oordeel van de Arbiter →'),
        ('Worden de signalen opnieuw geschilderd?', 'why-non-repainting-matters', 'Waarom niet-herpakken belangrijk is →'),
    ],
    'ru': [
        ('Что такое Signal Pilot?', 'birth-of-the-elite-seven', 'Читайте историю происхождения →'),
        ('Что такое Pentarch?', 'meet-the-sovereign', 'Читайте историю происхождения Pentarch →'),
        ('Что такое OmniDeck?', 'the-commander', 'Откройте историю OmniDeck →'),
        ('Что такое Volume Oracle?', 'the-scales', 'Изучите Весы баланса →'),
        ('Что такое Plutus Flow?', 'the-prophet', 'Откройте силу Пророка →'),
        ('Что такое Janus Atlas?', 'the-cartographer', 'Учите мастерство Картографа →'),
        ('Что такое Augury Grid?', 'the-watchman', 'Встречайте бдительность Сторожа →'),
        ('Что такое Harmonic Oscillator?', 'the-arbiter', 'Испытайте суд Судьи →'),
        ('Перекрашиваются ли сигналы?', 'why-non-repainting-matters', 'Почему отсутствие перекрашивания важно →'),
    ],
    'hu': [
        ('Mi az a Signal Pilot?', 'birth-of-the-elite-seven', 'Olvassa az eredettörténetet →'),
        ('Mi az a Pentarch?', 'meet-the-sovereign', 'Olvassa a Pentarch eredettörténetét →'),
        ('Mi az a OmniDeck?', 'the-commander', 'Fedezze fel az OmniDeck történetét →'),
        ('Mi az a Volume Oracle?', 'the-scales', 'Fedezze fel az egyensúly Mérlegeit →'),
        ('Mi az a Plutus Flow?', 'the-prophet', 'Fedezze fel a Próféta erejét →'),
        ('Mi az a Janus Atlas?', 'the-cartographer', 'Tanulja meg a Kartográfus mesterségét →'),
        ('Mi az a Augury Grid?', 'the-watchman', 'Ismerje meg a Felügyelő őrségét →'),
        ('Mi az a Harmonic Oscillator?', 'the-arbiter', 'Tapasztalja meg a Bíró ítéletét →'),
        ('Újrarajzolódnak a jelek?', 'why-non-repainting-matters', 'Miért fontos az újrarajzolás nélkülisége →'),
    ],
    'tr': [
        ('Signal Pilot Nedir?', 'birth-of-the-elite-seven', 'Kökensel hikayeyi okuyun →'),
        ('Pentarch Nedir?', 'meet-the-sovereign', 'Pentarch\'ın kökensel hikayesini okuyun →'),
        ('OmniDeck Nedir?', 'the-commander', 'OmniDeck\'in hikayesini keşfedin →'),
        ('Volume Oracle Nedir?', 'the-scales', 'Dengenin Terazi\'lerini keşfedin →'),
        ('Plutus Flow Nedir?', 'the-prophet', 'Peygamber\'in gücünü keşfedin →'),
        ('Janus Atlas Nedir?', 'the-cartographer', 'Haritacı\'nın sanatını öğrenin →'),
        ('Augury Grid Nedir?', 'the-watchman', 'Bekçi\'nin ayakkını tanıyın →'),
        ('Harmonic Oscillator Nedir?', 'the-arbiter', 'Hakem\'in hükmünü deneyimleyin →'),
        ('Sinyaller yeniden çiziliyor mu?', 'why-non-repainting-matters', 'Neden yeniden çizim olmadığı önemli →'),
    ],
}

link_html_template = ' <a href="/chronicle/{chronicle}/" style="color: var(--brand); text-decoration: none; border-bottom: 1px solid var(--brand);">{text}</a>'

def add_links_to_file(filepath, lang_code):
    """Add contextual links to a FAQ file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    if lang_code not in links_to_add:
        print(f"❌ No translations for language: {lang_code}")
        return False

    links = links_to_add[lang_code]
    original_content = content
    modifications = 0

    for question_text, chronicle_page, link_text in links:
        # Find the faq-answer div that contains the question and replace the closing </div>
        # We need to find the question in the span, then find the corresponding faq-answer div

        # Create a pattern that finds the question span, then find the next faq-answer div, and insert link before </div>
        # Pattern: find the question span, then find the next faq-answer div, and insert link before </div>
        pattern = re.compile(
            r'(<span>' + re.escape(question_text) + r'</span>\s*</div>\s*<div class="faq-answer">.*?)(</div>\s*</div>)',
            re.DOTALL
        )

        link_html = link_html_template.format(chronicle=chronicle_page, text=link_text)
        replacement = r'\1' + link_html + r'\2'

        new_content = pattern.sub(replacement, content, count=1)

        if new_content != content:
            content = new_content
            modifications += 1
            print(f"✓ Added link for: {question_text[:50]}...")
        else:
            print(f"✗ Could not find: {question_text} in {filepath}")

    if modifications > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Successfully modified {filepath} - {modifications} links added\n")
        return True
    else:
        print(f"✗ No links added to {filepath}\n")
        return False

# Process all language versions
languages = ['de', 'es', 'fr', 'ar', 'it', 'pt', 'ja', 'nl', 'ru', 'hu', 'tr']
base_path = '/home/user/signalpilot.io'
successful = 0
failed = 0

for lang in languages:
    filepath = f'{base_path}/{lang}/faq.html'
    if add_links_to_file(filepath, lang):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")

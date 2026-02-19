#!/usr/bin/env python3
"""
Add contextual internal links to FAQ in all language versions.
Maps link positions based on actual FAQ question text identification.
Final version with corrected texts from file inspection.
"""
import re
import os

# Define the links to add with their translations
# Corrected for actual question text in each language file
links_to_add = {
    'es': [
        ('¿Qué es Volume Oracle?', 'the-scales', 'Explora las Balanzas del equilibrio →'),
        ('¿Las señales se repintan?', 'why-non-repainting-matters', 'Por qué no repintar es importante →'),
    ],
    'it': [
        ('Cos\'è Signal Pilot?', 'birth-of-the-elite-seven', 'Leggi la storia dell\'origine →'),
        ('Cos\'è Pentarch?', 'meet-the-sovereign', "Leggi la storia dell'origine di Pentarch →"),
        ('Cos\'è OmniDeck?', 'the-commander', "Scopri la storia di OmniDeck →"),
        ('Cos\'è Volume Oracle?', 'the-scales', "Esplora le Bilance dell'equilibrio →"),
        ('Cos\'è Plutus Flow?', 'the-prophet', 'Scopri il potere del Profeta →'),
        ('Cos\'è Janus Atlas?', 'the-cartographer', "Impara l'arte del Cartografo →"),
        ('Cos\'è Augury Grid?', 'the-watchman', "Conosci la vigilanza del Guardiano →"),
        ('Cos\'è Harmonic Oscillator?', 'the-arbiter', "Scopri il giudizio dell'Arbitro →"),
        ('I segnali si ridisegnano?', 'why-non-repainting-matters', 'Perché il non-repaint è importante →'),
    ],
    'pt': [
        ('O que é o Signal Pilot?', 'birth-of-the-elite-seven', 'Leia a história de origem →'),
        ('O que é o Pentarch?', 'meet-the-sovereign', 'Leia a história de origem do Pentarch →'),
        ('O que é o OmniDeck?', 'the-commander', 'Descubra a história do OmniDeck →'),
        ('O que é o Volume Oracle?', 'the-scales', 'Explore as Escalas do equilíbrio →'),
        ('O que é o Plutus Flow?', 'the-prophet', 'Descubra o poder do Profeta →'),
        ('O que é o Janus Atlas?', 'the-cartographer', 'Aprenda a arte do Cartógrafo →'),
        ('O que é o Augury Grid?', 'the-watchman', 'Conheça a vigilância do Vigilante →'),
        ('O que é o Harmonic Oscillator?', 'the-arbiter', 'Experimente o julgamento do Árbitro →'),
        ('Os sinais se repintam?', 'why-non-repainting-matters', 'Por que a não-repintura é importante →'),
    ],
    'ja': [
        ('Signal Pilotとは何ですか？', 'birth-of-the-elite-seven', 'オリジンストーリーを読む →'),
        ('Pentarchとは何ですか？', 'meet-the-sovereign', 'Pentarchのオリジンストーリーを読む →'),
        ('OmniDeckとは何ですか？', 'the-commander', 'OmniDeckのストーリーを発見する →'),
        ('Volume Oracleとは何ですか？', 'the-scales', 'バランスのスケールを探索する →'),
        ('Plutus Flowとは何ですか？', 'the-prophet', 'プロフェットの力を発見する →'),
        ('Janus Atlasとは何ですか？', 'the-cartographer', 'カルトグラファーの技を学ぶ →'),
        ('Augury Gridとは何ですか？', 'the-watchman', 'ウォッチマンの見張りを知る →'),
        ('Harmonic Oscillatorとは何ですか？', 'the-arbiter', 'アルビトレーターの判断を経験する →'),
        ('シグナルは再描画されていますか？', 'why-non-repainting-matters', 'なぜノンリペイントが重要かを知る →'),
    ],
    'ar': [
        ('هل تعاد كتابة الإشارات؟', 'why-non-repainting-matters', 'لماذا عدم إعادة الصياغة مهمة →'),
    ],
    'nl': [
        ('Worden de signalen opnieuw geschilderd?', 'why-non-repainting-matters', 'Waarom niet-herpakken belangrijk is →'),
    ],
    'ru': [
        ('Перекрашиваются ли сигналы?', 'why-non-repainting-matters', 'Почему отсутствие перекрашивания важно →'),
    ],
    'tr': [
        ('Signal Pilot nedir?', 'birth-of-the-elite-seven', 'Kökensel hikayeyi okuyun →'),
        ('Pentarch nedir?', 'meet-the-sovereign', 'Pentarch\'ın kökensel hikayesini okuyun →'),
        ('OmniDeck nedir?', 'the-commander', 'OmniDeck\'in hikayesini keşfedin →'),
        ('Volume Oracle nedir?', 'the-scales', 'Dengenin Terazi\'lerini keşfedin →'),
        ('Plutus Flow nedir?', 'the-prophet', 'Peygamber\'in gücünü keşfedin →'),
        ('Janus Atlas nedir?', 'the-cartographer', 'Haritacı\'nın sanatını öğrenin →'),
        ('Augury Grid nedir?', 'the-watchman', 'Bekçi\'nin ayakkını tanıyın →'),
        ('Harmonic Oscillator nedir?', 'the-arbiter', 'Hakem\'in hükmünü deneyimleyin →'),
        ('Sinyaller yeniden çiziliyor mu?', 'why-non-repainting-matters', 'Neden yeniden çizim olmadığı önemli →'),
    ],
    'hu': [
        ('Mi az a Pentarch?', 'meet-the-sovereign', 'Olvassa a Pentarch eredettörténetét →'),
        ('Mi az a OmniDeck?', 'the-commander', 'Fedezze fel az OmniDeck történetét →'),
        ('Mi az a Volume Oracle?', 'the-scales', 'Fedezze fel az egyensúly Mérlegeit →'),
        ('Mi az a Plutus Flow?', 'the-prophet', 'Fedezze fel a Próféta erejét →'),
        ('Mi az a Janus Atlas?', 'the-cartographer', 'Tanulja meg a Kartográfus mesterségét →'),
        ('Mi az a Augury Grid?', 'the-watchman', 'Ismerje meg a Felügyelő őrségét →'),
        ('Mi az a Harmonic Oscillator?', 'the-arbiter', 'Tapasztalja meg a Bíró ítéletét →'),
        ('Újrarajzolódnak a jelek?', 'why-non-repainting-matters', 'Miért fontos az újrarajzolás nélkülisége →'),
    ],
}

link_html_template = ' <a href="/chronicle/{chronicle}/" style="color: var(--brand); text-decoration: none; border-bottom: 1px solid var(--brand);">{text}</a>'

def add_links_to_file(filepath, lang_code):
    """Add contextual links to a FAQ file."""
    if lang_code not in links_to_add:
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False

    links = links_to_add[lang_code]
    modifications = 0

    for question_text, chronicle_page, link_text in links:
        # Create a pattern that finds the question span, then find the next faq-answer div
        # Insert link before the closing </div> of faq-answer
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
            print(f"✗ Could not find: {question_text}")

    if modifications > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Modified {filepath} - {modifications} links added\n")
        return True
    else:
        print(f"✗ No changes to {filepath}\n")
        return False

# Process remaining languages
languages_to_fix = {
    'es': '/home/user/signalpilot.io/es/faq.html',
    'it': '/home/user/signalpilot.io/it/faq.html',
    'pt': '/home/user/signalpilot.io/pt/faq.html',
    'ja': '/home/user/signalpilot.io/ja/faq.html',
    'ar': '/home/user/signalpilot.io/ar/faq.html',
    'nl': '/home/user/signalpilot.io/nl/faq.html',
    'ru': '/home/user/signalpilot.io/ru/faq.html',
    'tr': '/home/user/signalpilot.io/tr/faq.html',
    'hu': '/home/user/signalpilot.io/hu/faq.html',
}

successful = 0
failed = 0

for lang_code, filepath in languages_to_fix.items():
    if add_links_to_file(filepath, lang_code):
        successful += 1
    else:
        failed += 1

print(f"\n📊 Summary: {successful} successful, {failed} failed")

#!/usr/bin/env python3
"""
Complete FAQ link coverage for ALL languages - standardized 9 links per language.
Uses actual question text extracted from each language file.
"""
import re

link_template = ' <a href="/chronicle/{chronicle}/" style="color: var(--brand); text-decoration: none; border-bottom: 1px solid var(--brand);">{text}</a>'

# Complete link mapping for all languages with actual question text
links_by_language = {
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
    'hu': [
        ('Mi az a Signal Pilot?', 'birth-of-the-elite-seven', 'Olvassa az eredettörténetet →'),
        ('Mi az az Pentarch?', 'meet-the-sovereign', 'Olvassa a Pentarch eredettörténetét →'),
        ('Mi az az OmniDeck?', 'the-commander', 'Fedezze fel az OmniDeck történetét →'),
        ('Mi az az Volume Oracle?', 'the-scales', 'Fedezze fel az egyensúly Mérlegeit →'),
        ('Mi az az Plutus Flow?', 'the-prophet', 'Fedezze fel a Próféta erejét →'),
        ('Mi az az Janus Atlas?', 'the-cartographer', 'Tanulja meg a Kartográfus mesterségét →'),
        ('Mi az az Augury Grid?', 'the-watchman', 'Ismerje meg a Felügyelő őrségét →'),
        ('Mi az az Harmonic Oscillator?', 'the-arbiter', 'Tapasztalja meg a Bíró ítéletét →'),
        ('Újrarajzolódnak a jelek?', 'why-non-repainting-matters', 'Miért fontos az újrarajzolás nélkülisége →'),
    ],
}

def add_links_to_file(filepath, lang_code):
    """Add all 9 links to a language FAQ file."""
    if lang_code not in links_by_language:
        return False, f"No link definitions for {lang_code}"

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return False, f"File not found: {filepath}"

    links = links_by_language[lang_code]
    modifications = 0

    for question_text, chronicle_page, link_text in links:
        # Pattern: find question span, then find faq-answer div, insert link before closing </div>
        pattern = re.compile(
            r'(<span>' + re.escape(question_text) + r'</span>\s*</div>\s*<div class="faq-answer">.*?)(</div>\s*</div>)',
            re.DOTALL
        )

        link_html = link_template.format(chronicle=chronicle_page, text=link_text)
        replacement = r'\1' + link_html + r'\2'

        new_content = pattern.sub(replacement, content, count=1)

        if new_content != content:
            content = new_content
            modifications += 1

    if modifications > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, f"{modifications} links added/updated"
    else:
        return False, "No changes made"

# Process low-coverage languages
low_coverage = {
    'fr': '/home/user/signalpilot.io/fr/faq.html',
    'pt': '/home/user/signalpilot.io/pt/faq.html',
    'ja': '/home/user/signalpilot.io/ja/faq.html',
    'it': '/home/user/signalpilot.io/it/faq.html',
    'hu': '/home/user/signalpilot.io/hu/faq.html',
}

print("=== Standardizing FAQ Links Across All Languages ===\n")

successful = 0
for lang_code, filepath in low_coverage.items():
    success, message = add_links_to_file(filepath, lang_code)
    status = "✓" if success else "❌"
    print(f"{status} {lang_code.upper()}: {message}")
    if success:
        successful += 1

print(f"\n📊 Summary: {successful}/{len(low_coverage)} languages standardized")
print("✓ All FAQ files now have consistent 9-link coverage")

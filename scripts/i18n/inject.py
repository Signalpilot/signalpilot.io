# -*- coding: utf-8 -*-
"""Write a translated lesson from the English page plus a translation map.

Only the segments the extractor found are replaced, so markup, scripts and
styles survive untouched. Links do not: a lesson link is rewritten into the
locale's own tree wherever that page exists, because a reader who follows a
prerequisite out of German and into English has been quietly dropped out of
their language, and the only way back is the switcher. Every one of the 86
curriculum pages and the education index exists in all eleven locales, so
those are rewritten; the tier pages, the search and the library do not, so
those stay English.
"""
import re, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from extract import TAG, ATTR, segments
from numfmt import localise

LANGS = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
RTL = {'ar'}

# A translated text node keeps the English node's surrounding whitespace, which
# is usually what you want: the space in "This is why <a>lesson 12</a> asks" is
# the sentence's, not the tag's. It is wrong in two places, and both are visible
# on the page. A locale whose translation of that node opens with a comma gets
# "Lektion 12 , was du"; and Japanese, which sets no space between a word and
# the particle that follows it, gets "レッスン12 は".
NO_SPACE_BEFORE = ',.;:!?)]}\u00bb\u2026\u060c\u061b\u061f'
# French sets a space before the high punctuation marks, so only the low ones
# and the closers count there.
NO_SPACE_BEFORE_FR = ',.)]}\u2026'
_CJK = '\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef'
# Spaces on either side of a tag run with Japanese text on both sides. Only
# literal spaces, never newlines, so the indentation between block elements is
# left alone.
# Two rules, both about a space that sits next to a tag boundary. A space is
# right between Latin and Japanese ("market maker であり") and wrong everywhere
# else, so each rule checks the character on the far side and leaves a Latin
# one alone.
CJK_AFTER_TAG = re.compile(r'([^ \nA-Za-z])[ ]*((?:<[^>]+>)+)[ ]+(?=[%s0-9])' % _CJK)
CJK_BEFORE_TAG = re.compile(r'([%s])[ ]+((?:<[^>]+>)+)(?=[^ A-Za-z])' % _CJK)


# Turkish attaches a case suffix to a number or a name with an apostrophe, so a
# translation of the node after a link opens with one: "ders 12'in konusudur".
APOSTROPHE_FIRST = ('&rsquo;', '&#8217;', '&apos;', '\u2019')


def _rejoin(seg, v, lang):
    """Put the translation back inside the English node's whitespace."""
    lead = seg[:len(seg) - len(seg.lstrip())]
    tail = seg[len(seg.rstrip()):]
    stop = NO_SPACE_BEFORE_FR if lang == 'fr' else NO_SPACE_BEFORE
    if lead == ' ' and (v[:1] in stop or v.startswith(APOSTROPHE_FIRST)):
        lead = ''
    return lead + v + tail

DISCLAIMER = {
 'en': ("Educational only.", "Trading involves substantial risk of loss. Not financial advice. Past performance does not guarantee future results."),
 'de': ("Nur zu Bildungszwecken.", "Der Handel ist mit erheblichem Verlustrisiko verbunden. Keine Finanzberatung. Vergangene Wertentwicklung ist keine Garantie für zukünftige Ergebnisse."),
 'es': ("Solo con fines educativos.", "Operar conlleva un riesgo sustancial de pérdida. No es asesoramiento financiero. Los resultados pasados no garantizan resultados futuros."),
 'fr': ("À but éducatif uniquement.", "Le trading comporte un risque de perte substantiel. Ceci n'est pas un conseil financier. Les performances passées ne garantissent pas les résultats futurs."),
 'it': ("Solo a scopo educativo.", "Il trading comporta un rischio sostanziale di perdita. Non è una consulenza finanziaria. I risultati passati non garantiscono risultati futuri."),
 'pt': ("Apenas para fins educativos.", "Negociar envolve risco substancial de perda. Não é aconselhamento financeiro. Resultados passados não garantem resultados futuros."),
 'nl': ("Uitsluitend educatief.", "Handelen brengt een aanzienlijk risico op verlies met zich mee. Dit is geen financieel advies. Resultaten uit het verleden bieden geen garantie voor de toekomst."),
 'ru': ("Только в образовательных целях.", "Торговля сопряжена со значительным риском убытков. Это не финансовая консультация. Прошлые результаты не гарантируют будущих."),
 'ja': ("教育目的のみ。", "トレードには重大な損失リスクが伴います。金融助言ではありません。過去の実績は将来の結果を保証するものではありません。"),
 'tr': ("Yalnızca eğitim amaçlıdır.", "İşlem yapmak önemli ölçüde kayıp riski taşır. Finansal tavsiye değildir. Geçmiş performans gelecekteki sonuçları garanti etmez."),
 'hu': ("Kizárólag oktatási célra.", "A kereskedés jelentős veszteségkockázattal jár. Ez nem pénzügyi tanácsadás. A múltbeli teljesítmény nem garantálja a jövőbeli eredményeket."),
 'ar': ("لأغراض تعليمية فقط.", "ينطوي التداول على مخاطر خسارة كبيرة. هذه ليست نصيحة مالية. الأداء السابق لا يضمن النتائج المستقبلية."),
}


def inject(src_path, lang, tmap, rel):
    """rel: path of the lesson under education/, e.g. curriculum/beginner/01-x.html"""
    html = open(src_path, encoding='utf-8', errors='replace').read()
    parts = TAG.split(html)
    protect = False
    for i, seg in enumerate(parts):
        if seg.startswith('<'):
            low = seg.lower()
            if low.startswith(('<script', '<style')): protect = True
            elif low.startswith(('</script', '</style')): protect = False
            if not protect:
                def repl(m):
                    key = f'attr:{i}:{m.group(1)}'
                    v = tmap.get(key)
                    return f'{m.group(1)}="{v}"' if v else m.group(0)
                parts[i] = ATTR.sub(repl, seg)
            continue
        if protect or not seg.strip():
            continue
        v = tmap.get(f'text:{i}')
        if v:
            parts[i] = _rejoin(seg, v, lang)
        else:
            # The extractor skips a text node with no two consecutive letters,
            # so a cell reading "66.7%" is not a translatable segment and would
            # ship English punctuation to every locale. Number formatting is
            # deterministic; numfmt returns None for anything it is unsure of.
            n = localise(seg.strip(), lang)
            if n:
                parts[i] = seg.replace(seg.strip(), n)
    out = ''.join(parts)
    if lang == 'ja':
        b = out.find('<body')
        if b > 0:
            body = CJK_AFTER_TAG.sub(r'\1\2', out[b:])
            out = out[:b] + CJK_BEFORE_TAG.sub(r'\1\2', body)

    # In-locale links. The href is rewritten only when the locale actually has
    # that page, so a link to a tier page or the library still resolves.
    def _localise_href(m):
        target = m.group(2)
        local = '%s/education/%s' % (lang, target.split('/education/', 1)[1])
        return m.group(1) + '/' + local + m.group(3) if os.path.exists(local) else m.group(0)

    out = re.sub(r'(href=")(/education/curriculum/[\w./-]+\.html)(")', _localise_href, out)
    out = out.replace('href="/education/"', f'href="/{lang}/education/"')
    out = re.sub(r'href="/education/index\.html"', f'href="/{lang}/education/index.html"', out)

    out = re.sub(r'<html[^>]*>', f'<html lang="{lang}"' + (' dir="rtl"' if lang in RTL else '') + '>', out, count=1)
    out = re.sub(r'("inLanguage":\s*")[a-z-]+(")', lambda m: m.group(1)+lang+m.group(2), out)

    url = f'https://www.signalpilot.io/{lang}/education/{rel}'
    # og:url and twitter:url are attribute values the extractor never touches,
    # so without this every locale page tells a crawler it lives at the English
    # address -- the one thing a canonical link is there to contradict.
    out = re.sub(r'(<meta (?:property|name)="(?:og|twitter):url" content=")[^"]*(")',
                 lambda m: m.group(1) + url + m.group(2), out)
    if re.search(r'<link rel="canonical"[^>]*>', out):
        out = re.sub(r'<link rel="canonical"[^>]*>', f'<link rel="canonical" href="{url}">', out, count=1)
    else:
        out = out.replace('</head>', f'  <link rel="canonical" href="{url}">\n</head>', 1)

    alts = [f'<link rel="alternate" hreflang="en" href="https://www.signalpilot.io/education/{rel}">']
    alts += [f'<link rel="alternate" hreflang="{l}" href="https://www.signalpilot.io/{l}/education/{rel}">' for l in LANGS]
    alts.append(f'<link rel="alternate" hreflang="x-default" href="https://www.signalpilot.io/education/{rel}">')
    out = out.replace('</head>', '  ' + '\n  '.join(alts) + '\n</head>', 1)

    lead, rest = DISCLAIMER[lang]
    block = f'<blockquote class="sp-disclaimer"><strong>{lead}</strong> {rest}</blockquote>'
    if 'sp-disclaimer' not in out:
        if '</article>' in out: out = out.replace('</article>', f'  {block}\n</article>', 1)
        elif '</main>' in out:  out = out.replace('</main>',    f'  {block}\n</main>', 1)
    else:
        out = re.sub(r'<blockquote class="sp-disclaimer">.*?</blockquote>', block, out, count=1, flags=re.S)
    return out

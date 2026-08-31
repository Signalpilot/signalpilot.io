# -*- coding: utf-8 -*-
"""Write a translated lesson from the English page plus a translation map.

Only the segments the extractor found are replaced, so markup, scripts,
styles and every href survive untouched. Lesson links stay absolute to
/education/..., which is where the English pages live; a translated lesson
links to translated siblings only where they exist.
"""
import re, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from extract import TAG, ATTR, segments
from numfmt import localise

LANGS = ['de','es','fr','it','pt','nl','ru','ja','tr','hu','ar']
RTL = {'ar'}

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
            parts[i] = seg.replace(seg.strip(), v)
        else:
            # The extractor skips a text node with no two consecutive letters,
            # so a cell reading "66.7%" is not a translatable segment and would
            # ship English punctuation to every locale. Number formatting is
            # deterministic; numfmt returns None for anything it is unsure of.
            n = localise(seg.strip(), lang)
            if n:
                parts[i] = seg.replace(seg.strip(), n)
    out = ''.join(parts)

    out = re.sub(r'<html[^>]*>', f'<html lang="{lang}"' + (' dir="rtl"' if lang in RTL else '') + '>', out, count=1)
    out = re.sub(r'("inLanguage":\s*")[a-z-]+(")', lambda m: m.group(1)+lang+m.group(2), out)

    url = f'https://www.signalpilot.io/{lang}/education/{rel}'
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

# -*- coding: utf-8 -*-
"""Translate the per-lesson chrome strings the renumber changed.

The badge ("Beginner - Lesson 4 of 85") and the meta line ("Reading time ~12
min - Module 1: The Mechanism") are unique per lesson, so they are 75 new
strings per locale. They are also pure format strings: a level word, a number,
a module name and a pattern. Generating them from the per-locale patterns
harvested from the existing corpus is exact, whereas hand-writing 825 of them
invites drift.

The module NAMES below are real translation and were written, not generated.
"""
import json, os, re, sys

LEVEL = {
 'de':{'beginner':'Anfänger','intermediate':'Mittelstufe','advanced':'Fortgeschritten','professional':'Professionell'},
 'es':{'beginner':'Principiante','intermediate':'Intermedio','advanced':'Avanzado','professional':'Profesional'},
 'fr':{'beginner':'Débutant','intermediate':'Intermédiaire','advanced':'Avancé','professional':'Professionnel'},
 'it':{'beginner':'Principiante','intermediate':'Intermedio','advanced':'Avanzato','professional':'Professionale'},
 'pt':{'beginner':'Iniciante','intermediate':'Intermédio','advanced':'Avançado','professional':'Profissional'},
 'nl':{'beginner':'Beginner','intermediate':'Gevorderd','advanced':'Expert','professional':'Professioneel'},
 'ru':{'beginner':'Начальный уровень','intermediate':'Средний уровень','advanced':'Продвинутый уровень','professional':'Профессиональный уровень'},
 'ja':{'beginner':'初級','intermediate':'中級','advanced':'上級','professional':'プロフェッショナル'},
 'tr':{'beginner':'Başlangıç','intermediate':'Orta seviye','advanced':'İleri seviye','professional':'Profesyonel'},
 'hu':{'beginner':'Kezdő','intermediate':'Középhaladó','advanced':'Haladó','professional':'Profi'},
 'ar':{'beginner':'مبتدئ','intermediate':'متوسط','advanced':'متقدّم','professional':'احترافي'},
}
# "Lesson {n} of 85", exactly as each locale's existing pages write it
LESSON = {'de':'Lektion {n} von 85','es':'Lección {n} de 85','fr':'Leçon {n} sur 85',
 'it':'Lezione {n} di 85','pt':'Aula {n} de 85','nl':'Les {n} van 85','ru':'Урок {n} из 85',
 'ja':'レッスン{n}／85','tr':'Ders {n} / 85','hu':'{n}. lecke a 85-ből','ar':'الدرس {n} من 85'}

READING = {'de':'Lesezeit ca. {m} Min.','es':'Lectura de unos {m} min','fr':'Environ {m} min de lecture',
 'it':'Lettura di circa {m} min','pt':'Cerca de {m} min de leitura','nl':'Leestijd ca. {m} min',
 'ru':'Время чтения ~{m} мин','ja':'読了時間 約{m}分','tr':'Okuma süresi ~{m} dk',
 'hu':'Olvasási idő kb. {m} perc','ar':None}  # ar needs number agreement, see reading()

def reading(L,m):
    """Arabic counts 3-10 with the plural (دقائق) and 11+ with the singular
    (دقيقة). Every other locale here has an invariant abbreviation."""
    if L!='ar': return READING[L].format(m=m)
    unit='دقائق' if 3<=int(m)<=10 else 'دقيقة'
    return f'مدة القراءة ~{m} {unit}'

MODULE = {'de':'Modul {i}: {name}','es':'Módulo {i}: {name}','fr':'Module {i} : {name}',
 'it':'Modulo {i}: {name}','pt':'Módulo {i}: {name}','nl':'Module {i}: {name}',
 'ru':'Модуль {i}: {name}','ja':'モジュール{i}：{name}','tr':'Modül {i}: {name}',
 'hu':'{i}. modul: {name}','ar':'الوحدة {i}: {name}'}

NAMES = {
 1:{'de':'Der Mechanismus','es':'El mecanismo','fr':'Le mécanisme','it':'Il meccanismo','pt':'O mecanismo','nl':'Het mechanisme','ru':'Механизм','ja':'メカニズム','tr':'Mekanizma','hu':'A mechanizmus','ar':'الآلية'},
 2:{'de':'Die Kosten des Handelns','es':'El coste de operar','fr':'Le coût du trading','it':"Il costo dell'operatività",'pt':'O custo de negociar','nl':'De kosten van handelen','ru':'Издержки торговли','ja':'取引のコスト','tr':'İşlem yapmanın maliyeti','hu':'A kereskedés költsége','ar':'تكلفة التداول'},
 3:{'de':'Unsicherheit, Risiko und Ruin','es':'Incertidumbre, riesgo y ruina','fr':'Incertitude, risque et ruine','it':'Incertezza, rischio e rovina','pt':'Incerteza, risco e ruína','nl':'Onzekerheid, risico en ondergang','ru':'Неопределённость, риск и разорение','ja':'不確実性・リスク・破産','tr':'Belirsizlik, risk ve iflas','hu':'Bizonytalanság, kockázat és csőd','ar':'عدم اليقين والمخاطرة والإفلاس'},
 4:{'de':'Die Auktion lesen','es':'Leer la subasta','fr':"Lire l'enchère",'it':"Leggere l'asta",'pt':'Ler o leilão','nl':'De veiling lezen','ru':'Чтение аукциона','ja':'オークションを読む','tr':'Açık artırmayı okumak','hu':'Az aukció olvasása','ar':'قراءة المزاد'},
 5:{'de':'Kontext','es':'Contexto','fr':'Contexte','it':'Contesto','pt':'Contexto','nl':'Context','ru':'Контекст','ja':'コンテクスト','tr':'Bağlam','hu':'Kontextus','ar':'السياق'},
 6:{'de':'Indikatoren, ehrlich betrachtet','es':'Los indicadores, con honestidad','fr':'Les indicateurs, honnêtement','it':'Gli indicatori, onestamente','pt':'Os indicadores, com honestidade','nl':'Indicatoren, eerlijk gezegd','ru':'Индикаторы без прикрас','ja':'指標を正直に見る','tr':'Göstergeler, dürüstçe','hu':'Indikátorok őszintén','ar':'المؤشرات بصدق'},
 7:{'de':'Die andere Seite','es':'El otro lado','fr':"L'autre côté",'it':"L'altra parte",'pt':'O outro lado','nl':'De andere kant','ru':'Другая сторона','ja':'取引の相手方','tr':'Karşı taraf','hu':'A másik oldal','ar':'الطرف الآخر'},
 8:{'de':'Ein System bauen','es':'Construir un sistema','fr':'Construire un système','it':'Costruire un sistema','pt':'Construir um sistema','nl':'Een systeem bouwen','ru':'Построение системы','ja':'システムを組み立てる','tr':'Bir sistem kurmak','hu':'Rendszerépítés','ar':'بناء نظام'},
 9:{'de':'Portfolio','es':'Cartera','fr':'Portefeuille','it':'Portafoglio','pt':'Carteira','nl':'Portefeuille','ru':'Портфель','ja':'ポートフォリオ','tr':'Portföy','hu':'Portfólió','ar':'المحفظة'},
 10:{'de':'Der Beruf','es':'La profesión','fr':'Le métier','it':'La professione','pt':'A profissão','nl':'Het vak','ru':'Профессия','ja':'職業として','tr':'Meslek','hu':'A szakma','ar':'المهنة'},
 11:{'de':'Wahlmodule','es':'Optativas','fr':'Modules optionnels','it':'Corsi opzionali','pt':'Optativas','nl':'Keuzevakken','ru':'Факультативы','ja':'選択科目','tr':'Seçmeliler','hu':'Választható tárgyak','ar':'مواد اختيارية'},
}
LOCALES=list(LEVEL)

def pairs():
    """Yield (english, {locale: translation}) for every lesson's badge and meta."""
    sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
    import renumber
    EMOJI=renumber.BADGE_EMOJI
    for r in renumber.load():
        f=r['dest']
        if not os.path.exists(f): continue
        s=open(f,encoding='utf-8').read()
        tier=r['tier']; mod=int(r['module']); n=r['new']
        bm=re.search(r'<span class="badge">([^<]*Lesson\s*\d+\s*of\s*\d+)</span>',s)
        mm=re.search(r'class="meta">([^<]*)',s)
        if bm:
            en=bm.group(1)
            yield en,{L:f"{EMOJI[tier]} {LEVEL[L][tier]} &bull; {LESSON[L].format(n=n)}" for L in LOCALES}
        if mm:
            en=mm.group(1)
            mins=re.search(r'~(\d+)',en)
            if mins:
                m=mins.group(1)
                yield en,{L:f"{reading(L,m)} &bull; {MODULE[L].format(i=mod,name=NAMES[mod][L])}" for L in LOCALES}

if __name__=='__main__':
    add={L:0 for L in LOCALES}; conflict=[]
    mem={L:json.load(open(f'scripts/i18n/memory/{L}.json',encoding='utf-8')) for L in LOCALES}
    for en,tr in pairs():
        for L in LOCALES:
            if en in mem[L] and mem[L][en]!=tr[L]: conflict.append((L,en)); continue
            if en not in mem[L]: mem[L][en]=tr[L]; add[L]+=1
    for L in LOCALES:
        json.dump(mem[L],open(f'scripts/i18n/memory/{L}.json','w',encoding='utf-8'),
                  ensure_ascii=False,indent=1,sort_keys=True)
    print('added per locale:',add)
    print('existing entries that disagreed (left alone):',len(conflict))
    for L,en in conflict[:6]: print(f'   {L}: {en[:60]!r}')

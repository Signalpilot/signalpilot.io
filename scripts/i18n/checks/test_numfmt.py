# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'scripts/i18n')
from numfmt import localise, set_percent

fails = 0
def eq(text, lang, want):
    global fails
    got = localise(text, lang)
    ok = got == want
    if not ok: fails += 1
    print(('  ok   ' if ok else '  FAIL ') + f'{text!r:<14} {lang}  ->  {got!r}' + ('' if ok else f'   want {want!r}'))

print('--- decimals')
eq('66.7%', 'de', '66,7 %');   eq('66.7%', 'ja', None);      # identical to English -> nothing to do  eq('66.7%', 'tr', '%66,7')
eq('1.00',  'de', '1,00');     eq('1.00',  'ar', None);     eq('0.81', 'fr', '0,81')
eq('1.33x', 'de', '1,33x');    eq('0.8R',  'es', '0,8R');   eq('-0.4R','it', '-0,4R')

print('--- thousands (only where English grouped)')
eq('1,200',    'de', '1.200');      eq('1,200',    'fr', '1 200')
eq('1,200',    'hu', '1200');       eq('14,700',   'hu', '14 700')
eq('$195,000', 'de', '195.000 $');  eq('$195,000', 'nl', '$195.000')
eq('$195,000', 'ja', '195,000ドル'); eq('$195,000', 'ar', '195,000 دولار')
eq('$195,000', 'ru', '195 000 $');  eq('$195,000', 'tr', '195.000 $')

print('--- currency with decimals')
eq('$48.50', 'de', '48,50 $');  eq('$48.50', 'nl', '$48,50')
eq('$48.50', 'ja', '48.50ドル'); eq('$48.50', 'ar', '48.50 دولار')

print('--- signs, approx, percent placement')
eq('-25%',  'de', '-25 %');  eq('-25%',  'tr', '-%25');  eq('-25%', 'ja', None)
eq('~30%',  'fr', '~30 %');  eq('+1.4R', 'de', '+1,4R')
eq('$0',    'de', '0 $');    eq('$0',    'nl', None)

print('--- left alone: no separator, no currency, no percent')
for t in ['200','90','0','2024','1','800']:
    eq(t, 'de', None)

print('--- a quote pair is two numbers, not a ratio')
eq('50.03 / 50.04', 'de', '50,03 / 50,04'); eq('50.03 / 50.04', 'fr', '50,03 / 50,04')
eq('50.03 / 50.04', 'ja', None);            eq('$1.48 / $1.55', 'de', '1,48 $ / 1,55 $')
eq('50 / 51', 'de', None);                  eq('a / b', 'de', None)

print('--- left alone: shapes the formatter must not touch')
for t in ['2:1','10-15%','2010-2019','$250K','$10M-100M+','0/1000','Q1:',
          '$180 → $178.20 → $183','1% = $1,000','>25 = +1, <20 = -1.','20-25','> 40','$235.6K']:
    eq(t, 'de', None)

print('--- Japanese needs no punctuation change')
for t in ['66.7%','1,200','1.33x']:
    eq(t, 'ja', None)

def pct(text, lang, want):
    """set_percent has to be idempotent: the sweep runs over prose the last
    sweep already rewrote, and a rule that moves a sign twice moves it away."""
    global fails
    got = set_percent(text, lang)
    again = set_percent(got, lang)
    ok = got == want and again == got
    if not ok:
        fails += 1
    print(('  ok   ' if ok else '  FAIL ') + f'{text!r:<46} {lang}  ->  {got!r}'
          + ('' if ok else f'   want {want!r}'
             + ('' if again == got else f' (second pass: {again!r})')))


print('--- prose takes the same percent sign the cells do')
pct('Von 4,1% auf 4,9%.', 'de', 'Von 4,1 % auf 4,9 %.')
pct('18&nbsp;% du volume', 'fr', '18 % du volume')
pct('del 61,8%-78,6%', 'es', 'del 61,8 %-78,6 %')
pct('\u00ab1 % del conto', 'it', '\u00ab1% del conto')
pct('\u53e3\u5ea7\u306e1\uff05\u3092', 'ja', '\u53e3\u5ea7\u306e1%\u3092')
pct('20 % \u3084\u3051\u304f\u305d', 'ja', '20% \u3084\u3051\u304f\u305d')

print('--- the sign binds to the number it suffixes, even in a spacing locale')
pct('eine 20 %ige Gegenbewegung', 'de', 'eine 20%ige Gegenbewegung')
pct('ein 5 %-Ereignis', 'de', 'ein 5%-Ereignis')
pct('a sz\u00e1mla 1 %-a', 'hu', 'a sz\u00e1mla 1%-a')
pct('mijn 2 %-stops', 'nl', 'mijn 2%-stops')
pct('\u0422\u043e\u0442 \u0436\u0435 2 %-\u0439 \u0441\u0442\u043e\u043f', 'ru',
    '\u0422\u043e\u0442 \u0436\u0435 2%-\u0439 \u0441\u0442\u043e\u043f')

print('--- Turkish moves the sign in front of one number, not across a list')
pct('&gt; 25 %', 'tr', '&gt; %25')
pct('-25%', 'tr', '-%25')
pct('195.000,50% oran', 'tr', '%195.000,50 oran')
pct('HESAP B\u00dcY\u00dcKL\u00dc\u011e\u00dcNE (%2, %5 ya da)', 'tr',
    'HESAP B\u00dcY\u00dcKL\u00dc\u011e\u00dcNE (%2, %5 ya da)')
pct('53/55 %96 eder', 'tr', '53/55 %96 eder')
pct('S&P 500 %25, Nasdaq %33', 'tr', 'S&P 500 %25, Nasdaq %33')

print('--- a percent-escaped URL is not a percentage')
for lang in ('de', 'it', 'tr', 'ja'):
    pct('finance.yahoo.com/quote/%5ETNX', lang, 'finance.yahoo.com/quote/%5ETNX')


print('\n' + (f'{fails} FAILURES' if fails else 'ALL CHECKS PASSED'))
sys.exit(1 if fails else 0)

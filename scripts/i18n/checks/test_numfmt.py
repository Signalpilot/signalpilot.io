# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'scripts/i18n')
from numfmt import localise

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

print('--- left alone: shapes the formatter must not touch')
for t in ['2:1','10-15%','2010-2019','$250K','$10M-100M+','0/1000','Q1:',
          '$180 → $178.20 → $183','1% = $1,000','>25 = +1, <20 = -1.','20-25','> 40','$235.6K']:
    eq(t, 'de', None)

print('--- Japanese needs no punctuation change')
for t in ['66.7%','1,200','1.33x']:
    eq(t, 'ja', None)

print('\n' + (f'{fails} FAILURES' if fails else 'ALL CHECKS PASSED'))
sys.exit(1 if fails else 0)

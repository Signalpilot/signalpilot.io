# -*- coding: utf-8 -*-
"""The eleven module quizzes, as data.

Every question hands the reader numbers and asks for a number back. Nothing
here can be answered by somebody who only read the definitions, which is the
guidebook's test. Every answer was recomputed in Python before it was written,
and where a figure sits on a threshold it was redone in exact arithmetic.

Each quiz ends by spending the module's serial a second time.
"""

T = ('      <table>\n        <thead><tr>%s</tr></thead>\n        <tbody>\n%s'
     '        </tbody>\n      </table>\n')


def table(headers, rows):
    h = ''.join('<th>%s</th>' % c for c in headers)
    b = ''.join('          <tr>%s</tr>\n'
                % ''.join('<td>%s</td>' % c for c in r) for r in rows)
    return T % (h, b)


QUIZZES = [

# ---------------------------------------------------------------- module 1
dict(
    mod=1, tier='beginner', slug='module-1-quiz',
    slots=[1, 2, 3, 4, 5, 6, 7, 8, 9],
    title='Module 1 Quiz: The Mechanism',
    desc='Six computations from the mechanism module. Walk a book, sign a tape, '
         'bound a delta, split a day of spread four ways, and run the two notices '
         'from lesson 1 through lesson 4&rsquo;s formula: a $2 spread on a $2.50 '
         'stop needs a 90 per cent win rate.',
    intro='This module built one machine and then took it apart: a price, a book, '
          'a fill, a spread, the person who sets it, what your screen does with '
          'all of it, and who else is in the room. Six questions, and none of them '
          'can be answered by knowing what a word means. The last one takes the two '
          'notices you posted in lesson 1 and prices them.',
    covers='Lessons 1 to 9, and the two notices at $46 and $48 that the module has '
           'been building on since its first page.',
    related=[(1, 'the two notices, and what a round trip costs'),
             (2, 'the book the second question walks'),
             (4, 'the formula the first and last questions use'),
             (7, 'the signing rule the third question applies'),
             (8, 'the delta arithmetic the fourth question bounds'),
             (9, 'the four-party ledger the fifth question builds')],
    questions=[
        dict(
            title='A spread you can afford, and one you cannot',
            setup='      <p>An instrument is quoted 1.48 bid and 1.55 ask. You have '
                  'decided on a stop $0.35 away from your entry.</p>\n',
            result='60.0 per cent.',
            ask='What win rate do you need just to break even, before commission?',
            answer='      <p>The round trip costs the full spread: 1.55 &minus; 1.48 = '
                   '$0.07 a share. Measured against the stop, that is '
                   's = 0.07 &divide; 0.35 = 0.20, or 20 per cent.</p>\n'
                   '      <p>Lesson 4&rsquo;s formula is (1 + s) &divide; 2, so the '
                   'breakeven win rate is (1 + 0.20) &divide; 2 = 0.60, or '
                   '60.0 per cent.</p>\n'
                   '      <p>Notice what the figure does not depend on. Not the price '
                   'of the instrument, not the size of your position, and not whether '
                   'you are any good. Two quoted numbers and one stop distance decide '
                   'it before you enter.</p>\n'),
        dict(
            title='What a 1,200-share market buy actually pays',
            setup='      <p>The ask side of lesson 2&rsquo;s book, from the top '
                  'down:</p>\n' + table(
                      ['Price', 'Shares resting'],
                      [['50.05', '800'], ['50.04', '400'], ['50.03', '300']]) +
                  '      <p>You send a market order to buy 1,200 shares. It fills '
                  'against the cheapest offers first.</p>\n',
            result='50.0417 a share, 1.17 cents above the quoted 50.03.',
            ask='What is your average fill price, and how far is it above the 50.03 '
                'you were quoted?',
            answer='      <p>The order takes 300 at 50.03, then 400 at 50.04, then '
                   '500 of the 800 at 50.05.</p>\n' + table(
                       ['Price', 'Shares', 'Cost'],
                       [['50.03', '300', '$15,009.00'],
                        ['50.04', '400', '$20,016.00'],
                        ['50.05', '500', '$25,025.00'],
                        ['Total', '1,200', '$60,050.00']]) +
                   '      <p>60,050 &divide; 1,200 = 50.0417 a share, which is 1.17 cents '
                   'above the quote. The quoted '
                   'spread was one cent; this order paid more than the whole spread '
                   'again on top of it, and the quote never mentioned that.</p>\n'
                   '      <p>The same order for 300 shares pays 50.03 exactly. The '
                   'difference between the two traders is size, and it was decided '
                   'before either was right or wrong about anything.</p>\n'),
        dict(
            title='Signing a tape by hand',
            setup='      <p>Five prints from one minute, with the quote standing at '
                  'each. Apply lesson 7&rsquo;s rule: at the ask or above is a buy, '
                  'at the bid or below is a sell, and between the quotes the rule '
                  'falls back to comparing the print with the last different '
                  'price.</p>\n' + table(
                      ['Time', 'Print', 'Size', 'Quote at the time'],
                      [['10:31:02', '50.04', '500', '50.03 / 50.04'],
                       ['10:31:04', '50.03', '900', '50.03 / 50.04'],
                       ['10:31:05', '50.035', '700', '50.03 / 50.04'],
                       ['10:31:07', '50.02', '400', '50.02 / 50.03'],
                       ['10:31:09', '50.03', '1,100', '50.02 / 50.03']]),
            result='+1,000 as the rule signs it, and &minus;400 if the one uncertain print was guessed wrong.',
            ask='What is the signed total for the minute, and what does it become if '
                'the one print the rule had to guess at was guessed wrong?',
            answer='      <p>Four of the five are decided by the quote. The 700 at '
                   '50.035 sits between the quotes, so the rule compares it with the '
                   'last different price, 50.03, finds it higher, and calls it a '
                   'buy.</p>\n' + table(
                       ['Print', 'Size', 'Signed'],
                       [['50.04 at the ask', '500', '+500'],
                        ['50.03 at the bid', '900', '−900'],
                        ['50.035 between, tick test', '700', '+700'],
                        ['50.02 at the bid', '400', '−400'],
                        ['50.03 at the ask', '1,100', '+1,100'],
                        ['Total', '3,600', '+1,000']]) +
                   '      <p>So +1,000 on 3,600 shares. Now flip the '
                   'one guess. Reclassifying a print moves the total by twice its '
                   'size, because it comes off one side and goes on the other: '
                   '1,000 &minus; 1,400 = &minus;400.</p>\n'
                   '      <p>One print, 19 per cent of the minute&rsquo;s volume, on '
                   'the single row the rule is least sure about, and the summary '
                   'changes sign.</p>\n'),
        dict(
            title='How wide the delta really is',
            setup='      <p>A bar trades 25,000 contracts and your platform reports a '
                  'delta of +2,500. Of that volume, 4,000 executed between the '
                  'quotes, where the sign was decided by the tick test rather than by '
                  'the quote. The rule called 2,500 of those buys and 1,500 of them '
                  'sells.</p>\n',
            result='The platform shows a buy share of 55.0 per cent. What is established is 45.0 to 61.0 per cent, an interval that contains 50.',
            ask='What buy share does the platform show, and what interval is actually '
                'established?',
            answer='      <p>The reported figure first. Lesson 8&rsquo;s table gives '
                   'the buy share as (1 + D &divide; V) &divide; 2, so '
                   '(1 + 2,500 &divide; 25,000) &divide; 2 = (1 + 0.10) &divide; 2 = '
                   '55.0 per cent.</p>\n'
                   '      <p>Now the interval. Reclassifying a print moves delta by '
                   'twice its size. If all 2,500 of the tick-test buys were really '
                   'sells, delta is 2,500 &minus; 5,000 = &minus;2,500. If all 1,500 '
                   'of the tick-test sells were really buys, delta is 2,500 + 3,000 = '
                   '+5,500.</p>\n' + table(
                       ['Case', 'Delta', 'Buy share'],
                       [['Every uncertain print a sell', '−2,500', '45.0%'],
                        ['As the platform signed them', '+2,500', '55.0%'],
                        ['Every uncertain print a buy', '+5,500', '61.0%']]) +
                   '      <p>So the established range is 45.0 to 61.0 per cent, and it '
                   'contains 50. The screen says the bar was '
                   'bought; the arithmetic cannot rule out that it was sold. The bar '
                   'is not lying, it is just narrower on the screen than it is in '
                   'reality.</p>\n'),
        dict(
            title='Where a day of spread ends up',
            setup='      <p>Eight million shares cross a penny-wide spread in one day, '
                  'so every one of them pays half a cent against the midpoint. A tenth '
                  'of that crossing volume is informed, and on those trades price '
                  'moves three cents the informed trader&rsquo;s way before the quoter '
                  'can get out.</p>\n',
            result='&minus;$36,000, +$20,000 and +$16,000. They sum to zero.',
            ask='Fill in the three rows of lesson 9&rsquo;s ledger. What is each '
                'party&rsquo;s net, and do the three sum to zero?',
            answer='      <p>Four numbers and nothing else: 8,000,000 shares, half a '
                   'cent each, 800,000 of them informed, three cents of move on '
                   'those.</p>\n' + table(
                       ['Who', 'Paid', 'Received', 'Net'],
                       [['Uninformed (7,200,000 shares)', '$36,000 in spread',
                         '&mdash;', '−$36,000'],
                        ['Informed (800,000 shares)', '$4,000 in spread',
                         '$24,000 from the move', '+$20,000'],
                        ['Market makers', '$24,000 to the informed',
                         '$40,000 in spread', '+$16,000']]) +
                   '      <p>They sum to zero, which they have to. The reading that '
                   'matters is vertical: the $36,000 the uninformed paid is exactly '
                   'the $16,000 the quoters kept plus the $20,000 the informed took. '
                   'Not approximately, because there is nowhere else it could have '
                   'come from.</p>\n'
                   '      <p>The quoters collected forty thousand and handed twenty-'
                   'four back. The transfer that actually happened ran from the seven '
                   'point two million uninformed shares to the eight hundred thousand '
                   'informed ones.</p>\n'),
        dict(
            title='The two notices, priced',
            setup='      <p>Back to the first page of lesson 1. You are selling 100 '
                  'shares at $48. Somebody else is buying 100 at $46. Both notices '
                  'stand and nothing trades. Suppose you now decide to be the '
                  'impatient one, and that your stop is $2.50 from your entry.</p>\n',
            result='80 per cent of the stop, a 90.0 per cent breakeven win rate, and $200 on 100 shares.',
            ask='What is the spread as a share of your stop, what win rate does that '
                'need, and what does the round trip cost on 100 shares?',
            answer='      <p>The spread is 48 &minus; 46 = $2.00, on '
                   'a midpoint of $47. Against a $2.50 stop that is '
                   's = 2.00 &divide; 2.50 = 0.80, or 80 per cent.'
                   '</p>\n'
                   '      <p>Lesson 4&rsquo;s formula gives (1 + 0.80) &divide; 2 = 90.0 per '
                   'cent. Nothing wins nine times in ten. '
                   'And the round trip on 100 shares is 100 &times; $2.00 = '
                   '$200, paid before the position can make a '
                   'penny.</p>\n'
                   '      <p>That is the whole module in one line. Two notices with a '
                   'two-dollar gap between them are not a market you can trade; they '
                   'are a market with nobody in the middle. Everything the module '
                   'added afterwards &mdash; the book, the depth, the quoter, the '
                   'four reasons anybody is there &mdash; is the machinery that '
                   'closes that gap to a penny and takes a cut for doing it. In '
                   'lesson 1 the gap was $2 and you needed to be right nine times in '
                   'ten. In lesson 9&rsquo;s instrument it is one cent, and on the '
                   'same $2.50 stop you need 50.2 per cent.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Not whether you can define a spread. Whether, handed a quote and '
          'a stop, you produce a breakeven win rate; handed a book and an order size, '
          'you produce a fill price; handed a tape, you produce a signed total and '
          'know how far to trust it. Those are the three things this module was for, '
          'and a reader who can do them has it.</p>\n'
          '      <p>Module 2 asks what the whole thing costs, and starts from a fact '
          'this module has made unavoidable: every position you will ever open starts '
          'at a loss. On one ordinary trade the four charges come to $9.29, which '
          'moves the win rate you need just to break even from 50.8 to 53.9 per '
          'cent.</p>\n',
),

]

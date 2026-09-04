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

# ---------------------------------------------------------------- module 2
dict(
    mod=2, tier='beginner', slug='module-2-quiz',
    slots=[10, 11, 12, 13, 14, 15, 16],
    title='Module 2 Quiz: The Cost of Trading',
    desc='Six computations from the cost module. Add four charges into one bill, '
         'walk a thin book, rank two instruments by friction, turn a deposit into a '
         'leverage ratio, find the price at which your broker sells, and hold lesson '
         '10&rsquo;s trade for a month, which moves its breakeven win rate from 53.9 '
         'to 66.2 per cent.',
    intro='This module priced a seat. Four charges, the one of them that grows with '
          'your size, the ratio that ranks an instrument before you trade it, the '
          'four legal objects, the collateral that is not a loss, and the five rules '
          'under which somebody else acts in your account. Six questions, every one '
          'of them arithmetic. The last takes the trade lesson 10 priced at minus '
          '$9.29 and holds it for a month instead of three nights.',
    covers='Lessons 10 to 16, and the 200 shares of a $50 stock stopped $0.60 away '
           'that lesson 10 costed and this quiz costs again.',
    related=[(10, 'the four charges and the ratio they go into'),
             (11, 'the walk the second question prices'),
             (12, 'the friction ratio the third question computes'),
             (13, 'the contract the fourth question sizes'),
             (14, 'leverage as a consequence rather than a setting'),
             (15, 'the call price the fifth question finds'),
             (16, 'the flattery the sixth question undoes')],
    questions=[
        dict(
            title='Four charges, one bill',
            setup='      <p>Buy 400 shares of a $25 stock, a $10,000 position, with a '
                  'stop $0.40 away. The stock is quoted two cents wide. Your broker '
                  'charges half a cent a share each way, with a $1.00 minimum. The '
                  'entry filled a cent past the quote and the exit filled at the '
                  'quote. You bought on 2:1 margin, so $5,000 of it is borrowed at 9 '
                  'per cent a year, and you held it five nights.</p>\n',
            ask='What is the whole bill, what is s, and what win rate does the trade '
                'need just to break even?',
            result='$22.16, s = 13.9 per cent, and a 56.9 per cent breakeven win rate.',
            answer='      <p>The money at risk is the denominator for everything '
                   'below: 400 &times; $0.40 = $160.</p>\n' + table(
                       ['Charge', 'Arithmetic', 'Cost'],
                       [['Spread', '$0.02 &times; 400, once for the round trip',
                         '$8.00'],
                        ['Commission', '$0.005 &times; 400 each way, above the $1.00 '
                         'floor', '$4.00'],
                        ['Slippage', '$0.01 &times; 400, on the entry only', '$4.00'],
                        ['Financing', '$5,000 &times; 9% &times; 5 &divide; 365',
                         '$6.16'],
                        ['Total', '', '$22.16']]) +
                   '      <p>Then s = $22.16 &divide; $160 = 0.1385, and lesson 10 '
                   'showed that the breakeven formula never cared that s was a '
                   'spread: (1 + 0.1385) &divide; 2 = 56.9 per cent.</p>\n'
                   '      <p>The spread is $8.00 of $22.16, so the only charge on the '
                   'chart is about a third of the bill. And the floor did nothing '
                   'here, because 400 shares at half a cent is $2.00 a side. Run the '
                   'same schedule at 100 shares and the $1.00 minimum binds on both '
                   'sides, so the round trip costs two cents a share instead of one. '
                   'The smaller account pays double.</p>\n'),
        dict(
            title='What the walk costs in a thin name',
            setup='      <p>A $20 small cap is quoted 19.95 bid, 20.00 ask. The offer '
                  'side of its book:</p>\n' + table(
                      ['Price', 'Shares resting'],
                      [['20.00', '400'], ['20.05', '400'], ['20.10', '500']]) +
                  '      <p>You send a market order to buy 1,200 shares, and you would '
                  'stop out 1 per cent of price away.</p>\n',
            ask='What is the average fill, what does the entry cost against the '
                'midpoint, how much of that is the walk rather than the spread, and '
                'what share of the risk has the entry alone spent?',
            result='$20.05 average, $90.00 against the midpoint, of which $60.00 is '
                   'the walk, and the entry has spent 37.5 per cent of the risk.',
            answer='      <p>The order takes 400 at 20.00, 400 at 20.05, and 400 of '
                   'the 500 at 20.10.</p>\n' + table(
                       ['Price', 'Shares', 'Cost'],
                       [['20.00', '400', '$8,000.00'],
                        ['20.05', '400', '$8,020.00'],
                        ['20.10', '400', '$8,040.00'],
                        ['Total', '1,200', '$24,060.00']]) +
                   '      <p>So the average fill is $24,060 &divide; 1,200 = $20.05. '
                   'The midpoint was 19.975, so the entry cost 1,200 &times; $0.075 = '
                   '$90.00.</p>\n'
                   '      <p>Split it the way lesson 11 splits it. Half a spread on '
                   '1,200 shares is 1,200 &times; $0.025 = $30.00, and you would have '
                   'paid that at any size. The remaining $60.00 is the walk, and it '
                   'exists only because 1,200 was three times the 400 resting in front '
                   'of you.</p>\n'
                   '      <p>A 1 per cent stop is $0.20 a share, so the risk is 1,200 '
                   '&times; $0.20 = $240. The entry alone has spent $90 &divide; $240 '
                   '= 37.5 per cent of it, before commission, before financing and '
                   'before the exit.</p>\n'),
        dict(
            title='Which of the two is cheaper to be in',
            setup='      <p>Two candidates, measured over sixty sessions.</p>\n' +
                  table(['Instrument', 'Price', 'Spread', 'Average daily range'],
                        [['X', '$80.00', '2 cents', '1.6 per cent of close'],
                         ['Y', '$3.00', '6 cents', '7.0 per cent of close']]),
            ask='What is each friction ratio, and what is the factor between them?',
            result='1.56 per cent for X and 28.6 per cent for Y, a factor of 18.',
            answer='      <p>Both quantities go into basis points so that two '
                   'instruments at different prices become comparable. One full '
                   'spread is the round trip: half going in and half coming out.</p>\n'
                   + table(['Instrument', 'Round trip (bps)', 'Daily range (bps)',
                            'Friction ratio'],
                           [['X', '$0.02 &divide; $80 &times; 10,000 = 2.5', '160',
                             '1.56%'],
                            ['Y', '$0.06 &divide; $3 &times; 10,000 = 200', '700',
                             '28.6%']]) +
                   '      <p>So X hands over 1.56 per cent of a typical day&rsquo;s '
                   'movement for the right to participate and Y hands over 28.6 per '
                   'cent, a factor of 18.</p>\n'
                   '      <p>Read where the factor comes from. Y moves 4.4 times as '
                   'much as X, which is the part a chart shows you. It also costs 80 '
                   'times as much to cross as a fraction of its own price, which no '
                   'chart shows you at all. The second number is the larger one, and '
                   'that is the whole of lesson 12 in one line: the ranking a chart '
                   'suggests runs backwards.</p>\n'),
        dict(
            title='One contract, and the move that ends it',
            setup='      <p>The S&amp;P 500 is at 5,200 and the Micro E-mini is worth '
                  '$5 an index point. You hold one contract with $3,250 of equity '
                  'behind it, and you are trading it with a 12-point stop.</p>\n',
            ask='What leverage are you carrying, what move takes the whole deposit, '
                'how many index points is that, and how many times the risk is the '
                'money standing behind the trade?',
            result='8 times leverage, wiped by a 12.5 per cent move, which is 650 '
                   'index points, against a trade risking $60 &mdash; so the deposit '
                   'is 54.2 times the risk.',
            answer='      <p>One contract controls 5,200 &times; $5 = $26,000, and '
                   'that notional does not change with your deposit. Leverage is '
                   'notional over the equity behind it: $26,000 &divide; $3,250 = 8 '
                   'times.</p>\n'
                   '      <p>Lesson 14&rsquo;s consequence follows exactly, with no '
                   'estimation in it. At leverage L an adverse move of 1 &divide; L '
                   'is the whole deposit, so 1 &divide; 8 = 12.5 per cent, and 12.5 '
                   'per cent of 5,200 is 650 index points.</p>\n'
                   '      <p>Now the other number. A 12-point stop at $5 a point '
                   'risks 12 &times; $5 = $60, so the money standing behind the trade '
                   'is $3,250 &divide; $60 = 54.2 times what the trade actually '
                   'risks.</p>\n'
                   '      <p>Neither figure tells you the other, and only one of them '
                   'is yours. The clearing house set the collateral without ever '
                   'seeing your stop.</p>\n'),
        dict(
            title='The price at which somebody else sells',
            setup='      <p>You buy $30,000 of a stock, putting up $15,000 of your own '
                  'money and borrowing the other $15,000, which is the most the '
                  'initial rule allows. It is a volatile name, so your broker holds '
                  'you to a 40 per cent house maintenance requirement rather than the '
                  '25 per cent floor.</p>\n',
            ask='At what position value does the call arrive, what fall from $30,000 '
                'is that, and how many average days is it for the small cap of lesson '
                '12&rsquo;s table?',
            result='$25,000, a fall of 16.7 per cent, which is 3.3 average days.',
            answer='      <p>The loan is $15,000 and it does not fall with the '
                   'position. Only your equity absorbs the loss, which is why the '
                   'threshold arrives sooner than the requirement suggests: the call '
                   'comes at $15,000 &divide; (1 &minus; 0.40) = $25,000, where your '
                   '$10,000 of remaining equity is exactly 40 per cent of the '
                   'position.</p>\n'
                   '      <p>From $30,000 that is a fall of 1 &minus; $25,000 '
                   '&divide; $30,000 = 16.7 per cent. Note what is not in the '
                   'arithmetic: not your entry, not your reasoning, and not your '
                   'stop.</p>\n'
                   '      <p>Lesson 12 gave the small cap a daily range of 500 basis '
                   'points, so 16.7 per cent is 16.7 &divide; 5 = 3.3 average days. '
                   'Three ordinary sessions in one direction and the decision stops '
                   'being yours &mdash; their timing, and whichever position is '
                   'easiest to sell rather than the one you would have picked.</p>\n'),
        dict(
            title='The same trade, held for a month',
            setup='      <p>Back to the trade lesson 10 priced: 200 shares of a $50 '
                  'stock, a stop $0.60 away, so $120 at risk. Spread $2.00, commission '
                  '$2.00, slippage $2.00, and $5,000 borrowed at 8 per cent a year. '
                  'Lesson 10 held it three nights and the bill came to $9.29. Hold it '
                  'thirty instead. A simulator then reports 80 of these trades at a '
                  '57.5 per cent win rate, wins and losses both one unit of risk, and '
                  'puts you up $1,440.</p>\n',
            ask='On which night does financing alone pass the other three put '
                'together, what is the thirty-night bill, what breakeven win rate does '
                'it demand, and what do the simulator&rsquo;s 80 trades actually net?',
            result='The sixth night. $38.88 a round trip, a 66.2 per cent breakeven '
                   'win rate, and the 80 trades net &minus;$1,670.40.',
            answer='      <p>Three of the four charges are paid per trip and do not '
                   'care how long you stay: $2.00 + $2.00 + $2.00 = $6.00. The fourth '
                   'is paid for the staying, at $5,000 &times; 8% &divide; 365 = '
                   '$1.0959 a night. So financing equals the other three after $6.00 '
                   '&divide; $1.0959 = 5.5 nights, which means the sixth night is '
                   'where the column you cannot see becomes the larger one.</p>\n'
                   '      <p>Thirty nights of it is 30 &times; $1.0959 = $32.88, so '
                   'the bill is $6.00 + $32.88 = $38.88.</p>\n' + table(
                       ['Held', 'Financing', 'Whole bill', 's', 'Breakeven win rate'],
                       [['Three nights, as lesson 10 held it', '$3.29', '$9.29',
                         '7.7%', '53.9%'],
                        ['Thirty nights', '$32.88', '$38.88', '32.4%', '66.2%']]) +
                   '      <p>Nothing about the setup changed. The instrument is the '
                   'same, the stop is the same, the entry technique is rounding error '
                   'at this holding period, and the win rate the trade needs has gone '
                   'from 53.9 to 66.2 per cent because of a decision that felt like '
                   'patience.</p>\n'
                   '      <p>Which is what the simulator declined to charge. Eighty '
                   'round trips at $38.88 is $3,110.40, so the $1,440 it reported is '
                   'really $1,440 &minus; $3,110.40 = &minus;$1,670.40. And 57.5 per '
                   'cent never cleared 66.2 per cent, so the strategy did not stop '
                   'working somewhere between the simulator and the broker. It was '
                   'losing money the whole time.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can put a number on the seat before you sit in it. '
          'Handed a schedule and a holding period, you produce a bill; handed a book '
          'and an order, you produce the walk; handed a price and a range, you produce '
          'the share of the day&rsquo;s movement the instrument takes for itself; '
          'handed a loan and a requirement, you produce the price at which the '
          'decision stops being yours. Every one of those was available before the '
          'trade, and every one of them was arithmetic.</p>\n'
          '      <p>Notice what the module never did. It never told you what to buy. '
          'Cost sets the bar and clearing it is a different subject, which is where '
          'module 3 starts: a setup winning seven times in ten can lose 0.125 units of '
          'risk on every trade, while one winning four times in ten makes 1.40. The '
          'win rate is not the thing.</p>\n',
),

# ---------------------------------------------------------------- module 3
dict(
    mod=3, tier='beginner', slug='module-3-quiz',
    slots=[17, 18, 19, 20, 21, 22, 23, 24],
    title='Module 3 Quiz: Uncertainty, Risk and Ruin',
    desc='Six computations from the uncertainty module. Read an edge off a '
         'six-trade log, find when a losing run is due, size the evidence, place '
         'a stop beyond the level, price ruin at two fractions, and run the '
         'module&rsquo;s own system through the recovery arithmetic.',
    intro='This module never once looked at a chart. It turned a method into two '
          'numbers, said what a run of them feels like, how long before the record '
          'can settle anything, how much of the account to put behind each one, '
          'where the stop belongs, what the tail costs, and which ten fields make '
          'any of it answerable. Six questions. The last takes the 45 per cent '
          'system the module has carried since lesson 17 and prices what trying to '
          'get the money back would cost.',
    covers='Lessons 17 to 24, and the system winning 45 per cent of the time at a '
           'payoff of 2 that every table in the module was computed on.',
    related=[(17, 'the two numbers every other lesson took on credit'),
             (18, 'the run the second question times'),
             (19, 'the sample size the third question computes'),
             (20, 'the fraction, and the tax the sixth question prices'),
             (21, 'the buffer the fourth question puts beyond the level'),
             (22, 'the ruin formula the fifth question applies'),
             (23, 'the ten fields the first question reads'),
             (24, 'the recovery arithmetic the sixth question finishes')],
    questions=[
        dict(
            title='An edge, read off six rows',
            setup='      <p>Six trades from one record. The account stood at $50,000 '
                  'throughout, and the stop column is the price as it was first '
                  'placed.</p>\n' + table(
                      ['Entry', 'Stop as placed', 'Size', 'Exit', 'Why out'],
                      [['84.00', '82.50', '400', '87.60', 'target'],
                       ['85.20', '83.80', '430', '83.80', 'stop'],
                       ['61.50', '60.30', '500', '60.20', 'stop'],
                       ['86.40', '85.00', '425', '85.55', 'manual'],
                       ['62.80', '61.30', '400', '66.10', 'target'],
                       ['88.10', '86.60', '900', '87.20', 'manual']]),
            ask='What are p, b and the expectancy, and what payoff ratio would a '
                'broker statement have reported instead?',
            result='p = 33.3 per cent, b = 2.80, and +0.22R a trade in planned R. '
                   'The money view gives 2.28.',
            answer='      <p>Each row carries its own R, because R is the distance '
                   'from the entry to the stop as placed. Divide the move by that '
                   'distance and the size drops out.</p>\n' + table(
                       ['Risk a share', 'Money at risk', 'Result', 'In R'],
                       [['$1.50', '$600.00', '+$1,440.00', '+2.40R'],
                        ['$1.40', '$602.00', '−$602.00', '−1.00R'],
                        ['$1.20', '$600.00', '−$650.00', '−1.08R'],
                        ['$1.40', '$595.00', '−$361.25', '−0.61R'],
                        ['$1.50', '$600.00', '+$1,320.00', '+2.20R'],
                        ['$1.50', '$1,350.00', '−$810.00', '−0.60R']]) +
                   '      <p>Two of six won, so p = 33.3 per cent. The winners '
                   'average 2.30R and the losers average 0.82R, so b = 2.30 &divide; '
                   '0.82 = 2.80, and the expectancy is 0.333 &times; 2.30 &minus; '
                   '0.667 &times; 0.82 = +0.22R a trade.</p>\n'
                   '      <p>Lesson 17 wrote the same thing as p &times; b &minus; '
                   '(1 &minus; p), which gives +0.27 here. That is not a '
                   'contradiction, it is a different unit: lesson 17 measures in '
                   'average losses and this measures in the R you planned, and the '
                   'log says the average loss came to 0.82 of a planned R. Multiply '
                   '0.27 by 0.82 and you have 0.22 back. Only the record knows the '
                   'two units differ.</p>\n'
                   '      <p>Now the broker&rsquo;s view of the same six trades. '
                   'The winners average $1,380 and the losers average $605.81, so '
                   'the payoff ratio is 2.28 rather than 2.80, wrong by about a '
                   'fifth. The cause is the last row: five trades risked around $600 '
                   'and one risked $1,350. Money mixes how good the trades were with '
                   'how large the bets were. R separates them, and that separation '
                   'is the only reason the stop column exists.</p>\n'
                   '      <p>One thing the six rows cannot tell you is whether any '
                   'of this is real. Lesson 19 puts the sample needed at hundreds. '
                   'Six rows give you the method, not the answer.</p>\n'),
        dict(
            title='When the run is due',
            setup='      <p>A method wins 38 per cent of the time, its winners pay '
                  '2.6 times its losers, and you take four trades a week. A run of '
                  'seven losses would genuinely worry you.</p>\n',
            ask='How many trades until the first run of seven, roughly how long is '
                'that in months, and how much does the payoff of 2.6 change the '
                'answer?',
            result='72 trades, about four months, and the payoff changes nothing at '
                   'all.',
            answer='      <p>Lesson 18&rsquo;s closed form is (1 &minus; q^k) '
                   '&divide; (p &times; q^k), with q the loss rate and k the run '
                   'length. Here q = 0.62 and k = 7, so q^k = 0.0352.</p>\n'
                   '      <p>That gives (1 &minus; 0.0352) &divide; (0.38 &times; '
                   '0.0352) = 0.9648 &divide; 0.0134 = 72 trades. At four a week '
                   'that is 18 weeks, a little over four months.</p>\n'
                   '      <p>Now look at what never entered the calculation. Not b, '
                   'not the expectancy, not a single thing about how much a winner '
                   'pays. A run is a property of the win rate and of the length of '
                   'the sample, and of nothing else, which is why the run you are '
                   'living through carries no information about whether the method '
                   'is any good.</p>\n'
                   '      <p>And read the answer as a rate rather than an event. Not '
                   'once in a career: once every 72 trades, for as long as you keep '
                   'trading. Over five years at four a week you should expect about '
                   'fourteen of them, and be surprised by none.</p>\n'),
        dict(
            title='How much record it would take',
            setup='      <p>The same method: it wins 38 per cent of the time at a '
                  'payoff of 2.6. Lesson 10&rsquo;s charges come to s = 0.12 on this '
                  'instrument.</p>\n',
            ask='What is the expectancy before and after costs, how much noise sits '
                'on one trade, and how many trades would it take to establish that '
                'the edge exists at all in each case?',
            result='+0.37R before costs and +0.25R after. One trade carries 1.75R of '
                   'noise. 177 trades before costs, 390 after.',
            answer='      <p>The expectancy is 0.38 &times; 2.6 &minus; 0.62 = '
                   '+0.37R, and lesson 17&rsquo;s breakeven of (1 + s) &divide; '
                   '(b + 1) = 1.12 &divide; 3.6 = 31.1 per cent confirms that 38 per '
                   'cent clears the bar. Subtract the charges and the edge is +0.25R '
                   'a trade.</p>\n'
                   '      <p>The noise comes from the same two inputs: '
                   '&sigma;&sup2; = p&middot;b&sup2; + (1 &minus; p) &minus; '
                   'E&sup2; = 0.38 &times; 6.76 + 0.62 &minus; 0.37&sup2; = 3.053, '
                   'so &sigma; = 1.75R. One trade in a good method carries nearly '
                   'five times as much noise as signal.</p>\n' + table(
                       ['What you are establishing', 'The edge to catch', 'Trades',
                        'At four a week'],
                       [['There is an edge at all, before costs', '0.37R', '177',
                         '10 months'],
                        ['There is an edge at all, after costs', '0.25R', '390',
                         '1.9 years']]) +
                   '      <p>Both come from n = 7.85 &times; &sigma;&sup2; &divide; '
                   '&Delta;&sup2;, and the second row is the one worth keeping. '
                   'Subtracting the same charge from every trade moves the average '
                   'and leaves the spread exactly where it was, so the charges did '
                   'not merely take a third of the edge. They more than doubled the '
                   'record you need to prove you have one.</p>\n'),
        dict(
            title='Where the stop goes, and what it buys',
            setup='      <p>You are long at $124.00. You entered because $121.50 '
                  'held, so $121.50 is the price at which the reason is gone. The '
                  'average true range is $0.90. The next level in your favour is '
                  '$131.00. Your account is $40,000 and you risk 1.5 per cent a '
                  'trade.</p>\n',
            ask='Put the stop one average bar beyond the level. How many shares, '
                'what is b, and what win rate does that need? Then do the same for a '
                'stop 2 per cent below the entry and say which one is wrong.',
            result='176 shares, b = 2.06, and a 32.7 per cent breakeven. The 2 per '
                   'cent stop looks better in every column and is the wrong one.',
            answer='      <p>One average bar beyond $121.50 puts the stop at $120.60, '
                   'so the risk is $3.40 a share. One R is $40,000 &times; 1.5% = '
                   '$600, and $600 &divide; $3.40 = 176 shares, a position worth '
                   '$21,824. The target is $7.00 away, so b = 7.00 &divide; 3.40 = '
                   '2.06 and the breakeven win rate is 1 &divide; 3.06 = 32.7 per '
                   'cent.</p>\n'
                   '      <p>Now the percentage stop, which is where the trap '
                   'is.</p>\n' + table(
                       ['Where the stop goes', 'Distance', 'Shares at $600 risk',
                        'Reward to risk, b', 'Win rate to break even'],
                       [['2% below the entry, $121.52', '$2.48', '241', '2.82',
                         '26.2%'],
                        ['One average bar beyond the level, $120.60', '$3.40', '176',
                         '2.06', '32.7%']]) +
                   '      <p>The first row wins every column. It buys 65 more shares, '
                   'it shows the better reward to risk, and it needs six and a half '
                   'fewer points of win rate. It is also the one that is certainly '
                   'wrong: $121.52 sits two cents above $121.50, which is on the '
                   'level rather than beyond it. The ordinary probe that tests the '
                   'level takes you out, and it takes you out while the reason you '
                   'entered is exactly as true as it was when you entered.</p>\n'
                   '      <p>The extra 6.5 points of win rate is what a real stop '
                   'costs. It is not an upgrade. It is a worse-looking trade that is '
                   'an actual one.</p>\n'),
        dict(
            title='What the fraction does to the tail',
            setup='      <p>A method wins 56 per cent of the time at even money, so '
                  'every winner and every loser is the same size. Lesson 22&rsquo;s '
                  'classical result applies exactly: ruin is ((1 &minus; p) &divide; '
                  'p) raised to the power of how many bets your purse holds.</p>\n',
            ask='What is the risk of ruin at 2 per cent a trade and at 1 per cent, '
                'and what happens to both if the win rate turns out to be exactly 50 '
                'per cent?',
            result='0.00058 per cent at 2 per cent risk and about three in a hundred '
                   'billion at 1 per cent. At a 50 per cent win rate both are 100 '
                   'per cent.',
            answer='      <p>Risking 2 per cent means the purse holds 50 bets, so '
                   'u = 50 and the base is 0.44 &divide; 0.56 = 0.7857. Raised to the '
                   '50th power that is 0.0000058, or 0.00058 per cent.</p>\n'
                   '      <p>Halve the risk and u doubles to 100, which does not '
                   'halve the answer. It squares it: 0.0000058&sup2; = 3.4 &times; '
                   '10&#8315;&sup1;&sup1;, about three chances in a hundred billion. '
                   'Every halving of the fraction squares the odds of survival, '
                   'which is why the distance between risking 2 per cent and risking '
                   '10 per cent is nothing like a factor of five.</p>\n'
                   '      <p>Now set p to exactly 0.50. The base becomes 0.50 '
                   '&divide; 0.50 = 1, and 1 raised to any power at all is 1. Ruin is '
                   'certain however large the purse, and the size of the bet decides '
                   'only how long it takes to arrive.</p>\n'
                   '      <p>That is the sentence the whole module rests on. Sizing '
                   'converts an edge into survival and cannot manufacture one. '
                   'Without an edge you are not managing risk, you are choosing a '
                   'pace.</p>\n'),
        dict(
            title='The system this module carried, and the way out of the hole',
            setup='      <p>Back to the system every table in this module was '
                  'computed on: it wins 45 per cent of the time and its winners pay '
                  'twice its losers. You are in an ordinary drawdown, the 9R median '
                  'that half of all careers on this system meet. Lesson 24 simulated '
                  'the next twenty trades: risking 1 per cent leaves the '
                  'one-in-twenty career at 0.867 of its starting equity, and risking '
                  '5 per cent leaves it at 0.681.</p>\n',
            ask='What is the expectancy? What do one winner and two losers cost the '
                'account at 1 per cent and at 5 per cent, given that they come to '
                'exactly nothing in R? And what gain does each of those two '
                'one-in-twenty careers need to get back to where it started?',
            result='+0.35R a trade. The three trades cost 0.030 per cent at 1 per '
                   'cent risk and 0.725 per cent at 5, a ratio of 24. And the two '
                   'careers need 15.3 per cent and 46.8 per cent to get back.',
            answer='      <p>The expectancy is 0.45 &times; 2 &minus; 0.55 = +0.35R '
                   'a trade, which is the number the whole module has been spending. '
                   'The sequence +2R, &minus;1R, &minus;1R sums to zero in R and '
                   'does not sum to zero in the account.</p>\n' + table(
                       ['Risk a trade', 'The three trades', 'Left with',
                        'Cost of standing still'],
                       [['1%', '1.02 &times; 0.99 &times; 0.99', '0.99970',
                         '0.030%'],
                        ['5%', '1.10 &times; 0.95 &times; 0.95', '0.99275',
                         '0.725%']]) +
                   '      <p>Nothing about the trades changed and none of the three '
                   'was a mistake. Only the fraction moved, and the cost of standing '
                   'still grew 24 times, because it goes with the square of the '
                   'fraction. Double what you risk and you very nearly quadruple '
                   'what standing still costs you.</p>\n'
                   '      <p>Then the way back. A career left at 0.867 needs 1 '
                   '&divide; 0.867 &minus; 1 = 15.3 per cent to reach its old high. '
                   'One left at 0.681 needs 1 &divide; 0.681 &minus; 1 = 46.8 per '
                   'cent. The first is a good quarter and the second is a year.</p>\n'
                   '      <p>Read the two together and the module closes on itself. '
                   'The 5 per cent career was sizing up to get the money back, and '
                   'it works: it reaches a new high inside twenty trades nine times '
                   'in ten against fewer than half at 1 per cent. What it also does '
                   'is turn a 13 per cent hole into a 32 per cent one in the '
                   'one-in-twenty case, and 46.8 per cent is not a plan. The edge '
                   'was identical in both. Everything that differs is a fraction you '
                   'chose before any of it began.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can get a number out of your own record and then say '
          'what it is entitled to settle. Handed six rows, you produce an '
          'expectancy; handed a win rate, you produce the run and when to expect it; '
          'handed an edge and its noise, you produce the sample that would prove it; '
          'handed a level and a volatility, you produce a share count; handed a win '
          'rate and a fraction, you produce a probability of being finished. Nothing '
          'in the module asked what the market was doing, and nothing in it needed '
          'to.</p>\n'
          '      <p>Which is exactly the gap module 4 opens on. It starts with a '
          'stop placed a tenth of an average bar below the level: it shows the best '
          'reward to risk on the page at 9.2 to one, it needs a win rate of only 9.8 '
          'per cent, and it still loses money, because four trades in five never '
          'find out whether they were right.</p>\n',
),

# ---------------------------------------------------------------- module 4
dict(
    mod=4, tier='intermediate', slug='module-4-quiz',
    slots=[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    title='Module 4 Quiz: Reading the Auction',
    desc='Six computations from the auction module. Price a stop buffer against '
         'the probe, turn a wall read into a posterior, find a point of control at '
         'three bin widths, sign two identical footprints, count what a hidden-size '
         'detector could not have seen, and run the fractal over the module&rsquo;s '
         'own twenty bars.',
    intro='Eleven lessons, and every one of them ended at the same place: the '
          'number you were about to act on belonged to a setting you had not '
          'written down. A buffer, a base rate, a bin width, an aggressor rule, a '
          'displayed quantity, a swing lookback. Six questions, all arithmetic. The '
          'last runs the fractal over the twenty bars this module has been carrying '
          'since lesson 32 and turns the swing it finds into a stop and a payoff.',
    covers='Lessons 25 to 35, and the twenty bars that lesson 32 stated in full, '
           'lesson 33 gave bodies, and lessons 34 and 35 carried out to sixty.',
    related=[(25, 'the buffer the first question prices'),
             (26, 'the posterior the second question computes'),
             (28, 'the two footprints the fourth question signs'),
             (29, 'the point of control the third question moves'),
             (30, 'the value area the third question reads instead'),
             (31, 'the tests the fifth question counts'),
             (32, 'the swing rule the sixth question runs'),
             (35, 'the levels that swing rule decides exist')],
    questions=[
        dict(
            title='What the buffer buys, and what it costs',
            setup='      <p>A long taken on the reclaim of a level. The entry is 0.3 '
                  'average ranges above the level and the target is 4.0 above it. The '
                  'method works 45 per cent of the time when it is left alone, and a '
                  'probe past the level travels on average 0.4 average ranges before '
                  'turning, so the chance a stop d below the level survives one is '
                  '1 &minus; e raised to the power &minus;d &divide; 0.4.</p>\n',
            ask='Put the stop 0.20 average ranges below the level, then 0.80. Give '
                'the payoff, the breakeven win rate, the survival chance and the '
                'expectancy for each.',
            result='At 0.20 the payoff is 7.40, the breakeven 11.9 per cent, survival '
                   '39.3 per cent and the expectancy +0.49R. At 0.80 they are 3.36, '
                   '22.9 per cent, 86.5 per cent and +0.70R.',
            answer='      <p>The risk is the entry offset plus the buffer and the '
                   'reward is 4.0 &minus; 0.3 = 3.7 average ranges either way.</p>\n'
                   + table(['Stop below the level', 'Risk', 'Payoff',
                            'Breakeven win rate', 'Survives the probe', 'Expectancy'],
                           [['0.20', '0.50', '7.40', '11.9%', '39.3%', '+0.49R'],
                            ['0.80', '1.10', '3.36', '22.9%', '86.5%', '+0.70R']]) +
                   '      <p>The expectancy is where the two halves meet. When the '
                   'probe removes you, you lose a whole R and the trade never finds '
                   'out whether it was right; when it does not, you have a 45 per '
                   'cent shot at the payoff. So at 0.20 that is 0.393 &times; (0.45 '
                   '&times; 7.40 &minus; 0.55) &minus; 0.607 = +0.49R, and at 0.80 it '
                   'is 0.865 &times; (0.45 &times; 3.36 &minus; 0.55) &minus; 0.135 = '
                   '+0.70R.</p>\n'
                   '      <p>Read the first two columns of the tighter stop and it '
                   'wins outright: more than twice the payoff and eleven fewer points '
                   'of win rate needed. It is still the worse trade, by a fifth of an '
                   'R, and the whole of the difference is the six trades in ten that '
                   'never got to be right or wrong.</p>\n'),
        dict(
            title='What a wall read is worth on two instruments',
            setup='      <p>You have a way of telling, from how a large resting order '
                  'behaves, whether it will still be there when price arrives. Tested '
                  'against what actually happened, it is right 75 per cent of the '
                  'time when the wall holds and right 75 per cent of the time when it '
                  'does not. On one instrument 8 walls in 100 hold. On another, 30 do. '
                  'Take 200 tests on each.</p>\n',
            ask='When it says the wall will hold, what is the chance it holds, on '
                'each instrument?',
            result='20.7 per cent on the first and 56.3 per cent on the second, from '
                   'the same read.',
            answer='      <p>The read is only ever a multiplier on what was already '
                   'true. On the first instrument 16 of the 200 hold and the '
                   'detector calls 75 per cent of them, so 12 true calls; of the 184 '
                   'that do not hold it wrongly calls a quarter, so 46 false '
                   'ones.</p>\n'
                   + table(['Walls that hold', 'Hold, out of 200', 'True calls',
                            'False calls', 'Chance it holds when the read says so'],
                           [['8 in 100', '16', '12', '46', '20.7%'],
                            ['30 in 100', '60', '45', '35', '56.3%']]) +
                   '      <p>So 12 &divide; 58 = 20.7 per cent and 45 &divide; 80 = '
                   '56.3 per cent. The same eye, the same book, the same 75 per cent, '
                   'and a read that is wrong four times in five on one instrument and '
                   'right more often than not on the other.</p>\n'
                   '      <p>Notice what never entered it. Not the size of the wall. '
                   'Ten thousand and forty thousand give the same answer, because the '
                   'two quantities that decide it are the base rate and the accuracy, '
                   'and neither of them is on the screen.</p>\n'),
        dict(
            title='Where the point of control is, at three settings',
            setup='      <p>A session, one tick at a time.</p>\n' + table(
                      ['Price', 'Volume'],
                      [['100.20', '300'], ['100.19', '420'], ['100.18', '900'],
                       ['100.17', '640'], ['100.16', '560'], ['100.15', '480'],
                       ['100.14', '520'], ['100.13', '860'], ['100.12', '780'],
                       ['100.11', '340'], ['100.10', '260'], ['100.09', '220']]),
            ask='Find the point of control at one tick, at two ticks with the grid on '
                'the even cent, and at two ticks with the grid shifted one cent. How '
                'far apart are they?',
            result='100.18 at one tick, 100.12 to 100.13 on the even grid, and 100.17 '
                   'to 100.18 shifted &mdash; six ticks of a twelve-tick session.',
            answer='      <p>At one tick it is simply the tallest bar: 900 at 100.18. '
                   'Then pair the prices up, twice, starting one cent apart.</p>\n'
                   + table(['Bin width', 'Point of control', 'Volume in it',
                            'Runner-up', 'Margin'],
                           [['1 tick', '100.18', '900', '860 at 100.13', '40'],
                            ['2 ticks, grid on the even cent', '100.12 to 100.13',
                             '1,640', '1,320', '320'],
                            ['2 ticks, grid shifted one cent', '100.17 to 100.18',
                             '1,540', '1,380', '160']]) +
                   '      <p>The one-tick reading and the shifted two-tick reading '
                   'both land at the top of the session. The even-cent grid, which is '
                   'the one most platforms ship, lands six ticks lower &mdash; not a '
                   'neighbouring price, the other half of the range. It gets there by '
                   'pairing 100.13 with 100.12 and separating 100.18 from 100.17, and '
                   'nothing about that pairing came from the market.</p>\n'
                   '      <p>The session is 6,280 contracts and the margin on the '
                   'shifted grid is 160 of them, about two and a half per cent. Lesson '
                   '19 would call a difference that size unmeasured rather than '
                   'measured. This is the reason lesson 30 reads a value area instead: '
                   'an interval moves far less than a mode does when you change the '
                   'bin width underneath it.</p>\n'),
        dict(
            title='Two footprints that cannot be told apart',
            setup='      <p>Two bars. Both open at 100.05, both high at 100.65, both '
                  'low at 99.85, both close at 100.35, and both trade 10,380 '
                  'contracts. Here is what each did at each price.</p>\n' + table(
                      ['Price', 'A buys', 'A sells', 'B buys', 'B sells'],
                      [['100.60', '160', '180', '70', '270'],
                       ['100.50', '340', '300', '160', '480'],
                       ['100.40', '720', '520', '360', '880'],
                       ['100.30', '980', '580', '570', '990'],
                       ['100.20', '1,020', '620', '720', '920'],
                       ['100.10', '1,440', '620', '980', '1,080'],
                       ['100.00', '1,440', '620', '1,030', '1,030'],
                       ['99.90', '520', '320', '410', '430']]),
            ask='What is each bar&rsquo;s delta, and what does the footprint settle '
                'about which one to fade?',
            result='+2,860 for A and &minus;1,780 for B, on identical bars. The '
                   'footprint settles nothing.',
            answer='      <p>Add the columns. A bought 6,620 and sold 3,760, so its '
                   'delta is +2,860. B bought 4,300 and sold 6,080, so its delta is '
                   '&minus;1,780. Both traded 10,380 contracts in total, and both '
                   'printed the same four prices.</p>\n'
                   '      <p>So bar B closed thirty cents above its open on net '
                   'aggressive selling. One school calls that absorption and buys it: '
                   'sellers hit the bid all the way up and price rose anyway, so '
                   'somebody large was taking the other side. The other calls it '
                   'exhaustion and fades it: the buying that lifted the bar came from '
                   'nowhere the tape can see, and a close near the high on negative '
                   'delta is a bar that ran out of fuel.</p>\n'
                   '      <p>Both readings are internally consistent, both are widely '
                   'taught, and the footprint contains nothing that decides between '
                   'them. It is a second measurement with its own error rate, not the '
                   'truth behind the candle. And the delta itself is a classification '
                   'rather than a count &mdash; lesson 8 bounded how wide that '
                   'interval gets when the trades between the quotes are signed by a '
                   'rule.</p>\n'),
        dict(
            title='What the detector could not have seen',
            setup='      <p>One price level, displaying 300, tested a hundred times '
                  'over a fortnight. A reserve can only reveal itself if the display '
                  'is cleared and something is still there, so here is what actually '
                  'happened on each test.</p>\n' + table(
                      ['What happened at the level', 'Tests', 'Refill seen'],
                      [['Under half the displayed 300 traded', '64', '0'],
                       ['Over half traded, display not cleared', '19', '0'],
                       ['Display cleared, price moved on', '5', '0'],
                       ['Display cleared and refilled at the price', '12', '12']]),
            ask='On how many of the hundred tests could the detector have fired at '
                'all, and what does a quiet book prove?',
            result='Seventeen. It fired on twelve of those. A quiet book proves '
                   'nothing, because 83 tests could not have shown a reserve however '
                   'much was hidden.',
            answer='      <p>Only the last two rows are tests. On the first 83 the '
                   'displayed quantity was never exhausted, so a reserve of any size '
                   'sitting behind it would have gone unobserved &mdash; the '
                   'measurement was never made.</p>\n'
                   '      <p>Of the 17 tests that could have fired, 12 did: the '
                   'display cleared and was replaced at the same price. That is 70.6 '
                   'per cent of the tests that count and 12 per cent of all of them, '
                   'and the second figure is the one people quote.</p>\n'
                   '      <p>Which makes hidden size a different object from lesson '
                   '26&rsquo;s wall. When the detector fires it is an observation, not '
                   'a read, and no posterior is needed: something refilled, so '
                   'something was there. What it cannot do is the negative. A book '
                   'that never fires is 83 tests that were never run, and every '
                   'measurement of how much was hidden is a floor rather than a '
                   'figure.</p>\n'
                   '      <p>Twelve episodes is also a small number in lesson '
                   '19&rsquo;s sense. It is enough to establish that reserves exist '
                   'on this level and nothing like enough to say how often they '
                   'hold.</p>\n'),
        dict(
            title='The twenty bars, one last time',
            setup='      <p>The series lesson 32 stated in full, which lesson 33 gave '
                  'bodies and lessons 34 and 35 carried out to sixty. The highs are '
                  '100.8, 101.6, 101.1, 102.9, 102.4, 104.2, 103.5, 103.0, 105.4, '
                  '104.7, 106.8, 106.1, 104.3, 105.9, 103.6, 105.1, 102.2, 103.4, '
                  '100.9 and 101.8. The lows are 100.0, 100.7, 100.2, 101.5, 101.3, '
                  '102.8, 102.4, 101.9, 103.8, 103.5, 105.0, 104.4, 102.9, 103.9, '
                  '102.0, 103.0, 100.6, 101.4, 99.2 and 100.1. The average bar range '
                  'is 1.46 points.</p>\n',
            ask='Run the fractal at two bars either side: which bars are swing highs '
                'and lows? A swing is confirmed two bars after it forms, so when '
                'could you first act on the top, and where was price by then? Then '
                'put a stop half an average range below the swing low, enter 0.4 '
                'above it, target the series high, and give the payoff.',
            result='Swing highs at bars 6 and 11, one swing low at bar 8. The top is '
                   'actionable at bar 13, by which point price is 3.9 points off it. '
                   'The trade is 102.48 with a stop at 101.17, a payoff of 3.28 and a '
                   '23.3 per cent breakeven.',
            answer='      <p>A bar is a swing high if its high beats the two on each '
                   'side of it. Bar 6 at 104.2 beats 102.9, 102.4, 103.5 and 103.0. '
                   'Bar 11 at 106.8 beats everything near it. Nothing else survives: '
                   'bar 9 at 105.4 loses to bar 11, bar 14 at 105.9 loses to bar 12, '
                   'and bar 16 at 105.1 loses to bar 14. On the lows only bar 8 at '
                   '101.9 beats its four neighbours.</p>\n' + table(
                       ['Swing rule', 'Swing highs', 'Swing lows', 'At bars'],
                       [['1 bar either side', '8', '8', 'every other turn'],
                        ['2 bars either side', '2', '1', 'highs 6 and 11, low 8'],
                        ['3 bars either side', '1', '0', 'high 11 only']]) +
                   '      <p>Now the lag, which is the part that does not appear on '
                   'anybody&rsquo;s marked-up chart. The high at bar 11 is not a swing '
                   'high until bar 13 has closed, so the earliest you could act on it '
                   'is bar 13 &mdash; and bar 13&rsquo;s low is 102.9, which is 3.9 '
                   'points below the 106.8 you would be reacting to. The chart in the '
                   'screenshot and the chart you were looking at are two bars '
                   'apart.</p>\n'
                   '      <p>Then the trade. Lesson 32 said the stop belongs beyond '
                   'the swing that defined the break, and lesson 25 priced how far '
                   'beyond. Half an average range below 101.9 is 101.9 &minus; 0.73 = '
                   '101.17, and 0.4 above it is 102.48, so the risk is 1.31 points. '
                   'The target at 106.8 is 4.32 away, so the payoff is 4.32 &divide; '
                   '1.31 = 3.28 and the breakeven win rate is 1 &divide; 4.28 = 23.3 '
                   'per cent.</p>\n'
                   '      <p>Every number in that paragraph came from a rule with a '
                   'setting in it. Change the lookback to three and there is no swing '
                   'low at all, so there is no stop, so there is no trade. That is the '
                   'module in one line: the level was never on the chart, it was in '
                   'the settings.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can say which of your numbers is a measurement and '
          'which is a choice. The volume at a price is a count and every venue agrees '
          'on it; the point of control computed from it moved six ticks when a grid '
          'shifted one cent. A refill is an observation; a wall read is a posterior '
          'that swings from 21 to 56 per cent on the base rate alone. A swing high '
          'looks like a thing on the chart and is the output of a number nobody says '
          'out loud. None of that makes the tools useless. It makes the setting part '
          'of the claim.</p>\n'
          '      <p>Module 5 asks the question this one has been carefully not '
          'asking: whether any of it predicts anything, and it starts by finding that '
          'the same instrument is two different instruments depending on which regime '
          'it is in.</p>\n',
),

]

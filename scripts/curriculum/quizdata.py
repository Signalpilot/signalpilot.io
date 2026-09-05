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

# ---------------------------------------------------------------- module 5
dict(
    mod=5, tier='intermediate', slug='module-5-quiz',
    slots=[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
    title='Module 5 Quiz: Context',
    desc='Six computations from the context module. Read a regime off one ratio, '
         'find the two break-even points of a filter, clear an opening auction by '
         'hand, take three numbers out of one straddle, scale a volatility and a '
         'hedge, and regroup the module&rsquo;s own twenty bars.',
    intro='This module asked when a reading means anything, and answered with '
          'measurements rather than impressions: a regime is a ratio, a timeframe '
          'is a grouping rule with two settings, a filter is an exchange with a '
          'price, an auction is one equation solved once, and an announcement is '
          'quoted out loud by the option chain. Six questions, all arithmetic. The '
          'last regroups the twenty bars this course has carried since lesson 32 and '
          'watches a summary move eight-fold while the highest price in the '
          'sample never moves at all.',
    covers='Lessons 36 to 47, and the twenty bars the last two modules have been '
           'built on.',
    related=[(36, 'the ratio the first question computes'),
             (38, 'the two settings the sixth question changes'),
             (39, 'the filter the second question prices'),
             (42, 'the auction the third question clears'),
             (43, 'the straddle the fourth question reads'),
             (44, 'the volatility the fifth question scales'),
             (45, 'the hedge and the book the fifth question sizes'),
             (47, 'the release that moves every position at once')],
    questions=[
        dict(
            title='One ratio, three windows',
            setup='      <p>Eleven closes: 100.0, 100.8, 100.3, 101.4, 100.9, 102.2, '
                  '101.6, 102.8, 102.1, 103.4 and 102.9. Lesson 36&rsquo;s ratio is '
                  'the distance travelled that ended up as net progress: the absolute '
                  'change from first close to last, divided by the sum of the '
                  'absolute changes between consecutive closes.</p>\n',
            ask='What is the ratio over all eleven, over the first six, and over the '
                'last six?',
            result='0.34 over all eleven, 0.52 over the first six and 0.16 over the '
                   'last six.',
            answer='      <p>The path is the same in every case: add up every step '
                   'without regard to sign. The net is one subtraction.</p>\n'
                   + table(['Window', 'Net progress', 'Distance travelled', 'Ratio'],
                           [['All eleven closes', '2.9', '8.5', '0.34'],
                            ['First six', '2.2', '4.2', '0.52'],
                            ['Last six', '0.7', '4.3', '0.16']]) +
                   '      <p>The two halves travelled almost exactly the same '
                   'distance, 4.2 against 4.3, and kept three times as much of it in '
                   'the first as in the second. That is the whole content of the '
                   'measurement: not how far price went, but how much of the going '
                   'it held on to.</p>\n'
                   '      <p>And notice that the eleven-close reading sits between '
                   'the two, which is what an average of two regimes looks like and '
                   'is not a regime anything was ever in. Lesson 36 changed a window '
                   'from ten closes to thirty and got two readings that disagreed '
                   'about the state of the market on twenty-two bars out of thirty. '
                   'This is the same effect on eleven closes.</p>\n'),
        dict(
            title='What a filter has to clear, twice',
            setup='      <p>A method takes 100 trades, wins 40 of them, and its '
                  'winners pay 2.5 times its losers. You are considering a filter '
                  'that would have removed 40 per cent of the losing trades. It also '
                  'removes some winners, because every filter does.</p>\n',
            ask='What does the method make now? What happens to the expectancy per '
                'trade and to the total if the filter takes 20 per cent of the '
                'winners, and what if it takes 30? At what share of winners does the '
                'money stop improving?',
            result='40R now at 0.40R a trade. At 20 per cent the filter makes 44R at '
                   '0.65R; at 30 per cent it makes 34R at 0.53R. The money stops '
                   'improving at 24 per cent.',
            answer='      <p>Unfiltered the method wins 40 &times; 2.5 = 100R and '
                   'loses 60R, so it makes 40R over 100 trades, or 0.40R a trade.'
                   '</p>\n' + table(
                       ['Filter removes', 'Trades kept', 'Total', 'Per trade'],
                       [['Nothing', '100.0', '40.0R', '0.40R'],
                        ['40% of losers, 20% of winners', '68.0', '44.0R', '0.65R'],
                        ['40% of losers, 30% of winners', '64.0', '34.0R', '0.53R']]) +
                   '      <p>Both filters raise the expectancy per trade, and they '
                   'raise it for the same trivial reason: they remove a higher share '
                   'of losers than of winners. That test is easy to pass and it is '
                   'the one every filter is sold on.</p>\n'
                   '      <p>The second test is the one that decides whether you have '
                   'more money. The gross win is 100R and the gross loss is 60R, so '
                   'the profit factor is 100 &divide; 60 = 1.67, and the money only '
                   'improves while the share of winners removed divided by the share '
                   'of losers removed stays under 1 &divide; 1.67 = 0.60. The first '
                   'filter is at 20 &divide; 40 = 0.50 and passes. The second is at '
                   '30 &divide; 40 = 0.75 and fails, and it fails while its '
                   'expectancy per trade still looks better than it started.</p>\n'
                   '      <p>The exact break-even is 24 per cent of the winners: '
                   '30.4 winners and 36 losers is 30.4 &times; 2.5 &minus; 36 = 40R, '
                   'the same money on 66 trades instead of 100. Between 24 and 30 per '
                   'cent the filter is charging you trades for a better-looking '
                   'average and no more money at all.</p>\n'),
        dict(
            title='Clearing an opening auction by hand',
            setup='      <p>An opening auction. At each price, how much wants to buy '
                  'at that price or better, and how much wants to sell at that price '
                  'or better.</p>\n' + table(
                      ['Price', 'Demand at or above', 'Supply at or below'],
                      [['50.00', '5,000', '400'], ['50.10', '4,400', '900'],
                       ['50.20', '3,800', '1,600'], ['50.30', '3,200', '2,400'],
                       ['50.40', '2,800', '3,000'], ['50.50', '2,200', '3,800']]) +
                  '      <p>Two thousand of the demand is one market-on-open '
                  'buy.</p>\n',
            ask='Where does it clear, how much matches, what does the market buyer '
                'pay, and what would the same 2,000 shares have cost walking a '
                'continuous ladder made of the identical offers?',
            result='50.40, with 2,800 matched. The buyer pays $100,800. The same '
                   'shares walking the ladder cost $100,310, an average of 50.155.',
            answer='      <p>At each price the auction can match the smaller of the '
                   'two sides, and it picks the price where that is largest.</p>\n'
                   + table(['Price', 'Shares that can trade', 'Leftover'],
                           [['50.00', '400', '+4,600'], ['50.10', '900', '+3,500'],
                            ['50.20', '1,600', '+2,200'], ['50.30', '2,400', '+800'],
                            ['50.40', '2,800', '−200'],
                            ['50.50', '2,200', '−1,600']]) +
                   '      <p>2,800 is the most that can trade, so the auction clears '
                   'at 50.40 with 200 shares left unfilled on the sell side. Every '
                   'filled order gets that one price, so the market buyer pays '
                   '2,000 &times; 50.40 = $100,800.</p>\n'
                   '      <p>Now walk the identical offers as a continuous ladder. '
                   '400 rest at 50.00, another 500 at 50.10, another 700 at 50.20 and '
                   'another 800 at 50.30. The order takes 400, 500, 700 and 400, '
                   'which is $100,310, an average of 50.155.</p>\n'
                   '      <p>The auction charged 24.5 cents a share more, $490 in '
                   'total, on the same orders in the same book. It did not save the '
                   'buyer the walk. It charged him the top of the walk on every share, '
                   'because the rule solves for the marginal order rather than for '
                   'where trading has been. His 2,000 shares were 71 per cent of '
                   'everything that matched, so the marginal order was very nearly '
                   'his own.</p>\n'),
        dict(
            title='Three numbers inside one straddle',
            setup='      <p>A stock at 80.00 reports after the close. The call is '
                  '2.90 and the put is 2.70, so the straddle costs 5.60.</p>\n',
            ask='What move is being quoted, where does the long call break even, and '
                'what do the call, the put and the straddle make on a five per cent '
                'move each way?',
            result='A 7.0 per cent move. The call breaks even at 3.6 per cent, about '
                   'half. Five per cent either way pays one leg 1.10 or 1.30 and '
                   'loses the straddle 1.60.',
            answer='      <p>The straddle costs 5.60 on an 80.00 stock, so the '
                   'quoted move is 5.60 &divide; 80 = 7.0 per cent. That is the '
                   'number everyone repeats, and it is the break-even of the straddle '
                   'rather than of anything inside it.</p>\n'
                   '      <p>The call alone breaks even at 2.90 &divide; 80 = 3.6 per '
                   'cent and the put alone at 2.70 &divide; 80 = 3.4 per cent. So the '
                   'usual warning &mdash; that you have to beat the implied move '
                   '&mdash; overstates a single option&rsquo;s hurdle by nearly a '
                   'factor of two.</p>\n' + table(
                       ['Realised move', 'Long call', 'Long put', 'Long straddle'],
                       [['+5%', '+1.10', '−2.70', '−1.60'],
                        ['−5%', '−2.90', '+1.30', '−1.60']]) +
                   '      <p>A five per cent move is well past either single '
                   'option&rsquo;s break-even and still loses the straddle 1.60, '
                   'because the straddle paid for both sides and only one of them '
                   'happened.</p>\n'
                   '      <p>And read the last figure against a stop. A stop one per '
                   'cent away, into a print the market has publicly priced at seven '
                   'per cent, is a stop inside a move quoted at seven times its own '
                   'distance. That is the arithmetic behind trading the reaction '
                   'rather than the announcement.</p>\n'),
        dict(
            title='Scaling a volatility, a hedge and a book',
            setup='      <p>An instrument whose daily returns have a standard '
                  'deviation of 1.20 per cent. A hedge whose correlation with your '
                  'position is 0.60. And a book of twelve positions of the same '
                  'size.</p>\n',
            ask='What is the annualised volatility, how much of the standard '
                'deviation does the hedge leave standing, and how many independent '
                'positions is the book at an average pairwise correlation of 0.40 and '
                'of 0.15?',
            result='19.0 per cent a year. The hedge leaves 80 per cent standing. The '
                   'book is 2.22 independent positions at 0.40 and 4.53 at 0.15.',
            answer='      <p>There are 252 trading days in a year and volatility '
                   'scales with the square root of time, so 1.20 &times; &radic;252 = '
                   '1.20 &times; 15.87 = 19.0 per cent. That 15.87 is also the entire '
                   'origin of the habit of dividing a volatility index by sixteen to '
                   'get a daily figure.</p>\n'
                   '      <p>The hedge is the one most people get backwards. A hedge '
                   'removes the square of the correlation from the variance, not the '
                   'correlation from the standard deviation. At 0.60 it removes 0.36 '
                   'of the variance and leaves &radic;0.64 = 0.80, so 80 per cent of '
                   'the standard deviation is still there after a hedge most people '
                   'would describe as taking out well over half the risk.</p>\n'
                   + table(['Average pairwise correlation', 'Positions',
                            'Independent positions'],
                           [['0.40', '12', '2.22'], ['0.15', '12', '4.53']]) +
                   '      <p>The book comes from n &divide; (1 + (n &minus; 1)&rho;). '
                   'Twelve positions at 0.40 carry the risk of 2.22 of them, and '
                   'dropping the average correlation to 0.15 doubles that to 4.53. '
                   'Not one position size changed in between.</p>\n'
                   '      <p>One thing survives all of this untouched, and lesson 44 '
                   'is right to end on it: share count is inversely proportional to '
                   'volatility, exactly. Double the volatility, halve the size, and '
                   'no square root or correlation enters it.</p>\n'),
        dict(
            title='The same twenty bars, grouped three ways',
            setup='      <p>The series this course has carried since lesson 32, with '
                  'its closes. The closes are 100.7, 101.5, 100.4, 102.8, 101.5, '
                  '104.1, 102.6, 102.1, 105.3, 103.7, 106.7, 104.6, 103.0, 105.7, '
                  '102.2, 104.9, 100.8, 103.2, 99.4 and 101.6. The highs reach 106.8 '
                  'at bar 11 and the lows reach 99.2 at bar 19.</p>\n',
            ask='What is lesson 36&rsquo;s ratio on the twenty closes? Now group the '
                'bars four at a time from bar 1 and compute it again, along with the '
                'sample high and low. Then keep the width and start at bar 2 instead.',
            result='0.021 on the twenty closes, 0.176 grouped from bar 1, and 0.084 '
                   'grouped from bar 2. The sample high never moves.',
            answer='      <p>On the twenty closes the net progress is 101.6 &minus; '
                   '100.7 = 0.9 and the distance travelled is 43.1, so the ratio is '
                   '0.021. On this measurement the series barely went anywhere.</p>\n'
                   '      <p>Group the bars four at a time from bar 1 and the closes '
                   'become 102.8, 102.1, 104.6, 104.9 and 101.6 &mdash; the last '
                   'close of each group. Net progress 1.2, distance travelled 6.8, '
                   'ratio 0.176.</p>\n' + table(
                       ['How the tape is grouped', 'Ratio', 'Sample high',
                        'Sample low'],
                       [['Bar by bar', '0.021', '106.8', '99.2'],
                        ['Four at a time, from bar 1', '0.176', '106.8', '99.2'],
                        ['Four at a time, from bar 2', '0.084', '106.8', '100.2']]) +
                   '      <p>Nothing about the tape changed. The same trades printed '
                   'in the same order, and the highest and lowest prices in the sample '
                   'are identical, because a group&rsquo;s high is the highest of the '
                   'four highs inside it. What moved by a factor of eight is the '
                   'summary, and it moved because the intermediate wiggles stopped '
                   'being counted as distance travelled.</p>\n'
                   '      <p>Then the setting nobody quotes. Keep the width at four '
                   'and start one bar later, and the ratio halves to 0.084 on '
                   'identical tape. It also drops bar 1 and bars 18 to 20 out of any '
                   'complete group, which is why the sample low reads 100.2 instead '
                   'of 99.2: where the first group starts decides which bars are in '
                   'the sample at all.</p>\n'
                   '      <p>Every chart you have ever read was one of these three, '
                   'and the platform told you the width and never told you the offset.'
                   '</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can put a number on the context before you read '
          'anything into it. Handed eleven closes, you produce a regime; handed a '
          'filter, you produce both of its break-even points and notice they are not '
          'the same one; handed a book of limit orders, you produce a clearing price '
          'and the money the auction charged over the ladder; handed a straddle, you '
          'produce the move the market has quoted out loud; handed a correlation, you '
          'produce how much of the risk is genuinely still there.</p>\n'
          '      <p>Module 6 turns to the instruments people put on the chart '
          'instead, and lesson 48 opens with the fact that governs all of them: every '
          'indicator is a function of prices you already have, so none of them adds '
          'information. The only questions worth asking are what it discards, how '
          'long it takes to discard it, and whether it quietly rewrites its own '
          'history.</p>\n',
),


# ---------------------------------------------------------------- module 6
dict(
    mod=6, tier='intermediate', slug='module-6-quiz',
    slots=[48, 49, 50, 51, 52],
    title='Module 6 Quiz: Indicators, Honestly',
    desc='Six computations from the indicator module. Reorder a window and watch '
         'five statistics refuse to move, price four weight lists, solve an '
         'oscillator for its own level, separate a drawn record from a knowable '
         'one, and count how much of a hold rate is really a tolerance.',
    intro='This module took the lines off the chart and reduced each of them to '
          'arithmetic: an indicator is a function of prices you already hold, so '
          'what it discards is countable, how late it is falls out of its weight '
          'list, the level it is read against can be solved for, and whether it '
          'used bars that had not printed can be tested in a minute. Six questions, '
          'all arithmetic. The last one hands back the twenty bars that close this '
          'module&rsquo;s own series and asks four instruments what they see in '
          'them, which is four answers about the same twenty numbers.',
    covers='Lessons 48 to 52, and the last twenty of the sixty closes this course '
           'has carried since lesson 34.',
    related=[(48, 'the weight list the second question prices'),
             (49, 'the displacement the fourth question signs'),
             (50, 'the tolerance the fifth question moves'),
             (51, 'the level the third question solves for'),
             (52, 'the base rate every column has to clear')],
    questions=[
        dict(
            title='One window, three orderings',
            setup='      <p>Ten closes, in this order: 101.0, 102.4, 100.6, 102.9, '
                  '101.3, 103.5, 102.1, 104.2, 102.8 and 103.6.</p>\n'
                  '      <p>Compute eight things about them. The average. The sample '
                  'standard deviation, dividing by nine. The band two standard '
                  'deviations either side of the average. The highest and the lowest. '
                  'The net change, last less first. Lesson 36&rsquo;s efficiency '
                  'ratio, which is the absolute net change divided by the sum of the '
                  'absolute changes between consecutive closes. And a simple '
                  'oscillator over the nine changes inside the window: a hundred '
                  'times the average rise over the average rise plus the average '
                  'fall.</p>\n'
                  '      <p>Then do all eight again on the same ten numbers read '
                  'backwards, and a third time on the same ten numbers sorted into '
                  'ascending order.</p>\n',
            ask='Which of the eight change when the ordering changes, and by how '
                'much?',
            result='Five never move. The net change goes +2.6, &minus;2.6, +3.6; the '
                   'ratio 0.173, 0.173, 1.000; the oscillator 58.67, 41.33, 100.00.',
            answer='      <p>The average is 1,024.4 &divide; 10 = 102.440. The '
                   'deviations from it, squared and summed, come to 12.784, and '
                   '12.784 &divide; 9 = 1.4204, whose square root is 1.1918. So the '
                   'band runs from 102.440 &minus; 2.384 = 100.056 to '
                   '102.440 + 2.384 = 104.824.</p>\n'
                   + '''      <table>
        <thead><tr><th>Statistic</th><th>As printed</th><th>Reversed</th><th>Sorted up</th></tr></thead>
        <tbody>
          <tr><td>Average</td><td>102.440</td><td>102.440</td><td>102.440</td></tr>
          <tr><td>Standard deviation</td><td>1.1918</td><td>1.1918</td><td>1.1918</td></tr>
          <tr><td>Two standard deviations below</td><td>100.056</td><td>100.056</td><td>100.056</td></tr>
          <tr><td>Two standard deviations above</td><td>104.824</td><td>104.824</td><td>104.824</td></tr>
          <tr><td>Highest and lowest</td><td>104.2 / 100.6</td><td>104.2 / 100.6</td><td>104.2 / 100.6</td></tr>
          <tr><td>Net change, last less first</td><td>+2.6</td><td>−2.6</td><td>+3.6</td></tr>
          <tr><td>Efficiency ratio</td><td>0.173</td><td>0.173</td><td>1.000</td></tr>
          <tr><td>Oscillator</td><td>58.67</td><td>41.33</td><td>100.00</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Five of the eight are the same number in all three '
                   'columns, and they are the five every band, channel and envelope '
                   'is built out of. Sorting ten closes into ascending order is the '
                   'most violent thing you can do to a window short of replacing the '
                   'numbers, and the average, the deviation, the band and the two '
                   'extremes do not notice. They are symmetric functions: all '
                   '3,628,800 orderings of these ten closes give each of them the '
                   'same answer.</p>\n'
                   '      <p>The three that move are the three that look at the '
                   'order. Reversing the window rearranges the same nine steps, so '
                   'the path stays 15.0 points and only the net flips sign: the ten '
                   'closes travel 15.0 to arrive 2.6 higher, which is a ratio of '
                   '0.173, and read backwards they travel 15.0 to arrive 2.6 lower, '
                   'which is the same 0.173. Sorting does something else entirely, '
                   'because a sorted window has no steps back: every one of its nine '
                   'changes is a rise, the path collapses from 15.0 to 3.6, and the '
                   'ratio is 1.000 by construction rather than by anything the market '
                   'did.</p>\n'
                   '      <p>And the oscillator has an exact relation worth carrying. '
                   'Reversing a window swaps every rise for a fall of the same size, '
                   'so the reading becomes 100 minus itself: 58.67 forwards and '
                   '41.33 backwards. Those are not two readings of anything. They are '
                   'one statement about direction, written twice.</p>\n'),
        dict(
            title='Four weight lists, priced',
            setup='      <p>Every smoothing indicator is a weighted sum of past bars, '
                  'whatever the menu calls it. Here are four, all with weights adding '
                  'to one, all reading eight bars.</p>\n'
                  '      <p>The first gives every one of the eight bars a weight of '
                  'one eighth. The second is an exponential average with a smoothing '
                  'constant of two ninths, whose weight on the bar k back is two '
                  'ninths times seven ninths to the power k. The third weights the '
                  'most recent bar 8/36, the one before it 7/36, and so on down to '
                  '1/36 on the oldest. The fourth is sold as low-lag: 0.6 on the most '
                  'recent bar, 0.6 on the one before it, nothing on the next five, '
                  'and &minus;0.2 on the eighth.</p>\n'
                  '      <p>Two numbers fall out of any weight list, and neither needs '
                  'a backtest. The average delay is the sum of each weight times how '
                  'many bars back it sits. The share of the input&rsquo;s noise that '
                  'survives, when the errors in the input are independent, is the sum '
                  'of the squared weights.</p>\n',
            ask='What is the delay and the surviving noise share of each? Which two '
                'are the same filter by both measures, what does the fast one pay, '
                'and what did the fourth buy its speed with?',
            result='3.5000 and 0.1250 for the first two, 2.3333 and 0.1574 for the '
                   'third, &minus;0.8000 and 0.7600 for the fourth.',
            answer='''      <table>
        <thead><tr><th>Filter</th><th>Mean lag, bars</th><th>Share of input variance surviving</th></tr></thead>
        <tbody>
          <tr><td>Simple average, eight bars</td><td>3.5000</td><td>0.1250</td></tr>
          <tr><td>Exponential average, smoothing constant 2/9</td><td>3.5000</td><td>0.1250</td></tr>
          <tr><td>Linearly weighted, eight bars</td><td>2.3333</td><td>0.1574</td></tr>
          <tr><td>Low-lag, with one negative weight</td><td>−0.8000</td><td>0.7600</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Take the first two together. The simple average&rsquo;s '
                   'delay is the average of 0 through 7, which is 3.5000, and its '
                   'sum of squares is eight copies of one sixty-fourth, which is '
                   '0.1250. For the exponential average the two sums have closed '
                   'forms: the delay is (1 &minus; a) &divide; a, which at a = 2/9 is '
                   '(7/9) &divide; (2/9) = 3.5000, and the sum of squares is '
                   'a &divide; (2 &minus; a) = (2/9) &divide; (16/9) = 0.1250. '
                   'Identical in both numbers. The claim that the exponential average '
                   'is the faster of the two is not true in either sense that can be '
                   'made precise.</p>\n'
                   '      <p>The linearly weighted one is genuinely faster. Its delay '
                   'is (n &minus; 1) &divide; 3 = 2.3333 bars, which is 1.1667 bars '
                   'of speed, and its sum of squares is 17/108 = 0.1574. That is 25.9 '
                   'per cent more of the input&rsquo;s noise arriving at the output. '
                   'The trade is the whole design: nothing buys delay back for '
                   'free.</p>\n'
                   '      <p>Then the fourth, and the point is not that it is bad but '
                   'that its price is printed on its own weight list. Its delay is '
                   '0 &times; 0.6 + 1 &times; 0.6 + 7 &times; (&minus;0.2) = 0.6 '
                   '&minus; 1.4 = &minus;0.8000 bars, which is a filter claiming to '
                   'sit ahead of the data it is made of. It pays 0.36 + 0.36 + 0.04 = '
                   '0.7600, six times the simple average&rsquo;s noise for eight '
                   'tenths of a bar of lean. A negative weight is what buys a delay '
                   'below what a positive-weight filter can reach, and a filter with '
                   'a negative weight amplifies rather than suppresses at some '
                   'frequencies, which on a chart is the overshoot after a fast move '
                   'when the line goes further than the price did.</p>\n'),
        dict(
            title='Solve the oscillator for its own level',
            setup='      <p>The oscillator is a hundred times the average rise over '
                  'the average rise plus the average fall, taken across the last '
                  'fourteen changes. Nothing in that sentence is a judgement except '
                  'the word average.</p>\n'
                  '      <p>Then a specific window. Fourteen changes, nine of them '
                  'rises averaging 0.80 each and five falls averaging 1.10 '
                  'each.</p>\n',
            ask='What ratio of average rise to average fall does a reading of 65 '
                'require, and of 75, and of 25? If every bar in the window moved the '
                'same distance, how many of twenty bars would have to close up to '
                'read 65? And what does the specific window above read?',
            result='1.8571, 3.0000 and 0.3333; thirteen bars of twenty; and the '
                   'window reads 56.69.',
            answer='      <p>Set the reading to R and solve. A hundred times G over '
                   'G plus L equals R exactly when G &divide; L = R &divide; '
                   '(100 &minus; R). At 65 that is 65 &divide; 35 = 1.8571. At 75 it '
                   'is 75 &divide; 25 = 3.0000. At 25 it is 25 &divide; 75 = '
                   '0.3333.</p>\n'
                   + '''      <table>
        <thead><tr><th>Reading</th><th>Average rise over average fall</th><th>Up bars in twenty, at equal sizes</th></tr></thead>
        <tbody>
          <tr><td>25</td><td>0.3333</td><td>5</td></tr>
          <tr><td>65</td><td>1.8571</td><td>13</td></tr>
          <tr><td>75</td><td>3.0000</td><td>15</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Now put a size on the moves. If every rise and every '
                   'fall in the window is the same distance, the averages reduce to '
                   'counts and the reading becomes a hundred times the share of bars '
                   'that closed up. So a reading of 65 is 65 per cent of the bars up, '
                   'and on twenty bars that is thirteen. Not a spike, not an extreme, '
                   'not a market that has run too far: thirteen bars up and seven '
                   'down.</p>\n'
                   '      <p>The specific window is the reason the shortcut has to be '
                   'stated with its condition attached. Nine rises at 0.80 total 7.20 '
                   'and five falls at 1.10 total 5.50, so the reading is 100 &times; '
                   '7.20 &divide; 12.70 = 56.69. Nine up bars in fourteen is 64.3 per '
                   'cent of the bars, and the reading comes in nearly eight points '
                   'below that, because the falls are 37.5 per cent bigger than the '
                   'rises. Counting bars and reading the oscillator are the same '
                   'thing only when the bars are the same size, and they never '
                   'are.</p>\n'
                   '      <p>One consequence for the level you were handed. Eleven '
                   'rises and three falls at those same two sizes reads 100 &times; '
                   '8.80 &divide; 12.10 = 72.73, so on this window it takes eleven up '
                   'bars in fourteen to print an overbought reading. Which is a '
                   'description of an ordinary advance, arriving after it has '
                   'happened.</p>\n'),
        dict(
            title='The record as drawn and the record as knowable',
            setup='      <p>Twenty-four closes: 100.0, 101.4, 100.6, 102.2, 101.0, '
                  '100.2, 100.9, 99.7, 100.8, 102.1, 103.4, 102.5, 101.8, 103.0, '
                  '104.2, 103.6, 102.9, 103.2, 103.5, 104.4, 105.6, 106.8, 106.1 and '
                  '105.4.</p>\n'
                  '      <p>A bar is a pivot low if its close is below the closes of '
                  'the two bars before it and below the closes of the two bars after '
                  'it, and a pivot high if it is above all four. Buy at each pivot '
                  'low, sell at the next pivot high.</p>\n'
                  '      <p>The drawn version does what a finished chart does: it '
                  'enters and exits at the pivot bar&rsquo;s own close. The knowable '
                  'version enters and exits two bars later, at that bar&rsquo;s '
                  'close, which is the first moment the pivot could be identified '
                  'without consulting bars that had not printed.</p>\n',
            ask='How many bars carry a low marker at some point and how many keep it? '
                'What do the round trips total in each version, and how many of them '
                'win? And does the difference between the two totals account for '
                'itself?',
            result='Four markers, three survive. +10.00 with three winners as drawn, '
                   '+0.30 with one as knowable, and the 9.70 gap is exactly the '
                   'displacement at the six entries and exits.',
            answer='      <p>Take the flicker first. A bar becomes a candidate as '
                   'soon as it is below the two closes before it, and a provisional '
                   'marker appears on it the moment one later bar closes higher. Bars '
                   '6, 8, 13 and 17 all reach that state. Bar 6 loses it: its close '
                   'of 100.2 is undercut by bar 8 at 99.7 before the second '
                   'confirming bar arrives, so the marker vanishes. The other three '
                   'survive to become pivot lows at 99.7, 101.8 and 102.9. One '
                   'marker in four on this series is not there afterwards, and the '
                   'rule leaves every signal provisional for exactly one bar beyond '
                   'its first appearance, because it looks two ahead.</p>\n'
                   '      <p>The pivot highs are bars 4, 11, 15 and 22, at 102.2, '
                   '103.4, 104.2 and 106.8. Pairing each low with the next high gives '
                   'three round trips.</p>\n'
                   + '''      <table>
        <thead><tr><th>Entry bar</th><th>Exit bar</th><th>As drawn</th><th>As knowable</th></tr></thead>
        <tbody>
          <tr><td>8</td><td>11</td><td>+3.70</td><td>−0.30</td></tr>
          <tr><td>13</td><td>15</td><td>+2.40</td><td>−1.30</td></tr>
          <tr><td>17</td><td>22</td><td>+3.90</td><td>+1.90</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>As drawn the strategy makes 10.00 points on three trades '
                   'and wins all three. As knowable it makes 0.30 on the same three '
                   'trades and wins one. Nothing about the rule changed and nothing '
                   'about the series changed; the only difference is when the signal '
                   'was allowed to be known.</p>\n'
                   '      <p>Now the reconciliation, which is the part that shows the '
                   'gap is not noise. A pivot low is a bar the next two closes are '
                   'above, so the price two bars later is above it necessarily, and '
                   'the entry displacement cannot have the other sign. Here those '
                   'three are 2.4, 2.4 and 0.6, totalling 5.40. A pivot high is a bar '
                   'the next two closes are below, so selling it in hindsight sells '
                   'above what was available, and those three are 1.6, 1.3 and 1.4, '
                   'totalling 4.30. Together 9.70, which is the whole difference '
                   'between 10.00 and 0.30, with nothing left over.</p>\n'
                   '      <p>And the tell is not the win rate. Measure how far each '
                   'trade goes against its entry in the first two bars: on the drawn '
                   'entries that figure is exactly zero all three times, because a '
                   'pivot low is the lowest close in its neighbourhood and there is '
                   'nothing below it to trade to. On the knowable entries one of the '
                   'three goes 0.60 against you. A record with no adverse excursion '
                   'anywhere in it has usually not found a way to avoid pain. It has '
                   'usually chosen its entries from the far side of the '
                   'outcome.</p>\n'),
        dict(
            title='How near counts as near',
            setup='      <p>Twenty closes and their five-bar simple average, drawn at '
                  'the bar each window ends on.</p>\n'
                  + '''      <table>
        <thead><tr><th>Bar</th><th>Close</th><th>Five-bar average</th></tr></thead>
        <tbody>
          <tr><td>5</td><td>101.5</td><td>101.04</td></tr>
          <tr><td>6</td><td>102.7</td><td>101.58</td></tr>
          <tr><td>7</td><td>102.0</td><td>101.86</td></tr>
          <tr><td>8</td><td>101.4</td><td>101.76</td></tr>
          <tr><td>9</td><td>102.3</td><td>101.98</td></tr>
          <tr><td>10</td><td>103.6</td><td>102.40</td></tr>
          <tr><td>11</td><td>102.9</td><td>102.44</td></tr>
          <tr><td>12</td><td>103.2</td><td>102.68</td></tr>
          <tr><td>13</td><td>102.4</td><td>102.88</td></tr>
          <tr><td>14</td><td>103.8</td><td>103.18</td></tr>
          <tr><td>15</td><td>104.5</td><td>103.36</td></tr>
          <tr><td>16</td><td>103.9</td><td>103.56</td></tr>
          <tr><td>17</td><td>104.2</td><td>103.76</td></tr>
          <tr><td>18</td><td>103.1</td><td>103.90</td></tr>
          <tr><td>19</td><td>103.7</td><td>103.88</td></tr>
          <tr><td>20</td><td>104.9</td><td>103.96</td></tr>
        </tbody>
      </table>
      <p>The first four closes, which the average needs and the table does not test, are 100.0, 100.6, 101.9 and 101.2.</p>
''' +
                  '      <p>An approach is a close within some stated distance of the '
                  'average at that same bar. It held if the close two bars later is '
                  'further from the line, on the side the close approached from. Bars '
                  '19 and 20 have no close two bars later, so the fourteen bars from '
                  '5 to 18 are the whole of the evidence.</p>\n',
            ask='How many approaches are there at a tolerance of 0.2, 0.4, 0.7 and '
                '1.0, and what share of each held? And on the same fourteen bars, '
                'what share of bars that closed up or down continued in that '
                'direction two bars later?',
            result='1, 4, 10 and 11 approaches, holding 100, 50, 50 and 45 per cent, '
                   'against a base rate of 43.',
            answer='''      <table>
        <thead><tr><th>An approach means within</th><th>Approaches</th><th>Continued away</th><th>Share</th></tr></thead>
        <tbody>
          <tr><td>0.2 points</td><td>1</td><td>1</td><td>100%</td></tr>
          <tr><td>0.4 points</td><td>4</td><td>2</td><td>50%</td></tr>
          <tr><td>0.7 points</td><td>10</td><td>5</td><td>50%</td></tr>
          <tr><td>1.0 points</td><td>11</td><td>5</td><td>45%</td></tr>
          <tr><td>No level at all: every bar with a direction</td><td>14</td><td>6</td><td>43%</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The first column is the whole of the difference between '
                   'the rows. The bars are the same bars, the average is the same '
                   'average, and the series did not change while the table was being '
                   'computed. Widen the tolerance from two tenths of a point to one '
                   'point and the same twenty closes go from one approach to eleven, '
                   'which is an eleven-fold change in how much evidence you appear to '
                   'have.</p>\n'
                   '      <p>The share column is the part to be careful with. At two '
                   'tenths the line held every approach it got, which sounds like a '
                   'perfect record and is one observation. At four tenths and at '
                   'seven tenths it holds half of them. At one point it holds 45 per '
                   'cent. The column moves between 100 and 45 without pattern, which '
                   'is what a column of small samples looks like rather than a '
                   'finding about the line.</p>\n'
                   '      <p>Then the number that decides whether any of it means '
                   'anything. On the same fourteen bars, a bar that has just closed '
                   'up closes higher again two bars later, or a bar that has just '
                   'closed down closes lower, on 6 of the 14, which is 43 per cent, '
                   'with no line drawn and nothing to touch. That is the price of '
                   'admission. The widest reading clears it by two points on eleven '
                   'observations, which is not a gap anybody can act on, and lesson '
                   '50 priced telling a 50 per cent hold rate apart from a 43 per '
                   'cent one at hundreds of approaches in each condition.</p>\n'),
        dict(
            title='The same twenty bars, asked four times',
            setup='      <p>The closes of bars 41 to 60 of the series this course has '
                  'carried since lesson 34: 101.7, 102.1, 103.1, 104.4, 104.8, 105.6, '
                  '106.6, 106.1, 106.7, 105.9, 106.7, 105.9, 106.9, 106.6, 105.8, '
                  '107.1, 106.8, 106.0, 107.0 and 106.5.</p>\n'
                  '      <p>Four instruments, all of them functions of exactly these '
                  'numbers. Lesson 36&rsquo;s efficiency ratio over all twenty. The '
                  'ten-bar simple average at bar 50 and at bar 60, and which side of '
                  'it the close sits on. The oscillator over the last fourteen '
                  'changes, and how many of those fourteen bars closed up. And the '
                  'side of the ten-bar average the close takes at every one of bars '
                  '50 to 60.</p>\n',
            ask='What does each of the four say, and how many times does the last one '
                'change its mind before and after you require two closes on the same '
                'side?',
            result='0.3333; 104.70 and 106.53, above then below; 54.29 on six up '
                   'bars in fourteen; and six declared sides collapsing to one.',
            answer='      <p>The ratio first. The twenty closes travel 14.4 points '
                   'step by step and arrive 4.8 higher than they started, so the '
                   'ratio is 4.8 &divide; 14.4 = 0.3333 exactly. A third of the '
                   'walking ended up as progress.</p>\n'
                   '      <p>The average next. Bars 41 to 50 sum to 1,047.0, so the '
                   'ten-bar average at bar 50 is 104.70 and the close of 105.9 sits '
                   '1.20 above it. Bars 51 to 60 sum to 1,065.3, so at bar 60 the '
                   'average is 106.53 and the close of 106.5 sits 0.03 below it. Two '
                   'readings ten bars apart, and the second one is on the other side '
                   'of the line by three hundredths of a point.</p>\n'
                   '      <p>The oscillator third, and it is the one that catches '
                   'people. Six of the last fourteen bars closed up and eight closed '
                   'down, so 43 per cent of the bars went the reader&rsquo;s way. The '
                   'reading is 54.29, which is above the middle. The rises total 5.70 '
                   'and the falls 4.80, and the oscillator weighs the sizes rather '
                   'than counting the bars, so a minority of larger rises outvotes a '
                   'majority of smaller falls. The shortcut from the third question '
                   'holds only when the bars are the same size, and here they are '
                   'not.</p>\n'
                   + '''      <table>
        <thead><tr><th>Instrument</th><th>Reading</th><th>What it is a function of</th></tr></thead>
        <tbody>
          <tr><td>Efficiency ratio, twenty bars</td><td>0.3333</td><td>All twenty closes</td></tr>
          <tr><td>Ten-bar average at bar 50</td><td>104.70</td><td>Bars 41 to 50</td></tr>
          <tr><td>Ten-bar average at bar 60</td><td>106.53</td><td>Bars 51 to 60</td></tr>
          <tr><td>Oscillator at bar 60</td><td>54.29</td><td>The last fourteen changes</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Then the sides, which is where the description stops '
                   'being a signal. Across bars 50 to 60 the close changes which side '
                   'of its own average it is on five times, so the line declares six '
                   'sides in eleven bars, with a median run of one bar. Ask for two '
                   'consecutive closes on the same side before declaring anything and '
                   'the six become one: above, from bar 51, and nothing else ever '
                   'qualifies. The cost is exactly one more bar of lateness at every '
                   'turn, on top of the 4.50 the ten-bar average already carries by '
                   'the second question&rsquo;s arithmetic.</p>\n'
                   '      <p>Four instruments and one series. They do not disagree '
                   'about anything, because they cannot: every one of them is a '
                   'function of the same twenty numbers, and applying a function '
                   'cannot add what the numbers did not contain. What the four differ '
                   'in is which part of those twenty numbers each of them throws '
                   'away.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can price a line instead of believing it. Handed a '
          'window, you produce the statistics that cannot see its ordering and the '
          'ones that can; handed a weight list, you produce a delay and a noise '
          'share without touching a backtest; handed a level, you solve it for the '
          'balance of bars it actually asks for; handed a record, you separate what '
          'was drawn from what was knowable and reconcile the difference to the '
          'point; handed a hold rate, you ask what tolerance produced it and what '
          'the tape does with no line drawn at all.</p>\n'
          '      <p>Module 7 leaves the chart entirely. Lesson 53 starts from the '
          'other side of your own fills and prices what the person taking them is '
          'doing: a spread that just breaks even is twice the chance the next order '
          'knows something, multiplied by how much it knows, which turns a quoted '
          'penny into a statement about how many informed orders the quoter is '
          'expecting.</p>\n',
),


# ---------------------------------------------------------------- module 7
dict(
    mod=7, tier='advanced', slug='module-7-quiz',
    slots=[53, 54, 55, 56, 57, 58, 59, 60, 61],
    title='Module 7 Quiz: The Other Side',
    desc='Seven computations from the counterparty module. Solve a spread for '
         'what it believes, price the routing decision you never see, find the '
         'delay at which speed starts to matter, balance a schedule against its '
         'own impact, take the derivative of a hedge, and add the row every '
         'stop-hunting table leaves out.',
    intro='This module turned round and looked at the people taking the other '
          'side of your fills, and found every one of them under an obligation '
          'rather than an opinion: a quoter who must cover adverse selection, a '
          'router steered by a published fee, a firm whose quote is an option it '
          'has written, a desk that owns a schedule rather than an order, and a '
          'dealer whose trading is the derivative of a hedge. Seven questions, all '
          'arithmetic. The last one takes the single 300-share round trip this '
          'module has been adding charges to since lesson 53 and finishes '
          'counting it.',
    covers='Lessons 53 to 61, and the 300-share penny-wide round trip that lesson '
           '53 priced at $3.00 and lesson 54 raised to $4.80.',
    related=[(53, 'the equation the first question inverts'),
             (54, 'the fee schedule the second question reads'),
             (55, 'the threshold the third question computes'),
             (57, 'the schedule the fourth question costs'),
             (59, 'the impact the fourth and last questions estimate'),
             (60, 'the hedge whose derivative the fifth question takes'),
             (61, 'the row the sixth question puts back')],
    questions=[
        dict(
            title='What a spread would have to believe',
            setup='      <p>Lesson 53&rsquo;s zero-profit condition says a '
                  'break-even spread is twice the share of arriving orders that '
                  'are informed, multiplied by how far the price moves once what '
                  'they know is public: s = 2aD. Turned round, a = s &divide; '
                  '(2D).</p>\n'
                  '      <p>Four spreads you can find on any screen: two cents, '
                  'four cents, twenty cents and a dollar. Three sizes of informed '
                  'edge: fifty cents, two dollars and eight dollars.</p>\n',
            ask='For each of the twelve pairs, what share of arriving orders would '
                'have to be informed for that spread to break even? Which cell '
                'refuses to answer, and what is it telling you?',
            result='From 1 in 800 at the top to 1 in 4 at the bottom, and the '
                   'dollar spread against a fifty-cent edge returns every order, '
                   'which is not a number about information at all.',
            answer='''      <table>
        <thead><tr><th>Quoted spread</th><th>Edge of 0.50</th><th>Edge of 2.00</th><th>Edge of 8.00</th></tr></thead>
        <tbody>
          <tr><td>$0.02</td><td>1 in 50</td><td>1 in 200</td><td>1 in 800</td></tr>
          <tr><td>$0.04</td><td>1 in 25</td><td>1 in 100</td><td>1 in 400</td></tr>
          <tr><td>$0.20</td><td>1 in 5</td><td>1 in 20</td><td>1 in 80</td></tr>
          <tr><td>$1.00</td><td>every order</td><td>1 in 4</td><td>1 in 16</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Every cell is one division. Two cents against an eight-'
                   'dollar edge is 0.02 &divide; 16 = 0.00125, which is one order in '
                   'eight hundred. That is not a claim about how many clever people '
                   'are in the market; it is what the quote implies if the quoter is '
                   'breaking even, and it is why two cents is quotable against an '
                   'earnings-sized move at all. The whole business is a very small '
                   'edge earned very often against a very large loss taken very '
                   'rarely.</p>\n'
                   '      <p>Now the cell that refuses. A dollar spread against a '
                   'fifty-cent edge gives a = 1.00 &divide; 1.00 = 1, meaning every '
                   'single arriving order would have to be informed, which cannot be '
                   'true of any market that trades at all. The model has been handed '
                   'a spread it cannot explain, and the honest reading is not that '
                   'the quoter is greedy. It is that adverse selection is not what '
                   'most of that spread is paying for.</p>\n'
                   '      <p>Which is the useful thing the formula does. It gives '
                   'the most of a spread that information could possibly account '
                   'for, and whatever is left over belongs to inventory risk and to '
                   'fixed cost &mdash; the split lesson 5 said existed and could not '
                   'measure. A wide spread in a thin name is mostly the price of '
                   'being stuck with it.</p>\n'
                   '      <p>One caution the table carries in its own headings. '
                   'Every figure is an implication of an assumed edge, not an '
                   'observation of one. Move along a row and the implied share of '
                   'informed orders changes by a factor of sixteen without a single '
                   'quote changing. The table asks what a spread would have to '
                   'believe. It does not find out what it does believe.</p>\n'),
        dict(
            title='The decision you never see and never pay for',
            setup='      <p>A 500-share order. Taking liquidity is capped by rule '
                  'at three tenths of a cent a share; assume the maker-taker venue '
                  'sits at the cap and rebates 0.0022 to the resting side, and that '
                  'an inverted venue pays 0.0020 to take and charges 0.0028 to '
                  'rest. A wholesaler filling the order internally involves no '
                  'exchange and no exchange fee.</p>\n'
                  '      <p>Then the same 500 shares as an ordinary round trip: in '
                  'and out with marketable orders, on an instrument quoted a penny '
                  'wide, and again on one quoted two cents wide.</p>\n',
            ask='What does each of the five outcomes pay or cost on 500 shares, and '
                'how far apart are the best and the worst? What does the round trip '
                'cost once the access fee is added at each spread, and at what '
                'spread does the fee stop adding more than a fifth?',
            result='A swing of $2.60 on one side of one trade; $8.00 and $13.00 for '
                   'the round trips; and the fee adds a fifth at a three-cent '
                   'spread.',
            answer='''      <table>
        <thead><tr><th>Where the order ends up</th><th>Per share</th><th>On 500 shares</th></tr></thead>
        <tbody>
          <tr><td>Maker-taker venue, order crosses</td><td>−0.0030</td><td>−$1.50</td></tr>
          <tr><td>Maker-taker venue, order rests and is hit</td><td>+0.0022</td><td>+$1.10</td></tr>
          <tr><td>Inverted venue, order crosses</td><td>+0.0020</td><td>+$1.00</td></tr>
          <tr><td>Inverted venue, order rests and is hit</td><td>−0.0028</td><td>−$1.40</td></tr>
          <tr><td>Internalised by a wholesaler</td><td>0.0000</td><td>$0.00</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The top and the bottom of that column are 0.0052 apart, '
                   'which is $2.60 on 500 shares, on one side of one trade. Notice '
                   'which two rows are furthest apart. It is not a fast row against '
                   'a slow row, because no such distinction appears anywhere in the '
                   'table. It is the crossing row against the resting row, and then '
                   'the venue type on top of that, and a fee schedule published '
                   'months in advance settled all of it.</p>\n'
                   '      <p>Then the round trip. A penny spread means half a cent a '
                   'share crossed, which is $2.50 a side and $5.00 for the round '
                   'trip; the access fee at the cap is $1.50 a side and $3.00 for '
                   'the round trip, so the true bill is $8.00 and the fee has added '
                   '60 per cent. At two cents the spread cost doubles to $10.00 '
                   'while the fee stays at $3.00, so the same fee adds 30 per '
                   'cent.</p>\n'
                   '      <p>That gives the crossover directly, because the fee is '
                   'fixed per share and the spread is not. The fee adds a fifth when '
                   '0.0030 is a fifth of the half-spread, which puts the half-spread '
                   'at 1.5 cents and the spread at three cents. At six cents it adds '
                   'a tenth. So this is a penny-and-two-cent-instrument problem, and '
                   'a reader who trades wider things has just found out that lesson '
                   '54 is not about them.</p>\n'
                   '      <p>And the reason the schedule decides rather than you: on '
                   'a commission-free account you neither pay the take fee nor '
                   'receive the make rebate. The whole first table is somebody '
                   'else&rsquo;s profit and loss, which is exactly why it cannot '
                   'move your behaviour and can move your broker&rsquo;s '
                   'completely.</p>\n'),
        dict(
            title='The delay at which speed starts to matter',
            setup='      <p>A resting quote is an option written by whoever posted '
                  'it, and its life is the time between the world changing and the '
                  'cancellation landing. So the value of a delay is the value of an '
                  'option with that life, which lesson 44 already taught you to '
                  'compute: annual volatility divided by the square root of 252 '
                  'gives a day, divided by the square root of 23,400 gives a '
                  'second, and multiplied by the square root of the delay gives the '
                  'rest.</p>\n'
                  '      <p>Three instruments. One at $250 with 20 per cent annual '
                  'volatility quoted a penny wide. The same instrument quoted five '
                  'cents wide. And a small company at $12 with 55 per cent annual '
                  'volatility quoted twenty-five cents wide.</p>\n',
            ask='What does each move in a second, and at what delay does a typical '
                'move reach the half-spread?',
            result='2.060 cents and 0.272 cents a second; and thresholds of 58.9 '
                   'milliseconds, 1.47 seconds and 35.2 minutes.',
            answer='      <p>The first instrument moves 250 &times; 0.20 &divide; '
                   '15.87 = $3.1506 in a day, and $3.1506 &divide; the square root '
                   'of 23,400 = $0.0206 in a second. Setting that equal to the '
                   'half-cent half-spread and solving for the delay gives '
                   '(0.005 &divide; 0.0206) squared = 0.0589 seconds, or 58.9 '
                   'milliseconds. The third instrument moves 12 &times; 0.55 '
                   '&divide; 15.87 = $0.4159 a day, which is 0.272 cents a second, '
                   'and against a 12.5-cent half-spread that is 2,114 seconds.</p>\n'
                   + '''      <table>
        <thead><tr><th>Instrument</th><th>Move in one second</th><th>Delay at which it equals the half-spread</th></tr></thead>
        <tbody>
          <tr><td>$250, 20 per cent, penny spread</td><td>2.060 cents</td><td>58.9 milliseconds</td></tr>
          <tr><td>$250, 20 per cent, five cents wide</td><td>2.060 cents</td><td>1.47 seconds</td></tr>
          <tr><td>$12, 55 per cent, twenty-five cents wide</td><td>0.272 cents</td><td>35.2 minutes</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Read the first two rows against each other. Nothing '
                   'about the instrument changed except the quoted spread, and the '
                   'threshold moved by a factor of twenty-five, because the '
                   'threshold goes as the square of the half-spread. Then read the '
                   'third row: on a twelve-dollar company quoted a quarter wide, a '
                   'typical move reaches the half-spread after thirty-five minutes. '
                   'Nobody needs to be fast there and nobody is, because the entire '
                   'quoting problem is inventory rather than latency.</p>\n'
                   '      <p>Now place the participants on that scale. A retail '
                   'order leaving a home connection takes somewhere between 50 and '
                   '200 milliseconds; a machine in the same building as the matching '
                   'engine measures its round trip in tens of microseconds. On the '
                   'first row the threshold sits between those two, which is the '
                   'only row where the race is a race. On the third it sits eleven '
                   'thousand times past the slowest participant, and the whole '
                   'question stops being about speed.</p>\n'
                   '      <p>What none of this says is that being faster wins more. '
                   'The most that can be taken from a stale quote is the amount by '
                   'which it is stale, and a quote standing for a few hundred '
                   'microseconds is stale by hundredths of a cent. Speed buys a '
                   'larger share of a fixed number of small prizes, not a larger '
                   'prize.</p>\n'),
        dict(
            title='The clock, and where the two costs are equal',
            setup='      <p>A desk has 400,000 shares to buy of a $60 stock that '
                  'trades 2,000,000 shares a day at 35 per cent annual volatility '
                  'and is quoted three cents wide. Lesson 57&rsquo;s convention is '
                  'to run at ten per cent of the day&rsquo;s volume.</p>\n'
                  '      <p>Two costs work against each other. The timing exposure '
                  'is the daily standard deviation times the square root of the '
                  'sessions used. The impact, by lesson 59&rsquo;s square-root law, '
                  'is that same daily standard deviation times the square root of '
                  'the order&rsquo;s days of volume divided by the sessions used. '
                  'Add a willingness number for how much certain cost you will pay '
                  'to shed a dollar of exposure, and the sum has one minimum.</p>\n',
            ask='How many sessions does the convention take, and what is the '
                'typical move over that span? Where is the minimum at a dollar of '
                'certain cost for a dollar of risk, what participation does it ask '
                'for, and what is true of the two terms there? And what willingness '
                'does the ten-per-cent convention imply?',
            result='Two sessions and $1.8714, against an optimum at 0.4472 sessions '
                   'and 44.7 per cent participation where both terms are $0.8849; '
                   'and the convention implies a willingness of 0.2236.',
            answer='      <p>The order is 400,000 &divide; 2,000,000 = 0.20 days of '
                   'volume, and at ten per cent participation the sessions are the '
                   'days of volume divided by the rate, which is 2.00. The daily '
                   'standard deviation is 60 &times; 0.35 &divide; 15.87 = $1.3233, '
                   'so the typical move over two sessions is $1.3233 times the '
                   'square root of two, which is $1.8714, or 3.12 per cent of the '
                   'price. Set that against the 1.5-cent half-spread and it is 125 '
                   'times larger. At this size the spread is a rounding error and '
                   'the clock is the bill.</p>\n'
                   '      <p>Now the minimum. Differentiating the sum gives an '
                   'optimum of the square root of the days of volume divided by the '
                   'willingness, which at a dollar for a dollar is the square root '
                   'of 0.20, or 0.4472 sessions. The participation that asks for is '
                   'the days of volume divided by the sessions, which is 44.7 per '
                   'cent &mdash; four and a half times the convention.</p>\n'
                   + '''      <table>
        <thead><tr><th>Schedule</th><th>Sessions</th><th>Impact a share</th><th>Exposure a share</th><th>Sum</th></tr></thead>
        <tbody>
          <tr><td>Ten per cent participation</td><td>2.0000</td><td>$0.4184</td><td>$1.8714</td><td>$2.2898</td></tr>
          <tr><td>The optimum at a dollar for a dollar</td><td>0.4472</td><td>$0.8849</td><td>$0.8849</td><td>$1.7698</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Look at the two middle columns in the second row. The '
                   'impact and the exposure are equal, at $0.8849 each, and that is '
                   'not a property of these particular numbers. Whatever the '
                   'volatility, whatever the volume, whatever the willingness, the '
                   'schedule that minimises the sum is the one where the impact you '
                   'pay equals the risk-weighted exposure you carry. You do not need '
                   'either constant to use it: estimate both terms for the schedule '
                   'you are running and the larger one says which way to move.</p>\n'
                   '      <p>Notice also what the optimum does not contain. The '
                   'volatility cancels and so does the price. The order enters only '
                   'through its ratio to the day&rsquo;s volume, which is the same '
                   'quantity the schedule reduced to in the first place.</p>\n'
                   '      <p>Then run it backwards. Two sessions is the optimum when '
                   'the square root of 0.20 divided by the willingness equals 2.00, '
                   'which puts the willingness at 0.2236. The convention is optimal '
                   'for a desk that values a dollar of timing risk at twenty-two '
                   'cents, and weighting the raw $1.8714 exposure by that figure '
                   'gives $0.4184, which is exactly the impact in the same row. The '
                   'convention is not the model&rsquo;s answer. It is a choice, and '
                   'anybody presenting ten per cent as the output of an optimisation '
                   'is presenting a preference as a calculation.</p>\n'),
        dict(
            title='A hedge is a position and its trading is the derivative',
            setup='      <p>A dealer has sold options and holds shares against '
                  'them. The hedge is a function of the price, so it cannot change '
                  'until the price has. Here is the hedge, in shares, at ten '
                  'successive rebalances: 440,000, 310,000, 520,000, 380,000, '
                  '660,000, 450,000, 720,000, 540,000, 830,000 and '
                  '1,000,000.</p>\n'
                  '      <p>Then the rate at which it changes. On the same book, a '
                  'one-dollar move obliges 46,000 shares of rehedging with twenty '
                  'bars to expiry, 94,000 with five, and 212,000 with one. The '
                  'underlying trades 8,000,000 shares a day at 1.5 per cent daily '
                  'volatility and sits at 103.</p>\n',
            ask='How many shares did holding the hedge trade, how large did the '
                'position ever get, and how far did it end from where it started? '
                'And what impact does each of the three rehedges cause, as a share '
                'of the move that caused it?',
            result='1,880,000 traded against a largest position of 1,000,000 and a '
                   'net change of 560,000; and impacts of 11.7, 16.7 and 25.2 per '
                   'cent of the move.',
            answer='      <p>The nine differences are 130,000, 210,000, 140,000, '
                   '280,000, 210,000, 270,000, 180,000, 290,000 and 170,000, which '
                   'total 1,880,000 shares. The largest position the hedge ever '
                   'holds is 1,000,000, and the net change from first reading to '
                   'last is 560,000. So the trading was 1.88 times the largest '
                   'position and 3.36 times the net change.</p>\n'
                   '      <p>That ratio answers every headline of the form: dealers '
                   'have eleven billion dollars of hedges to unwind. Eleven billion '
                   'is a position. What reaches the market is its derivative, and a '
                   'hedge that does not move trades nothing at all.</p>\n'
                   + '''      <table>
        <thead><tr><th>Bars to expiry</th><th>Shares rehedged by a $1 move</th><th>Impact</th><th>Share of the move</th></tr></thead>
        <tbody>
          <tr><td>20</td><td>46,000</td><td>0.1137%</td><td>11.7%</td></tr>
          <tr><td>5</td><td>94,000</td><td>0.1626%</td><td>16.7%</td></tr>
          <tr><td>1</td><td>212,000</td><td>0.2442%</td><td>25.2%</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Now the second half. A dollar on a 103 instrument is a '
                   '0.97 per cent move. Lesson 59&rsquo;s law puts the impact of '
                   'rehedging at the daily volatility times the square root of the '
                   'shares over the day&rsquo;s volume, so 212,000 shares against '
                   '8,000,000 gives 0.015 times the square root of 0.0265, which is '
                   '0.2442 per cent &mdash; a quarter of the move that caused '
                   'it.</p>\n'
                   '      <p>Read the column downwards and the honest statement is a '
                   'range with an input in it: hedging flow adds something between a '
                   'ninth and a quarter of a move here, and the figure moves with '
                   'the volume, the distance to expiry and the distance from the '
                   'strike. It does not create the move. It cannot, because it '
                   'arrives afterwards.</p>\n'
                   '      <p>And one thing the arithmetic cannot supply. Reverse the '
                   'sign &mdash; a dealer long the options rather than short &mdash; '
                   'and the same 212,000 shares damp the move instead of amplifying '
                   'it, because rehedging a long position sells into strength. Open '
                   'interest counts contracts, not sides, so a strike showing a '
                   'large number tells you the last hour will be busy near it and '
                   'tells you nothing whatever about the direction.</p>\n'),
        dict(
            title='The row every stop-hunting table leaves out',
            setup='      <p>You are long at 240 with support at 239. The tight stop '
                  'goes at 237, just under the level; the wide stop goes at 234, a '
                  'volatility buffer below it. Three things can happen. The level '
                  'holds and the price rallies to 246. Or the price runs to 236 and '
                  'is reclaimed, then rallies to 246. Or the level genuinely breaks '
                  'and the price goes to 232.</p>\n'
                  '      <p>Then a count on your own instrument: 24 approaches, of '
                  'which 18 held, 6 ran through the level, and 5 of those 6 were '
                  'reclaimed.</p>\n',
            ask='Take both stops at 200 shares and use only the second and third '
                'states: at what run-and-reclaim rate are they equal? Now size them '
                'to the same risk and ask again. Then put the first state back and '
                'find the condition in full. And what does the count say?',
            result='0.25 unsized on two states, zero when they are sized to the same '
                   'risk, and p greater than q over 2 once the third state is there '
                   '&mdash; which the count fails, 0.208 against 0.375.',
            answer='      <p>Start where the literature starts. At 200 shares each, '
                   'the tight stop loses $600 in both of the two states drawn, '
                   'because 236 is below 237 either way. The wide stop makes 200 '
                   '&times; 6 = $1,200 if the run is reclaimed and loses 200 &times; '
                   '6 = $1,200 if it breaks. Setting &minus;600 equal to 2,400p '
                   '&minus; 1,200 gives p = 0.25, and that is the familiar '
                   'answer.</p>\n'
                   '      <p>It is also an artefact of the sizing. The tight stop '
                   'risks $600 and the wide one risks $1,200, so they are not the '
                   'same bet. Lesson 9 says to compare them at the same risk, which '
                   'puts the wide stop at 100 shares. Its payoffs halve to +$600 and '
                   '&minus;$600, and it now beats the tight stop at any run-and-'
                   'reclaim rate above zero at all. The tight stop&rsquo;s '
                   'expectation contains no p, because it loses $600 in both '
                   'columns, which makes it a refusal to bet rather than a cheaper '
                   'bet.</p>\n'
                   '      <p>Which proves too much, and that is the tell. A rule '
                   'that is right whatever the world does has usually been asked the '
                   'wrong question, and the wrong question is that the table has two '
                   'columns.</p>\n'
                   + '''      <table>
        <thead><tr><th>Outcome</th><th>Tight stop, 200 shares</th><th>Wide stop, 100 shares</th></tr></thead>
        <tbody>
          <tr><td>Level holds</td><td>+$1,200</td><td>+$600</td></tr>
          <tr><td>Run, then reclaimed</td><td>−$600</td><td>+$600</td></tr>
          <tr><td>Real breakdown</td><td>−$600</td><td>−$600</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The missing state is the one where nothing happens: the '
                   'price approaches, the level holds, no run occurs, and the rally '
                   'arrives with neither stop touched. There the tight stop is long '
                   '200 shares into a six-point rally and makes $1,200 while the '
                   'wide stop is long 100 and makes $600. It is the state in which '
                   'being tight pays, and it is left out of the literature because '
                   'the literature is about being hunted.</p>\n'
                   '      <p>Write q for a clean hold and p for a run and reclaim. '
                   'The tight stop is worth 1,800q &minus; 600 and the wide one '
                   '1,200q + 1,200p &minus; 600. Subtract, and the difference is '
                   '1,200p &minus; 600q, so the wide stop wins when p is greater '
                   'than q over 2. Not a quarter, not zero, but half the probability '
                   'that the level simply holds &mdash; and both terms are countable '
                   'on your own instrument.</p>\n'
                   '      <p>So count them. Eighteen holds in 24 approaches is q = '
                   '0.750, and five reclaimed runs is p = 0.208. The threshold is '
                   '0.375 and p does not reach it, so on these counts the tight stop '
                   'is the better of the two. Notice which term decided it. Not the '
                   'run-and-reclaim rate the whole argument fixates on, but the hold '
                   'rate, which the argument never mentions.</p>\n'),
        dict(
            title='One order, priced by every lesson in the module',
            setup='      <p>The trade this module has been adding charges to. Three '
                  'hundred shares of a $100 stock quoted a penny wide, in and out '
                  'with marketable orders. The stock trades 2,000,000 shares a day '
                  'and its daily standard deviation is 1.5 per cent. The access fee '
                  'sits at the Rule 610 cap of three tenths of a cent.</p>\n'
                  '      <p>Then the same trade at a hundred times the size: 30,000 '
                  'shares, which is 1.5 per cent of the day&rsquo;s volume.</p>\n'
                  '      <p>Price the impact of the entry alone, because lesson 59 '
                  'says part of the exit&rsquo;s impact reverts and this page has no '
                  'way to split it.</p>\n',
            ask='What does each trade cost in spread and access fee, what does the '
                'square-root law estimate for the impact, and at what order size do '
                'the two meet?',
            result='$4.80 against $5.51 at 300 shares and $480 against $5,511 at '
                   '30,000; the crossover is 228 shares at a coefficient of one and '
                   '910 at a half.',
            answer='      <p>The two charges with published numbers are the ones '
                   'lessons 53 and 54 counted. Half a cent a share crossed, twice, '
                   'is a cent a share, or $3.00 on 300; the access fee at the cap, '
                   'twice, is 0.006 a share, or $1.80. Both scale exactly with size, '
                   'so at 30,000 shares they are $300.00 and $180.00.</p>\n'
                   '      <p>The impact does not scale that way, and that is the '
                   'whole of the result. The law puts the fractional move at the '
                   'daily volatility times the square root of the order over the '
                   'day&rsquo;s volume, so 300 shares against 2,000,000 gives 0.015 '
                   'times the square root of 0.00015, which is 0.0184 per cent. On a '
                   '$100 stock that is 1.84 cents a share, or $5.51. At 30,000 '
                   'shares the fraction is ten times larger and the shares are a '
                   'hundred times more numerous, so the dollar cost is a thousand '
                   'times larger: $5,511.</p>\n'
                   + '''      <table>
        <thead><tr><th>Charge</th><th>300 shares</th><th>30,000 shares</th></tr></thead>
        <tbody>
          <tr><td>Spread, both crossings</td><td>$3.00</td><td>$300.00</td></tr>
          <tr><td>Access fee at the cap, both crossings</td><td>$1.80</td><td>$180.00</td></tr>
          <tr><td>Subtotal, the two charges with published numbers</td><td>$4.80</td><td>$480.00</td></tr>
          <tr><td>Estimated impact of the entry alone</td><td>$5.51</td><td>$5,511.35</td></tr>
          <tr><td>Impact as a multiple of the subtotal</td><td>1.15</td><td>11.48</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Set the two per-share figures equal and the crossover '
                   'falls out. The spread and the fee come to 1.6 cents a share for '
                   'the round trip; the impact is 100 &times; 0.015 times the square '
                   'root of the order over 2,000,000. They meet at 228 shares, which '
                   'is below the trade in the left-hand column. On the numbers as '
                   'written, this order is already past the point where the law says '
                   'impact is the larger charge.</p>\n'
                   '      <p>Which is exactly where lesson 59&rsquo;s concession has '
                   'to be taken seriously rather than skipped. The law carries a '
                   'coefficient that published calibrations put anywhere between a '
                   'half and one and a half, and the crossover moves as the inverse '
                   'square of it: at a coefficient of a half the two charges meet at '
                   '910 shares instead of 228. So the answer to whether impact is '
                   'your largest charge depends on a constant nobody publishes, and '
                   'a reader who takes the 228 as a fact has taken the wrong thing '
                   'from the arithmetic. What is not in doubt is the shape: the '
                   'first two charges are linear in size and the third goes as size '
                   'to the power of one and a half, so there is a crossover, and '
                   'above it the two charges this module could price stop being the '
                   'bill.</p>\n'
                   '      <p>And when the fill prints, lesson 56 has the last word '
                   'on what anyone else can read from it. The tape carries the '
                   'price, the size and whether it happened away from an exchange. '
                   'The one field it never carries is the side. Every charge on this '
                   'page was paid by somebody whose direction the print does not '
                   'record.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can read the other side as a set of obligations '
          'with numbers attached. Handed a spread, you invert it and find what it '
          'would have to believe, and notice when it refuses to answer; handed a '
          'fee schedule, you price a decision that is made about you and paid for '
          'by somebody else; handed a price and a volatility, you find the delay '
          'at which speed is a factor and the instruments where it is not; handed '
          'an order too large for a day, you balance the clock against the impact '
          'and find the two equal at the bottom; handed a hedge, you take its '
          'derivative; and handed a payoff table, you check whether a state is '
          'missing from it before you solve it.</p>\n'
          '      <p>Module 8 turns all of it inward. Lesson 62 takes one ordinary '
          'observation and judges it twice: six wins in nine trades beats a coin '
          'and gets adopted, and the same six in nine against a base rate of 54.24 '
          'per cent settles nothing whatever. The difference is not the data. It '
          'is what the observation was compared against, and naming that in '
          'advance is what turns a noticing into a hypothesis.</p>\n',
),


# ---------------------------------------------------------------- module 8
dict(
    mod=8, tier='advanced', slug='module-8-quiz',
    slots=[62, 63, 64, 65, 66, 67, 68, 69, 70],
    title='Module 8 Quiz: Building a System',
    desc='Eight computations from the system-building module. Turn a count into '
         'an interval, subtract a backtest four times, price a search from its '
         'configuration count, price the act of looking, split a return into '
         'three parts, draw two lines on an equity curve, size at four ninths of '
         'capacity, and find the accuracy a filter has to beat.',
    intro='This module built one sheet, one column at a time: a sentence that can '
          'be refused, a backtest set against what the same search finds in '
          'nothing, a bar computed from a configuration count, a horizon fixed '
          'before the first trade, an exposure share, a stopping depth, a '
          'capacity, and a position cap. Eight questions, all arithmetic. The '
          'last one takes the rule this module has followed since lesson 63 and '
          'fills in the three columns lesson 70 left blank, which turn out to '
          'fill themselves from the rule&rsquo;s own numbers.',
    covers='Lessons 62 to 70, and the eight-column sheet the module has been '
           'filling in since lesson 62.',
    related=[(62, 'the four-part sentence the first question writes'),
             (63, 'the four subtractions the second question performs'),
             (64, 'the configuration count the third question prices'),
             (65, 'the horizon the fourth question fixes'),
             (66, 'the exposure share the fifth question needs'),
             (67, 'the two lines the sixth question draws'),
             (68, 'the four ninths the seventh question sizes at'),
             (70, 'the inequality the eighth question solves')],
    questions=[
        dict(
            title='A count, an interval, and the counts that could have decided',
            setup='      <p>A series of eighty closes. The seventy-nine moves that '
                  'join them are 44 up and 35 down, so the baseline &mdash; what '
                  'happens with no condition attached at all &mdash; is 0.557.</p>\n'
                  '      <p>Define a condition and an outcome. After one down '
                  'close, the next close finishes higher on 11 of 16 occurrences. '
                  'Sharpen it to two consecutive down closes and it is 7 of 10. '
                  'Sharpen it again to three and it is 3 of 4.</p>\n'
                  '      <p>The intervals are the ones lesson 19 computes, at 95 '
                  'per cent.</p>\n',
            ask='Which of the three rates clears the baseline? On sixteen '
                'occurrences, which counts could have cleared it at all, and what '
                'was the chance of landing on one if the effect were real at ten '
                'points? And how many occurrences would a ten-point lift need?',
            result='None of the three. Only 13, 14, 15 and 16 of 16 could have '
                   'cleared it, the chance of reaching one was 0.147, and a '
                   'ten-point lift needs 99 occurrences.',
            answer='''      <table>
        <thead><tr><th>Condition</th><th>Occurrences</th><th>Next close up</th><th>Rate</th><th>Interval low</th><th>Interval high</th></tr></thead>
        <tbody>
          <tr><td>One down close</td><td>16</td><td>11</td><td>0.688</td><td>0.444</td><td>0.858</td></tr>
          <tr><td>Two down closes</td><td>10</td><td>7</td><td>0.700</td><td>0.397</td><td>0.892</td></tr>
          <tr><td>Three down closes</td><td>4</td><td>3</td><td>0.750</td><td>0.301</td><td>0.954</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Read the rate column and the idea is holding up: '
                   '0.688, then 0.700, then 0.750, and every one of them is above '
                   'the baseline. Read the two interval columns and the evidence is '
                   'evaporating. The interval is 0.414 wide on sixteen occurrences, '
                   '0.495 wide on ten, and 0.654 wide on four, so by the last row it '
                   'covers two thirds of everything a probability is allowed to be. '
                   'All three contain 0.557. Sharpening the condition felt like '
                   'precision and bought nothing, because the rate barely moved and '
                   'the sample fell from 16 to 4.</p>\n'
                   '      <p>Now the harder question, which is what the sixteen '
                   'could ever have said. Walk the counts and take the interval&rsquo;s '
                   'lower end each time: 11 of 16 has a low of 0.444, 12 has 0.505, '
                   'and 13 has 0.570. So 13 is the first count whose interval clears '
                   '0.557, and only 13, 14, 15 and 16 could have cleared it. Of the '
                   'seventeen counts the afternoon could have produced, four were '
                   'capable of telling you anything.</p>\n'
                   '      <p>Then price that. If the effect were real at the full '
                   'ten points, the true rate would be 0.657, and the chance of '
                   'sixteen occurrences landing on 13 or more is 0.147, or about one '
                   'in seven. The test had a one-in-seven chance of detecting the '
                   'thing it was built to detect, and any of 9 through 12 would have '
                   'been called a confirmation by somebody not computing the '
                   'interval.</p>\n'
                   + '''      <table>
        <thead><tr><th>Lift over the baseline</th><th>Occurrences needed</th></tr></thead>
        <tbody>
          <tr><td>0.05</td><td>395</td></tr>
          <tr><td>0.10</td><td>99</td></tr>
          <tr><td>0.15</td><td>44</td></tr>
          <tr><td>0.20</td><td>25</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The sample the lift needs is four times the '
                   'baseline&rsquo;s variance over the square of the lift: 4 &times; '
                   '0.557 &times; 0.443 &divide; 0.01 = 98.7, so 99 occurrences. At '
                   'the rate the condition fires here, one down close in every five, '
                   'that is 495 bars. The idea formed in twenty minutes needs two '
                   'years to be refused.</p>\n'),
        dict(
            title='The same result, subtracted four times',
            setup='      <p>A rule is picked as the best of a grid and makes 14.60 '
                  'a share gross on 9 trades. A round trip costs 0.1230 a share. '
                  'Buying at the first close and selling at the last makes 7.40 net '
                  'over the same window. One bar&rsquo;s standard deviation on the '
                  'series is 1.5443.</p>\n'
                  '      <p>Then the fourth subtraction. Shuffle the bar-to-bar '
                  'moves so that the drift and the volatility survive and no time '
                  'structure does, rerun the identical grid, and 61 per cent of '
                  'those structureless series produce a best cell that beats '
                  'holding by at least what this one did.</p>\n',
            ask='What is the rule worth after each of the four subtractions, what '
                'do the costs come to in R, and what is the verdict?',
            result='13.49 net, 6.09 over the benchmark, and a search of the same '
                   'width finds that or more in nothing 61 per cent of the time. '
                   'Nothing has been established.',
            answer='''      <table>
        <thead><tr><th>Stage</th><th>What the rule is worth</th></tr></thead>
        <tbody>
          <tr><td>Gross</td><td>14.60</td></tr>
          <tr><td>Net of costs</td><td>13.49</td></tr>
          <tr><td>Over the benchmark</td><td>6.09</td></tr>
          <tr><td>Against a search of the same width on nothing</td><td>beaten 61 per cent of the time</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The first subtraction is the only certain one. Nine '
                   'round trips at 0.1230 come to 1.11, so the gross of 14.60 nets '
                   '13.49. In R that is 0.1230 &divide; 1.5443 = 0.0796 of an R a '
                   'round trip, so the rule pays 0.717R in costs while holding pays '
                   'one round trip, 0.0796R. The frequent rule starts seven tenths '
                   'of an R behind before either of them is right about '
                   'anything.</p>\n'
                   '      <p>The second is the one almost always missing. The rule '
                   'made 13.49 and holding made 7.40, so the rule&rsquo;s '
                   'contribution is 6.09, not 13.49. A series that rose hands its '
                   'rise to anything that spends time long, whether or not the rule '
                   'understood a thing. A backtest that prints its own equity curve '
                   'and never the benchmark&rsquo;s has hidden the larger of the two '
                   'numbers.</p>\n'
                   '      <p>The third changes the verdict rather than the size. '
                   'Sixty-one per cent of series with nothing in them produce a best '
                   'cell that beats holding by 6.09 or more. The measured result is '
                   'not merely unimpressive against that distribution; it sits below '
                   'its median. The number 6.09 was produced by a procedure that '
                   'produces numbers like 6.09 anyway, so it cannot be used as '
                   'evidence about the market.</p>\n'
                   '      <p>Notice what that does not say. It does not say the rule '
                   'is bad and it does not say the series has nothing in it. It is a '
                   'statement about the measurement. And notice what a backtest '
                   'still does: a rule that loses in-sample, before costs, is dead, '
                   'and finding that out in an afternoon is most of what the '
                   'technique is for. What it cannot do alone is promote one.</p>\n'),
        dict(
            title='What a search costs before it has seen a price',
            setup='      <p>Suppose every configuration you are about to test is '
                  'worthless, in the exact sense that its true edge is zero. Each '
                  'still returns a t-statistic, because a finite record of trades is '
                  'a sample and samples wobble, and a search keeps the largest '
                  'wobble it found.</p>\n'
                  '      <p>The expected largest of N standard normal draws has a '
                  'closed form: (1 &minus; &gamma;) times the normal value at 1 '
                  '&minus; 1/N, plus &gamma; times the normal value at 1 &minus; '
                  '1/(Ne), with &gamma; = 0.5772156649. The bar that only five '
                  'worthless searches in a hundred would clear is the normal value '
                  'of 0.95 raised to the power 1/N, one-sided, because a rule that '
                  'loses is not a discovery.</p>\n',
            ask='For 20, 500, 2,500 and 30,000 configurations, what is the expected '
                'best t, what is the bar, and how much edge per trade does the '
                'search manufacture over 200 trades? And what does the shape of the '
                'first column say?',
            result='Bars of 2.799, 3.713, 4.102 and 4.644, manufacturing 0.134, '
                   '0.216, 0.248 and 0.291 of an R a trade; and the penalty grows '
                   'with the logarithm of the count.',
            answer='      <p>One substitution in full, so nothing has to be taken on '
                   'trust. At 2,500 configurations, 1 divided by N is 0.0004000, and '
                   'the standard normal value leaving that much in the upper tail is '
                   '3.35279. Then N times e is 6,796, 1 divided by that is 0.0001472, '
                   'and its normal value is 3.62026. Weighting the two by 0.4228 and '
                   '0.5772 gives 3.50718. That is a t-statistic; divide by the square '
                   'root of 200, which is 14.14, and the manufactured edge is 0.248 '
                   'of an R a trade. No market entered that calculation at any '
                   'point.</p>\n'
                   + '''      <table>
        <thead><tr><th>Configurations</th><th>Expected best t</th><th>Bar at five per cent</th><th>R a trade, 200 trades</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>0.000</td><td>1.645</td><td>0.000</td></tr>
          <tr><td>20</td><td>1.901</td><td>2.799</td><td>0.134</td></tr>
          <tr><td>500</td><td>3.053</td><td>3.713</td><td>0.216</td></tr>
          <tr><td>2,500</td><td>3.507</td><td>4.102</td><td>0.248</td></tr>
          <tr><td>30,000</td><td>4.121</td><td>4.644</td><td>0.291</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Read the first column and the shape is the useful part. '
                   'Going from one configuration to 500 raises the bar from 1.645 to '
                   '3.713, which is most of the damage. Going from 500 to 30,000 is '
                   'sixty times as much searching and raises it by 0.931 more. The '
                   'penalty grows with the logarithm of the count, so a modest search '
                   'is expensive and an enormous one is barely worse than a large '
                   'one.</p>\n'
                   '      <p>Which cuts the way nobody mentions. You do not need a '
                   'grid of thirty thousand to be badly exposed: twenty '
                   'configurations already put the bar at 2.799, which is 70 per cent '
                   'above where a single test sits, and twenty is a morning of trying '
                   'things.</p>\n'
                   '      <p>And the count is knowable in advance, which is the '
                   'entire point of the arithmetic. It costs one integer written down '
                   'before the search rather than remembered after it, and the reason '
                   'it is so rarely there is that it can only ever make a result look '
                   'worse.</p>\n'),
        dict(
            title='What it costs to be allowed to look',
            setup='      <p>A live record cannot be searched, so its configuration '
                  'count is one and its bar is 1.645. Clearing that bar with an edge '
                  'of d in R a trade takes 1.645 divided by d, all squared, because '
                  'the t-statistic is d times the square root of the trade '
                  'count.</p>\n'
                  '      <p>Then the thing that undoes it. A record judged once, at '
                  'a fixed trade count, passes a dead system 5 per cent of the time, '
                  'which is what the bar was chosen for. A record judged after every '
                  'trade, and stopped the first time it clears, passes a dead system '
                  '24.25 per cent of the time. Restoring five per cent under that '
                  'watching takes a threshold of 2.569.</p>\n',
            ask='How many trades does each edge need, and how many months at thirty '
                'trades a month? What does the peeking threshold do to the trade '
                'count, and what kind of number is 2.569?',
            result='1,083, 271, 121 and 44 trades; peeking multiplies the count by '
                   '2.44; and 2.569 is the bar for eleven configurations.',
            answer='''      <table>
        <thead><tr><th>Edge, R a trade</th><th>Trades to clear 1.645</th><th>Months at thirty a month</th></tr></thead>
        <tbody>
          <tr><td>0.05</td><td>1,083</td><td>36.1</td></tr>
          <tr><td>0.10</td><td>271</td><td>9.0</td></tr>
          <tr><td>0.15</td><td>121</td><td>4.0</td></tr>
          <tr><td>0.25</td><td>44</td><td>1.4</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Read the first two rows and the shape of the problem is '
                   'visible. Halving the edge you will accept quadruples the wait, '
                   'because the bar is fixed and only the square root of the count '
                   'grows to meet it. The edges people actually find, once costs and '
                   'the benchmark have been subtracted, live in the top half of that '
                   'table, and the top half is measured in years.</p>\n'
                   '      <p>Now the peeking. Trades needed scale as the square of '
                   'the bar, so raising it from 1.645 to 2.569 multiplies the count '
                   'by (2.569 &divide; 1.645) squared, which is 2.44. The 271 trades '
                   'a tenth of an R needed become 661, and nine months become '
                   'twenty-two.</p>\n'
                   '      <p>And 2.569 is not a new kind of number. It is exactly '
                   'the bar the third question&rsquo;s formula gives for eleven '
                   'configurations. Watching one live record as it accumulates is '
                   'worth searching eleven, because a record you are allowed to stop '
                   'is a search over stopping times, and it can be priced the same '
                   'way.</p>\n'
                   '      <p>So the column this puts on the sheet is the shortest '
                   'one: the number of trades the test will run for, written down '
                   'before the first trade. It costs one integer and an act of '
                   'self-restraint, and committing to it in advance is the only '
                   'version that can cost you anything.</p>\n'),
        dict(
            title='The three parts of one return',
            setup='      <p>A rule takes 8 trades over a fifty-nine-move window and '
                  'makes 12.40 a share gross. A round trip costs 0.1230. Buying at '
                  'the first close and selling at the last makes 6.20 gross and 6.08 '
                  'net.</p>\n'
                  '      <p>And the number a backtest report almost never carries: '
                  'walk the rule bar by bar and it actually held a position over 24 '
                  'of the 59 bars.</p>\n',
            ask='What are the three components of the return, do they sum, and what '
                'share of the net was the market under each of the two benchmarks?',
            result='2.52 of market, 9.88 of selection and 0.98 of costs, summing to '
                   '11.42; and the market is 22.1 per cent of the net at the '
                   'rule&rsquo;s own exposure and 53.2 per cent fully invested.',
            answer='      <p>The exposure share is 24 &divide; 59 = 0.4068. The rule '
                   'was in the market two fifths of the time and flat for the rest, '
                   'so it was not a competitor to buying and holding. It was a '
                   'two-fifths-sized position in the same instrument, taken at chosen '
                   'moments, and charging it for the whole of the market&rsquo;s move '
                   'charges it for a return it could not have collected.</p>\n'
                   '      <p>That gives three parts that can be computed rather than '
                   'argued about. The market part is the exposure times the move: '
                   '0.4068 &times; 6.20 = 2.52. The selection part is whatever is '
                   'left of the gross: 12.40 &minus; 2.52 = 9.88, and it is the '
                   'return that came from being long at those particular bars rather '
                   'than at an average selection of bars. The cost part is 8 round '
                   'trips at 0.1230, which is 0.98, and it is the only one of the '
                   'three that is certain.</p>\n'
                   + '''      <table>
        <thead><tr><th>Component</th><th>Dollars a share</th><th>Share of the net</th></tr></thead>
        <tbody>
          <tr><td>Market: exposure of 0.4068 times a move of 6.20</td><td>+2.52</td><td>0.221</td></tr>
          <tr><td>Selection: being long at those bars rather than at any bars</td><td>+9.88</td><td>0.865</td></tr>
          <tr><td>Costs: 8 round trips at 0.1230</td><td>−0.98</td><td>−0.086</td></tr>
          <tr><td>Net</td><td>+11.42</td><td>1.000</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>They sum to the net exactly, which is the only property '
                   'a decomposition has to have and is worth checking every time, '
                   'because an attribution whose parts do not sum has a fourth part '
                   'in it that somebody has not named.</p>\n'
                   '      <p>Now the two benchmarks against each other. Charge the '
                   'rule the fully invested 6.08 and the market supplied 53.2 per '
                   'cent of its net; charge it the market at its own exposure and the '
                   'market supplied 22.1 per cent. Neither is a mistake. They are '
                   'answers to two different questions, and the sentence &ldquo;most '
                   'of the return was the market&rdquo; is true under one and false '
                   'under the other. The exposure share is what decides which '
                   'sentence you are entitled to, and it takes one pass over the '
                   'position history.</p>\n'),
        dict(
            title='The depth that is not evidence, and the lines that are',
            setup='      <p>Being some number of R down is the moment almost every '
                  'system gets switched off, so price the moment. Over a fixed run, '
                  'a system with no edge at all reaches a depth of eight R on 87.2 '
                  'per cent of runs and one with a genuine tenth of an R reaches it '
                  'on 59.5 per cent. At twelve R those figures are 58.5 and 22.6; at '
                  'twenty R they are 18.2 and 2.3.</p>\n'
                  '      <p>Then the test that does accumulate. Wald&rsquo;s '
                  'sequential test keeps a running number and adds d x &minus; '
                  'd&sup2;/2 after each trade with outcome x, declaring the system '
                  'alive at +2.9444 and dead at &minus;2.9444. On the running total '
                  'in R the two boundaries are the total equal to n times d over '
                  'two, minus and plus 2.9444 divided by d.</p>\n',
            ask='What does each depth multiply the odds of the system being dead by? '
                'How many trades does Wald take at each edge, and where do the two '
                'lines sit at 200 trades on an edge of 0.15?',
            result='Ratios of 1.47, 2.59 and 7.78; verdicts in 2,356, 589, 262 and '
                   '95 trades; and lines at &minus;4.6R and +34.6R while a live edge '
                   'expects +30.0R.',
            answer='      <p>The ratio is one division. At eight R it is 87.2 '
                   '&divide; 59.5 = 1.47, at twelve R it is 58.5 &divide; 22.6 = '
                   '2.59, and at twenty R it is 18.2 &divide; 2.3 = 7.78. A ratio of '
                   '1.47 means that being eight R down multiplies whatever odds you '
                   'already held on the system being dead by 1.47 and by no more '
                   'than that. It is evidence, faintly, and it is the strongest thing '
                   'a reader has in the moment they usually act.</p>\n'
                   '      <p>The depth that would settle something is twenty R, at '
                   'which the ratio finally reaches 7.78 &mdash; and twenty R arrives '
                   'to two live systems in a hundred and to eighteen dead ones, so '
                   'waiting for it means most of your genuinely dead systems never '
                   'trip it either. Depth fails as evidence because depth is bounded '
                   'and evidence is not.</p>\n'
                   + '''      <table>
        <thead><tr><th>Edge you are testing for</th><th>Step per trade</th><th>Trades to a verdict</th><th>Months at thirty a month</th></tr></thead>
        <tbody>
          <tr><td>0.05</td><td>0.00125</td><td>2,356</td><td>78.5</td></tr>
          <tr><td>0.10</td><td>0.00500</td><td>589</td><td>19.6</td></tr>
          <tr><td>0.15</td><td>0.01125</td><td>262</td><td>8.7</td></tr>
          <tr><td>0.25</td><td>0.03125</td><td>95</td><td>3.1</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Wald&rsquo;s trade count is one division. A live '
                   'system&rsquo;s average step is d times d minus d&sup2;/2, which '
                   'is d&sup2;/2, and it has 2.9444 to travel: at an edge of 0.10 the '
                   'step is 0.005 and the verdict takes 589 trades. At 0.05 it takes '
                   'four times as long, because the step goes as the square of the '
                   'edge.</p>\n'
                   '      <p>Then draw the lines where a trader can see them. At an '
                   'edge of 0.15 over 200 trades, the dead line sits at 200 &times; '
                   '0.075 &minus; 2.9444 &divide; 0.15 = &minus;4.6R and the alive '
                   'line at +34.6R, while a live edge expects to have made +30.0R. '
                   'Both are worth a second read. The test will not call the system '
                   'alive at +30.0R, which is exactly what a real edge was supposed '
                   'to deliver. And the dead line reaches zero at 2 &times; 2.9444 '
                   '&divide; 0.15&sup2; = 262 trades, so until then a system that has '
                   'made you nothing at all has not yet failed.</p>\n'),
        dict(
            title='Four ninths, and the orders that finish the account',
            setup='      <p>An instrument turns over 90 million dollars a day at a '
                  'daily standard deviation of 2.12 per cent. A rule has a round-trip '
                  'edge of thirty basis points in it. Lesson 59&rsquo;s law says the '
                  'fraction the price moves against you on one crossing is the daily '
                  'volatility times the square root of your order over the '
                  'day&rsquo;s volume, and a round trip pays it twice.</p>\n'
                  '      <p>Then a separate machine. An account risks 1.5 per cent of '
                  'itself a trade, so one R is 1.5 per cent of the account. A loop '
                  'polls a condition that stays true and adds one R of exposure every '
                  'time it looks.</p>\n',
            ask='What is the capacity, what is the best single position and what does '
                'it earn, what does the round trip cost there as a share of the edge, '
                'and how many people sizing correctly does the trade support? And how '
                'many orders take the whole account?',
            result='450,561 dollars of capacity, a best position of 200,249 earning '
                   '200.25 a trade at two thirds of the edge spent, 2.25 people, and '
                   '67 orders.',
            answer='      <p>Capacity is where the round trip costs the whole edge, '
                   'so twice the volatility times the square root of the '
                   'participation equals 0.0030, which puts the participation at '
                   '(0.0030 &divide; 0.0424) squared = 0.005006 and the capacity at '
                   '90,000,000 &times; 0.005006 = 450,561 dollars.</p>\n'
                   + '''      <table>
        <thead><tr><th>Position, as a share of capacity</th><th>Dollars</th><th>Round trip, basis points</th><th>Edge kept</th><th>Dollars a trade</th></tr></thead>
        <tbody>
          <tr><td>A tenth</td><td>45,056</td><td>9.49</td><td>20.51</td><td>92.42</td></tr>
          <tr><td>A quarter</td><td>112,640</td><td>15.00</td><td>15.00</td><td>168.96</td></tr>
          <tr><td>Four ninths</td><td>200,249</td><td>20.00</td><td>10.00</td><td>200.25</td></tr>
          <tr><td>Three fifths</td><td>270,336</td><td>23.24</td><td>6.76</td><td>182.80</td></tr>
          <tr><td>Four fifths</td><td>360,449</td><td>26.83</td><td>3.17</td><td>114.16</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>Read the fourth row against the third. Three fifths of '
                   'capacity is 35 per cent more money on the table and it comes back '
                   'with less. The fifth row is worse still: 80 per cent more money '
                   'returns 57 per cent as much. There is a point past which putting '
                   'more on takes money off, and it arrives long before the edge runs '
                   'out.</p>\n'
                   '      <p>Where it arrives is a pure number. Differentiate size '
                   'times what survives of the edge, set to zero, and the square root '
                   'of the best participation is the edge over three times the '
                   'volatility, where capacity had a two. Square both and divide, and '
                   'the best position is four ninths of capacity &mdash; in every '
                   'instrument, at every edge, at every volatility. Put four ninths '
                   'back into the impact and the second identity falls out: the round '
                   'trip at the best size costs exactly two thirds of the edge, and '
                   'you keep one third. Two thirds of your edge is the price of '
                   'collecting the other third.</p>\n'
                   '      <p>And the crowd follows from the same two numbers. If '
                   'everybody in the trade sizes at four ninths of capacity, the '
                   'trade holds nine quarters of them: 2.25 people, in this '
                   'instrument and in any other, because the ratio of two pure '
                   'numbers cannot know what instrument it is in. The third person to '
                   'size correctly takes it below breakeven for all three.</p>\n'
                   '      <p>Then the loop, which is a different kind of ceiling '
                   'entirely. The number of orders that puts the whole account at '
                   'risk is one divided by the risk per trade: at 1.5 per cent that '
                   'is 67, and at half a per cent it is 200. Sizing smaller does buy '
                   'time against your own code, and it buys it in the least useful '
                   'currency there is, because what runs out first is not your money '
                   'but your attention. What acts in time is a check that reads the '
                   'position before sending, not one that reads a profit-and-loss '
                   'figure afterwards.</p>\n'),
        dict(
            title='The filter, and the sheet spent',
            setup='      <p>A record of 12 trades: 8 winners averaging 0.90R and 4 '
                  'losers averaging 0.55R. A filter does not create trades, it '
                  'removes them, so the honest comparison is total profit over the '
                  'same original opportunities. Let it keep a share s of the winners '
                  'and correctly reject a share t of the losers; it is worth having '
                  'when (1 &minus; p) t is at least p (1 &minus; s) b.</p>\n'
                  '      <p>Then the sheet. Lesson 70 spent all eight columns on the '
                  'rule this module has followed since lesson 63 &mdash; 7 trades, '
                  '9.84 a share net, an average trade of 0.9101R &mdash; and left '
                  'three of them blank.</p>\n',
            ask='What is the profit factor, what accuracy must an equally good filter '
                'beat, and what is the most a perfect one could add? Then fill in the '
                'three blank columns from the rule&rsquo;s own average trade, and say '
                'what they show.',
            result='A profit factor of 3.27, a threshold of 76.6 per cent, and a '
                   'ceiling of 44.0 per cent; and the rule&rsquo;s own edge implies a '
                   'four-trade horizon and a verdict at trade 7.11.',
            answer='      <p>Gross profit is 8 &times; 0.90 = 7.20R and gross loss is '
                   '4 &times; 0.55 = 2.20R, so the net is 5.00R and the profit factor '
                   'is 3.2727. Check it the other way: p is 0.6667 and b is 0.90 '
                   '&divide; 0.55 = 1.6364, and p b over 1 &minus; p is 3.2727 '
                   'again.</p>\n'
                   '      <p>Divide the inequality by 1 &minus; p and the right-hand '
                   'side becomes the profit factor, so a filter equally good in both '
                   'directions needs an accuracy of at least the profit factor over '
                   'one more than it: 3.2727 &divide; 4.2727 = 0.766. Turned round, a '
                   'filter of accuracy a earns its place on any strategy whose profit '
                   'factor is below a over 1 &minus; a: 1.22 at 55 per cent accuracy, '
                   '1.50 at 60, 1.86 at 65. And divide the inequality the other way '
                   'and it says something you can test on a trade log with two '
                   'counts: the losers the filter drops must outnumber the winners it '
                   'drops by at least 1.64, your payoff ratio.</p>\n'
                   '      <p>Then the ceiling, which is the number that ends most of '
                   'these projects. A perfect filter removes every loser and keeps '
                   'every winner, so the most it can add is the whole gross loss, '
                   'which as a share of what the strategy already nets is one over '
                   'the profit factor minus one: 1 &divide; 2.2727 = 44.0 per cent. '
                   'Not 44 per cent if the model is good. Forty-four per cent if it '
                   'is flawless.</p>\n'
                   '      <p>Now the three blanks, and they fill themselves from one '
                   'number. The rule&rsquo;s average trade is 0.9101R.</p>\n'
                   + '''      <table>
        <thead><tr><th>Column</th><th>What it now says</th></tr></thead>
        <tbody>
          <tr><td>The trades fixed in advance, from lesson 65</td><td>4</td></tr>
          <tr><td>The quit depth, from lesson 67</td><td>the dead line reaches zero at trade 7.11</td></tr>
          <tr><td>The position cap, from lesson 69</td><td>618,020 dollars, checked before every order</td></tr>
        </tbody>
      </table>
''' +
                   '      <p>The horizon is (1.645 &divide; 0.9101) squared = 3.27, '
                   'so four trades. Wald&rsquo;s step is 0.9101&sup2; &divide; 2 = '
                   '0.4141 and the verdict arrives after 2.9444 &divide; 0.4141 = '
                   '7.11 trades, which is also where the dead line crosses zero. The '
                   'position cap is four ninths of the capacity the sheet already '
                   'carries.</p>\n'
                   '      <p>Read the first two against the record. If the '
                   'rule&rsquo;s edge were real at 0.9101R, four trades would have '
                   'settled it and seven would have produced a verdict. It took '
                   'seven. The horizon and the sample are the same number, and that '
                   'is what a sample not fixed in advance looks like from the inside: '
                   'the test finished exactly when the data ran out, which is not '
                   'evidence about the rule but a description of the '
                   'afternoon.</p>\n'
                   '      <p>And the filter column closes the loop. That rule&rsquo;s '
                   'seven trades have a profit factor of 24.26, so a filter would '
                   'need 96.0 per cent accuracy and a perfect one could add 4.3 per '
                   'cent. There is one loser in the record and it is worth 0.423 out '
                   'of 9.839. A filter can only give you back your losers, and a '
                   'strategy that looks this good has almost none.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can hold an idea to the four things a sentence has '
          'to carry and then keep subtracting. Handed a count, you produce an '
          'interval and the counts that could ever have decided; handed a '
          'backtest, you subtract costs, then the benchmark, then what the same '
          'search finds in nothing; handed a grid, you price it before it sees a '
          'price; handed a live record, you fix its length before the first trade '
          'and refuse to read it early; handed a return, you split it three ways '
          'and check that the parts sum; handed a drawdown, you compute what it '
          'multiplies the odds by and find the answer is 1.47; handed an edge, you '
          'size at four ninths of what it can hold; and handed a model, you divide '
          'gross profit by gross loss before you build anything.</p>\n'
          '      <p>Module 9 takes the finished system and puts it next to the '
          'others. Lesson 71 opens with the arithmetic that makes that necessary: '
          'positions that look separate are one position whenever they move '
          'together, and the number of independent bets in a book is not the '
          'number of lines in it.</p>\n',
),
# ---------------------------------------------------------------- module 9
dict(
    mod=9, tier='professional', slug='module-9-quiz',
    slots=[71, 72, 73, 74, 75],
    title='Module 9 Quiz: Portfolio',
    desc='Six computations from the portfolio module. Turn three medians into '
         'three ceilings on the bets you can carry, run the divisor to its wall, '
         'count the days on which a book is entirely red, solve two rules for '
         'their minimum-variance weights, correct a correlation for the '
         'volatility it was measured in, and find which limit binds first.',
    intro='This module filled in a card, one column per lesson: the highest '
          'correlation a rule shows against the rest, the heat the book carries '
          'and how often all of it arrives, the weight the optimiser gives each '
          'rule with the short forbidden, and how far that correlation moves when '
          'you measure it on half the record instead of all of it. Six questions, '
          'all arithmetic. The last one spends the whole card at once and finds '
          'that the column which binds is the one nobody argues about.',
    covers='Lessons 71 to 75, and the four-column card the module has been '
           'filling in since lesson 71.',
    related=[(71, 'the divisor the first two questions run'),
             (72, 'the all-against day the third question counts'),
             (73, 'the two weights the fourth question solves'),
             (74, 'the two windows the fifth question corrects'),
             (75, 'the limit the sixth question finds binding')],
    questions=[
        dict(
            title='Three medians, three ceilings',
            setup='      <p>Lesson 71 correlated all 31,878 pairs of lesson '
                  '63&rsquo;s 253 rules over the twenty-nine moves on which every '
                  'rule in the grid is defined. The median pair came to 0.9464 and '
                  '8.93 per cent of the pairs were the same series to the last '
                  'decimal.</p>\n'
                  '      <p>Lesson 74 measured the same 31,878 pairs on each half '
                  'of that window separately. Over the first fifteen moves the '
                  'median is 0.8835 and 9.37 per cent of pairs are identical. Over '
                  'the last fourteen the median is exactly 1.0000 and 72.90 per '
                  'cent are identical.</p>\n',
            ask='How many pairs are identical in each of the three windows, and '
                'what ceiling does each median put on the bets a book of these '
                'rules can carry, however many of them you run?',
            result='2,847, 2,987 and 23,239 identical pairs, against ceilings of '
                   '1.0566, 1.1319 and exactly 1.',
            answer='      <p>The counts are one multiplication each. '
                   '0.0893 &times; 31,878 = 2,847 over the full window, '
                   '0.0937 &times; 31,878 = 2,987 over the first fifteen moves, and '
                   '0.7290 &times; 31,878 = 23,239 over the last fourteen.</p>\n'
                   '      <p>The ceiling is one division. The bets a book carries '
                   'are N over one plus N minus one times r, and as N grows without '
                   'limit that goes to one over r. At 0.9464 the ceiling is 1.0566, '
                   'at 0.8835 it is 1.1319, and at exactly one it is exactly one.</p>\n'
                   '      <p>Read the third window twice. A median of 1.0000 does not '
                   'mean the rules are similar. It means more than half of the '
                   'pairs in the grid produced the same fourteen numbers as each '
                   'other, so the ceiling is not approached from below, it is '
                   'reached: no number of rules from that family, run over that '
                   'fortnight, carries more than one bet. And the middle window '
                   'holds fewer identical pairs than the first even though it '
                   'contains the fortnight in which almost everything tied, because '
                   'agreeing on twenty-nine numbers is harder than agreeing on '
                   'fifteen.</p>\n'),
        dict(
            title='The divisor, run to its wall',
            setup='      <p>A trader runs several rules whose average pairwise '
                  'correlation is 0.8800, which is what lesson 74 measured on the '
                  'worse of its two fortnights. Lesson 67 needed 589 trades to '
                  'settle whether an edge of a tenth of an R was real, and lesson '
                  '65 fixed the pace at forty trades a month.</p>\n'
                  '      <p>The bets a book carries are N over one plus N minus one '
                  'times r, and a rule run alongside others needs the 589 divided '
                  'by that number.</p>\n',
            ask='What are the bets, the trades and the months at two rules, at '
                'four, at six, and in the limit? What correlation would six rules '
                'need in order to carry three bets? And what would six independent '
                'rules have cost in months?',
            result='1.0638, 1.0989, 1.1111 and 1.1364 bets; 554, 536, 530 and 518 '
                   'trades; 13.84, 13.40, 13.25 and 12.96 months; a correlation of '
                   '0.2000 for three bets; and 2.45 months if they were '
                   'independent.',
            answer='      <p>Four divisions and a table.</p>\n'
                   + table(['Rules run in parallel', 'Bets you are carrying',
                            'Trades each still needs', 'Months'],
                           [['Two', '1.0638', '553.7', '13.84'],
                            ['Four', '1.0989', '536.0', '13.40'],
                            ['Six', '1.1111', '530.1', '13.25'],
                            ['As many as you like', '1.1364', '518.3', '12.96']])
                   + '      <p>The limit is one over 0.8800, which is 1.1364, and '
                   'the wait it leaves is 0.8800 of the original: 0.88 &times; 589 '
                   'is 518.3 trades and 12.96 months. There is no number of rules '
                   'at this correlation that gets the wait below thirteen months, '
                   'because the limit does not contain N at all.</p>\n'
                   '      <p>The correlation that would buy three bets from six '
                   'rules is the divisor solved backwards: 6 over one plus five r '
                   'equals 3 gives 1 + 5r = 2 and r = 0.2000. That is not a '
                   'correlation this course has measured anywhere, on any window, '
                   'between any two rules of this family.</p>\n'
                   '      <p>And six independent rules would have needed 589 '
                   '&divide; 6 = 98.2 trades each, which is 2.45 months. The '
                   'distance between 2.45 and 13.25 is the whole of what the word '
                   'diversification is usually carrying, and it is bought with a '
                   'number nobody measures.</p>\n'),
        dict(
            title='The day the whole book is red',
            setup='      <p>Six positions, each risking 1.5 per cent of the '
                  'account, at lesson 71&rsquo;s measured correlation of 0.9464. '
                  'The variance of a sum of N positions of equal size is the '
                  'single-position variance multiplied by N times one plus N minus '
                  'one times r.</p>\n'
                  '      <p>Lesson 72 evaluated the one-factor integral for the day '
                  'on which every position goes against you: at six positions it is '
                  '0.3829 at this correlation and 0.0156 if the six were '
                  'independent. Take a month as 21 trading days, and take lesson '
                  '18&rsquo;s median worst drawdown of 9R.</p>\n',
            ask='What is the heat and what is the day&rsquo;s standard deviation? '
                'How many all-against days does a month contain under each '
                'assumption, and what is the ratio between them? And how many '
                'trading days of all-against days does it take to reach 9R?',
            result='9.0 per cent of heat, a day of 8.80 per cent, 8.04 all-against '
                   'days a month against 0.33, a ratio of 24.5, and 9R in 3.9 '
                   'trading days.',
            answer='      <p>Heat is the sum of the stops: six positions at 1.5 per '
                   'cent is 9.0 per cent, and that is the maximum rather than a '
                   'summary.</p>\n'
                   '      <p>The summary is the standard deviation. One plus five '
                   'times 0.9464 is 5.7320, six times that is 34.3920, its square '
                   'root is 5.8645, and at 1.5 per cent a position that is 8.80 per '
                   'cent. So the day sits 96.2 per cent of the way from the 3.67 '
                   'per cent six independent positions would give to the 9.0 per '
                   'cent that arrives when the six move as one.</p>\n'
                   '      <p>The frequencies are one multiplication each. '
                   '0.3829 &times; 21 = 8.04 days a month, against '
                   '0.0156 &times; 21 = 0.33, which is one such day every three '
                   'months. The ratio is 0.3829 &divide; 0.0156 = 24.5, and it is '
                   'bought with no change to any position size, any stop or any '
                   'rule.</p>\n'
                   '      <p>And the depth. Six positions hand you 6R on the '
                   'all-against day, so 9R is 1.5 of those days, and at one day in '
                   '2.61 they arrive in 3.9 trading days. Four working days for the '
                   'ingredient of a career-worst drawdown, on a book any checklist '
                   'would call diversified.</p>\n'),
        dict(
            title='Two rules, and the weights you can hold',
            setup='      <p>Lesson 73 forbade the short and the optimiser put '
                  'everything into two of the four rules. Here are those two, with '
                  'the standard deviations and the correlation lesson 71 measured '
                  'over the same twenty-nine moves: the 2-and-5 rule at 0.6015, the '
                  '8-and-30 rule at 0.7082, and a correlation between them of '
                  '0.6254.</p>\n'
                  '      <p>For two assets the minimum-variance weight on the first '
                  'is the second&rsquo;s variance minus the covariance, over the '
                  'sum of the two variances minus twice the covariance.</p>\n',
            ask='What are the two weights, what standard deviation do they deliver, '
                'and what is the cut against equal weights? And above what '
                'correlation would the optimiser want to short the noisier of the '
                'two?',
            result='0.7114 and 0.2886, delivering 0.57816 against 0.59080 equally '
                   'weighted, a cut of 2.14 per cent; and the short arrives above a '
                   'correlation of 0.8493.',
            answer='      <p>The covariance is 0.6254 &times; 0.6015 &times; 0.7082 '
                   '= 0.26641. The two variances are 0.36180 and 0.50155.</p>\n'
                   '      <p>The weight on the 2-and-5 rule is '
                   '(0.50155 &minus; 0.26641) &divide; '
                   '(0.36180 + 0.50155 &minus; 2 &times; 0.26641) = '
                   '0.23514 &divide; 0.33053 = 0.7114, so the other weight is '
                   '0.2886. Those are the 0.711 and 0.289 on the card, arrived at '
                   'from two standard deviations and one correlation rather than '
                   'from a matrix inversion.</p>\n'
                   '      <p>The variance they deliver is '
                   '0.7114&sup2; &times; 0.36180 + 0.2886&sup2; &times; 0.50155 + '
                   '2 &times; 0.7114 &times; 0.2886 &times; 0.26641 = 0.33427, '
                   'whose square root is 0.57816. Equal weights give 0.59080, so '
                   'the whole prize on this pair is 2.14 per cent of the day.</p>\n'
                   '      <p>The short is a comparison rather than a calculation. '
                   'The weight on the second rule is its own variance minus the '
                   'covariance, so it turns negative when the covariance exceeds '
                   'the first rule&rsquo;s variance, which is when r exceeds '
                   '0.6015 &divide; 0.7082 = 0.8493. Below that the optimiser holds '
                   'both. Above it, it wants to sell the noisier rule to hedge the '
                   'quieter one, and the correlations lesson 74 measured on its '
                   'worse fortnight sit above it.</p>\n'),
        dict(
            title='The window decides, and the correction that does not save it',
            setup='      <p>Lesson 74 measured the four rules&rsquo; average '
                  'pairwise correlation three ways: 0.5966 over the first fifteen '
                  'moves, 0.7695 over all twenty-nine, and 0.8800 over the last '
                  'fourteen. The instrument&rsquo;s own standard deviation over the '
                  'second fortnight is 1.240 times its standard deviation over the '
                  'first.</p>\n'
                  '      <p>The standard correction for that bias divides the '
                  'measured correlation by the square root of one plus delta times '
                  'one minus the correlation squared, where delta is the ratio of '
                  'variances minus one. The book is four positions at two per cent '
                  'each in every case, and the all-against frequencies are 0.2323 '
                  'at the lowest correlation and 0.3567 at the highest.</p>\n',
            ask='What does the correction do to the 0.8800? What are the bets and '
                'the day&rsquo;s standard deviation at each of the three '
                'correlations? And how much more often does the all-against day '
                'arrive on the second fortnight than on the first?',
            result='The 0.8800 corrects to 0.8310; the bets are 1.4338, 1.2090 and '
                   '1.0989 and the days 6.68, 7.28 and 7.63 per cent; and the '
                   'all-against day arrives 1.54 times more often.',
            answer='      <p>Delta is 1.240&sup2; &minus; 1 = 0.5376. One minus '
                   '0.8800&sup2; is 0.2256, so the denominator is the square root '
                   'of 1 + 0.5376 &times; 0.2256 = 1.12128, which is 1.05891, and '
                   '0.8800 &divide; 1.05891 = 0.8310.</p>\n'
                   '      <p>That is a real correction and it does not rescue the '
                   'measurement: 0.8310 still sits far above the first '
                   'fortnight&rsquo;s 0.5966, so the volatility explains part of '
                   'the move and not most of it.</p>\n'
                   + table(['Correlation measured on', 'Average pairwise',
                            'Independent bets', 'Standard deviation of the day'],
                           [['First fifteen moves', '0.5966', '1.4338', '6.68%'],
                            ['All twenty-nine', '0.7695', '1.2090', '7.28%'],
                            ['Last fourteen moves', '0.8800', '1.0989', '7.63%']])
                   + '      <p>And the frequency is one division: '
                   '0.3567 &divide; 0.2323 = 1.54. The same four positions, sized '
                   'identically, hand you a day on which everything goes against '
                   'you half again as often, and nothing about the book changed. '
                   'Only the fortnight the correlation was measured in did.</p>\n'),
        dict(
            title='Which limit binds, and the card spent',
            setup='      <p>An account runs a four per cent daily-loss limit and '
                  'risks one per cent a trade. A daily-loss limit means nothing '
                  'unless the whole heat fits inside it, so the position count is '
                  'the limit divided by the risk per trade.</p>\n'
                  '      <p>Take lesson 74&rsquo;s worst-window correlation of '
                  '0.8800, at which the all-against day arrives on 35.67 per cent '
                  'of days for four positions. Compare the permitted book against a '
                  'single position carrying the same four per cent of heat, which '
                  'loses its whole heat whenever it loses at all.</p>\n',
            ask='How many positions does the limit permit, what is the day&rsquo;s '
                'standard deviation for that book against the single position, and '
                'by how much does spreading the risk shrink the day and the '
                'full-heat day? Then read the card: which rule does the correlation '
                'column delete, and which does the weights column zero as well?',
            result='Four positions, a day of 3.82 per cent against 4.00, which is '
                   '4.61 per cent smaller, and a full-heat day 28.7 per cent rarer; '
                   'and the card deletes 5-and-20 and zeroes 3-and-10 as well.',
            answer='      <p>The count is one division: 4 &divide; 1 = 4 positions. '
                   'Not four rules chosen and then sized around, four because that '
                   'is what one per cent a trade leaves room for under a four per '
                   'cent limit.</p>\n'
                   '      <p>The single position at four per cent has a day of 4.00 '
                   'per cent and pays its whole heat whenever it loses, which is '
                   'half the time. Four positions at one per cent give '
                   '1 + 3 &times; 0.8800 = 3.64, four times that is 14.56, and the '
                   'square root is 3.8158, so the day is 3.82 per cent and the '
                   'whole heat arrives 35.67 per cent of the time.</p>\n'
                   '      <p>So the day is (4.00 &minus; 3.82) &divide; 4.00 = 4.61 '
                   'per cent smaller and the full-heat day is '
                   '(0.5000 &minus; 0.3567) &divide; 0.5000 = 28.7 per cent rarer. '
                   'That is the entire benefit of running four rules rather than '
                   'one, after five lessons of measurement, and it costs a '
                   'quartering of the size per trade to collect. Independent, the '
                   'same swap would have given a day 50 per cent smaller and a '
                   'full-heat day 87.5 per cent rarer.</p>\n'
                   '      <p>And the card, for the four rules the module has '
                   'carried since lesson 71:</p>\n'
                   + table(['Rule', 'Highest correlation, full window',
                            'Highest on any window', 'Weight, short forbidden'],
                           [['2-and-5', '0.7326', '0.7599', '0.711'],
                            ['3-and-10', '0.8287', '1.0000', '0'],
                            ['5-and-20', '0.9648', '1.0000', '0'],
                            ['8-and-30', '0.9648', '1.0000', '0.289']])
                   + '      <p>The first column says delete 5-and-20, because it is '
                   'a duplicate of 8-and-30 at 0.9648 and carries less that the '
                   'others do not already have. The second says the first column '
                   'was the optimistic version: on the fortnight that matters, '
                   'three of the four rules are the same series. The third says the '
                   'same thing in a different currency, putting nothing at all in '
                   '3-and-10 and 5-and-20. Three columns, two rules left, and a cap '
                   'that had already decided the count before any of them was '
                   'computed.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can tell a book from a list of positions. Handed a '
          'median correlation, you turn it into a ceiling and notice that the '
          'ceiling does not contain the number of rules; handed a book, you compute '
          'both the heat and how often the whole of it arrives, and act on the '
          'second; handed two rules, you solve them for weights and find the '
          'correlation at which the answer stops being holdable; handed a record, '
          'you split it in half and size on the worse half; and handed a loss '
          'limit, you divide it by your risk per trade before you argue about which '
          'rules to run, because that division has already fixed the count.</p>\n'
          '      <p>Module 10 leaves the arithmetic and starts on the day, and '
          'finds the day is not short of hours but short of decisions: of the 253 '
          'rules on the grid, 203 produce exactly one entry over the stretch they '
          'are defined on, and the busiest cell in the whole grid works out at '
          'seventy entries a year.</p>\n',
),
# --------------------------------------------------------------- module 10
dict(
    mod=10, tier='professional', slug='module-10-quiz',
    slots=[76, 77, 78, 79, 80, 81],
    title='Module 10 Quiz: The Profession',
    desc='Seven computations from the profession module. Turn an order count '
         'into a pace and a pace into a wait, price a quiet week against a busy '
         'one, multiply a chain, tax an edge with and without relief, size the '
         'capital a wage requires, spread one fixed cost across the trades there '
         'actually are, and put a seven-trade record against the bars the course '
         'wrote.',
    intro='This module kept a list of what the day contains that is not the '
          'decision: twelve operations, a chain, a rate, a wage and an overhead. '
          'Seven questions, all arithmetic, and every one of them starts from a '
          'count the earlier modules produced rather than from a number anybody '
          'assumed. The last one puts the whole list beside a record of seven '
          'trades.',
    covers='Lessons 76 to 81, and the five-item list of subtractions the module '
           'has been keeping since lesson 76.',
    related=[(76, 'the pace the first two questions run on'),
             (77, 'the chain the third question multiplies'),
             (78, 'the relief the fourth question solves for'),
             (79, 'the capital the fifth question sizes'),
             (80, 'the overhead the sixth question spreads'),
             (81, 'the eleven bars the last question ranks')],
    questions=[
        dict(
            title='A pace, and the wait it buys',
            setup='      <p>Lesson 76 ran lesson 71&rsquo;s four rules over the '
                  'twenty-nine moves on which all of them are defined. The '
                  '2-and-5 rule asked for 9 orders, the 3-and-10 for 2, and the '
                  '5-and-20 and 8-and-30 for 1 each.</p>\n'
                  '      <p>Take a year as 252 trading days. Two orders make a '
                  'round trip. Lesson 67 needs 589 trades to settle whether an '
                  'edge of a tenth of an R is real, and lesson 65 assumed forty '
                  'trades a month.</p>\n',
            ask='How many orders and how many round trips a year does the book '
                'ask for, what share of its workload does the fastest rule carry, '
                'and how long does lesson 67&rsquo;s verdict take at that pace? '
                'How long would it take at the assumed pace?',
            result='113 orders and 56.5 round trips a year, 69.23 per cent of the '
                   'workload on one rule, and a verdict 10.42 years away against '
                   '1.23 at the assumed pace.',
            answer='      <p>Thirteen orders in twenty-nine days is a rate: '
                   '13 &divide; 29 &times; 252 = 113 orders a year, which is 56.5 '
                   'round trips. The fastest rule asked for 9 of the 13, which is '
                   '9 &divide; 13 = 69.23 per cent of every order the book '
                   'sent.</p>\n'
                   '      <p>The verdict is one division: 589 &divide; 56.5 = '
                   '10.42 years. Forty trades a month is 480 round trips a year, '
                   'so the same 589 would have taken 589 &divide; 480 = 1.23 '
                   'years, and at the 240 round trips a mid-table pace gives, '
                   '2.45.</p>\n'
                   '      <p>The gap between 10.42 and 1.23 is not a disagreement '
                   'about patience. It is a count that was assumed against a count '
                   'that was made, on the same rule family, and the assumed one is '
                   'eight and a half times the measured one. A reader carrying '
                   'lesson 65&rsquo;s wait in their head is carrying somebody '
                   'else&rsquo;s numerator.</p>\n'),
        dict(
            title='The quiet week and the busy one',
            setup='      <p>On the same twenty-nine moves the 2-and-5 rule had a '
                  'six-day stretch, moves 44 to 49, in which the position never '
                  'changed and no order was sent, and it earned 1.90 in the '
                  'instrument&rsquo;s units. It then had five consecutive days, '
                  'moves 50 to 54, of exit, entry, exit, entry, exit, and it '
                  'earned 0.20 while the price moved 0.40 across the whole '
                  'stretch.</p>\n'
                  '      <p>A typical daily move over those twenty-nine is 0.7172. '
                  'Five orders are two and a half round trips. Lesson 12 priced a '
                  'round trip at a fifth of one per cent of a typical day&rsquo;s '
                  'movement on its index ETF and at 52 per cent of one on its '
                  'micro cap.</p>\n',
            ask='What is each stretch worth in typical daily moves, what is the '
                'ratio between them, and what do the five orders cost on each of '
                'the two instruments as a share of what the busy week made?',
            result='2.65 typical daily moves against 0.28, a ratio of 9.5, and '
                   'five orders costing 0.0036 on the index ETF against 0.93 on '
                   'the micro cap, which is 1.8 per cent of the gain against 4.7 '
                   'times it.',
            answer='      <p>Two divisions. 1.90 &divide; 0.7172 = 2.65 typical '
                   'daily moves for the six days that asked for nothing, and '
                   '0.20 &divide; 0.7172 = 0.28 for the five days that asked for '
                   'an order every session. The ratio is '
                   '1.90 &divide; 0.20 = 9.5.</p>\n'
                   '      <p>Then the bill. Two and a half round trips at a fifth '
                   'of one per cent of 0.7172 is '
                   '2.5 &times; 0.002 &times; 0.7172 = 0.0036, which is 1.8 per '
                   'cent of the 0.20. The same two and a half round trips at 52 '
                   'per cent of 0.7172 is 0.93, which is 4.7 times the whole '
                   'gain.</p>\n'
                   '      <p>Identical rule, identical week, identical orders. The '
                   'only thing that changed is the instrument, and the six days '
                   'that felt like a system that had stopped working made nine and '
                   'a half times what the week that felt like work made, before '
                   'either bill.</p>\n'),
        dict(
            title='The link you do not own',
            setup='      <p>An order reaches the market through your equipment and '
                  'then through the broker, and availability along a chain '
                  'multiplies. Take the broker at 99.9 per cent and a year as '
                  '8,760 hours. The book asks for 113 orders a year.</p>\n'
                  '      <p>A second connection is not two independent links. With '
                  'a share c of failures common to both, a pair of links each down '
                  'a fraction q of the time is down c q + (1 &minus; c) q&sup2;. '
                  'Take q as one per cent and c as one in five.</p>\n',
            ask='What is the chain&rsquo;s availability and its downtime a year at '
                'your side of 99.0, 99.9, 99.99 and 99.999 per cent, and how many '
                'orders a year does your own side alone cost you at each? Then: '
                'what does a second connection do to your side, and what does a '
                'stop resting at the broker do to the hours a position spends '
                'unprotected?',
            result='98.901, 99.800, 99.890 and 99.899 per cent, which is 96.3, '
                   '17.5, 9.6 and 8.8 hours a year and 1.13, 0.11, 0.011 and 0.001 '
                   'orders missed; the second connection takes your side to 99.792 '
                   'per cent and the position to 27.0 unprotected hours, and the '
                   'resting stop takes it to 8.8 for nothing.',
            answer='      <p>The chain is one multiplication a row.</p>\n'
                   + table(['Your side', 'Chain, at a broker of 99.9%',
                            'Chain down a year', 'Orders missed a year'],
                           [['99.0%', '98.901%', '96.3 hours', '1.13'],
                            ['99.9%', '99.800%', '17.5 hours', '0.11'],
                            ['99.99%', '99.890%', '9.6 hours', '0.011'],
                            ['99.999%', '99.899%', '8.8 hours', '0.001']])
                   + '      <p>Read the third column down and the purchases price '
                   'themselves. The first, from 99.0 to 99.9, is worth 78.8 hours '
                   'a year. The second is worth 7.9. The third is worth 0.8, and '
                   'there is no fourth, because the 8.8 hours that remain belong '
                   'to the broker and no equipment of yours can reach them.</p>\n'
                   '      <p>The second connection: at one failure in five common '
                   'to both, the pair is down '
                   '0.2 &times; 0.01 + 0.8 &times; 0.0001 = 0.00208, so your side '
                   'goes to 99.792 per cent, the chain to 99.692, and a position '
                   'spends 8,760 &times; 0.00308 = 27.0 hours a year unprotected '
                   'rather than 96.3.</p>\n'
                   '      <p>The resting stop: a submitted order is executed by the '
                   'machine holding it, so the position is protected at the '
                   'broker&rsquo;s 99.9 per cent whatever your equipment does, '
                   'which is 8.8 hours. The free move is worth 87.5 hours a year '
                   'and the paid one 69.3, and the free one is larger before the '
                   'bill is subtracted rather than after.</p>\n'),
        dict(
            title='The rate that changes nothing, and the relief that does',
            setup='      <p>Lesson 67&rsquo;s trade outcome has a mean of a tenth '
                  'of an R and a standard deviation of one R. Split it and the '
                  'winning part averages 0.4509 R a trade and the losing part '
                  '0.3509 R, and the edge is the difference.</p>\n'
                  '      <p>A rate takes a slice off the first number and relief '
                  'gives a slice back on the second. Write the share of a loss '
                  'that actually reduces what you pay as a fraction of the full '
                  'rate. Lesson 67&rsquo;s verdict takes 589 trades on an edge of '
                  'a tenth of an R and a standard deviation of one.</p>\n',
            ask='Why does the verdict stay at 589 trades at every rate when relief '
                'is full? At what rate does the edge vanish with no relief at all? '
                'What share of losses must be relieved at a rate of thirty per cent '
                'and at forty? And what is the edge, the standard deviation and the '
                'trade count at thirty per cent with half the losses relieved?',
            result='Full relief multiplies the mean and the standard deviation by '
                   'the same factor and the test is a ratio, so 589 stands; with no '
                   'relief the edge vanishes at 22.18 per cent; thirty per cent '
                   'needs 33.5 per cent of losses relieved and forty needs 57.3; and '
                   'at half relief the edge is +0.0174 R on a standard deviation of '
                   '0.7703, which is 11,596 trades.',
            answer='      <p>The first part is one observation. A proportional rate '
                   'with full relief multiplies every outcome by one minus the rate, '
                   'so the mean becomes 0.0700 and the standard deviation 0.7000 at '
                   'thirty per cent. The test runs on the mean divided by the '
                   'standard deviation, and a factor that multiplies both cancels: '
                   '0.0700 &divide; 0.7000 = 0.10, unchanged, and the verdict stays '
                   'at 589 trades at any rate short of confiscation.</p>\n'
                   '      <p>With no relief the edge is what the rate leaves of the '
                   'winning part after the whole losing part is subtracted, so it '
                   'vanishes when the rate times 0.4509 equals 0.10: '
                   '0.10 &divide; 0.4509 = 22.18 per cent.</p>\n'
                   '      <p>Between the two, the relief needed is the winning part '
                   'minus the edge over the rate, all over the losing part. At '
                   'thirty per cent that is '
                   '(0.4509 &minus; 0.3333) &divide; 0.3509 = 33.5 per cent, and at '
                   'forty it is (0.4509 &minus; 0.2500) &divide; 0.3509 = 57.3 per '
                   'cent. The question to ask about a tax system is therefore not '
                   'what the rate is but how much of a loss comes back.</p>\n'
                   '      <p>And at thirty per cent with half the losses relieved '
                   'the mean is 0.10 &minus; 0.30 &times; '
                   '(0.4509 &minus; 0.5 &times; 0.3509) = +0.0174 R against a '
                   'standard deviation of 0.7703, so the drift per trade falls from '
                   '0.10 to 0.0225 and the verdict takes 11,596 trades. The rate '
                   'did not change the shape. The relief did.</p>\n'),
        dict(
            title='The capital a wage requires',
            setup='      <p>In a year an account takes some number of round trips, '
                  'each worth the edge in R, and each R is the risk per trade as a '
                  'fraction of the account. Set the expected annual gain equal to a '
                  'wage and the capital falls out: the capital, in years of that '
                  'wage, is one divided by the round trips times the edge times the '
                  'risk per trade.</p>\n'
                  '      <p>Use lesson 76&rsquo;s 56.5 round trips a year, lesson '
                  '67&rsquo;s edge of a tenth of an R and its 589 trades and median '
                  'worst drawdown of 8.82R, and the one and a half per cent a trade '
                  'lesson 75 licenses.</p>\n',
            ask='What capital does the wage require, how far away is the verdict, '
                'what share of that capital is drawn as wages before it lands, and '
                'why does the pace not appear in that share? At what risk per trade '
                'does the share reach the whole account, and what do the wages and '
                'the drawdown come to together?',
            result='11.80 years of wage, a verdict 10.42 years away, 88.3 per cent '
                   'drawn as wages, a share the pace cancels out of, the whole '
                   'account reached at 1.70 per cent a trade, and 101.6 per cent '
                   'with the drawdown added.',
            answer='      <p>The capital is one division: '
                   '1 &divide; (56.5 &times; 0.10 &times; 0.015) = 11.80 years of '
                   'the wage. The verdict is another: 589 &divide; 56.5 = 10.42 '
                   'years. The two horizons are the same horizon.</p>\n'
                   '      <p>The share drawn is where the pace disappears. Wages '
                   'drawn before the verdict are 589 over n years, and the capital '
                   'is one over n times the edge times the risk per trade, so the '
                   'ratio is 589 &times; 0.10 &times; 0.015 = 88.3 per cent and the '
                   'n has cancelled. Trading four times as often does not reduce '
                   'what the wait costs you, because a faster pace shrinks the '
                   'capital by exactly the factor it shortens the wait.</p>\n'
                   '      <p>Which leaves the risk per trade as the only lever, and '
                   'it runs out quickly: the share reaches the whole account at '
                   '1 &divide; (589 &times; 0.10) = 1.70 per cent a trade. Lesson '
                   '67&rsquo;s median worst drawdown of 8.82R at one and a half per '
                   'cent is another 13.23 per cent of the account, arriving during '
                   'the same years rather than instead of them, and 88.3 + 13.23 = '
                   '101.6 per cent is not a number an account can hold.</p>\n'),
        dict(
            title='The cost that does not scale',
            setup='      <p>Every cost the course has priced so far arrives with a '
                  'trade. A fixed cost does not: it arrives in a year you traded '
                  'four hundred times and in a year you traded none.</p>\n'
                  '      <p>Lesson 79 sized the capital so that the expected annual '
                  'gain equals the wage, which means a cost base measured as a '
                  'share of the wage is the same share of the edge. Take a cost '
                  'base of a quarter of the wage on the book lesson 79 priced: '
                  '11.80 years of capital, 56.5 round trips a year, a tenth of an R, '
                  'and lesson 67&rsquo;s verdict at 5.8888 divided by the edge '
                  'squared.</p>\n',
            ask='What capital does the wage plus the cost base require, what edge '
                'is left, how many trades does the verdict take, and how many years '
                'is that at 56.5 round trips a year against 480? And why does the '
                'wait move so much faster than the capital?',
            result='14.75 years of wage, an edge of 0.075 R, 1,047 trades, and 18.53 '
                   'years at the measured pace against 1.30 at the assumed one; the '
                   'wait moves faster because it goes as one over the edge squared.',
            answer='      <p>The capital is the wage and the cost base together: '
                   '11.80 &times; 1.25 = 14.75 years of wage, an extra 2.95. The '
                   'edge is the same fraction gone: a quarter of the wage is a '
                   'quarter of the edge, so 0.10 becomes 0.075.</p>\n'
                   '      <p>The verdict is 5.8888 &divide; 0.075&sup2; = 1,047 '
                   'trades, and at 56.5 round trips a year that is 18.53 years '
                   'rather than 10.42. The same bill on the same account at 480 '
                   'round trips a year takes 0.0029 R from each trade rather than '
                   '0.0250, leaves an edge of 0.0971, and costs 1.30 years against '
                   '1.23. Eight years at the pace you actually trade at, and a month '
                   'at the pace you assumed.</p>\n'
                   '      <p>The reason the wait moves so much faster than the '
                   'capital is the square. The capital grows in proportion to the '
                   'cost base and the trade count goes as one over the edge squared, '
                   'so leaving three quarters of the edge multiplies the trades by '
                   'sixteen ninths and leaving a quarter multiplies them by sixteen. '
                   'A fixed cost is not a bill the account settles out of its '
                   'profits. It is a piece of the edge, and the pace decides how big '
                   'a piece.</p>\n'),
        dict(
            title='Seven trades against the bars the course wrote',
            setup='      <p>The book module 9 licensed has one record: the seven '
                  'trades lesson 63&rsquo;s winning cell took on sixty closes. '
                  'Three bars ask for a count of trades and each names a different '
                  'one. Lesson 65 fixes a horizon of 156 before the first trade. '
                  'Lesson 67 wants 589. Lesson 80&rsquo;s quarter-wage cost base '
                  'wants 1,047.</p>\n'
                  '      <p>The pace is lesson 76&rsquo;s 56.5 round trips a '
                  'year.</p>\n',
            ask='What is each of those four in years at that pace, and what is each '
                'as a multiple of the record the book actually has? Which of them is '
                'the one to work on, and what do the five items on this '
                'module&rsquo;s list have in common?',
            result='0.12, 2.76, 10.42 and 18.53 years, which is 1, 22.3, 84.1 and '
                   '149.6 times the record; the fixed horizon at 22.3 times is the '
                   'reachable one; and every item on the list is a subtraction.',
            answer='      <p>Two divisions a row.</p>\n'
                   + table(['What it takes', 'Trades', 'Years at 56.5 a year',
                            'Times the record'],
                           [['The book&rsquo;s whole record', '7', '0.12', '1'],
                            ['Lesson 65&rsquo;s fixed horizon', '156', '2.76', '22.3'],
                            ['Lesson 67&rsquo;s verdict', '589', '10.42', '84.1'],
                            ['Lesson 80&rsquo;s cost base', '1,047', '18.53', '149.6']])
                   + '      <p>The last column is what ranks the work. A record '
                   'twenty-two times the one you have is two years and nine months '
                   'of trading the rule you already have, which is a plan. A record '
                   'eighty-four times the one you have is a decade, and one a '
                   'hundred and fifty times is a working life. The reachable bar is '
                   'the one to start on, and it is reachable precisely because it is '
                   'the one that was fixed before the first trade rather than '
                   'demanded after it.</p>\n'
                   '      <p>And the list this module kept has one property worth '
                   'saying out loud. Twelve operations, a chain, a rate, a wage, an '
                   'overhead: every entry on it is a subtraction. Nothing the day '
                   'contains outside the decision adds to the edge. The whole of '
                   'what a profession does with the arithmetic is to find out how '
                   'much of the edge survives the things that are not the '
                   'trade.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can put a count where an assumption was. Handed a '
          'grid, you count the orders it actually asked for and turn that into a '
          'pace; handed a quiet stretch and a busy one, you price both and find '
          'the quiet one worth nine and a half times the other; handed a chain, '
          'you multiply it and stop buying at the link you do not own; handed a '
          'rate, you ask what share of a loss comes back rather than what the rate '
          'is; handed a wage, you divide it by the edge, the pace and the risk per '
          'trade and read the years off; handed a fixed cost, you divide it among '
          'the trades there actually are; and handed a record, you set it against '
          'every bar the course wrote and work on the smallest gap that is not '
          'already closed.</p>\n'
          '      <p>Module 11 is where the candidates come from, and it starts '
          'where this book is weakest. This one carries 1.06 independent bets on a '
          'single instrument, and lesson 82 asks what a second instrument does to '
          'it: two rules on each of two instruments is four positions, and at a '
          'cross-correlation of zero that is 2.13 bets rather than four.</p>\n',
),

# --------------------------------------------------------------- module 11
dict(
    mod=11, tier='professional', slug='module-11-quiz',
    slots=[82, 83, 84, 85],
    title='Module 11 Quiz: The Electives',
    desc='Six computations from the electives. Run the divisor on a second '
         'instrument and then on a short leg, split a round trip into the part a '
         'second venue can reach and the part it cannot, price two habits at a '
         'base rate the course never printed, measure the unit twice, reprice a '
         'seven-trade record in three units, and rank the four freedoms by what '
         'each is worth.',
    intro='This module kept a list of the degrees of freedom the course did not '
          'have: a rule that may be short, a second place to trade the same thing, '
          'the person who has to sit through all of it, and the unit itself. Six '
          'questions, all arithmetic, and every one of them runs on a number an '
          'earlier lesson measured. The last one puts the four freedoms on one '
          'scale and finds that the two largest are the two that are free.',
    covers='Lessons 82 to 85, and the four-item list of missing freedoms the '
           'module has been keeping since lesson 82.',
    related=[(82, 'the divisor and the difference the first question runs twice'),
             (83, 'the round trip the second question takes apart'),
             (84, 'the two habits the third question compounds'),
             (85, 'the unit the last three questions measure twice')],
    questions=[
        dict(
            title='What a second instrument buys, and what a short leg buys',
            setup='      <p>Lesson 71&rsquo;s divisor takes a count of positions '
                  'and their average correlation and returns the independent bets '
                  'they amount to: the count over one plus the count less one '
                  'times the average. Two rules on one instrument at lesson '
                  '74&rsquo;s 0.88 carry 1.0638 bets.</p>\n'
                  '      <p>Put the same two rules on a second instrument. Four '
                  'positions make six pairs: two of them sit within an instrument '
                  'and carry the 0.88, and four cross between the instruments and '
                  'carry whatever the two instruments correlate at. Take that '
                  'cross-correlation as 0.35.</p>\n'
                  '      <p>Then the other arithmetic. Two equal positions each of '
                  'standard deviation one have a pair standard deviation of the '
                  'square root of one plus the correlation over two when both are '
                  'long, and the plus becomes a minus when one is short.</p>\n',
            ask='At 0.35, how many bets do the four positions carry and what is '
                'that against the 1.0638 you already had? What cross-correlation '
                'would four long positions need to carry a bet and a half? And at '
                '0.35, what are the two pair standard deviations and the factor '
                'between them, and how alike would two instruments have to be '
                'before turning one leg over made the pair ten times quieter?',
            result='1.5504 bets, which is 1.46 times the 1.0638 and 0.49 of a bet '
                   'bought with two more positions; 0.3933 for a bet and a half; '
                   '0.8216 against 0.5701, a factor of 1.44; and a correlation of '
                   '0.9802 before a short leg is worth ten times.',
            answer='      <p>The first is one average and one division. Six pairs, '
                   'two at 0.88 and four at 0.35, average (2 &times; 0.88 + 4 '
                   '&times; 0.35) &divide; 6 = 0.5267, and four positions at that '
                   'average carry 4 &divide; (1 + 3 &times; 0.5267) = 1.5504 bets. '
                   'Against the 1.0638 you carried on one instrument that is 1.46 '
                   'times, or 0.49 of a bet for two more positions, two more '
                   'spreads and two more lots of impact.</p>\n'
                   '      <p>Running the division backwards gives the '
                   'cross-correlation a target implies. A bet and a half needs an '
                   'average of (4 &divide; 1.5 &minus; 1) &divide; 3 = 0.5556, and '
                   'since two of the six pairs are stuck at 0.88, the four crossing '
                   'pairs have to come in at (6 &times; 0.5556 &minus; 1.76) '
                   '&divide; 4 = 0.3933. Two full bets need 0.0600, and the ceiling '
                   'at a cross-correlation of exactly zero is 2.1277 &mdash; so the '
                   'whole distance between two bets and the best case a second '
                   'instrument can ever offer is six hundredths of a '
                   'correlation.</p>\n'
                   '      <p>The short leg is the other formula on the same 0.35. '
                   'Both long is the square root of 1.35 &divide; 2 = 0.8216, one '
                   'short is the square root of 0.65 &divide; 2 = 0.5701, and the '
                   'factor is 1.44. Solve the factor for the correlation and ten '
                   'times quieter needs (1 + r) &divide; (1 &minus; r) = 100, which '
                   'is r = 0.9802. The two arithmetics point in opposite '
                   'directions down the same column, and that is the whole of '
                   'lesson 82: the correlation that ruins a long-only book is the '
                   'correlation a spread is made of.</p>\n'),
        dict(
            title='The part of the bill a second venue cannot reach',
            setup='      <p>Lesson 83 split lesson 63&rsquo;s 0.1230 round trip '
                  'into a spread, slippage and a commission, and found that a '
                  'second venue competes for the first and the third and cannot '
                  'touch the second, because slippage is lesson 69&rsquo;s delay '
                  'and a delay does not care where the order is sent.</p>\n'
                  '      <p>Run the same split on a different instrument. A '
                  'two-cent spread, eight basis points of slippage a side, and one '
                  'cent of commission a side, on a price near 48. Lesson 69 priced '
                  'five minutes between the signal and the order at 32.10 basis '
                  'points.</p>\n',
            ask='What is this round trip in cash and in basis points, what share of '
                'it does the slippage carry, and what share can a second venue ever '
                'reach? How far apart would two venues have to quote this '
                'instrument before you kept half the difference? And how many whole '
                'round trips does one five-minute delay cost?',
            result='0.1168 a share and 24.33 basis points, slippage carrying 65.75 '
                   'per cent, a second venue reaching 34.25 per cent, a difference '
                   'of 0.2336 or 48.67 basis points before you keep half, and one '
                   'five-minute delay costing 1.32 whole round trips.',
            answer='      <p>Three additions and one division a row.</p>\n'
                   + table(['Part of the round trip', 'A share',
                            'Basis points at 48', 'Share of the bill',
                            'A second venue?'],
                           [['Spread, two cents', '0.0200', '4.17', '17.12%',
                             'Yes'],
                            ['Slippage, eight basis points a side', '0.0768',
                             '16.00', '65.75%', 'No'],
                            ['Commission, one cent a side', '0.0200', '4.17',
                             '17.12%', 'Yes'],
                            ['The whole round trip', '0.1168', '24.33', '100%',
                             'A third of it']])
                   + '      <p>The reachable part is 0.0400 of 0.1168, which is '
                   '34.25 per cent, against the 16.26 per cent a second venue '
                   'reaches on lesson 83&rsquo;s own instrument. A wider spread and '
                   'a fatter commission on a cheaper share make the second account '
                   'worth twice as much here, and the reason is arithmetic rather '
                   'than anything about the venues: the part a venue can reach is '
                   'the part that is quoted, and the part it cannot is the part '
                   'that is a delay.</p>\n'
                   '      <p>Keeping half a difference means the difference is '
                   'twice the round trip, because you pay to enter on one side and '
                   'to exit on the other: 2 &times; 0.1168 = 0.2336 a share, or '
                   '48.67 basis points. And the delay is the number to hold this '
                   'against. Five minutes at 32.10 basis points on a 48 price is '
                   '0.1541 a share, which is 0.1541 &divide; 0.1168 = 1.32 whole '
                   'round trips. One late order costs more than a second venue '
                   'gives back on a whole round trip here, and lesson 83 found '
                   'the same ordering on its own instrument, which is why the '
                   'evening goes on the delay rather than on the '
                   'paperwork.</p>\n'),
        dict(
            title='A hundred candidates at a base rate the course did not print',
            setup='      <p>Lesson 84&rsquo;s test over 156 trades has a power of '
                  '0.3461 against lesson 67&rsquo;s tenth of an R, and a dead '
                  'system passes 5.05 per cent of the time judged once and 24.25 '
                  'per cent if you judge after every trade from trade 20. Lesson '
                  '67&rsquo;s eight-R line switches off 59.5 per cent of the '
                  'systems that genuinely work.</p>\n'
                  '      <p>Take a hundred candidate rules of which one in '
                  'twenty-five is genuinely alive.</p>\n',
            ask='How many rules does each of the two procedures accept, what share '
                'of each set is real, and what is the ratio? Then, for each '
                'procedure, at what base rate does half of what it accepts turn out '
                'to be real?',
            result='6.23 accepted rules of which 22.21 per cent are real, against '
                   '23.84 of which 2.35 per cent are; a ratio of 9.44; and half '
                   'real at a base rate of 12.73 per cent judged once and 63.37 per '
                   'cent with the two habits.',
            answer='      <p>Four alive and ninety-six dead. Judged once, the test '
                   'accepts 4 &times; 0.3461 = 1.3844 of the live ones and 96 '
                   '&times; 0.0505 = 4.8480 of the dead, so 6.23 rules are accepted '
                   'and 1.3844 &divide; 6.2324 = 22.21 per cent of them are '
                   'real.</p>\n'
                   '      <p>Now peek and abandon. The dead pass at 0.2425 rather '
                   'than 0.0505, so 96 &times; 0.2425 = 23.2800 get through; the '
                   'eight-R line removes 59.5 per cent of the live ones, so 1.3844 '
                   'becomes 0.5607. You accept 23.84 rules of which 2.35 per cent '
                   'are real. Nearly four times as many rules, two fifths as many '
                   'true ones, and a tenth the chance that any one of them is '
                   'real, on the same candidates and the same market.</p>\n'
                   '      <p>The last part is the same equation solved for the base '
                   'rate. Half real means the live ones passing equal the dead ones '
                   'passing: p &times; 0.3461 = (1 &minus; p) &times; 0.0505 gives '
                   'p = 12.73 per cent, and p &times; 0.1402 = (1 &minus; p) '
                   '&times; 0.2425 gives p = 63.37 per cent. A disciplined test '
                   'reaches a coin flip when one candidate in eight is alive. With '
                   'two ordinary habits it needs nearly two in three, which is a '
                   'population nobody searching for a rule has ever been in.</p>\n'),
        dict(
            title='Every distance in the course, measured twice',
            setup='      <p>Lesson 85 measured one bar&rsquo;s dispersion on all '
                  'sixty closes at 1.5443, on the first thirty moves at 2.0446 and '
                  'on the last twenty-nine at 0.7543. Every figure after lesson 63 '
                  'is quoted in the first of those.</p>\n'
                  '      <p>Three of the course&rsquo;s numbers are distances '
                  'rather than ratios: lesson 67&rsquo;s eight-R line, lesson '
                  '65&rsquo;s tenth of an R and lesson 64&rsquo;s 0.317 of an R a '
                  'trade. Lesson 75 sizes a position by dividing the money at risk '
                  'by the distance to the stop; take an account of 250,000 risking '
                  'two per cent.</p>\n',
            ask='What is the eight-R line in cash, and what is it in each '
                'half&rsquo;s own unit? By what single factor does every distance '
                'in the course move into each half, and by what factor between the '
                'two halves? How many shares does the sizing rule buy at each '
                'dispersion? And what happens to lesson 63&rsquo;s t of 3.65?',
            result='12.3544 a share, which is 6.04 of the loud half&rsquo;s R and '
                   '16.38 of the quiet half&rsquo;s; every distance multiplied by '
                   '0.7553 and 2.0474 and therefore by 2.711 between the halves; '
                   '2,446 shares against 6,629; and the t unchanged at 3.65.',
            answer='      <p>One multiplication converts the lot. Eight times '
                   '1.5443 is 12.3544 a share, and dividing by each half&rsquo;s '
                   'own dispersion gives 12.3544 &divide; 2.0446 = 6.04 and 12.3544 '
                   '&divide; 0.7543 = 16.38. The two divisions are the same two '
                   'divisions for every distance on the course, because the cash '
                   'value cancels: 1.5443 &divide; 2.0446 = 0.7553 and 1.5443 '
                   '&divide; 0.7543 = 2.0474, so lesson 65&rsquo;s tenth of an R is '
                   '0.0755 and 0.2047 of one, and lesson 64&rsquo;s 0.317 is 0.2394 '
                   'and 0.6490. Between the two halves the factor is 2.0446 '
                   '&divide; 0.7543 = 2.711.</p>\n'
                   '      <p>The sizing rule is the one thing that repairs itself. '
                   'Two per cent of 250,000 is 5,000, and 5,000 &divide; 2.0446 = '
                   '2,446 shares against 5,000 &divide; 0.7543 = 6,629 &mdash; the '
                   'ratio is 2.711 again, and the risk carried is the same in both. '
                   'It only repairs itself if you re-measure the input, which is '
                   'the thing the course did once and then spent for twenty-two '
                   'lessons.</p>\n'
                   '      <p>And the t does not move at all. A t is a mean over a '
                   'standard error and both are in the same units, so a constant '
                   'divisor cancels out of it exactly: 3.65 in dollars is 3.65 in '
                   'R and 3.65 in either half&rsquo;s R. Every ratio the course '
                   'built survives this page and every distance it set has to be '
                   'measured again.</p>\n'),
        dict(
            title='The same seven trades in three units',
            setup='      <p>Lesson 63&rsquo;s winner took seven trades on the sixty '
                  'closes for a gross of 10.70 a share, paid seven round trips at '
                  '0.1230 each, and netted 9.84.</p>\n'
                  '      <p>Two of the seven ran wholly inside the first thirty '
                  'moves, four ran wholly inside the last twenty-nine, and one '
                  'crossed the split. The three dispersions are 1.5443, 2.0446 and '
                  '0.7543.</p>\n',
            ask='What does the record average per trade if you price every trade at '
                'the single R, at the loud half&rsquo;s R and at the quiet '
                'half&rsquo;s? What is the bill as a share of the gross in each of '
                'those three? And what are the honest mixed figures, where each '
                'trade is priced in the unit of the window it lived through?',
            result='0.910, 0.687 and 1.863 R a trade; 8.05 per cent of the gross in '
                   'all three, because it is a ratio; and a mixed 1.101 R a trade '
                   'on a bill of 0.852 R, with the t moving from 3.65 to 3.68.',
            answer='      <p>The record nets 9.839 over seven trades, which is '
                   '1.4056 a share, and each unit is one division.</p>\n'
                   + table(['Priced in', 'The unit', 'Net per trade, in R'],
                           [['The single R', '1.5443', '0.910'],
                            ['The loud half&rsquo;s R', '2.0446', '0.687'],
                            ['The quiet half&rsquo;s R', '0.7543', '1.863']])
                   + '      <p>The bill does not move, and that is the half of the '
                   'page most readers miss. Seven round trips at 0.1230 is 0.861 a '
                   'share against a gross of 10.70, which is 8.05 per cent whatever '
                   'unit you write it in, because a share of a gross is a ratio and '
                   'the divisor cancels. Only when you write the bill as 0.557 of '
                   'an R does it start to move, because that is a distance.</p>\n'
                   '      <p>The honest answer prices each trade in the window it '
                   'lived through, and the two figures move in opposite directions. '
                   'The record averages 1.101 R a trade rather than 0.910, because '
                   'four of the seven were earned in the quiet half; and the bill '
                   'rises from 0.557 to 0.852 of an R, a factor of 1.53, because '
                   'four of the seven were paid there too. The t goes from 3.65 to '
                   '3.68, which is to say nowhere. The verdict is exactly as safe '
                   'as module 8 said, and every number underneath it was two '
                   'numbers.</p>\n'),
        dict(
            title='Four freedoms on one scale',
            setup='      <p>This module named four things the course did not have, '
                  'and priced each of them against something it had already '
                  'measured: a rule that may be short, a second venue for the same '
                  'instrument, the person who has to sit through all of it, and the '
                  'unit itself.</p>\n'
                  '      <p>The four numbers are lesson 82&rsquo;s 0.9695 against '
                  '0.2449 at a correlation of 0.88, lesson 83&rsquo;s edge over '
                  'holding of 4.16 a share going to 4.30, lesson 84&rsquo;s 43.2 '
                  'per cent going to 6.0 at a base rate of one in ten, and lesson '
                  '85&rsquo;s 2.0446 against 0.7543.</p>\n',
            ask='Turn each of the four into a factor on the quantity its own lesson '
                'measured, rank them, and then say which of the four cost something '
                'to take and which are free.',
            result='7.16, 3.96, 2.71 and 1.03, and the two largest are the two that '
                   'cost nothing.',
            answer='      <p>One division a row, and they land in an order nobody '
                   'would guess from how much each is written about.</p>\n'
                   + table(['The freedom', 'What it moves', 'The factor'],
                           [['Not breaking two habits',
                             '43.2% of accepted rules real against 6.0%', '7.16'],
                            ['A rule that may be short',
                             'a pair&rsquo;s day of 0.9695 against 0.2449', '3.96'],
                            ['Measuring the unit twice',
                             'a dispersion of 2.0446 against 0.7543', '2.71'],
                            ['A second venue for the same thing',
                             'an edge over holding of 4.16 against 4.30', '1.03']])
                   + '      <p>Now the bill for each. The short leg needs a '
                   'security borrowed, which costs a fee this course has never '
                   'priced and can be recalled, and it carries a loss with no '
                   'ceiling to size against. The second venue needs an account, a '
                   'second set of paperwork and a measured difference that clears '
                   'twelve basis points often enough to be worth having. Those are '
                   'the two that are paid for, and they are the two smallest '
                   'factors on the list.</p>\n'
                   '      <p>The other two cost nothing at all. Writing the horizon '
                   'down before the first trade, the depth you will sit through, '
                   'the count of settings you searched and the position limit is a '
                   'decision made once instead of a decision made every time you '
                   'look, and it is worth 7.16. Measuring one bar&rsquo;s standard '
                   'deviation on each half of your own record is one line of '
                   'arithmetic, and it is the difference between a distance and two '
                   'distances wearing one name. The two largest freedoms in the '
                   'whole module are free, and both of them are things you do '
                   'before the market opens rather than things you buy.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can price a freedom before you take it. Handed a '
          'second instrument, you run the divisor on it and find it buys half a '
          'bet rather than two; handed a short leg, you run the variance of a '
          'difference on the same correlation and find it buys more on half the '
          'positions; handed a round trip, you split it into the part that is '
          'quoted and the part that is a delay; handed a habit, you put it through '
          'the same test twice and read the share of your accepted rules that '
          'survives; and handed a unit, you measure it on each half of your record '
          'and divide, because a distance in a unit that moved is two distances '
          'wearing one name.</p>\n'
          '      <p>That is the last question in the course. The professional tier '
          'priced a book, then the day it takes to run one, then the profession '
          'that would have to pay for it, and then the freedoms none of it had, '
          'and every figure in all eighty-five lessons came out of a record small '
          'enough to hold in one hand. What you take away is not a system. It is '
          'the habit of dividing, of asking what a number is a number of, and of '
          'measuring the answer twice.</p>\n',
),


# --------------------------------------------------------------- module 12
dict(
    mod=12, tier='professional', slug='module-12-quiz',
    slots=[86, 87, 88, 89, 90],
    title='Module 12 Quiz: The Trader',
    desc='Six computations from the module that measured the reader. Re-exit seven '
         'trades at a target, find the widest stop that never fires, size a record '
         'by its last result and reprice it flat, add up what was showing, and put '
         'two habits together to find they do not add.',
    intro='Every other module measured the market. This one held lesson 63&rsquo;s '
          'seven trades still and measured four things a trader does to them. Six '
          'questions, all arithmetic on the same sheet, and the last one spends every '
          'column at once to find that two costs of 2.20 and 5.90 come to 5.40 '
          'together rather than 8.10.',
    covers='Lessons 86 to 90, and the sheet of seven trades the module has been '
           'adding a column to since its first page.',
    related=[(86, 'the profit target the first two questions turn'),
             (87, 'the excursions the third question reads'),
             (88, 'the sizing rule the fourth question runs'),
             (89, 'the best closes the fifth question adds up'),
             (90, 'the two habits the last question runs together')],
    questions=[
        dict(
            title='Seven trades, re-exited at the first sign of green',
            setup='      <p>Lesson 63&rsquo;s rule takes seven trades on this '
                  'course&rsquo;s sixty closes. Their entries and the rule&rsquo;s own '
                  'exits are below, and a round trip costs 0.1230 a share.</p>\n'
                  + table(['Trade no.', 'Entry', 'Rule exit', 'Gross'],
                          [['1', '102.6', '105.3', '+2.70'],
                           ['2', '103.7', '105.7', '+2.00'],
                           ['3', '98.8', '101.3', '+2.50'],
                           ['4', '104.4', '105.9', '+1.50'],
                           ['5', '106.9', '106.6', '&minus;0.30'],
                           ['6', '105.8', '107.1', '+1.30'],
                           ['7', '106.0', '107.0', '+1.00']])
                  + '      <p>Now close each trade instead at the first close above its '
                    'entry. Those closes are 105.3, 106.7, 99.2, 104.8, none, 107.1 and '
                    '107.0 respectively.</p>\n',
            ask='What does the record net, and how many of the seven finish positive?',
            result='7.64 a share, and six of seven &mdash; the same six.',
            answer='      <p>Subtract each entry from its new exit: +2.70, +3.00, +0.40, '
                   '+0.40, &minus;0.30 (the fifth never shows a profit, so it leaves '
                   'where the rule would have), +1.30 and +1.00. That is 8.50 gross.</p>\n'
                   '      <p>The trade count has not changed, so the costs have not '
                   'changed: 7 &times; 0.1230 = 0.861. Net is 8.50 &minus; 0.861 = '
                   '7.639, or 7.64 a share, against the rule&rsquo;s own 9.84.</p>\n'
                   '      <p>Six of the seven finish positive, exactly as before, and '
                   'the one that does not is the same one. The habit removed 2.20 a '
                   'share and left no trace in the number a journal reports. Against '
                   'buying and holding, which nets 5.68, the rule was worth 4.16 and is '
                   'now worth 1.96.</p>\n'),
        dict(
            title='Why two rows of the table are identical',
            setup='      <p>Lesson 85 measured R at 1.5443 a share. Lesson 86 runs the '
                  'same seven trades at a target of nothing, a quarter of an R, a half, '
                  'one, one and a half and two, and the first two rows come out '
                  'identical in every column.</p>\n'
                  '      <p>The first profitable close on each of the seven trades is '
                  '+2.70, +3.00, +0.40, +0.40, none, +1.30 and +1.00 above the '
                  'entry.</p>\n',
            ask='Show that the two rows must be identical, and give the target above '
                'which they would stop being so.',
            result='0.386 a share against a smallest profitable move of 0.40, so any '
                   'target under 0.40 fills identically; 0.2590 R is where it breaks.',
            answer='      <p>A quarter of an R is 0.25 &times; 1.5443 = 0.3861 a share. '
                   'The smallest profitable move any of the seven trades makes is 0.40, '
                   'on trades 3 and 4. Since 0.3861 is below 0.40, every trade fills at '
                   'the same close under both rules, so every figure in the two rows '
                   'agrees.</p>\n'
                   '      <p>The rows separate the moment the target exceeds 0.40, which '
                   'is 0.40 &divide; 1.5443 = 0.2590 of an R. At a target of 0.26 R '
                   'trades 3 and 4 would have to wait for a later close, and the row '
                   'would move.</p>\n'
                   '      <p>This is the check that tells you whether you have '
                   'reproduced the table correctly. Two identical top rows are the '
                   'arithmetic working, not a mistake.</p>\n'),
        dict(
            title='The widest stop that never fires',
            setup='      <p>Here is how far each of the seven trades went against its '
                  'entry, measured as the worst close inside the trade and quoted in R '
                  'at 1.5443 a share.</p>\n'
                  + table(['Trade no.', 'Worst close inside', 'In R'],
                          [['1', '102.1', '&minus;0.324'],
                           ['2', '103.0', '&minus;0.453'],
                           ['3', '99.2', '+0.259'],
                           ['4', '104.8', '+0.259'],
                           ['5', '106.6', '&minus;0.194'],
                           ['6', '107.1', '+0.842'],
                           ['7', '107.0', '+0.648']]),
            ask='Which stop distances never fire at all, how many trades does a stop at '
                'a third of an R fire on, and what does that tell you about the four '
                'trades whose worst close is a gain?',
            result='Anything wider than 0.453 R never fires; a third of an R fires once; '
                   'four of the seven can never be stopped at any distance.',
            answer='      <p>A stop fires when the worst close inside a trade reaches it, '
                   'so a stop wider than the deepest excursion on the sheet can never '
                   'fire. The deepest is 0.453 of an R, on trade 2, so every stop from '
                   '0.46 R outward leaves all seven trades exactly as the rule left '
                   'them: 9.84 a share, six winners.</p>\n'
                   '      <p>A stop at a third of an R, 0.333, sits between 0.324 and '
                   '0.453, so it fires on trade 2 alone. That single firing takes a '
                   '+2.00 winner to a &minus;0.70 loser and the record from 9.84 to '
                   '7.14.</p>\n'
                   '      <p>Trades 3, 4, 6 and 7 have a gain as their worst close: they '
                   'never trade below their entry on any close in their life. No stop at '
                   'any distance can touch them, which means four of the seven trades '
                   'are entirely outside the reach of the setting most traders think is '
                   'doing the most work.</p>\n'),
        dict(
            title='A sizing rule, and the flat position it should be compared with',
            setup='      <p>The seven trades net, after the round trip, 2.577, 1.877, '
                  '2.377, 1.377, &minus;0.423, 1.177 and 0.877 a share, in that order. '
                  'Start at one unit; after a trade that finishes positive, double; '
                  'after one that does not, halve.</p>\n',
            ask='What does the rule return, what average position does it carry, and '
                'what would a flat position of that same average size have returned?',
            result='43.535 on an average of 7.8571 units, against 77.306 flat &mdash; a '
                   'ratio of 0.5631.',
            answer='      <p>The sizes are 1, 2, 4, 8, 16, 8 and 16, because the first '
                   'four trades win, the fifth loses and the last two win. Multiply each '
                   'by its result: +2.577, +3.754, +9.508, +11.016, &minus;6.768, +9.416 '
                   'and +14.032, which totals 43.535.</p>\n'
                   '      <p>The average position is (1 + 2 + 4 + 8 + 16 + 8 + 16) '
                   '&divide; 7 = 55 &divide; 7 = 7.8571 units.</p>\n'
                   '      <p>Flat sizing returns the sum of the seven results, 9.839, '
                   'whatever the order. At 7.8571 units that is 9.839 &times; 7.8571 = '
                   '77.306, so the rule returned 43.535 &divide; 77.306 = 0.5631 of what '
                   'its own exposure earned. The comparison against 9.839 flatters it by '
                   'a factor of nearly eight and is the wrong comparison: a rule '
                   'carrying eight units is not competing with a rule carrying one.</p>\n'),
        dict(
            title='What was showing, and what arrived',
            setup='      <p>The best close inside each of the seven trades, against the '
                  'entry, is +2.70, +3.00, +4.60, +2.30, &minus;0.30, +1.30 and +1.00. '
                  'The realised results are +2.70, +2.00, +2.50, +1.50, &minus;0.30, '
                  '+1.30 and +1.00.</p>\n',
            ask='How much was given back in total, what share of what showed is that, '
                'and how many trades give back nothing?',
            result='3.90 a share, 26.7 per cent of the 14.60 that showed, and four of '
                   'the seven give back nothing.',
            answer='      <p>The showing total is 2.70 + 3.00 + 4.60 + 2.30 &minus; 0.30 '
                   '+ 1.30 + 1.00 = 14.60. The realised total is 10.70. The difference '
                   'is 3.90 a share, which is 3.90 &divide; 14.60 = 0.2671, or '
                   '26.7 per cent.</p>\n'
                   '      <p>Trades 1, 5, 6 and 7 give back nothing: their best close is '
                   'the close they exited on. Three of them lasted one bar, and one '
                   'lasted two and peaked on the second. The whole 3.90 comes from the '
                   'three trades that lasted four bars or more, and 2.10 of it from '
                   'trade 3 alone, which is 53.8 per cent of the total.</p>\n'
                   '      <p>That is the shape of the quantity: it is not spread across '
                   'a record, it is concentrated in whichever positions were open '
                   'longest, and those are the ones a trader can name a year later.</p>\n'),
        dict(
            title='Two habits, run together',
            setup='      <p>On these seven trades, taking the profit at the first close '
                  'in profit nets 7.64 a share against the rule&rsquo;s 9.84. A stop at '
                  'a quarter of an R, which is 0.3861 a share, nets 3.94.</p>\n'
                  '      <p>Run both at once, taking whichever exit is reached first on '
                  'each trade. Trade 1 reaches its stop at bar 7 before any profitable '
                  'close, for &minus;0.50. Trade 2 closes at 106.7 on bar 10, three '
                  'dollars up, before reaching its stop at bar 12. The other five behave '
                  'as they did under the target alone: +0.40, +0.40, &minus;0.30, +1.30 '
                  'and +1.00.</p>\n',
            ask='What do the two habits cost separately, what would they cost added, and '
                'what do they actually cost together?',
            result='2.20 and 5.90 separately, 8.10 added, and 5.40 together &mdash; a '
                   'gap of 2.70 a share.',
            answer='      <p>Separately: 9.84 &minus; 7.64 = 2.20 for the target, and '
                   '9.84 &minus; 3.94 = 5.90 for the stop. Added, 8.10, which would '
                   'leave the record at 1.74.</p>\n'
                   '      <p>Together the seven results are &minus;0.50, +3.00, +0.40, '
                   '+0.40, &minus;0.30, +1.30 and +1.00, totalling 5.30 gross and '
                   '5.30 &minus; 0.861 = 4.439 net. So the pair costs '
                   '9.84 &minus; 4.44 = 5.40, and the gap between the addition and the '
                   'measurement is 2.70 a share.</p>\n'
                   '      <p>The whole of the gap is trade 2. The target leaves it at '
                   '106.7 for +3.00 on bar 10, so when the stop is reached on bar 12 '
                   'there is no position to close. Against the stop running alone, which '
                   'takes it to &minus;0.70, the target saved 3.70 on that trade.</p>\n'
                   '      <p>Costs of this kind do not add, because a habit that changes '
                   'an exit does not take money off a trade &mdash; it replaces the '
                   'trade with a different one, and two of them cannot both replace the '
                   'same trade. The pair is bounded by the worse of the two rather than '
                   'by their sum, and the record ends at 4.44, which is 1.24 below '
                   'simply buying and holding.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether you can hold the entries still. Every question above changed '
          'one thing about what a trader does with seven fixed signals and asked what it '
          'cost, and each answer came out of a column that is not on any statement: the '
          'close after the one you took, the worst close while you held, the size the '
          'previous result chose for you, and the best price that ever showed. The '
          'course spent eighty-five lessons measuring markets on a record small enough '
          'to hold in one hand. This module used the same record and the same arithmetic '
          'to measure the person holding it.</p>\n'
          '      <p>That is the last question in the course. What you take away is not a '
          'system. It is the habit of dividing, of asking what a number is a number of, '
          'of measuring the answer twice &mdash; and of asking, before you believe any '
          'number about your own trading, which column it came from and what the '
          'statement does not print.</p>\n'),

# --------------------------------------------------------------- module 13
dict(
    mod=13, tier='professional', slug='module-13-quiz',
    slots=[91, 92, 93, 94, 95],
    title='Module 13 Quiz: The Book',
    desc='Six computations from the module that measured a book instead of a rule. '
         'Average four rules, sort a year by its best days, subtract the turnover, '
         'measure a worst run, and delete one member to find the book improves.',
    intro='Module 9 measured how alike a book&rsquo;s rules are. This one measured what '
          'the book does: what it earns, where that came from, what it costs to run '
          'and how deep it goes. Six questions, all arithmetic on the same twenty-eight '
          'moves, and the last one spends every column at once to find that three of '
          'the four deletions improve the book.',
    covers='Lessons 91 to 95, and the card of four rules the module has been adding a '
           'column to since its first page.',
    related=[(91, 'the returns the first question averages'),
             (92, 'the sorted year the second question reads'),
             (93, 'the turnover the third question subtracts'),
             (94, 'the worst run the fourth question measures'),
             (95, 'the deletion the last question runs')],
    questions=[
        dict(
            title='Four rules, one book',
            setup='      <p>Lesson 71 picked four moving-average rules chosen not to look '
                  'alike, and lesson 91 ran them over the twenty-eight moves on which every '
                  'rule in lesson 63&rsquo;s grid is defined. This is what each of them made, '
                  'gross, a share.</p>\n'
                  + table(['Rule', 'What it made'],
                          [['2 and 5', '4.90'],
                           ['3 and 10', '3.90'],
                           ['5 and 20', '3.50'],
                           ['8 and 30', '4.10']])
                  + '      <p>The book puts a quarter of the money in each. Over the same '
                    'twenty-eight moves, buying at the first close and selling at the last '
                    'makes 6.60 a share.</p>\n',
            ask='What does the book make, what share of the best member is that, and how '
                'does it compare with holding?',
            result='4.10 a share, 83.7 per cent of the best member&rsquo;s 4.90, and 62.1 '
                   'per cent of holding&rsquo;s 6.60.',
            answer='      <p>An equal-weight book of four is the average of the four: '
                   '(4.90 + 3.90 + 3.50 + 4.10) &divide; 4 = 16.40 &divide; 4 = 4.10 a '
                   'share.</p>\n'
                   '      <p>Against the best of its own members, 4.10 &divide; 4.90 = '
                   '0.8367, so the book kept 83.7 per cent of what the single best rule '
                   'earned. Against the benchmark, 4.10 &divide; 6.60 = 0.6212.</p>\n'
                   '      <p>The averaging is the whole point and it is why lesson 91 found '
                   'the median return flat at every book size from one rule to 253. A book of '
                   'one family cannot earn more than its members average, and the only thing '
                   'it can do is narrow the range around that average.</p>\n'),
        dict(
            title='The three moves',
            setup='      <p>The book&rsquo;s twenty-eight moves, sorted largest first, begin '
                  '1.30, 1.00, 1.00. Its total is 4.10. Seventeen of the twenty-eight are '
                  'positive and total 10.15; eleven are negative and total minus 6.05.</p>\n',
            ask='What share of the result is the best three moves, and what do the other '
                'twenty-five make between them?',
            result='80.5 per cent, and the other twenty-five make 0.80.',
            answer='      <p>The best three sum to 1.30 + 1.00 + 1.00 = 3.30, and 3.30 '
                   '&divide; 4.10 = 0.8049, so 80.5 per cent.</p>\n'
                   '      <p>The rest is subtraction: 4.10 &minus; 3.30 = 0.80 across '
                   'twenty-five moves, which is 0.032 a move against a bar-to-bar standard '
                   'deviation of 1.5443.</p>\n'
                   '      <p>The check worth doing is the benchmark&rsquo;s. Holding&rsquo;s '
                   'best three moves are 3.80 of its 6.60, which is 57.6 per cent, so the '
                   'undiversified single position is the less concentrated of the two. Four '
                   'rules did not spread the result over more days; they shrank the total the '
                   'same good days are measured against.</p>\n'),
        dict(
            title='What the turnover takes',
            setup='      <p>A round trip costs 0.1230 a share. Over the twenty-eight moves the '
                  'four rules change position this many times, and each carries a quarter of '
                  'the book.</p>\n'
                  + table(['Rule', 'Gross', 'Position changes'],
                          [['2 and 5', '4.90', '9'],
                           ['3 and 10', '3.90', '2'],
                           ['5 and 20', '3.50', '1'],
                           ['8 and 30', '4.10', '1']]),
            ask='What does each rule net, which of the four finishes first, and what does '
                'the book net?',
            result='3.79, 3.65, 3.38 and 3.98. The 8-and-30 finishes first, and the book '
                   'nets 3.7002.',
            answer='      <p>Charge each rule its own turnover at the full round trip: 9 '
                   '&times; 0.1230 = 1.1070, 2 &times; 0.1230 = 0.2460, and 0.1230 for each '
                   'of the two that change once. Subtract from the gross: 3.7930, 3.6540, '
                   '3.3770 and 3.9770.</p>\n'
                   '      <p>The ranking inverts. The 2-and-5 is the best of the four gross by '
                   'a full dollar and finishes second, because it makes nine of the '
                   'book&rsquo;s thirteen changes, which is 69.2 per cent of the turnover for '
                   '29.9 per cent of the gross return. The 8-and-30 was third gross and '
                   'finishes first, keeping 97.0 per cent of what it earned against the fast '
                   'rule&rsquo;s 77.4 per cent.</p>\n'
                   '      <p>The book pays the same thirteen changes on a quarter of the money '
                   'each: 13 &times; 0.1230 &divide; 4 = 0.3997, so 4.10 &minus; 0.3997 = '
                   '3.7002.</p>\n'),
        dict(
            title='The worst run',
            setup='      <p>The book&rsquo;s worst three consecutive moves run from bar 36 to '
                  'bar 39, where the price goes 103.4, 103.1, 102.4, 101.3. On the first two '
                  'the 8-and-30 rule is flat and the other three are long; on the third all '
                  'four are long.</p>\n',
            ask='What is the book&rsquo;s worst run, what is a fully long position&rsquo;s, '
                'and what did the diversification buy?',
            result='1.85 a share against 2.10, so the whole benefit is 0.25.',
            answer='      <p>The three moves lose 0.30, 0.70 and 1.10, so anything long '
                   'throughout loses 2.10, which is 1.360 of an R at 1.5443 a share. That is '
                   'what holding loses, what the best rule in the whole grid loses, and what '
                   'three of the four members lose.</p>\n'
                   '      <p>The book has three quarters of its money long for the first two '
                   'moves and all of it for the third: 0.75 &times; 0.30 = 0.225, then 0.75 '
                   '&times; 0.70 = 0.525, then the full 1.100. That totals 1.85, or 1.198 of '
                   'an R.</p>\n'
                   '      <p>So the entire diversification benefit is 2.10 &minus; 1.85 = 0.25 '
                   'a share, and it is one rule being out of the market for two days. Set that '
                   'beside what it cost: the book kept 88.1 per cent of the pain and 83.7 per '
                   'cent of the return.</p>\n'),
        dict(
            title='The rule that does not trade',
            setup='      <p>Across all 253 rules over the same twenty-eight moves, the best on '
                  'gross return is a 9-bar average against a 10, at 7.00 a share, and it '
                  'changes position six times. One rule in the grid, a 3-bar average against a '
                  '12, changes position not at all: it is long from the first move to the last. '
                  'It makes 6.60 gross.</p>\n',
            ask='Which of the two is better after costs, and what is the second one '
                'equivalent to?',
            result='6.60 against 6.262, so the rule that never trades wins, and it is '
                   'buying and holding.',
            answer='      <p>The 9-and-10 pays 6 &times; 0.1230 = 0.738, so 7.00 &minus; 0.738 '
                   '= 6.262. The 3-and-12 pays nothing at all inside the window and keeps its '
                   '6.60.</p>\n'
                   '      <p>A rule that is long from bar 31 to bar 59 and never changes is '
                   'holding a position from bar 31 to bar 59, which is exactly the benchmark. '
                   'Its 6.60 is the benchmark&rsquo;s 6.60 because it is the same trade.</p>\n'
                   '      <p>The point is about the accounting rather than about that rule. A '
                   'grid searched on gross return hands you the rule with the most turnover in '
                   'it, because on this data turnover and gross return move together and only '
                   'one of the two is being maximised.</p>\n'),
        dict(
            title='Delete one member',
            setup='      <p>Here is the finished card for the four-rule book and for the book '
                  'with the 5-and-20 removed, over the same twenty-eight moves.</p>\n'
                  + table(['Book', 'Net', 'Worst run'],
                          [['All four', '3.7002', '1.85'],
                           ['Without 5 and 20', '3.8080', '1.77']]),
            ask='What does each book return for each unit of depth, how much does the '
                'deletion improve it, and what does the 8-and-30 alone return on the same '
                'measure?',
            result='2.000 and 2.155, an improvement of 7.8 per cent, against 3.615 for the '
                   'single rule.',
            answer='      <p>Divide the net by the worst run: 3.7002 &divide; 1.85 = 2.000 and '
                   '3.8080 &divide; 1.77 = 2.155. The deletion raises the ratio by 2.155 '
                   '&divide; 2.000 &minus; 1 = 7.8 per cent, and it raises the net return at '
                   'the same time, so nothing was traded away for it.</p>\n'
                   '      <p>The 8-and-30 run alone nets 3.9770 on a worst run of 1.10, which '
                   'is 3.615. It beats the four-rule book and every three-rule book you can '
                   'make out of it, on net return, on turnover and on depth at once.</p>\n'
                   '      <p>Three of the four deletions improve the book and the fourth, '
                   'removing the 8-and-30, is the only one that makes it worse, at 1.718. The '
                   'member the return column ranked third is the one the book cannot afford to '
                   'lose, and it takes all four columns to see it.</p>\n'),
    ],
    close_head='What this quiz was testing',
    close='      <p>Whether a book can be told apart from its parts. Every question above handed '
            'you the same four rules and asked one more thing of them, and the answer changed '
            'each time: the return column preferred the fastest rule, the turnover column '
            'reversed that, the depth column reversed it again, and the concentration column '
            'said the whole ranking rests on three moves out of twenty-eight. A single number '
            'about a book cannot survive any of those four questions being asked.</p>\n'
            '<p>What you take away is the card rather than the verdict. Four columns, one row '
            'per rule and one for the book, and a deletion test that asks whether any member '
            'beats the whole. On this data one of them does, on every column at once, and it '
            'is the rule that trades least.</p>\n'),

]

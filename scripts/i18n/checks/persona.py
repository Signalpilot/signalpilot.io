# -*- coding: utf-8 -*-
"""Sixth check: the lesson's persona must survive into every string that names her.

A translation can pass the locked-term, number, script and doubled-word checks
and still call the protagonist by the wrong name — Nina's case study rendered
with lesson 20's Monica, say. Nothing else can see that: the name is not a
locked term, it carries no digits, and in Cyrillic or kana it is not English
residue either.

So derive the persona's spelling in each language from the lesson itself.
Collect every string whose English names her, keep the word stems those
translations share and that the rest of the lesson does not use, then flag any
naming string whose translation carries none of them.
"""
import os, re, sys, glob, collections, unicodedata
import ctx

# Only two patterns identify a persona precisely enough to check against:
# a possessive ("Nina's account") and the byline the lessons all use.
PRODUCTS = {'Signal', 'Pilot', 'Janus', 'Atlas', 'Plutus', 'Flow', 'Volume',
            'Oracle', 'Pentarch', 'Omnideck', 'Augury', 'Grid', 'Harmonic',
            'Oscillator', 'TradingView', 'Discord', 'Pine', 'Script', 'Binance',
            'Fed', 'Level', 'Market', 'Order', 'Book', 'Spread', 'Stop'}
# "Here's", "Let's", "What's" are contractions, not possessives.
CONTRACTIONS = {'Here', 'Let', 'What', 'That', 'There', 'This', 'Who', 'How',
                'Where', 'When', 'She', 'They', 'You', 'One', 'Today', 'Now',
                'Everyone', 'Someone', 'Nobody', 'Everybody', 'Something',
                'Nothing', 'Anything', 'Life', 'Time', 'Price', 'Whatever'}
# A capitalised word before an apostrophe is usually a name, but headings are
# full of "Friday's winning trade" and "The Week's Story". Calendar words and
# the nouns these lessons title their sections with are never the protagonist.
CALENDAR = {'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
            'Sunday', 'January', 'February', 'March', 'April', 'June', 'July',
            'August', 'September', 'October', 'November', 'December',
            'Week', 'Month', 'Year', 'Morning', 'Afternoon', 'Evening',
            'Night', 'Session', 'Quarter', 'Yesterday', 'Tomorrow'}
HEADINGS = {'Disaster', 'Recovery', 'Result', 'Results', 'Journal', 'Account',
            'Lesson', 'Trade', 'Trader', 'Chart', 'Setup', 'Strategy',
            'Reality', 'Theory', 'Profile', 'Volume', 'Delta', 'Story',
            'Pattern', 'Rule', 'System', 'Mistake', 'Aftermath', 'Recap',
            'Institution', 'Institutions', 'Opponent', 'Opponents', 'Prisoner',
            'Prisoners', 'Retail', 'Buyer', 'Buyers', 'Seller', 'Sellers',
            'Dealer', 'Dealers', 'Player', 'Players',
            # Common nouns that lead a sentence and so look like a capitalised
            # name. German capitalises every noun, so "Bot"/"Bots" appears in
            # hundreds of non-naming strings there and drowns its own n-grams.
            'Bot', 'Bots', 'Whale', 'Whales', 'Token', 'Tokens', 'Pool', 'Pools',
            # The tape is a thing, not a person, and the lessons write
            # "the Tape's warning signs" often enough to look like one.
            'Tape', 'Ladder', 'Book', 'Print', 'Prints', 'Wall', 'Walls',
            'Volatility', 'Gamma', 'Vanna', 'Charm', 'Citadel', 'Friday', 'Today'}
# Asset and instrument names take possessives too -- "Check Gold's move",
# "the divergence resolves toward DXY's direction" -- and are never the
# protagonist of a case study.
# Methods named after the people who described them. They take possessives
# ("Wyckoff's accumulation phase") but they are technical vocabulary, not the
# protagonist of a case study, and every locale transliterates them freely.
METHODS = {'Wyckoff', 'Fibonacci', 'Elliott', 'Gann', 'Dow', 'Kelly',
           'Sharpe', 'Sortino', 'Bollinger', 'Keltner', 'Donchian',
           'Markowitz', 'Black', 'Scholes', 'Merton', 'Ichimoku'}
ASSETS = {'Gold', 'Oil', 'Bitcoin', 'Crypto', 'Nasdaq', 'Dollar', 'Bonds',
          'Bond', 'Yields', 'Yield', 'Equities', 'Futures', 'Treasury',
          'Treasuries', 'Copper', 'Silver', 'Energy', 'Tech'}
HEADINGS |= ASSETS | METHODS
PRODUCTS |= CALENDAR | HEADINGS
PRODUCTS |= CONTRACTIONS
def analyse(SRC):
  cand = set(re.findall(r"\b([A-Z][a-z]{2,})'s\b", SRC))
  # a name already ending in s takes a bare apostrophe: "Carlos' account"
  cand |= set(re.findall(r"\b([A-Z][a-z]+s)'(?!s)", SRC))
  cand |= set(re.findall(r"\b([A-Z][a-z]{2,})(?:\s+[A-Z][a-z]+)?\s*\(composite", SRC))
  BYLINE_FIRST = set(re.findall(r"\b([A-Z][a-z]{2,})(?:\s+[A-Z][a-z]+)?\s*\(composite", SRC))


  def is_person(n):
      if n in PRODUCTS or SRC.count(n) < 2:
          return False
      # A lesson that writes "Eric Thompson (composite example)" has already told
      # us who the protagonist is. The bigram test below would drop him for the
      # crime of being given his surname three times, and the check would then
      # silently verify nothing at all.
      if n in BYLINE_FIRST:
          return True
      # A persona is a bare first name. A word that keeps company with the SAME
      # capitalised word throughout the lesson is part of a term, not a person:
      # "London Kill Zone", "Position Sizing", "Dark Index". A person's name is
      # followed by varied words -- "Carlos Martinez", "Carlos Learned" -- so
      # count the commonest bigram, not every bigram.
      def top_bigram(pat):
          hits = re.findall(pat, SRC)
          return max(collections.Counter(hits).values(), default=0)
      if top_bigram(rf'\b{n} ([A-Z][a-z]+)') >= 3:
          return False
      if top_bigram(rf'([A-Z][a-z]+) {n}\b') >= 3:
          return False
      return True

  personas = sorted(n for n in cand if is_person(n))

  # Japanese and Chinese have no word boundaries, so match on character n-grams
  # instead of tokens. That also absorbs Russian case endings for free: the stem
  # "Нин" is an n-gram shared by Нина, Нины and Нине.
  LETTERS = re.compile(r"[^\W\d_]+", re.UNICODE)

  def grams(text, lo=3, hi=8):
      out = set()
      for run in LETTERS.findall(text):
          for n in range(lo, min(hi, len(run)) + 1):
              for i in range(len(run) - n + 1):
                  out.add(run[i:i + n])
      return out

  # The name check above only sees the first name, so a case study can still be
  # shipped with a DIFFERENT lesson's surname attached -- "Jordan Martinez" where
  # the byline says Jordan Mitchell. Collect every persona name the curriculum
  # uses, drop the ones this lesson is entitled to, and flag the rest wherever
  # they surface in a translation. Latin-script locales keep the spelling, so a
  # diacritic-folded substring match finds them.
  BYLINE = re.compile(r"\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\s*\(composite")

  def nomark(t):
      return ''.join(c for c in unicodedata.normalize('NFD', t)
                     if not unicodedata.combining(c))


  def fold(t):
      return nomark(t).lower()

  foreign = set()
  for page in glob.glob('education/curriculum/*/*.html'):
      for first, last in BYLINE.findall(open(page, encoding='utf-8').read()):
          foreign |= {first, last}
  mine = set()
  for first, last in BYLINE.findall(SRC):
      mine |= {first, last}
  mine |= set(personas)
  foreign = {n for n in foreign
             if n not in mine and len(n) > 4 and not re.search(rf'\b{n}\b', SRC)}
  # A bare substring match is too loose for Latin script: "Chang" hides inside
  # French "echange". Demand a letter boundary, which CJK text satisfies for free
  # because the neighbouring characters are never ASCII letters.
  FOREIGN = [(re.compile(rf'(?<![a-z]){fold(n)}(?![a-z])'), n) for n in sorted(foreign)]

  return personas, FOREIGN, grams, LETTERS, fold, nomark


def run(slug, report=print):
    KEYS = ctx.keys(slug)
    SRC = '\n'.join(KEYS)
    personas, FOREIGN, grams, LETTERS, fold, nomark = analyse(SRC)
    bad_total = 0
    for lang, ps in ctx.pairs(slug):
        d = dict(ps)
        keys = [k for k in KEYS if k in d]
        hits = []
        for p in personas:
            named = [k for k in keys if re.search(rf'\b{p}\b', k)]
            others = [k for k in keys if k not in named]
            if len(named) < 2:
                continue
            # Draw candidate grams from the several shortest naming
            # strings, not just the shortest one. An inline tag can split
            # a heading into a bare "Mark's", whose translation is two
            # letters long and contains no name at all -- and every gram
            # the check would test then comes from that fragment.
            short = sorted((d[k] for k in named), key=len)[:5]
            # A short name can hide inside an unrelated word -- Arabic "نينا"
            # sits in "تهانينا" (congratulations) -- so allow a little
            # background noise rather than demanding the n-gram be unique to
            # the naming strings.
            noise = max(1, len(others) * 0.01)

            def survivors(matchers):
                # A gram that names EVERY case-study string has earned a wider
                # noise allowance: Japanese writes "checklist" as チェックリスト,
                # which contains クリス (Chris), so the name itself would
                # otherwise be thrown out as background and only the inflected
                # grams survive -- flagging every string that follows the name
                # with anything else.
                out = []
                for m in matchers:
                    hit = sum(m(d[k]) for k in named)
                    if hit < max(2, len(named) * 0.4):
                        continue
                    other = sum(m(d[k]) for k in others)
                    allow = noise if hit < len(named) else max(noise, len(others) * 0.05)
                    if other <= allow:
                        out.append(m)
                        continue
                    # A whole page carries words that contain the name by
                    # accident -- Spanish "Market" contains "Mark" -- and with
                    # every string in scope those swamp a fixed allowance. A
                    # gram that names nearly every case-study string and is
                    # three times rarer elsewhere is still the name.
                    if (hit / len(named) >= 0.9
                            and other / max(1, len(others)) <= hit / len(named) / 3):
                        out.append(m)
                return out

            def keepers(lo):
                gs = set().union(*(grams(t, lo=lo) for t in short))
                return survivors([(lambda t, g=g: g in t) for g in gs])

            # Arabic writes Sarah as سارة, which sits inside خسارة (loss) -- a
            # word a trading lesson uses on every other line, so every n-gram of
            # the name drowns in noise. Matching the name as a whole word
            # rescues it, at the cost of the inflection tolerance n-grams buy,
            # so only try it last.
            def keepers_word():
                runs = {r for t in short for r in LETTERS.findall(t) if len(r) > 2}
                return survivors([(lambda t, r=r: bool(re.search(rf'(?<!\w){re.escape(r)}(?!\w)', t)))
                                  for r in runs])

            # Japanese writes some first names in two kana -- Sarah is サラ --
            # so a three-character n-gram cannot exist. Fall back to two only
            # when three finds nothing. Union, not first-hit: every matcher here
            # already had to clear the noise filter, so adding one can only
            # rescue a naming string a narrower matcher missed. A wrong name
            # still fails all three, which is the defect this check catches.
            keep = keepers(3) + keepers(2) + keepers_word()
            if not keep:
                report(f'  {lang}: persona "{p}" has no rendering anywhere')
                bad_total += 1
                continue
            for k in named:
                # An inline tag can cut a sentence just after the possessive,
                # leaving a segment that is nothing but "Mark's ". Word order
                # moves the name into the next segment -- Spanish renders the
                # pair as "El 55 % de acierto de Mark" -- so the fragment's own
                # translation is an article and carries no name by design.
                if len(d[k]) < 12:
                    continue
                if not any(m(d[k]) for m in keep):
                    hits.append((p, k, d[k]))
        # A foreign persona's surname can also be an ordinary noun in the
        # target language: Spanish writes "microwave towers" as "torres de
        # microondas". A surname is capitalised wherever it appears; a common
        # noun is not, so a single lowercase occurrence anywhere on the page
        # identifies the false positive. Scripts without case never produce one.
        plain = '\n'.join(nomark(d[k]) for k in keys)
        common = {name for _, name in FOREIGN
                  if re.search(rf'(?<![A-Za-z]){name.lower()}(?![A-Za-z])', plain)}
        for k in keys:
            low = fold(d[k])
            for pat, name in FOREIGN:
                if name in common:
                    continue
                if pat.search(low):
                    hits.append((f"{name} (another lesson's persona)", k, d[k]))
                    break
        for p, k, v in hits[:6]:
            report(f'  {lang}: "{p}" missing from -> {v[:95]}')
            report(f'          English -> {k[:95]}')
        bad_total += len(hits)
    return bad_total


if __name__ == '__main__':
    sys.exit(1 if run(sys.argv[1]) else 0)

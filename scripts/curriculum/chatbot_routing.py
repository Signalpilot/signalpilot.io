# -*- coding: utf-8 -*-
"""Hold the chatbot's trigger words to the questions they are meant to answer.

    python3 scripts/curriculum/chatbot_routing.py

The widget picks an answer by matching typed words in order, first hit wins.
That makes it easy to break silently: add a trigger like "cost" to one topic
and every question mentioning a cost stops reaching the topic it belongs to.
Nothing about the file looks wrong afterwards.

So the questions a reader actually asks are written down here with the answer
each should reach, and the match order is replayed exactly as chatbot.js
replays it: the language's own keyword lists first, in insertion order, then
the English regexes underneath.
"""
import os, re, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

EN_REGEX = [
    (r'^(help|what can you do|commands|menu)$', 'help'),
    (r'(what are you|who are you|are you (a |an )?(bot|ai|human))', 'chatbot'),
    (r'\b(rsi|relative strength|overbought|oversold)\b', 'rsi'),
    (r'(spread|bid.ask|market maker|liquidity cost)', 'spread'),
    (r'\b(automation|automate|api|kill switch|paper trad\w*|backtest\w*|webhook\w*|bots?)\b', 'automation'),
    (r'(progress|track my|completion|streak|badge)', 'progress'),
    (r'(where (do|should) i (start|begin)|how do i start|getting started|get started|learning path|study plan|first lesson)', 'start'),
    (r'(curriculum|all lessons|lesson list|tiers|structure|syllabus)', 'curriculum'),
    (r'(beginner|foundation|tier 1|tier 2|basics?)', 'beginner'),
    (r'(intermediate|order flow|microstructure|tier 3|tier 4)', 'intermediate'),
    (r'(advanced|professional|tier 5|tier 6|tier 7)', 'advanced'),
    (r'(lesson|lessons|course|content|what.*learn)', 'lessons'),
]

CASES = [
    ('What should I learn first?', 'start'),
    ('where do i start', 'start'),
    ('Beginner lessons', 'beginner'),
    ('show me the curriculum', 'curriculum'),
    ('professional tier', 'professional'),
    ('Explain RSI', 'rsi'),
    ('what is an indicator', 'indicators'),
    ('how much does trading cost', 'cost'),
    ('what are the commission and financing charges', 'cost'),
    ('position sizing and risk of ruin', 'risk'),
    ('how many trades until I know', 'expectancy'),
    ('what is the order book', 'orderbook'),
    ('delta and footprint charts', 'orderflow'),
    ('are stop hunts real', 'sweep'),
    ('what is market structure', 'structure'),
    ('what does divergence mean', 'divergence'),
    ('trending or ranging', 'regime'),
    ('how do I backtest properly', 'backtest'),
    ('what is overfitting', 'overfitting'),
    ('portfolio correlation', 'portfolio'),
    ('the book of rules', 'book'),
    ('can I trade for a living', 'business'),
    ('trading psychology', 'psychology'),
    ('do you have worksheets', 'worksheets'),
    ('glossary', 'glossary'),
    ('is this available in German', 'languages'),
    ('Trading automation', 'automation'),
    ('my progress', 'progress'),
    ('what are you', 'chatbot'),
    ('help', 'help'),
]


def route(msg, keys):
    for topic, words in keys.items():
        alt = '|'.join(re.escape(w) for w in words)
        if re.search('(%s)' % alt, msg, re.I):
            return topic
    for pat, topic in EN_REGEX:
        if re.search(pat, msg, re.I):
            return topic
    return 'default'


def main():
    d = json.load(open('scripts/i18n/chatbot/en.json', encoding='utf-8'))
    keys, kb = d['keys'], d['kb']
    bad = []
    for msg, want in CASES:
        got = route(msg, keys)
        if got != want:
            bad.append((msg, want, got))
    for topic in keys:
        if topic not in kb:
            bad.append(('(trigger list)', topic, 'has no answer'))
    for msg, want, got in bad:
        print('  %-46s wanted %-12s got %s' % (msg[:46], want, got))
    print('%d of %d questions route as intended; %d answers, %d trigger lists'
          % (len(CASES) - len([b for b in bad if b[0] != '(trigger list)']),
             len(CASES), len(kb), len(keys)))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())

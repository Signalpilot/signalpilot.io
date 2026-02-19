#!/usr/bin/env python3
"""
Content Queue Humanizer — Phase 1: Filler Removal + Phase 2-6: Voice Improvements

This script:
1. Strips ~476 embedded filler sentences from tweets
2. De-duplicates recycled second-tweet credibility lines
3. Replaces recycled hooks with content-aligned alternatives
4. Varies CTA patterns across posts
5. Softens robotic language patterns
6. Validates output integrity (same post count, no empty tweets, no broken links)
"""

import json
import re
import hashlib
import random
import copy
import sys

random.seed(42)  # Reproducible results

INPUT_FILE = 'data/social/content-queue.json'

# ===================================================================
# PHASE 1: FILLER SENTENCES TO STRIP
# ===================================================================

FILLER_SENTENCES = [
    "3+ confluences = high-probability. Fewer = skip the trade.",
    "Use 1% account risk per trade as your baseline.",
    "Use this framework before your next trading session.",
    "Place your stop 1 ATR below the signal bar.",
    "Check your risk before every trade — make it automatic.",
    "Check your risk before every trade -- make it automatic.",
    "Log: entry reason, exit reason, emotion, lesson learned.",
    "Check volume on the breakout bar — above average confirms conviction.",
    "Check volume on the breakout bar -- above average confirms conviction.",
    "The best traders spend 80% of their time waiting.",
    "Use a pre-trade checklist to bypass emotional decisions.",
    "TD at a swing low + rising volume = high-probability reversal.",
    "Use momentum confirmation before entering — don't front-run.",
    "Use momentum confirmation before entering -- don't front-run.",
    "Rule: never risk more than 1-2% of capital per trade.",
    "Set your entry at the first higher low after the sweep.",
    "Accumulation → Markup → Distribution → Markdown. Repeat.",
    "Education before execution. Always.",
    "Look for this within the first 15 minutes of a session.",
    "Combine this with volume confirmation for stronger signals.",
    "Always check the higher timeframe first.",
    "Never risk more than you can afford to learn from.",
    "The goal isn't to be right. It's to be profitable.",
    "Risk management isn't optional. It's the entire game.",
    "Wait for confirmation. Patience pays.",
    "Don't chase. Let the setup come to you.",
    "Journal every trade. The patterns in your data will surprise you.",
    "More indicators != more clarity. Usually the opposite.",
    "More indicators ≠ more clarity. Usually the opposite.",
    "The market rewards patience and punishes impatience.",
]

# ===================================================================
# PHASE 2: RECYCLED SECOND-TWEET LINES TO REPLACE
# These are generic credibility/filler lines used as tweet[1] openers
# that don't relate to the actual thread content.
# Strategy: Remove the generic line but keep the content after it.
# ===================================================================

RECYCLED_SECOND_TWEET_LINES = [
    "One bad trade can erase 47 good ones.\n\n",
    "One bad trade can erase 47 good ones.",
    "I lost 3 accounts before this concept clicked.\n\n",
    "I lost 3 accounts before this concept clicked.",
    "I lost 3 accounts before anything clicked.\n\n",
    "I lost 3 accounts before anything clicked.",
    "Markets cycle through 5 phases. Most traders only recognize 2.\n\n",
    "Markets cycle through 5 phases. Most traders only recognize 2.",
    "The 200 EMA isn't magic. It's a self-fulfilling prophecy.\n\n",
    "The 200 EMA isn't magic. It's a self-fulfilling prophecy.",
    "The level everyone sees is the level that gets hunted.\n\n",
    "The level everyone sees is the level that gets hunted.",
    "Every profitable trader was a beginner who refused to quit.\n\n",
    "Every profitable trader was a beginner who refused to quit.",
    "This is the framework I use on every single trade.\n\n",
    "This is the framework I use on every single trade.",
    "Save this. You'll reference it every session.\n\n",
    "Save this. You'll reference it every session.",
]

# ===================================================================
# PHASE 3: HOOK REPLACEMENTS
# Map recycled hooks -> contextually appropriate alternatives
# based on post type and content keywords.
# ===================================================================

def generate_hook_for_post(post, original_hook):
    """Generate a content-aligned hook based on the post's title, type, and body."""
    title = post.get('title', '')
    ptype = post.get('type', '')
    pillar = post.get('pillar', '')
    tweets = post.get('twitter', {}).get('tweets', [])
    body_text = ' '.join(tweets[1:3]) if len(tweets) > 1 else ''

    # Don't touch Chronicle, Manifesto, or milestone hooks — they're already good
    if ptype in ('Chronicle', 'Manifesto'):
        return None
    if 'MILESTONE' in title.upper() or 'FINALE' in title.upper():
        return None

    title_lower = title.lower()
    body_lower = body_text.lower()
    combined = title_lower + ' ' + body_lower

    # Build a hook from the actual content
    # Education posts
    if ptype == 'Education':
        if 'wyckoff' in combined:
            return pick_unique([
                "Wyckoff isn't a strategy — it's a lens. Once you see it, you can't unsee it. 🧵",
                "The Wyckoff schematic hides in plain sight on every chart. Here's how to spot it. 🧵",
                "Smart money leaves footprints. Wyckoff teaches you to read them. 🧵",
                "Every chart tells a Wyckoff story. Most traders just can't read it yet. 🧵",
            ])
        if 'ema' in combined or 'moving average' in combined:
            return pick_unique([
                "The EMA doesn't predict anything. That's exactly why it's useful. 🧵",
                "Most traders misuse moving averages. They're context tools, not crystal balls. 🧵",
                "Everyone watches the 200 EMA. That's both its power and its problem. 🧵",
                "Moving averages lag by design. Use them that way. 🧵",
            ])
        if 'volume' in combined:
            return pick_unique([
                "Price tells you what happened. Volume tells you if it mattered. 🧵",
                "A move without volume is a bluff. Here's how to tell the difference. 🧵",
                "Volume doesn't lie, but it does whisper. You have to learn to listen. 🧵",
                "The candle gets the attention. The volume underneath tells the real story. 🧵",
            ])
        if 'risk' in combined or 'position siz' in combined:
            return pick_unique([
                "The traders who survive aren't the smartest. They're the ones who size correctly. 🧵",
                "Your position size is the only thing you fully control. Make it count. 🧵",
                "I didn't start making money until I got serious about how much I was risking. 🧵",
                "Most traders obsess over entries. Survivors obsess over size. 🧵",
            ])
        if 'journal' in combined:
            return pick_unique([
                "Your trade journal knows more about your edge than you do. 🧵",
                "I found my biggest leak in 10 minutes of reviewing my journal. 🧵",
                "The traders who improve fastest all have one thing in common: they journal. 🧵",
                "Your journal isn't a chore. It's your personal trading coach. 🧵",
            ])
        if 'psychology' in combined or 'emotion' in combined or 'discipline' in combined:
            return pick_unique([
                "The hardest part of trading has nothing to do with charts. 🧵",
                "Your strategy doesn't fail. Your discipline does. Here's the difference. 🧵",
                "Nobody talks about the emotional side until it blows up their account. 🧵",
                "Trading psychology isn't soft skills. It's survival skills. 🧵",
            ])
        if 'fibonacci' in combined or 'fib' in combined:
            return pick_unique([
                "Fibonacci levels work because enough people believe they work. That's the whole game. 🧵",
                "Fib retracements aren't magic — they're a shared language the market speaks. 🧵",
                "I used to think Fibonacci was mystical nonsense. Then I watched price react at 0.618. 🧵",
            ])
        if 'liquidity' in combined or 'stop hunt' in combined:
            return pick_unique([
                "Your stop loss isn't just your exit — it's someone else's entry. 🧵",
                "The level where everyone places their stop is the level that gets raided. 🧵",
                "Liquidity sweeps aren't random. They're the engine that drives price. 🧵",
                "Smart money doesn't break support by accident. They need your stops. 🧵",
            ])
        if 'candle' in combined or 'candlestick' in combined:
            return pick_unique([
                "A single candle tells a whole story if you know how to read it. 🧵",
                "Most traders look at candles. Few actually read them. 🧵",
                "The wick tells you where they tried. The body tells you who won. 🧵",
            ])
        if 'divergence' in combined:
            return pick_unique([
                "Price makes a new high but momentum doesn't follow? Pay attention. 🧵",
                "Divergence is the market whispering that something's about to change. 🧵",
                "The disconnect between price and momentum is where the edge lives. 🧵",
            ])
        if 'trend' in combined:
            return pick_unique([
                "The trend isn't your friend. It's your employer. Work with it or get fired. 🧵",
                "Most losses come from fighting the trend. Here's how to stop. 🧵",
                "Trend trading feels boring. That's how you know it works. 🧵",
            ])
        if 'support' in combined or 'resistance' in combined:
            return pick_unique([
                "Support and resistance aren't lines. They're zones of memory. 🧵",
                "The market remembers price levels. That memory creates opportunities. 🧵",
                "A line on a chart isn't a wall. It's a region where decisions cluster. 🧵",
            ])
        if 'gap' in combined:
            return pick_unique([
                "Gaps are the market showing its hand. Learn to read them. 🧵",
                "Not all gaps are created equal. Some signal conviction, others signal exhaustion. 🧵",
            ])
        if 'breakout' in combined:
            return pick_unique([
                "Most breakouts fail. The ones that don't share a few traits. 🧵",
                "The secret to breakout trading: wait for the retest. 🧵",
            ])
        if 'order block' in combined or 'ict' in combined or 'smart money' in combined:
            return pick_unique([
                "Order blocks mark where institutions placed their bets. 🧵",
                "ICT concepts aren't complicated. They're just unfamiliar. Here's the primer. 🧵",
            ])
        if 'session' in combined or 'london' in combined or 'asian' in combined or 'new york' in combined:
            return pick_unique([
                "The market trades differently at 3am vs 10am. Timing matters. 🧵",
                "Each trading session has a personality. Learn it or pay tuition. 🧵",
            ])
        if 'timeframe' in combined or 'multi-timeframe' in combined or 'htf' in combined:
            return pick_unique([
                "The daily chart and the 5-minute chart are telling different stories. Both are true. 🧵",
                "Multi-timeframe analysis isn't optional. It's how you avoid tunnel vision. 🧵",
            ])
        if 'keyboard' in combined or 'shortcut' in combined:
            return pick_unique([
                "The fastest traders aren't clicking menus. Here are the shortcuts that matter. 🧵",
                "TradingView shortcuts that'll save you hours every week. 🧵",
            ])
        if 'pentarch' in combined or 'cycle' in combined:
            return pick_unique([
                "Markets don't trend forever. They cycle. Here's how to read the phase. 🧵",
                "Knowing the cycle phase changes everything about how you trade. 🧵",
                "The signal that fires at the end of a decline is the one most traders miss. 🧵",
            ])

    # Product posts
    if ptype == 'Product':
        if 'pentarch' in combined:
            return pick_unique([
                "One indicator, five cycle phases. Here's what Pentarch actually shows you. 🧵",
                "Pentarch doesn't predict. It classifies. That distinction matters. 🧵",
                "Cycle detection changed how I read every chart. Here's the tool. 🧵",
            ])
        if 'volume oracle' in combined:
            return pick_unique([
                "Same chart, two different regimes. Volume Oracle shows you which one you're in. 🧵",
                "Are you accumulating or distributing? Your strategy depends on the answer. 🧵",
            ])
        if 'omnideck' in combined:
            return pick_unique([
                "One overlay instead of ten cluttered indicators. That's OmniDeck. 🧵",
                "Chart clutter kills clarity. Here's how to simplify without losing information. 🧵",
            ])
        if 'janus' in combined or 'atlas' in combined:
            return pick_unique([
                "The levels that actually matter aren't drawn by hand. 🧵",
                "Automated level detection that adapts to what the chart is doing. 🧵",
            ])
        if 'plutus' in combined or 'flow' in combined:
            return pick_unique([
                "Money flow tells you what price alone can't. 🧵",
                "Following the flow of capital, not the noise of candles. 🧵",
            ])
        if 'harmonic' in combined:
            return pick_unique([
                "Momentum consensus across multiple components. That's the edge. 🧵",
                "One indicator that listens to seven momentum voices at once. 🧵",
            ])
        return pick_unique([
            "Built this because I couldn't find it anywhere else. 🧵",
            "The tool I wished existed when I was learning. 🧵",
        ])

    # Blog posts
    if ptype == 'Blog':
        if 'emotion' in combined or 'psychology' in combined or 'detach' in combined:
            return pick_unique([
                "The hardest trading skill isn't technical. It's emotional. 🧵",
                "I trade better when I care less. That sounds wrong, but it's not. 🧵",
                "Emotional discipline isn't about feeling nothing. It's about acting despite feelings. 🧵",
            ])
        if 'overtrad' in combined:
            return pick_unique([
                "The best trade I took last week? The one I didn't take. 🧵",
                "Overtrading feels productive. It's the opposite. 🧵",
            ])
        if 'indicator' in combined:
            return pick_unique([
                "Indicators don't fail. Our expectations of them do. 🧵",
                "The problem isn't your indicators. It's how you're using them. 🧵",
            ])
        if 'backtest' in combined:
            return pick_unique([
                "Backtesting isn't about proving your strategy works. It's about finding where it breaks. 🧵",
                "A strategy that isn't backtested is just a hunch with extra steps. 🧵",
            ])
        if 'loss' in combined or 'losing' in combined:
            return pick_unique([
                "Learning to lose well is the skill nobody teaches. 🧵",
                "My best losing trade taught me more than my best winner. 🧵",
            ])
        return pick_unique([
            "Something I wish I'd understood sooner. 🧵",
            "A lesson that took me too long to learn. 🧵",
            "This changed how I think about trading. 🧵",
        ])

    # Quote posts
    if ptype == 'Quote':
        return pick_unique([
            "A line that stopped me mid-scroll. 🧵",
            "Read this once. Then read it again slower. 🧵",
            "Some ideas need to sit with you for a while. 🧵",
            "Words I keep coming back to. 🧵",
            "This one landed differently the second time I read it. 🧵",
            "Saved this months ago. Still hits. 🧵",
            "Short quote, long shelf life. 🧵",
        ])

    # Marketing posts
    if ptype == 'Marketing':
        return pick_unique([
            "Here's what we built and why. 🧵",
            "Quick update on what's happening at Signal Pilot. 🧵",
        ])

    # Docs posts
    if ptype == 'Docs':
        if 'troubleshoot' in combined:
            return pick_unique([
                "Indicator acting weird? Here's the 2-minute fix. 🧵",
                "Before you message support, try these. 90% of issues resolve instantly. 🧵",
            ])
        if 'quick start' in combined or 'getting started' in combined:
            return pick_unique([
                "New to Signal Pilot? Start here. 5 minutes to setup. 🧵",
                "Your first 5 minutes with Signal Pilot. No fluff, just setup. 🧵",
            ])
        if 'best practice' in combined:
            return pick_unique([
                "The habits that separate traders who use tools well from those who don't. 🧵",
                "Getting the most from your indicators comes down to a few simple habits. 🧵",
            ])
        if 'stack' in combined:
            return pick_unique([
                "Which indicators work together — and which ones overlap. 🧵",
                "More indicators isn't better. The right combination is. 🧵",
            ])
        if 'setting' in combined:
            return pick_unique([
                "Default settings work. Custom settings work better. Here's how to dial them in. 🧵",
                "Every trader is different. Your indicator settings should be too. 🧵",
            ])
        if 'contact' in combined or 'support' in combined:
            return pick_unique([
                "Need help? Here's how to reach us (and what gets the fastest response). 🧵",
                "We actually respond to every message. Here's where to find us. 🧵",
            ])
        return pick_unique([
            "Reference guide you'll want bookmarked. 🧵",
            "Quick reference — save this for later. 🧵",
        ])

    return None  # Don't change hooks we can't improve


# Track used hooks to avoid repetition
_used_hooks = set()

def pick_unique(options):
    """Pick a hook that hasn't been used yet. Fall back to least-used if all used."""
    available = [h for h in options if h not in _used_hooks]
    if not available:
        _used_hooks.clear()
        available = options
    choice = random.choice(available)
    _used_hooks.add(choice)
    return choice


# ===================================================================
# PHASE 4: CTA VARIATION
# ===================================================================

CTA_TEMPLATES_BY_TYPE = {
    'Education': [
        "Free lesson on this: {link}\n\nWhat concept gave you the most trouble starting out?",
        "Full breakdown here: {link}\n\nDrop a question below — happy to dig deeper.",
        "Deep dive: {link}\n\nBookmark this. You'll want it mid-session.",
        "Lesson link: {link}\n\nWhich part of this do you want me to expand on?",
        "Full lesson (free): {link}",
        "Read the full lesson: {link}\n\nShare with someone still learning.",
    ],
    'Product': [
        "See it in action: {link}\n\nTry it on your favorite chart. You'll see it immediately.",
        "Free on TradingView: {link}\n\nWhat do you want to see from it first?",
        "Try it yourself: {link}\n\nLet me know what you notice.",
        "Link to the indicator: {link}\n\nAdd it, sit with it for a few days. Don't rush.",
        "Grab it (free): {link}",
    ],
    'Blog': [
        "Full article: {link}\n\nWhat's the biggest lesson you've learned the hard way?",
        "Read the full post: {link}\n\nDoes any of this resonate?",
        "More here: {link}\n\nSave it for a rough trading day.",
        "Full read: {link}",
    ],
    'Quote': [
        "More on this idea: {link}\n\nWhat quote changed your trading?",
        "Related lesson: {link}\n\nDoes this ring true for you?",
        "Explore further: {link}\n\nSometimes the simplest ideas hit hardest.",
        "Dive deeper: {link}",
    ],
    'Chronicle': [
        "The journey continues: {link}\n\nWhich of the Seven speaks to your trading style?",
        "Full Chronicle: {link}\n\nThe mythology mirrors the methodology.",
        "Explore the lore: {link}",
    ],
    'Marketing': [
        "Start here: {link}\n\nWhat would help you most right now?",
        "Everything's free: {link}\n\nNo catches. Seriously.",
        "See for yourself: {link}",
    ],
    'Docs': [
        "Full guide: {link}\n\nBookmark it — you'll reference this often.",
        "Documentation: {link}\n\nQuestions? We respond to everything.",
        "Complete reference: {link}",
    ],
}

_used_ctas = {}

def generate_cta(post_type, links):
    """Generate a varied CTA for the given post type with actual links."""
    templates = CTA_TEMPLATES_BY_TYPE.get(post_type, CTA_TEMPLATES_BY_TYPE['Education'])

    if post_type not in _used_ctas:
        _used_ctas[post_type] = 0

    idx = _used_ctas[post_type] % len(templates)
    _used_ctas[post_type] += 1
    template = templates[idx]

    # Build the link string from extracted links
    if links:
        link_str = '\n'.join(links)
    else:
        link_str = 'https://signalpilot.io'

    return template.format(link=link_str)


def extract_links(tweet_text):
    """Extract all URLs from a tweet."""
    return re.findall(r'https?://[^\s\)]+', tweet_text)


# ===================================================================
# PHASE 5: LANGUAGE SOFTENING
# ===================================================================

# Robotic patterns to soften (find -> replace)
# Only applied to non-Chronicle, non-Manifesto posts
SOFTENING_RULES = [
    # Remove generic credibility lines when they appear as standalone openers in tweet[1]
    (r'^Key insight: ', ''),  # Strip the formulaic "Key insight:" prefix
    (r'^The words that changed how I read charts:\n\n', ''),

    # "This isn't conspiracy. It's mechanics." - overused
    ("This isn't conspiracy. It's mechanics.", "It's not a conspiracy — it's how markets actually work."),
]


# ===================================================================
# MAIN PROCESSING
# ===================================================================

def process_posts(posts):
    """Apply all humanization phases to the posts."""
    stats = {
        'fillers_removed': 0,
        'second_tweet_cleaned': 0,
        'hooks_replaced': 0,
        'ctas_varied': 0,
        'softening_applied': 0,
        'empty_tweets_removed': 0,
    }

    for post in posts:
        tweets = post.get('twitter', {}).get('tweets', [])
        if not tweets:
            continue

        ptype = post.get('type', '')
        pnum = post.get('postNumber', -1)

        # === PHASE 1: Strip filler sentences ===
        for i in range(len(tweets)):
            original = tweets[i]
            cleaned = original
            for filler in FILLER_SENTENCES:
                if filler in cleaned:
                    cleaned = cleaned.replace(filler, '')
                    stats['fillers_removed'] += 1

            # Clean up whitespace artifacts
            while '\n\n\n' in cleaned:
                cleaned = cleaned.replace('\n\n\n', '\n\n')
            cleaned = cleaned.strip()

            tweets[i] = cleaned

        # === PHASE 2: Clean recycled second-tweet lines ===
        if len(tweets) > 1:
            for recycled in RECYCLED_SECOND_TWEET_LINES:
                if recycled in tweets[1]:
                    tweets[1] = tweets[1].replace(recycled, '').strip()
                    stats['second_tweet_cleaned'] += 1

            # Also handle "Key insight:" and "The words that changed..." prefixes
            if tweets[1].startswith('Key insight: '):
                # Only strip if the rest of the tweet has content
                rest = tweets[1][len('Key insight: '):]
                if rest.strip():
                    tweets[1] = rest.strip()
                    stats['softening_applied'] += 1

            if tweets[1].startswith('The words that changed how I read charts:\n\n'):
                rest = tweets[1][len('The words that changed how I read charts:\n\n'):]
                if rest.strip():
                    tweets[1] = rest.strip()
                    stats['softening_applied'] += 1

            if tweets[1].startswith('The words that changed how I read charts:'):
                rest = tweets[1][len('The words that changed how I read charts:'):]
                if rest.strip():
                    tweets[1] = rest.strip()
                    stats['softening_applied'] += 1

        # === PHASE 3: Replace recycled hooks ===
        if tweets:
            original_hook = tweets[0]
            is_recycled_hook = False

            # Check if this hook matches any of the known recycled patterns
            recycled_hook_patterns = [
                "82 free lessons. Zero paywalls. No excuses left.",
                "Stop trading to be right. Trade to be profitable.",
                "I spent 4 years learning what takes 4 minutes to explain.",
                "80% of my profits came from 20% of trades",
            ]
            for pattern in recycled_hook_patterns:
                if pattern in original_hook:
                    is_recycled_hook = True
                    break

            # Also check "The #1 ... mistake" and "The worst ... mistake" patterns
            if re.match(r'^The #1 \w+ mistake', original_hook):
                is_recycled_hook = True
            if re.match(r'^The worst \w+ mistake', original_hook):
                is_recycled_hook = True
            if re.match(r'^The #1 reason', original_hook):
                is_recycled_hook = True

            # Check for "Stop [verb]ing" hooks that are disconnected from content
            # (only replace if the stop-verb doesn't relate to thread content)
            stop_verb_match = re.match(r'^Stop (\w+ing)', original_hook)
            if stop_verb_match:
                verb = stop_verb_match.group(1).lower()
                body_text = ' '.join(tweets[1:3]).lower() if len(tweets) > 1 else ''
                # If the verb topic isn't discussed in the thread body, it's disconnected
                verb_root = verb.replace('ing', '').replace('ting', 't').replace('ping', 'p')
                if verb_root not in body_text and verb not in body_text:
                    is_recycled_hook = True

            if is_recycled_hook:
                new_hook = generate_hook_for_post(post, original_hook)
                if new_hook:
                    tweets[0] = new_hook
                    stats['hooks_replaced'] += 1

        # === PHASE 4: Vary CTAs (last tweet) ===
        if len(tweets) >= 2:
            last_tweet = tweets[-1]
            links = extract_links(last_tweet)

            # Only replace if it's a generic CTA pattern
            is_generic_cta = False
            generic_cta_markers = [
                "Follow @signaborgs",
                "Free resources in bio",
                "Follow for daily",
                "🔗 https://signalpilot.io\n\nFollow @signaborgs",
            ]
            for marker in generic_cta_markers:
                if marker in last_tweet:
                    is_generic_cta = True
                    break

            # Also detect the formulaic emoji-link-only CTAs
            # (just links with emoji prefixes and nothing else)
            link_only = re.match(
                r'^[📖🔗🎓🛠️💡📝🔮⚙️\s]*(?:(?:Full|Free|See|Read|Start|More|Try|Grab|Link|All|The|Complete|Documentation|Quick|Stacking|Settings|Join|Contact)[\w\s]*:?\s*)?https?://',
                last_tweet
            )

            if is_generic_cta or (link_only and len(last_tweet) < 300):
                new_cta = generate_cta(ptype, links)
                if new_cta:
                    tweets[-1] = new_cta
                    stats['ctas_varied'] += 1

        # === PHASE 5: Language softening ===
        for i in range(len(tweets)):
            original = tweets[i]
            # Apply "This isn't conspiracy" fix
            if "This isn't conspiracy. It's mechanics." in tweets[i]:
                tweets[i] = tweets[i].replace(
                    "This isn't conspiracy. It's mechanics.",
                    "It's not a conspiracy — it's how markets actually work."
                )
                stats['softening_applied'] += 1

        # === CLEANUP: Remove empty tweets ===
        cleaned_tweets = []
        for t in tweets:
            if t.strip():
                cleaned_tweets.append(t)
            else:
                stats['empty_tweets_removed'] += 1
        post['twitter']['tweets'] = cleaned_tweets

    return posts, stats


def validate(original, processed):
    """Validate the processed output hasn't broken anything."""
    errors = []

    if len(original) != len(processed):
        errors.append(f"Post count mismatch: {len(original)} -> {len(processed)}")

    for i, (orig, proc) in enumerate(zip(original, processed)):
        pnum = orig.get('postNumber', i)

        # Check post structure is intact
        if proc.get('postNumber') != pnum:
            errors.append(f"Post {i}: postNumber changed")

        if proc.get('title') != orig.get('title'):
            errors.append(f"Post {pnum}: title changed")

        if proc.get('type') != orig.get('type'):
            errors.append(f"Post {pnum}: type changed")

        # Check twitter tweets exist
        proc_tweets = proc.get('twitter', {}).get('tweets', [])
        if len(proc_tweets) < 2:
            errors.append(f"Post {pnum}: only {len(proc_tweets)} tweets remaining (need >= 2)")

        # Check no tweet is empty
        for j, t in enumerate(proc_tweets):
            if not t.strip():
                errors.append(f"Post {pnum} tweet[{j}]: empty tweet")

        # Check links are preserved in CTA tweet
        orig_tweets = orig.get('twitter', {}).get('tweets', [])
        orig_links = set()
        proc_links = set()
        for t in orig_tweets:
            orig_links.update(extract_links(t))
        for t in proc_tweets:
            proc_links.update(extract_links(t))

        # All original links should still appear somewhere
        missing_links = orig_links - proc_links
        if missing_links:
            # Only warn about signalpilot links — external links in body should be preserved
            sp_missing = [l for l in missing_links if 'signalpilot' in l or 'tradingview' in l]
            if sp_missing:
                errors.append(f"Post {pnum}: lost links: {sp_missing}")

        # Check instagram is untouched
        if proc.get('instagram') != orig.get('instagram'):
            errors.append(f"Post {pnum}: instagram was modified!")

        # Check hashtags are untouched
        if proc.get('hashtags') != orig.get('hashtags'):
            errors.append(f"Post {pnum}: hashtags were modified!")

    return errors


# ===================================================================
# RUN
# ===================================================================

if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv

    with open(INPUT_FILE) as f:
        original_posts = json.load(f)

    # Deep copy for processing
    posts = copy.deepcopy(original_posts)

    processed, stats = process_posts(posts)

    # Validate
    errors = validate(original_posts, processed)

    print("=" * 60)
    print("HUMANIZATION RESULTS")
    print("=" * 60)
    print(f"  Filler sentences removed:    {stats['fillers_removed']}")
    print(f"  Second-tweet lines cleaned:  {stats['second_tweet_cleaned']}")
    print(f"  Hooks replaced:              {stats['hooks_replaced']}")
    print(f"  CTAs varied:                 {stats['ctas_varied']}")
    print(f"  Language softening applied:  {stats['softening_applied']}")
    print(f"  Empty tweets removed:        {stats['empty_tweets_removed']}")
    print()

    if errors:
        print(f"⚠️  VALIDATION ERRORS ({len(errors)}):")
        for e in errors[:30]:
            print(f"  - {e}")
        if len(errors) > 30:
            print(f"  ... and {len(errors) - 30} more")
        print()
        if not dry_run:
            print("NOT writing output due to validation errors.")
            sys.exit(1)
    else:
        print("✅ Validation passed — no structural issues found.")

    if dry_run:
        print("\n[DRY RUN — no files written]")

        # Show 5 before/after examples
        print("\n=== BEFORE / AFTER SAMPLES ===\n")
        sample_indices = [0, 1, 50, 182, 290, 450, 660]
        for idx in sample_indices:
            if idx < len(original_posts):
                orig_tweets = original_posts[idx].get('twitter', {}).get('tweets', [])
                proc_tweets = processed[idx].get('twitter', {}).get('tweets', [])
                title = original_posts[idx].get('title', '')
                ptype = original_posts[idx].get('type', '')

                # Check if anything changed
                if orig_tweets == proc_tweets:
                    continue

                print(f"--- Post {idx}: {title} ({ptype}) ---")
                # Show hook change
                if orig_tweets[0] != proc_tweets[0]:
                    print(f"  HOOK BEFORE: {orig_tweets[0][:100]}")
                    print(f"  HOOK AFTER:  {proc_tweets[0][:100]}")

                # Show any tweet changes
                max_tweets = max(len(orig_tweets), len(proc_tweets))
                for ti in range(1, min(max_tweets, len(orig_tweets))):
                    if ti < len(proc_tweets) and orig_tweets[ti] != proc_tweets[ti]:
                        print(f"  TWEET[{ti}] BEFORE: {orig_tweets[ti][:120]}...")
                        print(f"  TWEET[{ti}] AFTER:  {proc_tweets[ti][:120]}...")

                # Show CTA change
                if orig_tweets[-1] != proc_tweets[-1]:
                    print(f"  CTA BEFORE: {orig_tweets[-1][:120]}")
                    print(f"  CTA AFTER:  {proc_tweets[-1][:120]}")
                print()
    else:
        with open(INPUT_FILE, 'w') as f:
            json.dump(processed, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Written to {INPUT_FILE}")

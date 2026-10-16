---
title: "How to A/B Test Adverts on a Small Budget"
description: "Learn how to A/B test social media adverts on a small South African budget, with a calculator that shows how much traffic and how many rand a fair test needs."
pubDate: 2026-10-16
category: guides
toc: true
tags: ["A/B testing adverts South Africa", "social media ad budget South Africa", "South African agency for AI adverts"]
faqs:
  - q: "What is an A/B test for adverts?"
    a: "An A/B test shows two versions of an advert to similar audiences at the same time, changing only one thing, such as the opening line or the image. You then compare a single result, like clicks or WhatsApp enquiries, to see which version did better."
  - q: "How much budget do I need to A/B test an advert?"
    a: "It depends on how big a difference you want to detect. Detecting a small improvement can need tens of thousands of clicks, while a big improvement can be detected with a few hundred. For example, at a 5% click-to-enquiry rate, spotting a 50% improvement takes roughly 1,500 clicks per version, while spotting a 20% improvement takes roughly 8,000. Use the calculator on this page with your own numbers."
  - q: "How long should an advert test run?"
    a: "At least a full week, and ideally whole weeks, because people behave differently on different days. Decide the end date before you start, and don't stop early because one version looks ahead after two days."
  - q: "What should I test first?"
    a: "Start with the biggest lever: the first three seconds of a video or the main image, then the offer, then the call to action. Change one thing at a time, and make the two versions clearly different, because tiny changes need huge budgets to detect."
  - q: "Can I A/B test with a very small budget?"
    a: "Yes, but test bold differences, such as two completely different hooks or offers, rather than small tweaks. You can also compare a higher-funnel result, like click-through rate, which needs less spend than comparing enquiries or sales."
  - q: "How does Aiadverts help with testing adverts?"
    a: "A Starter package from R3,000 includes one video advert, three images and two revisions, enough to create two different versions to test. Growth, from R8,500 a month, adds weekly posting, which gives you fresh versions to test every week."
---

Most small-business advert tests don't tell you anything. Someone runs two versions for three days, sees one has 12 clicks and the other has 9, and declares a winner. A week later the "winner" performs worse than the loser did.

The problem isn't the idea. Testing is the best way to stop guessing, and AI adverts make it cheaper than ever to produce a second version. The problem is that a test needs a certain amount of data before the result means anything, and a small budget can only buy so much. This guide shows how to work out what your budget can honestly test, with a calculator, and how to run a clean test either way.

> **Key takeaways**
>
> - **Small differences need big budgets.** Detecting a 20% improvement can need several times more traffic than detecting a 50% improvement.
> - **Test bold changes.** Two clearly different hooks or offers beat two near-identical adverts.
> - **Change one thing.** Otherwise you won't know what made the difference.
> - **Run whole weeks and decide the end date up front.** Don't stop when one version gets ahead.
> - **A tie is a result.** If the difference is too small to detect, pick the cheaper or simpler version and move on.

## Why Most Small Tests Fail

Three mistakes account for nearly every useless test:

1. **Too little data.** Results from a few dozen clicks swing wildly. A version can look 50% better purely by luck.
2. **Too many changes.** If version B has a new image, a new headline and a new offer, you can't tell which one moved the result.
3. **Peeking and stopping early.** If you check every day and stop the moment one version leads, you're very likely to stop on a lucky streak.

All three are about patience and planning, not clever tools. A test with a defined question, a defined end date and enough traffic is worth far more than five rushed ones.

## What to Test, in Order

Work from the biggest lever to the smallest:

| Order | What to test | Why it comes first |
|---|---|---|
| 1 | The first three seconds of the video, or the main image | If people don't stop scrolling, nothing else matters. |
| 2 | The offer or main message | A stronger reason to act beats any design tweak. |
| 3 | The call to action | "WhatsApp us" or "Get a quote" can change who responds. |
| 4 | Format and length | A 15-second video versus a 30-second one, or a video versus an image. |
| 5 | Audience | Compare after the advert itself is working. |

Our [video ad sizes guide](/blog/social-media-video-ad-sizes) covers the formats, and our guide on [how to brief an AI advert](/blog/how-to-brief-an-ai-advert-south-africa) explains how to ask for two clearly different versions.

## How Much Traffic Does a Fair Test Need?

The number depends on three things:

- **Your baseline rate.** If 5 in 100 people who click go on to enquire, your baseline is 5%.
- **The improvement you want to detect.** A 50% improvement means 5% becoming 7.5%.
- **How sure you want to be.** The standard is 95% confidence, meaning that if there were no real difference, you'd see a gap this big by chance only about 1 time in 20. The calculator also assumes 80% power, meaning that if the real improvement is at least the size you chose, you'd detect it about 4 times in 5.

As an illustration, if 5% of clicks become enquiries, spotting a 50% improvement takes roughly 1,500 clicks per version, while spotting a 20% improvement takes roughly 8,000. At an assumed R3 per click, that's about R9,000 against about R49,000 in total. The same logic applies to click-through rate, where baselines are much lower and the traffic needed is higher still.

Try it with your own numbers below. All figures are yours to enter, so the defaults are examples only.

<div class="ab" data-ab>
<div class="ab-grid">
<div class="ab-field">
<label for="ab-metric">What are you comparing?</label>
<select id="ab-metric" class="ab-in">
<option value="conv">Enquiries per click</option>
<option value="ctr">Clicks per impression (click-through rate)</option>
</select>
</div>
<div class="ab-field">
<label for="ab-base">Your current rate (%)</label>
<input id="ab-base" class="ab-in" type="number" inputmode="decimal" min="0.1" max="50" step="0.1" value="5">
</div>
<div class="ab-field">
<label for="ab-uplift">Improvement you want to detect (%)</label>
<input id="ab-uplift" class="ab-in" type="number" inputmode="decimal" min="5" max="300" step="5" value="50">
</div>
<div class="ab-field">
<label id="ab-cost-label" for="ab-cost">Cost per click (R)</label>
<input id="ab-cost" class="ab-in" type="number" inputmode="decimal" min="0.01" step="0.01" value="3">
</div>
<div class="ab-field">
<label for="ab-daily">Daily budget for the test (R)</label>
<input id="ab-daily" class="ab-in" type="number" inputmode="decimal" min="10" step="10" value="300">
</div>
<div class="ab-field">
<label for="ab-days">Test length (days)</label>
<input id="ab-days" class="ab-in" type="number" inputmode="numeric" min="1" max="90" step="1" value="14">
</div>
<div class="ab-field">
<label for="ab-conf">Confidence level</label>
<select id="ab-conf" class="ab-in">
<option value="1.645">90%</option>
<option value="1.96" selected>95% (standard)</option>
<option value="2.576">99%</option>
</select>
</div>
</div>
<div class="ab-verdict" aria-live="polite"></div>
<div class="ab-stats"></div>
<div class="ab-detail" aria-live="polite"></div>
<a class="ab-cta" href="https://wa.me/27695600708" target="_blank" rel="noopener noreferrer">Get two advert versions to test</a>
<span class="ab-foot">Uses the standard two-proportion sample-size formula with 80% power, split evenly between two versions. It's a planning guide, not a guarantee, and real results vary with your audience and platform. Enter your own costs from your ads account.</span>
</div>

<style>
.ab{margin:2rem 0;display:flex;flex-direction:column;gap:1rem;padding:1.3rem;border-radius:20px;background:#F8F8F8;border:1px solid rgba(26,58,92,.1)}
.ab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
.ab-field{display:flex;flex-direction:column;gap:.3rem;min-width:0}
.ab-field label{font-size:.8rem;font-weight:800;color:#1A3A5C}
.ab-in{width:100%;box-sizing:border-box;padding:.65rem .8rem;border-radius:10px;border:1px solid rgba(26,58,92,.2);background:#fff;font:inherit;font-size:.92rem;color:#1A1A2E}
.ab-in:focus{outline:2px solid #0066FF;outline-offset:1px}
.ab-in.is-bad{border-color:#FF4D4D;background:rgba(255,77,77,.06)}
.ab-verdict{padding:.85rem 1rem;border-radius:12px;font-size:.92rem;font-weight:700;line-height:1.5;background:#fff;border:1px solid rgba(26,58,92,.1);color:#1A3A5C}
.ab-verdict.ab-v-ok{background:rgba(37,211,102,.12);border-color:rgba(37,211,102,.45);color:#0d6b34}
.ab-verdict.ab-v-close{background:rgba(255,159,28,.14);border-color:rgba(255,159,28,.45);color:#6b4100}
.ab-verdict.ab-v-no{background:rgba(255,77,77,.1);border-color:rgba(255,77,77,.4);color:#7a1717}
.ab-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.ab-stat{display:flex;flex-direction:column;gap:.15rem;padding:.8rem 1rem;border-radius:12px;background:#fff;border:1px solid rgba(26,58,92,.1)}
.ab-stat-n{font-size:1.25rem;font-weight:900;color:#1A3A5C;overflow-wrap:anywhere}
.ab-stat-l{font-size:.76rem;font-weight:700;color:rgba(26,26,46,.6)}
.ab-detail{font-size:.88rem;line-height:1.6;color:rgba(26,26,46,.8)}
.ab-detail strong{color:#1A3A5C}
.blog-prose .ab a.ab-cta{align-self:flex-start;padding:.7rem 1.3rem;border-radius:999px;background:#25D366;color:#fff;font-size:.85rem;font-weight:700;text-decoration:none;box-shadow:0 6px 18px rgba(37,211,102,.3);transition:transform .15s}
.blog-prose .ab a.ab-cta:hover{color:#fff;transform:translateY(-1px)}
.ab-foot{font-size:.76rem;line-height:1.5;color:rgba(26,26,46,.55)}
@media (max-width:640px){.ab{padding:1rem}.ab-grid{grid-template-columns:minmax(0,1fr)}}
</style>

<script>
(function () {
  var root = document.querySelector('[data-ab]');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var metricEl = $('ab-metric'), baseEl = $('ab-base'), upEl = $('ab-uplift'), costEl = $('ab-cost'), costLabel = $('ab-cost-label');
  var dailyEl = $('ab-daily'), daysEl = $('ab-days'), confEl = $('ab-conf');
  var verdictEl = root.querySelector('.ab-verdict');
  var statsEl = root.querySelector('.ab-stats');
  var detailEl = root.querySelector('.ab-detail');
  var cta = root.querySelector('.ab-cta');
  var Z_POWER = 0.8416; // 80% power

  // sample size per variant for a two-sided two-proportion test
  function perVariant(p1, uplift, z) {
    var p2 = Math.min(p1 * (1 + uplift), 0.999);
    var pb = (p1 + p2) / 2;
    var a = z * Math.sqrt(2 * pb * (1 - pb)) + Z_POWER * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
    return Math.ceil((a * a) / ((p2 - p1) * (p2 - p1)));
  }

  // smallest uplift (as a fraction) that the available sample per variant can detect
  function minDetectable(p1, available, z) {
    var lo = 0.01, hi = 5;
    if (perVariant(p1, hi, z) > available) return null;
    if (perVariant(p1, lo, z) <= available) return lo;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      if (perVariant(p1, mid, z) <= available) hi = mid; else lo = mid;
    }
    return hi;
  }

  function num(el, min, max) {
    var v = parseFloat(el.value);
    var bad = !isFinite(v) || v < min || v > max;
    el.classList.toggle('is-bad', bad);
    return bad ? null : v;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-ZA').split(String.fromCharCode(160)).join(',').split(' ').join(','); }
  function rand(n) { return 'R' + fmt(n); }
  function pct(f) { return (f < 0.1 ? Math.round(f * 1000) / 10 : Math.round(f * 100)) + '%'; }

  function render() {
    var isCtr = metricEl.value === 'ctr';
    costLabel.textContent = isCtr ? 'Cost per 1,000 impressions (R)' : 'Cost per click (R)';
    var unit = isCtr ? 'impressions' : 'clicks';

    var base = num(baseEl, 0.1, 50);
    var up = num(upEl, 5, 300);
    var cost = num(costEl, 0.01, 100000);
    var daily = num(dailyEl, 10, 1000000);
    var days = num(daysEl, 1, 90);
    var z = parseFloat(confEl.value);

    verdictEl.className = 'ab-verdict';
    statsEl.textContent = '';
    detailEl.textContent = '';
    if ([base, up, cost, daily, days].some(function (v) { return v === null; })) {
      verdictEl.textContent = 'Check the highlighted boxes. Each needs a number in a sensible range.';
      return;
    }

    var p1 = base / 100;
    var n = perVariant(p1, up / 100, z);
    var costPerUnit = isCtr ? cost / 1000 : cost;
    var needSpend = 2 * n * costPerUnit;
    var budget = daily * days;
    var availPer = budget / 2 / costPerUnit;
    var coverage = budget / needSpend;
    var daysNeeded = Math.ceil(needSpend / daily);
    var weeksNeeded = Math.ceil(daysNeeded / 7);
    var minUp = minDetectable(p1, availPer, z);

    if (coverage >= 1) { verdictEl.classList.add('ab-v-ok'); verdictEl.textContent = 'Your budget is enough to test this: ' + rand(budget) + ' available against about ' + rand(needSpend) + ' needed.'; }
    else if (coverage >= 0.5) { verdictEl.classList.add('ab-v-close'); verdictEl.textContent = 'Close, but short: ' + rand(budget) + ' available against about ' + rand(needSpend) + ' needed (' + Math.round(coverage * 100) + '%).'; }
    else { verdictEl.classList.add('ab-v-no'); verdictEl.textContent = 'Not enough to detect a ' + Math.round(up) + '% improvement: ' + rand(budget) + ' available against about ' + rand(needSpend) + ' needed (' + Math.round(coverage * 100) + '%).'; }

    [[fmt(n), unit + ' needed per version'], [rand(needSpend), 'total spend needed'], [rand(budget), 'your test budget'], [daysNeeded + (daysNeeded === 1 ? ' day' : ' days'), 'at ' + rand(daily) + ' a day']]
      .forEach(function (s) {
        var box = el('div', 'ab-stat');
        box.append(el('span', 'ab-stat-n', s[0]), el('span', 'ab-stat-l', s[1]));
        statsEl.appendChild(box);
      });

    var lines = [];
    if (minUp === null) lines.push(['strong', 'With your budget, no realistic improvement can be detected reliably. '], ['text', 'Raise the budget, lengthen the test, or compare a higher-funnel result.']);
    else lines.push(['text', 'With your budget, the smallest improvement you could reliably detect is about '], ['strong', pct(minUp)], ['text', '. Anything smaller will look like noise.']);
    if (coverage < 1) lines.push(['text', ' To test a ' + Math.round(up) + '% improvement you would need about '], ['strong', weeksNeeded + (weeksNeeded === 1 ? ' week' : ' weeks')], ['text', ' at this daily budget, or a bolder difference between the two versions.']);
    else if (days % 7 !== 0) lines.push(['text', ' Tip: run it for whole weeks (' + Math.ceil(days / 7) * 7 + ' days) so every day of the week is covered equally.']);
    lines.forEach(function (l) { detailEl.appendChild(l[0] === 'strong' ? el('strong', null, l[1]) : document.createTextNode(l[1])); });

    cta.href = 'https://wa.me/27695600708?text=' + encodeURIComponent('Hi Aiadverts, I would like two different versions of an advert to A/B test, with a test budget of about ' + rand(budget) + '.');
  }

  root.querySelectorAll('input,select').forEach(function (i) { i.addEventListener('input', render); i.addEventListener('change', render); });
  render();
})();
</script>

## How to Run a Clean Test

1. **Write the question first.** "Does a price-led hook get more WhatsApp enquiries than a product-led hook?" is a test. "Let's see what works" is not.
2. **Change one thing.** Same audience, same budget, same placement, same start time. Only the hook or the offer differs.
3. **Pick one result to judge by.** Enquiries, clicks or cost per enquiry, chosen before you start.
4. **Split the budget evenly** between the two versions.
5. **Set the end date** in advance and run whole weeks.
6. **Don't touch it.** Edits can reset how the platform optimises that version.
7. **Judge at the end.** If one version won clearly, use it. If it's a tie, choose the cheaper or simpler one.

## Making Small Budgets Go Further

- **Test bigger differences.** Two completely different hooks need far less traffic than two slightly different headlines.
- **Use a higher-funnel result.** Click-through rate needs fewer events than enquiries, which need fewer than sales. It's a weaker signal of what you ultimately want, but it can show which hook stops people scrolling.
- **Test in sequence.** Run the hook test first, then the offer test on the winner. It takes longer but each test is clean.
- **Accept less certainty.** A directional result at 90% confidence is better than guessing, as long as you treat it as a lean rather than a proof.
- **Use platform tools with care.** Built-in A/B tools are convenient, but the same rules about sample size apply.

## Test Plan for Black Friday

If you want to go into Black Friday (Friday 27 November 2026) with a proven advert, work backwards from the date. Our [Black Friday and festive season planner](/blog/black-friday-festive-season-adverts-south-africa) and [marketing calendar](/blog/south-african-marketing-calendar-2026-2027) cover the dates in detail. A simple schedule:

- **This week:** brief two clearly different versions of your main advert.
- **Monday 26 October to Sunday 8 November:** run a two-week test, with the budget split evenly.
- **Week of 9 November:** pick the winner and build the full set of Black Friday adverts around it.
- **From 20 November:** launch the teaser, then the main offer on the day.

Because AI adverts are produced in [3 to 5 business days](/blog/ai-vs-traditional-video-production) rather than weeks, producing two versions to test fits easily into that window.

## Test Ideas by Business Type

- **Restaurants and cafés:** a dish close-up versus a lifestyle scene. See [restaurants](/blog/ai-video-ads-restaurants-south-africa) and [coffee shops](/blog/ai-video-ads-coffee-cafe-brands-south-africa).
- **Salons and beauty:** a price menu versus a simple "book this week" message. See [hair salons and barbers](/blog/ai-adverts-hair-salons-barbers-south-africa).
- **Online stores:** product on white versus product in use. See [AI product images for e-commerce](/blog/ai-product-images-ecommerce-south-africa).
- **Services and trades:** a problem-first hook versus a trust-first hook. See [professional services](/blog/ai-adverts-professional-services-south-africa).
- **Bakeries:** a custom-cake message versus an everyday-treats message. See [bakeries and cake businesses](/blog/ai-adverts-bakeries-cake-businesses-south-africa).

For regulated industries, any variant has to comply with the same rules as the original. See our guides for [medical and dental practices](/blog/ai-adverts-medical-dental-practices-south-africa) and [financial services](/blog/ai-adverts-financial-services-insurance-south-africa).

## How to Measure Whether Adverts Are Working

Testing tells you which version is better. Measuring tells you whether the advert is worth running at all. Our [complete guide to AI advertising](/blog/ai-advertising-south-africa-guide) covers the numbers to watch, and our guide to [what AI video ads cost](/blog/ai-video-ads-cost-south-africa) covers what to budget for production.

## Getting Started

A Starter package from R3,000 gives you one video advert, three images and two revisions, which is enough to create two different versions of an advert to test. Growth, from R8,500 a month, adds weekly posting, which gives you a steady supply of fresh versions. See the full [pricing breakdown](/#pricing).

As a South African agency for AI adverts, we'd rather help you run one clean test than five noisy ones. [Get a free demo advert](https://wa.me/27695600708) and tell us which two ideas you want to compare, with no cost and no commitment.

## About the Calculator

The calculator uses the standard two-proportion sample-size formula for A/B tests (two-sided, 80% power), the same method most A/B testing calculators use. The R3 per click in the examples is an assumption for illustration, so replace it with the real cost from your own ads account.

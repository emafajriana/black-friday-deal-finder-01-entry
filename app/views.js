// HTML for each page, built from the deal data. Every value is escaped
// before it goes into the page, so a deal title can never break the markup.

import { CATEGORIES, STORES, SORTS, SIGNALS, percentOff, saved, countBy } from "./filters.js";

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const day = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

// A few deals are also listed at a second store at the same (or a nearby)
// price, as the same roundups reported. Shown on the deal page so a shopper
// can compare before they click.
const ALSO_AT = {
  "airpods-pro-3": [{ store: "Walmart", price: 149 }],
  "macbook-air-m5": [{ store: "Amazon", price: 1049 }],
  "switch2-bundle": [
    { store: "Target", price: 499.99 },
    { store: "Costco", price: 519.99 },
  ],
};

function signalBadge(d) {
  const s = SIGNALS[d.signal] || SIGNALS.strong;
  return `<span class="sig ${s.cls}">${escape(s.label)}</span>`;
}

function dealCard(d) {
  return `<article class="card">
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="price"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="off">${percentOff(d)}% off</span></p>
  <p class="save">You save ${usd(saved(d))}</p>
  <p>${signalBadge(d)}</p>
  <p class="checked">Checked ${day(d.checked)}</p>
  <p class="source">Read in: ${escape(d.source)}</p>
  <p><a class="buy" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} &rarr;</a></p>
</article>`;
}

function option(value, current, label) {
  return `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`;
}

export function controls(q, total, shown) {
  const cats = CATEGORIES.map((c) => option(c, q.category || "", c)).join("");
  const stores = STORES.map((s) => option(s, q.store || "", s)).join("");
  const sorts = SORTS.map((s) => option(s.id, q.sort || "discount", s.label)).join("");
  const minOffs = [0, 20, 30, 40, 50, 60].map((n) => option(String(n), String(q.minOff || 0), n === 0 ? "Any discount" : `${n}% off or more`)).join("");
  return `<form class="controls" id="controls">
  <label>Search <input type="search" name="text" value="${escape(q.text || "")}" placeholder="Try &ldquo;dyson&rdquo;, &ldquo;lego&rdquo;, &ldquo;tv&rdquo;&hellip;"></label>
  <label>Category <select name="category"><option value="">All categories</option>${cats}</select></label>
  <label>Store <select name="store"><option value="">All stores</option>${stores}</select></label>
  <label>Discount <select name="minOff">${minOffs}</select></label>
  <label>Sort <select name="sort">${sorts}</select></label>
  <p class="count" role="status">Showing ${shown} of ${total} deals</p>
</form>`;
}

export function topPicks(deals) {
  const picks = deals
    .filter((d) => d.signal === "new-low")
    .sort((a, b) => percentOff(b) - percentOff(a))
    .slice(0, 3);
  if (picks.length === 0) return "";
  return `<section class="picks" aria-label="Best of the day">
  <h2>Best of the day &mdash; new lows</h2>
  <ul>${picks
    .map(
      (d, i) => `<li><span class="rank">#${i + 1}</span> <a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
      <span class="pick-price">${usd(d.price)} <s>${usd(d.was)}</s> &middot; ${percentOff(d)}% off at ${escape(d.store)}</span></li>`,
    )
    .join("")}</ul>
</section>`;
}

export function cards(shown) {
  return shown.map(dealCard).join("");
}

export function list(deals, shown, q) {
  const cards = shown.length === 0 ? '<p class="empty">No deal matches. Clear a filter or try another search.</p>' : shown.map(dealCard).join("");
  const byCat = countBy(deals, "category");
  const chips = CATEGORIES.filter((c) => byCat[c])
    .map((c) => `<a class="chip" href="#/?category=${encodeURIComponent(c)}">${escape(c)} (${byCat[c]})</a>`)
    .join(" ");
  return `<h1>Black Friday deal finder</h1>
<p class="lede">${deals.length} real deals, checked by hand on Black Friday itself &mdash; every price read at the store or in a deals source that names it, with an honest verdict on whether it is really a deal.</p>
${topPicks(deals)}
${controls(q, deals.length, shown.length)}
<p class="chips">${chips}</p>
<div class="grid">${cards}</div>`;
}

export function deal(d) {
  const also = ALSO_AT[d.id] || [];
  const alsoHtml =
    also.length === 0
      ? ""
      : `<h2>Also at another store</h2><ul>${also
          .map((a) => `<li>${escape(a.store)}: <strong>${usd(a.price)}</strong></li>`)
          .join("")}</ul>`;
  return `<p><a href="#/">&larr; All deals</a></p>
<h1>${escape(d.title)}</h1>
<p class="meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
<p class="price big"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="off">${percentOff(d)}% off</span></p>
<p class="save">You save ${usd(saved(d))} off the usual price.</p>
<p>${signalBadge(d)}</p>
<p class="verdict"><strong>Is it really a deal?</strong> ${escape(d.note)}</p>
<dl>
  <dt>Store</dt><dd>${escape(d.store)}</dd>
  <dt>Category</dt><dd>${escape(d.category)}</dd>
  <dt>Checked</dt><dd>${day(d.checked)}</dd>
  <dt>Read in</dt><dd>${escape(d.source)}</dd>
</dl>
${alsoHtml}
<p><a class="buy" href="${escape(d.url)}" rel="noopener" target="_blank">View it at ${escape(d.store)} &rarr;</a></p>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}

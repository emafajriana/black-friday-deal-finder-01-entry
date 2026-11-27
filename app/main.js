// The deal finder: every deal and a page for each, on hash routes. The deals
// are in data.js, so the site needs no network to show them; each deal links
// out to its store. Filters live in the hash, so a filtered view has its own
// address and a screenshot of it is reproducible:
//
//   #/                                   the list, biggest % off first
//   #/?text=dyson&category=Home         the list, searched and filtered
//   #/?store=Walmart&sort=saved         the list, sorted by dollars saved
//   #/deal/<id>                         one deal, with its verdict
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from "./data.js";
import { applyFilters, applySort } from "./filters.js";
import { cards, deal, list, missing } from "./views.js";

const app = document.getElementById("app");

function readQuery() {
  const hash = location.hash || "#/";
  const qmark = hash.indexOf("?");
  const params = new URLSearchParams(qmark === -1 ? "" : hash.slice(qmark + 1));
  return {
    path: qmark === -1 ? hash.slice(2) : hash.slice(2, qmark),
    text: params.get("text") || "",
    category: params.get("category") || "",
    store: params.get("store") || "",
    signal: params.get("signal") || "",
    minOff: params.get("minOff") || "0",
    sort: params.get("sort") || "discount",
  };
}

function writeQuery(q) {
  const params = new URLSearchParams();
  if (q.text) params.set("text", q.text);
  if (q.category) params.set("category", q.category);
  if (q.store) params.set("store", q.store);
  if (q.signal) params.set("signal", q.signal);
  if (q.minOff && q.minOff !== "0") params.set("minOff", q.minOff);
  if (q.sort && q.sort !== "discount") params.set("sort", q.sort);
  const tail = params.toString();
  location.hash = "#/" + (tail ? "?" + tail : "");
}

function render() {
  window.__shotReady = false;
  const q = readQuery();
  const match = q.path.match(/^deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Not found"} | Black Friday deal finder`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    const shown = applySort(applyFilters(deals, q), q.sort);
    document.title = "Black Friday deal finder";
    app.innerHTML = list(deals, shown, q);
    const form = app.querySelector("#controls");
    const search = form.querySelector('input[name="text"]');
    const grid = app.querySelector(".grid");
    const count = app.querySelector(".count");
    // Typing filters the grid in place (no re-render, so focus stays put);
    // the selects rewrite the hash, which re-renders with the new filter.
    search.addEventListener("input", () => {
      const live = applySort(applyFilters(deals, { ...q, text: search.value }), q.sort);
      grid.innerHTML = cards(live) || '<p class="empty">No deal matches. Clear a filter or try another search.</p>';
      count.textContent = `Showing ${live.length} of ${deals.length} deals`;
    });
    form.addEventListener("change", () => {
      const data = new FormData(form);
      writeQuery({
        text: data.get("text") || "",
        category: data.get("category") || "",
        store: data.get("store") || "",
        signal: q.signal,
        minOff: data.get("minOff") || "0",
        sort: data.get("sort") || "discount",
      });
    });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();

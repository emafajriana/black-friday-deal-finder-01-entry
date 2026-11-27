// Filtering, sorting and the deal verdict for the finder. One job: turn a
// query (search text, category, store, minimum discount, sort) into the
// ordered list the page shows. Every value here is computed from the deal
// data, never typed twice.

export const CATEGORIES = [
  "Audio",
  "Smart home",
  "TVs",
  "Laptops",
  "Home",
  "Kitchen",
  "Gaming",
  "Toys",
  "Fashion",
  "Beauty",
];

export const STORES = [
  "Amazon",
  "Walmart",
  "Best Buy",
  "Target",
  "Macy's",
  "Kohl's",
  "Kate Spade Outlet",
];

export const SORTS = [
  { id: "discount", label: "Biggest % off" },
  { id: "saved", label: "Most dollars saved" },
  { id: "price-asc", label: "Lowest price" },
  { id: "price-desc", label: "Highest price" },
  { id: "az", label: "A to Z" },
];

export const SIGNALS = {
  "new-low": { label: "New low", cls: "sig-new" },
  strong: { label: "Strong deal", cls: "sig-strong" },
  routine: { label: "Routine sale", cls: "sig-routine" },
  inflated: { label: "Check the was price", cls: "sig-inflated" },
};

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saved = (d) => Math.round((d.was - d.price) * 100) / 100;

export function applyFilters(deals, q) {
  const text = (q.text || "").trim().toLowerCase();
  const minOff = Number(q.minOff || 0);
  return deals.filter((d) => {
    if (text && `${d.title} ${d.store} ${d.category}`.toLowerCase().indexOf(text) === -1) return false;
    if (q.category && d.category !== q.category) return false;
    if (q.store && d.store !== q.store) return false;
    if (q.signal && d.signal !== q.signal) return false;
    if (percentOff(d) < minOff) return false;
    return true;
  });
}

export function applySort(list, sortId) {
  const out = list.slice();
  if (sortId === "saved") out.sort((a, b) => saved(b) - saved(a) || percentOff(b) - percentOff(a));
  else if (sortId === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sortId === "price-desc") out.sort((a, b) => b.price - a.price);
  else if (sortId === "az") out.sort((a, b) => a.title.localeCompare(b.title));
  else out.sort((a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a));
  return out;
}

export function countBy(list, key) {
  const counts = {};
  for (const d of list) counts[d[key]] = (counts[d[key]] || 0) + 1;
  return counts;
}

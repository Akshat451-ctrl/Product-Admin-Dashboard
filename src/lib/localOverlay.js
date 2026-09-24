// DummyJSON's add/edit/delete endpoints are fake — they respond successfully but
// never actually change the underlying data. To make the app *feel* real across a
// session, we keep a small "overlay" of local changes in localStorage and merge it
// into whatever the API returns. See README for the full explanation.

const STORAGE_KEY = "productOverlay";

const EMPTY_OVERLAY = { added: [], edited: {}, deleted: [] };

export function readOverlay() {
  if (typeof window === "undefined") return { ...EMPTY_OVERLAY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...EMPTY_OVERLAY };
  } catch {
    return { ...EMPTY_OVERLAY };
  }
}

function writeOverlay(overlay) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
}

export function addLocalProduct(data) {
  const overlay = readOverlay();
  const product = { ...data, id: Date.now(), reviews: [], images: data.thumbnail ? [data.thumbnail] : [] };
  overlay.added.unshift(product);
  writeOverlay(overlay);
  return product;
}

export function editLocalProduct(id, data) {
  const overlay = readOverlay();
  const addedIndex = overlay.added.findIndex((p) => p.id === id);

  if (addedIndex !== -1) {
    overlay.added[addedIndex] = { ...overlay.added[addedIndex], ...data };
  } else {
    overlay.edited[id] = { ...(overlay.edited[id] || {}), ...data };
  }

  writeOverlay(overlay);
}

export function deleteLocalProduct(id) {
  const overlay = readOverlay();
  overlay.added = overlay.added.filter((p) => p.id !== id);
  delete overlay.edited[id];
  if (!overlay.deleted.includes(id)) {
    overlay.deleted.push(id);
  }
  writeOverlay(overlay);
}

// Applies edits/deletes to a page of products that came back from the API.
export function applyOverlay(overlay, products) {
  return products
    .filter((p) => !overlay.deleted.includes(p.id))
    .map((p) => (overlay.edited[p.id] ? { ...p, ...overlay.edited[p.id] } : p));
}

// Used by the detail/edit pages to resolve a single id against the overlay
// before falling back to the API.
export function getLocalProductById(id) {
  const overlay = readOverlay();
  if (overlay.deleted.includes(id)) return { deleted: true };

  const added = overlay.added.find((p) => p.id === id);
  if (added) return { product: added };

  if (overlay.edited[id]) return { patch: overlay.edited[id] };

  return {};
}

import api from "./api";

// The DummyJSON API can't search (`/products/search`) and filter by category
// (`/products/category/:slug`) in the same request, so this function picks one
// endpoint based on whichever is currently active. The UI (products page) keeps
// search and category mutually exclusive so this never has to silently drop one.
export async function fetchProducts({ page, limit, search, category, sortBy, order, signal }) {
  const skip = (page - 1) * limit;
  const params = { limit, skip };

  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }

  if (search) {
    const { data } = await api.get("/products/search", { params: { q: search, ...params }, signal });
    return data;
  }

  if (category) {
    const { data } = await api.get(`/products/category/${encodeURIComponent(category)}`, { params, signal });
    return data;
  }

  const { data } = await api.get("/products", { params, signal });
  return data;
}

export async function fetchCategories({ signal } = {}) {
  const { data } = await api.get("/products/categories", { signal });
  return data.map((c) => (typeof c === "string" ? { slug: c, name: c } : { slug: c.slug, name: c.name }));
}

export async function fetchProductById(id, { signal } = {}) {
  const { data } = await api.get(`/products/${id}`, { signal });
  return data;
}

export async function createProductApi(payload) {
  const { data } = await api.post("/products/add", payload);
  return data;
}

export async function updateProductApi(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProductApi(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

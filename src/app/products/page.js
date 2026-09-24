"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { deleteProductApi } from "@/lib/products";
import { deleteLocalProduct } from "@/lib/localOverlay";
import { parseLimit } from "@/lib/urlParams";

import SearchBar from "@/components/SearchBar";
import FilterSortBar from "@/components/FilterSortBar";
import Pagination from "@/components/Pagination";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

// useSearchParams() opts this page into client-side rendering unless it's
// wrapped in Suspense — Next needs a fallback for the moment before the
// client has read the URL.
export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader label="Loading products..." />}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the single source of truth for page/search/filter/sort, so a
  // refresh or a shared link always reproduces the same view.
  const rawPage = parseInt(searchParams.get("page"), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1; // ?page=abc -> 1
  const limit = parseLimit(searchParams.get("limit"));
  const urlSearch = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 500);
  const categories = useCategories();

  const updateQuery = useCallback(
    (patch) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Keep the visible input in sync if the URL changes from outside typing
  // (back/forward navigation, a shared link, clearing the category filter).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local input from the URL, not derived render state
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Push the debounced value into the URL once typing stops, and reset to
  // page 1. The API can't search and filter by category together, so a new
  // search clears any active category rather than silently ignoring one.
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    updateQuery({ q: debouncedSearch, category: "", page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { products, total, loading, error, retry } = useProducts({
    page,
    limit,
    search: urlSearch,
    category,
    sortBy,
    order,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ?page=999 (out of range) shouldn't break the page: once we know the real
  // total, clamp down to the last valid page.
  useEffect(() => {
    if (!loading && !error && page > totalPages) {
      updateQuery({ page: totalPages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, page, totalPages]);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProductApi(pendingDelete.id);
    } catch {
      // DummyJSON's delete isn't really persisted; we still reflect it locally.
    }
    deleteLocalProduct(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
    retry();
  }

  function handleCategoryChange(value) {
    updateQuery({ category: value, q: "", page: 1 });
    setSearchInput("");
  }

  function handleSortChange(newSortBy, newOrder) {
    updateQuery({ sortBy: newSortBy, order: newOrder, page: 1 });
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    updateQuery({ page: newPage });
  }

  function handleLimitChange(newLimit) {
    updateQuery({ limit: newLimit, page: 1 });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <Link href="/products/add" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          + Add product
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <FilterSortBar
          categories={categories}
          category={category}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
        />
      </div>

      {loading && <Loader label="Loading products..." />}

      {!loading && error && <ErrorState message="Could not load products." onRetry={retry} />}

      {!loading && !error && products.length === 0 && (
        <EmptyState message="No products match your search." />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductTable products={products} onDelete={setPendingDelete} />
          <ProductCard products={products} onDelete={setPendingDelete} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete product"
        message={pendingDelete ? `Delete "${pendingDelete.title}"? This cannot be undone.` : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

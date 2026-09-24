"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/products";
import { readOverlay, applyOverlay } from "@/lib/localOverlay";

// Fetches one page of products and merges in local add/edit/delete overlay.
//
// Race-condition safety: every dependency change creates a fresh AbortController.
// React runs the previous effect's cleanup (which aborts the in-flight request)
// before running the new effect, so a slow earlier response can never overwrite
// a faster later one — it just gets cancelled. Tested with `&delay=2000`.
export function useProducts({ page, limit, search, category, sortBy, order }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Setting loading/error synchronously here (rather than only inside the
    // fetch callback) is intentional: it's how a "fetching" flag is supposed
    // to work, and it's the pattern this assignment asks for instead of a
    // data-fetching library.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetchProducts({ page, limit, search, category, sortBy, order, signal: controller.signal })
      .then((data) => {
        const overlay = readOverlay();
        let list = applyOverlay(overlay, data.products);
        let totalCount = data.total - overlay.deleted.length;

        const isUnfiltered = !search && !category;
        if (isUnfiltered && page === 1) {
          list = [...overlay.added, ...list];
          totalCount += overlay.added.length;
        }

        setProducts(list);
        setTotal(Math.max(0, totalCount));
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;
        setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, limit, search, category, sortBy, order, reloadIndex]);

  const retry = () => setReloadIndex((n) => n + 1);

  return { products, total, loading, error, retry };
}

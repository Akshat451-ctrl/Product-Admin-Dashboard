"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { fetchProductById, deleteProductApi } from "@/lib/products";
import { getLocalProductById, deleteLocalProduct } from "@/lib/localOverlay";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const numericId = Number(id);
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useProducts.js
    setLoading(true);
    setError(null);
    setNotFound(false);

    const local = getLocalProductById(numericId);

    if (local.deleted) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (local.product) {
      setProduct(local.product);
      setLoading(false);
      return () => controller.abort();
    }

    fetchProductById(numericId, { signal: controller.signal })
      .then((data) => setProduct(local.patch ? { ...data, ...local.patch } : data))
      .catch((err) => {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;
        if (err.response?.status === 404) setNotFound(true);
        else setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadIndex]);

  async function handleConfirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProductApi(Number(id));
    } catch {
      // Not really persisted by the API; we still reflect it locally.
    }
    deleteLocalProduct(Number(id));
    setDeleting(false);
    setConfirmOpen(false);
    router.push("/products");
  }

  if (loading) return <Loader label="Loading product..." />;

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-600">We couldn&apos;t find a product with id &quot;{id}&quot;.</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load this product." onRetry={() => setReloadIndex((n) => n + 1)} />;
  }

  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/products" className="text-sm text-blue-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={product.title} className="aspect-square w-full rounded object-cover" />
          ))}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.title}</h1>
          <p className="mt-1 text-sm capitalize text-gray-500">{product.category}</p>
          <p className="mt-4 text-xl font-semibold text-gray-900">${product.price}</p>
          <p className="mt-1 text-sm text-gray-600">
            ★ {product.rating} · Stock: {product.stock}
          </p>
          <p className="mt-4 text-sm text-gray-700">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <Link href={`/products/${id}/edit`} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Edit
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded border border-red-300 px-4 py-2 text-sm text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
          <div className="mt-3 space-y-3">
            {product.reviews.map((r, i) => (
              <div key={i} className="rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{r.reviewerName}</span>
                  <span className="text-gray-500">★ {r.rating}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product"
        message={`Delete "${product.title}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}

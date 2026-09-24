"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useCategories } from "@/hooks/useCategories";
import { fetchProductById, updateProductApi } from "@/lib/products";
import { editLocalProduct, getLocalProductById } from "@/lib/localOverlay";
import ProductForm from "@/components/ProductForm";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const categories = useCategories();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const numericId = Number(id);
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useProducts.js
    setLoading(true);
    setError(null);

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
  }, [id]);

  async function handleSubmit(values) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      await updateProductApi(Number(id), values);
    } catch {
      // DummyJSON doesn't really persist edits; we still apply it locally below.
    }
    editLocalProduct(Number(id), values);
    router.push(`/products/${id}`);
  }

  if (loading) return <Loader label="Loading product..." />;

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  if (error) return <ErrorState message="Could not load this product." />;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Edit product</h1>
      <ProductForm
        categories={categories}
        initialValues={product}
        submitting={submitting}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}

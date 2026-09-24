"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useCategories } from "@/hooks/useCategories";
import { createProductApi } from "@/lib/products";
import { addLocalProduct } from "@/lib/localOverlay";
import ProductForm from "@/components/ProductForm";

export default function AddProductPage() {
  const router = useRouter();
  const categories = useCategories();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false); // synchronous guard against rapid double-clicks

  async function handleSubmit(values) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      await createProductApi(values);
    } catch {
      // DummyJSON doesn't really persist new products; we still add it locally below.
    }
    addLocalProduct(values);
    router.push("/products");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Add product</h1>
      <ProductForm categories={categories} submitting={submitting} onSubmit={handleSubmit} submitLabel="Create" />
    </div>
  );
}

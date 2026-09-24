"use client";

import { useState } from "react";
import { validateProduct } from "@/lib/validateProduct";

const emptyValues = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  rating: "",
  thumbnail: "",
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProductForm({ initialValues, categories, submitting, onSubmit, submitLabel = "Save" }) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validateProduct(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      rating: values.rating === "" ? 0 : Number(values.rating),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Category" error={errors.category}>
        <select
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price ($)" error={errors.price}>
          <input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Stock" error={errors.stock}>
          <input
            type="number"
            value={values.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Rating (0-5, optional)" error={errors.rating}>
          <input
            type="number"
            step="0.1"
            value={values.rating}
            onChange={(e) => handleChange("rating", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Thumbnail URL (optional)">
          <input
            type="text"
            value={values.thumbnail}
            onChange={(e) => handleChange("thumbnail", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

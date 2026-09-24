const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
];

export default function FilterSortBar({ categories, category, onCategoryChange, sortBy, order, onSortChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value, order)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>

      <select
        value={order}
        onChange={(e) => onSortChange(sortBy, e.target.value)}
        disabled={!sortBy}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}

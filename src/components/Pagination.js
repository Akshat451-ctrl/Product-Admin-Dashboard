import { PAGE_SIZES } from "@/lib/urlParams";

function getPageWindow(page, totalPages, windowSize = 5) {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageWindow(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-2 py-4 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing {startItem}–{endItem} of {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          Previous
        </button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`rounded px-2.5 py-1 text-sm ${
              n === page ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
    </div>
  );
}

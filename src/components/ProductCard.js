import Link from "next/link";

export default function ProductCard({ products, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {products.map((p) => (
        <div key={p.id} className="flex gap-3 rounded-lg border border-gray-200 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.thumbnail} alt={p.title} className="h-16 w-16 rounded object-cover" />
          <div className="flex-1">
            <Link href={`/products/${p.id}`} className="font-medium text-blue-600 hover:underline">
              {p.title}
            </Link>
            <p className="text-xs capitalize text-gray-500">{p.category}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-600">
              <span>${p.price}</span>
              <span>★ {p.rating}</span>
              <span>Stock: {p.stock}</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <Link href={`/products/${p.id}/edit`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => onDelete(p)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

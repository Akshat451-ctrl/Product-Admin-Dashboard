import Link from "next/link";

export default function ProductTable({ products, onDelete }) {
  return (
    <table className="hidden w-full table-auto border-collapse text-sm md:table">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-500">
          <th className="px-3 py-2">Image</th>
          <th className="px-3 py-2">Title</th>
          <th className="px-3 py-2">Category</th>
          <th className="px-3 py-2">Price</th>
          <th className="px-3 py-2">Rating</th>
          <th className="px-3 py-2">Stock</th>
          <th className="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-b border-gray-100">
            <td className="px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnail} alt={p.title} className="h-10 w-10 rounded object-cover" />
            </td>
            <td className="px-3 py-2">
              <Link href={`/products/${p.id}`} className="text-blue-600 hover:underline">
                {p.title}
              </Link>
            </td>
            <td className="px-3 py-2 capitalize">{p.category}</td>
            <td className="px-3 py-2">${p.price}</td>
            <td className="px-3 py-2">{p.rating}</td>
            <td className="px-3 py-2">{p.stock}</td>
            <td className="px-3 py-2">
              <div className="flex gap-2">
                <Link href={`/products/${p.id}/edit`} className="text-xs text-blue-600 hover:underline">
                  Edit
                </Link>
                <button onClick={() => onDelete(p)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

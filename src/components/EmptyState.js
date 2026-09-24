export default function EmptyState({ message = "No products found." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-gray-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}

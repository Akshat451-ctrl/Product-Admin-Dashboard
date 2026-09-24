export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products..."
      className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
    />
  );
}

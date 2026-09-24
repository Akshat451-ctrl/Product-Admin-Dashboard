import Navbar from "@/components/Navbar";

export default function ProductsLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </>
  );
}

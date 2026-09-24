// proxy.js redirects "/" to /login or /products before this ever renders;
// this is just a harmless fallback in case that ever doesn't run.
export default function Home() {
  return null;
}

export default function SpanishLayout({ children }) {
  // The <html lang> is set by the root layout; this marks the subtree so
  // screen readers and Google see Spanish content correctly.
  return <div lang="es">{children}</div>;
}

// ========================================
// SERVER COMPONENT
// ========================================
// src/app/products/page.tsx

import ProductsList from "./ProductList";

export const metadata = {
  title: "Browse Products",
};

export default function ProductsPage() {
  // This is a public page - no auth required
  // Just render the client component
  return <ProductsList />;
}

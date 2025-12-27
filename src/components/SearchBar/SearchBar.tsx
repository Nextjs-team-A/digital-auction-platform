"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  // const [loading, setLoading] = useState(false); // loading state is no longer needed
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync state with URL query param
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Redirect to products page with search query
    // The ProductList component will handle the fetching
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for amazing items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.searchBtn}>
          <FiSearch className={styles.icon} />
        </button>
      </form>
    </div>
  );
}

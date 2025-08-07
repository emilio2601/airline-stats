'use client';
import { useState, useEffect } from 'react';
import Home from "../../page";
import axios from "axios";

// This tells Next.js not to pre-render any specific pages at build time.
// New pages will be rendered on the client for any given `shareable_id`.
export async function generateStaticParams() {
  return [];
}

export default function SavedSearchPage({ params }) {
  const { shareable_id } = params;
  const [savedSearch, setSavedSearch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedSearch = async () => {
      const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3210" : "";
      try {
        const response = await axios.get(`${baseURL}/saved_searches/${shareable_id}`);
        setSavedSearch(response.data);
      } catch (error) {
        console.error("Error fetching saved search:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSearch();
  }, [shareable_id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading search...</div>;
  }

  return (
    <Home initialFilters={savedSearch?.params} savedSearch={savedSearch} />
  )
} 
'use client';
import Home from "../../page";
import axios from "axios";

export const dynamic = 'force-dynamic';

export default async function SavedSearchPage({ params }) {
  const { shareable_id } = params;
  
  const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3210" : ""

  let savedSearch = null;
  try {
    const response = await axios.get(`${baseURL}/saved_searches/${shareable_id}`);
    savedSearch = response.data;
  } catch (error) {
    console.error("Error fetching saved search:", error);
  }

  return (
    <Home initialFilters={savedSearch?.params} savedSearch={savedSearch} />
  )
} 
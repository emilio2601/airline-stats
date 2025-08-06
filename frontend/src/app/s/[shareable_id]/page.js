import Home from "@/app/page";
import axios from "axios";

export default async function SharedSearch({ params }) {
  const baseURL = process.env.NODE_ENV === "development" ? "http://localhost:3210" : "";
  let savedSearch = null;

  try {
    const response = await axios.get(`${baseURL}/saved_searches/${params.shareable_id}`);
    savedSearch = response.data;
  } catch (error) {
    console.error("Failed to load shared search:", error);
    // You might want to render an error page here
  }

  return <Home initialFilters={savedSearch?.params} savedSearch={savedSearch} />;
} 
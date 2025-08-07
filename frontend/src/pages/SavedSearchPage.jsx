import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage'; // Import the HomePage component

function SavedSearchPage() {
  const { shareableId } = useParams();
  const [savedSearch, setSavedSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedSearch = async () => {
      try {
        const response = await axios.get(`/api/saved_searches/${shareableId}`);
        setSavedSearch(response.data);
      } catch (err) {
        setError('Failed to load saved search.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSearch();
  }, [shareableId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the HomePage component with the saved search data
  return <HomePage initialFilters={savedSearch?.params} savedSearch={savedSearch} />;
}

export default SavedSearchPage; 
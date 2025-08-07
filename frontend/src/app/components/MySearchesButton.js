import React, { useState } from 'react';
import WfPopover from '../wf_popover';
import axios from 'axios';

const MySearchesButton = () => {
  const [searches, setSearches] = useState([]);

  const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3210" : "";

  const fetchSearches = async () => {
    try {
      const response = await axios.get(`${baseURL}/saved_searches`);
      setSearches(response.data);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this saved search?")) {
      try {
        await axios.delete(`${baseURL}/saved_searches/${id}`);
        fetchSearches(); // Refresh the list
      } catch (error) {
        console.error("Error deleting search:", error);
        alert("Could not delete search.");
      }
    }
  };

  return (
    <WfPopover trigger={"click"} placement="bottom-start" color="white">
      <WfPopover.Trigger>
        <button 
          onClick={fetchSearches}
          className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center"
        >
          <i className="fa fa-list pr-1.5"></i>
          <span>My Searches</span>
        </button>
      </WfPopover.Trigger>
      <WfPopover.Container>
        <div className="flex flex-col text-sm space-y-2 text-gray-900 w-64">
          <h3 className="font-bold text-base mb-2">Your Saved Searches</h3>
          {searches.length > 0 ? (
            searches.map((search) => (
              <a
                key={search.id}
                href={`/s/${search.shareable_id}`}
                className="block p-2 rounded-md hover:bg-gray-100 group"
              >
                <div className="flex justify-between items-center">
                  <span>{search.search_name || "Untitled Search"}</span>
                  <button
                    onClick={(e) => handleDelete(search.id, e)}
                    className="text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </a>
            ))
          ) : (
            <p className="text-gray-500">You have no saved searches.</p>
          )}
        </div>
      </WfPopover.Container>
    </WfPopover>
  );
};

export default MySearchesButton; 
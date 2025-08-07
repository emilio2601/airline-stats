import React, { useState } from 'react';
import WfPopover from '../wf_popover';
import axios from 'axios';

const SavedSearches = ({ filters }) => {
  const [searches, setSearches] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [shareableLink, setShareableLink] = useState("");

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

  const handleSaveSearch = async () => {
    try {
      const response = await axios.post(`${baseURL}/saved_searches`, {
        saved_search: { search_name: searchName, params: filters },
      });
      const shareableId = response.data.shareable_id;
      const link = `${window.location.origin}/s/${shareableId}`;
      setShareableLink(link);
    } catch (error) {
      console.error("Error saving search:", error);
      alert("Could not save search. Please try again.");
    }
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
    setSearchName("");
    setShareableLink("");
  };

  return (
    <>
      <WfPopover trigger={"click"} placement="bottom-end" color="white">
        <WfPopover.Trigger>
          <button 
            onClick={fetchSearches}
            className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center"
          >
            <i className="fa fa-list pr-1.5"></i>
            <span>Saved Searches</span>
          </button>
        </WfPopover.Trigger>
        <WfPopover.Container>
          <div className="flex flex-col text-sm text-gray-900 min-w-64 pr-2 pb-2">
            <h3 className="font-bold text-base mb-2">Your Saved Searches</h3>
            <div className="space-y-2">
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
            <div className="mt-4 pt-2">
              <button 
                onClick={() => setShowSaveModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
              >
                Save Current Search
              </button>
            </div>
          </div>
        </WfPopover.Container>
      </WfPopover>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-gray-900 w-1/3">
            <h2 className="text-xl font-bold mb-4">{shareableLink ? "Search Saved!" : "Save Your Search"}</h2>
            
            {shareableLink ? (
              <div>
                <p className="mb-2">Your shareable link is ready:</p>
                <input
                  type="text"
                  readOnly
                  value={shareableLink}
                  className="w-full p-2 border rounded bg-gray-100"
                  onFocus={(e) => e.target.select()}
                />
                <div className="mt-4 flex justify-end space-x-2">
                   <button
                    onClick={() => navigator.clipboard.writeText(shareableLink)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Copy
                  </button>
                  <button
                    onClick={closeSaveModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="searchName" className="block mb-2">
                  Give your search a name (optional):
                </label>
                <input
                  id="searchName"
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  placeholder="e.g., US to UK Flights"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={closeSaveModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSearch}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SavedSearches; 
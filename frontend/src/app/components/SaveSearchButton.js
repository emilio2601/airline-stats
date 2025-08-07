import React, { useState } from 'react';
import axios from 'axios';

const SaveSearchButton = ({ filters }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [shareableLink, setShareableLink] = useState("");

  const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3210" : "";

  const handleSaveSearch = async () => {
    try {
      const response = await axios.post(`${baseURL}/saved_searches`, {
        saved_search: {
          search_name: searchName,
          params: filters,
        },
      });
      const shareableId = response.data.shareable_id;
      const link = `${window.location.origin}/s/${shareableId}`;
      setShareableLink(link);
    } catch (error) {
      console.error("Error saving search:", error);
      alert("Could not save search. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchName("");
    setShareableLink("");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center"
      >
        <i className="fa fa-save pr-1.5"></i>
        <span>Save Search</span>
      </button>

      {showModal && (
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
                    onClick={closeModal}
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
                    onClick={closeModal}
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

export default SaveSearchButton; 
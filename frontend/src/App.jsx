import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SavedSearchPage from './pages/SavedSearchPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/s/:shareableId" element={<SavedSearchPage />} />
      </Routes>
    </Router>
  );
}

export default App; 
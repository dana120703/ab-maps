import React from 'react';

/**
 * Component for searching addresses
 */
const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  isSearching, 
  onSearchSelect 
}) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Søk etter adresse i Norge..."
        value={searchQuery}
        onChange={onSearchChange}
      />
      {searchResults.length > 0 && (
        <div className="suggestions-container">
          {searchResults.map((result, index) => (
            <button
              key={index}
              className="suggestion-item"
              onClick={() => onSearchSelect(result)}
            >
              {result.display_name || "Ukjent adresse"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

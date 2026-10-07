import React from 'react';
import './SearchBar.css';

function SearchBar({ value, onChange, placeholder = 'Search posts…' }) {
  return (
    <div className="search-bar">
      <label htmlFor="search-input" className="sr-only">
        Search posts
      </label>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;

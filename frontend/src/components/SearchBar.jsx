import React from 'react';

const SearchBar = ({ searchText, onSearchTextChange, placeholder = 'Search', filters = [], filterValues = {}, onFilterChange, onClear }) => {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <input
          className="input-field"
          type="search"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={() => onSearchTextChange('')}>
          Clear
        </button>
      </div>

      <div className="filter-grid">
        {filters.map((filter) => (
          <div className="filter-field" key={filter.name}>
            <label>{filter.label}</label>
            <select
              value={filterValues[filter.name] ?? ''}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className="input-field"
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        {onClear && (
          <button type="button" className="btn-secondary" onClick={onClear}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

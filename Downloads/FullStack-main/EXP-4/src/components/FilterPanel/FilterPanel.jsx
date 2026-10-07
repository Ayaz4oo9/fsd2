import React from 'react';
import { PLATFORMS, STATUSES } from '../../utils/postUtils';
import './FilterPanel.css';

function FilterPanel({ filters, categories, onChange }) {
  return (
    <div className="filter-panel" role="group" aria-label="Filter posts">
      <div className="filter-panel__field">
        <label htmlFor="filter-platform">Platform</label>
        <select
          id="filter-platform"
          value={filters.platform}
          onChange={(e) => onChange({ platform: e.target.value })}
        >
          <option value="All">All</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__field">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <option value="All">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__field">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__field">
        <label htmlFor="filter-sort">Sort by date</label>
        <select
          id="filter-sort"
          value={filters.sortDirection}
          onChange={(e) => onChange({ sortDirection: e.target.value })}
        >
          <option value="asc">Soonest first</option>
          <option value="desc">Latest first</option>
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;

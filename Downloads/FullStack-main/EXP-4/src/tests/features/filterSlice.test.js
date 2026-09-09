import { describe, it, expect } from 'vitest';
import filterReducer, {
  setSearchTerm,
  setPlatformFilter,
  setStatusFilter,
  setCategoryFilter,
  setSortDirection,
  resetFilters,
} from '../../features/filters/filterSlice';

const initialState = {
  searchTerm: '',
  platform: 'All',
  status: 'All',
  category: 'All',
  sortDirection: 'asc',
};

describe('filterSlice', () => {
  it('returns the correct initial state', () => {
    expect(filterReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setSearchTerm updates only the search term', () => {
    const state = filterReducer(initialState, setSearchTerm('react'));
    expect(state.searchTerm).toBe('react');
    expect(state.platform).toBe('All');
  });

  it('setPlatformFilter updates only the platform', () => {
    const state = filterReducer(initialState, setPlatformFilter('LinkedIn'));
    expect(state.platform).toBe('LinkedIn');
  });

  it('setStatusFilter updates only the status', () => {
    const state = filterReducer(initialState, setStatusFilter('Published'));
    expect(state.status).toBe('Published');
  });

  it('setCategoryFilter updates only the category', () => {
    const state = filterReducer(initialState, setCategoryFilter('Education'));
    expect(state.category).toBe('Education');
  });

  it('setSortDirection updates only the sort direction', () => {
    const state = filterReducer(initialState, setSortDirection('desc'));
    expect(state.sortDirection).toBe('desc');
  });

  it('resetFilters restores all fields to their defaults', () => {
    const dirty = {
      searchTerm: 'react',
      platform: 'LinkedIn',
      status: 'Published',
      category: 'Education',
      sortDirection: 'desc',
    };
    expect(filterReducer(dirty, resetFilters())).toEqual(initialState);
  });
});

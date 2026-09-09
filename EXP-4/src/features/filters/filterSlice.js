import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  platform: 'All',
  status: 'All',
  category: 'All',
  sortDirection: 'asc',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setPlatformFilter(state, action) {
      state.platform = action.payload;
    },
    setStatusFilter(state, action) {
      state.status = action.payload;
    },
    setCategoryFilter(state, action) {
      state.category = action.payload;
    },
    setSortDirection(state, action) {
      state.sortDirection = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearchTerm,
  setPlatformFilter,
  setStatusFilter,
  setCategoryFilter,
  setSortDirection,
  resetFilters,
} = filterSlice.actions;

export const selectFilters = (state) => state.filters;

export default filterSlice.reducer;

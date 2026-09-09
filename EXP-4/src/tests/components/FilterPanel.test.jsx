import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '../../components/FilterPanel/FilterPanel';

const defaultFilters = {
  searchTerm: '',
  platform: 'All',
  status: 'All',
  category: 'All',
  sortDirection: 'asc',
};

const categories = ['Technology', 'Marketing'];

function renderPanel(filters = defaultFilters) {
  const onChange = vi.fn();
  render(<FilterPanel filters={filters} categories={categories} onChange={onChange} />);
  return { onChange };
}

describe('FilterPanel', () => {
  it('renders platform, status, category, and sort controls reflecting current filters', () => {
    renderPanel();
    expect(screen.getByLabelText('Platform')).toHaveValue('All');
    expect(screen.getByLabelText('Status')).toHaveValue('All');
    expect(screen.getByLabelText('Category')).toHaveValue('All');
    expect(screen.getByLabelText('Sort by date')).toHaveValue('asc');
  });

  it('lists every provided category as an option', () => {
    renderPanel();
    expect(screen.getByRole('option', { name: 'Technology' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Marketing' })).toBeInTheDocument();
  });

  it('calls onChange with { platform } when the platform select changes', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPanel();
    await user.selectOptions(screen.getByLabelText('Platform'), 'LinkedIn');
    expect(onChange).toHaveBeenCalledWith({ platform: 'LinkedIn' });
  });

  it('calls onChange with { status } when the status select changes', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPanel();
    await user.selectOptions(screen.getByLabelText('Status'), 'Published');
    expect(onChange).toHaveBeenCalledWith({ status: 'Published' });
  });

  it('calls onChange with { category } when the category select changes', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPanel();
    await user.selectOptions(screen.getByLabelText('Category'), 'Marketing');
    expect(onChange).toHaveBeenCalledWith({ category: 'Marketing' });
  });

  it('calls onChange with { sortDirection } when the sort select changes', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPanel();
    await user.selectOptions(screen.getByLabelText('Sort by date'), 'desc');
    expect(onChange).toHaveBeenCalledWith({ sortDirection: 'desc' });
  });

  it('reflects a non-default filter state passed in via props', () => {
    renderPanel({ ...defaultFilters, platform: 'YouTube', sortDirection: 'desc' });
    expect(screen.getByLabelText('Platform')).toHaveValue('YouTube');
    expect(screen.getByLabelText('Sort by date')).toHaveValue('desc');
  });
});

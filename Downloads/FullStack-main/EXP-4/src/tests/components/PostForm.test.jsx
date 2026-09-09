import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostForm from '../../components/PostForm/PostForm';

describe('PostForm', () => {
  it('renders empty fields and the default submit label in create mode', () => {
    render(<PostForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Title/)).toHaveValue('');
    expect(screen.getByLabelText(/Content/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save Post' })).toBeInTheDocument();
  });

  it('pre-fills fields from defaultPost in edit mode', () => {
    const defaultPost = {
      title: 'Existing post',
      content: 'Existing content',
      platform: 'Instagram',
      category: 'Marketing',
      tags: ['a', 'b'],
      status: 'Draft',
      scheduledAt: '2026-09-15T14:30:00.000Z',
      image: '',
    };
    render(<PostForm defaultPost={defaultPost} onSubmit={vi.fn()} submitLabel="Update Post" />);

    expect(screen.getByLabelText(/Title/)).toHaveValue('Existing post');
    expect(screen.getByLabelText(/Content/)).toHaveValue('Existing content');
    expect(screen.getByLabelText(/^Tags/)).toHaveValue('a, b');
    expect(screen.getByRole('button', { name: 'Update Post' })).toBeInTheDocument();
  });

  it('shows required-field errors and does not call onSubmit when submitted empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Save Post' }));

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(screen.getByText('Select a platform.')).toBeInTheDocument();
    expect(screen.getByText('Category is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a schedule date/time only when status is Scheduled', async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Status *'), 'Scheduled');
    await user.click(screen.getByRole('button', { name: 'Save Post' }));

    expect(await screen.findByText('Scheduled date is required.')).toBeInTheDocument();
    expect(screen.getByText('Scheduled time is required.')).toBeInTheDocument();
  });

  it('calls onSubmit with cleaned, structured values on valid submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Title/), '  My New Post  ');
    await user.type(screen.getByLabelText(/Content/), '  Some content  ');
    await user.selectOptions(screen.getByLabelText(/Platform/), 'Instagram');
    await user.type(screen.getByLabelText(/Category/), 'Marketing');
    await user.type(screen.getByLabelText(/^Tags/), 'react, redux,  vite ');
    // Status defaults to Draft, so no schedule date/time is required.
    await user.click(screen.getByRole('button', { name: 'Save Post' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe('My New Post');
    expect(payload.content).toBe('Some content');
    expect(payload.platform).toBe('Instagram');
    expect(payload.category).toBe('Marketing');
    expect(payload.tags).toEqual(['react', 'redux', 'vite']);
    expect(payload.status).toBe('Draft');
    expect(payload.duration).toBe(30);
  });
});

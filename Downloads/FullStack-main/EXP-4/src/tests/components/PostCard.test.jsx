import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../../components/PostCard/PostCard';

function makePost(overrides = {}) {
  return {
    id: 'post-1',
    title: 'Launch announcement',
    content: 'We are launching a new feature next week.',
    platform: 'LinkedIn',
    status: 'Scheduled',
    category: 'Product',
    tags: ['launch', 'product'],
    scheduledAt: '2026-09-10T09:00:00.000Z',
    ...overrides,
  };
}

function renderCard(overrides = {}, handlers = {}) {
  const onEdit = handlers.onEdit || vi.fn();
  const onDelete = handlers.onDelete || vi.fn();
  const onDuplicate = handlers.onDuplicate || vi.fn();
  const onPublish = handlers.onPublish || vi.fn();
  const post = makePost(overrides);

  render(
    <PostCard
      post={post}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onPublish={onPublish}
    />
  );

  return { post, onEdit, onDelete, onDuplicate, onPublish };
}

describe('PostCard', () => {
  it('renders the post title, content, platform, status, and category', () => {
    renderCard();
    expect(screen.getByText('Launch announcement')).toBeInTheDocument();
    expect(screen.getByText('We are launching a new feature next week.')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText(/Scheduled/)).toBeInTheDocument();
    expect(screen.getByText(/Product/)).toBeInTheDocument();
  });

  it('renders each tag prefixed with a hash', () => {
    renderCard();
    expect(screen.getByText('#launch')).toBeInTheDocument();
    expect(screen.getByText('#product')).toBeInTheDocument();
  });

  it('does not render a tags list when the post has no tags', () => {
    renderCard({ tags: [] });
    expect(screen.queryByLabelText('Tags')).not.toBeInTheDocument();
  });

  it('shows a Publish button only when status is Scheduled', () => {
    renderCard({ status: 'Scheduled' });
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });

  it('hides the Publish button for non-Scheduled posts', () => {
    renderCard({ status: 'Draft' });
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });

  it('calls onEdit with the post id when Edit is clicked', async () => {
    const user = userEvent.setup();
    const { onEdit, post } = renderCard();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(post.id);
  });

  it('calls onDuplicate with the post id when Duplicate is clicked', async () => {
    const user = userEvent.setup();
    const { onDuplicate, post } = renderCard();
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(onDuplicate).toHaveBeenCalledWith(post.id);
  });

  it('calls onPublish with the post id when Publish is clicked', async () => {
    const user = userEvent.setup();
    const { onPublish, post } = renderCard({ status: 'Scheduled' });
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onPublish).toHaveBeenCalledWith(post.id);
  });

  it('calls onDelete with the post id when Delete is clicked', async () => {
    const user = userEvent.setup();
    const { onDelete, post } = renderCard();
    await user.click(screen.getByRole('button', { name: `Delete ${post.title}` }));
    expect(onDelete).toHaveBeenCalledWith(post.id);
  });
});

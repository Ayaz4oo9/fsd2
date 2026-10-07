import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard/PostCard';
import SearchBar from '../components/SearchBar/SearchBar';
import FilterPanel from '../components/FilterPanel/FilterPanel';
import EmptyState from '../components/EmptyState/EmptyState';
import LoadingState from '../components/LoadingState/LoadingState';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import { fetchPosts, deletePostAsync, duplicatePost, publishPost } from '../features/posts/postSlice';
import { showToast } from '../features/ui/uiSlice';
import {
  setSearchTerm,
  setPlatformFilter,
  setStatusFilter,
  setCategoryFilter,
  setSortDirection,
  selectFilters,
} from '../features/filters/filterSlice';
import { selectAllPosts, selectPostsLoading } from '../features/posts/postSelectors';
import { matchesSearch, matchesFilters, sortByScheduledAt, getUniqueCategories } from '../utils/postUtils';

function PostsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  const filters = useSelector(selectFilters);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const categories = useMemo(() => getUniqueCategories(posts), [posts]);

  // The core "meaningful computation" the spec calls out: filtering +
  // sorting a list that can have hundreds of entries. useMemo ensures this
  // only re-runs when posts or the filter criteria actually change, not on
  // every render of PostsPage (e.g. when the confirm dialog opens/closes).
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter(
      (post) => matchesSearch(post, filters.searchTerm) && matchesFilters(post, filters)
    );
    return sortByScheduledAt(filtered, filters.sortDirection);
  }, [posts, filters]);

  // Stable handler references are required for PostCard's React.memo to be
  // effective — without useCallback, PostsPage would create brand-new
  // onEdit/onDelete/onDuplicate/onPublish functions every render, and
  // every PostCard would re-render regardless of memoization.
  const handleEdit = useCallback((id) => navigate(`/posts/${id}/edit`), [navigate]);

  const handleDeleteRequest = useCallback((id) => setPendingDeleteId(id), []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return;
    dispatch(deletePostAsync(pendingDeleteId))
      .unwrap()
      .then(() => dispatch(showToast({ message: 'Post deleted.', type: 'success' })))
      .catch((err) => dispatch(showToast({ message: err.message, type: 'error' })));
    setPendingDeleteId(null);
  }, [dispatch, pendingDeleteId]);

  const handleDuplicate = useCallback(
    (id) => {
      dispatch(duplicatePost(id));
      dispatch(showToast({ message: 'Post duplicated as draft.', type: 'success' }));
    },
    [dispatch]
  );

  const handlePublish = useCallback(
    (id) => {
      dispatch(publishPost(id));
      dispatch(showToast({ message: 'Post published.', type: 'success' }));
    },
    [dispatch]
  );

  if (loading) return <LoadingState message="Loading posts…" />;

  return (
    <div className="page">
      <div className="page__header">
        <h1>Posts</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/posts/create')}>
          + New Post
        </button>
      </div>

      <div className="posts-page__toolbar">
        <SearchBar value={filters.searchTerm} onChange={(v) => dispatch(setSearchTerm(v))} />
        <FilterPanel
          filters={filters}
          categories={categories}
          onChange={(changes) => {
            if ('platform' in changes) dispatch(setPlatformFilter(changes.platform));
            if ('status' in changes) dispatch(setStatusFilter(changes.status));
            if ('category' in changes) dispatch(setCategoryFilter(changes.category));
            if ('sortDirection' in changes) dispatch(setSortDirection(changes.sortDirection));
          }}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState
          title={posts.length === 0 ? 'No posts yet' : 'No posts match your search'}
          message={posts.length === 0 ? 'Create your first post to get started.' : 'Try adjusting your filters.'}
          actionLabel={posts.length === 0 ? 'Create Post' : undefined}
          onAction={posts.length === 0 ? () => navigate('/posts/create') : undefined}
        />
      ) : (
        <div className="posts-page__grid">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onDuplicate={handleDuplicate}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this post?"
        message="This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

export default PostsPage;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PostForm from '../components/PostForm/PostForm';
import EmptyState from '../components/EmptyState/EmptyState';
import LoadingState from '../components/LoadingState/LoadingState';
import { fetchPosts, updatePostAsync } from '../features/posts/postSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectAllPosts, selectPostsLoading } from '../features/posts/postSelectors';

function EditPostPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);

  useEffect(() => {
    if (posts.length === 0) dispatch(fetchPosts());
  }, [dispatch, posts.length]);

  const post = posts.find((p) => p.id === id);

  const handleSubmit = async (changes) => {
    try {
      await dispatch(updatePostAsync({ id, changes })).unwrap();
      dispatch(showToast({ message: 'Post updated.', type: 'success' }));
      navigate('/posts');
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update post.', type: 'error' }));
    }
  };

  if (loading) return <LoadingState message="Loading post…" />;

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        message={`No post exists with id "${id}". It may have been deleted.`}
        actionLabel="Back to Posts"
        onAction={() => navigate('/posts')}
      />
    );
  }

  return (
    <div className="page">
      <h1>Edit Post</h1>
      <PostForm defaultPost={post} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}

export default EditPostPage;

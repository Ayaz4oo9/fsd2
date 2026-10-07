import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm/PostForm';
import { createPostAsync } from '../features/posts/postSlice';
import { showToast } from '../features/ui/uiSlice';
import { splitDateAndTime } from '../utils/dateUtils';

function CreatePostPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user clicked a date on the calendar, prefill that date.
  const presetDate = location.state?.presetDate;
  const { date, time } = splitDateAndTime(presetDate);
  const defaultPost = presetDate
    ? { status: 'Scheduled', scheduledAt: presetDate }
    : undefined;

  const handleSubmit = async (postData) => {
    try {
      await dispatch(createPostAsync(postData)).unwrap();
      dispatch(showToast({ message: 'Post created.', type: 'success' }));
      navigate('/posts');
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create post.', type: 'error' }));
    }
  };

  return (
    <div className="page">
      <h1>Create Post</h1>
      <PostForm
        defaultPost={defaultPost ? { ...defaultPost, scheduledAt: `${date}T${time}` } : undefined}
        onSubmit={handleSubmit}
        submitLabel="Create Post"
      />
    </div>
  );
}

export default CreatePostPage;

import React from 'react';
import { useForm } from 'react-hook-form';
import { PLATFORMS, STATUSES } from '../../utils/postUtils';
import { combineDateAndTime, splitDateAndTime } from '../../utils/dateUtils';
import './PostForm.css';

/**
 * One form component powers both "Create Post" and "Edit Post". React Hook
 * Form keeps input state uncontrolled (out of React state) for performance,
 * and only triggers re-renders on validation/error changes — this matters
 * once the form has many fields.
 *
 * `defaultValues` is how the same component supports both modes: Create
 * passes empty defaults, Edit passes the existing post's values.
 */
function PostForm({ defaultPost, onSubmit, submitLabel = 'Save Post' }) {
  const { date: defaultDate, time: defaultTime } = splitDateAndTime(defaultPost?.scheduledAt);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: defaultPost?.title || '',
      content: defaultPost?.content || '',
      platform: defaultPost?.platform || '',
      category: defaultPost?.category || '',
      tags: defaultPost?.tags?.join(', ') || '',
      status: defaultPost?.status || 'Draft',
      scheduledDate: defaultDate,
      scheduledTime: defaultTime,
      image: defaultPost?.image || '',
    },
  });

  const status = watch('status');
  const requiresSchedule = status === 'Scheduled';

  const submitHandler = (values) => {
    const scheduledAt = combineDateAndTime(values.scheduledDate, values.scheduledTime);
    onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      platform: values.platform,
      category: values.category.trim(),
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: values.status,
      scheduledAt,
      duration: 30,
      image: values.image.trim(),
    });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit(submitHandler)} noValidate>
      <div className="post-form__field">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          {...register('title', { required: 'Title is required.' })}
        />
        {errors.title && (
          <p id="title-error" className="post-form__error" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="post-form__field">
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          rows={4}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'content-error' : undefined}
          {...register('content', { required: 'Content is required.' })}
        />
        {errors.content && (
          <p id="content-error" className="post-form__error" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="post-form__row">
        <div className="post-form__field">
          <label htmlFor="platform">Platform *</label>
          <select
            id="platform"
            aria-invalid={!!errors.platform}
            {...register('platform', { required: 'Select a platform.' })}
          >
            <option value="">Select platform</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.platform && (
            <p className="post-form__error" role="alert">
              {errors.platform.message}
            </p>
          )}
        </div>

        <div className="post-form__field">
          <label htmlFor="category">Category *</label>
          <input
            id="category"
            type="text"
            aria-invalid={!!errors.category}
            {...register('category', { required: 'Category is required.' })}
          />
          {errors.category && (
            <p className="post-form__error" role="alert">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <div className="post-form__field">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" type="text" {...register('tags')} placeholder="React, Marketing" />
      </div>

      <div className="post-form__field">
        <label htmlFor="status">Status *</label>
        <select id="status" {...register('status', { required: true })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="post-form__row">
        <div className="post-form__field">
          <label htmlFor="scheduledDate">Schedule date {requiresSchedule && '*'}</label>
          <input
            id="scheduledDate"
            type="date"
            aria-invalid={!!errors.scheduledDate}
            {...register('scheduledDate', {
              validate: (value) =>
                !requiresSchedule || !!value || 'Scheduled date is required.',
            })}
          />
          {errors.scheduledDate && (
            <p className="post-form__error" role="alert">
              {errors.scheduledDate.message}
            </p>
          )}
        </div>

        <div className="post-form__field">
          <label htmlFor="scheduledTime">Schedule time {requiresSchedule && '*'}</label>
          <input
            id="scheduledTime"
            type="time"
            aria-invalid={!!errors.scheduledTime}
            {...register('scheduledTime', {
              validate: (value) =>
                !requiresSchedule || !!value || 'Scheduled time is required.',
            })}
          />
          {errors.scheduledTime && (
            <p className="post-form__error" role="alert">
              {errors.scheduledTime.message}
            </p>
          )}
        </div>
      </div>

      <div className="post-form__field">
        <label htmlFor="image">Image URL</label>
        <input id="image" type="text" {...register('image')} placeholder="https://…" />
      </div>

      <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

export default PostForm;

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard/StatsCard';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import { fetchPosts } from '../features/posts/postSlice';
import {
  selectPostsLoading,
  selectPostsError,
  selectDashboardStats,
  selectUpcomingPosts,
  selectRecentPosts,
  selectPlatformDistribution,
  selectTodayPosts,
  selectWeekPosts,
} from '../features/posts/postSelectors';
import { formatDateTime } from '../utils/dateUtils';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);
  const stats = useSelector(selectDashboardStats);
  const upcoming = useSelector(selectUpcomingPosts);
  const recent = useSelector(selectRecentPosts);
  const distribution = useSelector(selectPlatformDistribution);
  const todayPosts = useSelector(selectTodayPosts);
  const weekPosts = useSelector(selectWeekPosts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Distribution is derived from a selector already, but turning the object
  // into a sorted array for rendering is cheap; useMemo here avoids
  // recreating that array on every unrelated re-render (e.g. toast timers).
  const distributionEntries = useMemo(
    () => Object.entries(distribution).sort((a, b) => b[1] - a[1]),
    [distribution]
  );

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error) return <EmptyState title="Something went wrong" message={error} />;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="dashboard__stats">
        <StatsCard label="Total Posts" value={stats.total} color="#1A3636" />
        <StatsCard label="Scheduled" value={stats.scheduled} color="#D97706" />
        <StatsCard label="Published" value={stats.published} color="#059669" />
        <StatsCard label="Draft" value={stats.draft} color="#0284C7" />
        <StatsCard label="Failed" value={stats.failed} color="#DC2626" />
        <StatsCard label="Today" value={todayPosts.length} color="#4F46E5" />
        <StatsCard label="This Week" value={weekPosts.length} color="#1A3636" />
      </div>

      <div className="dashboard__columns">
        <section className="dashboard__panel">
          <h2>Upcoming Posts</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming posts"
              message="Schedule a post to see it here."
              actionLabel="Create Post"
              onAction={() => navigate('/posts/create')}
            />
          ) : (
            <ul className="dashboard__list">
              {upcoming.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong>
                  <span>{formatDateTime(p.scheduledAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard__panel">
          <h2>Recently Updated</h2>
          {recent.length === 0 ? (
            <EmptyState title="No recent activity" />
          ) : (
            <ul className="dashboard__list">
              {recent.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong>
                  <span>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard__panel">
          <h2>Platform Distribution</h2>
          {distributionEntries.length === 0 ? (
            <EmptyState title="No posts yet" />
          ) : (
            <ul className="dashboard__list">
              {distributionEntries.map(([platform, count]) => (
                <li key={platform}>
                  <strong>{platform}</strong>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

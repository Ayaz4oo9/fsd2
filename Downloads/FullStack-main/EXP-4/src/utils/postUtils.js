export const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'YouTube'];
export const STATUSES = ['Draft', 'Scheduled', 'Published', 'Failed'];

export const PLATFORM_COLORS = {
  Instagram: '#d6249f',
  Facebook: '#1877f2',
  LinkedIn: '#0a66c2',
  X: '#0f1419',
  YouTube: '#ff0000',
};

export const STATUS_COLORS = {
  Draft: '#0284c7', // Sky Blue
  Scheduled: '#d97706', // Soft Amber
  Published: '#059669', // Mint Green
  Failed: '#dc2626', // Light Coral
};

/** Matches a post's searchable fields against a lowercase query. */
export function matchesSearch(post, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.content.toLowerCase().includes(q) ||
    (post.tags || []).some((tag) => tag.toLowerCase().includes(q))
  );
}

export function matchesFilters(post, filters) {
  const { platform, status, category } = filters;
  if (platform && platform !== 'All' && post.platform !== platform) return false;
  if (status && status !== 'All' && post.status !== status) return false;
  if (category && category !== 'All' && post.category !== category) return false;
  return true;
}

export function sortByScheduledAt(posts, direction = 'asc') {
  const copy = [...posts];
  copy.sort((a, b) => {
    const diff = new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0);
    return direction === 'asc' ? diff : -diff;
  });
  return copy;
}

export function getUniqueCategories(posts) {
  return Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
}

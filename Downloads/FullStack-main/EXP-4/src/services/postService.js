import { v4 as uuid } from 'uuid';

/**
 * This module simulates a real REST API using Promises and artificial
 * network delay. Because every function returns a Promise with the same
 * shape a real fetch() call would, swapping this out for a real backend
 * later only requires changing this file — nothing in components or Redux
 * needs to change.
 */

const STORAGE_KEY = 'contentflow.posts';
const DELAY_MS = 300;

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently,
    // the app still works in-memory for the session.
  }
}

function generateSeedPosts(count = 40) {
  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'YouTube'];
  const statuses = ['Draft', 'Scheduled', 'Published', 'Failed'];
  const categories = ['Technology', 'Marketing', 'Lifestyle', 'Education', 'Product'];
  const now = new Date();
  const posts = [];

  for (let i = 0; i < count; i += 1) {
    const dayOffset = Math.floor(Math.random() * 40) - 10;
    const scheduled = new Date(now);
    scheduled.setDate(now.getDate() + dayOffset);
    scheduled.setHours(8 + (i % 10), (i * 7) % 60, 0, 0);

    posts.push({
      id: `post-${i + 1}`,
      title: `${platforms[i % platforms.length]} update #${i + 1}`,
      content: `Sample content body for scheduled post number ${i + 1}. This showcases the content flow.`,
      platform: platforms[i % platforms.length],
      status: statuses[i % statuses.length],
      scheduledAt: scheduled.toISOString(),
      duration: 30,
      category: categories[i % categories.length],
      tags: ['React', 'Content', categories[i % categories.length]],
      image: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  return posts;
}

function ensureSeeded() {
  let posts = readStorage();
  if (!posts) {
    posts = generateSeedPosts();
    writeStorage(posts);
  }
  return posts;
}

export async function getPosts() {
  await delay();
  return [...ensureSeeded()];
}

export async function getPostById(id) {
  await delay();
  const posts = ensureSeeded();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    throw new Error(`Post with id "${id}" was not found.`);
  }
  return post;
}

export async function createPost(postData) {
  await delay();
  const posts = ensureSeeded();
  const now = new Date().toISOString();
  const newPost = {
    id: `post-${uuid()}`,
    createdAt: now,
    updatedAt: now,
    ...postData,
  };
  const updated = [newPost, ...posts];
  writeStorage(updated);
  return newPost;
}

export async function updatePost(id, changes) {
  await delay();
  const posts = ensureSeeded();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Cannot update: post "${id}" does not exist.`);
  }
  const updatedPost = { ...posts[index], ...changes, updatedAt: new Date().toISOString() };
  const updated = [...posts];
  updated[index] = updatedPost;
  writeStorage(updated);
  return updatedPost;
}

export async function deletePost(id) {
  await delay();
  const posts = ensureSeeded();
  const exists = posts.some((p) => p.id === id);
  if (!exists) {
    throw new Error(`Cannot delete: post "${id}" does not exist.`);
  }
  const updated = posts.filter((p) => p.id !== id);
  writeStorage(updated);
  return id;
}

export function resetMockData() {
  const posts = generateSeedPosts();
  writeStorage(posts);
  return posts;
}

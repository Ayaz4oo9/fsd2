# ContentFlow — Social Media Content Scheduler

A social media content scheduling dashboard built with **React + Redux
Toolkit**: full CRUD post management, a drag-and-drop calendar, search and
filtering, dashboard analytics, and a role-agnostic component library
backed by a Promise-based mock API. Built as an intermediate-level
Full Stack Development (FSD) project with an emphasis on Redux data flow,
memoization, and testable architecture.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| UI library | React 18 | Component model, hooks |
| Build tool | Vite | Fast dev server, native ESM |
| State management | Redux Toolkit (`createSlice`, `createAsyncThunk`, `createSelector`) | Predictable state, less boilerplate than classic Redux |
| Routing | React Router v6 | Client-side navigation between pages |
| Forms | React Hook Form | Uncontrolled inputs → fewer re-renders on typing |
| Mock backend | Custom `postService.js` (Promises + `localStorage`) | Simulates a real REST API without needing a server |
| Testing | Vitest + React Testing Library + `@testing-library/user-event` | Fast, Jest-compatible, first-class Vite support |

---

## 2. Folder Structure

```
src/
  app/
    store.js                # configureStore — combines all reducers
  features/
    posts/
      postSlice.js           # CRUD reducers + async thunks (fetch/create/update/delete)
      postSelectors.js        # createSelector-memoized derived data
    filters/
      filterSlice.js          # search term, platform/status/category filters, sort direction
    ui/
      uiSlice.js               # toast, confirm dialog, sidebar open/closed
  services/
    postService.js            # mock REST API: Promise + localStorage + seed data
  utils/
    dateUtils.js               # date formatting, "is today", week/day bucketing
    postUtils.js                # search/filter matching, sorting, platform/status constants
  components/
    Navbar/ Sidebar/            # app chrome
    Calendar/ CalendarEvent/     # custom drag-and-drop month/week/day grid
    PostCard/                     # memoized post card (with render-count logging)
    PostForm/                      # shared create/edit form (React Hook Form)
    PostModal/                      # modal wrapper around PostForm
    SearchBar/ FilterPanel/          # posts-page controls
    StatsCard/ EmptyState/            # small presentational pieces
    LoadingState/ ConfirmDialog/       # async/destructive-action UX
    Toast/                              # global notification banner
  pages/
    Dashboard.jsx        # stats + upcoming/recent posts (uses selectors)
    CalendarPage.jsx       # renders <Calendar> wired to postSlice
    PostsPage.jsx            # search + filter + CRUD list (useMemo/useCallback)
    CreatePostPage.jsx         # PostForm in create mode
    EditPostPage.jsx             # PostForm in edit mode, pre-filled
  tests/
    setup.js                       # jest-dom matchers for Vitest
    utils/dateUtils.test.js
    features/postSlice.test.js
    features/postSelectors.test.js
    features/filterSlice.test.js
    features/uiSlice.test.js
    components/PostCard.test.jsx
    components/PostForm.test.jsx
    components/FilterPanel.test.jsx
  App.jsx          # routing + layout only — no business logic
  main.jsx
  index.css
```

---

## 3. Installation & Running

```bash
npm install
npm run dev        # start the Vite dev server (usually http://localhost:5173)
npm run build       # production build
npm run preview      # preview the production build locally
npm test              # run the full Vitest suite once
npm run test:watch     # run tests in watch mode
npm run test:ui         # Vitest's browser-based test UI
```

The app seeds ~40 realistic mock posts into `localStorage` on first run
(key: `contentflow.posts`). To reset the mock data, clear that key from
`localStorage` and reload, or call `resetMockData()` exported from
`services/postService.js`.

---

## 4. Architecture: Phase-by-Phase

### Phase 1 — Domain model & mock API (`services/postService.js`)
Every post is a plain object: `{ id, title, content, platform, status,
category, tags, scheduledAt, duration, image, createdAt, updatedAt }`.
`postService.js` exposes `getPosts`, `getPostById`, `createPost`,
`updatePost`, `deletePost`, each returning a `Promise` after an artificial
300ms delay, and persisting to `localStorage`. This mirrors a real REST
API's shape so that swapping in a genuine backend later only touches this
one file — no component or Redux code changes.

### Phase 2 — Redux slices (`features/`)
Three slices, each owning one clearly bounded concern (the single most
important Redux Toolkit convention this project teaches):

- **`postSlice`** — the actual post data. Synchronous reducers
  (`setPosts`, `addPost`, `updatePost`, `deletePost`, `movePost`,
  `duplicatePost`, `publishPost`) handle in-memory mutations (via Immer);
  `createAsyncThunk`s (`fetchPosts`, `createPostAsync`, `updatePostAsync`,
  `deletePostAsync`) handle the round trip to `postService` and dispatch
  `pending` / `fulfilled` / `rejected` automatically.
- **`filterSlice`** — UI-driven query state: search term, platform/status/
  category filters, sort direction. Deliberately separate from `postSlice`
  so filtering logic never mutates the actual post data.
- **`uiSlice`** — ephemeral, non-persisted UI state: the active toast, the
  open confirm dialog, and sidebar collapsed/expanded. Kept out of
  `postSlice` so that slice stays pure domain data.

### Phase 3 — Memoized selectors (`postSelectors.js`)
Every derived value (posts by status, posts for a given day, dashboard
stat tallies, platform distribution, "upcoming" and "recent" lists) is
built with `createSelector`. Selectors only recompute when their *input*
selector's output reference changes — not on every store update — which
matters once the list grows into the hundreds. `selectPostsByPlatform`,
`selectPostsByDate`, and `selectPostById` are **selector factories**: they
take an argument and return a memoized selector, one of the more advanced
Redux Toolkit patterns (each call site gets its own memoization cache).

### Phase 4 — Pages & data flow (`pages/`)
- **Dashboard** reads `selectDashboardStats`, `selectUpcomingPosts`,
  `selectRecentPosts`, `selectPlatformDistribution` — pure display, no
  local filtering logic duplicated here.
- **PostsPage** owns search + filter state via `filterSlice`, combines it
  with `matchesSearch` / `matchesFilters` / `sortByScheduledAt` from
  `postUtils.js`, and wraps the combination in `useMemo` so the filtered
  list is only recomputed when posts or filters actually change. CRUD
  handlers (`onEdit`, `onDelete`, `onDuplicate`, `onPublish`) are wrapped
  in `useCallback` — required for `PostCard`'s `React.memo` to actually
  prevent re-renders (see Phase 5).
- **CalendarPage** renders the custom `Calendar` component, which supports
  dragging a `CalendarEvent` to a new day/time and dispatches `movePost`.
- **CreatePostPage** / **EditPostPage** both render `<PostForm>` — one
  form, two modes, differentiated only by `defaultValues` and the submit
  handler dispatched (`createPostAsync` vs. `updatePostAsync`).

### Phase 5 — Performance: `React.memo`, `useMemo`, `useCallback`
`PostCard` is wrapped in `React.memo` with a custom comparator, and logs a
per-instance render count in dev mode — open devtools, duplicate or delete
one post, and watch how few cards actually re-render. This only works
*because* the parent passes memoized callbacks (`useCallback`) and doesn't
recreate the `post` object on every render. `CalendarEvent` follows the
same pattern for the calendar grid, which can render dozens of events at
once. This is the core lesson: **memoization on a child is wasted effort
if the parent doesn't also memoize the props it passes down.**

### Phase 6 — Forms (`PostForm.jsx`)
React Hook Form keeps inputs uncontrolled — state lives in the DOM, not in
React — so keystrokes don't trigger component re-renders; only
validation-state changes do. `watch('status')` is the one exception: it's
used to conditionally require `scheduledDate` / `scheduledTime` only when
status is `"Scheduled"`, demonstrating conditional/cross-field validation
with RHF's `validate` function.

### Phase 7 — Testing (`tests/`)
- **Unit tests** (`dateUtils.test.js`) test pure functions in isolation.
- **Reducer tests** (`postSlice.test.js`, `filterSlice.test.js`,
  `uiSlice.test.js`) call the reducer directly with an action and assert
  on the returned state — no store, no React, no async needed for the
  synchronous cases.
- **Thunk tests** (`postSlice.test.js`) mock `postService` with
  `vi.mock`, build a real `configureStore`, dispatch the thunk, and assert
  on the resulting state for all three lifecycle outcomes (pending,
  fulfilled, rejected).
- **Selector tests** (`postSelectors.test.js`) assert both correctness
  (right posts returned) and **memoization** (same object reference
  returned when inputs haven't changed — this is what makes
  `createSelector` worth using over a plain function).
- **Component tests** (`PostCard`, `PostForm`, `FilterPanel`) use React
  Testing Library's guiding principle: query by what a user sees (role,
  label, text), not implementation details, and use `user-event` to
  simulate real clicks/typing/selecting rather than firing synthetic
  events directly.

---

## 5. Concept Checklist

Use this to self-check before an exam or viva. If you can explain *why*,
not just recite the term, you're ready.

- [ ] Why does Redux Toolkit's `createSlice` let you write "mutating"
      code inside reducers safely? (Immer)
- [ ] Why is `filterSlice` kept separate from `postSlice`, and `uiSlice`
      separate from both?
- [ ] What are the three action types `createAsyncThunk` automatically
      generates, and when does each fire?
- [ ] Why does `createSelector` avoid unnecessary recomputation — what
      does it compare, and what does "same reference" mean here?
- [ ] What's a **selector factory**, and why do `selectPostsByPlatform`
      and `selectPostById` need to be one instead of a plain selector?
- [ ] Why does `React.memo` on `PostCard` do nothing unless the parent's
      `onEdit`/`onDelete`/etc. are wrapped in `useCallback`?
- [ ] What's the difference between `useMemo` and `useCallback` — what
      does each memoize?
- [ ] Why are React Hook Form inputs "uncontrolled," and how does that
      reduce re-renders compared to controlled `useState` inputs?
- [ ] How does `PostForm` support both create and edit with a single
      component?
- [ ] Why does the mock API layer (`postService.js`) return Promises with
      artificial delay instead of resolving synchronously?
- [ ] What's the difference between testing a reducer directly vs.
      testing a thunk through a real store?
- [ ] Why does React Testing Library encourage querying by role/label
      instead of by CSS class or test id?

---

## 6. Viva / Interview Question Bank

**Redux Toolkit fundamentals**
1. What problems does Redux Toolkit solve compared to "classic" Redux
   (hand-written reducers, action types, and `combineReducers`)?
2. Explain `configureStore` — what does it set up for you automatically
   that plain `createStore` didn't?
3. Walk through what happens, step by step, when a component dispatches
   `deletePostAsync(id)`.
4. Why is it an anti-pattern to store derived/computed data (e.g. "posts
   filtered by search term") directly in the Redux store instead of
   computing it with a selector?

**Selectors & memoization**
5. What does `createSelector` do internally that a plain function like
   `const getScheduled = (state) => state.posts.posts.filter(...)`
   doesn't?
6. If a component calls `selectScheduledPosts(state)` twice with the same
   `state.posts.posts` reference, why is the second call cheap?
7. What would break if `selectPostsByPlatform` were written as a single
   shared selector instead of a factory returning a new selector per
   platform?

**React performance**
8. Why does duplicating one post in a 40-post list *not* cause all 40
   `PostCard`s to re-render in this app? Trace the full chain: state
   update → selector → `useMemo` → `useCallback` → `React.memo`.
9. What's the risk of over-using `useMemo`/`useCallback` everywhere,
   even where it's not needed?
10. What would happen to `PostCard`'s memoization if `onEdit` were defined
    inline (`onEdit={() => handleEdit(post.id)}`) instead of via
    `useCallback`?

**Forms**
11. Compare controlled vs. uncontrolled form inputs. Which does React
    Hook Form use by default, and why does that matter for performance
    in a form with 10+ fields?
12. How does `PostForm` conditionally require `scheduledDate` only when
    status is `"Scheduled"`? Why can't a plain `required: true` express
    that rule?

**Testing**
13. Why mock `postService` instead of letting `postSlice.test.js` thunks
    hit real `localStorage`?
14. What's the difference in intent between `expect(x).toBe(y)` and
    `expect(x).toEqual(y)`, and which matters for the memoization tests
    in `postSelectors.test.js`?
15. Why does React Testing Library discourage `container.querySelector`
    in favor of `screen.getByRole(...)`?

**Architecture / design decisions**
16. Why does `App.jsx` contain only routing and layout, with zero business
    logic?
17. Why is the mock API (`postService.js`) built to return Promises with
    the same shape a real `fetch` call would, rather than returning data
    synchronously?
18. If this app needed a real backend tomorrow, which files would change
    and which wouldn't? Why?

---

## 7. Known Limitations / Possible Extensions

- No authentication or multi-user support — all data is local to one
  browser's `localStorage`.
- Calendar drag-and-drop uses native HTML5 drag events, not a library —
  fine for learning, but a production app might reach for `dnd-kit` or
  `react-beautiful-dnd` for touch support and accessibility.
- No pagination — `PostsPage` renders the full filtered list at once,
  which is fine for dozens of posts but would need windowing (e.g.
  `react-window`) at much larger scale.
- No optimistic UI updates on the async thunks — the UI waits for the
  mock API's simulated round trip before reflecting changes.


## React Performance Demo

This version includes a live **Render Monitor** in the bottom-right corner.

- **Optimized mode:** calendar events use `React.memo`, while `useCallback` keeps event handlers stable and `useMemo` keeps calendar calculations cached.
- **Non-optimized mode:** the same calendar events render through the non-memoized component so an update to the calendar demonstrates unnecessary child renders.
- Drag any calendar post to another date and watch the monitor count the component instances that rendered during that interaction.
- In the optimized case, a typical single-post drag shows approximately **2 updated components**: `Calendar` + the moved `CalendarEvent`.
- In non-optimized mode, the `Calendar` plus every visible `CalendarEvent` is rendered.
- The visual design has also been refreshed with a soft glassmorphism/indigo-cyan theme.

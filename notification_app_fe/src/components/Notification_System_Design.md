# Notification System Design

## Stage 1

### Problem
Users lose track of important notifications due to high volume. A Priority Inbox
is needed that always shows the top N most important unread notifications.

### Priority Algorithm

Notifications are ranked using a composite priority score:
**Type Weights:**
| Type | Weight |
|------|--------|
| placement | 3 (Highest) |
| result | 2 (Medium) |
| event | 1 (Lowest) |

**Recency Score:**
- Calculated as: `(notificationTimestamp / maxTimestamp) × 100`
- Newer notifications get a higher recency score
- Ensures that within the same type, newer notifications rank higher

### Handling Continuous Incoming Notifications — Min Heap

A **Min-Heap of fixed size N** is maintained to efficiently track top N notifications.

**How it works:**
1. For each new notification, compute its priority score
2. If heap size < N → insert directly → O(log N)
3. If heap size = N and new score > heap minimum → replace minimum → O(log N)
4. Heap root always holds the lowest priority among top N

**Why Min-Heap?**
| Approach | Time per new notification | Space |
|----------|--------------------------|-------|
| Re-sort entire list | O(M log M) | O(M) |
| Min-Heap of size N | O(log N) | O(N) |

Where M = total notifications, N = top N size (e.g. 10).
The heap approach is significantly more efficient as M grows large.

### Data Flow
---

## Stage 2

### Architecture

A responsive React (TypeScript) single-page application with two pages:

**Page 1 — All Notifications (`/`)**
- Fetches all notifications from the API
- Displays with filter by type (placement / result / event)
- Tracks read/unread state using React useState (no database)
- Unread notifications are highlighted with colour and bold text
- Clicking a notification marks it as read

**Page 2 — Priority Inbox (`/priority`)**
- Fetches all notifications and computes top N using priority algorithm
- User can select N (10, 15, 20) via dropdown
- Filter by notification type
- Read/unread state shared across both pages

### Tech Stack
- React 18 with TypeScript
- Material UI (MUI) v5 for styling
- React Router v6 for navigation
- Fetch API for HTTP calls

### Logging
All significant events are logged via the reusable `Log()` middleware:
- Component mount/unmount
- API calls (start, success, failure)
- State changes (filter, topN, read status)
- Errors with descriptive messages

### Read/Unread Strategy
- A `Set<string>` of read notification IDs is maintained in App.tsx state
- Passed down to both pages via props
- When a notification card is clicked → ID added to Set → card re-renders as read
- No page refresh needed — pure React state management
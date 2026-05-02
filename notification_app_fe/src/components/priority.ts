import { Log } from "../utils/logger";

const BASE = "/evaluation-service";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqazY4ODlAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjI0MiwiaWF0IjoxNzc3NzA1MzQyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNWJhM2JhMTAtMGNmMS00YWEyLWEwYzItZmU0ZWY3ZDhkN2ZkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwic3ViIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4In0sImVtYWlsIjoiams2ODg5QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwicm9sbE5vIjoicmEyMzExMDU2MDEwMTk4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4IiwiY2xpZW50U2VjcmV0IjoiSlhtUGV2VUtTRlJ1Y0hnWSJ9.Xbj0eq53TeJjOfVCFtY35HwoxaO-L2JgXDP6VhAxLss";

interface Notification {
  id: string;
  type: "placement" | "result" | "event";
  message: string;
  timestamp: string;
}

interface ScoredNotification extends Notification {
  priorityScore: number;
}

const WEIGHTS: Record<string, number> = {
  placement: 3,
  result: 2,
  event: 1,
};

async function fetchNotifications(): Promise<Notification[]> {
  await Log("info", "api", "Fetching all notifications from server");
  const res = await fetch(`${BASE}/notifications`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) {
    await Log("error", "api", `Failed to fetch notifications: ${res.status}`);
    throw new Error(`HTTP error: ${res.status}`);
  }
  const rawData = await res.json();
  const data: Notification[] = (rawData.notifications || []).map((n: any) => ({
    id: n.ID,
    type: n.Type.toLowerCase() as "placement" | "result" | "event",
    message: n.Message,
    timestamp: n.Timestamp,
  }));
  await Log("info", "api", `Fetched ${data.length} notifications successfully`);
  return data;
}

function computePriorityScore(n: Notification, maxTime: number): number {
  const weight = WEIGHTS[n.type] ?? 0;
  const recency = (new Date(n.timestamp).getTime() / maxTime) * 100;
  return weight * 1000 + recency;
}

// MIN HEAP implementation for efficient top-N
class MinHeap {
  private heap: ScoredNotification[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number) { return 2 * i + 1; }
  private right(i: number) { return 2 * i + 2; }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(i: number) {
    while (i > 0 && this.heap[this.parent(i)].priorityScore > this.heap[i].priorityScore) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  private bubbleDown(i: number) {
    let min = i;
    if (this.left(i) < this.heap.length && this.heap[this.left(i)].priorityScore < this.heap[min].priorityScore) min = this.left(i);
    if (this.right(i) < this.heap.length && this.heap[this.right(i)].priorityScore < this.heap[min].priorityScore) min = this.right(i);
    if (min !== i) { this.swap(i, min); this.bubbleDown(min); }
  }

  insert(n: ScoredNotification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(n);
      this.bubbleUp(this.heap.length - 1);
    } else if (n.priorityScore > this.heap[0].priorityScore) {
      this.heap[0] = n;
      this.bubbleDown(0);
    }
  }

  getTop(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

async function getTopNotifications(topN = 10) {
  await Log("info", "util", `Starting priority computation for top ${topN}`);

  const notifications = await fetchNotifications();
  const maxTime = Math.max(...notifications.map((n) => new Date(n.timestamp).getTime()));

  const heap = new MinHeap(topN);

  for (const n of notifications) {
    const score = computePriorityScore(n, maxTime);
    heap.insert({ ...n, priorityScore: score });
  }

  const top = heap.getTop();

  await Log("info", "util", `Top ${topN} notifications computed using min-heap`);

  console.log(`\n====== TOP ${topN} PRIORITY NOTIFICATIONS ======\n`);
  top.forEach((n, i) => {
    console.log(`#${i + 1} [${n.type.toUpperCase()}] Score: ${n.priorityScore.toFixed(2)}`);
    console.log(`    Message  : ${n.message}`);
    console.log(`    Timestamp: ${new Date(n.timestamp).toLocaleString()}`);
    console.log(`    ID       : ${n.id}`);
    console.log("");
  });

  return top;
}

getTopNotifications(10);
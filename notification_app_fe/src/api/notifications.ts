import { Log } from "../utils/logger";

const BASE = "/evaluation-service";

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqazY4ODlAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjI0MiwiaWF0IjoxNzc3NzA1MzQyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNWJhM2JhMTAtMGNmMS00YWEyLWEwYzItZmU0ZWY3ZDhkN2ZkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwic3ViIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4In0sImVtYWlsIjoiams2ODg5QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwicm9sbE5vIjoicmEyMzExMDU2MDEwMTk4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4IiwiY2xpZW50U2VjcmV0IjoiSlhtUGV2VUtTRlJ1Y0hnWSJ9.Xbj0eq53TeJjOfVCFtY35HwoxaO-L2JgXDP6VhAxLss";

export interface Notification {
  id: string;
  type: "placement" | "result" | "event";
  message: string;
  timestamp: string;
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
};

export const fetchNotifications = async (type?: string): Promise<Notification[]> => {
  await Log("info", "api", `Fetching notifications, type=${type ?? "all"}`);
  try {
    const url = type ? `${BASE}/notifications?type=${type}` : `${BASE}/notifications`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      await Log("error", "api", `Fetch failed with status ${res.status}`);
      throw new Error(`Failed to fetch notifications: ${res.status}`);
    }
    const rawData = await res.json();
    const data: Notification[] = (rawData.notifications || []).map((n: any) => ({
      id: n.ID,
      type: n.Type.toLowerCase() as "placement" | "result" | "event",
      message: n.Message,
      timestamp: n.Timestamp,
    }));
    await Log("info", "api", `Received ${data.length} notifications`);
    return data;
  } catch (err: any) {
    await Log("error", "api", `Error fetching notifications: ${err.message}`);
    throw err;
  }
};

export const fetchPriorityNotifications = async (topN: number, type?: string): Promise<Notification[]> => {
  await Log("info", "api", `Fetching priority notifications, topN=${topN}`);
  try {
    const all = await fetchNotifications(type);
    const WEIGHTS: Record<string, number> = { placement: 3, result: 2, event: 1 };
    const maxTime = Math.max(...all.map((n) => new Date(n.timestamp).getTime()));
    const scored = all.map((n) => ({
      ...n,
      score: WEIGHTS[n.type] * 1000 + (new Date(n.timestamp).getTime() / maxTime) * 100,
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topN);
    await Log("info", "util", `Top ${topN} priority notifications computed`);
    return top;
  } catch (err: any) {
    await Log("error", "util", `Priority compute failed: ${err.message}`);
    throw err;
  }
};

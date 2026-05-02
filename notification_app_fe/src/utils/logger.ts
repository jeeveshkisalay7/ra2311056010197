const LOG_API = "/evaluation-service/log";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqazY4ODlAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjI0MiwiaWF0IjoxNzc3NzA1MzQyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNWJhM2JhMTAtMGNmMS00YWEyLWEwYzItZmU0ZWY3ZDhkN2ZkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwic3ViIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4In0sImVtYWlsIjoiams2ODg5QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiamVldmVzaCBraXNhbGF5Iiwicm9sbE5vIjoicmEyMzExMDU2MDEwMTk4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNTk1NTI5NjgtZWY2Yi00NWE4LTlmNzQtMjFlYmIzZmYyNTA4IiwiY2xpZW50U2VjcmV0IjoiSlhtUGV2VUtTRlJ1Y0hnWSJ9.Xbj0eq53TeJjOfVCFtY35HwoxaO-L2JgXDP6VhAxLss";

type Level = "info" | "warn" | "error" | "fatal" | "debug";
type Package = "component" | "api" | "state" | "util";

export const Log = async (level: Level, pkg: Package, message: string): Promise<void> => {
  try {
    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ stack: "frontend", level, package: pkg, message }),
    });
  } catch {
    // silent fail
  }
};

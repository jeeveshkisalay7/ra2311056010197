import React, { useEffect, useState, useCallback } from "react";
import { Container, Typography, Box, ToggleButton, ToggleButtonGroup, CircularProgress, Alert, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { fetchNotifications, Notification } from "../api/notifications";
import NotificationCard from "../components/NotificationCard";
import { Log } from "../utils/logger";

interface Props {
  readIds: Set<string>;
  onRead: (id: string) => void;
}

const AllNotifications: React.FC<Props> = ({ readIds, onRead }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (type?: string) => {
    setLoading(true);
    setError("");
    await Log("info", "component", `AllNotifications loading, filter=${type ?? "all"}`);
    try {
      const data = await fetchNotifications(type === "all" ? undefined : type);
      setNotifications(data);
      await Log("info", "state", `State updated with ${data.length} notifications`);
    } catch {
      setError("Failed to load notifications.");
      await Log("error", "component", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Log("info", "component", "AllNotifications mounted");
    loadNotifications();
  }, [loadNotifications]);

  const handleFilter = async (_: any, value: string) => {
    if (!value) return;
    setFilter(value);
    await Log("info", "state", `Filter changed to: ${value}`);
    loadNotifications(value);
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsIcon fontSize="large" color="action" />
        </Badge>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>All Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread · {notifications.length} total
          </Typography>
        </Box>
      </Box>

      <ToggleButtonGroup value={filter} exclusive onChange={handleFilter} sx={{ mb: 3, flexWrap: "wrap" }}>
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="placement">Placement</ToggleButton>
        <ToggleButton value="result">Result</ToggleButton>
        <ToggleButton value="event">Event</ToggleButton>
      </ToggleButtonGroup>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}
      {!loading && notifications.map((n) => (
        <NotificationCard key={n.id} notification={n} isRead={readIds.has(n.id)} onRead={onRead} />
      ))}
    </Container>
  );
};

export default AllNotifications;
import React, { useEffect, useState, useCallback } from "react";
import { Container, Typography, Box, ToggleButton, ToggleButtonGroup, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { fetchPriorityNotifications, Notification } from "../api/notifications";
import NotificationCard from "../components/NotificationCard";
import { Log } from "../utils/logger";

interface Props {
  readIds: Set<string>;
  onRead: (id: string) => void;
}

const PriorityNotifications: React.FC<Props> = ({ readIds, onRead }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [topN, setTopN] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPriority = useCallback(async (n: number, type?: string) => {
    setLoading(true);
    setError("");
    await Log("info", "component", `Loading priority notifications topN=${n} filter=${type ?? "all"}`);
    try {
      const data = await fetchPriorityNotifications(n, type === "all" ? undefined : type);
      setNotifications(data);
      await Log("info", "state", `Priority state updated with ${data.length} items`);
    } catch {
      setError("Failed to load priority notifications.");
      await Log("error", "component", "Failed to load priority notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Log("info", "component", "PriorityNotifications mounted");
    loadPriority(topN);
  }, [loadPriority, topN]);

  const handleFilter = async (_: any, value: string) => {
    if (!value) return;
    setFilter(value);
    await Log("info", "state", `Priority filter: ${value}`);
    loadPriority(topN, value);
  };

  const handleTopN = async (value: number) => {
    setTopN(value);
    await Log("info", "state", `TopN changed to: ${value}`);
    loadPriority(value, filter);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <StarIcon fontSize="large" sx={{ color: "#f57c00" }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Priority Inbox</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing top {topN} most important notifications
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ToggleButtonGroup value={filter} exclusive onChange={handleFilter}>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="placement">Placement</ToggleButton>
          <ToggleButton value="result">Result</ToggleButton>
          <ToggleButton value="event">Event</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Show Top</InputLabel>
          <Select value={topN} label="Show Top" onChange={(e) => handleTopN(Number(e.target.value))}>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No priority notifications found.</Alert>
      )}
      {!loading && notifications.map((n, index) => (
        <Box key={n.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, color: "#f57c00", minWidth: 28, mt: 2 }}>
            #{index + 1}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <NotificationCard notification={n} isRead={readIds.has(n.id)} onRead={onRead} />
          </Box>
        </Box>
      ))}
    </Container>
  );
};

export default PriorityNotifications;
import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArticleIcon from "@mui/icons-material/Article";
import { Notification } from "../api/notifications";
import { Log } from "../utils/logger";

interface Props {
  notification: Notification;
  isRead: boolean;
  onRead: (id: string) => void;
}

const typeConfig = {
  placement: { color: "error" as const, icon: <WorkIcon fontSize="small" />, bg: "#fff3e0", border: "#e65100" },
  result: { color: "warning" as const, icon: <EmojiEventsIcon fontSize="small" />, bg: "#f3e5f5", border: "#7b1fa2" },
  event: { color: "success" as const, icon: <ArticleIcon fontSize="small" />, bg: "#e8f5e9", border: "#2e7d32" },
};

const NotificationCard: React.FC<Props> = ({ notification, isRead, onRead }) => {
  const config = typeConfig[notification.type];

  const handleClick = async () => {
    if (!isRead) {
      await Log("info", "component", `Notification marked as read: ${notification.id}`);
      onRead(notification.id);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        mb: 2,
        cursor: "pointer",
        backgroundColor: isRead ? "#fafafa" : config.bg,
        border: `1.5px solid ${isRead ? "#e0e0e0" : config.border}`,
        opacity: isRead ? 0.75 : 1,
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Chip icon={config.icon} label={notification.type.toUpperCase()} color={config.color} size="small" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!isRead && <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#1565C0" }} />}
            <Typography variant="caption" color="text.secondary">
              {new Date(notification.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{ fontWeight: isRead ? 400 : 700 }}
          color={isRead ? "text.secondary" : "text.primary"}
        >
          {notification.message}
        </Typography>
        {isRead && <Typography variant="caption" color="text.disabled">✓ Read</Typography>}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button, Container, CssBaseline } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import AllNotifications from "./pages/AllNotifications";
import PriorityNotifications from "./pages/PriorityNotifications";
import { Log } from "./utils/logger";

const NavBar: React.FC = () => {
  const location = useLocation();
  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#1565C0" }}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Campus Notifications</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button component={Link} to="/" startIcon={<NotificationsIcon />} sx={{ color: "white", backgroundColor: location.pathname === "/" ? "rgba(255,255,255,0.2)" : "transparent", "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }}>All</Button>
          <Button component={Link} to="/priority" startIcon={<StarIcon />} sx={{ color: "white", backgroundColor: location.pathname === "/priority" ? "rgba(255,255,255,0.2)" : "transparent", "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }}>Priority</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const handleRead = useCallback(async (id: string) => {
    setReadIds((prev) => { const updated = new Set(prev); updated.add(id); return updated; });
    await Log("info", "state", `Notification marked as read: ${id}`);
  }, []);
  return (
    <Router>
      <CssBaseline />
      <NavBar />
      <Container disableGutters maxWidth={false}>
        <Routes>
          <Route path="/" element={<AllNotifications readIds={readIds} onRead={handleRead} />} />
          <Route path="/priority" element={<PriorityNotifications readIds={readIds} onRead={handleRead} />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;

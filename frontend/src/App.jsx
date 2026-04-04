import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginModal from "./components/LoginModal";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Home from "./pages/Home";
import { fetchSettings, login, logout, updateSettings } from "./services/api";

export default function App() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settings, setSettings] = useState({
    face_weight: 0.3,
    voice_weight: 0.4,
    text_weight: 0.3,
    theme: "dark",
  });
  const [user, setUser] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSettings({
          face_weight: data.face_weight,
          voice_weight: data.voice_weight,
          text_weight: data.text_weight,
          theme: data.theme,
        });
        applyTheme(data.theme);
      })
      .catch(() => applyTheme("dark"));
  }, []);

  const applyTheme = (theme) => {
    document.body.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    setSettings((prev) => ({ ...prev, theme }));
  };

  const handleSaveSettings = async () => {
    const data = await updateSettings(settings);
    setSettings({
      face_weight: data.face_weight,
      voice_weight: data.voice_weight,
      text_weight: data.text_weight,
      theme: data.theme,
    });
    applyTheme(data.theme);
    setSettingsOpen(false);
  };

  const handleLogin = async (form) => {
    const response = await login(form);
    if (response.authenticated) {
      setUser(response.username);
    }
  };

  const handleAuthAction = async () => {
    if (user) {
      await logout();
      setUser("");
      setSettingsOpen(false);
      return;
    }
    setLoginOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((prev) => !prev)}
        settings={settings}
        setSettings={setSettings}
        onSaveSettings={handleSaveSettings}
        theme={settings.theme}
        onThemeToggle={() => applyTheme(settings.theme === "dark" ? "light" : "dark")}
        user={user}
        onAuthAction={handleAuthAction}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </AnimatePresence>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
    </div>
  );
}

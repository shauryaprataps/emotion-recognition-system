import { Link, NavLink } from "react-router-dom";
import SettingsDropdown from "./SettingsDropdown";

const navClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-white" : "text-slate-300 hover:text-white"}`;

export default function Navbar(props) {
  const {
    settingsOpen,
    onToggleSettings,
    settings,
    setSettings,
    onSaveSettings,
    theme,
    onThemeToggle,
    user,
    onAuthAction,
  } = props;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-6">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={navClass}>
            History
          </NavLink>
        </nav>
        <Link to="/" className="font-display text-center text-xl font-semibold tracking-[0.15em] text-white">
          Emotion Recognition System
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 md:block">
            {user ? `Signed in as ${user}` : "Guest mode"}
          </div>
          <SettingsDropdown
            open={settingsOpen}
            onToggle={onToggleSettings}
            settings={settings}
            setSettings={setSettings}
            onSave={onSaveSettings}
            theme={theme}
            onThemeToggle={onThemeToggle}
            user={user}
            onAuthAction={onAuthAction}
          />
        </div>
      </div>
    </header>
  );
}

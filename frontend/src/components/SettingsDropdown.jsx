import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function SettingsDropdown({
  open,
  onToggle,
  settings,
  setSettings,
  onSave,
  theme,
  onThemeToggle,
  user,
  onAuthAction,
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full border border-white/10 bg-white/10 p-3 transition hover:bg-white/20"
      >
        <Settings size={18} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass-card absolute right-0 z-40 mt-3 w-80 space-y-5 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Settings</h3>
              <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
            {[
              ["face_weight", "Face Weight"],
              ["voice_weight", "Voice Weight"],
              ["text_weight", "Text Weight"],
            ].map(([key, label]) => (
              <label key={key} className="block space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span>{(settings[key] * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings[key]}
                  onChange={(event) => setSettings((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                  className="w-full"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={onSave}
              className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Fusion Settings
            </button>
            <button
              type="button"
              onClick={onAuthAction}
              className="w-full rounded-full border border-white/10 px-4 py-2 text-sm"
            >
              {user ? "Logout" : "Login"}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

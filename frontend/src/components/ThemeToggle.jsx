export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

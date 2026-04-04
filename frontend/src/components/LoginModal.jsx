import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function LoginModal({ open, onClose, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    await onLogin(form);
    setForm({ username: "", password: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={submit}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0 }}
            className="glass-card w-full max-w-md space-y-5 p-7"
          >
            <div>
              <h2 className="font-display text-2xl font-semibold">Prototype Login</h2>
              <p className="mt-2 text-sm text-slate-300">
                This placeholder auth flow is intentionally simple and easy to replace later.
              </p>
            </div>
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Username"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none"
              required
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white">
                Login
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

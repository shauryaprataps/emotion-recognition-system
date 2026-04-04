import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-200">
            Multimodal AI Prototype
          </span>
          <h1 className="font-display text-5xl font-semibold leading-tight text-white md:text-6xl">
            Understand emotion through face, voice, and language in one system.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            This platform combines facial expression analysis, speech emotion recognition, and transformer-based text
            classification using weighted fusion to generate a final report.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400"
            >
              Launch Dashboard
            </Link>
            <Link to="/history" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white">
              View Session History
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card grid gap-5 p-6"
        >
          {[
            ["Face Intelligence", "DeepFace facial emotion inference aligned to seven normalized labels."],
            ["Voice Intelligence", "SpeechBrain wav2vec2 SER for practical speech signal understanding."],
            ["Text Intelligence", "DistilRoBERTa emotion model mapped into the common emotion space."],
            ["Weighted Fusion", "Dynamic probability fusion with missing-modality normalization."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{body}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

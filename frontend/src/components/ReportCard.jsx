import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#38bdf8", "#f97316", "#f43f5e", "#22c55e", "#eab308", "#8b5cf6", "#94a3b8"];

export default function ReportCard({ report, ratings, detail, onDownload }) {
  if (!report && !detail) return null;

  const reportRatings = detail?.ratings || ratings || {};
  const reportText = detail?.report_text;
  const fusedProbabilities = detail?.fused_probs || {};
  const modalityData = [
    { name: "Face", emotion: detail?.face_emotion || "-" },
    { name: "Voice", emotion: detail?.voice_emotion || "-" },
    { name: "Text", emotion: detail?.text_emotion || "-" },
  ];
  const fusedData = Object.entries(fusedProbabilities).map(([name, value]) => ({
    name,
    value: +(value * 100).toFixed(1),
  }));
  const ratingsData = Object.entries(reportRatings).map(([name, value]) => ({
    metric: name.replaceAll("_", " "),
    value,
  }));

  return (
    <div className="glass-card space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">Professional Report</h3>
          <p className="mt-2 text-sm text-slate-300">
            {detail
              ? `Saved session ${detail.session_id} generated at ${new Date(detail.timestamp).toLocaleString()}.`
              : report?.interpretation}
          </p>
        </div>
        {detail ? (
          <button
            type="button"
            onClick={onDownload}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Download Report
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Object.entries(reportRatings).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key.replaceAll("_", " ")}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Fused Emotion Pie</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fusedData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={56}>
                  {fusedData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Ratings Radar</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={ratingsData}>
                <PolarGrid stroke="rgba(148,163,184,0.25)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {Object.keys(fusedProbabilities).length ? (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Fused Probabilities</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(fusedProbabilities).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <p className="text-sm capitalize text-slate-300">{key}</p>
                <p className="mt-1 text-lg font-semibold">{(value * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Probability Bars</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fusedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {fusedData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Modality Summary</p>
          <div className="space-y-3">
            {modalityData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.name}</p>
                <p className="mt-2 text-xl font-semibold capitalize">{item.emotion || "-"}</p>
              </div>
            ))}
            {detail ? (
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Final Emotion</p>
                <p className="mt-2 text-2xl font-semibold capitalize">{detail.final_emotion}</p>
                <p className="mt-1 text-sm text-slate-300">Confidence {(detail.final_confidence * 100).toFixed(1)}%</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {reportText ? (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Full Report Text</p>
          <pre className="overflow-auto whitespace-pre-wrap text-sm text-slate-200">{reportText}</pre>
        </div>
      ) : null}
    </div>
  );
}

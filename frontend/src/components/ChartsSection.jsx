import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const COLORS = ["#38bdf8", "#f97316", "#f43f5e", "#22c55e", "#eab308", "#8b5cf6", "#94a3b8"];

export default function ChartsSection({ fusedProbabilities, historyRows }) {
  const fusedData = Object.entries(fusedProbabilities || {}).map(([emotion, value]) => ({
    emotion,
    value: +(value * 100).toFixed(2),
  }));
  const trendData = historyRows
    .slice(0, 6)
    .reverse()
    .map((item, index) => ({
      name: `S${index + 1}`,
      confidence: +(item.final_confidence * 100).toFixed(1),
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass-card h-80 p-5">
        <h3 className="mb-4 font-display text-xl font-semibold">Fused Emotion Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fusedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="emotion" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[12, 12, 0, 0]}>
              {fusedData.map((entry, index) => (
                <Cell key={entry.emotion} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card h-80 p-5">
        <h3 className="mb-4 font-display text-xl font-semibold">Recent Confidence Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={trendData} dataKey="confidence" nameKey="name" outerRadius={95} innerRadius={55}>
              {trendData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

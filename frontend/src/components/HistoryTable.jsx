export default function HistoryTable({ rows, onSelect, selectedId }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              {["Session ID", "Timestamp", "Face", "Voice", "Text", "Final", "Score"].map((item) => (
                <th key={item} className="px-4 py-4 font-medium">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.session_id}
                className={`cursor-pointer border-t border-white/5 transition hover:bg-white/5 ${
                  selectedId === row.session_id ? "bg-brand-500/10" : ""
                }`}
                onClick={() => onSelect(row.session_id)}
              >
                <td className="px-4 py-4 font-mono text-xs">{row.session_id}</td>
                <td className="px-4 py-4">{new Date(row.timestamp).toLocaleString()}</td>
                <td className="px-4 py-4 capitalize">{row.face_emotion || "-"}</td>
                <td className="px-4 py-4 capitalize">{row.voice_emotion || "-"}</td>
                <td className="px-4 py-4 capitalize">{row.text_emotion || "-"}</td>
                <td className="px-4 py-4 capitalize">{row.final_emotion}</td>
                <td className="px-4 py-4">{(row.final_confidence * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import ChartsSection from "../components/ChartsSection";
import HistoryTable from "../components/HistoryTable";
import { fetchHistory, fetchHistoryDetail } from "../services/api";

export default function History() {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchHistory().then((data) => {
      setRows(data);
      if (data[0]) setSelectedId(data[0].session_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchHistoryDetail(selectedId).then(setDetail);
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <h1 className="section-title text-white">Session History</h1>
        <p className="text-slate-300">
          Review stored multimodal analysis runs, inspect fused scores, and open the generated report.
        </p>
      </div>
      <HistoryTable rows={rows} onSelect={setSelectedId} selectedId={selectedId} />

      {detail ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card space-y-4 p-6">
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span>Session: {detail.session_id}</span>
              <span>Final emotion: {detail.final_emotion}</span>
              <span>Confidence: {(detail.final_confidence * 100).toFixed(1)}%</span>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200">
              {detail.report_text}
            </pre>
          </div>
          <ChartsSection fusedProbabilities={detail.fused_probs} historyRows={rows} />
        </div>
      ) : null}
    </div>
  );
}

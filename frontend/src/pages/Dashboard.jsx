import { useEffect, useState } from "react";
import EmotionCard from "../components/EmotionCard";
import UploadSection from "../components/UploadSection";
import ChartsSection from "../components/ChartsSection";
import ReportCard from "../components/ReportCard";
import { fetchHistory, fetchHistoryDetail, predictEmotion } from "../services/api";

export default function Dashboard() {
  const [faceFile, setFaceFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveBusy, setLiveBusy] = useState(false);
  const [liveFaceMode, setLiveFaceMode] = useState(false);
  const [liveAudioMode, setLiveAudioMode] = useState(false);
  const [liveTextMode, setLiveTextMode] = useState(false);
  const [liveFaceFrame, setLiveFaceFrame] = useState(null);
  const [liveAudioChunk, setLiveAudioChunk] = useState(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState("");
  const [error, setError] = useState("");
  const [endAnalysisSignal, setEndAnalysisSignal] = useState(0);
  const [analysisEnded, setAnalysisEnded] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState("");
  const [savedReportDetail, setSavedReportDetail] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    fetchHistory().then(setHistoryRows).catch(() => undefined);
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    setAnalysisEnded(false);
    setSavedSessionId("");
    setSavedReportDetail(null);
    setShowFullReport(false);
    try {
      const data = await predictEmotion({ faceFile, audioFile, text });
      setResult(data);
      const updatedHistory = await fetchHistory();
      setHistoryRows(updatedHistory);
    } catch (err) {
      setError(err?.response?.data?.detail || "Emotion analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const runLiveFusionAnalysis = async () => {
    if (liveBusy) return;
    const hasLiveFace = liveFaceMode && liveFaceFrame;
    const hasLiveAudio = liveAudioMode && liveAudioChunk;
    const hasLiveText = liveTextMode && text.trim();
    if (!hasLiveFace && !hasLiveAudio && !hasLiveText) return;

    setLiveBusy(true);
    try {
      const data = await predictEmotion({
        faceFile: hasLiveFace ? liveFaceFrame : null,
        audioFile: hasLiveAudio ? liveAudioChunk : null,
        text: hasLiveText ? text : "",
        saveSession: false,
      });
      setResult(data);
      setLiveUpdatedAt(new Date().toLocaleTimeString());
      setError("");
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || "Live multimodal analysis failed.";
      if (status === 422) {
        setError("One live frame was unclear. The analyzer will keep updating.");
      } else {
        setError(detail);
        setLiveFaceMode(false);
        setLiveAudioMode(false);
        setLiveTextMode(false);
      }
    } finally {
      setLiveBusy(false);
    }
  };

  useEffect(() => {
    if (!liveFaceMode && !liveAudioMode && !liveTextMode) return undefined;

    const interval = setInterval(() => {
      runLiveFusionAnalysis();
    }, 1800);

    return () => clearInterval(interval);
  }, [liveFaceMode, liveAudioMode, liveTextMode, liveFaceFrame, liveAudioChunk, text, liveBusy]);

  useEffect(() => {
    if (liveBusy) return;
    const hasLiveFace = liveFaceMode && liveFaceFrame;
    const hasLiveAudio = liveAudioMode && liveAudioChunk;
    const hasLiveText = liveTextMode && text.trim();
    if (!hasLiveFace && !hasLiveAudio && !hasLiveText) return;

    const timeout = setTimeout(() => {
      runLiveFusionAnalysis();
    }, 150);

    return () => clearTimeout(timeout);
  }, [liveFaceFrame, liveAudioChunk, text, liveFaceMode, liveAudioMode, liveTextMode]);

  const startLiveFaceMode = async (startCamera) => {
    setError("");
    setFaceFile(null);
    setAnalysisEnded(false);
    setSavedSessionId("");
    setSavedReportDetail(null);
    setShowFullReport(false);
    const ok = await startCamera?.();
    if (!ok) {
      setError("Camera access is required before live face analysis can start.");
      setLiveFaceMode(false);
      return;
    }
    setLiveFaceMode(true);
  };

  const startLiveAudioMode = async (startLiveAudio) => {
    setError("");
    setAudioFile(null);
    setAnalysisEnded(false);
    setSavedSessionId("");
    setSavedReportDetail(null);
    setShowFullReport(false);
    const ok = await startLiveAudio?.();
    if (!ok) {
      setError("Microphone access is required before live audio analysis can start.");
      setLiveAudioMode(false);
      return false;
    }
    setLiveAudioMode(true);
    return true;
  };

  const endAnalysis = () => {
    setLiveFaceMode(false);
    setLiveAudioMode(false);
    setLiveTextMode(false);
    setLiveBusy(false);
    setLiveUpdatedAt("");
    setEndAnalysisSignal((prev) => prev + 1);
    setAnalysisEnded(true);
    setShowFullReport(false);
  };

  const generateFinalReport = async () => {
    if (!result) {
      setError("Run an analysis first before generating a report.");
      return;
    }

    const finalFace = faceFile || liveFaceFrame;
    const finalAudio = audioFile || liveAudioChunk;
    const finalText = text?.trim() ? text : "";

    if (!finalFace && !finalAudio && !finalText) {
      setError("No session inputs are available to save into a report.");
      return;
    }

    setReportSaving(true);
    setError("");
    try {
      const data = await predictEmotion({
        faceFile: finalFace,
        audioFile: finalAudio,
        text: finalText,
        saveSession: true,
      });
      setResult(data);
      setSavedSessionId(data.session_id);
      const detail = await fetchHistoryDetail(data.session_id);
      setSavedReportDetail(detail);
      setShowFullReport(true);
      const updatedHistory = await fetchHistory();
      setHistoryRows(updatedHistory);
    } catch (err) {
      setError(err?.response?.data?.detail || "Report generation failed.");
    } finally {
      setReportSaving(false);
    }
  };

  const finalCard = result
    ? {
        emotion: result.final_emotion,
        confidence: result.final_confidence,
        probabilities: result.fused_probabilities,
      }
    : null;

  const downloadReport = () => {
    if (!savedReportDetail) return;
    const html = buildReportHtml(savedReportDetail);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `emotion-report-${savedReportDetail.session_id}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (showFullReport && savedReportDetail) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title text-white">Session Report</h1>
            <p className="mt-2 text-slate-300">
              Full saved report for session {savedReportDetail.session_id}.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowFullReport(false)}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              Back To Dashboard
            </button>
            <button
              type="button"
              onClick={downloadReport}
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Download Report
            </button>
          </div>
        </div>

        <ReportCard
          report={result?.report}
          ratings={result?.ratings}
          detail={savedReportDetail}
          onDownload={downloadReport}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="section-title text-white">Analysis Dashboard</h1>
            <p className="max-w-3xl text-slate-300">
              Add any combination of face, voice, and text. The backend will infer modality-specific probabilities, align
              them to a common label space, and compute a weighted fused result.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={endAnalysis}
              className="rounded-full border border-rose-400/30 bg-rose-500/15 px-5 py-3 text-sm font-semibold text-rose-200"
            >
              End Analysis
            </button>
            <button
              type="button"
              onClick={generateFinalReport}
              disabled={!analysisEnded || reportSaving}
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reportSaving ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      <UploadSection
        faceFile={faceFile}
        audioFile={audioFile}
        text={text}
        onFaceChange={(event) => setFaceFile(event.target.files?.[0] || null)}
        onAudioChange={(event) => setAudioFile(event.target.files?.[0] || null)}
        onFaceFile={setFaceFile}
        onAudioFile={setAudioFile}
        onTextChange={setText}
        liveFaceMode={liveFaceMode}
        liveAudioMode={liveAudioMode}
        liveTextMode={liveTextMode}
        onToggleLiveFaceMode={() => {
          setLiveFaceMode((prev) => !prev);
          setLiveUpdatedAt("");
          setLiveFaceFrame(null);
        }}
        onStartLiveFaceMode={startLiveFaceMode}
        onLiveFaceFrame={setLiveFaceFrame}
        onToggleLiveAudioMode={() => {
          setLiveAudioMode((prev) => !prev);
          setLiveUpdatedAt("");
          setLiveAudioChunk(null);
        }}
        onStartLiveAudioMode={startLiveAudioMode}
        onLiveAudioChunk={setLiveAudioChunk}
        onToggleLiveTextMode={() => {
          setLiveTextMode((prev) => !prev);
          setLiveUpdatedAt("");
        }}
        liveBusy={liveBusy}
        endAnalysisSignal={endAnalysisSignal}
        onClearFace={() => {
          setFaceFile(null);
        }}
        onClearAudio={() => setAudioFile(null)}
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze Emotion"}
        </button>
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
        {(liveFaceMode || liveAudioMode || liveTextMode) && liveUpdatedAt ? (
          <span className="text-sm text-emerald-300">Live updated at {liveUpdatedAt}</span>
        ) : null}
        {analysisEnded ? <span className="text-sm text-amber-200">Analysis ended. Generate report to save this session.</span> : null}
        {savedSessionId ? <span className="text-sm text-emerald-300">Report saved as session {savedSessionId}</span> : null}
        {(liveFaceMode || liveAudioMode || liveTextMode) ? (
          <span className="text-sm text-brand-200">
            Live modes active:
            {` face ${liveFaceMode ? "on" : "off"}, voice ${liveAudioMode ? "on" : "off"}, text ${liveTextMode ? "on" : "off"}`}
          </span>
        ) : null}
        {result?.effective_weights ? (
          <span className="text-sm text-slate-300">
            Active fusion weights: face {((result.effective_weights.face || 0) * 100).toFixed(0)}%, voice{" "}
            {((result.effective_weights.voice || 0) * 100).toFixed(0)}%, text {((result.effective_weights.text || 0) * 100).toFixed(0)}%
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <EmotionCard title="Face Emotion" result={result?.face} />
        <EmotionCard title="Voice Emotion" result={result?.voice} />
        <EmotionCard title="Text Emotion" result={result?.text} />
        <EmotionCard title="Final Fused Emotion" result={finalCard} highlight />
      </div>

      <ChartsSection fusedProbabilities={result?.fused_probabilities} historyRows={historyRows} />
    </div>
  );
}

function buildReportHtml(detail) {
  const fusedEntries = Object.entries(detail.fused_probs || {});
  const ratingsEntries = Object.entries(detail.ratings || {});
  const pieSegments = fusedEntries
    .map(([_, value], index) => {
      const colors = ["#38bdf8", "#f97316", "#f43f5e", "#22c55e", "#eab308", "#8b5cf6", "#94a3b8"];
      return `${colors[index % colors.length]} ${pieOffset(fusedEntries, index)}% ${pieOffset(fusedEntries, index + 1)}%`;
    })
    .join(", ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Emotion Report ${detail.session_id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 1100px; margin: 0 auto; }
    .card { background: #111827; border: 1px solid rgba(255,255,255,.08); border-radius: 24px; padding: 24px; margin-bottom: 20px; }
    .grid { display: grid; gap: 16px; }
    .grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .metric { background: rgba(255,255,255,.04); border-radius: 16px; padding: 16px; }
    .label { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #94a3b8; }
    .value { font-size: 28px; font-weight: 700; margin-top: 8px; }
    .bar { height: 12px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; }
    .fill { height: 12px; border-radius: 999px; background: linear-gradient(90deg, #38bdf8, #22d3ee); }
    .row { margin-bottom: 14px; }
    .pie { width: 260px; height: 260px; margin: 0 auto; border-radius: 999px; background: conic-gradient(${pieSegments}); }
    pre { white-space: pre-wrap; font-size: 14px; line-height: 1.5; }
    @media (max-width: 900px) { .grid-5, .grid-2 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Emotion Recognition Report</h1>
      <p>Session ${detail.session_id} generated at ${new Date(detail.timestamp).toLocaleString()}</p>
      <p><strong>Final Emotion:</strong> ${detail.final_emotion} | <strong>Confidence:</strong> ${(detail.final_confidence * 100).toFixed(1)}%</p>
    </div>
    <div class="card">
      <div class="grid grid-5">
        ${ratingsEntries
          .map(
            ([key, value]) => `
          <div class="metric">
            <div class="label">${key.replaceAll("_", " ")}</div>
            <div class="value">${value}</div>
          </div>`,
          )
          .join("")}
      </div>
    </div>
    <div class="card">
      <div class="grid grid-2">
        <div>
          <div class="label">Fused Emotion Pie</div>
          <div class="pie"></div>
        </div>
        <div>
          <div class="label">Fused Probabilities</div>
          ${fusedEntries
            .map(
              ([key, value]) => `
            <div class="row">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${key}</span><span>${(value * 100).toFixed(1)}%</span></div>
              <div class="bar"><div class="fill" style="width:${(value * 100).toFixed(1)}%"></div></div>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="grid grid-2">
        <div class="metric"><div class="label">Face Emotion</div><div class="value" style="font-size:22px;text-transform:capitalize;">${detail.face_emotion || "-"}</div></div>
        <div class="metric"><div class="label">Voice Emotion</div><div class="value" style="font-size:22px;text-transform:capitalize;">${detail.voice_emotion || "-"}</div></div>
        <div class="metric"><div class="label">Text Emotion</div><div class="value" style="font-size:22px;text-transform:capitalize;">${detail.text_emotion || "-"}</div></div>
        <div class="metric"><div class="label">Inputs Used</div><div class="value" style="font-size:16px;">${Object.entries(detail.inputs_used || {}).filter(([, used]) => used).map(([k]) => k).join(", ")}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="label">Full Report Text</div>
      <pre>${escapeHtml(detail.report_text || "")}</pre>
    </div>
  </div>
</body>
</html>`;
}

function pieOffset(entries, endIndex) {
  return entries.slice(0, endIndex).reduce((sum, [, value]) => sum + value * 100, 0).toFixed(2);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

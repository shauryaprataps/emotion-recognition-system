import { ImageIcon, Mic, Square, Type, Video, Waves, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function UploadSection({
  faceFile,
  audioFile,
  text,
  onFaceChange,
  onAudioChange,
  onFaceFile,
  onAudioFile,
  onTextChange,
  liveFaceMode,
  liveAudioMode,
  liveTextMode,
  onToggleLiveFaceMode,
  onStartLiveFaceMode,
  onToggleLiveAudioMode,
  onStartLiveAudioMode,
  onToggleLiveTextMode,
  onLiveFaceFrame,
  onLiveAudioChunk,
  liveBusy,
  endAnalysisSignal,
  onClearFace,
  onClearAudio,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const liveAudioStreamRef = useRef(null);
  const liveAudioContextRef = useRef(null);
  const liveAudioSourceRef = useRef(null);
  const liveAudioProcessorRef = useRef(null);
  const liveAudioBuffersRef = useRef([]);
  const liveAudioSampleRateRef = useRef(44100);
  const liveAudioIntervalRef = useRef(null);
  const recordAudioStreamRef = useRef(null);
  const recordAudioContextRef = useRef(null);
  const recordAudioSourceRef = useRef(null);
  const recordAudioProcessorRef = useRef(null);
  const recordAudioBuffersRef = useRef([]);
  const recordAudioSampleRateRef = useRef(44100);
  const [cameraStream, setCameraStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const facePreview = useMemo(() => (faceFile ? URL.createObjectURL(faceFile) : ""), [faceFile]);
  const audioPreview = useMemo(() => (audioFile ? URL.createObjectURL(audioFile) : ""), [audioFile]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (facePreview) URL.revokeObjectURL(facePreview);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [cameraStream, facePreview, audioPreview]);

  const startCamera = async () => {
    if (cameraStream) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      return true;
    } catch {
      return false;
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], `webcam-${Date.now()}.jpg`, { type: "image/jpeg" });
      onFaceFile(capturedFile);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      recordAudioBuffersRef.current = [];
      recordAudioSampleRateRef.current = audioContext.sampleRate;
      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        recordAudioBuffersRef.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      recordAudioStreamRef.current = stream;
      recordAudioContextRef.current = audioContext;
      recordAudioSourceRef.current = source;
      recordAudioProcessorRef.current = processor;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordAudioBuffersRef.current.length > 0) {
      const wavBlob = createWavBlob(recordAudioBuffersRef.current, recordAudioSampleRateRef.current);
      const recordedFile = new File([wavBlob], `voice-${Date.now()}.wav`, { type: "audio/wav" });
      onAudioFile(recordedFile);
    }

    recordAudioProcessorRef.current?.disconnect();
    recordAudioSourceRef.current?.disconnect();
    recordAudioContextRef.current?.close();
    if (recordAudioStreamRef.current) {
      recordAudioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    recordAudioBuffersRef.current = [];
    setIsRecording(false);
  };

  const stopLiveAudio = () => {
    if (liveAudioIntervalRef.current) {
      clearInterval(liveAudioIntervalRef.current);
      liveAudioIntervalRef.current = null;
    }
    liveAudioProcessorRef.current?.disconnect();
    liveAudioSourceRef.current?.disconnect();
    liveAudioContextRef.current?.close();
    if (liveAudioStreamRef.current) {
      liveAudioStreamRef.current.getTracks().forEach((track) => track.stop());
      liveAudioStreamRef.current = null;
    }
    liveAudioBuffersRef.current = [];
  };

  const startLiveAudio = async () => {
    if (liveAudioStreamRef.current) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      liveAudioStreamRef.current = stream;
      liveAudioContextRef.current = audioContext;
      liveAudioSourceRef.current = source;
      liveAudioProcessorRef.current = processor;
      liveAudioBuffersRef.current = [];
      liveAudioSampleRateRef.current = audioContext.sampleRate;

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        liveAudioBuffersRef.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      liveAudioIntervalRef.current = setInterval(() => {
        if (!liveAudioBuffersRef.current.length) return;
        const wavBlob = createWavBlob(liveAudioBuffersRef.current, liveAudioSampleRateRef.current);
        liveAudioBuffersRef.current = [];
        if (wavBlob.size > 2048) {
          const recordedFile = new File([wavBlob], `live-voice-${Date.now()}.wav`, { type: "audio/wav" });
          onLiveAudioChunk?.(recordedFile);
        }
      }, 4000);

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!liveFaceMode || !cameraStream) return undefined;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || liveBusy) return;
      const video = videoRef.current;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        if (blob.size < 5000) return;
        const capturedFile = new File([blob], `live-webcam-${Date.now()}.jpg`, { type: "image/jpeg" });
        onLiveFaceFrame?.(capturedFile);
      }, "image/jpeg", 0.88);
    }, 1500);

    return () => clearInterval(interval);
  }, [cameraStream, liveBusy, liveFaceMode, onLiveFaceFrame]);

  useEffect(() => {
    return () => {
      stopLiveAudio();
      recordAudioProcessorRef.current?.disconnect();
      recordAudioSourceRef.current?.disconnect();
      recordAudioContextRef.current?.close();
      if (recordAudioStreamRef.current) {
        recordAudioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    stopCamera();
    stopLiveAudio();
    if (isRecording) {
      stopRecording();
    }
  }, [endAnalysisSignal]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass-card flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-200">
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Face Input</h3>
            <p className="text-sm text-slate-300">Upload an image or webcam snapshot.</p>
          </div>
        </div>
        <input type="file" accept="image/*" onChange={onFaceChange} className="text-sm" disabled={liveFaceMode} />
        <div className="flex gap-3">
          <button type="button" onClick={startCamera} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Video size={16} />
              Start Camera
            </span>
          </button>
          <button type="button" onClick={stopCamera} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Stop Camera
          </button>
          <button
            type="button"
            onClick={capturePhoto}
            disabled={liveFaceMode}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Capture Snapshot
          </button>
          <button
            type="button"
            onClick={onClearFace}
            disabled={liveFaceMode}
            className="rounded-full border border-white/10 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Image
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (liveFaceMode) {
              onToggleLiveFaceMode();
              return;
            }
            onStartLiveFaceMode?.(startCamera);
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${liveFaceMode ? "bg-rose-500 text-white" : "border border-white/10 text-white"}`}
        >
          {liveFaceMode ? `Stop Live Face${liveBusy ? "..." : ""}` : "Start Live Face"}
        </button>
        {cameraStream ? (
          <div className="relative">
            <video ref={videoRef} autoPlay muted playsInline className="rounded-2xl border border-white/10" />
            {liveFaceMode ? (
              <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">
                LIVE FACE
              </div>
            ) : null}
          </div>
        ) : null}
        {!liveFaceMode && facePreview ? <img src={facePreview} alt="Face preview" className="rounded-2xl border border-white/10 object-cover" /> : null}
        <canvas ref={canvasRef} className="hidden" />
        <p className="text-xs text-slate-400">
          {liveFaceMode ? "Live face analysis is updating continuously from webcam frames." : faceFile ? faceFile.name : "No image selected"}
        </p>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-200">
            <Mic size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Voice Input</h3>
            <p className="text-sm text-slate-300">Upload recorded speech for SER inference.</p>
          </div>
        </div>
        <input type="file" accept="audio/*" onChange={onAudioChange} className="text-sm" />
        <div className="flex gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={liveAudioMode}
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Mic size={16} />
                Record Voice
              </span>
            </button>
          ) : (
            <button type="button" onClick={stopRecording} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
              <span className="inline-flex items-center gap-2">
                <Square size={16} />
                Stop Recording
              </span>
            </button>
          )}
          <button type="button" onClick={onClearAudio} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Remove Audio
          </button>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (liveAudioMode) {
              stopLiveAudio();
              onToggleLiveAudioMode?.();
              return;
            }
            const ok = await onStartLiveAudioMode?.(startLiveAudio);
            if (!ok) stopLiveAudio();
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${liveAudioMode ? "bg-rose-500 text-white" : "border border-white/10 text-white"}`}
        >
          <span className="inline-flex items-center gap-2">
            <Waves size={16} />
            {liveAudioMode ? "Stop Live Audio" : "Start Live Audio"}
          </span>
        </button>
        {audioPreview ? <audio controls src={audioPreview} className="w-full" /> : null}
        <p className="text-xs text-slate-400">
          {liveAudioMode ? "Live audio is chunking microphone input for rolling voice analysis." : audioFile ? audioFile.name : "No audio selected"}
        </p>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
            <Type size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Text Input</h3>
            <p className="text-sm text-slate-300">Paste a message or chat snippet.</p>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          rows={7}
          placeholder="Describe your current feeling or add a chat message here..."
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none"
        />
        <button
          type="button"
          onClick={onToggleLiveTextMode}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${liveTextMode ? "bg-rose-500 text-white" : "border border-white/10 text-white"}`}
        >
          <span className="inline-flex items-center gap-2">
            <MessageSquareText size={16} />
            {liveTextMode ? "Stop Live Text" : "Start Live Text"}
          </span>
        </button>
        <p className="text-xs text-slate-400">
          {liveTextMode
            ? "Live text analysis is using the current text box content in each fused update."
            : "Type text here and enable live text to include it in rolling fusion."}
        </p>
      </div>
    </div>
  );
}

function createWavBlob(chunks, sampleRate) {
  const samples = mergeFloat32Arrays(chunks);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function mergeFloat32Arrays(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function writeString(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

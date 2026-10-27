
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageDataState, MosaicConfig } from './types';
import ImageUploader from './components/ImageUploader';
import LoupeViewer from './components/LoupeViewer';
import { loadImage, generateMosaic } from './services/mosaicService';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [state, setState] = useState<ImageDataState>({
    target: null,
    tile: null,
    isProcessing: false,
    isLive: false,
    resultUrl: null,
  });

  const [config, setConfig] = useState<MosaicConfig>({
    gridSize: 150,
    zoomScale: 12,
    brightnessBoost: 1,
    detailOverlay: 0.3,
    sourceZoom: 1.0,
    sourceFocusX: 0.5,
    sourceFocusY: 0.5,
    gridGap: 1,
    tileContrast: 1.3,
    highResTiles: true,
  });

  // Hardware & Biometric State
  const [emg, setEmg] = useState(0);
  const [eeg, setEeg] = useState(0);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isGeneratingTarget, setIsGeneratingTarget] = useState(false);
  const [appBackground, setAppBackground] = useState<string | null>(null);
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [lastTriggeredEmotion, setLastTriggeredEmotion] = useState<string | null>(null);
  const [showGraphMonitor, setShowGraphMonitor] = useState(false);
  const [isBioBgEnabled, setIsBioBgEnabled] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Tile Camera State
  const [showTileCamera, setShowTileCamera] = useState(false);
  const tileVideoRef = useRef<HTMLVideoElement>(null);

  // Signal Visualization Buffers
  const emgHistory = useRef<number[]>(new Array(250).fill(0));
  const eegHistory = useRef<number[]>(new Array(250).fill(0));
  const monitorCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * HIGH-FIDELITY PROCEDURAL NATURE SYNTHESIZER (V2)
   * Deterministically reconstructs AI-like nature photography themes locally.
   */
  const generateProceduralNature = (level: number, type: 'target' | 'bg'): string => {
    const canvas = document.createElement('canvas');
    canvas.width = type === 'target' ? 2048 : 1024;
    canvas.height = type === 'target' ? 2048 : 576; // Match target or background aspect
    const ctx = canvas.getContext('2d', { alpha: false })!;
    
    let seed = Date.now();
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const w = canvas.width;
    const h = canvas.height;

    // Render themed layers
    if (level >= 60) {
      // INTENSE: APOCALYPTIC LAVA & OBSIDIAN
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Deep Glow Layer
      const glow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      glow.addColorStop(0, '#7f1d1d');
      glow.addColorStop(1, '#020617');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Procedural "Magma Cracks"
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.strokeStyle = random() > 0.5 ? '#f97316' : '#ef4444';
        ctx.lineWidth = random() * 15 + 2;
        ctx.filter = `blur(${random() * 20}px)`;
        let lx = random() * w;
        let ly = random() * h;
        ctx.moveTo(lx, ly);
        for (let j = 0; j < 12; j++) {
          lx += (random() - 0.5) * 400;
          ly += (random() - 0.5) * 400;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }

      // Macro "Obsidian Rock" Textures
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      for (let i = 0; i < 20; i++) {
        const x = random() * w;
        const y = random() * h;
        const sz = random() * 600 + 200;
        const grad = ctx.createLinearGradient(x, y, x+sz, y+sz);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for(let k=0; k<6; k++) ctx.lineTo(x + random()*sz, y + random()*sz);
        ctx.fill();
      }
    } else if (level >= 45) {
      // NORMAL: ANCIENT MISTY FOREST
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, '#064e3b');
      base.addColorStop(1, '#022c22');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric Mist
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 10; i++) {
        const x = random() * w;
        const y = random() * h;
        const r = random() * 800 + 400;
        const m = ctx.createRadialGradient(x, y, 0, x, y, r);
        m.addColorStop(0, '#ecfdf5');
        m.addColorStop(1, 'transparent');
        ctx.fillStyle = m;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1.0;

      // Layered Macro Ferns/Leaves
      for (let i = 0; i < 2000; i++) {
        const x = random() * w;
        const y = random() * h;
        const s = random() * 40 + 10;
        ctx.fillStyle = `rgba(${0}, ${random()*100 + 50}, ${random()*50}, ${random()*0.4})`;
        ctx.beginPath();
        ctx.ellipse(x, y, s, s/3, random()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }
    } else if (level >= 30) {
      // HAPPY: SUN-DRENCHED FLORAL BLOOMS
      ctx.fillStyle = '#fff7ed';
      ctx.fillRect(0, 0, w, h);

      // Warm Sunlight Leak
      const sun = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
      sun.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      sun.addColorStop(1, 'transparent');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // Abstract Macro Petals
      for (let i = 0; i < 120; i++) {
        const x = random() * w;
        const y = random() * h;
        const sz = random() * 400 + 100;
        const p = ctx.createRadialGradient(x, y, 0, x, y, sz);
        const hue = random() > 0.5 ? '#f472b6' : '#fb7185';
        p.addColorStop(0, hue);
        p.addColorStop(1, 'transparent');
        ctx.globalAlpha = random() * 0.6;
        ctx.fillStyle = p;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // High-frequency "Pollen" Bokeh
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(random()*w, random()*h, random()*4, 0, Math.PI*2);
        ctx.fill();
      }
    } else {
      // ZEN: MINIMALIST CRYSTAL WATER
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Soft Depth Gradients
      const d = ctx.createLinearGradient(0, 0, w, h);
      d.addColorStop(0, '#1e293b');
      d.addColorStop(1, '#0f172a');
      ctx.fillStyle = d;
      ctx.fillRect(0, 0, w, h);

      // Geometric Concentric Ripples
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.15)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const cx = random() * w;
        const cy = random() * h;
        for (let r = 0; r < 1200; r += 60) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Ethereal "Light Refractions"
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.moveTo(random()*w, 0);
        ctx.lineTo(random()*w, h);
        ctx.stroke();
      }
    }

    // Final "Film Grain" Post-Processing
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 50000; i++) {
      ctx.fillStyle = random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(random() * w, random() * h, 1, 1);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const connectHardware = async () => {
    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API not supported in this browser.");
        return;
      }
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });
      setIsHardwareConnected(true);
      setIsManualMode(false);
      readSerialData(selectedPort);
    } catch (err) {
      console.error("Hardware connection failed:", err);
    }
  };

  const readSerialData = async (port: any) => {
    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const parts = line.trim().split(',');
            if (parts.length >= 2) {
              const newEmg = Math.min(100, Math.max(0, parseInt(parts[0])));
              const newEeg = Math.min(100, Math.max(0, parseInt(parts[1])));
              if (!isNaN(newEmg) && !isNaN(newEeg)) {
                setEmg(newEmg);
                setEeg(newEeg);
              }
            }
          }
        }
      }
    } catch (err) {
      setIsHardwareConnected(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      emgHistory.current.push(emg);
      emgHistory.current.shift();
      eegHistory.current.push(eeg);
      eegHistory.current.shift();
    }, 20);
    return () => clearInterval(interval);
  }, [emg, eeg]);

  const drawWave = (ctx: CanvasRenderingContext2D, history: number[], color: string, offsetY: number, height: number, label: string, width: number) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    const sliceWidth = width / (history.length - 1);
    let x = 0;
    for (let i = 0; i < history.length; i++) {
      const v = history[i];
      const y = offsetY + height - (v / 100) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (label) {
      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(label, 10, offsetY + 20);
    }
  };

  const getMoodLevel = () => {
    return Math.round((eeg + emg) / 2);
  };

  const getEmotionFromSignals = () => {
    const level = getMoodLevel();
    if (level >= 60) return "INTENSE/ANGRY";
    if (level >= 50) return "NORMAL";
    if (level >= 40) return "HAPPY/CALM";
    return "ZEN";
  };

  const generateTargetFromAI = async () => {
    const level = getMoodLevel();
    const emotion = getEmotionFromSignals();
    setLastTriggeredEmotion(emotion);
    setIsGeneratingTarget(true);

    if (isOfflineMode) {
      // Procedural fallback that mirrors the AI archetypes exactly in theme
      setTimeout(() => {
        const proceduralTarget = generateProceduralNature(level, 'target');
        setState(prev => ({ ...prev, target: proceduralTarget, resultUrl: null }));
        if (isBioBgEnabled) {
          const proceduralBg = generateProceduralNature(level, 'bg');
          setAppBackground(proceduralBg);
        }
        setIsGeneratingTarget(false);
      }, 1200);
      return;
    }
    
    const natureConstraint = "PURE NATURE. ABSOLUTELY NO HUMANS, ANIMALS, PETS, BUILDINGS, VEHICLES, OR ARTIFICIAL OBJECTS.";
    const styleSuffix = " Professional 8k nature photography, ultra-realistic, cinematic masterpiece, high-detail textures, unique composition.";

    const archetypes = {
      intense: [
        { t: "Macro shot of jagged, razor-sharp black obsidian with glowing molten orange lava veins.", b: "An apocalyptic volcanic landscape, rivers of fire, thick black ash clouds." },
        { t: "Furious texture of a massive churning ocean vortex with white foam.", b: "A terrifying maritime storm, colossal 50-foot waves under black cyclonic clouds." }
      ],
      normal: [
        { t: "Macro shot of rugged granite mountain stone and alpine lichen textures.", b: "Majestic mountain peaks with dense green pine forests." },
        { t: "Texture of fallen autumnal maple leaves in rich reds and golds.", b: "A serene woodland in peak autumn, misty sunlight filtering through." }
      ],
      happy: [
        { t: "Radiant macro shot of sun-drenched, dew-covered cherry blossom petals.", b: "A vibrant orchard of blooming cherry blossom trees in spring glow." },
        { t: "Macro texture of a sun-facing sunflower disk with intricate patterns.", b: "A vast, endless field of sunflowers under a bright golden hour sun." }
      ],
      zen: [
        { t: "Minimal macro shot of crystal clear water with a single soft geometric ripple.", b: "A minimalist zen lake at dawn, perfectly still water reflect mist." },
        { t: "Macro texture of translucent crystalline ice patterns.", b: "A deep blue ice cave with soft light filtering through frozen walls." }
      ]
    };

    let pool;
    if (level >= 60) pool = archetypes.intense;
    else if (level >= 50) pool = archetypes.normal;
    else if (level >= 40) pool = archetypes.happy;
    else pool = archetypes.zen;

    const selected = pool[Math.floor(Math.random() * pool.length)];
    const salt = Math.random().toString(36).substring(7);
    const targetPrompt = `[Unique Seed: ${salt}] ${selected.t} ${natureConstraint} ${styleSuffix} Mood Index: ${level}%`;
    const bgPrompt = `[Unique Seed: ${salt}] ${selected.b} ${natureConstraint} ${styleSuffix}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const [res, bgRes] = await Promise.all([
        ai.models.generateContent({ 
          model: 'gemini-2.5-flash-image', 
          contents: { parts: [{ text: targetPrompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        }),
        isBioBgEnabled ? ai.models.generateContent({ 
          model: 'gemini-2.5-flash-image', 
          contents: { parts: [{ text: bgPrompt }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        }) : Promise.resolve(null)
      ]);

      const part = res.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setState(prev => ({ ...prev, target: `data:image/png;base64,${part.inlineData!.data}`, resultUrl: null }));
      }

      const bp = bgRes?.candidates[0].content.parts.find(p => p.inlineData);
      if (bp?.inlineData) setAppBackground(`data:image/png;base64,${bp.inlineData!.data}`);

    } catch (err) {
      console.error("Synthesis Error:", err);
      alert("AI Cloud Synthesis failed. Try switching to 'Offline Mode' in the header.");
    } finally {
      setIsGeneratingTarget(false);
    }
  };

  const handleOpenTileCamera = async () => {
    setShowTileCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (tileVideoRef.current) {
        tileVideoRef.current.srcObject = stream;
        tileVideoRef.current.play();
      }
    } catch (err) {
      console.error("Tile camera failed:", err);
      setShowTileCamera(false);
    }
  };

  const captureTileFromCamera = () => {
    if (!tileVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = tileVideoRef.current.videoWidth;
    canvas.height = tileVideoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(tileVideoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setState(s => ({ ...s, tile: dataUrl, resultUrl: null }));
      
      const stream = tileVideoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setShowTileCamera(false);
    }
  };

  const cancelTileCamera = () => {
    if (tileVideoRef.current) {
      const stream = tileVideoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
    setShowTileCamera(false);
  };

  useEffect(() => {
    const renderMonitor = () => {
      const canvas = monitorCanvasRef.current;
      if (!canvas || !showGraphMonitor) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      const h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      drawWave(ctx, emgHistory.current, '#06b6d4', h * 0.1, h * 0.35, 'SIGNAL-A: MUSCLE_EMG', w);
      drawWave(ctx, eegHistory.current, '#a855f7', h * 0.55, h * 0.35, 'SIGNAL-B: BRAIN_EEG', w);
      requestAnimationFrame(renderMonitor);
    };
    if (showGraphMonitor) requestAnimationFrame(renderMonitor);
  }, [showGraphMonitor]);

  useEffect(() => {
    const renderBg = () => {
      const canvas = backgroundCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWave(ctx, emgHistory.current, 'rgba(6, 182, 212, 0.1)', canvas.height * 0.1, canvas.height * 0.35, '', canvas.width);
      drawWave(ctx, eegHistory.current, 'rgba(168, 85, 247, 0.1)', canvas.height * 0.55, canvas.height * 0.35, '', canvas.width);
      requestAnimationFrame(renderBg);
    };
    requestAnimationFrame(renderBg);
  }, []);

  const handleGenerateMaster = async () => {
    if (!state.target || !state.tile) return;
    setState(s => ({ ...s, isProcessing: true }));
    try {
      const [t, i] = await Promise.all([loadImage(state.target), loadImage(state.tile!)]);
      const res = await generateMosaic(t, i, config);
      setState(s => ({ ...s, resultUrl: res, isProcessing: false }));
    } catch (err) {
      console.error("Rendering failed:", err);
      alert("Mosaic generation failed at 10K. Check device memory.");
      setState(s => ({ ...s, isProcessing: false }));
    }
  };

  const getEmotionColors = (label: string | null) => {
    const level = getMoodLevel();
    if (level >= 60) return 'text-red-500 border-red-500/50 shadow-red-500/20';
    if (level >= 50) return 'text-slate-400 border-white/5 shadow-transparent';
    if (level >= 40) return 'text-yellow-400 border-yellow-500/50 shadow-yellow-500/20';
    return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
  };

  return (
    <div className="min-h-screen relative bg-[#010204] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {appBackground && (
        <div className="fixed inset-0 z-0 opacity-40 blur-[120px] scale-110 transition-all duration-[3000ms] pointer-events-none">
          <img src={appBackground} className="w-full h-full object-cover" alt="Atmosphere" />
        </div>
      )}
      <canvas ref={backgroundCanvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-30" />

      {/* Manual Tile Camera Modal */}
      {showTileCamera && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="max-w-4xl w-full bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
               <span className="text-[12px] font-black tracking-[0.4em] uppercase text-cyan-400">Tile Optical Acquisition</span>
               <button onClick={cancelTileCamera} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="relative aspect-video bg-black group">
               <video ref={tileVideoRef} className="w-full h-full object-cover" />
               <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-dashed border-cyan-500/50 rounded-full animate-pulse"></div>
               </div>
            </div>
            <div className="p-10 flex justify-center gap-6 bg-slate-900">
               <button onClick={cancelTileCamera} className="px-12 py-5 rounded-full border border-white/10 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-all">Abort</button>
               <button onClick={captureTileFromCamera} className="px-16 py-5 rounded-full bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-3xl">Commit Capture</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-10 flex flex-col items-center">
        <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-slate-900/70 p-8 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-br from-white to-slate-600 bg-clip-text text-transparent">NEURO-MOSAIC <span className="text-cyan-500 not-italic">10K</span></h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {isHardwareConnected ? 'Bio-Serial: CONNECTED' : isManualMode ? 'Manual Override: ON' : 'System Ready'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 mr-4 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isOfflineMode ? 'text-cyan-400' : 'text-slate-600'}`}>Offline Synthesis</span>
                <button 
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`w-12 h-6 rounded-full transition-all relative border border-white/10 ${isOfflineMode ? 'bg-cyan-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all ${isOfflineMode ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>
            <button onClick={() => setShowGraphMonitor(!showGraphMonitor)} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all font-black text-[10px] tracking-widest uppercase ${showGraphMonitor ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${showGraphMonitor ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></div> Signal Monitor
            </button>
            <button onClick={connectHardware} className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest ${isHardwareConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white text-black hover:bg-cyan-400 transition-all active:scale-95'}`}>
              {isHardwareConnected ? 'SYNCED' : 'CONNECT ARDUINO'}
            </button>
          </div>
        </header>

        <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4 space-y-8">
            <div className={`bg-slate-900/60 p-8 rounded-[3rem] border-2 transition-all duration-1000 backdrop-blur-3xl shadow-2xl relative overflow-hidden ${getEmotionColors(lastTriggeredEmotion).split(' ')[1]}`}>
               <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Biometric Interface</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-slate-500">Manual</span>
                    <button 
                      onClick={() => { setIsManualMode(!isManualMode); if(isHardwareConnected) setIsHardwareConnected(false); }}
                      className={`w-10 h-5 rounded-full transition-all relative ${isManualMode ? 'bg-cyan-500' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isManualMode ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
               </div>
               <div className="py-6 space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-cyan-500">MUSCLE (EMG)</span><span className="font-mono text-xs">{emg}%</span></div>
                      {isManualMode ? (
                        <input 
                          type="range" min="0" max="100" value={emg} 
                          onChange={(e) => setEmg(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500" 
                        />
                      ) : (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${emg}%` }}></div></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-purple-500">BRAIN (EEG)</span><span className="font-mono text-xs">{eeg}%</span></div>
                      {isManualMode ? (
                        <input 
                          type="range" min="0" max="100" value={eeg} 
                          onChange={(e) => setEeg(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500" 
                        />
                      ) : (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${eeg}%` }}></div></div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Mood Index</span>
                        <span className="font-mono text-xl text-white">{getMoodLevel()}%</span>
                     </div>
                     <p className={`text-[11px] font-black uppercase text-center mt-4 tracking-[0.2em] ${getEmotionColors(null).split(' ')[0]}`}>
                        {getEmotionFromSignals()}
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl space-y-8">
              <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">Environment Matrix</h2>
              <div className="space-y-4">
                <ImageUploader id="trg" label="Target Nature Matrix" image={state.target} onUpload={(u) => setState(s => ({ ...s, target: u, resultUrl: null }))} />
                <button 
                  onClick={generateTargetFromAI}
                  disabled={(!isHardwareConnected && !isManualMode) || isGeneratingTarget}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${ (isHardwareConnected || isManualMode) ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500 hover:text-white' : 'bg-slate-800 text-slate-600 border-white/5'}`}
                >
                  {isOfflineMode ? 'Synthesize Matrix (Offline)' : 'Synthesize Nature (AI)'}
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <ImageUploader id="tle" label="Mosaic Tile" image={state.tile} onUpload={(u) => setState(s => ({ ...s, tile: u, resultUrl: null }))} />
                <button 
                  onClick={handleOpenTileCamera}
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Capture Tile (Camera)
                </button>
              </div>

              <button 
                onClick={handleGenerateMaster} 
                disabled={!state.target || !state.tile || state.isProcessing} 
                className={`w-full py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all ${(!state.target || !state.tile || state.isProcessing) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-3xl hover:scale-105 active:scale-95'}`}
              >
                {state.isProcessing ? 'SYNTHESIZING 10K...' : 'RENDER MASTER MATRIX'}
              </button>
            </div>
          </aside>

          <section className="lg:col-span-8">
            {showGraphMonitor ? (
              <div className="aspect-[16/9] rounded-[4.5rem] bg-black border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400 flex items-center gap-2">Oscilloscope Feed</span>
                 </div>
                 <canvas ref={monitorCanvasRef} className="flex-1 w-full h-full" />
              </div>
            ) : state.resultUrl ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <LoupeViewer imageUrl={state.resultUrl} zoomScale={config.zoomScale} />
                <div className="flex justify-center gap-10">
                   <a href={state.resultUrl} download="neuro-nature-10k.jpg" className="px-20 py-7 bg-white text-black text-[11px] font-black uppercase rounded-full shadow-3xl hover:bg-cyan-400 transition-all">Download 10K EXTREME</a>
                   <button onClick={() => setState(s => ({ ...s, resultUrl: null }))} className="px-20 py-7 bg-slate-900/80 text-slate-400 text-[11px] font-black uppercase rounded-full border border-white/10 hover:text-white transition-all">Clear Result</button>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-[5rem] bg-slate-900/20 border-2 border-white/5 flex flex-col items-center justify-center text-slate-600 gap-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                {state.target ? (
                  <div className="absolute inset-0 animate-in fade-in duration-1000">
                    <img src={state.target} className="w-full h-full object-cover opacity-60 grayscale" alt="Preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
                       <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nature State Locked</h3>
                       <p className="text-[9px] font-mono text-cyan-500 uppercase mt-2">{isOfflineMode ? 'HIGH-FIDELITY LOCAL SYNTHESIS' : 'AI CLOUD SYNTHESIS'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center animate-pulse">
                     <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.8em]">Awaiting Nature Matrix</h3>
                  </div>
                )}
                
                {state.isProcessing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 z-50">
                    <div className="relative w-40 h-40">
                       <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                    <span className="text-[12px] font-black tracking-[0.6em] text-white uppercase">Synthesizing 10,000px Matrix</span>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseClaudeFolder } from "@/lib/parser";
import { generateDemoData } from "@/lib/demo";
import { ParsedData } from "@/types";

interface UploadScreenProps {
  onDataParsed: (data: ParsedData) => void;
}

const LOADING_MESSAGES = [
  "Reading your .claude folder...",
  "Scanning session transcripts...",
  "Crunching the numbers...",
  "Analyzing your habits...",
  "Building your story...",
];

const CLI_CMD = "git clone https://github.com/Junaid2005/ccrewind.git && cd ccrewind && npm i && npm run dev";

/* ─── Stacked preview cards ─── */
function PreviewCards() {
  return (
    <div className="relative" style={{ width: "360px", height: "440px" }}>
      {/* Back card — The Sama (uncommon: soft green) */}
      <motion.div
        initial={{ opacity: 0, y: 80, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 14 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 120, damping: 16 }}
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: "260px",
          height: "370px",
          top: "40px",
          right: "0px",
          transformOrigin: "bottom center",
          background: "#2f2f2d",
          border: "1px solid rgba(76,175,80,0.35)",
          boxShadow: "0 0 24px rgba(76,175,80,0.15), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 pt-4 flex items-center justify-between">
            <span className="font-label text-[7px] font-extrabold tracking-[0.25em] uppercase text-primary/70">
              Claude Code Rewind
            </span>
            <span
              className="font-label text-[7px] font-extrabold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-full"
              style={{ color: "rgba(76,175,80,0.85)", background: "rgba(76,175,80,0.12)" }}
            >
              Uncommon
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/mascots/char-the-operator.png"
              alt="The Sama"
              className="w-28 h-28 object-contain"
              style={{ filter: "drop-shadow(0 0 8px rgba(76,175,80,0.25))" }}
            />
          </div>
          <div className="px-4 pb-4">
            <p
              className="font-headline text-xl font-extrabold"
              style={{ color: "#4caf50", textShadow: "0 0 10px rgba(76,175,80,0.15)" }}
            >
              The Sama
            </p>
            <p className="font-body text-[10px] italic text-on-surface/40 mt-0.5 leading-tight">
              &ldquo;Somehow always lands on top.&rdquo;
            </p>
            <div className="flex gap-1.5 mt-3">
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(76,175,80,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Elo</p>
                <p className="font-headline text-sm font-extrabold" style={{ color: "rgba(76,175,80,0.8)" }}>
                  683
                </p>
              </div>
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(76,175,80,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Tokens</p>
                <p className="font-headline text-sm font-extrabold text-on-surface">847M</p>
              </div>
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(76,175,80,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Streak</p>
                <p className="font-headline text-sm font-extrabold text-on-surface">41d</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Front card — The Dario (epic: soft purple) */}
      <motion.div
        initial={{ opacity: 0, y: 80, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: -8 }}
        transition={{ delay: 0.55, type: "spring", stiffness: 110, damping: 15 }}
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: "260px",
          height: "370px",
          top: "10px",
          left: "0px",
          transformOrigin: "bottom center",
          background: "#2f2f2d",
          border: "1.5px solid rgba(179,71,255,0.5)",
          boxShadow: "0 0 30px rgba(179,71,255,0.25), 0 0 8px rgba(179,71,255,0.15) inset, 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 pt-4 flex items-center justify-between">
            <span className="font-label text-[7px] font-extrabold tracking-[0.25em] uppercase text-primary/70">
              Claude Code Rewind
            </span>
            <span
              className="font-label text-[7px] font-extrabold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-full"
              style={{ color: "rgba(179,71,255,0.9)", background: "rgba(179,71,255,0.15)" }}
            >
              Epic
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/mascots/char-the-visionary.png"
              alt="The Dario"
              className="w-28 h-28 object-contain"
              style={{ filter: "drop-shadow(0 0 14px rgba(179,71,255,0.4))" }}
            />
          </div>
          <div className="px-4 pb-4">
            <p
              className="font-headline text-xl font-extrabold"
              style={{ color: "#b347ff", textShadow: "0 0 16px rgba(179,71,255,0.45)" }}
            >
              The Dario
            </p>
            <p className="font-body text-[10px] italic text-on-surface/40 mt-0.5 leading-tight">
              &ldquo;You are not building features. You are changing the world. Probably.&rdquo;
            </p>
            <div className="flex gap-1.5 mt-3">
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(179,71,255,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Elo</p>
                <p className="font-headline text-sm font-extrabold" style={{ color: "rgba(179,71,255,0.75)" }}>
                  912
                </p>
              </div>
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(179,71,255,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Tokens</p>
                <p className="font-headline text-sm font-extrabold text-on-surface">2.4B</p>
              </div>
              <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(179,71,255,0.06)" }}>
                <p className="font-label text-[7px] uppercase tracking-wider text-on-surface/30">Sessions</p>
                <p className="font-headline text-sm font-extrabold text-on-surface">1,847</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UploadScreen({ onDataParsed }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Reading your .claude folder...");
  const [error, setError] = useState<string | null>(null);
  const [localAvailable, setLocalAvailable] = useState(false);
  const [showHiddenHelp, setShowHiddenHelp] = useState(false);
  const [showRunLocally, setShowRunLocally] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/local-data/status")
      .then((r) => r.json())
      .then((d: { available: boolean }) => {
        if (d.available) setLocalAvailable(true);
      })
      .catch(() => {});
  }, []);

  const startLoadingCycle = () => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[idx]);
    }, 1500);
    return interval;
  };

  const handleLocalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingText(LOADING_MESSAGES[0]);
    const interval = startLoadingCycle();
    try {
      const res = await fetch("/api/local-data");
      if (!res.ok) throw new Error("Failed to load local data");
      const data: ParsedData = await res.json();
      if (!data.statsCache && data.history.length === 0 && data.sessions.length === 0) {
        throw new Error("No Claude data found in ~/.claude");
      }
      clearInterval(interval);
      setLoadingText("Ready.");
      await new Promise((r) => setTimeout(r, 500));
      onDataParsed(data);
    } catch (e) {
      clearInterval(interval);
      setIsLoading(false);
      setError(e instanceof Error ? e.message : "Failed to load local data");
    }
  }, [onDataParsed]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setIsLoading(true);
      setError(null);
      setLoadingText(LOADING_MESSAGES[0]);
      const interval = startLoadingCycle();
      try {
        const data = await parseClaudeFolder(files);
        if (!data.statsCache && data.history.length === 0 && data.sessions.length === 0) {
          throw new Error("No Claude data found. Make sure you selected your ~/.claude folder.");
        }
        clearInterval(interval);
        setLoadingText("Ready.");
        await new Promise((r) => setTimeout(r, 500));
        onDataParsed(data);
      } catch (e) {
        clearInterval(interval);
        setIsLoading(false);
        setError(e instanceof Error ? e.message : "Failed to parse data");
      }
    },
    [onDataParsed]
  );

  const handleDemo = useCallback(() => {
    setIsLoading(true);
    setLoadingText("Loading demo data...");
    fetch("/demo-data.json")
      .then((r) => r.json())
      .then((data) => {
        setLoadingText("Ready.");
        setTimeout(() => onDataParsed(data), 400);
      })
      .catch(() => {
        const demoData = generateDemoData();
        setLoadingText("Ready.");
        setTimeout(() => onDataParsed(demoData), 400);
      });
  }, [onDataParsed]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Background */}
      <div className="fixed inset-0 grain-texture" />
      <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* ── Loading state ── */
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 relative z-10"
          >
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0 border-2 border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 border-2 border-t-transparent border-r-primary border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-label text-sm tracking-widest uppercase text-on-surface/60"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Upload state ── */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-16"
          >
            {/* ── Left: hero + actions ── */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-8 max-w-lg">
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center md:text-left"
              >
                <motion.img
                  src="/mascots/power-score.png"
                  alt="Claude mascot"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 14 }}
                  className="w-12 h-12 rounded-xl object-cover mb-5"
                />
                <h1
                  className="font-headline font-extrabold tracking-tighter leading-[0.88]"
                  style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
                >
                  <span className="text-on-surface">Claude Code</span>
                  <br />
                  <span className="text-primary text-glow">Rewind.</span>
                </h1>
                <p className="font-body text-base md:text-lg italic text-on-surface/35 mt-5 max-w-sm">
                  Connect your data. Get your character. Share your stats.
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="flex flex-col gap-3 w-full max-w-sm"
              >
                {/* Primary CTA — adapts based on local availability */}
                {localAvailable ? (
                  <button
                    onClick={handleLocalData}
                    className="w-full bg-primary hover:bg-primary/90 text-on-primary rounded-2xl px-8 py-4 font-headline font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 text-left"
                  >
                    Use your local data
                    <p className="text-on-primary/55 text-[11px] font-normal mt-0.5">
                      ~/.claude auto-detected on this machine
                    </p>
                  </button>
                ) : (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="w-full bg-primary hover:bg-primary/90 text-on-primary rounded-2xl px-8 py-4 font-headline font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Upload ~/.claude folder
                  </button>
                )}

                {/* Secondary CTAs */}
                <div className="flex gap-2">
                  {localAvailable && (
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="flex-1 bg-surface-container-low hover:bg-surface-container border border-on-surface/8 text-on-surface/60 hover:text-on-surface rounded-xl px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
                    >
                      Upload folder
                    </button>
                  )}
                  <button
                    onClick={handleDemo}
                    className="flex-1 bg-surface-container-low hover:bg-surface-container border border-on-surface/8 text-on-surface/60 hover:text-on-surface rounded-xl px-4 py-3 font-label text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
                  >
                    Try demo
                  </button>
                </div>

                {/* Drag hint when dragging */}
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                    >
                      <div className="border-2 border-dashed border-primary rounded-3xl px-16 py-12 text-center">
                        <p className="font-headline text-2xl font-extrabold text-primary">Drop it like it&apos;s hot</p>
                        <p className="font-body text-sm italic text-on-surface/40 mt-2">
                          release to upload your ~/.claude folder
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Utility links */}
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 text-on-surface/25">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="font-label text-[9px] font-bold tracking-widest uppercase">
                      Your data stays local
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowHiddenHelp(!showHiddenHelp);
                        setShowRunLocally(false);
                      }}
                      className="group cursor-pointer font-label text-[9px] font-bold tracking-wider uppercase text-on-surface/35 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span className="underline underline-offset-2 decoration-on-surface/20 group-hover:decoration-primary transition-colors">
                        Can&apos;t see .claude?
                      </span>
                      <motion.span
                        animate={{ rotate: showHiddenHelp ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="opacity-50 group-hover:opacity-100"
                      >
                        ↓
                      </motion.span>
                    </button>
                    <span className="text-on-surface/10">·</span>
                    <button
                      onClick={() => {
                        setShowRunLocally(!showRunLocally);
                        setShowHiddenHelp(false);
                      }}
                      className="group cursor-pointer font-label text-[9px] font-bold tracking-wider uppercase text-on-surface/35 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span className="underline underline-offset-2 decoration-on-surface/20 group-hover:decoration-primary transition-colors">
                        Run locally
                      </span>
                      <motion.span
                        animate={{ rotate: showRunLocally ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="opacity-50 group-hover:opacity-100"
                      >
                        ↓
                      </motion.span>
                    </button>
                  </div>
                </div>

                {/* Expandable: hidden file help */}
                <AnimatePresence>
                  {showHiddenHelp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-surface-container-low/80 border border-on-surface/6 rounded-xl px-4 py-3 space-y-2">
                        <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface/30 mb-2">
                          Show hidden files first:
                        </p>
                        {[
                          { os: "macOS", hint: "Cmd + Shift + .", note: "in Finder" },
                          { os: "Windows", hint: "View → Show → Hidden items", note: "" },
                          { os: "Linux", hint: "Ctrl + H", note: "in file manager" },
                        ].map(({ os, hint, note }) => (
                          <div key={os} className="flex items-center gap-2">
                            <span className="font-label text-[9px] font-bold text-primary/70 w-12">{os}</span>
                            <code className="font-mono text-[10px] text-on-surface/50 bg-surface-container-high/50 px-2 py-0.5 rounded">
                              {hint}
                            </code>
                            {note && <span className="font-label text-[9px] text-on-surface/25">{note}</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expandable: run locally */}
                <AnimatePresence>
                  {showRunLocally && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-surface-container-low/80 border border-primary/10 rounded-xl px-4 py-3">
                        <p className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-2">
                          Run locally — auto-detects your ~/.claude
                        </p>
                        <div className="relative group flex items-center gap-2">
                          <code className="font-mono text-[10px] text-on-surface/40 bg-surface-container-high/80 px-3 py-2 rounded-lg flex-1 overflow-x-auto whitespace-nowrap block">
                            {CLI_CMD}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(CLI_CMD);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }}
                            className="shrink-0 p-1.5 rounded-md bg-surface-container-highest/80 hover:bg-primary/20 text-on-surface/30 hover:text-primary transition-colors"
                          >
                            {copied ? (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── Right: stacked preview cards ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="shrink-0 hidden md:block"
            >
              <PreviewCards />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4"
          >
            <p className="font-label text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        /* @ts-expect-error webkitdirectory is not in the type definitions */
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

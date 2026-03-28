"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseClaudeFolder } from "@/lib/parser";
import { generateDemoData } from "@/lib/demo";
import { ParsedData } from "@/types";

interface UploadScreenProps {
  onDataParsed: (data: ParsedData) => void;
}

export default function UploadScreen({ onDataParsed }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Parsing your data...");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setIsLoading(true);
      setError(null);

      const loadingMessages = [
        "Reading your .claude folder...",
        "Scanning session transcripts...",
        "Crunching the numbers...",
        "Analyzing your habits...",
        "Building your story...",
      ];

      let msgIndex = 0;
      const interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[msgIndex]);
      }, 1500);

      try {
        const data = await parseClaudeFolder(files);

        if (!data.statsCache && data.history.length === 0 && data.sessions.length === 0) {
          throw new Error(
            "No Claude data found. Make sure you selected your ~/.claude folder."
          );
        }

        clearInterval(interval);
        setLoadingText("Ready.");

        // Small delay for the animation
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
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

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-8 relative">
      {/* Background grain */}
      <div className="fixed inset-0 grain-texture" />

      {/* Subtle radial glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 relative z-10"
          >
            {/* Loading spinner */}
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

            <motion.p
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-label text-sm tracking-widest uppercase text-on-surface/60"
            >
              {loadingText}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6 md:gap-12 relative z-10 max-w-2xl w-full"
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-primary text-white font-label text-[10px] font-extrabold tracking-[0.2em] px-4 py-1.5 rounded-full uppercase"
              >
                CC Rewind
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-center leading-tight"
              >
                Your Claude Story
                <br />
                <span className="text-primary">Unwrapped.</span>
              </motion.h1>
            </div>

            {/* Drop zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative cursor-pointer rounded-2xl border-2 border-dashed
                  transition-all duration-300 p-8 md:p-16
                  flex flex-col items-center gap-6 text-center
                  ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-on-surface/10 bg-surface-container-low/50 hover:border-primary/40 hover:bg-surface-container/50"
                  }
                `}
              >
                {/* Upload icon */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isDragging ? "bg-primary/20" : "bg-surface-container-high"
                  }`}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-colors ${isDragging ? "text-primary" : "text-on-surface/40"}`}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <div>
                  <p className="font-headline font-bold text-lg text-on-surface mb-2">
                    {isDragging ? "Drop it like it's hot" : "Select your ~/.claude folder"}
                  </p>
                  <p className="font-body text-on-surface/40 text-sm italic">
                    Everything stays in your browser. Zero data leaves this page.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-on-surface/10" />
                  <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface/30">
                    Click to browse
                  </span>
                  <span className="h-px w-8 bg-on-surface/10" />
                </div>
              </div>

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
            </motion.div>

            {/* Demo button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="w-full flex flex-col items-center gap-3 -mt-4"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="h-px flex-1 bg-on-surface/10" />
                <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface/20">
                  or
                </span>
                <span className="h-px flex-1 bg-on-surface/10" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLoading(true);
                  setLoadingText("Generating demo data...");
                  setTimeout(() => {
                    const demoData = generateDemoData();
                    setLoadingText("Ready.");
                    setTimeout(() => onDataParsed(demoData), 400);
                  }, 800);
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest border border-on-surface/10 text-on-surface rounded-full px-8 py-3 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Try with demo data
              </button>
              <p className="font-body text-[11px] italic text-on-surface/30">
                No Claude Code? See what CC Rewind looks like with sample data.
              </p>
            </motion.div>

            {/* Hidden folder instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-surface-container-low/50 border border-on-surface/5 rounded-xl px-5 py-4"
            >
              <p className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface/40 mb-3">
                Can&apos;t see the .claude folder? Show hidden files first:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-[10px] font-bold text-primary/80 w-14">macOS</span>
                  <code className="font-mono text-[11px] text-on-surface/60 bg-surface-container-high/50 px-2 py-0.5 rounded">
                    Cmd + Shift + .
                  </code>
                  <span className="font-label text-[10px] text-on-surface/30">in Finder</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label text-[10px] font-bold text-primary/80 w-14">Windows</span>
                  <span className="font-label text-[10px] text-on-surface/50">
                    File Explorer → View → Show → Hidden items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label text-[10px] font-bold text-primary/80 w-14">Linux</span>
                  <code className="font-mono text-[11px] text-on-surface/60 bg-surface-container-high/50 px-2 py-0.5 rounded">
                    Ctrl + H
                  </code>
                  <span className="font-label text-[10px] text-on-surface/30">in file manager</span>
                </div>
              </div>
              <p className="font-body text-[11px] italic text-on-surface/30 mt-3">
                Your .claude folder is at <code className="font-mono text-on-surface/40">~/.claude</code> (your home directory).
              </p>
            </motion.div>

            {/* Privacy badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 text-on-surface/30"
            >
              <svg
                width="14"
                height="14"
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
              <span className="font-label text-[10px] font-bold tracking-widest uppercase">
                100% Client-Side Processing
              </span>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-center"
                >
                  <p className="font-label text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

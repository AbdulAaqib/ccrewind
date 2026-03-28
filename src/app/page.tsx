"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UploadScreen from "@/components/upload/UploadScreen";
import SlideContainer from "@/components/slides/SlideContainer";
import GraveyardShift from "@/components/slides/GraveyardShift";
import Delegator from "@/components/slides/Delegator";
import Arsenal from "@/components/slides/Arsenal";
import TokenFurnace from "@/components/slides/TokenFurnace";
import LoyaltyTest from "@/components/slides/LoyaltyTest";
import ThinkingHours from "@/components/slides/ThinkingHours";
import CommitHistory from "@/components/slides/CommitHistory";
import TopProjects from "@/components/slides/TopProjects";
import Sharpshooter from "@/components/slides/Sharpshooter";
import Streak from "@/components/slides/Streak";
import StopReason from "@/components/slides/StopReason";
import RetrySpiral from "@/components/slides/RetrySpiral";
import Dashboard from "@/components/slides/Dashboard";
import CharacterReveal from "@/components/reveal/CharacterReveal";
import PowerScore from "@/components/reveal/PowerScore";
import ShareCard from "@/components/reveal/ShareCard";
import { ParsedData, ComputedStats, Character, CPSBreakdown } from "@/types";
import { computeStats } from "@/lib/stats";
import { assignCharacter } from "@/lib/archetypes";
import { computeCPS } from "@/lib/scoring";

type AppPhase = "upload" | "slides" | "reveal";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const stats: ComputedStats | null = useMemo(() => {
    if (!parsedData) return null;
    return computeStats(parsedData);
  }, [parsedData]);

  const character: Character | null = useMemo(() => {
    if (!stats) return null;
    return assignCharacter(stats);
  }, [stats]);

  const cps: CPSBreakdown | null = useMemo(() => {
    if (!stats) return null;
    return computeCPS(stats);
  }, [stats]);

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data);
    setPhase("slides");
  };

  const handleSlidesComplete = () => {
    setPhase("reveal");
  };

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {phase === "upload" && (
          <motion.div
            key="upload"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <UploadScreen onDataParsed={handleDataParsed} />
          </motion.div>
        )}

        {phase === "slides" && stats && character && cps && (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SlideContainer onComplete={handleSlidesComplete}>
              <GraveyardShift stats={stats} />
              <Delegator stats={stats} />
              <Arsenal stats={stats} />
              <TokenFurnace stats={stats} />
              <LoyaltyTest stats={stats} />
              <ThinkingHours stats={stats} />
              <CommitHistory stats={stats} />
              <TopProjects stats={stats} />
              <Sharpshooter stats={stats} />
              <Streak stats={stats} />
              <StopReason stats={stats} />
              <RetrySpiral stats={stats} />
              <PowerScore cps={cps} />
              <CharacterReveal character={character} stats={stats} cps={cps} />
            </SlideContainer>
          </motion.div>
        )}

        {phase === "reveal" && character && stats && cps && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <ShareCard character={character} stats={stats} cps={cps} />
            <Dashboard stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import UploadScreenV1 from "@/components/upload/UploadScreenV1";
import UploadScreenV2 from "@/components/upload/UploadScreenV2";
import UploadScreenV3 from "@/components/upload/UploadScreenV3";
import UploadScreenV4 from "@/components/upload/UploadScreenV4";
import UploadScreenV5 from "@/components/upload/UploadScreenV5";
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
import TheBill from "@/components/slides/TheBill";
import Dashboard from "@/components/slides/Dashboard";
import CharacterReveal from "@/components/reveal/CharacterReveal";
import PowerScore from "@/components/reveal/PowerScore";
import ShareCard from "@/components/reveal/ShareCard";
import CreditsPage from "@/components/reveal/CreditsPage";
import { ParsedData, ComputedStats, Character, EloBreakdown } from "@/types";
import { computeStats } from "@/lib/stats";
import { assignCharacter } from "@/lib/archetypes";
import { computeElo } from "@/lib/scoring";

type AppPhase = "upload" | "slides" | "reveal";

function UploadVariant({ onDataParsed }: { onDataParsed: (data: ParsedData) => void }) {
  const searchParams = useSearchParams();
  const v = searchParams.get("v");

  switch (v) {
    case "1":
      return <UploadScreenV1 onDataParsed={onDataParsed} />;
    case "2":
      return <UploadScreenV2 onDataParsed={onDataParsed} />;
    case "3":
      return <UploadScreenV3 onDataParsed={onDataParsed} />;
    case "4":
      return <UploadScreenV4 onDataParsed={onDataParsed} />;
    case "5":
      return <UploadScreenV5 onDataParsed={onDataParsed} />;
    default:
      return <UploadScreenV3 onDataParsed={onDataParsed} />;
  }
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const stats: ComputedStats | null = useMemo(() => {
    if (!parsedData) return null;
    return computeStats(parsedData);
  }, [parsedData]);

  const elo: EloBreakdown | null = useMemo(() => {
    if (!stats) return null;
    return computeElo(stats);
  }, [stats]);

  const character: Character | null = useMemo(() => {
    if (!stats || !elo) return null;
    return assignCharacter(stats, elo.total);
  }, [stats, elo]);

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
          <motion.div key="upload" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<UploadScreenV3 onDataParsed={handleDataParsed} />}>
              <UploadVariant onDataParsed={handleDataParsed} />
            </Suspense>
          </motion.div>
        )}

        {phase === "slides" && stats && character && elo && (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SlideContainer onComplete={handleSlidesComplete}>
              <TopProjects stats={stats} />
              <Arsenal stats={stats} />
              <TokenFurnace stats={stats} />
              <GraveyardShift stats={stats} />
              <TheBill stats={stats} />
              <Delegator stats={stats} />
              <LoyaltyTest stats={stats} />
              <ThinkingHours stats={stats} />
              <CommitHistory stats={stats} />
              <Sharpshooter stats={stats} />
              <Streak stats={stats} />
              <PowerScore elo={elo} />
              <CharacterReveal character={character} stats={stats} elo={elo} />
            </SlideContainer>
          </motion.div>
        )}

        {phase === "reveal" && character && stats && elo && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <ShareCard character={character} stats={stats} elo={elo} />
            <div id="dashboard">
              <Dashboard stats={stats} elo={elo} />
            </div>
            <div id="credits">
              <CreditsPage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

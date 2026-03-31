"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TEAM = [
  {
    name: "Junaid Mohammad",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/junaid-mohammad-4a4091260/",
    github: "https://github.com/Junaid2005",
  },
  {
    name: "Abdul Ali",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/abdulaaqib/",
    github: "https://github.com/AbdulAaqib",
  },
  {
    name: "Walid Messafer",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/walid-m-155819267/",
    github: "https://github.com/samouneh",
  },
];

const PHOTOS = [
  "/hackathon-pics/656913861_2421803544930633_7824435085335937036_n.jpg",
  "/hackathon-pics/IMG_9939.JPG",
  "/hackathon-pics/IMG_9959.JPG",
  "/hackathon-pics/IMG_9912.JPG",
  "/hackathon-pics/657050219_1828015461215842_715095733370167322_n.png",
];

const ROTATIONS = [-3.5, 2.5, -1.5, 3, -2];
const OFFSETS_Y = [0, 8, -4, 6, -2];

export default function CreditsPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section
      id="credits"
      className="relative bg-background flex flex-col items-center justify-center px-6 pt-52 pb-72 overflow-hidden"
    >
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-14 w-full max-w-xl">
        {/* Branding */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-primary">Credits</span>
          <p className="font-label text-sm tracking-[0.08em] text-on-surface/40">
            Built with love <span className="text-red-500">&#10084;&#65039;</span>
          </p>
        </motion.div>

        {/* Team */}
        <div className="flex flex-col w-full gap-7">
          {TEAM.map((person, i) => (
            <motion.div
              key={person.name}
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="font-headline font-bold text-4xl md:text-5xl text-on-surface tracking-tight leading-none">
                  {person.name}
                </span>
                <span className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface/30">
                  {person.roleLabel}
                </span>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center border border-on-surface/10 rounded-lg text-on-surface/30 hover:border-primary hover:text-primary transition-colors duration-200"
                  aria-label={`${person.name} LinkedIn`}
                >
                  <LinkedInIcon />
                </a>
                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center border border-on-surface/10 rounded-lg text-on-surface/30 hover:border-primary hover:text-primary transition-colors duration-200"
                  aria-label={`${person.name} GitHub`}
                >
                  <GitHubIcon />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Photos caption */}
        <motion.p
          className="font-body text-sm md:text-base italic text-on-surface/35 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Some pics from development
        </motion.p>

        {/* Polaroid photos — top row of 3 */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 w-full px-2">
          {PHOTOS.slice(0, 3).map((src, i) => (
            <motion.div
              key={i}
              className="bg-white p-1.5 md:p-2 pb-6 md:pb-8 shadow-2xl shadow-black/40 cursor-pointer"
              style={{
                rotate: `${ROTATIONS[i]}deg`,
                translateY: `${OFFSETS_Y[i]}px`,
              }}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{
                opacity: 1,
                y: OFFSETS_Y[i],
                rotate: ROTATIONS[i],
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                scale: 1.08,
                rotate: 0,
                zIndex: 10,
                transition: { duration: 0.2 },
              }}
              onClick={() => setLightbox(i)}
            >
              <img
                src={src}
                alt=""
                className={`w-full object-cover ${
                  i === 0 ? "aspect-[5/4] object-bottom" : i === 1 ? "aspect-[11/10]" : "aspect-square"
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Polaroid photos — bottom row of 2, centred */}
        <div className="flex justify-center gap-3 md:gap-5 w-full px-2 -mt-8">
          {PHOTOS.slice(3).map((src, i) => {
            const idx = i + 3;
            return (
              <motion.div
                key={idx}
                className="bg-white p-1.5 md:p-2 pb-6 md:pb-8 shadow-2xl shadow-black/40 cursor-pointer w-[calc(33.333%-0.5rem)]"
                style={{
                  rotate: `${ROTATIONS[idx]}deg`,
                  translateY: `${OFFSETS_Y[idx]}px`,
                }}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{
                  opacity: 1,
                  y: OFFSETS_Y[idx],
                  rotate: ROTATIONS[idx],
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
                onClick={() => setLightbox(idx)}
              >
                <img
                  src={src}
                  alt=""
                  className={`w-full aspect-square object-cover ${idx === 3 ? "object-right" : ""}`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={PHOTOS[lightbox]}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

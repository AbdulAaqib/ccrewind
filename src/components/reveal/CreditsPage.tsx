"use client";

import { motion } from "framer-motion";

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
    name: "Junaid",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/junaid-mohammad-4a4091260/",
    github: "https://github.com/Junaid2005",
  },
  {
    name: "Abdul",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/abdulaaqib/",
    github: "https://github.com/AbdulAaqib",
  },
  {
    name: "Walid",
    roleLabel: "Engineer",
    linkedin: "https://www.linkedin.com/in/walid-m-155819267/",
    github: "https://github.com/samouneh",
  },
];

export default function CreditsPage() {
  return (
    <section
      id="credits"
      className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
    >
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm">
        {/* Branding */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary">
            Claude Code Rewind
          </span>
          <p className="font-label text-sm tracking-[0.08em] text-on-surface/40">
            Built with love <span className="text-red-500">❤️</span>
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
      </div>
    </section>
  );
}

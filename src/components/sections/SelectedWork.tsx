"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import SplitText from "@/components/SplitText";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";

type ProjectCategory = "all" | "business" | "personal";

export function SelectedWork() {
  const { locale } = useLocale();
  const { selectedWork, contact } = useContent();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");
  const archiveRegionId = useId();

  // Exactly 4 spotlight projects for the primary view
  const featuredProjects = useMemo(
    () => selectedWork.projects.slice(0, 4),
    [selectedWork.projects],
  );

  // All projects filtered for the expanded library view
  const filteredLibraryProjects = useMemo(() => {
    if (activeFilter === "all") return selectedWork.projects;
    return selectedWork.projects.filter(
      (project) => project.category === activeFilter,
    );
  }, [selectedWork.projects, activeFilter]);

  const toggleLibrary = () => {
    setIsLibraryOpen((prev) => !prev);
  };

  const closeLibrary = () => {
    setIsLibraryOpen(false);
    const workEl = document.getElementById("work");
    if (workEl) {
      workEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="work"
      data-cursor="work"
      className="px-5 pb-10 pt-8 md:px-10 md:pb-14 md:pt-10"
    >
      <div className="mx-auto max-w-[1360px] rounded-[28px] border border-[#b9d0cd] bg-[#e8f3f1] px-5 py-10 shadow-[0_20px_50px_rgba(11,61,61,0.1)] md:rounded-[48px] md:px-20 md:py-[5.5rem]">
        <Reveal className="mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {selectedWork.kicker}
          </p>
          <SplitText
            key={`${locale}-mobile`}
            tag="h2"
            text={selectedWork.mobileTitle}
            splitType="words"
            delay={80}
            duration={0.7}
            textAlign="center"
            className="mt-2.5 font-display text-[28px] font-bold tracking-tight text-ink md:hidden"
          />
          <SplitText
            key={`${locale}-desktop`}
            tag="h2"
            text={selectedWork.title}
            splitType="words"
            delay={70}
            duration={0.75}
            textAlign="center"
            className="mt-2.5 hidden font-display text-4xl font-bold tracking-tight text-ink md:block"
          />
          <p className="mt-2.5 hidden text-base text-[#3a4a4e] md:block">
            {selectedWork.intro}
          </p>
          <p className="mt-2 text-[13px] text-muted md:hidden">
            {selectedWork.swipeHint}
          </p>
        </Reveal>

        {/* Desktop 2x2 Spotlight Grid (4 main projects) */}
        <div className="mt-6 hidden gap-7 md:mt-9 md:grid md:grid-cols-2 lg:gap-8">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.id} delayMs={index * 90}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} ${contact.newTabHint}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 group-hover:border-[#96bcba] group-hover:shadow-[0_20px_50px_rgba(15,28,31,0.12)]">
                  <Image
                    src={project.image}
                    alt={`${project.name} ${contact.previewAltSuffix}`}
                    width={1172}
                    height={680}
                    sizes="(max-width: 768px) 100vw, 560px"
                    quality={75}
                    className="h-[340px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white shadow backdrop-blur-sm transition-opacity group-hover:bg-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-teal">
                    {project.label}
                  </p>
                  <span className="text-[12px] text-muted">{project.categoryLabel}</span>
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted transition-colors group-hover:text-teal">
                    <span>{project.domain}</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Mobile Swipe Row (4 featured projects) */}
        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredProjects.map((project) => (
            <a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} ${contact.newTabHint}`}
              className="w-[280px] shrink-0 snap-start"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
                <Image
                  src={project.imageMobile}
                  alt={`${project.name} ${contact.previewAltSuffix}`}
                  width={560}
                  height={360}
                  sizes="280px"
                  quality={75}
                  className="h-[180px] w-full object-cover object-top"
                />
                <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white shadow backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Live</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.08em] text-teal">
                {project.label}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                {project.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted">{project.domain}</p>
            </a>
          ))}
        </div>

        {/* Interactive Studio Archive / Library Toggle Bar */}
        <div className="mt-10 flex flex-col items-center justify-center border-t border-[#c6ddd9] pt-8">
          <button
            type="button"
            onClick={toggleLibrary}
            aria-expanded={isLibraryOpen}
            aria-controls={archiveRegionId}
            className="group flex items-center gap-3 rounded-full border border-[#a4c9c4] bg-white/90 px-6 py-3.5 text-sm font-semibold text-ink shadow-sm transition-all duration-300 hover:border-teal hover:bg-white hover:shadow-md focus-visible:outline-teal"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d6ece8] text-teal transition-transform group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <span>
              {isLibraryOpen
                ? selectedWork.library.toggleClose
                : selectedWork.library.toggleOpen}
            </span>
            <span className="rounded-full bg-[#e8f3f1] px-2 py-0.5 text-[11px] font-medium text-teal">
              {selectedWork.library.countLabel}
            </span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={`h-4 w-4 text-muted transition-transform duration-300 ${
                isLibraryOpen ? "rotate-180 text-teal" : "group-hover:translate-y-0.5"
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Expandable Archive / Library Section */}
        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div
              id={archiveRegionId}
              role="region"
              aria-label={selectedWork.library.heading}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-10">
                <div className="flex flex-col items-center justify-between gap-4 border-b border-[#c6ddd9] pb-6 sm:flex-row">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-teal">
                      {selectedWork.library.badge}
                    </span>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
                      {selectedWork.library.heading}
                    </h3>
                    <p className="mt-1 text-sm text-[#485c60]">
                      {selectedWork.library.subheading}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 rounded-full border border-[#b9d0cd] bg-white/70 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveFilter("all")}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                        activeFilter === "all"
                          ? "bg-teal text-white shadow-xs"
                          : "text-ink hover:bg-black/5"
                      }`}
                    >
                      {selectedWork.library.allFilter} ({selectedWork.projects.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("business")}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                        activeFilter === "business"
                          ? "bg-teal text-white shadow-xs"
                          : "text-ink hover:bg-black/5"
                      }`}
                    >
                      {selectedWork.library.businessFilter} (
                      {
                        selectedWork.projects.filter(
                          (p) => p.category === "business",
                        ).length
                      }
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("personal")}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                        activeFilter === "personal"
                          ? "bg-teal text-white shadow-xs"
                          : "text-ink hover:bg-black/5"
                      }`}
                    >
                      {selectedWork.library.personalFilter} (
                      {
                        selectedWork.projects.filter(
                          (p) => p.category === "personal",
                        ).length
                      }
                      )
                    </button>
                  </div>
                </div>

                {/* Library Projects Grid */}
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredLibraryProjects.map((project) => (
                    <a
                      key={`library-${project.id}`}
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} ${contact.newTabHint}`}
                      className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#96bcba] hover:shadow-[0_16px_40px_rgba(15,28,31,0.1)]"
                    >
                      <div>
                        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-[#f7faf9]">
                          <Image
                            src={project.image}
                            alt={`${project.name} ${contact.previewAltSuffix}`}
                            width={800}
                            height={480}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
                            quality={75}
                            className="h-[190px] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-white shadow backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>Live</span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between">
                          <span className="text-[10px] font-semibold tracking-[0.08em] text-teal">
                            {project.label}
                          </span>
                          <span className="rounded-md bg-[#eef7f5] px-2 py-0.5 text-[11px] font-medium text-[#2d5554]">
                            {project.categoryLabel}
                          </span>
                        </div>

                        <h4 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-ink">
                          {project.name}
                        </h4>

                        <p className="mt-1 text-xs leading-relaxed text-[#4d5e62]">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                        <span className="font-medium text-muted transition-colors group-hover:text-teal">
                          {project.domain}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-teal transition-transform duration-200 group-hover:translate-x-0.5">
                          {selectedWork.library.visitSite}
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Collapse Footer Button */}
                <div className="mt-8 flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={closeLibrary}
                    className="flex items-center gap-2 rounded-full border border-[#b9d0cd] bg-white/80 px-5 py-2.5 text-xs font-semibold text-ink shadow-xs transition-all hover:bg-white hover:border-teal"
                  >
                    <span>{selectedWork.library.toggleClose}</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-teal"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

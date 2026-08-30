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

  // Additional projects (the ones not shown in the main 4 spotlight)
  const additionalProjects = useMemo(
    () => selectedWork.projects.slice(4),
    [selectedWork.projects],
  );

  // Filtered view for additional projects in the library
  const filteredAdditionalProjects = useMemo(() => {
    if (activeFilter === "all") return additionalProjects;
    return additionalProjects.filter(
      (project) => project.category === activeFilter,
    );
  }, [additionalProjects, activeFilter]);

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

        {/* Clean, Simple View More Toggle Button */}
        {additionalProjects.length > 0 && (
          <div className="mt-8 flex justify-center pt-2 md:mt-10">
            <button
              type="button"
              onClick={toggleLibrary}
              aria-expanded={isLibraryOpen}
              aria-controls={archiveRegionId}
              className="group inline-flex items-center gap-2 rounded-full border border-[#a4c9c4] bg-white/90 px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all duration-200 hover:border-teal hover:bg-white hover:shadow-sm focus-visible:outline-teal"
            >
              <span>
                {isLibraryOpen
                  ? selectedWork.library.toggleClose
                  : selectedWork.library.toggleOpen}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-4 w-4 text-muted transition-transform duration-200 ${
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
        )}

        {/* Expandable Section Showing ONLY Additional Projects */}
        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div
              id={archiveRegionId}
              role="region"
              aria-label={selectedWork.library.heading}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-8">
                {/* Additional Projects Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {filteredAdditionalProjects.map((project) => (
                    <a
                      key={`additional-${project.id}`}
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
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.08em] text-teal">
                          {project.label}
                        </p>
                        <span className="text-[12px] text-muted">
                          {project.categoryLabel}
                        </span>
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
                  ))}
                </div>

                {/* Optional collapse button at bottom */}
                <div className="mt-6 flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={closeLibrary}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-teal"
                  >
                    <span>{selectedWork.library.toggleClose}</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
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

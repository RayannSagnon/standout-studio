"use client";

import Image from "next/image";
import SplitText from "@/components/SplitText";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";

export function SelectedWork() {
  const { locale } = useLocale();
  const { selectedWork, contact } = useContent();

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

        <div className="mt-6 hidden gap-7 md:mt-9 md:grid md:grid-cols-2">
          {selectedWork.projects.map((project, index) => (
            <Reveal key={project.id} delayMs={index * 100}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} ${contact.newTabHint}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-[0_20px_50px_rgba(15,28,31,0.12)]">
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
                <p className="mt-3 text-[11px] font-semibold tracking-[0.08em] text-teal">
                  {project.label}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-muted transition-colors group-hover:text-teal">
                  {project.domain}
                </p>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {selectedWork.projects.map((project) => (
            <a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} ${contact.newTabHint}`}
              className="w-[280px] shrink-0 snap-start"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
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
      </div>
    </section>
  );
}

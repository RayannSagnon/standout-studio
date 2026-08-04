import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { selectedWork } from "@/content/en";

export function SelectedWork() {
  return (
    <section id="work" data-cursor="work" className="px-5 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-[1360px] rounded-[28px] bg-surface px-5 py-10 md:rounded-[48px] md:px-20 md:py-[5.5rem]">
        <Reveal className="max-w-[484px]">
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {selectedWork.kicker}
          </p>
          <h2 className="mt-2.5 font-display text-[28px] font-bold tracking-tight text-ink md:text-4xl">
            <span className="md:hidden">{selectedWork.mobileTitle}</span>
            <span className="hidden md:inline">{selectedWork.title}</span>
          </h2>
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
                rel="noreferrer"
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-page shadow-sm transition-shadow duration-300 group-hover:shadow-[0_20px_50px_rgba(15,28,31,0.12)]">
                  <Image
                    src={project.image}
                    alt={`${project.name} website preview`}
                    width={1172}
                    height={680}
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

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {selectedWork.projects.map((project) => (
            <a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="w-[280px] shrink-0"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-page">
                <Image
                  src={project.image}
                  alt={`${project.name} website preview`}
                  width={560}
                  height={360}
                  className="h-[180px] w-full object-cover object-top"
                />
              </div>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.08em] text-teal">
                {project.label}
              </p>
              <p className="mt-1 text-sm text-muted">{project.domain}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

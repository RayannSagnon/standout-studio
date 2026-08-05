import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Packages } from "@/components/sections/Packages";
import { Process } from "@/components/sections/Process";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Testimonials } from "@/components/sections/Testimonials";
import { Trust } from "@/components/sections/Trust";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { Why } from "@/components/sections/Why";
import { SiteApproach } from "@/components/layout/SiteApproach";

export function HomePage() {
  return (
    <>
      <Hero />
      <Trust />
      <WhatWeDo />
      <SiteApproach>
        <SelectedWork />
        <Packages />
      </SiteApproach>
      <Why />
      <Marquee />
      <Process />
      <Testimonials />
      <About />
      <Faq />
      <Contact />
    </>
  );
}

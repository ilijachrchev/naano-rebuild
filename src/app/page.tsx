import type { Metadata } from "next";

import { Attribution } from "@/components/landing/attribution";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MotionRoot } from "@/components/landing/motion";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { StatsBand } from "@/components/landing/stats";
import { Trusted } from "@/components/landing/trusted";

export const metadata: Metadata = {
  title: "naano — creator marketing you can put in the pipeline report",
  description:
    "naano is the B2B LinkedIn creator marketplace: book vetted creators, pay per qualified click, and attribute every click back to the companies and pipeline it creates.",
  openGraph: {
    title: "naano — creator marketing you can put in the pipeline report",
    description:
      "Book vetted LinkedIn creators, pay per qualified click, and attribute every click back to pipeline.",
    type: "website",
  },
};

const DIRECTION_CONTRACT =
  "<!-- THESIS: One blue thread makes attribution the hero — a click traced post->click->company->pipeline; refuses the centered-hero + three-identical-cards SaaS template. OWN-WORLD: Warm near-white grounds, one confident azure carried at page scale, near-black Barlow Condensed display, Manrope body, tabular mono numerals, soft blue cloud washes, a drawn connective thread as the recurring motif, hairline borders, generous air. STORY: A skeptical B2B marketer sees creator posts turned into measured pipeline, understands the four-step path, grasps pay-per-qualified-click, and acts. FIRST VIEWPORT: Left headline 'Creator marketing you can put in the pipeline report' + subcopy + primary CTA to /auth; right, the attribution-thread figure drawing itself through four stages. FORM: Attribution Thread, direction 4 of my grounded list, seed 0e3663d5. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->";

export default function LandingPage() {
  return (
    <div className="nn-root min-h-screen">
      <template
        data-impeccable-contract="0e3663d5"
        dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
      />
      <MotionRoot />
      <Nav />
      <main>
        <Hero />
        <Trusted />
        <HowItWorks />
        <Attribution />
        <StatsBand />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

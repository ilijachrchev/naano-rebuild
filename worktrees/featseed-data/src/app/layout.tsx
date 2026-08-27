import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "naano",
  description: "B2B LinkedIn creator marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <template
          data-impeccable-contract="851d3729"
          dangerouslySetInnerHTML={{
            __html:
              "<!-- THESIS: A company URL becomes a campaign-ready positioning dossier; this refuses the generic centered SaaS wizard. OWN-WORLD: Carbon and mineral-white folio planes, aubergine controls, acid-lime evidence marks, clipped index tabs, and precise hairlines. STORY: A brand gains access, identifies its workspace, watches evidence resolve, and reaches a useful empty dashboard. FIRST VIEWPORT: A dark access column faces a bright working dossier with the URL-to-value-prop-to-ICP mechanism visible at full scale. FORM: Signal Dossier, grounded direction 7, seed 851d3729. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->",
          }}
        />
        {children}
      </body>
    </html>
  );
}

import { z } from "zod";

const linkedinHostnamePattern = /(^|\.)linkedin\.com$/i;

export const linkedinProfileUrlSchema = z
  .string()
  .trim()
  .min(1, "Paste your public LinkedIn profile URL.")
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .pipe(
    z
      .url("Enter a valid LinkedIn profile URL.")
      .refine((value) => {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) &&
          linkedinHostnamePattern.test(url.hostname) &&
          /^\/in\/[^/]+\/?$/i.test(url.pathname)
        );
      }, "Use a public LinkedIn profile URL in the form linkedin.com/in/your-name."),
  )
  .transform((value) => {
    const url = new URL(value);
    url.protocol = "https:";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  });

export const generatedCreatorProfileSchema = z.object({
  headline: z.string().trim().min(1).max(180),
  suggestedCountry: z.string().trim().min(1).max(80),
  suggestedIndustries: z.array(z.string().trim().min(1).max(60)).min(1).max(3),
  suggestedPricePerPostCents: z.number().int().min(0).max(10_000_000),
  audienceSummary: z.string().trim().min(1).max(600),
});

export type GeneratedCreatorProfile = z.infer<typeof generatedCreatorProfileSchema>;
export type CreatorGenerationMode = "ai" | "placeholder";

export type CreatorOnboardingDraft = GeneratedCreatorProfile & {
  linkedinUrl: string;
};

const priceInEurosSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:[.,]\d{1,2})?$/, "Enter a price in euros with up to two decimals.")
  .transform((value) => {
    const [euros, decimals = ""] = value.replace(",", ".").split(".");
    return Number(euros) * 100 + Number(decimals.padEnd(2, "0"));
  })
  .pipe(z.number().int().min(0).max(10_000_000, "Enter a price of €100,000 or less."));

export const creatorListingSchema = z.object({
  linkedinUrl: linkedinProfileUrlSchema,
  headline: z.string().trim().min(2, "Add a headline.").max(180),
  audienceSummary: z.string().trim().min(10, "Add an audience summary.").max(600),
  country: z
    .string()
    .trim()
    .min(2, "Add your country.")
    .max(80)
    .refine((value) => !value.startsWith("[Placeholder]"), "Replace the placeholder country."),
  industries: z.array(z.string().trim().min(1).max(60)).min(1, "Add at least one industry.").max(3),
  pricePerPostCents: priceInEurosSchema,
});

export type CreatorListingInput = z.infer<typeof creatorListingSchema>;

import { z } from "zod";

import type { Json } from "@/types/database";

export const brandIcpSchema = z.object({
  role: z.string().min(1).max(80),
  companyType: z.string().min(1).max(140),
  pain: z.string().min(1).max(200),
  productFit: z.string().min(1).max(220),
  tags: z.array(z.string().min(1).max(32)).min(2).max(5),
});

export const generatedBrandProfileSchema = z.object({
  valueProp: z.string().min(1).max(220),
  icps: z.array(brandIcpSchema).length(3),
});

export type BrandIcp = z.infer<typeof brandIcpSchema>;
export type GeneratedBrandProfile = z.infer<typeof generatedBrandProfileSchema>;

export function parseBrandIcps(value: Json | null): BrandIcp[] {
  const parsed = z.array(brandIcpSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

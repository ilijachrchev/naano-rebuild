import { redirect } from "next/navigation";

import { getBrandContext, getBrandDestination } from "@/lib/brand/context";

export default async function Home() {
  const context = await getBrandContext();
  redirect(getBrandDestination(context));
}

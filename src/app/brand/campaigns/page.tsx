import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandSidebar } from "@/components/brand/sidebar";
import {
  BriefEditor,
  CreateCampaignForm,
  GenerateBriefForm,
} from "@/components/campaigns/forms";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { loadCampaignsData } from "@/lib/campaigns/data";

function CampaignStatus({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
      <span className="h-2 w-2 rounded-full bg-nn-blue" /> {status}
    </span>
  );
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const { campaigns, briefsByCampaignId } = await loadCampaignsData(workspace.id);
  const requestedCampaignId = (await searchParams).campaign;
  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === requestedCampaignId) ?? campaigns[0] ?? null;
  const selectedBrief = selectedCampaign ? briefsByCampaignId[selectedCampaign.id] : null;

  return (
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_1fr]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand/campaigns" />

      <section className="min-h-screen bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Campaigns</p>
            <p className="text-sm text-nn-muted">Objective in, editable creator brief out</p>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/brand"
              className="text-xs font-bold tracking-[0.09em] text-nn-muted uppercase hover:text-nn-blue"
            >
              Overview
            </Link>
            <CampaignStatus status={selectedCampaign ? "In progress" : "New"} />
          </div>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr] xl:items-end">
            <h1 className="display-type max-w-xl text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              Turn an objective into a creator-ready brief.
            </h1>
            <div>
              <p className="max-w-2xl text-lg leading-8 text-nn-muted">
                Save the campaign first. Then Create with AI uses its objective and the brand profile
                already captured for {workspace.name}. Every generated field stays editable.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-nn-line px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-nn-muted uppercase">
                  LinkedIn
                </span>
                <span className="rounded-full border border-nn-line px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-nn-muted uppercase">
                  Draft first
                </span>
                <span className="nn-chip">Uses saved brand signals</span>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-12 xl:grid-cols-[minmax(290px,0.72fr)_minmax(0,1.28fr)]">
            <div>
              <section>
                <h2 className="display-type text-3xl text-nn-ink">Create a campaign</h2>
                <CreateCampaignForm workspaceId={workspace.id} />
              </section>

              <section className="mt-12 border-nn-line border-t pt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-nn-ink">Campaign index</h3>
                    <p className="mt-1 text-sm text-nn-muted">Saved in this workspace</p>
                  </div>
                  <span className="nn-chip">{campaigns.length}</span>
                </div>

                {campaigns.length ? (
                  <ol className="mt-5 grid gap-2">
                    {campaigns.map((campaign, index) => {
                      const active = selectedCampaign?.id === campaign.id;
                      return (
                        <li key={campaign.id}>
                          <Link
                            href={`/brand/campaigns?campaign=${campaign.id}`}
                            aria-current={active ? "true" : undefined}
                            className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[0.85rem] border px-4 py-4 transition-colors ${
                              active
                                ? "border-nn-blue bg-nn-blue-50"
                                : "border-nn-line bg-nn-white hover:border-nn-blue"
                            }`}
                          >
                            <span
                              className={`nn-num display-type text-2xl ${active ? "text-nn-blue" : "text-nn-muted"}`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-nn-ink">{campaign.name}</span>
                              <span className="mt-1 block text-xs text-nn-muted">
                                {briefsByCampaignId[campaign.id] ? "Brief saved" : "Brief pending"}
                              </span>
                            </span>
                            {active ? <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" /> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-nn-muted">
                    No campaigns yet. The first saved campaign will appear here.
                  </p>
                )}
              </section>
            </div>

            <section className="xl:border-nn-line xl:border-l xl:pl-10">
              {selectedCampaign ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-5 border-nn-line border-b pb-7">
                    <h2 className="display-type text-4xl text-nn-ink sm:text-5xl">
                      {selectedCampaign.name}
                    </h2>
                    <CampaignStatus status={selectedBrief?.status ?? "Brief pending"} />
                  </div>

                  <div className="border-nn-line border-b py-6">
                    <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
                      Saved objective
                    </p>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-nn-ink">
                      {selectedCampaign.objective}
                    </p>
                    {selectedCampaign.region ? (
                      <p className="mt-3 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
                        Region · {selectedCampaign.region}
                      </p>
                    ) : null}
                  </div>

                  {selectedBrief ? (
                    <BriefEditor key={selectedBrief.id} brief={selectedBrief} />
                  ) : (
                    <GenerateBriefForm key={selectedCampaign.id} campaignId={selectedCampaign.id} />
                  )}
                </>
              ) : (
                <div className="rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-10">
                  <h2 className="display-type text-4xl text-nn-ink">The brief starts after the campaign.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-nn-muted">
                    Save a name and objective to unlock Create with AI. The saved campaign remains the
                    durable source for every later edit.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

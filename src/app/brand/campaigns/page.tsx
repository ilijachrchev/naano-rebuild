import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";
import {
  BriefEditor,
  CreateCampaignForm,
  GenerateBriefForm,
} from "@/components/campaigns/forms";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { loadCampaignsData } from "@/lib/campaigns/data";

const navigation = ["Overview", "Creators", "Campaigns", "Collaborations", "Wallet"];

function CampaignStatus({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.1em] uppercase">
      <span className="h-2 w-2 rounded-full bg-signal" /> {status}
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
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="flex bg-carbon px-6 py-6 text-mineral lg:min-h-screen lg:flex-col lg:px-8 lg:py-8">
        <div className="flex w-full items-center justify-between lg:block">
          <BrandMark inverse />
          <div className="ml-auto text-right lg:mt-14 lg:ml-0 lg:text-left">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] text-mineral/45 uppercase">
              Workspace
            </p>
            <p className="mt-1 font-bold">{workspace.name}</p>
          </div>
        </div>

        <nav aria-label="Brand navigation" className="mt-10 hidden lg:block">
          <ul className="space-y-1">
            {navigation.map((item, index) => {
              const active = item === "Campaigns";
              const overview = item === "Overview";
              const className = `flex w-full items-center justify-between border-0 px-3 py-3 text-left text-sm font-semibold ${
                active ? "bg-signal text-carbon" : "bg-transparent text-mineral/46"
              }`;

              return (
                <li key={item}>
                  {overview ? (
                    <Link href="/brand" className={`${className} hover:text-signal`}>
                      {item}
                      <span className="display-type text-base">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  ) : (
                    <span aria-current={active ? "page" : undefined} className={className}>
                      {item}
                      <span className="display-type text-base">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <form action={signOutBrand} className="mt-auto hidden border-white/18 border-t pt-6 lg:block">
          <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-mineral/65 hover:text-signal">
            Sign out
          </button>
        </form>
      </aside>

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Campaign dossier
            </p>
            <p className="text-sm text-carbon/55">Objective in, editable creator brief out</p>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/brand"
              className="text-xs font-bold tracking-[0.09em] text-carbon/56 uppercase hover:text-aubergine"
            >
              Overview
            </Link>
            <CampaignStatus status={selectedCampaign ? "In progress" : "New"} />
          </div>
        </header>

        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                01 / Campaign
              </p>
              <h1 className="display-type mt-4 text-5xl leading-[0.92] sm:text-6xl">
                Turn an objective into a creator-ready brief.
              </h1>
            </div>
            <div className="border-carbon/22 border-t pt-6 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10">
              <p className="max-w-2xl text-base leading-7 text-carbon/64">
                Save the campaign first. Then Create with AI uses its objective and the brand profile
                already captured for {workspace.name}. Every generated field stays editable.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold tracking-[0.09em] uppercase">
                <span className="border border-carbon/18 px-3 py-2">LinkedIn</span>
                <span className="border border-carbon/18 px-3 py-2">Draft first</span>
                <span className="bg-signal px-3 py-2">Uses saved brand signals</span>
              </div>
            </div>
          </div>

          <div className="grid gap-12 pt-12 xl:grid-cols-[minmax(290px,0.72fr)_minmax(0,1.28fr)]">
            <div>
              <section>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  New dossier
                </p>
                <h2 className="display-type mt-3 text-4xl">Create a campaign</h2>
                <CreateCampaignForm workspaceId={workspace.id} />
              </section>

              <section className="mt-12 border-carbon/18 border-t pt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] uppercase">Campaign index</p>
                    <p className="mt-1 text-sm text-carbon/54">Saved in this workspace</p>
                  </div>
                  <span className="bg-signal px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                    {campaigns.length}
                  </span>
                </div>

                {campaigns.length ? (
                  <ol className="mt-5 border-carbon/18 border-y">
                    {campaigns.map((campaign, index) => {
                      const active = selectedCampaign?.id === campaign.id;
                      return (
                        <li key={campaign.id} className="border-carbon/14 border-b last:border-b-0">
                          <Link
                            href={`/brand/campaigns?campaign=${campaign.id}`}
                            aria-current={active ? "true" : undefined}
                            className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 px-2 py-4 transition-colors ${
                              active ? "bg-mist/55" : "hover:bg-mist/30"
                            }`}
                          >
                            <span className={`display-type text-2xl ${active ? "text-aubergine" : "text-carbon/42"}`}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>
                              <span className="block text-sm font-bold">{campaign.name}</span>
                              <span className="mt-1 block text-xs text-carbon/50">
                                {briefsByCampaignId[campaign.id] ? "Brief saved" : "Brief pending"}
                              </span>
                            </span>
                            {active ? <span className="h-2.5 w-2.5 rounded-full bg-signal" /> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mt-5 border-carbon/18 border-y py-5 text-sm leading-6 text-carbon/56">
                    No campaigns yet. The first saved campaign will appear here.
                  </p>
                )}
              </section>
            </div>

            <section className="xl:border-carbon/18 xl:border-l xl:pl-10">
              {selectedCampaign ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-5 border-carbon/18 border-b pb-7">
                    <div>
                      <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                        02 / Brief
                      </p>
                      <h2 className="display-type mt-3 text-4xl sm:text-5xl">
                        {selectedCampaign.name}
                      </h2>
                    </div>
                    <CampaignStatus status={selectedBrief?.status ?? "Brief pending"} />
                  </div>

                  <div className="border-carbon/18 border-b py-6">
                    <p className="text-[0.7rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                      Saved objective
                    </p>
                    <p className="mt-3 max-w-3xl text-base leading-7">{selectedCampaign.objective}</p>
                    {selectedCampaign.region ? (
                      <p className="mt-3 text-xs font-bold tracking-[0.09em] text-carbon/52 uppercase">
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
                <div className="border border-carbon/18 px-6 py-10">
                  <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                    02 / Brief
                  </p>
                  <h2 className="display-type mt-4 text-4xl">The brief starts after the campaign.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-carbon/62">
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

import { redirect } from "next/navigation";

import { CreatorShell } from "@/components/creator/shell";
import { getCreatorContext } from "@/lib/creator/context";
import { getCreatorReferralProgram } from "@/lib/referrals/data";
import { rewardTiers } from "@/lib/referrals/reward";

const numberFormat = new Intl.NumberFormat("en");

export default async function CreatorReferralsPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const program = await getCreatorReferralProgram({
    creatorId: context.creator.id,
    creatorName: context.creator.displayName,
  });
  const referralLink = `https://naano.com/auth?ref=${encodeURIComponent(program.code)}`;
  const totalQualifiedClicks = program.referrals.reduce(
    (total, referral) => total + referral.reward.qualifiedClicks,
    0,
  );
  const liveReferralCount = program.referrals.filter((referral) => referral.source === "live").length;

  return (
    <CreatorShell
      creatorName={context.creator.displayName}
      activeHref="/creator"
      eyebrow="Referral program"
      detail="Creator-scoped referral and attribution record"
      marker="Tracked simulation only"
    >
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[0.85fr_1.15fr] xl:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                Supply dossier · 04
              </p>
              <h1 className="display-type mt-3 max-w-3xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                Reward the brands that create signal.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-carbon/62">
                A standard referral stays flat. This model starts with your base rate, then raises the tracked rate when a referred brand produces real qualified-click activity.
              </p>
            </div>

            <section className="bg-carbon p-6 text-mineral sm:p-8" aria-labelledby="personal-link-heading">
              <div className="flex flex-wrap items-start justify-between gap-5 border-white/18 border-b pb-6">
                <div>
                  <p className="text-[0.68rem] font-bold tracking-[0.12em] text-signal uppercase">
                    Personal referral link
                  </p>
                  <h2 id="personal-link-heading" className="display-type mt-2 text-4xl">
                    Share one code.
                  </h2>
                </div>
                <span className="border border-signal px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.1em] text-signal uppercase">
                  {program.codeSource === "demo" ? "Demo code" : "Tracked code"}
                </span>
              </div>
              <dl className="divide-white/16 divide-y">
                <div className="grid gap-2 py-5 sm:grid-cols-[110px_1fr] sm:items-center">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-mineral/48 uppercase">Code</dt>
                  <dd className="font-mono text-base break-all text-white">{program.code}</dd>
                </div>
                <div className="grid gap-2 py-5 sm:grid-cols-[110px_1fr] sm:items-center">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-mineral/48 uppercase">Link</dt>
                  <dd className="font-mono text-sm break-all text-mineral/78">{referralLink}</dd>
                </div>
              </dl>
              <p className="border-white/16 border-t pt-5 text-xs leading-5 text-mineral/48">
                Referral capture happens outside this read-only page. This link never collects payment or creates a payout.
              </p>
            </section>
          </div>

          <section className="pt-12" aria-labelledby="reward-record-heading">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Reward record
                </p>
                <h2 id="reward-record-heading" className="display-type mt-2 text-4xl sm:text-5xl">
                  Base rate + earned signal bonus.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-carbon/56">
                Percentages below are simulated tracking rates, not balances, earnings, payouts, or settlement instructions.
              </p>
            </div>

            <dl className="mt-8 grid border-carbon/20 border-y sm:grid-cols-3">
              {[
                ["Live referrals", liveReferralCount.toString(), "Creator-scoped referral rows"],
                ["Shown below", program.referrals.length.toString(), "Live plus clearly marked demos"],
                ["Qualified clicks", numberFormat.format(totalQualifiedClicks), "RLS-visible plus demo activity"],
              ].map(([label, value, note]) => (
                <div key={label} className="border-carbon/16 border-b px-5 py-6 last:border-b-0 sm:border-r sm:border-b-0 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">{label}</dt>
                  <dd className="display-type mt-3 text-4xl">{value}</dd>
                  <p className="mt-2 text-xs leading-5 text-carbon/52">{note}</p>
                </div>
              ))}
            </dl>

            <div className="mt-8 overflow-x-auto border-carbon/20 border-y">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-carbon/16 border-b text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                    <th className="px-4 py-4 first:pl-0">Referred brand</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Qualified clicks</th>
                    <th className="px-4 py-4">Base</th>
                    <th className="px-4 py-4">Bonus tier</th>
                    <th className="px-4 py-4 text-right last:pr-0">Tracked reward</th>
                  </tr>
                </thead>
                <tbody>
                  {program.referrals.map((referral) => (
                    <tr key={referral.id} className="border-carbon/14 border-b last:border-b-0">
                      <td className="px-4 py-5 first:pl-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{referral.brandName}</span>
                          {referral.source === "demo" ? (
                            <span className="bg-mist px-2 py-1 text-[0.62rem] font-bold tracking-[0.1em] uppercase">
                              Demo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-carbon/45">Tracked for {referral.rewardMonths} months</p>
                      </td>
                      <td className="px-4 py-5 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${isActiveStatus(referral.status) ? "bg-signal" : "bg-carbon/25"}`}
                            aria-hidden="true"
                          />
                          {referral.status}
                        </span>
                      </td>
                      <td className="display-type px-4 py-5 text-2xl">
                        {numberFormat.format(referral.reward.qualifiedClicks)}
                      </td>
                      <td className="px-4 py-5 text-sm font-bold">{referral.reward.baseRatePct}%</td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold">{referral.reward.tier.label}</p>
                        <p className="mt-1 text-xs text-carbon/48">+{referral.reward.bonusRatePct} points</p>
                      </td>
                      <td className="px-4 py-5 text-right last:pr-0">
                        <p className="display-type text-3xl">{referral.reward.effectiveRatePct}%</p>
                        <p className="mt-1 text-[0.62rem] font-bold tracking-[0.08em] text-aubergine uppercase">
                          Simulated rate
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-14 grid border-carbon/20 border-y lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="model-heading">
            <div className="border-carbon/18 border-b py-8 lg:border-r lg:border-b-0 lg:pr-10">
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">How it works</p>
              <h2 id="model-heading" className="display-type mt-3 text-4xl sm:text-5xl">
                Attribution turns quality into weight.
              </h2>
              <p className="mt-5 text-sm leading-6 text-carbon/58">
                Referring many inactive accounts does not increase the bonus. A brand moves through tiers only when its campaigns generate qualified clicks, so useful introductions carry more weight than raw invite volume.
              </p>
            </div>
            <ol className="divide-carbon/16 divide-y py-2 lg:pl-10">
              {rewardTiers.map((tier, index) => (
                <li key={tier.label} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 py-5">
                  <span className="display-type text-2xl text-aubergine">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-bold">{tier.label}</p>
                    <p className="mt-1 text-xs text-carbon/48">
                      {tier.minimumQualifiedClicks === 0
                        ? "Starts immediately"
                        : `${numberFormat.format(tier.minimumQualifiedClicks)}+ qualified clicks`}
                    </p>
                  </div>
                  <span className="display-type text-2xl">+{tier.bonusPercentagePoints} pts</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-10 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
            <p className="text-sm leading-6 text-carbon/64">
              <strong className="text-carbon">Simulation boundary:</strong> this page reads referral and attribution records and calculates a display rate in memory. It never captures funds, creates payouts, or changes wallet or settlement records.
            </p>
            <p className="mt-2 text-xs leading-5 text-carbon/52">
              Live click bonuses appear only when attribution is visible to the creator under RLS. The current raw-click policy is brand-member scoped, so the demo rows show the full tier progression without bypassing access controls.
            </p>
          </div>
      </div>
    </CreatorShell>
  );
}

function isActiveStatus(status: string) {
  return /active|live|completed/i.test(status);
}

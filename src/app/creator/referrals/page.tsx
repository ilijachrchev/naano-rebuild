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
      activeHref="/creator/referrals"
      eyebrow="Referral program"
      detail="Creator-scoped referral and attribution record"
      marker="Tracked simulation only"
    >
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
            <div className="max-w-xl">
              <h1 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
                Reward the brands that create signal.
              </h1>
              <p className="mt-5 text-lg text-nn-muted">
                A standard referral stays flat. This model starts with your base rate, then raises the tracked rate when a referred brand produces real qualified-click activity.
              </p>
            </div>

            <section
              className="rounded-[var(--nn-radius)] bg-nn-blue p-7 text-white shadow-[0_28px_60px_-30px_rgb(31_68_255/0.7)] sm:p-9"
              aria-labelledby="personal-link-heading"
            >
              <div className="flex flex-wrap items-start justify-between gap-5 border-white/25 border-b pb-6">
                <h2 id="personal-link-heading" className="nn-display text-3xl text-white">
                  Personal referral link
                </h2>
                <span className="rounded-full border border-white/45 px-3 py-1 text-[0.65rem] font-bold tracking-[0.1em] text-white uppercase">
                  {program.codeSource === "demo" ? "Demo code" : "Tracked code"}
                </span>
              </div>
              <dl className="divide-white/20 divide-y">
                <div className="grid gap-2 py-5 sm:grid-cols-[110px_1fr] sm:items-center">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-white/80 uppercase">Code</dt>
                  <dd className="font-mono text-base break-all text-white">{program.code}</dd>
                </div>
                <div className="grid gap-2 py-5 sm:grid-cols-[110px_1fr] sm:items-center">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-white/80 uppercase">Link</dt>
                  <dd className="font-mono text-sm break-all text-white/85">{referralLink}</dd>
                </div>
              </dl>
              <p className="border-white/20 border-t pt-5 text-xs leading-5 text-white/75">
                Referral capture happens outside this read-only page. This link never collects payment or creates a payout.
              </p>
            </section>
          </div>

          <section className="mt-16" aria-labelledby="reward-record-heading">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <h2 id="reward-record-heading" className="nn-display text-[clamp(1.75rem,3vw,2.5rem)] text-nn-ink">
                Base rate + earned signal bonus.
              </h2>
              <p className="max-w-md text-sm leading-6 text-nn-muted">
                Percentages below are simulated tracking rates, not balances, earnings, payouts, or settlement instructions.
              </p>
            </div>

            <dl className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                ["Live referrals", liveReferralCount.toString(), "Creator-scoped referral rows"],
                ["Shown below", program.referrals.length.toString(), "Live plus clearly marked demos"],
                ["Qualified clicks", numberFormat.format(totalQualifiedClicks), "RLS-visible plus demo activity"],
              ].map(([label, value, note]) => (
                <div key={label} className="nn-card p-6">
                  <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">{label}</dt>
                  <dd className="nn-display nn-num mt-3 text-4xl text-nn-ink">{value}</dd>
                  <p className="mt-2 text-xs leading-5 text-nn-muted">{note}</p>
                </div>
              ))}
            </dl>

            <div className="nn-card mt-8 overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-nn-line border-b text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                    <th className="px-6 py-4">Referred brand</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Qualified clicks</th>
                    <th className="px-6 py-4">Base</th>
                    <th className="px-6 py-4">Bonus tier</th>
                    <th className="px-6 py-4 text-right">Tracked reward</th>
                  </tr>
                </thead>
                <tbody>
                  {program.referrals.map((referral) => (
                    <tr key={referral.id} className="border-nn-line border-b last:border-b-0">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-nn-ink">{referral.brandName}</span>
                          {referral.source === "demo" ? (
                            <span className="rounded-full bg-nn-blue-50 px-2 py-1 text-[0.62rem] font-bold tracking-[0.1em] text-nn-blue-strong uppercase">
                              Demo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-nn-muted">Tracked for {referral.rewardMonths} months</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-nn-muted">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${isActiveStatus(referral.status) ? "bg-nn-blue" : "bg-nn-line-strong"}`}
                            aria-hidden="true"
                          />
                          {referral.status}
                        </span>
                      </td>
                      <td className="nn-display nn-num px-6 py-5 text-2xl text-nn-ink">
                        {numberFormat.format(referral.reward.qualifiedClicks)}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-nn-ink">{referral.reward.baseRatePct}%</td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-nn-ink">{referral.reward.tier.label}</p>
                        <p className="mt-1 text-xs text-nn-muted">+{referral.reward.bonusRatePct} points</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="nn-display nn-num text-3xl text-nn-ink">{referral.reward.effectiveRatePct}%</p>
                        <p className="mt-1 text-[0.62rem] font-bold tracking-[0.08em] text-nn-blue uppercase">
                          Simulated rate
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-16 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start" aria-labelledby="model-heading">
            <div className="lg:pr-6">
              <h2 id="model-heading" className="nn-display text-[clamp(1.75rem,3vw,2.5rem)] text-nn-ink">
                Attribution turns quality into weight.
              </h2>
              <p className="mt-5 text-sm leading-6 text-nn-muted">
                Referring many inactive accounts does not increase the bonus. A brand moves through tiers only when its campaigns generate qualified clicks, so useful introductions carry more weight than raw invite volume.
              </p>
            </div>
            <ol className="nn-card list-none divide-nn-line divide-y p-0">
              {rewardTiers.map((tier, index) => (
                <li key={tier.label} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 px-6 py-5">
                  <span className="nn-display nn-num text-2xl text-nn-blue">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-bold text-nn-ink">{tier.label}</p>
                    <p className="mt-1 text-xs text-nn-muted">
                      {tier.minimumQualifiedClicks === 0
                        ? "Starts immediately"
                        : `${numberFormat.format(tier.minimumQualifiedClicks)}+ qualified clicks`}
                    </p>
                  </div>
                  <span className="nn-display nn-num text-2xl text-nn-ink">+{tier.bonusPercentagePoints} pts</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-12 rounded-[var(--nn-radius)] bg-nn-blue-50 p-6 sm:p-7">
            <p className="text-sm leading-6 text-nn-ink">
              <strong className="text-nn-ink">Simulation boundary:</strong> this page reads referral and attribution records and calculates a display rate in memory. It never captures funds, creates payouts, or changes wallet or settlement records.
            </p>
            <p className="mt-2 text-xs leading-5 text-nn-muted">
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

export type RewardTier = {
  label: string;
  minimumQualifiedClicks: number;
  bonusPercentagePoints: number;
};

export type PerformanceReward = {
  baseRatePct: number;
  bonusRatePct: number;
  effectiveRatePct: number;
  qualifiedClicks: number;
  tier: RewardTier;
};

export const rewardTiers = [
  { label: "Base", minimumQualifiedClicks: 0, bonusPercentagePoints: 0 },
  { label: "Momentum", minimumQualifiedClicks: 50, bonusPercentagePoints: 3 },
  { label: "High signal", minimumQualifiedClicks: 150, bonusPercentagePoints: 7 },
  { label: "Breakout", minimumQualifiedClicks: 300, bonusPercentagePoints: 12 },
] as const satisfies readonly RewardTier[];

export function calculatePerformanceReward({
  baseRatePct,
  qualifiedClicks,
}: {
  baseRatePct: number;
  qualifiedClicks: number;
}): PerformanceReward {
  const normalizedBaseRate = Math.min(100, Math.max(0, baseRatePct));
  const normalizedClicks = Math.max(0, Math.floor(qualifiedClicks));
  const tier = [...rewardTiers]
    .reverse()
    .find((candidate) => normalizedClicks >= candidate.minimumQualifiedClicks) ?? rewardTiers[0];

  return {
    baseRatePct: normalizedBaseRate,
    bonusRatePct: tier.bonusPercentagePoints,
    effectiveRatePct: normalizedBaseRate + tier.bonusPercentagePoints,
    qualifiedClicks: normalizedClicks,
    tier,
  };
}

import Link from "next/link";

const options = [
  { key: "brand", label: "I'm a brand", href: "/auth" },
  { key: "creator", label: "I'm a creator", href: "/creator/auth" },
] as const;

/**
 * Symmetric brand/creator entry switch shown on both auth surfaces so either
 * account type is reachable without editing the URL. The auth logic stays two
 * separate flows; this only makes both entrances visible and obvious.
 */
export function RoleSwitch({ active }: { active: "brand" | "creator" }) {
  return (
    <div>
      <p className="text-[0.7rem] font-bold tracking-[0.14em] text-mineral/55 uppercase">
        Choose your account
      </p>
      <div
        role="group"
        aria-label="Account type"
        className="mt-2.5 grid grid-cols-2 gap-1 rounded-[0.85rem] border border-white/15 bg-white/[0.04] p-1"
      >
        {options.map((option) => {
          const isActive = option.key === active;
          return (
            <Link
              key={option.key}
              href={option.href}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-[0.6rem] px-3 py-2.5 text-center text-sm font-bold transition-colors ${
                isActive
                  ? "bg-nn-blue text-white shadow-[0_8px_20px_-10px_rgb(31_68_255/0.6)]"
                  : "text-mineral/65 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

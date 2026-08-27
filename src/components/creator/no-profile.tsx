import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";

export function CreatorProfileMissing() {
  return (
    <main className="grid min-h-screen bg-carbon lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
      <section className="flex flex-col justify-between border-white/18 border-b px-6 py-8 text-mineral sm:px-10 lg:border-r lg:border-b-0 lg:px-14">
        <BrandMark inverse />
        <div className="my-16 max-w-xl">
          <p className="text-xs font-bold tracking-[0.12em] text-signal uppercase">Creator access</p>
          <h1 className="display-type mt-4 text-5xl leading-[0.92] sm:text-6xl">
            This account has no creator card yet.
          </h1>
        </div>
        <form action={signOutBrand}>
          <button className="text-sm font-bold text-mineral/70 hover:text-signal">Sign out</button>
        </form>
      </section>
      <section className="dossier-paper flex items-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="max-w-2xl border-carbon/18 border-y py-10">
          <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
            Deliberately thin
          </p>
          <p className="display-type mt-4 text-4xl leading-[1.02]">
            Creator onboarding is outside this handshake demo. Sign in with a seeded creator account to inspect invitations and earnings.
          </p>
        </div>
      </section>
    </main>
  );
}

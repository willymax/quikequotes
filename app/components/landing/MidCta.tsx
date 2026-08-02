import { CtaButton } from "./CtaButton";

export function MidCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="px-6 py-10 bg-paper-warm">
      <div className="max-w-4xl mx-auto rounded-2xl bg-ink on-ink px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <p className="type-display text-paper font-bold text-xl">
          Ready to stop losing jobs to slow follow-up?
        </p>
        <CtaButton href={signedIn ? "/dashboard" : "/sign-up"} size="lg">
          {signedIn ? "Go to dashboard →" : "Start free →"}
        </CtaButton>
      </div>
    </section>
  );
}

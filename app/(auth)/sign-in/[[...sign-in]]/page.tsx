import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="mb-6">
        <h1 className="type-display text-2xl font-extrabold">Sign in</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Pick up where you left off.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}

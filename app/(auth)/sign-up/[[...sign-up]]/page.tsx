import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="mb-6">
        <h1 className="type-display text-2xl font-extrabold">Create account</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Free to start. No card needed.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}

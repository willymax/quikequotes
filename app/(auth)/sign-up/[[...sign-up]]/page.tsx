import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-zinc-500 mt-1 text-sm">Start winning more jobs today</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}

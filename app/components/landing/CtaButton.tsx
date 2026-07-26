import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-amber text-ink hover:bg-amber-deep",
  outline:
    "bg-transparent text-amber border-2 border-amber hover:bg-amber hover:text-ink",
  "outline-ink":
    "bg-transparent text-ink border-2 border-ink/15 hover:border-ink/30",
} as const;

export function CtaButton({
  href,
  size = "lg",
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  size?: "lg" | "md";
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  const sizeClasses = size === "lg" ? "h-14 px-8 text-lg" : "h-12 px-6 text-base";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-all hover:-translate-y-0.5 ${sizeClasses} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

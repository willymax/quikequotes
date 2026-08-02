import Link from "next/link";
import { buttonClass } from "@/lib/ui";

/**
 * Marketing CTA. Delegates to the product's `buttonClass()` so the button a
 * visitor clicks on the landing page is the same object they meet inside the
 * app — the `outline` variant that used to live here was dead code and is gone.
 */
export function CtaButton({
  href,
  size = "lg",
  variant = "accent",
  className = "",
  children,
}: {
  href: string;
  size?: "lg" | "xl";
  variant?: "accent" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={buttonClass({
        variant,
        size,
        pill: true,
        className: `hover:-translate-y-0.5 transition-transform ${className}`,
      })}
    >
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusIcon,
  QuotesIcon,
  SettingsIcon,
  TemplatesIcon,
} from "@/app/components/icons";

/**
 * The nav had no active state at all — every tab looked identical no matter
 * where you were. The active tab now carries an amber bar along the top edge of
 * its cell, echoing the status rail on quote cards, so the same visual device
 * means "this one" everywhere in the product.
 *
 * Templates is here because the page existed but was reachable only by typing
 * the URL.
 */
export function BottomNav() {
  const pathname = usePathname();

  // /quotes/[id] and /quotes/[id]/edit belong under Quotes; /quotes/new is its
  // own destination and shouldn't light up the Quotes tab.
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        (pathname.startsWith("/quotes/") && !pathname.startsWith("/quotes/new"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const creating = pathname.startsWith("/quotes/new");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around h-16 px-2">
        <NavItem
          href="/dashboard"
          label="Quotes"
          Icon={QuotesIcon}
          active={isActive("/dashboard")}
        />

        <NavItem
          href="/templates"
          label="Templates"
          Icon={TemplatesIcon}
          active={isActive("/templates")}
        />

        {/* Create sits in the middle and rides above the bar — it's the one
            thing this app exists to do. */}
        <Link
          href="/quotes/new"
          className="relative flex w-16 shrink-0 flex-col items-center justify-center gap-1"
        >
          <span
            className={`-mt-6 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
              creating ? "bg-amber text-ink" : "bg-ink text-paper"
            }`}
          >
            <PlusIcon size={22} />
          </span>
          <span className="text-[11px] font-semibold text-ink">New</span>
        </Link>

        <NavItem
          href="/settings"
          label="Settings"
          Icon={SettingsIcon}
          active={isActive("/settings")}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: (props: { size?: number; className?: string }) => React.ReactElement;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
        active ? "text-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-0 h-[3px] w-8 rounded-full bg-amber"
        />
      )}
      <Icon size={22} />
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

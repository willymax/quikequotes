/**
 * The icon set. Hand-rolled inline SVG rather than a dependency — there are
 * fewer than twenty of them, they all share one geometry (24px box, 2px round
 * stroke, currentColor), and the landing page shouldn't ship an icon library to
 * render nine glyphs.
 *
 * These replace the emoji that used to stand in for iconography. Emoji render
 * differently on every platform, can't take the brand colour, and read as a
 * placeholder.
 */

type IconProps = {
  className?: string;
  /** Pixel size of the square box. Defaults to 24. */
  size?: number;
};

function Svg({
  className = "",
  size = 24,
  children,
  strokeWidth = 2,
}: IconProps & { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/* ── App chrome ─────────────────────────────────────────────────────────── */

export function QuotesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function TemplatesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </Svg>
  );
}

/* ── Landing: the problem ───────────────────────────────────────────────── */

/** Slow quotes. */
export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Svg>
  );
}

/** Nobody follows up. */
export function BellOffIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8.7 3.7A6 6 0 0 1 18 9c0 2.3.5 4 1.2 5.2" />
      <path d="M6 9a6 6 0 0 0-.3 1.8c0 4-2.2 5.2-2.2 5.2h13" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </Svg>
  );
}

/** A price texted as plain words. */
export function ScribbleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 5.5 12 14l-4 1 1-4 8.5-8.5a2.1 2.1 0 0 1 3 3z" />
      <path d="M19 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Svg>
  );
}

/* ── Landing: the fix ───────────────────────────────────────────────────── */

/** Fast. */
export function BoltIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </Svg>
  );
}

/** Open tracking. */
export function EyeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  );
}

/** Follow-up on a loop. */
export function RepeatIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}

/* ── Utility ────────────────────────────────────────────────────────────── */

export function CheckIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <path d="m4 12.5 5 5L20 6.5" />
    </Svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 19.6l1.1-6L3.4 9.4l6-.8z" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 13a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7" />
      <path d="M14 11a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

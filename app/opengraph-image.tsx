import { ImageResponse } from "next/og";

export const alt = "QuikeQuotes — quote fast, follow up automatically";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// PLACEHOLDER: code-generated OG card. Swap for a designed asset (real logo,
// real product screenshot) before spending on paid ads or social — ad
// platforms and share previews are highly sensitive to visual quality.
// Hexes are --color-ink / --color-amber / --color-paper / --color-paper-muted;
// ImageResponse can't read CSS variables, so app/globals.css remains the
// source of truth for the values.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#14171c",
        }}
      >
        <div style={{ fontSize: 28, color: "#f5a623", fontWeight: 700, marginBottom: 24 }}>
          QuikeQuotes
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, color: "#ffffff", display: "flex", flexDirection: "column" }}>
          <span>Send a professional quote</span>
          <span>from your phone in 3 minutes</span>
        </div>
        <div style={{ fontSize: 24, color: "#a9acb3", marginTop: 24 }}>
          Tiers · Tracking · Automatic follow-up
        </div>
      </div>
    ),
    size
  );
}

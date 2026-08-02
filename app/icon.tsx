import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// PLACEHOLDER: code-generated monogram. Swap for a designed favicon before launch.
// Colours are --color-ink / --color-amber; ImageResponse can't read CSS
// variables, so app/globals.css stays the source of truth for the values.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14171c",
          color: "#f5a623",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        Q
      </div>
    ),
    size
  );
}

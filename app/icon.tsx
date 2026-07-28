import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// PLACEHOLDER: code-generated monogram. Swap for a designed favicon before launch.
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

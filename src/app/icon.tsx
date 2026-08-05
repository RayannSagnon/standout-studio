import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#0B3D3D",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            color: "#F5F8F9",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "Georgia, ui-serif, serif",
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <div
          style={{
            color: "#F5F8F9",
            fontSize: 108,
            fontWeight: 700,
            fontFamily: "Georgia, ui-serif, serif",
            lineHeight: 1,
            marginTop: -4,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size },
  );
}

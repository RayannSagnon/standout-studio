import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Standout Studio — Web design & development in Ottawa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B3D3D",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#F5F8F9",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#0F766E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F5F8F9",
              fontSize: 28,
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            S
          </div>
          Standout Studio
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#F5F8F9",
              fontSize: 64,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Web design & development in Ottawa
          </div>
          <div style={{ color: "#A8CDC8", fontSize: 28, maxWidth: 760 }}>
            Clear websites for freelancers and small businesses. Bilingual. From
            $250.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

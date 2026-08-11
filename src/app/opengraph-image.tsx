import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Standout Studio: Web design & development in Ottawa";
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
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#F5F8F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0F1C1F",
              fontSize: 30,
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                color: "#F5F8F9",
                fontSize: 30,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Standout
            </div>
            <div
              style={{
                color: "#A8CDC8",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Studio
            </div>
          </div>
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

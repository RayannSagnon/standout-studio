import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const BRUME = "#F3F5F4";
const ABYSSE = "#0C2624";
const SARCELLE = "#0F6B66";

// Share image in the site's own language: "Stand / out." on the grid, the dot as the one exception.
export function shareImage(line: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BRUME,
          color: ABYSSE,
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700 }}>
          Standout
          <span style={{ fontWeight: 400, marginLeft: 8 }}>Studio</span>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: SARCELLE, marginLeft: 6, marginTop: 10 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 200, lineHeight: 0.9, letterSpacing: -8 }}>
          <span>Stand</span>
          <div style={{ display: "flex", alignItems: "flex-end", paddingLeft: 420 }}>
            <span>out</span>
            <span style={{ width: 34, height: 34, borderRadius: 34, background: SARCELLE, marginLeft: 8, marginBottom: 26 }} />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "rgba(12,38,36,0.72)" }}>{line}</div>
      </div>
    ),
    { ...ogSize },
  );
}

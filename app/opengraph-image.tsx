import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kindred Stars — Find Your Cosmic Counterpart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09111F",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Gold ring */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "5px solid #C8A84B",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {/* Stars row */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 8 }}>
            <div style={{ fontSize: 64, color: "#C8A84B", lineHeight: 1 }}>★</div>
            <div style={{ fontSize: 48, color: "#C8A84B", lineHeight: 1, marginTop: -20 }}>★</div>
          </div>
          {/* Wordmark */}
          <div
            style={{
              color: "#EDE8DF",
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: 8,
              lineHeight: 1,
            }}
          >
            kindred
          </div>
          <div
            style={{
              color: "#C8A84B",
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: 8,
              lineHeight: 1,
              marginTop: 6,
            }}
          >
            stars
          </div>
        </div>
        {/* Tagline below circle */}
        <div
          style={{
            color: "#7A8899",
            fontSize: 22,
            letterSpacing: 4,
            marginTop: 32,
          }}
        >
          find your cosmic counterpart
        </div>
      </div>
    ),
    { ...size }
  );
}

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
          background: "#06070b",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "linear-gradient(135deg, #4c6fff 0%, #2f5fff 100%)",
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f3f6ff",
              fontFamily: "system-ui",
            }}
          >
            C
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

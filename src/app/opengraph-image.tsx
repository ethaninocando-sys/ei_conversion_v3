import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social image: wordmark on navy. Applies to every route beneath the root. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B1F3A",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: "#F8FAFC",
              color: "#0B1F3A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            {site.wordmark}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800 }}>{site.name}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 36, color: "#F59E0B" }}>
          Marketing for local service businesses
        </div>
      </div>
    ),
    size,
  );
}

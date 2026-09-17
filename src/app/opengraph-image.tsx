import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A cover page: rule at the top, folio, title, hairline. */
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
          padding: "72px 80px",
          background: "#FBFAF7",
          color: "#14110F",
          fontFamily: "Georgia, serif",
          borderTop: "14px solid #8B2E1F",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#5F584F" }}>
          {site.domain.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, letterSpacing: -2, maxWidth: 940 }}>
            Which marketing actually fits your trade.
          </div>
          <div style={{ display: "flex", marginTop: 40, borderTop: "1px solid #D8D2C7", paddingTop: 28 }}>
            <div style={{ display: "flex", fontSize: 30, color: "#5F584F" }}>
              <span style={{ color: "#8B2E1F" }}>{site.wordmark}</span>
              <span style={{ marginLeft: 10 }}>{site.name.replace(site.wordmark, "").trim()}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

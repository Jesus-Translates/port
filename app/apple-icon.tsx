import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS "Add to Home Screen". */
export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5d6650",
        }}
      >
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: 34,
            background: "#faf7f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#c2622e",
              lineHeight: 1,
            }}
          >
            P
          </div>
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 22,
              width: 30,
              height: 30,
              borderRadius: 15,
              background: "#33589b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#faf7f0",
              }}
            />
          </div>
        </div>
      </div>
    ),
    size
  );
}

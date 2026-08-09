import { ImageResponse } from "next/og";

export const alt = "Português · the family hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette, mirrored from app/globals.css
const PAPER = "#faf7f0";
const SAGE = "#97a08b";
const OLIVE = "#5d6650";
const INK = "#2b271f";
const INK_SOFT = "#6f6858";
const TERRA = "#c2622e";
const AZUL = "#33589b";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
        }}
      >
        {/* Sage sidebar — the spine of their paper book */}
        <div
          style={{
            width: 190,
            height: "100%",
            background: SAGE,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 8,
              background: PAPER,
              opacity: 0.85,
              borderRadius: 4,
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: OLIVE,
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: AZUL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: PAPER,
                }}
              />
            </div>
            Santa Cruz · Portugal
          </div>

          <div
            style={{
              marginTop: 26,
              fontSize: 118,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            Português
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 40,
              color: INK_SOFT,
              lineHeight: 1.3,
            }}
          >
            The family hub — livro, lições,
          </div>
          <div style={{ fontSize: 40, color: INK_SOFT, lineHeight: 1.3 }}>
            TPC, testes e a Sandra.
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 46 }}>
            {[TERRA, OLIVE, AZUL].map((c) => (
              <div
                key={c}
                style={{
                  width: 88,
                  height: 12,
                  borderRadius: 6,
                  background: c,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}

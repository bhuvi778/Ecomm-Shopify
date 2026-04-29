import React from 'react';
export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.04,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: "block" }}>
        <filter id="fs-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fs-noise)" />
      </svg>
    </div>
  );
}

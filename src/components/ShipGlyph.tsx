"use client";

/**
 * Top-view container-ship marker for SVG maps.
 * Points "up" (−y) at heading 0; pass heading in degrees measured from +x axis
 * (as returned by atan2 on screen coordinates) and it will be rotated to match.
 */
export function ShipGlyph({
  color,
  travelAngle,
  scale = 1,
}: {
  color: string;
  travelAngle: number; // degrees from +x axis, screen coords
  scale?: number;
}) {
  // Hull points up; screen angle 0 points right → rotate by angle + 90.
  const rot = travelAngle + 90;
  return (
    <g transform={`rotate(${rot}) scale(${scale})`}>
      {/* hull: pointed bow, rounded stern */}
      <path
        d="M 0 -8 L 3.1 -3.2 L 3.1 5.6 Q 3.1 7.4 1.6 7.4 L -1.6 7.4 Q -3.1 7.4 -3.1 5.6 L -3.1 -3.2 Z"
        fill={color}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="0.6"
      />
      {/* container rows on deck */}
      <rect x="-1.9" y="-2.4" width="3.8" height="1.7" rx="0.3" fill="rgba(11,18,32,0.55)" />
      <rect x="-1.9" y="0.1" width="3.8" height="1.7" rx="0.3" fill="rgba(11,18,32,0.35)" />
      {/* bridge block at stern */}
      <rect x="-2.1" y="4.2" width="4.2" height="2" rx="0.4" fill="#ffffff" opacity="0.85" />
    </g>
  );
}

"use client";

import React from "react";

interface CountryData {
  flag: string;
  name: string;
  customers: number;
  percentage: number;
}

interface WorldMapProps {
  data: CountryData[];
}

export default function WorldMap({ data }: WorldMapProps) {
  // Simplified SVG world map with location markers
  const locations = [
    { x: "25%", y: "40%", country: "USA", r: 5 },
    { x: "52%", y: "35%", country: "France", r: 4 },
    { x: "55%", y: "33%", country: "Germany", r: 3 },
    { x: "50%", y: "30%", country: "United Kingdom", r: 3 },
    { x: "72%", y: "45%", country: "Japan", r: 4 },
    { x: "80%", y: "75%", country: "Australia", r: 3 },
  ];

  return (
    <svg
      viewBox="0 0 960 600"
      className="w-full h-full"
      style={{ background: "#f8fafc" }}
    >
      {/* Simplified world map background */}
      <defs>
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>

      {/* Grid background */}
      <rect width="960" height="600" fill="url(#grid)" />

      {/* Simplified continents background */}
      <g fill="#e2e8f0" opacity="0.6">
        {/* North America */}
        <rect x="50" y="100" width="150" height="200" rx="10" />
        {/* South America */}
        <rect x="80" y="280" width="80" height="150" rx="8" />
        {/* Europe */}
        <rect x="380" y="80" width="120" height="100" rx="8" />
        {/* Africa */}
        <rect x="380" y="180" width="100" height="180" rx="8" />
        {/* Asia */}
        <rect x="480" y="80" width="250" height="200" rx="10" />
        {/* Australia */}
        <rect x="700" y="350" width="80" height="100" rx="8" />
      </g>

      {/* Location markers */}
      {locations.map((loc, idx) => {
        const country = data.find((d) => d.name === loc.country);
        const isHighlight = !!country;
        const radius = isHighlight ? loc.r + 2 : loc.r;
        const opacity = isHighlight ? 1 : 0.4;

        return (
          <g key={idx}>
            {/* Ripple effect */}
            {isHighlight && (
              <circle
                cx={loc.x}
                cy={loc.y}
                r={radius + 6}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values={`${radius + 6};${radius + 12};${radius + 6}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            {/* Main marker */}
            <circle
              cx={loc.x}
              cy={loc.y}
              r={radius}
              fill="#3b82f6"
              opacity={opacity}
            />
          </g>
        );
      })}

    </svg>
  );
}

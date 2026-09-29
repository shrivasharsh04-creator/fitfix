"use client";

import React from "react";
import { getHealthColorClass } from "@/lib/health-calculator";

interface HealthGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function HealthGauge({ score, size = "md", showLabel = true }: HealthGaugeProps) {
  const info = getHealthColorClass(score);

  const dimensions = {
    sm: { width: 44, stroke: 4, font: "text-xs", labelFont: "text-[10px]" },
    md: { width: 72, stroke: 6, font: "text-base font-bold", labelFont: "text-xs" },
    lg: { width: 110, stroke: 8, font: "text-2xl font-black", labelFont: "text-sm" },
  }[size];

  const radius = (dimensions.width - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg
          className="transform -rotate-90"
          width={dimensions.width}
          height={dimensions.width}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Foreground progress */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke={info.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${dimensions.font} font-mono tracking-tight text-white`}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`mt-1 font-medium ${dimensions.labelFont} ${info.text}`}>
          {info.label}
        </span>
      )}
    </div>
  );
}

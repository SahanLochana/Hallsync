"use client";

import { Squircle } from 'ldrs/react';
import 'ldrs/react/Squircle.css';

export default function LoadingSpinner({
  size = "37",
  stroke = "5",
  strokeLength = "0.15",
  bgOpacity = "0.1",
  speed = "0.9",
  color = "#1e3b8a", // Theme primary navy color
  text = "",
  heightClass = "h-48"
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${heightClass} gap-3 text-[#94a3b8]`}>
      <Squircle
        size={size}
        stroke={stroke}
        strokeLength={strokeLength}
        bgOpacity={bgOpacity}
        speed={speed}
        color={color}
      />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Exquisite SVG splash for the word "MOVES"
const colors = ["#00ADB5", "#F72585", "#4ECDC4", "#B5179E", "#F77F00", "#FCBF49"];

export const HeroSplash: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (trigger && svgRef.current) {
      svgRef.current.classList.remove("animate-splash");
      // Restart animation
      void (svgRef.current as unknown as HTMLElement).offsetWidth;
      svgRef.current.classList.add("animate-splash");
    }
  }, [trigger]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none animate-splash"
      viewBox="0 0 220 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ zIndex: 2 }}
    >
      <g>
        {colors.map((color, i) => (
          <motion.circle
            key={color}
            cx={110 + Math.sin(i * 1.1) * 30}
            cy={40 + Math.cos(i * 1.1) * 18}
            r="0"
            fill={color}
            animate={trigger ? { r: [0, 38, 0], opacity: [0.7, 0.2, 0] } : { r: 0, opacity: 0 }}
            transition={{
              duration: 1.1,
              delay: i * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </g>
    </svg>
  );
};

export default HeroSplash;

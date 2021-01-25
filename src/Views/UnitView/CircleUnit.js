import React from "react";
// import * as d3 from "d3";
// import { StoreProvider, useGlobalStore } from "./Store";
// import { observer } from "mobx-react-lite";

const CircleUnit = React.memo(({ cx, cy, r, colors = [] }) => {
  const stepAngle = (2 * Math.PI) / colors.length;
  const polarX = (angle) => cx + Math.sin(angle) * r;
  const polarY = (angle) => cy + Math.cos(angle) * r;
  const points = colors.map((_, i) => ({
    startX: polarX(stepAngle * i),
    startY: polarY(stepAngle * i),
    endX: polarX(stepAngle * (i + 1)),
    endY: polarY(stepAngle * (i + 1)),
  }));

  return (
    <g id="unit-g">
      <g id="unit-border-g">
        <circle
          cx={cx}
          cy={cy}
          r={1.2 * r}
          fill="none"
          stroke="red"
          strokeWidth={0.15 * r}
        />
      </g>
      <g id="unit-sector-g">
        {points.length > 1 ? (
          points.map((point, i) => (
            <path
              key={i}
              d={`M ${cx} ${cy}
              L ${point.startX} ${point.startY}
              A ${r} ${r} 0 0 0 ${point.endX} ${point.endY}
              Z
              `}
              stroke="white"
              fill={colors[i]}
              strokeWidth={0.1 * r}
              // fill-opacity="0.2"
            />
          ))
        ) : (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={colors[0]}
            // stroke="red"
            // strokeWidth={0.15 * r}
          />
        )}
      </g>
    </g>
  );
});

export default CircleUnit;

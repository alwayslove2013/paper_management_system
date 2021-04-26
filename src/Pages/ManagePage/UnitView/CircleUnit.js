import React from "react";

const CircleUnit = React.memo(
  ({
    cx,
    cy,
    r,
    // colors,
    opacity,
    doi,
    handleClick,
    // borderColor,
    // borderOpacity,
    title,
    innerColors,
    outerColors,
    isBackgroundActive,
    handleHover,
    handleHoverOut,
  }) => {
    const polarX = (angle) => cx + Math.sin(angle) * r;
    const polarY = (angle) => cy + Math.cos(angle) * r;
    const innerStepAngle = (2 * Math.PI) / innerColors.length;
    const innerPoints = innerColors.map((_, i) => ({
      startX: polarX(innerStepAngle * i),
      startY: polarY(innerStepAngle * i),
      endX: polarX(innerStepAngle * (i + 1)),
      endY: polarY(innerStepAngle * (i + 1)),
    }));

    // console.log('outerColors', outerColors)
    const outerR = r * 1.5;
    const outerPolarX = (angle) => cx + Math.sin(angle) * outerR;
    const outerPolarY = (angle) => cy + Math.cos(angle) * outerR;
    const outerStepAngle = (2 * Math.PI) / outerColors.length;
    const outerPoints = outerColors.map((_, i) => ({
      startX: outerPolarX(outerStepAngle * i),
      startY: outerPolarY(outerStepAngle * i),
      endX: outerPolarX(outerStepAngle * (i + 1)),
      endY: outerPolarY(outerStepAngle * (i + 1)),
    }));

    // const borderOpacity = isSelect ? 1 : 0;

    return (
      <g
        id="unit-g"
        onClick={(e) => handleClick(e, doi)}
        cursor="pointer"
        onMouseEnter={() => handleHover(doi)}
        onMouseLeave={() => handleHoverOut()}
      >
        <title>{title}</title>

        {isBackgroundActive && (
          <g id="unit-background-g">
            <rect
              x={cx - 1.6 * r}
              y={cy - 1.6 * r}
              width={r * 3.2}
              height={r * 3.2}
              fill="#fc8d62"
              rx={r * 0.4}
              ry={r * 0.4}
            />
            <circle cx={cx} cy={cy} r={1.3 * r} fill="#eee" />
          </g>
        )}
        <g id="unit-border-g">
          {/* <circle
            cx={cx}
            cy={cy}
            r={1.4 * r}
            fill="none"
            stroke={borderColor}
            strokeWidth={0.6 * r}
            opacity={borderOpacity}
          /> */}
          {outerPoints.length > 1 ? (
            outerPoints.map((point, i) => (
              <path
                key={i}
                d={`M ${cx} ${cy}
              L ${point.startX} ${point.startY}
              A ${outerR} ${outerR} 0 0 0 ${point.endX} ${point.endY}
              Z
              `}
                // stroke="white"
                fill={outerColors[i]}
                // strokeWidth={0.1 * r}
                // fill-opacity="0.2"
              />
            ))
          ) : (
            <circle
              cx={cx}
              cy={cy}
              r={outerR}
              fill={outerColors.length > 0 ? outerColors[0] : "none"}
              // stroke="red"
              // strokeWidth={0.15 * r}
            />
          )}
          {/* {outerPoints.length > 0 && <circle
            cx={cx}
            cy={cy}
            r={1.2 * r}
            fill="white"
            // stroke={borderColor}
            // strokeWidth={0.6 * r}
            // opacity={borderOpacity}
          />} */}
          <circle
            cx={cx}
            cy={cy}
            r={1.1 * r}
            fill="white"
            // stroke={borderColor}
            // strokeWidth={0.6 * r}
            opacity={outerPoints.length > 0 ? 1 : 0}
          />
        </g>
        <g id="unit-sector-g" opacity={opacity}>
          {innerPoints.length > 1 ? (
            innerPoints.map((point, i) => (
              <path
                key={i}
                d={`M ${cx} ${cy}
              L ${point.startX} ${point.startY}
              A ${r} ${r} 0 0 0 ${point.endX} ${point.endY}
              Z
              `}
                stroke="white"
                fill={innerColors[i]}
                strokeWidth={0.1 * r}
                // fill-opacity="0.2"
              />
            ))
          ) : (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={innerColors[0]}
              // stroke="red"
              // strokeWidth={0.15 * r}
            />
          )}
        </g>
      </g>
    );
  }
);

export default CircleUnit;

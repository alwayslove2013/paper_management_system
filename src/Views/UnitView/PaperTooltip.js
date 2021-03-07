import React from "react";
import { get } from "lodash";

const tooltipWidthRatio = 0.25;

const PaperTooltip = ({
  isShow,
  paper,
  paperCircle,
  containerWidth,
  containerHeight,
}) => {
  const xRatio = paperCircle.cx / containerWidth;
  const tooltipWidth = containerWidth * tooltipWidthRatio;
  const tooltipX = paperCircle.cx - tooltipWidth * xRatio;
  const tooltipY = paperCircle.cy + 15;
  const bottomStyle =
    paperCircle.cy + 200 > containerHeight ? "translateY(-150%)" : "";
  const style = {
    transform: `translate(${tooltipX}px,${tooltipY}px) ${bottomStyle}`,
    opacity: isShow ? 1 : 0,
  };
  return (
    <div className="unit-tooltip" style={style}>
      <div className="unit-tooltip-title">{get(paper, "title", "")}</div>
      <div className="unit-tooltip-authors">
        {get(paper, "authors", []).join("; ")} ({paper.year})
      </div>
    </div>
  );
};

export default PaperTooltip;

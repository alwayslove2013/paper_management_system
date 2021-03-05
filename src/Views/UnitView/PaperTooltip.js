import React from "react";
import { get } from "lodash";

const PaperTooltip = ({ isShow, paper, paperCircle }) => {
  const style = {
    transform: `translate(${paperCircle.cx}px,${paperCircle.cy}px)`,
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

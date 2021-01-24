import React from "react";
import "./index.scss";
import CircleUnit from "./CircleUnit";
import * as d3 from "d3";

const UnitView = () => {
  const color = d3.schemeTableau10;
  const cx = 160
  const cy = 160
  const r=60
  return (
    <div>
      UnitView
      <svg id="try_svg" width="320px" height="320px">
        <CircleUnit cx={cx} cy={cy} r={r} colors={color.slice(0, 1)} />
      </svg>
    </div>
  );
};

export default UnitView;

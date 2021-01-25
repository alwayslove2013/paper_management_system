import React, { useEffect, useState } from "react";
import "./index.scss";
import CircleUnit from "./CircleUnit";
import * as d3 from "d3";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { get } from "lodash";

const unitLayoutPadding = {
  top: 30,
  left: 50,
  right: 20,
  bottom: 1,
};

const unitBlockPadding = {
  top: 2,
  left: 1,
  right: 2,
  bottom: 1,
};

const UnitView = observer(() => {
  const store = useGlobalStore();
  const {
    papers,
    unitXAttr,
    unitYAttr,
    unitXAttrList,
    unitYAttrList,
    unitBlockCount,
    maxUnitBlockPaperCount,
    doi2paperBlockPos,
  } = store;
  console.log("maxUnitBlockPaperCount", maxUnitBlockPaperCount);

  // const svg = document.querySelector("#unit-svg");
  // const svgWidth =
  //   svg.clientWidth - unitLayoutPadding.left - unitLayoutPadding.right;
  // const svgHeight =
  //   svg.clientHeight - unitLayoutPadding.top - unitLayoutPadding.bottom;

  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  // 初始化svg长宽
  useEffect(() => {
    const svg = document.querySelector("#unit-svg");
    setSvgWidth(
      svg.clientWidth - unitLayoutPadding.left - unitLayoutPadding.right
    );
    setSvgHeight(
      svg.clientHeight - unitLayoutPadding.top - unitLayoutPadding.bottom
    );
  }, []);
  const unitBlockWidth =
    unitXAttrList.length > 0
      ? svgWidth / unitXAttrList.length -
        unitBlockPadding.left -
        unitBlockPadding.right
      : 0;
  const unitBlockHeight =
    unitYAttrList.length > 0
      ? svgHeight / unitYAttrList.length -
        unitBlockPadding.top -
        unitBlockPadding.bottom
      : 0;
  console.log(unitBlockWidth, unitBlockHeight);

  const aspectRatio = Math.floor(
    unitBlockWidth > 0 ? unitBlockHeight / unitBlockWidth : 1
  );

  const blockCountX = Math.ceil(
    Math.sqrt(maxUnitBlockPaperCount / aspectRatio)
  );
  // console.log('blockCountX', blockCountX);

  const xAttr2blockCountX = unitXAttrList.map((xAttr, i) => {
    const maxColumnBlockCount = Math.max(
      ...unitYAttrList.map((yAttr, j) => get(unitBlockCount, [xAttr, yAttr], 0))
    );
    let blockCountX = Math.ceil(
      Math.sqrt(maxUnitBlockPaperCount / aspectRatio)
    );
    if (maxColumnBlockCount > maxUnitBlockPaperCount) {
      blockCountX += 1;
    }
    return blockCountX;
  });
  console.log("xAttr2blockCountX", xAttr2blockCountX);

  // const blockCountY = Math.ceil(aspectRatio * blockCountX);

  let r = unitBlockWidth / blockCountX;
  console.log("r", r);

  const xAttr2blockCountX_StartCount = [0];
  const xAttr2blockCountX_StartPos = [0];

  for (let i = 1; i < unitXAttrList.length; i++) {
    xAttr2blockCountX_StartCount.push(
      xAttr2blockCountX_StartCount[i - 1] + xAttr2blockCountX[i - 1]
    );
  }

  r =
    (svgWidth -
      (unitBlockPadding.left + unitBlockPadding.right) * unitXAttrList.length) /
    (xAttr2blockCountX_StartCount[xAttr2blockCountX_StartCount.length - 1] +
      xAttr2blockCountX[xAttr2blockCountX.length - 1]);
  console.log("new r", r);

  for (let i = 1; i < unitXAttrList.length; i++) {
    xAttr2blockCountX_StartPos.push(
      xAttr2blockCountX_StartCount[i] * r +
        (unitBlockPadding.left + unitBlockPadding.right) * i
    );
  }
  console.log("xAttr2blockCountX_StartCount", xAttr2blockCountX_StartCount);
  console.log("xAttr2blockCountX_StartPos", xAttr2blockCountX_StartPos);

  const paperCircles = papers.map((paper) => {
    const paperCircle = {};
    paperCircle.BlockIndexX = unitXAttrList.indexOf(paper[unitXAttr]);
    paperCircle.BlockIndexY = unitYAttrList.indexOf(paper[unitYAttr]);

    const doi = paper.DOI;
    paperCircle.circleIndexX =
      doi2paperBlockPos[doi] % xAttr2blockCountX[paperCircle.BlockIndexX];
    paperCircle.circleIndexY = Math.floor(
      doi2paperBlockPos[doi] / xAttr2blockCountX[paperCircle.BlockIndexX]
    );

    paperCircle.cx =
      unitLayoutPadding.left +
      paperCircle.BlockIndexX *
        (unitBlockWidth + unitBlockPadding.left + unitBlockPadding.right) +
      (paperCircle.circleIndexX + 0.5) * r;
    paperCircle.cy =
      unitLayoutPadding.top +
      paperCircle.BlockIndexY *
        (unitBlockHeight + unitBlockPadding.top + unitBlockPadding.bottom) +
      (paperCircle.circleIndexY + 0.5) * r;

    paperCircle.cx =
      unitLayoutPadding.left +
      xAttr2blockCountX_StartPos[paperCircle.BlockIndexX] +
      (paperCircle.circleIndexX + 0.5) * r;
    return paperCircle;
  });

  const xLabels = unitXAttrList.map((xAttr, i) => {
    const startX = unitLayoutPadding.left + xAttr2blockCountX_StartPos[i];
    const middleX = startX + (xAttr2blockCountX[i] * r) / 2;
    return {
      value: xAttr,
      x: middleX,
      y: unitLayoutPadding.top - 6,
    };
  });

  const yLabels = unitYAttrList.map((yAttr, i) => {
    const startY = unitLayoutPadding.top + (unitBlockHeight + unitBlockPadding.top + unitBlockPadding.bottom) * i
    return {
      value: yAttr,
      x: unitLayoutPadding.left - 4,
      y: startY + 8
    }
  })

  const color = d3.schemeTableau10.slice(0, 5);
  return (
    <div className="unit-view">
      <svg id="unit-svg" width="100%" height="100%">
        <g id="units">
          {paperCircles.map((paper, i) => (
            <CircleUnit
              key={i}
              cx={paper.cx}
              cy={paper.cy}
              r={r / 2.4}
              colors={['rgb(78, 78, 78)']}
            />
          ))}
        </g>
        <g id="x-label">
          {xLabels.map((label, i) => (
            <text key={label.value} x={label.x} y={label.y}
              textAnchor="middle"
              fontSize="9"
              fill="rgb(78, 78, 78)"
            >
              {label.value}
            </text>
          ))}
        </g>
        <g id="y-label">
          {yLabels.map((label, i) => (
            <text key={label.value} x={label.x} y={label.y}
              textAnchor="end"
              fontSize="9"
              fill="rgb(78, 78, 78)"
            >
              {label.value}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
});

export default UnitView;

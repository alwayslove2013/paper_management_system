import React, { useEffect, useState } from "react";
import "./index.scss";
import CircleUnit from "./CircleUnit";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { get } from "lodash";
import * as d3 from "d3";

const unitLayoutPadding = {
  top: 30,
  left: 40,
  right: 15,
  bottom: 1,
};

const unitBlockPadding = {
  top: 2,
  left: 3,
  right: 3,
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
    // doi2paperBlockPos,
    // doi2privateTags,
    // doi2publicTags,
    // doi2comments,
    // doi2colors,
    controlIsActive,
    currentSelected,
    setCurrentSelected,
    isSelected,
    cancelSelect,
    currentSelectedRefSet,
    currentSelectedCitedSet,
  } = store;

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
  // console.log(unitBlockWidth, unitBlockHeight);

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
  // console.log("xAttr2blockCountX", xAttr2blockCountX);

  // const blockCountY = Math.ceil(aspectRatio * blockCountX);

  let r = unitBlockWidth / blockCountX;
  // console.log("r", r);

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
  // console.log("new r", r);

  for (let i = 1; i < unitXAttrList.length; i++) {
    xAttr2blockCountX_StartPos.push(
      xAttr2blockCountX_StartCount[i] * r +
        (unitBlockPadding.left + unitBlockPadding.right) * i
    );
  }
  // console.log("xAttr2blockCountX_StartCount", xAttr2blockCountX_StartCount);
  // console.log("xAttr2blockCountX_StartPos", xAttr2blockCountX_StartPos);
  const scale = d3.scaleLinear().domain([0, 100]).range([0.25, 0.8]);
  const citeCount2grey = (count) => d3.interpolateGreys(scale(count));
  const paperCircles = papers.map((paper) => {
    const paperCircle = {};
    paperCircle.oriData = toJS(paper);

    paperCircle.BlockIndexX = unitXAttrList.indexOf(paper[unitXAttr]);
    paperCircle.BlockIndexY = unitYAttrList.indexOf(paper[unitYAttr]);

    const doi = paper.doi;
    paperCircle.doi = doi;

    paperCircle.circleIndexX =
      paper.unitIndex % xAttr2blockCountX[paperCircle.BlockIndexX];
    paperCircle.circleIndexY = Math.floor(
      paper.unitIndex / xAttr2blockCountX[paperCircle.BlockIndexX]
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

    paperCircle.citationGrey = citeCount2grey(paper.citationCount);
    paperCircle.activeColors = paper.colors;
    paperCircle.colors =
      paperCircle.activeColors.length > 0
        ? paperCircle.activeColors
        : [paperCircle.citationGrey];

    paperCircle.opacity = controlIsActive
      ? paperCircle.activeColors.length > 0
        ? 0.8
        : 0.4
      : 0.8;

    paperCircle.title = paper.Title;

    if (isSelected) {
      if (currentSelected === paper.doi) paperCircle.borderColor = "red";
      if (currentSelectedRefSet.has(paper.doi)) paperCircle.borderColor = "brown";
      if (currentSelectedCitedSet.has(paper.doi))
        paperCircle.borderColor = "orange";
    } else {
      paperCircle.borderOpacity = 0;
      paperCircle.borderColor = "red";
    }

    return paperCircle;
  });

  const xLabels = unitXAttrList.map((xAttr, i) => {
    const startX = unitLayoutPadding.left + xAttr2blockCountX_StartPos[i];
    const middleX = startX + (xAttr2blockCountX[i] * r) / 2;
    return {
      value: xAttr,
      x: middleX,
      y: unitLayoutPadding.top * 0.8,
    };
  });

  const yLabels = unitYAttrList.map((yAttr, i) => {
    const startY =
      unitLayoutPadding.top +
      (unitBlockHeight + unitBlockPadding.top + unitBlockPadding.bottom) * i;
    return {
      value: yAttr,
      x: unitLayoutPadding.left * 0.35,
      y: startY,
    };
  });

  const handleClickPaper = (e, doi) => {
    // console.log("click", e, doi);
    e.stopPropagation();
    setCurrentSelected(doi);
  };

  const handleClickBackground = () => {
    cancelSelect();
  };

  return (
    <div className="unit-view">
      <svg
        id="unit-svg"
        width="100%"
        height="100%"
        onClick={handleClickBackground}
      >
        <g id="units">
          {r > 0 &&
            paperCircles.map((paper, i) => (
              <CircleUnit
                key={i}
                cx={paper.cx}
                cy={paper.cy}
                r={r / 2.4}
                // grey={paper.citationGrey}
                // oriData={paper.oriData}
                doi={paper.doi}
                colors={paper.colors}
                opacity={paper.opacity}
                handleClick={handleClickPaper}
                // isSelect={isSelected && currentSelected === paper.doi}
                borderOpacity={paper.borderOpacity}
                borderColor={paper.borderColor}
                title={paper.title}
              />
            ))}
        </g>
        <g id="x-label">
          {r > 0 &&
            xLabels.map((label) => (
              <text
                key={label.value}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                fontSize={r * 1.6}
                fill="rgb(78, 78, 78)"
              >
                {label.value}
              </text>
            ))}
        </g>
        <g id="y-label">
          {r > 0 &&
            yLabels.map((label) => (
              <text
                key={label.value}
                // x={label.x}
                // y={label.y}
                // textAnchor="start"
                transform={`translate(${label.x}, ${label.y}) rotate(90)`}
                fontSize={r * 1.6}
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

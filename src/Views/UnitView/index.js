import React, { useEffect, useState } from "react";
import "./index.scss";
import CircleUnit from "./CircleUnit";
import * as d3 from "d3";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

const unitLayoutPadding = {
  top: 50,
  left: 50,
  right: 10,
  bottom: 10,
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
    maxUnitBlockPaperCount,
    doi2paperBlockPos,
  } = store;
  console.log('maxUnitBlockPaperCount', maxUnitBlockPaperCount)

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

  const blockCountY = Math.ceil(aspectRatio * blockCountX);

  console.log(blockCountX, blockCountY);

  const r = unitBlockWidth / blockCountX;

  const paperCircles = papers.map((paper) => {
    const paperCircle = {}
    paperCircle.BlockIndexX = unitXAttrList.indexOf(paper[unitXAttr]);
    paperCircle.BlockIndexY = unitYAttrList.indexOf(paper[unitYAttr]);

    const doi = paper.DOI;
    paperCircle.circleIndexX = doi2paperBlockPos[doi] % blockCountX;
    paperCircle.circleIndexY = Math.floor(doi2paperBlockPos[doi] / blockCountX);

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
    return paperCircle
  });

  const color = d3.schemeTableau10.slice(0,5);
  return (
    <div className="unit-view">
      <svg id="unit-svg" width="100%" height="100%">
        {paperCircles.map((paper, i) => (
          <CircleUnit key={i} cx={paper.cx} cy={paper.cy} r={r / 2.4} colors={color} />
        ))}
      </svg>
    </div>
  );
});

export default UnitView;

// const UnitView = observer(() => {
//   const store = useGlobalStore();
//   const { papers } = store;
//   console.log("papers", toJS(papers));
//   const color = d3.schemeTableau10;
//   const cx = 160;
//   const cy = 160;
//   const r = 60;
//   return (
//     <div>
//       UnitView
//       {store.maxUnitBlockPaperCount}
//       <svg id="try_svg" width="320px" height="320px">
//         <CircleUnit cx={cx} cy={cy} r={r} colors={color.slice(0, 1)} />
//       </svg>
//     </div>
//   );
// });

// export default UnitView;

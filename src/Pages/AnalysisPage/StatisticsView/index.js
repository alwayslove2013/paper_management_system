import React, { useState } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
// import { UserOutlined } from "@ant-design/icons";

const fontL = 0.022;
const fontM = 0.02;
const fontS = 0.015;

const ratio = (r) => `${r * 100}%`;

const headerRatio = 0.05;
const timeDistributionRatio = 0.1;

const heatmapTitleRatio = 0.036;
const heatmapRowRatio = 0.024;
const heatmapRowLabelWidthRatio = 0.24;
const heatmapRowRectsLeftPaddingRatio = 0.02;
const heatmapRowRectsRightPaddingRatio = 0.03;
const heatmapRowRectsWidthRatio =
  1 -
  heatmapRowLabelWidthRatio -
  heatmapRowRectsLeftPaddingRatio -
  heatmapRowRectsRightPaddingRatio;
const heatmapRectHeightRatio = 0.018;
const heatmapRectWidthRatio = 0.75;
const heatmapBottomRatio = 0.01;

const authorCount = 10;
const keywordsCount = 10;

const StatisticsView = observer(() => {
  const svgId = "statistics-view-svg";
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;

  const headerStyle = { transform: `translateY(${ratio(0)})` };
  const timeDisStyle = { transform: `translateY(${ratio(headerRatio)})` };
  const authorDisStyle = {
    transform: `translateY(${ratio(headerRatio + timeDistributionRatio)})`,
  };
  const keywordDisStyle = {
    transform: `translateY(${ratio(
      headerRatio +
        timeDistributionRatio +
        (heatmapTitleRatio + heatmapRowRatio * authorCount + heatmapBottomRatio)
    )})`,
  };
  const topicDisStyle = {
    transform: `translateY(${ratio(
      headerRatio +
        timeDistributionRatio +
        (heatmapTitleRatio +
          heatmapRowRatio * authorCount +
          heatmapBottomRatio) +
        (heatmapTitleRatio +
          heatmapRowRatio * keywordsCount +
          heatmapBottomRatio)
    )})`,
  };

  const store = useGlobalStore();
  const { analysisPapers, anaHighPapers, anaTagViewData, anaYearRange } = store;
  const yearCount = anaYearRange.length;
  console.log("analysisPapers", analysisPapers, anaTagViewData);

  const authorData = anaTagViewData
    .find((d) => d.value === "authors")
    .data.slice(0, authorCount);

  const keywordData = anaTagViewData
    .find((d) => d.value === "keywords")
    .data.slice(0, keywordsCount);

  return (
    <svg id={svgId} width="100%" height="100%">
      <g id="header-g" style={headerStyle}>
        <circle cx="0" cy="0" r="10" fill="green" />
      </g>
      <g id="time-distribution-g" style={timeDisStyle}>
        <circle cx="0" cy="0" r="10" fill="green" />
      </g>
      <g id="authors-distribution-g" style={authorDisStyle}>
        <HeatmapContent height={height} title={"Author"}>
          <HeatMap data={authorData} width={width} height={height} />
        </HeatmapContent>
      </g>
      <g id="keywords-distribution-g" style={keywordDisStyle}>
        <HeatmapContent height={height} title={"Keyword"}>
          <HeatMap data={keywordData} width={width} height={height} />
        </HeatmapContent>
      </g>
      <g id="topics-distribution-g" style={topicDisStyle}>
        <HeatmapContent height={height} title={"Topic"}>
          <circle cx="0" cy="0" r="10" fill="red" />
        </HeatmapContent>
      </g>
    </svg>
  );
});

const HeatmapContent = ({
  icon = "",
  title = "",
  children = <></>,
  height = 0,
}) => {
  const titleContentHeight = height * heatmapTitleRatio;
  return (
    <>
      <g className="heatmap-title-g">
        <rect
          className="heatmap-title-background"
          x="0"
          y={titleContentHeight * 0.05}
          width="150"
          height={titleContentHeight * 0.8}
          fill="#bbb"
        />
        <g className="heatmap-title-content">
          {/* <icon /> */}
          <text
            x="35"
            y={titleContentHeight * 0.64}
            fontSize={fontM * height}
            fill="#fff"
          >
            {title}
          </text>
        </g>
      </g>
      <g
        className="heatmap-rows-g"
        transform={`translate(0, ${titleContentHeight})`}
      >
        {children}
      </g>
    </>
  );
};

const heatmapColors = ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];

const HeatMap = ({ data, width, height }) => {
  const yearCount = data.length > 0 ? data[0].all_timeDis.length : 1;
  const rectWidth = (width * heatmapRowRectsWidthRatio) / yearCount;
  const heatmapRowStyle = (i) => ({
    transform: `translateY(${ratio(heatmapRowRatio * i)})`,
  });
  const color = (count) => {
    if (count === 0) return "transparent";
    const index = count >= heatmapColors.length ? heatmapColors.length : count;
    return heatmapColors[index - 1];
  };
  return (
    <>
      {data.map((d, i) => (
        <g className="heatmap-row-g" key={d.label} style={heatmapRowStyle(i)}>
          <text
            x={width * heatmapRowLabelWidthRatio}
            y={ratio(heatmapRectHeightRatio)}
            fontSize={fontS * height}
            fill="#aaa"
            textAnchor="end"
          >
            {d.label}
          </text>
          <g
            className="heatmap-row-rects-g"
            transform={`translate(${
              width *
              (heatmapRowLabelWidthRatio + heatmapRowRectsLeftPaddingRatio)
            }, 0)`}
          >
            {d.all_timeDis.map((count, i) => (
              <rect
                key={i}
                x={rectWidth * i}
                y="0"
                width={rectWidth * heatmapRectWidthRatio}
                height={heatmapRectHeightRatio * height}
                fill={color(count)}
              />
            ))}
          </g>
        </g>
      ))}
    </>
  );
};

export default StatisticsView;

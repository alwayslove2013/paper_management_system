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
const heatmapRowRation = 0.024;
const heatmapRectHeight = 0.018;
const heatmapBottomRatio = 0.01;

const authorCount = 10;
const keywordsCount = 10;

const StatisticsView = observer(() => {
  const svgId = "statistics-view-svg";
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;
  console.log(svgId, width, height);

  const headerStyle = { transform: `translateY(${ratio(0)})` };
  const timeDisStyle = { transform: `translateY(${ratio(headerRatio)})` };
  const authorDisStyle = {
    transform: `translateY(${ratio(headerRatio + timeDistributionRatio)})`,
  };
  const keywordDisStyle = {
    transform: `translateY(${ratio(
      headerRatio +
        timeDistributionRatio +
        (heatmapTitleRatio +
          heatmapRowRation * authorCount +
          heatmapBottomRatio)
    )})`,
  };
  const topicDisStyle = {
    transform: `translateY(${ratio(
      headerRatio +
        timeDistributionRatio +
        (heatmapTitleRatio +
          heatmapRowRation * authorCount +
          heatmapBottomRatio) +
        (heatmapTitleRatio +
          heatmapRowRation * keywordsCount +
          heatmapBottomRatio)
    )})`,
  };

  const heatmapRowStyle = (i) => ({
    transform: `translateY(${ratio(heatmapRowRation * i)})`,
  });

  const store = useGlobalStore();
  const { analysisPapers, anaHighPapers, anaTagViewData } = store;
  console.log("analysisPapers", analysisPapers, anaTagViewData);

  const authorData = anaTagViewData
    .find((d) => d.value === "authors")
    .data.slice(0, 10);

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
          {authorData.map((d, i) => (
            <g
              className="heatmap-row-g"
              key={d.label}
              style={heatmapRowStyle(i)}
            >
              <text
                x="100"
                y={ratio(heatmapRectHeight)}
                fontSize={fontS * height}
                fill="#aaa"
                textAnchor="end"
              >
                {d.label}
              </text>
              <g
                className="heatmap-row-rects-g"
                style={{ transform: `translateX(110px)` }}
              >
                {d.all_timeDis.map((count, i) => (
                  <rect
                    key={i}
                    x={(width / 30) * i}
                    y="0"
                    width={(width / 30) * 0.8}
                    height={heatmapRectHeight * height}
                    fill={count > 0 ? 'red' : 'none'}
                  />
                ))}
              </g>
            </g>
          ))}
        </HeatmapContent>
      </g>
      <g id="keywords-distribution-g" style={keywordDisStyle}>
        <HeatmapContent height={height} title={"Keyword"}>
          <circle cx="0" cy="0" r="10" fill="red" />
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

export default StatisticsView;

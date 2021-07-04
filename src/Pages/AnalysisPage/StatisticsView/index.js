import React, { useState, useEffect } from "react";
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

const headerRatio = 0.045;
const timeDistributionRatio = 0.1;

const heatmapTitleRatio = 0.036;
const heatmapRowRatio = 0.024;
const heatmapRowLabelWidthRatio = 0.24;
const heatmapRowRectsLeftPaddingRatio = 0.05;
const heatmapRowRectsRightPaddingRatio = 0.03;
const heatmapRowRectsWidthRatio =
  1 -
  heatmapRowLabelWidthRatio -
  heatmapRowRectsLeftPaddingRatio -
  heatmapRowRectsRightPaddingRatio;
const heatmapRectHeightRatio = 0.018;
const heatmapRectWidthRatio = 0.75;
const heatmapBottomRatio = 0.01;
const heatmapColors = ["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"];

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
  const {
    analysisPapers,
    anaHighPapers,
    anaTagViewData,
    anaYearRange,
    num_topics,
    topicColorScale,
    setAnaFilterType,
    setAnaHighPapersByYear,
    setAnaHighPapersByTag,
    setAnaHighPapersByTopic,
    startYear,
    endYear,
    setClearBrushTrigger,
    clearBrushTrigger,
  } = store;
  // console.log("analysisPapers", analysisPsapers);

  const authorData = anaTagViewData
    .find((d) => d.value === "authors")
    .data.slice(0, authorCount);

  const keywordData = anaTagViewData
    .find((d) => d.value === "keywords")
    .data.slice(0, keywordsCount);

  const topicData = d3.range(0, num_topics).map((topic_index) => {
    const papers = analysisPapers.filter((paper) =>
      paper.topics.map((a) => a[0]).includes(topic_index)
    );
    const highlightPapers = anaHighPapers.filter((paper) =>
      paper.topics.map((a) => a[0]).includes(topic_index)
    );
    return {
      label: `topic ${topic_index + 1}`,
      allCount: papers.length,
      highlightCount: highlightPapers.length,
      allDis: anaYearRange.map(
        (year) => papers.filter((paper) => paper.year == year).length
      ),
      highLightDis: anaYearRange.map(
        (year) => highlightPapers.filter((paper) => paper.year == year).length
      ),
      color: topicColorScale[topic_index],
    };
  });
  // console.log("topicData", topicData);
  const allDisData = anaYearRange.map((year) => ({
    year,
    all: analysisPapers.filter((paper) => paper.year == year).length,
    highlight: anaHighPapers.filter((paper) => paper.year == year).length,
  }));

  // brush

  const brushStart = () => {
    setAnaFilterType("year");
  };

  const brushing = ({ selection }) => {
    const x2year = (x) =>
      (x / (width * heatmapRowRectsWidthRatio)) * anaYearRange.length;
    const start = Math.floor(x2year(selection[0]));
    const selectStartYear = anaYearRange[start > 0 ? start : 0];
    const end = Math.floor(x2year(selection[1]));
    const selectEndYear =
      anaYearRange[
        end < anaYearRange.length - 1 ? end : anaYearRange.length - 1
      ];
    (startYear !== selectStartYear || endYear !== selectEndYear) &&
      setAnaHighPapersByYear([selectStartYear, selectEndYear]);
  };

  const brushEnd = ({ selection = null }) => {
    if (selection) {
    } else {
      setAnaFilterType("none");
      setAnaHighPapersByYear([
        anaYearRange[0],
        anaYearRange[anaYearRange.length - 1],
      ]);
    }
  };

  return (
    <svg id={svgId} width="100%" height="100%">
      <g id="header-g" style={headerStyle}>
        <StatisticsHeader
          allCount={analysisPapers.length}
          width={width}
          height={height}
        />
      </g>
      <g id="time-distribution-g" style={timeDisStyle}>
        <TimeLine
          data={allDisData}
          width={width}
          height={height}
          startYear={startYear}
          endYear={endYear}
          brushStart={brushStart}
          brushing={brushing}
          brushEnd={brushEnd}
          setClearBrushTrigger={setClearBrushTrigger}
        />
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
          <TopicDistribution data={topicData} width={width} height={height} />
        </HeatmapContent>
      </g>
    </svg>
  );
});

const StatisticsHeader = ({ allCount = 0, width = 0, height = 0 }) => {
  return (
    <>
      <text
        x={width * 0.04}
        y={headerRatio * height * 0.55}
        fontSize={fontL * height}
        fontWeight="600"
        fill="#444"
      >
        Papers: {allCount}
      </text>
      <path
        d={`M${width * 0.02}, ${headerRatio * height * 0.8} H${width * 0.98}`}
        stroke="#ccc"
        strokeWidth="1.5"
      />
      <g
        className="statistics-header-legend"
        transform={`translate(${width * 0.61}, ${headerRatio * height * 0.1})`}
      >
        {heatmapColors.map((color, i) => (
          <rect
            key={color}
            x={(width * 0.3 * i) / 5}
            y={height * headerRatio * 0.1}
            width={(width * 0.3) / 5}
            height={height * headerRatio * 0.4}
            fill={color}
          />
        ))}
        <text
          x={-width * 0.02}
          y={height * headerRatio * 0.45}
          fontSize={fontS * height}
          textAnchor="end"
          fill="#999"
        >
          0
        </text>
        <text
          x={width * 0.32}
          y={height * headerRatio * 0.45}
          fontSize={fontS * height}
          fill="#999"
        >
          &ge;5
        </text>
      </g>
    </>
  );
};

const timeDisYearLeftRatio = heatmapRowLabelWidthRatio * 0.7;

const timeDisBarRatio = timeDistributionRatio * 0.75;
const timeDisLineRatio = timeDisBarRatio + 0.05 * timeDistributionRatio;
const timeDisStickRatio = timeDisLineRatio + 0.05 * timeDistributionRatio;
const timeDisStickTextRatio = timeDisStickRatio + fontS;

const TimeLine = ({
  data = [],
  width = 0,
  height = 0,
  startYear = 0,
  endYear = 0,
  brushStart = () => {},
  brushing = () => {},
  brushEnd = () => {},
  setClearBrushTrigger = () => {},
}) => {
  const maxCount = d3.max(data, (d) => d.all);
  const yearCount = data.length === 0 ? 1 : data.length;
  const x = (i) => ((width * heatmapRowRectsWidthRatio) / yearCount) * i;
  const y = (count) =>
    (height * timeDisBarRatio * (maxCount - count)) / maxCount;
  const barWidth = ((width * heatmapRowRectsWidthRatio) / yearCount) * 0.8;

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [heatmapRowRectsWidthRatio * width, timeDisBarRatio * height],
    ])
    .on("start", brushStart)
    .on("brush", brushing)
    .on("end", brushEnd);
  useEffect(() => {
    const timeline = d3.select(".time-line-bar-chart");
    timeline.call(brush);
    setClearBrushTrigger(() => {
      d3.brush().move(timeline);
      brushEnd();
    });
  }, [width]);

  const yearTextX = timeDisYearLeftRatio * width;
  const startYearTextY = timeDistributionRatio * height * 0.3;
  const endYearTextY = timeDistributionRatio * height * 0.8;
  const yearTextLinkY = startYearTextY + timeDistributionRatio * height * 0.1;
  const yearTextLinkHeight = timeDistributionRatio * height * 0.14;

  return (
    <g className="time-line-container">
      <g
        className="time-line-time"
        fontSize={fontL * height}
        fontWeight="600"
        fill="#888"
      >
        <text x={yearTextX} y={startYearTextY} textAnchor="middle">
          {startYear}
        </text>
        <text x={yearTextX} y={endYearTextY} textAnchor="middle">
          {endYear}
        </text>
        <path
          d={`M${yearTextX}, ${yearTextLinkY} v${yearTextLinkHeight} `}
          stroke="#999"
        />
      </g>
      <g
        className="time-line-bar-chart"
        transform={`translate(${
          width * (heatmapRowLabelWidthRatio + heatmapRowRectsLeftPaddingRatio)
        }, 0)`}
      >
        <g className="time-line-bars-background">
          {data.map((d, i) => (
            <rect
              key={i}
              x={x(i)}
              y={y(d.all)}
              fill="#ccc"
              width={barWidth}
              height={y(0) - y(d.all)}
            />
          ))}
        </g>
        <g className="time-line-bars-highlight">
          {data.map((d, i) => (
            <rect
              key={i}
              x={x(i)}
              y={y(d.highlight)}
              fill="#888"
              width={barWidth}
              height={y(0) - y(d.highlight)}
            />
          ))}
        </g>
        <g className="time-line-axis">
          <path
            d={`M${-barWidth * 0.5},${timeDisLineRatio * height}h${
              width * heatmapRowRectsWidthRatio + barWidth
            }`}
            stroke="#aaa"
            strokeWidth="1"
          />
          {data.map(
            (d, i) =>
              +d.year % 5 === 0 && (
                <g key={i}>
                  <path
                    d={`M${x(i) + barWidth * 0.5},${
                      timeDisLineRatio * height
                    }V${timeDisStickRatio * height}`}
                    stroke="#888"
                    strokeWidth="2"
                  />
                  <text
                    x={x(i) + barWidth * 0.5}
                    y={timeDisStickTextRatio * height}
                    textAnchor="middle"
                    fontSize={fontS * height}
                    fill="#aaa"
                    // fontWeight="600"
                  >
                    {d.year}
                  </text>
                </g>
              )
          )}
        </g>
      </g>
    </g>
  );
};

const topicBarChartHeightRatio = 0.05;
const topicBarChartBottomRatio = 0.005;

const TopicDistribution = ({ data = [], width = 0, height = 0 }) => {
  const maxCount = d3.max(data.map((topicData) => d3.max(topicData.allDis)));
  const yearCount = data.length === 0 ? 1 : data[0].allDis.length;
  const x = (i) => ((width * heatmapRowRectsWidthRatio) / yearCount) * i;
  const y = (count) =>
    (height * topicBarChartHeightRatio * (maxCount - count)) / maxCount;

  return (
    <g className="topic-bar-chart">
      {data.map((topicData, i) => (
        <g
          key={topicData.label}
          transform={`translate(0, ${
            (topicBarChartHeightRatio + topicBarChartBottomRatio) * height * i
          })`}
          fill={topicData.color}
        >
          <text
            x={heatmapRowLabelWidthRatio * width}
            y={topicBarChartHeightRatio * height * 0.5}
            fontSize={fontM * height}
            fontWeight="600"
            textAnchor="end"
          >
            {topicData.label}
          </text>
          <text
            x={heatmapRowLabelWidthRatio * width}
            y={topicBarChartHeightRatio * height * 1}
            fontSize={fontS * height}
            fontWeight="600"
            textAnchor="end"
          >
            {topicData.highlightCount}/{topicData.allCount}
          </text>
          <g
            className="topic-bar-chart-bars"
            transform={`translate(${
              width *
              (heatmapRowLabelWidthRatio + heatmapRowRectsLeftPaddingRatio)
            }, 0)`}
          >
            {topicData.allDis.map((count, j) => (
              <rect
                key={j}
                x={x(j)}
                y={y(count)}
                width={((width * heatmapRowRectsWidthRatio) / yearCount) * 0.8}
                height={y(0) - y(count)}
              />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
};

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

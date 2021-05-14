import React, { useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";

const NetworkView = observer(() => {
  const svgId = "ana-network-svg";
  const padding = {
    left: 50,
    right: 50,
    top: 40,
    bottom: 40,
  };
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;

  const store = useGlobalStore();
  const {
    analysisPapers,
    topicColorScale,
    anaFilterType,
    anaHighTopic,
    anaHighPapers,
    setAnaSelectHighlightPaperDoi,
    anaSelectHighlightPaperDoi,
  } = store;

  // rect
  const anaHighPapersDoiSet = new Set(anaHighPapers.map((p) => p.doi));
  const yearRange = d3.extent(analysisPapers, (d) => +d.year);
  const paperCountByYear = d3
    .range(...yearRange.map((d, i) => d + i))
    .map(
      (year) => analysisPapers.filter((paper) => +paper.year === +year).length
    );

  const rectWidth = d3.max([
    ((width - padding.left - padding.right) /
      (yearRange[1] - yearRange[0] + 1)) *
      0.68,
    0,
  ]);
  const rectHeight = d3.max([
    d3.min([
      rectWidth * 0.4,
      ((height - padding.bottom - padding.top) / d3.max(paperCountByYear)) *
        0.8,
    ]),
    0,
  ]);
  const x = d3
    .scaleLinear()
    .domain(yearRange)
    .range([padding.left, width - padding.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(paperCountByYear) - 1])
    .range([padding.top, height - padding.bottom]);
  const year2count = {};
  const data = analysisPapers;
  const compareIndexByTopic = (a, b) => {
    if (a.topics[0][0] === b.topics[0][0]) {
      return a.topics[0][1] - b.topics[0][1];
    } else {
      return a.topics[0][0] - b.topics[0][0];
    }
  };
  data.sort(compareIndexByTopic);
  const doi2indexByYear = {};
  data.forEach((paper) => {
    if (!(paper.year in year2count)) {
      year2count[paper.year] = 0;
    }
    doi2indexByYear[paper.doi] = year2count[paper.year];
    year2count[paper.year] += 1;
  });
  const rectOpacity = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return 1;
    if (anaHighPapersDoiSet.has(paper.doi)) return 1;
    else return 0.3;
  };
  const rectStroke = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return "red";
    if (anaFilterType === "none") return "#fff";
    if (anaHighPapersDoiSet.has(paper.doi)) return "#666";
    else return "#fff";
  };
  const rectStrokeWidth = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return 3;
    else return 2;
  };
  const rectStrokeDashArray = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return [4, 7];
    if (anaFilterType === "none") return "none";
    if (anaHighPapersDoiSet.has(paper.doi)) return [5, 4];
    else return "none";
  };

  // contour
  const contourFunc = d3
    .contourDensity()
    .x((paper) => x(+paper.year))
    .y((paper) => y(doi2indexByYear[paper.doi]))
    .size([width, height])
    .bandwidth(30)
    .thresholds(5);
  const contour = contourFunc(anaHighPapers)[0];
  const contourColor =
    anaFilterType === "none"
      ? "none"
      : anaFilterType === "topic"
      ? topicColorScale[anaHighTopic]
      : "#aaa";
  const contourOpacity = anaFilterType === "none" ? 0 : 0.25;

  // internal-links
  const doi2paper = {};
  analysisPapers.forEach((paper) => (doi2paper[paper.doi] = paper));
  const internalLinks = [];
  analysisPapers.forEach((paper) => {
    paper.refList.forEach((refPaperDoi) => {
      if (refPaperDoi in doi2paper) {
        // const refPaper = doi2paper[refPaperDoi]
        const link = {
          source: refPaperDoi,
          target: paper.doi,
          weight: 1,
        };
        internalLinks.push(link);
      }
    });
  });
  const diagonal = d3
    .linkHorizontal()
    .x((doi) => x(doi2paper[doi].year))
    .y((doi) => y(doi2indexByYear[doi]));
  const computedPath = (d) => {
    if (y(doi2indexByYear[d.source]) === y(doi2indexByYear[d.target])) {
      const x0 = x(doi2paper[d.source].year);
      const y0 = y(doi2indexByYear[d.source]);
      const x3 = x(doi2paper[d.target].year);
      const y3 = y0;

      const x1 = x0 + (x3 - x0) * 0.3;
      const x2 = x0 + (x3 - x0) * 0.7;
      const y1 =
        y0 +
        ((height - padding.bottom - padding.top) / d3.max(paperCountByYear)) *
          0.8;
      const y2 = y1;
      return `M${x0},${y0} C ${x1},${y1},${x2},${y2},${x3},${y3}`;
    } else {
      return diagonal(d);
    }
  };
  const linkStroke = (link) => {
    if (
      link.source === anaSelectHighlightPaperDoi ||
      link.target === anaSelectHighlightPaperDoi
    )
      return "#333";
    if (
      anaHighPapersDoiSet.has(link.source) &&
      anaHighPapersDoiSet.has(link.target)
    )
      return "#555";
    return "#aaa";
  };
  const linkOpacity = (link) => {
    if (
      link.source === anaSelectHighlightPaperDoi ||
      link.target === anaSelectHighlightPaperDoi
    )
      return 0.7;
    if (anaFilterType === "none") return 0.1;
    if (
      anaHighPapersDoiSet.has(link.source) &&
      anaHighPapersDoiSet.has(link.target)
    )
      return 0.35;
    return 0;
  };
  const strokeWidth = (link) => {
    if (
      link.source === anaSelectHighlightPaperDoi ||
      link.target === anaSelectHighlightPaperDoi
    )
      return 5;
    if (
      anaHighPapersDoiSet.has(link.source) &&
      anaHighPapersDoiSet.has(link.target)
    )
      return 4;
    return 0;
  };

  return (
    <div className="ana-network-view">
      <svg id={svgId} width="100%" height="100%">
        <g id="network-contour-g">
          <path
            d={d3.geoPath()(contour)}
            fill={contourColor}
            opacity={contourOpacity}
            // stroke="#333"
            // strokeDasharray="8"
            // strokeWidth="2"
          />
        </g>
        <g id="network-internal-links-g" fill="none">
          {internalLinks.map((link) => (
            <path
              key={`${link.source}-${link.target}`}
              d={computedPath(link)}
              strokeLinecap="round"
              stroke={linkStroke(link)}
              strokeWidth={strokeWidth(link)}
              opacity={linkOpacity(link)}
            />
          ))}
        </g>
        <g id="network-cite-links-g"></g>
        <g id="network-cited-links-g"></g>
        <g id="network-rects-g">
          {analysisPapers.map((paper) => (
            <g
              key={paper.doi}
              transform={`translate(${x(+paper.year)}, ${y(
                doi2indexByYear[paper.doi]
              )})`}
              cursor="pointer"
              onClick={() => {
                console.log("click", paper);
              }}
              opacity={rectOpacity(paper)}
              onClick={() => setAnaSelectHighlightPaperDoi(paper.doi)}
            >
              <>
                {paper.topics.map((topic, i, s) => (
                  <rect
                    key={topic[0]}
                    fill={topicColorScale[topic[0]]}
                    x={-rectWidth / 2 + (rectWidth / s.length) * i}
                    y={-rectHeight / 2}
                    width={rectWidth / s.length}
                    height={rectHeight}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                ))}
                <rect
                  x={-rectWidth / 2 - rectStrokeWidth(paper) / 2}
                  y={-rectHeight / 2 - rectStrokeWidth(paper) / 2}
                  fill="none"
                  width={rectWidth + rectStrokeWidth(paper)}
                  height={rectHeight + rectStrokeWidth(paper)}
                  stroke={rectStroke(paper)}
                  strokeWidth={rectStrokeWidth(paper)}
                  strokeLinecap="round"
                  strokeDasharray={rectStrokeDashArray(paper)}
                />
              </>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});

export default NetworkView;

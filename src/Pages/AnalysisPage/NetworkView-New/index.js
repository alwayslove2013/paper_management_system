import React from "react";
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
    top: 50,
    bottom: 40,
  };
  const clientRect = useClientRect({
    svgId,
  });
  const { width = 0, height = 0 } = clientRect;

  const store = useGlobalStore();
  const {
    analysisPapers,
    topicColorScale,
    anaFilterType,
    anaHighTopic,
    anaHighPapers,
    setAnaSelectHighlightPaperDoi,
    anaSelectHighlightPaperDoi,
    anaHighEntityTopic,
    anaHighEntityCitePaperDois,
    anaHighEntityCitedPaperDois,
    anaHighTopicIndenpentPaperDois,
    anaYearRange,
    setAnaHoverPaperDoi,
    removeHoverPaperDoi,
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
        0.7,
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
  const data = analysisPapers.slice();
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
    if (anaHighEntityTopic >= 0) {
      if (anaHighEntityCitePaperDois.includes(paper.doi)) return 0.9;
      if (anaHighEntityCitedPaperDois.includes(paper.doi)) return 0.9;
    }
    return 0.3;
  };
  const rectStroke = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return "red";
    if (
      anaSelectHighlightPaperDoi.length > 0 &&
      anaHighPapersDoiSet.has(paper.doi)
    ) {
      if (paper.refList.includes(anaSelectHighlightPaperDoi)) return "#333";
      if (doi2paper[anaSelectHighlightPaperDoi].refList.includes(paper.doi))
        return "#333";
    }
    if (anaHighEntityTopic >= 0) {
      if (anaHighEntityCitePaperDois.includes(paper.doi)) return "#666";
      if (anaHighEntityCitedPaperDois.includes(paper.doi)) return "#666";
    }
    if (anaFilterType === "none") return "#fff";
    if (anaHighPapersDoiSet.has(paper.doi)) return "#666";
    else return "#fff";
  };
  const rectStrokeWidth = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return 2;
    else if (
      anaSelectHighlightPaperDoi.length > 0 &&
      anaHighPapersDoiSet.has(paper.doi)
    ) {
      if (paper.refList.includes(anaSelectHighlightPaperDoi)) return 1;
      if (doi2paper[anaSelectHighlightPaperDoi].refList.includes(paper.doi))
        return 1;
    }
    return 1;
  };
  const rectStrokeDashArray = (paper) => {
    if (paper.doi === anaSelectHighlightPaperDoi) return [4, 7];
    if (
      anaSelectHighlightPaperDoi.length > 0 &&
      anaHighPapersDoiSet.has(paper.doi)
    ) {
      if (paper.refList.includes(anaSelectHighlightPaperDoi)) return "none";
      if (doi2paper[anaSelectHighlightPaperDoi].refList.includes(paper.doi))
        return "none";
    }
    if (anaHighEntityTopic >= 0) {
      if (anaHighEntityCitePaperDois.includes(paper.doi)) return "none";
      if (anaHighEntityCitedPaperDois.includes(paper.doi)) return "none";
    }
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
    // 选中中心文献，高亮“中心文献”与“子集合内部”的所有引用连边。
    if (
      (link.source === anaSelectHighlightPaperDoi &&
        anaHighPapersDoiSet.has(link.target)) ||
      (link.target === anaSelectHighlightPaperDoi &&
        anaHighPapersDoiSet.has(link.source))
    )
      return "#333";

    // 有高亮主题且高亮连边的情况下，主题影响力颜色方向
    if (anaHighEntityTopic >= 0) {
      if (
        anaHighEntityCitePaperDois.includes(link.target) &&
        anaHighTopicIndenpentPaperDois.includes(link.source)
      )
        return topicColorScale[anaHighTopic];
      if (
        anaHighEntityCitedPaperDois.includes(link.source) &&
        anaHighTopicIndenpentPaperDois.includes(link.target)
      )
        return topicColorScale[anaHighEntityTopic];
    }

    // 集合内部
    if (
      anaHighPapersDoiSet.has(link.source) &&
      anaHighPapersDoiSet.has(link.target)
    )
      return "#555";
    return "#aaa";
  };
  const linkOpacity = (link) => {
    if (
      (link.source === anaSelectHighlightPaperDoi &&
        anaHighPapersDoiSet.has(link.target)) ||
      (link.target === anaSelectHighlightPaperDoi &&
        anaHighPapersDoiSet.has(link.source))
    )
      return 1;
    if (anaFilterType === "none") return 0.1;
    if (anaHighEntityTopic >= 0) {
      if (
        anaHighEntityCitePaperDois.includes(link.target) &&
        anaHighTopicIndenpentPaperDois.includes(link.source)
      )
        return 0.9;
      if (
        anaHighEntityCitedPaperDois.includes(link.source) &&
        anaHighTopicIndenpentPaperDois.includes(link.target)
      )
        return 0.9;
    }
    if (
      anaHighEntityTopic < 0 &&
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
      return 1;
    if (anaHighEntityTopic >= 0) {
      if (
        anaHighEntityCitePaperDois.includes(link.target) &&
        anaHighTopicIndenpentPaperDois.includes(link.source)
      )
        return 1;
      if (
        anaHighEntityCitedPaperDois.includes(link.source) &&
        anaHighTopicIndenpentPaperDois.includes(link.target)
      )
        return 1;
    }
    if (
      anaHighPapersDoiSet.has(link.source) &&
      anaHighPapersDoiSet.has(link.target)
    )
      return 1;
    return 0;
  };

  const handleHover = (e, doi) => {
    const { clientX, clientY } = e;
    setAnaHoverPaperDoi(clientX, clientY, doi);
  };

  return (
    <div className="ana-network-view" style={{ pointerEvents: "none" }}>
      <svg id={svgId} width="100%" height="100%">
        <g id="ana-network-axis">
          <path
            d={`M${padding.left * 0.3},${padding.top * 0.63}H${
              width - padding.right * 0.3
            }`}
            stroke="#666"
            strokeWidth="1"
          />
          <g id="ana-network-axis-labels">
            {anaYearRange.map((year) => (
              <text
                key={year}
                x={x(year)}
                y={padding.top * 0.5}
                fontSize="14"
                fill="#888"
                textAnchor="middle"
              >
                {year}
              </text>
            ))}
          </g>
        </g>
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
        <g id="network-links-g" fill="none">
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
        <g id="network-rects-g">
          {analysisPapers.map((paper) => {
            const topicsDis = paper.topics.map((t) => t[1]);
            const topicsDisSum = topicsDis.reduce((s, a) => s + a, 0);
            const topicsWidth = topicsDis
              .slice(1)
              .map(
                (t) =>
                  (t / topicsDisSum < 0.2 ? 0.2 : t / topicsDisSum) * rectWidth
              );
            topicsWidth.unshift(
              rectWidth - topicsWidth.reduce((s, a) => s + a, 0)
            );
            const topicX = [0];
            for (let i = 0; i < topicsWidth.length - 1; i++) {
              topicX.push(topicX[i] + topicsWidth[i]);
            }
            return (
              <g
                key={paper.doi}
                transform={`translate(${x(+paper.year)}, ${y(
                  doi2indexByYear[paper.doi]
                )})`}
                cursor="pointer"
                opacity={rectOpacity(paper)}
                onClick={() => setAnaSelectHighlightPaperDoi(paper.doi)}
                onMouseEnter={(e) => handleHover(e, paper.doi)}
                onMouseLeave={removeHoverPaperDoi}
                style={{ pointerEvents: "auto" }}
              >
                <>
                  {paper.topics.map((topic, i, s) => (
                    <rect
                      key={topic[0]}
                      fill={topicColorScale[topic[0]]}
                      // x={-rectWidth / 2 + (rectWidth / s.length) * i}
                      x={-rectWidth / 2 + topicX[i]}
                      y={-rectHeight / 2}
                      // width={rectWidth / s.length}
                      width={topicsWidth[i]}
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
            );
          })}
        </g>
      </svg>
    </div>
  );
});

export default NetworkView;

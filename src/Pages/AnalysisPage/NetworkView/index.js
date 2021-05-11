import React, { useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";

const NetworkView = observer(() => {
  const svgId = "ana-network-svg";
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;

  const store = useGlobalStore();
  const {
    analysisPapers,
    topicColorScale,
    defaultHighColor,
    drawProjectionFlag,
    num_topics,
    anaFilterType,
    anaHighTopic,
    anaHighPapers,
  } = store;
  const yearRange = d3.extent(analysisPapers, (d) => +d.year);
  const paperCountByYear = d3
    .range(...yearRange.map((d, i) => d + i))
    .map((year) => analysisPapers.filter((paper) => paper.year == year).length);

  const padding = {
    left: 50,
    right: 50,
    top: 40,
    bottom: 40,
  };

  const rectWidth =
    ((width - padding.left - padding.right) /
      (yearRange[1] - yearRange[0] + 1)) *
    0.68;
  const rectHeight = rectWidth * 0.4;
  const svg = d3.select(`#${svgId}`);
  const x = d3
    .scaleLinear()
    .domain(yearRange)
    .range([padding.left, width - padding.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(paperCountByYear) - 1])
    .range([padding.top, height - padding.bottom]);

  // 节点rect渲染
  if (drawProjectionFlag) {
    console.log("====> Network! get topic");
    const data = analysisPapers;
    const compareIndexByTopic = (a, b) => {
      if (a.topics[0][0] === b.topics[0][0]) {
        return a.topics[0][1] - b.topics[0][1];
      } else {
        return a.topics[0][0] - b.topics[0][0];
      }
    };
    data.sort(compareIndexByTopic);
    const year2count = {};
    data.forEach((d) => {
      if (!(d.year in year2count)) {
        year2count[d.year] = 0;
      }
      d.indexByYear = year2count[d.year];
      year2count[d.year] += 1;
    });
    const paperRectG = svg.select(".paper-rect-g").selectAll("g");
    paperRectG.attr(
      "transform",
      (d) => `translate(${x(+d.year)}, ${y(d.indexByYear)})`
    );
    paperRectG
      .select("rect")
      .attr("fill", (d) => topicColorScale[d.topics[0] ? d.topics[0][0] : 0]);
    paperRectG
      .selectAll("rect")
      .data((d) =>
        d.topics.map((a, i, s) => {
          a.len = s.length;
          return a;
        })
      )
      .join("rect")
      .attr("x", (d, i) => -rectWidth / 2 + (rectWidth / d.len) * i)
      .attr("y", -rectHeight / 2)
      .attr("width", (d) => rectWidth / d.len)
      .attr("height", rectHeight)
      .attr("fill", (d) => topicColorScale[d[0]]);
  }

  // analysisPapers.forEach((paper) => (paper.isHighlight = false));
  // anaHighPapers.forEach((paper) => (paper.isHighlight = true));
  const anaHighPapersDoiSet = new Set(anaHighPapers.map((p) => p.doi));
  if (anaFilterType !== "none") {
    const contourColor =
      anaFilterType === "topic"
        ? topicColorScale[anaHighTopic]
        : defaultHighColor;
    const contourG = svg.select(".paper-contour-g");
    contourG.selectAll("*").remove();
    const contourFunc = d3
      .contourDensity()
      .x((d) => x(+d.year))
      .y((d) => y(d.indexByYear))
      .size([width, height])
      .bandwidth(30)
      .thresholds(5);
    const contour = contourFunc(
      // analysisPapers.filter((paper) =>
      //   paper.topics.map((t) => t[0]).includes(anaHighTopic)
      // )
      anaHighPapers
    )[0];

    contourG
      .attr("stroke", "none")
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data([contour])
      .join("path")
      .attr("opacity", 0.3)
      .attr("stroke-width", 7)
      .attr("fill", contourColor)
      .attr("d", d3.geoPath());

    const rectG = svg.select(".paper-rect-g").selectAll("g");

    rectG.attr("opacity", (d) => (anaHighPapersDoiSet.has(d.doi) ? 1 : 0.15));
  } else {
    const rectG = svg.select(".paper-rect-g").selectAll("g");
    rectG.attr("opacity", 1);
    const contourG = svg.select(".paper-contour-g");
    contourG.selectAll("*").remove();
  }

  // 引用
  const doi2paper = {};
  analysisPapers.forEach((paper) => (doi2paper[paper.doi] = paper));
  const refLinks = [];
  analysisPapers.forEach((paper) => {
    paper.refList.forEach((refPaperDoi) => {
      if (refPaperDoi in doi2paper) {
        // const refPaper = doi2paper[refPaperDoi]
        const link = {
          source: refPaperDoi,
          target: paper.doi,
          weight: 1,
        };
        refLinks.push(link);
      }
    });
  });
  const linksG = svg.select(".paper-link-g");
  const diagonal = d3
    .linkHorizontal()
    .x((doi) => x(doi2paper[doi].year))
    .y((doi) => y(doi2paper[doi].indexByYear));
  const computedPath = (d) => {
    if (
      y(doi2paper[d.source].indexByYear) === y(doi2paper[d.target].indexByYear)
    ) {
      const x0 = x(doi2paper[d.source].year);
      const y0 = y(doi2paper[d.source].indexByYear);
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
  linksG.selectAll("*").remove();
  linksG
    .selectAll("path")
    .data(refLinks)
    .join("path")
    .attr("d", computedPath)
    .attr(
      "opacity",
      (d) =>
        (anaHighPapersDoiSet.has(d.source) &&
          anaHighPapersDoiSet.has(d.target)) * 0.3
    );

  // 初始化
  useEffect(() => {
    if (width > 0) {
      svg.selectAll("*").remove();
      svg.append("g").attr("class", "paper-contour-g");
      svg
        .append("g")
        .attr("class", "paper-link-g")
        .attr("stroke", "#666")
        .attr("stroke-width", 5)
        .attr("fill", "none");

      const data = analysisPapers;
      // .map((d) => toJS(d));
      // const compareIndexByTopic = (a, b) => {
      //   if (a.topics[0][0] === b.topics[0][0]) {
      //     return a.topics[0][1] - b.topics[0][1];
      //   } else {
      //     return a.topics[0][0] - b.topics[0][0];
      //   }
      // };
      // data.sort(compareIndexByTopic);
      const year2count = {};
      data.forEach((d) => {
        if (!(d.year in year2count)) {
          year2count[d.year] = 0;
        }
        d.indexByYear = year2count[d.year];
        year2count[d.year] += 1;
      });

      const paperRectGG = svg.append("g").attr("class", "paper-rect-g");
      const paperRectG = paperRectGG
        .selectAll("g")
        .data(data)
        .join("g")
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .attr("id", (d) => d.doi)
        .attr(
          "transform",
          (d) => `translate(${x(+d.year)}, ${y(d.indexByYear)})`
        );
      paperRectG
        .append("rect")
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", (d) => topicColorScale[d.topics[0] ? d.topics[0][0] : 0]);
    }
  }, [width]);

  return (
    <div className="ana-network-view">
      <svg id={svgId} width="100%" height="100%" />
    </div>
  );
});

export default NetworkView;

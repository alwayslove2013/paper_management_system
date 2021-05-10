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

  const rectWidth = 28;
  const rectHeight = 12;
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
  }

  if (anaFilterType !== "none") {
    console.log('anaHighTopic', anaHighTopic);
    const contourColor = anaFilterType === "topic" ? topicColorScale[anaHighTopic] : defaultHighColor;
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
  }
  // 得到topic
  // useEffect(() => {
  //   if (drawProjectionFlag) {
  //     console.log("====> Network! get topic");
  //     const data = analysisPapers;
  //     const compareIndexByTopic = (a, b) => {
  //       if (a.topics[0][0] === b.topics[0][0]) {
  //         return a.topics[0][1] - b.topics[0][1];
  //       } else {
  //         return a.topics[0][0] - b.topics[0][0];
  //       }
  //     };
  //     data.sort(compareIndexByTopic);
  //     const year2count = {};
  //     data.forEach((d) => {
  //       if (!(d.year in year2count)) {
  //         year2count[d.year] = 0;
  //       }
  //       d.indexByYear = year2count[d.year];
  //       year2count[d.year] += 1;
  //     });
  //     const paperRectG = svg.select(".paper-rect-g").selectAll("g");
  //     paperRectG.attr(
  //       "transform",
  //       (d) => `translate(${x(+d.year)}, ${y(d.indexByYear)})`
  //     );
  //     paperRectG
  //       .select("rect")
  //       .attr("fill", (d) => topicColorScale[d.topics[0] ? d.topics[0][0] : 0]);

  //     // const contourG = svg.select(".paper-contour-g");
  //     // contourG.selectAll("*").remove();
  //     // const contourFunc = d3
  //     //   .contourDensity()
  //     //   .x((d) => x(+d.year))
  //     //   .y((d) => y(d.indexByYear))
  //     //   .size([width, height])
  //     //   .bandwidth(30)
  //     //   .thresholds(5);
  //     // const contours = d3
  //     //   .range(num_topics)
  //     //   .map(
  //     //     (topic_i) =>
  //     //       contourFunc(
  //     //         data.filter((paper) =>
  //     //           paper.topics.map((t) => t[0]).includes(topic_i)
  //     //         )
  //     //       )[0]
  //     //   );

  //     // contourG
  //     //   .attr("stroke", "none")
  //     //   .attr("stroke-linejoin", "round")
  //     //   .selectAll("path")
  //     //   .data(contours)
  //     //   .join("path")
  //     //   .attr("id", (d, i) => `contour-${i}`)
  //     //   .attr("opacity", 0.3)
  //     //   .attr("stroke-width", 7)
  //     //   .attr("fill", (d, i) => topicColorScale[i])
  //     //   .attr("d", d3.geoPath());
  //   }
  // }, [drawProjectionFlag]);

  // 初始化
  useEffect(() => {
    if (width > 0) {
      svg.selectAll("*").remove();

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

      svg.append("g").attr("class", "paper-contour-g");
    }
  }, [width]);

  return (
    <div className="ana-network-view">
      <svg id={svgId} width="100%" height="100%" />
    </div>
  );
});

export default NetworkView;

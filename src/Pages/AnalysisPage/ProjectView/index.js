import React, { useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { InputNumber } from "antd";

const ProjectView = observer(() => {
  const svgId = "ana-projection-map-svg";
  const store = useGlobalStore();
  const {
    drawProjectionFlag,
    analysisPapers,
    anaHighPapers,
    num_topics,
    resetProjectionFlag,
    setNumTopics,
  } = store;
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;
  useEffect(() => {
    store.tryLda();
  }, []);
  useEffect(() => {
    if (width > 0 && drawProjectionFlag) {
      const svg = d3.select(`#${svgId}`);
      svg.selectAll("*").remove();

      const padding = {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30,
      };

      const circleColorScale = d3.schemeTableau10;
      const circleColor = (paper) => {
        if (paper.topics.length === 0) {
          return "#ccc";
        } else {
          let mainTopic = paper.topics[0];
          paper.topics.forEach((topic) => {
            if (topic[1] > mainTopic[1]) {
              mainTopic = topic;
            }
          });
          return circleColorScale[mainTopic[0]];
        }
      };
      const x = d3
        .scaleLinear()
        .domain([
          d3.min(analysisPapers, (d) => d.projection[0]),
          d3.max(analysisPapers, (d) => d.projection[0]),
        ])
        .nice()
        .range([padding.left, width - padding.right]);
      const y = d3
        .scaleLinear()
        .domain([
          d3.min(analysisPapers, (d) => d.projection[1]),
          d3.max(analysisPapers, (d) => d.projection[1]),
        ])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const contours = d3.range(num_topics).map(
        (topic_i) =>
          d3
            .contourDensity()
            .x((d) => x(d.projection[0]))
            .y((d) => y(d.projection[1]))
            // .size([
            //   width - padding.left - padding.right,
            //   height - padding.top - padding.bottom,
            // ])
            .size([width, height])
            .bandwidth(30)
            .thresholds(5)(
            analysisPapers.filter((paper) =>
              paper.topics.map((t) => t[0]).includes(topic_i)
            )
          )[0]
      );
      const contourG = svg.append("g").attr("class", "contour-g");
      contourG
        .attr("stroke", "none")
        .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data(contours)
        .join("path")
        .attr("opacity", 0.3)
        .attr("stroke-width", 2)
        .attr("fill", (d, i) => circleColorScale[i])
        .attr("d", d3.geoPath());

      const circlesG = svg.append("g").attr("class", "circles-g");
      circlesG
        .selectAll("circle")
        .data(analysisPapers)
        .join("circle")
        .attr("cx", (d) => x(d.projection[0]))
        .attr("cy", (d) => y(d.projection[1]))
        .attr("r", 5)
        .attr("fill", (d) => circleColor(d));

      resetProjectionFlag();
    }
  }, [width, drawProjectionFlag, num_topics, analysisPapers, anaHighPapers]);
  return (
    <div className="projection-view">
      <svg id={svgId} width="100%" height="100%" />
      <div className="topics-number-input">
        <div className="topics-number-input-text">Topics Num:</div>
        <InputNumber
          size="small"
          min={2}
          max={10}
          defaultValue={num_topics}
          onChange={setNumTopics}
        />
      </div>
    </div>
  );
});

export default ProjectView;

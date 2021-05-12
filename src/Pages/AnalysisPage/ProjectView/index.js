import React, { useState, useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { Slider } from "antd";

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
    topicColorScale,
    anaFilterType,
    anaHighTopic,
    setAnaSelectHighlightPaper,
    anaSelectHighlightPaperDoi,
  } = store;
  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;
  // 初始化
  useEffect(() => {
    store.tryLda();
  }, []);

  const padding = {
    left: 30,
    right: 30,
    top: 30,
    bottom: 30,
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

  // 接收到topics数据，开始绘制
  useEffect(() => {
    if (width > 0 && drawProjectionFlag) {
      const svg = d3.select(`#${svgId}`);
      svg.selectAll("g").remove();

      // const topicColorScale = d3.schemeTableau10;
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
          return topicColorScale[mainTopic[0]];
        }
      };

      const contours = d3.range(num_topics).map(
        (topic_i) =>
          d3
            .contourDensity()
            .x((d) => x(d.projection[0]))
            .y((d) => y(d.projection[1]))
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
        .attr("id", (d, i) => `contour-${i}`)
        .attr("opacity", 0.3)
        .attr("stroke-width", 7)
        .attr("fill", (d, i) => topicColorScale[i])
        .attr("d", d3.geoPath());

      const circlesG = svg.append("g").attr("class", "circles-g");
      circlesG
        .selectAll("circle")
        .data(analysisPapers)
        .join("circle")
        .attr("cx", (d) => x(d.projection[0]))
        .attr("cy", (d) => y(d.projection[1]))
        .attr("r", 6)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("fill", (d) => circleColor(d))
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          setAnaSelectHighlightPaper(d.doi);
        });

      // resetProjectionFlag();
      setTimeout(() => {
        resetProjectionFlag();
      }, 1000);
    }
  }, [width, drawProjectionFlag, num_topics, analysisPapers]);

  // 出现高亮
  useEffect(() => {
    const contourG = d3.select(".contour-g");
    const circlesG = d3.select(".circles-g");
    const anaHighPapersDoiSet = new Set(
      anaHighPapers.map((paper) => paper.doi)
    );
    if (anaFilterType === "none") {
      // 无高亮状态
      contourG.selectAll("path").attr("opacity", 0.3).attr("stroke", "none");
      circlesG
        .selectAll("circle")
        .attr("opacity", 1)
        .attr("stroke", (d) =>
          d.doi === anaSelectHighlightPaperDoi ? "red" : "#fff"
        )
        .attr("stroke-width", (d) =>
          d.doi === anaSelectHighlightPaperDoi ? 4 : 2
        )
        .attr("r", (d) => (d.doi === anaSelectHighlightPaperDoi ? 9 : 6));
    } else if (anaFilterType === "topic") {
      // 高亮主题
      //    contour高亮 + 包括该主题的节点高亮
      contourG.selectAll("path").attr("opacity", 0.1).attr("stroke", "none");
      contourG
        .select(`#contour-${anaHighTopic}`)
        .attr("opacity", 0.5)
        .attr("stroke", "red");
      circlesG
        .selectAll("circle")
        .attr("opacity", (d) =>
          d.topics.map((a) => a[0]).includes(anaHighTopic) ||
          d.doi === anaSelectHighlightPaperDoi
            ? 1
            : 0.3
        )
        .attr("stroke", (d) =>
          d.doi === anaSelectHighlightPaperDoi ? "red" : "#fff"
        )
        .attr("stroke-width", (d) =>
          d.doi === anaSelectHighlightPaperDoi ? 4 : 2
        )
        .attr("r", (d) => (d.doi === anaSelectHighlightPaperDoi ? 9 : 6));

      const svg = d3.select(`#${svgId}`);
      svg.select("#topic-entity-g").remove();
      svg.select("#topic-link-g").remove();
      const topicEntityG = svg.append("g").attr("id", "topic-entity-g");
      const topicLinkG = svg.append("g").attr("id", "topic-link-g");

      const generateEntity = (topicIndex) => {
        const allPapers = analysisPapers.filter((paper) =>
          paper.topics.map((a) => a[0]).includes(topicIndex)
        );
        const mainPapers = analysisPapers.filter(
          (paper) => paper.topics[0][0] === topicIndex
        );
        const positionX = x(
          mainPapers.reduce((s, a) => s + a.projection[0], 0) /
            mainPapers.length
        );
        const positionY = y(
          mainPapers.reduce((s, a) => s + a.projection[1], 0) /
            mainPapers.length
        );
        return {
          allPapers,
          topicIndex,
          mainPapers,
          positionX,
          positionY,
          color: topicColorScale[topicIndex],
        };
      };
      const anaHighTopicEntity = generateEntity(anaHighTopic);
      const anaHighTopicPaperDoiSet = new Set(
        anaHighTopicEntity.allPapers.map((paper) => paper.doi)
      );
      console.log(
        "anaHighTopicEntity",
        anaHighTopicEntity,
        anaHighTopicPaperDoiSet
      );
      const anaOtherEntities = d3
        .range(num_topics)
        .filter((a) => a !== anaHighTopic)
        .map((topicIndex) => generateEntity(topicIndex));
      anaOtherEntities.forEach((entity) => {
        entity.intersectionPapers = entity.allPapers.filter(
          (paper) => !anaHighTopicPaperDoiSet.has(paper)
        );
      });
      console.log("anaOtherEntities", anaOtherEntities);

      const entityR = d3
        .scaleLinear()
        .domain(
          d3.extent(
            [...anaOtherEntities, anaHighTopicEntity],
            (d) => d.allPapers.length
          )
        )
        .range([25, 40]);

      topicEntityG
        .append("g")
        .attr("id", "other-topics-g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .selectAll("circle")
        .data(anaOtherEntities)
        .join("circle")
        .attr("cx", (d) => d.positionX)
        .attr("cy", (d) => d.positionY)
        .attr("r", (d) => entityR(d.allPapers.length))
        .attr("fill", (d) => d.color);

      // const Link
    } else {
      // 被其他属性高亮
      contourG.selectAll("path").attr("opacity", 0.3).attr("stroke", "none");
      circlesG
        .selectAll("circle")
        .attr("opacity", (d) =>
          anaHighPapersDoiSet.has(d.doi) || d.doi === anaSelectHighlightPaperDoi
            ? 1
            : 0.3
        )
        .attr("stroke", (d) =>
          anaHighPapersDoiSet.has(d.doi) || d.doi === anaSelectHighlightPaperDoi
            ? "red"
            : "#fff"
        )
        .attr("stroke-width", (d) =>
          d.doi === anaSelectHighlightPaperDoi ? 4 : 2
        )
        .attr("r", (d) => (d.doi === anaSelectHighlightPaperDoi ? 9 : 6));
    }
  }, [anaHighPapers, anaFilterType, anaHighTopic, anaSelectHighlightPaperDoi]);

  const [num_topics_ing, set_num_topics_ing] = useState(num_topics);
  const handleChangeNumTopicsIng = (num) => {
    set_num_topics_ing(num);
  };
  return (
    <div className="projection-view">
      <svg id={svgId} width="100%" height="100%">
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
          </marker>
        </defs>
        <line
          x1="50"
          y1="250"
          x2="250"
          y2="50"
          stroke="#000"
          strokeWidth="5"
          markerEnd="url(#arrow)"
        />
      </svg>
      <div className="topics-number-input">
        <div className="topics-number-input-text">
          Topics Num: {num_topics_ing}
        </div>
        <Slider
          min={2}
          max={10}
          onAfterChange={setNumTopics}
          onChange={handleChangeNumTopicsIng}
          value={num_topics_ing}
        />
      </div>
    </div>
  );
});

export default ProjectView;

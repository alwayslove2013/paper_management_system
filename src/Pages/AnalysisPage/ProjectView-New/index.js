import React, { useState, useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { Slider } from "antd";
import { find_d } from "Common";
import { get } from "lodash";

const ProjectionView = observer(() => {
  const svgId = "ana-projection-map-svg";
  const store = useGlobalStore();
  const {
    drawProjectionFlag,
    analysisPapers,
    anaHighPapers,
    num_topics,
    resetProjectionFlag,
    setNumTopics,
    defaultHighColor,
    topicColorScale,
    anaFilterType,
    anaHighTopic,
    setAnaSelectHighlightPaperDoi,
    anaSelectHighlightPaperDoi,
    setHighEntityLinkData,
    anaHighEntityTopic,
    setAnaHighEntityTopic,
  } = store;
  const [num_topics_ing, set_num_topics_ing] = useState(num_topics);

  const clientRect = useClientRect({
    svgId,
  });
  const { width, height } = clientRect;
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

  // contour相关
  const contours = d3.range(num_topics).map(
    (topic_i) =>
      d3
        .contourDensity()
        .x((d) => x(d.projection[0]))
        .y((d) => y(d.projection[1]))
        .size([width, height])
        .bandwidth(30)
        .thresholds(35)(
        analysisPapers.filter((paper) =>
          paper.topics.map((topic) => topic[0]).includes(topic_i)
        )
      )[topic_i % 5]
  );
  const contourOpacity = (topicIndex) => {
    // return 1
    if (anaFilterType === "none") return 0.25;
    else if (anaFilterType !== "topic") return 0.1;
    else return topicIndex === anaHighTopic ? 0.36 : 0.1;
  };

  // paperCircle相关
  const paperCircleR = d3
    .scaleLinear()
    .domain([0, d3.max(analysisPapers, (d) => +d.citationCount)])
    .range([3, 15]);

  const paperCircleColor = (paper) => {
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
  const paperCircleOpacity = (paper) => {
    if (anaSelectHighlightPaperDoi === paper.doi) return 1;
    if (anaFilterType === "none") return 1;
    return anaHighPapers.map((paper) => paper.doi).includes(paper.doi)
      ? 0.8
      : 0.2;
  };
  const paperCircleStrokeWidth = (paper) => {
    if (anaSelectHighlightPaperDoi === paper.doi) return 6;
    if (anaFilterType === "none") return 1;
    if (anaFilterType === "topic") return 1;
    return anaHighPapers.map((paper) => paper.doi).includes(paper.doi) ? 3 : 1;
  };
  const paperCircleDasharray = (paper) => {
    if (anaSelectHighlightPaperDoi === paper.doi) return [4, 8];
    if (anaFilterType === "none" || anaFilterType === "topic") return "none";
    return anaHighPapers.map((paper) => paper.doi).includes(paper.doi)
      ? [5, 5]
      : "none";
  };
  const paperCircleStroke = (paper) => {
    if (anaSelectHighlightPaperDoi === paper.doi) return "red";
    if (anaFilterType === "none" || anaFilterType === "topic") return "#fff";
    else
      return anaHighPapers.map((paper) => paper.doi).includes(paper.doi)
        ? "#333"
        : "none";
  };

  // 主题Entity相关
  const generateEntity = (topicIndex) => {
    const allPapers = analysisPapers.filter((paper) =>
      paper.topics.map((a) => a[0]).includes(topicIndex)
    );
    const mainPapers = analysisPapers.filter(
      (paper) => paper.topics[0][0] === topicIndex
    );
    const positionX = x(
      mainPapers.reduce((s, a) => s + a.projection[0], 0) / mainPapers.length
    );
    const positionY = y(
      mainPapers.reduce((s, a) => s + a.projection[1], 0) / mainPapers.length
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
  const anaOtherEntities = d3
    .range(num_topics)
    .filter((a) => a !== anaHighTopic)
    .map((topicIndex) => generateEntity(topicIndex));
  anaOtherEntities.forEach((entity) => {
    entity.intersectionPapers = entity.allPapers.filter((paper) =>
      anaHighTopicPaperDoiSet.has(paper.doi)
    );
  });
  const entityR = d3
    .scaleLinear()
    .domain(
      d3.extent(
        [...anaOtherEntities, anaHighTopicEntity],
        (d) => d.allPapers.length
      )
    )
    .range([30, 45]);
  const getEntitySectorD = (entity) => {
    const angle =
      (2 * Math.PI * entity.intersectionPapers.length) /
      entity.allPapers.length;
    const r = entityR(entity.allPapers.length);
    const start = {
      x: entity.positionX,
      y: entity.positionY - r,
    };
    const end = {
      x: entity.positionX + Math.sin(angle) * r,
      y: entity.positionY - Math.cos(angle) * r,
    };
    return `M ${entity.positionX} ${entity.positionY}
          L ${start.x} ${start.y}
          A ${r} ${r} 0 0 1 ${end.x} ${end.y}
          Z
          `;
  };
  const entityOpacity = (entity) => {
    if (anaHighEntityTopic < 0) return 0.8;
    else return entity.topicIndex === anaHighEntityTopic ? 1 : 0.6;
  };

  // 主题间Link相关
  const topicLinks = anaOtherEntities.map((entity) => {
    const topicIndex = entity.topicIndex;
    const source = {
      x: entity.positionX,
      y: entity.positionY,
    };
    const target = {
      x: anaHighTopicEntity.positionX,
      y: anaHighTopicEntity.positionY,
    };

    const res = find_d(source.x, source.y, target.x, target.y, 25);
    const citeControlPoints = [
      {
        x: res.x_1_3_negative,
        y: res.y_1_3_negative,
      },
      {
        x: res.x_2_3_negative,
        y: res.y_2_3_negative,
      },
    ];
    const citedControlPoints = [
      {
        x: res.x_1_3_positive,
        y: res.y_1_3_positive,
      },
      {
        x: res.x_2_3_positive,
        y: res.y_2_3_positive,
      },
    ];
    const interPapers = entity.allPapers.filter((paper) =>
      anaHighTopicPaperDoiSet.has(paper.doi)
    );
    const interCount = interPapers.length;
    const interPapersDoiSet = new Set(interPapers.map((paper) => paper.doi));
    const independentPapers = entity.allPapers.filter(
      (paper) => !interPapersDoiSet.has(paper.doi)
    );
    const centralEntityIndependentPapers = anaHighTopicEntity.allPapers.filter(
      (paper) => !interPapersDoiSet.has(paper.doi)
    );

    const citeDoiSet = new Set(
      independentPapers.reduce((s, a) => s.concat(a.refList), [])
    );
    const citePapers = centralEntityIndependentPapers.filter((paper) =>
      citeDoiSet.has(paper.doi)
    );
    const citePapersDoiSet = new Set(citePapers.map((paper) => paper.doi));
    const citeLinkCount = independentPapers.reduce(
      (s, paper) =>
        s + paper.refList.filter((doi) => citePapersDoiSet.has(doi)).length,
      0
    );
    const citePaperCount = citePapers.length;

    const citeSourcePapers = independentPapers.filter(
      (paper) =>
        paper.refList.filter((doi) => citePapersDoiSet.has(doi)).length > 0
    );

    const citedDoiSet = new Set(
      centralEntityIndependentPapers.reduce((s, a) => s.concat(a.refList), [])
    );
    const citedPapers = independentPapers.filter((paper) =>
      citedDoiSet.has(paper.doi)
    );
    const citedPapersDoiSet = new Set(citedPapers.map((paper) => paper.doi));
    const citedLinkCount = centralEntityIndependentPapers.reduce(
      (s, paper) =>
        s + paper.refList.filter((doi) => citedPapersDoiSet.has(doi)).length,
      0
    );
    const citedPaperCount = citedPapers.length;

    return {
      topicIndex,
      source,
      target,
      citeControlPoints,
      citedControlPoints,
      independentPapers,
      interPapers,
      centralEntityIndependentPapers,
      citeDoiSet,
      citedDoiSet,
      interCount,
      citePapers,
      citePaperCount,
      citeLinkCount,
      citedPapers,
      citedPaperCount,
      citedLinkCount,

      citeSourcePapers,
      citePapersDoiSet,
    };
  });
  const _linkWidth = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(topicLinks, (d) =>
        d3.max([d.interCount, d.citeLinkCount, d.citedLinkCount])
      ),
    ])
    .range([5, 20]);
  const linkWidth = (weight) => (weight === 0 ? 0 : _linkWidth(weight));
  const topicLinkOpacity = (topicLink) => {
    if (anaHighEntityTopic < 0) return 0.7;
    else return topicLink.topicIndex === anaHighEntityTopic ? 1 : 0.3;
  };
  const handleClickLinks = (link) => {
    setAnaHighEntityTopic(link.topicIndex);
    setHighEntityLinkData(
      link.citeSourcePapers.map((paper) => paper.doi),
      link.citedPapers.map((paper) => paper.doi),
      link.centralEntityIndependentPapers.map((paper) => paper.doi)
    );
  };

  const mostCitedPapers = d3
    .sort([...anaHighPapers], (p) => +p.citationCount)
    .slice(anaFilterType === "topic" ? -3 : -8);
  const mostCitedPaperDoiSet = new Set(
    mostCitedPapers.map((paper) => paper.doi)
  );
  const labelFontS = d3
    .scaleLinear()
    .domain(d3.extent(mostCitedPapers, (p) => +p.citationCount))
    .range([16, 22])
    .clamp(true);

  const abbr = (paper) => {
    const author = get(paper, "authors[0]", "").split(" ").slice(-1);
    const conference = get(paper, "conferenceName", "");
    const year = `${get(paper, "year", "")}`.slice(-2);
    return mostCitedPaperDoiSet.has(paper.doi)
      ? `[${author}. ${conference}${year}]`
      : "";
  };

  return (
    <div className="projection-view">
      <svg id={svgId} width="100%" height="100%">
        <g id="topic-contours-g" strokeLinejoin="round" strokeWidth="1.5">
          {contours.map((contour, topicIndex) => (
            <>
              <path
                key={topicIndex}
                d={d3.geoPath()(contour)}
                fill={topicColorScale[topicIndex]}
                opacity={contourOpacity(topicIndex)}
                stroke={
                  topicIndex === anaHighTopic
                    ? "#111"
                    : topicColorScale[topicIndex]
                }
                strokeDasharray={topicIndex === anaHighTopic ? 5 : "none"}
              />
              <path
                key={`${topicIndex}-border`}
                d={d3.geoPath()(contour)}
                fill={"none"}
                opacity={1}
                stroke={topicColorScale[topicIndex]}
                strokeDasharray={5}
              />
            </>
          ))}
        </g>
        <g id="paper-circles-g" stroke="#fff">
          {analysisPapers.map((paper) => (
            <g
              key={paper.doi}
              transform={`translate(${x(paper.projection[0])}, ${y(
                paper.projection[1]
              )})`}
            >
              <circle
                r={
                  paperCircleR(+paper.citationCount) +
                  paperCircleStrokeWidth(paper)
                }
                fill={paperCircleColor(paper)}
                strokeLinecap="round"
                strokeWidth={paperCircleStrokeWidth(paper)}
                opacity={paperCircleOpacity(paper)}
                strokeDasharray={paperCircleDasharray(paper)}
                stroke={paperCircleStroke(paper)}
                cursor="pointer"
                onClick={() => setAnaSelectHighlightPaperDoi(paper.doi)}
              />
            </g>
          ))}
        </g>
        {anaFilterType === "topic" && (
          <>
            <g id="topic-links-g" strokeLinecap="round">
              {topicLinks.map((topicLink) => (
                <g
                  key={topicLink.topicIndex}
                  fill="none"
                  opacity={topicLinkOpacity(topicLink)}
                  cursor="pointer"
                  onClick={() => handleClickLinks(topicLink)}
                >
                  <path
                    className="cited"
                    stroke={topicColorScale[topicLink.topicIndex]}
                    strokeWidth={linkWidth(topicLink.citedLinkCount)}
                    d={`M${topicLink.source.x},${topicLink.source.y} 
                    C${topicLink.citedControlPoints[0].x},${topicLink.citedControlPoints[0].y}, 
                    ${topicLink.citedControlPoints[1].x},${topicLink.citedControlPoints[1].y}, 
                    ${topicLink.target.x},${topicLink.target.y}`}
                  />
                  <path
                    className="cite"
                    stroke={topicColorScale[anaHighTopic]}
                    strokeWidth={linkWidth(topicLink.citeLinkCount)}
                    d={`M${topicLink.target.x},${topicLink.target.y}
                    C${topicLink.citeControlPoints[1].x},${topicLink.citeControlPoints[1].y}, 
                    ${topicLink.citeControlPoints[0].x},${topicLink.citeControlPoints[0].y}, 
                    ${topicLink.source.x},${topicLink.source.y}`}
                  />
                </g>
              ))}
            </g>
            <g id="topic-entities-g">
              <g id="selected-topic-entity-g"></g>
              <g id="others-topic-entities-g" stroke="#fff" strokeWidth="3">
                {anaOtherEntities.map((entity) => (
                  <g key={entity.topicIndex} opacity={entityOpacity(entity)}>
                    <circle
                      cx={entity.positionX}
                      cy={entity.positionY}
                      r={entityR(entity.allPapers.length)}
                      fill={entity.color}
                    />
                    <path
                      fill={topicColorScale[anaHighTopic]}
                      d={getEntitySectorD(entity)}
                    />
                  </g>
                ))}
              </g>
            </g>
          </>
        )}
        <g id="paper-circles-lables-g" stroke="#fff">
          {analysisPapers.map((paper) => (
            <g
              key={paper.doi}
              transform={`translate(${x(paper.projection[0])}, ${y(
                paper.projection[1]
              )})`}
            >
              <text
                fontSize={labelFontS(+paper.citationCount)}
                fill="#333"
                stroke="none"
                textAnchor="middle"
                y="-10"
                opacity={0.9}
                pointerEvents="none"
              >
                {abbr(paper)}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="topics-number-input">
        <div className="topics-number-input-text">
          Topics Num: {num_topics_ing}
        </div>
        <Slider
          min={2}
          max={10}
          onAfterChange={setNumTopics}
          onChange={set_num_topics_ing}
          value={num_topics_ing}
        />
      </div>
    </div>
  );
});

export default ProjectionView;

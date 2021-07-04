import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import { get } from "lodash";
import * as d3 from "d3";

const TopicView = observer(() => {
  const store = useGlobalStore();
  const {
    topics_detail,
    topics_word_dis,
    topicColorScale,
    analysisPapers,
    anaHighPapers,
    anaFilterType,
    setAnaHighPapersByTopic,
    anaHighTopic,
    num_topics,
  } = store;
  const svgId = "topic-list-content-svg";
  const clientRect = useClientRect({ svgId });
  const { width, height } = clientRect;
  console.log(width, height);
  const columnWidth = width / num_topics;
  const paddingTop = 0.01;
  const wordsHeight = 0.85;
  const topicLableHeight = 1 - paddingTop - wordsHeight;
  const wordHeight = wordsHeight / get(topics_word_dis, `[0].length`, 1);

  const fontSize = d3
    .scaleLinear()
    .domain([
      d3.min(topics_word_dis.map((topics) => d3.min(topics, (d) => d[1]))),
      d3.max(topics_word_dis.map((topics) => d3.max(topics, (d) => d[1]))),
    ])
    .range([wordHeight * 0.4 * height, wordHeight * 1.1 * height]);

  return (
    <div className="topic-list-view">
      <div className="topic-list-header">Topics List</div>
      <div className="topic-list-content">
        <svg id={svgId} width="100%" height="100%">
          <g
            className="topic-list-words"
            transform={`translate(0, ${height * paddingTop})`}
            textAnchor="middle"
          >
            {topics_word_dis.map((topic_dis, i) => (
              <g
                className="topic-list-words-column"
                key={i}
                transform={`translate(${columnWidth * (i + 0.5)}, 0)`}
              >
                {topic_dis.map((topic, j) => (
                  <g
                    className="topic-list-word"
                    key={j}
                    transform={`translate(0, ${wordHeight * height * (j + 1)})`}
                  >
                    <text fontSize={fontSize(topic[1])} fill="#333">
                      {topic[0]}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </g>
          <g
            className="topic-list-topics"
            transform={`translate(0, ${height * (paddingTop + wordsHeight)})`}
          ></g>
        </svg>
      </div>
    </div>
  );
});

export default TopicView;

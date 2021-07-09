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
    // topics_detail,
    topics_word_dis,
    topicColorScale,
    // analysisPapers,
    // anaHighPapers,
    anaFilterType,
    // setAnaHighPapersByTopic,
    anaHighTopic,
    setAnaHighPapersByTopic,
    num_topics,
  } = store;
  const svgId = "topic-list-content-svg";
  const clientRect = useClientRect({ svgId });
  const { width, height } = clientRect;
  const columnWidth = width / num_topics;
  const paddingTop = 0.01;
  const wordsHeight = 0.85;
  const topicLableTop = 0.02;
  // const topicLableHeight = 1 - paddingTop - wordsHeight;
  const wordHeight = wordsHeight / get(topics_word_dis, `[0].length`, 1);

  const fontSize = d3
    .scaleLinear()
    .domain([
      d3.min(topics_word_dis.map((topics) => d3.min(topics, (d) => d[1]))),
      d3.max(topics_word_dis.map((topics) => d3.max(topics, (d) => d[1]))),
      // 10, 20,
    ])
    .range([wordHeight * 0.45 * height, wordHeight * 1.1 * height])
    .clamp(true);

  // const min_topics = [
  //   [
  //     "visual",
  //     "data",
  //     "analysi",
  //     "user",
  //     "interact",
  //     "explor",
  //     "media",
  //     "analyt",
  //     "pattern",
  //     "social",
  //   ],
  //   [
  //     "visual",
  //     "data",
  //     "graph",
  //     "interact",
  //     "user",
  //     "system",
  //     "pattern",
  //     "traffic",
  //     "analysi",
  //     "propos",
  //   ],
  //   [
  //     "data",
  //     "visual",
  //     "flow",
  //     "parallel",
  //     "feature",
  //     "particl",
  //     "volum",
  //     "method",
  //     "propos",
  //     "trace",
  //   ],
  //   [
  //     "pm2",
  //     "stream",
  //     "5",
  //     "visual",
  //     "volume",
  //     "transfer",
  //     "model",
  //     "function",
  //     "event",
  //     "seismic",
  //   ],
  // ];

  // const min_topics_2 = [
  //   [
  //     "visual",
  //     "topic",
  //     "paper",
  //     "citat",
  //     "user",
  //     "data",
  //     "analysi",
  //     "literatur",
  //     "collect",
  //     "use",
  //   ],
  //   [
  //     "visual",
  //     "document",
  //     "topic",
  //     "inform",
  //     "collect",
  //     "paper",
  //     "use",
  //     "set",
  //     "analysi",
  //     "text",
  //   ],
  //   [
  //     "visual",
  //     "influenc",
  //     "graph",
  //     "cluster",
  //     "map",
  //     "citat",
  //     "use",
  //     "can",
  //     "network",
  //     "summar",
  //   ],
  //   [
  //     "visual",
  //     "network",
  //     "data",
  //     "interact",
  //     "research",
  //     "inform",
  //     "explor",
  //     "dynam",
  //     "analysi",
  //     "citat",
  //   ],
  // ];

  // const topicDis_map = {
  //   social: 9,
  //   media: 8,
  //   user: 5,
  //   graph: 5,
  //   traffic: 9,
  //   interact: 6,
  //   parallel: 6,
  //   volum: 7,
  //   trace: 5,
  //   flow: 4,
  //   transfer: 4,
  //   model: 3,
  //   function: 4,
  //   event: 5,
  //   topic: 9,
  //   literatur: 8,
  //   analysi: 6,
  //   citat: 5,
  //   text: 7,
  //   document: 4,
  //   influenc: 8,
  //   network: 8,
  //   dynam: 8,
  //   interact: 5
  // };

  // const fakeSize = (word) => {
  //   if (word in topicDis_map)
  //     return 10 + topicDis_map[word] + Math.random() * 5;
  //   else return 10 + Math.random() * 5;
  // };

  return (
    <div className="topic-list-view">
      <div className="topic-list-header">Topic List</div>
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
                opacity={
                  anaFilterType === "topic" && anaHighTopic !== i ? 0.2 : 1
                }
              >
                {topic_dis.map((topic, j) => (
                  <g
                    className="topic-list-word"
                    key={j}
                    transform={`translate(0, ${wordHeight * height * (j + 1)})`}
                  >
                    <text fontSize={fontSize(topic[1])} fill="#333">
                      {/* <text fontSize={fakeSize(min_topics_2[i][j])} fill="#333">
                      {min_topics_2[i][j]} */}
                      {topic[0]}
                      {/* {min_topics_2[i][j]} */}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </g>
          <g
            className="topic-list-topics-label"
            transform={`translate(0, ${
              height * (paddingTop + wordsHeight + topicLableTop)
            })`}
          >
            {d3.range(num_topics).map((i) => (
              <g
                className="topic-list-topic-label"
                transform={`translate(${columnWidth * (i + 0.5)}, 0)`}
                onClick={() => setAnaHighPapersByTopic(i)}
                opacity={
                  anaFilterType === "topic" && anaHighTopic !== i ? 0.2 : 1
                }
              >
                <rect
                  x={-columnWidth * 0.25}
                  y={fontSize(30) * 0.1}
                  width={columnWidth * 0.5}
                  height={fontSize(30) * 0.95}
                  fill={topicColorScale[i]}
                />
                <text
                  fontSize={fontSize(30) * 0.5}
                  fill="#fff"
                  textAnchor="middle"
                  x="0"
                  y={fontSize(30) * 0.77}
                >
                  Topic {i + 1}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
});

export default TopicView;

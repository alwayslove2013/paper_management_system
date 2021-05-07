import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";

const TopicView = observer(() => {
  const store = useGlobalStore();
  const {
    topics_detail,
    topicColorScale,
    analysisPapers,
    anaHighPapers,
    anaFilterType,
  } = store;
  return (
    <div className="topic-list-view">
      <div className="topic-list-header">Topics List</div>
      <div className="topic-list-content">
        {topics_detail.map((topic, i) => (
          <TopicItem
            topic={topic}
            index={i + 1}
            key={i}
            color={topicColorScale[i]}
            isHighlight={anaFilterType !== 'none'}
            all={
              analysisPapers.filter((paper) =>
                paper.topics.map((a) => a[0]).includes(i)
              ).length
            }
            highlight={
              anaHighPapers.filter((paper) =>
                paper.topics.map((a) => a[0]).includes(i)
              ).length
            }
          />
        ))}
      </div>
    </div>
  );
});

const TopicItem = ({ topic, index, color, isHighlight, all, highlight }) => {
  const style = {
    background: color,
  };
  return (
    <div className="topic-item" style={style}>
      <div className="topic-header">
        <div className="topic-index">Topic {index}</div>
        <div className="topic-number">
          {isHighlight ? `${highlight} / ${all}` : all}
        </div>
      </div>
      <div className="topic-detail">{topic.join(", ")}</div>
    </div>
  );
};

export default TopicView;

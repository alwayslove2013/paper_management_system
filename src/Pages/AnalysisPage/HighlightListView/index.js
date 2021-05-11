import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";

const HighlightListView = observer(() => {
  const store = useGlobalStore();
  const {
    anaSelectHighlightPaperDoi,
    anaHighPapers,
    setAnaSelectHighlightPaper,
  } = store;
  return (
    <div className="highlight-list-view">
      <div className="highlight-list-header">
        Highlight Papers
        {/* {anaHighPapers.length} / {analysisPapers.length} */}
      </div>
      <div className="highlight-list-content">
        {anaHighPapers.map((paper, index) => (
          <PaperItem
            key={paper.doi}
            paper={paper}
            index={index}
            handleClick={setAnaSelectHighlightPaper}
            isSelected={paper.doi === anaSelectHighlightPaperDoi}
          />
        ))}
      </div>
    </div>
  );
});

const PaperItem = ({
  paper,
  index,
  handleClick = () => {},
  isSelected = false,
}) => (
  <div
    className={`paper-item ${isSelected ? "paper-item-selected" : ""}`}
    onClick={() => handleClick(paper.doi)}
  >
    <div className="paper-index">{index + 1}.</div>
    <div className="paper-content">
      <div className="paper-header">
        <div className="paper-header-conferenceName">
          {paper.conferenceName}
        </div>
        <div className="paper-header-title">{paper.title}</div>
      </div>
      <div className="paper-details">
        {paper.authors.join("; ")} ({paper.year})
      </div>
      <div className="paper-tags">
        {[...paper.keywords, ...paper.publicTags, ...paper.privateTags].join(
          "; "
        )}
      </div>
    </div>
  </div>
);

export default HighlightListView;

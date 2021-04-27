import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";

const HighlightListView = observer(() => {
  const store = useGlobalStore();
  const { anaHighPapers, setAnaSelectHighlightPaper } = store;
  return (
    <div className="highlight-list-view">
      {anaHighPapers.map((paper, index) => (
        <PaperItem key={paper.doi} paper={paper} index={index} handleClick={setAnaSelectHighlightPaper}/>
      ))}
    </div>
  );
});

const PaperItem = ({ paper, index, handleClick = () => {} }) => (
  <div className="paper-item" onClick={() => handleClick(paper)}>
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

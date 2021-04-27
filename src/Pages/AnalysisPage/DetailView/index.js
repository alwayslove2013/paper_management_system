import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";

const DetaiView = observer(() => {
  const store = useGlobalStore();
  const { anaSelectHighlightPaper } = store;
  const {
    conferenceName = "",
    year = "",
    title = "",
    authors = [],
    keywords = [],
    abstract = "",
  } = anaSelectHighlightPaper;
  return anaSelectHighlightPaper.title ? (
    <div className="detail-paper-view">
      <div className="paper-title">{title}</div>
      <div className="paper-details">
        {authors.join("; ")}
        <span className="paper-header">
          {year && `(${conferenceName} ${year})`}
        </span>
      </div>
      <div className="paper-info">
        <span className="paper-info-title">Keywords:</span>
        <span className="paper-info-content">{keywords.join("; ")}</span>
      </div>
      <div className="paper-info">
        <span className="paper-info-title">Abstract:</span>
        <span className="paper-info-content">{abstract}</span>
      </div>
    </div>
  ) : (
    <div />
  );
});

export default DetaiView;

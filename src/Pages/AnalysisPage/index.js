import React, { useEffect } from "react";
import { useGlobalStore } from "Store";
import "./index.scss";
import TagView from "./TagView";
import ProjectView from "./ProjectView";
import NetworkView from "./NetworkView";
import TopicView from "./TopicView";
import HighlightListView from "./HighlightListView";
import DetailView from "./DetailView";

const AnalysisPage = () => {
  const store = useGlobalStore();
  useEffect(() => {
    store.setCurrentPage();
    store.initPapers();
    store.initUserId();
  }, []);
  return (
    <div className="analysis-container">
      <div className="left-container">
        <TagView />
      </div>
      <div className="middle-container">
        <div className="middle-top-container">
          <ProjectView />
        </div>
        <div className="middle-bottom-container">
          <NetworkView />
        </div>
      </div>
      <div className="right-container">
        <div className="right-top-container">
          <TopicView />
        </div>
        <div className="right-middle-container">
          <HighlightListView />
        </div>
        <div className="right-bottom-container">
          <DetailView />
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;

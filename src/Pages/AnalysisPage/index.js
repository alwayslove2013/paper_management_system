import React, { useEffect } from "react";
import { useGlobalStore } from "Store";
import "./index.scss";
// import TagView from "./TagView";
// import TagView from "./TagView-Hor";
import ProjectView from "./ProjectView-New";
import NetworkView from "./NetworkView-New";
// import TopicView from "./TopicView";
import TopicView from "./TopicView-New";
// import HighlightListView from "./HighlightListView";
// import DetailView from "./DetailView";
import StatisticsView from "./StatisticsView";
import PapersTable from "./PapersTable";

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
        {/* <TagView /> */}  
        <StatisticsView />
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
        {/* <div className="right-middle-container">
          <HighlightListView />
        </div>
        <div className="right-bottom-container">
          <DetailView /> 
        </div> */}
        <div className="right-middle-bottom-container">
          <PapersTable />
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;

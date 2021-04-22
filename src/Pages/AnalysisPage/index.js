import React, { useEffect } from "react";
import { useGlobalStore } from "../../Store";
import "./index.scss"
import { observer } from "mobx-react-lite";
import TagView from "./TagView"

const AnalysisPage = observer(() => {
  const store = useGlobalStore();
  const { analysisPapers } = store;
  useEffect(() => {
    store.initUserId();
    store.setCurrentPage();
  }, []);
  return (
    <div className="analysis-container">
      <div className="left-container">
        <TagView />
      </div>
      <div className="middle-container"></div>
      <div className="right-container"></div>
    </div>
  );
});

export default AnalysisPage;

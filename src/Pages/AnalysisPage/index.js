import React, { useEffect } from "react";
import { useGlobalStore } from "../../Store";
import "./index.scss"
import { observer } from "mobx-react-lite";

const AnalysisPage = observer(() => {
  const store = useGlobalStore();
  const { analysisPapers } = store;
  useEffect(() => {
    store.setCurrentPage();
  }, []);
  return (
    <div className="analysis-container">
      {analysisPapers.map((paper) => (
        <div key={paper.doi}>{paper.doi}</div>
      ))}
    </div>
  );
});

export default AnalysisPage;

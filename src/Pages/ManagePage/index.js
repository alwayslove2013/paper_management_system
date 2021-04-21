import React, { useEffect } from "react";
import { useGlobalStore } from "../../Store";
import { getPapers } from "../../Server";

import ControlView from "./ControlView";
import UnitView from "./UnitView";
import DetailView from "./DetailView";

const ManagePage = () => {
  const store = useGlobalStore();
  useEffect(() => {
    const fetchPapers = async () => {
      // const papers = await d3.csv("all_papers_data_0302.csv");
      const papers = await getPapers();
      await store.setPapers(papers);

      store.initUserId();
    };
    store.setCurrentPage();
    fetchPapers();
  }, [store]);
  return (
    <div className="main-container">
      <div className="control-main-container">
        <div className="control-view-container">
          <ControlView />
        </div>
        <div className="unit-view-container">
          <UnitView />
        </div>
      </div>
      <div className="detail-view-container">
        <DetailView />
      </div>
    </div>
  );
};

export default ManagePage;

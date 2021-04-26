import React, { useEffect } from "react";
import { useGlobalStore } from "Store";

import ControlView from "./ControlView";
import UnitView from "./UnitView";
import DetailView from "./DetailView";

const ManagePage = () => {
  const store = useGlobalStore();
  useEffect(() => {
    store.setCurrentPage();
    store.initPapers();
    store.initUserId();
  }, []);
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

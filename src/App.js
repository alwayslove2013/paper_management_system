import "./App.scss";
import { StoreProvider, useGlobalStore } from "./Store";
// import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import * as d3 from "d3";
import ControlView from "./Views/ControlView";
import UnitView from "./Views/UnitView";
import DetailView from "./Views/DetailView";
import Header from "./Views/Header";

function App() {
  return (
    <StoreProvider>
      <ViewContainer />
    </StoreProvider>
  );
}

export default App;

// init data
const ViewContainer = () => {
  const store = useGlobalStore();
  useEffect(() => {
    const fetchPapers = async () => {
      const papers = await d3.csv("data.csv");
      await store.setPapers(papers);
      store.initUserId();
    };
    fetchPapers();
  }, [store]);
  return (
    <div className="view-container">
      <div className="header-container">
        <Header />
      </div>
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
    </div>
  );
};

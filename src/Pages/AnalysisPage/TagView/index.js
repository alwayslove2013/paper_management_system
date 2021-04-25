import React, { useState } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import TagFilter from "./TagFilter";
import TimeLine from "./TimeLine";
// import { toJS } from "mobx";

const TagView = observer(() => {
  const store = useGlobalStore();
  const {
    // controlTagNameList,
    // unitXAttr,
    // unitXAttrList,
    // analysisPapers,
    // anaHighPapers,
    // clearBrushTrigger,
    setClearBrushTrigger,
    anaTimeData,
    anaTagViewData,
    setAnaHighPapersByYear,
    anaFilterType,
    setAnaFilterType,
  } = store;
  // console.log("anaTagViewData", toJS(anaTagViewData));
  // console.log("ClearBrushTrigger", clearBrushTrigger);
  const [yearSelecting, setYearSelecting] = useState([0, 0]);
  // const [yearSelected, setYearSelected] = useState([0, 0]);
  return (
    <div className="tag-view-container">
      <>
        {anaTagViewData.map((tagViewData) => (
          <div className="tag-filter-container" key={tagViewData.title}>
            <div className="tag-filter-label">{tagViewData.title}</div>
            <div className="tag-filter-div">
              <TagFilter title={tagViewData.title} data={tagViewData.data} />
            </div>
          </div>
        ))}
        <div className="tag-filter-container">
          <div className="year-seleted-text">{yearSelecting.join("-")}</div>
          <div className="time-line-div">
            {anaTimeData.length > 0 && <TimeLine
              data={anaTimeData}
              onInput={setYearSelecting}
              onChange={setAnaHighPapersByYear}
              setClearBrushTrigger={setClearBrushTrigger}
              setAnaFilterType={setAnaFilterType}
              anaFilterType={anaFilterType}
            />}
          </div>
        </div>
      </>
    </div>
  );
});

export default TagView;

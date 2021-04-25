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
  } = store;
  // console.log("anaTagViewData", toJS(anaTagViewData));
  // console.log("ClearBrushTrigger", clearBrushTrigger);
  const [yearSelecting, setYearSelecting] = useState([0, 0]);
  const [yearSelected, setYearSelected] = useState([0, 0]);
  return (
    <div className="tag-view-container">
      <>
        {/* {controlTagNameList.map((category) => (
          <div className="tag-filter-container" key={category.value}>
            <TagFilter category={category} key={category.value} />
          </div>
        ))} */}
        {anaTagViewData.map((tagViewData) => (
          <div className="tag-filter-container" key={tagViewData.title}>
            <div>{tagViewData.title}</div>
            <TagFilter title={tagViewData.title} data={tagViewData.data} />
          </div>
        ))}
        <div className="tag-filter-container">
          <div className="year-seleted-text">{yearSelecting.join("-")}</div>
          <div className="time-line-div">
            <TimeLine
              data={anaTimeData}
              onInput={setYearSelecting}
              onChange={setYearSelected}
              setClearBrushTrigger={setClearBrushTrigger}
            />
          </div>
        </div>
      </>
    </div>
  );
});

export default TagView;

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
    controlTagNameList,
    // unitXAttr,
    // unitXAttrList,
    // analysisPapers,
    // anaHighPapers,
    clearBrushTrigger,
    setClearBrushTrigger,
    anaTimeData,
  } = store;
  // console.log("ClearBrushTrigger", clearBrushTrigger);
  const [yearSelecting, setYearSelecting] = useState([0, 0]);
  const [yearSelected, setYearSelected] = useState([0, 0]);
  return (
    <div className="tag-view-container">
      <>
        {controlTagNameList.map((category) => (
          <div className="tag-filter-container" key={category.value}>
            <TagFilter category={category} key={category.value} />
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

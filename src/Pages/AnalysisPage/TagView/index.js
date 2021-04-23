import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "../../../Store";
import TagFilter from "./TagFilter";
import TimeLine from "./TimeLine";

const TagView = observer(() => {
  const store = useGlobalStore();
  const {
    controlTagNameList,
    // unitXAttr,
    unitXAttrList,
    analysisPapers,
    anaHighPapers,
  } = store;
  const timeList = unitXAttrList.map((a) => +a).sort();
  const timeData = timeList.map((year) => ({
    x: year,
    all: analysisPapers.filter((paper) => +paper.year === year).length,
    highligh: anaHighPapers.filter((paper) => +paper.year === year).length,
  }));
  // console.log("===>controlTagNameList", controlTagNameList, timeList, timeData);
  // const
  return (
    <div className="tag-view-container">
      <>
        {controlTagNameList.map((category) => (
          <div className="tag-filter-container" key={category.value}>
            <TagFilter category={category} key={category.value} />
          </div>
        ))}
        <div className="tag-filter-container">
          <TimeLine data={timeData}/>
        </div>
      </>
    </div>
  );
});

export default TagView;

import React, { memo, useState } from "react";
import "./index.scss";
import TimeLine from "Components/TimeLine";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import TagFilter from "./TagFilter";

const TagView = observer(() => {
  const store = useGlobalStore();
  const {
    analysisPapers,
    anaHighPapers,
    setClearBrushTrigger,
    anaTimeData,
    anaTagViewData,

    setAnaHighPapersByYear,
    setAnaHighPapersByTag,
    anaFilterType,
    setAnaFilterType,
  } = store;
  const [yearSelecting, setYearSelecting] = useState([0, 0]);
  return (
    <div className="tag-view-container">
      <div className="tag-header">
        <div className="analysis-paper-count">
          <AnaPaperCount
            isAll={anaFilterType === "none"}
            allCount={analysisPapers.length}
            highlightCount={anaHighPapers.length}
          />
        </div>
        <div className="selected-highlight-attr">keywords - ppp</div>
      </div>
      <div className="tag-highlight-tabs-container">
        <TagFilter
          dataSource={anaTagViewData}
          onChange={setAnaHighPapersByTag}
          // setChangeType={setAnaFilterType}
          anaFilterType={anaFilterType}
        />
      </div>
      <div className="tag-time-line">
        <div className="year-seleted-text">{yearSelecting.join("-")}</div>
        <div className="time-line-div">
          {anaTimeData.length > 0 && (
            <TimeLine
              data={anaTimeData}
              onInput={setYearSelecting}
              onChange={setAnaHighPapersByYear}
              setClearBrushTrigger={setClearBrushTrigger}
              setAnaFilterType={setAnaFilterType}
              anaFilterType={anaFilterType}
            />
          )}
        </div>
      </div>
    </div>
  );
});

const AnaPaperCount = memo(({ isAll, allCount, highlightCount = 0 }) =>
  isAll ? (
    <span className="paper-all-count">Papers: {allCount}</span>
  ) : (
    <>
      <span className="paper-all-count">Papers: </span>
      <span className="paper-highlight-count highlight-blue">
        {highlightCount}
      </span>
      <span className="paper-all-count">&nbsp;/&nbsp;{allCount}</span>
    </>
  )
);

export default TagView;

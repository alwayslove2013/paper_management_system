import React from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";

const HoverTooltip = observer(() => {
  const store = useGlobalStore();
  const width = document.querySelector("body").clientWidth;
  const height = document.querySelector("body").clientHeight;
  const {
    anaHoverPaperDoi,
    anaHoverPaperPositionX,
    anaHoverPaperPositionY,
    anaHoverPaper,
  } = store;
  const attrs = [
    {
      label: "Keywords",
      showText: (paper) => paper.keywords.join("; "),
    },
    // {
    //   label: "Affiliation",
    //   showText: (paper) => paper.affiliation,
    // },
    {
      label: "Abstract",
      showText: (paper) => paper.abstract,
    },
    // {
    //   label: "",
    //   showText: (paper) => paper,
    // },
    // {
    //   label: "",
    //   showText: (paper) => paper,
    // },
  ];
  const style = {
    left: anaHoverPaperPositionX - 20,
    top: anaHoverPaperPositionY + 30,
  };
  return anaHoverPaperDoi.length === 0 ? (
    <div className="ana-hover-tooltip-container"></div>
  ) : (
    <div className="ana-hover-tooltip-container" style={style}>
      <div className="ana-tooltip-header">
        <div className="ana-tooltip-title">{anaHoverPaper.title}</div>
        <div className="ana-tooltip-authors-venue-year">
          {anaHoverPaper.authors.join("; ")} ({anaHoverPaper.conferenceName}{" "}
          {anaHoverPaper.year})
        </div>
      </div>
      <div className="ana-tooltip-content">
        {attrs.map((attr) => (
          <div className="ana-tooltip-content-row" key={attr.label}>
            <span className="ana-tooltip-row-label">{attr.label}:</span>
            <span className="ana-tooltip-row-text">
              {attr.showText(anaHoverPaper)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default HoverTooltip;

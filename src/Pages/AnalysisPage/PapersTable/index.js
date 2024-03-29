import React, { useState } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { Table, Tag, Space } from "antd";
import { get } from "lodash";
import { toJS } from "mobx";

const PapersTable = observer(() => {
  const store = useGlobalStore();
  const {
    analysisPapers,
    anaHighPapers,
    anaFilterType,
    anaHighTag,
    anaHighTopic,
    anaSelectHighlightPaperDoi,
    setAnaSelectHighlightPaperDoi,
    setAnaHoverPaperDoi,
    removeHoverPaperDoi,
  } = store;
  const [sortAttr, setSortAttr] = useState("year");
  const [order, setOrder] = useState(1);
  const papers = [...anaHighPapers].sort(
    (a, b) => order * (+a[sortAttr] - +b[sortAttr])
  );
  // const papers = [
  //   ...anaHighPapers.filter(
  //     (paper) => paper.doi === anaSelectHighlightPaperDoi
  //   ),
  //   ...[
  //     ...anaHighPapers.filter(
  //       (paper) => paper.doi !== anaSelectHighlightPaperDoi
  //     ),
  //   ].sort((a, b) => order * (+a[sortAttr] - +b[sortAttr])),
  // ];
  const handleClick = (attr) => {
    if (attr === sortAttr) setOrder(order * -1);
    else setSortAttr(attr);
  };
  const columns = [
    {
      title: "Title",
      showText: (paper) => paper.title,
      style: {
        width: "50%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      onClick: () => {},
    },
    {
      title: "Authors",
      showText: (paper) => get(paper, "authors[0]", ""),
      style: {
        width: "22%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
      },
      onClick: () => {},
    },
    {
      title: "Venue",
      showText: (paper) => get(paper, "conferenceName", ""),
      style: {
        width: "13%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
      },
      onClick: () => {},
    },
    {
      title: "Year",
      showText: (paper) => paper.year,
      style: {
        width: "10%",
        display: "flex",
        justifyContent: "center",
      },
      onClick: () => handleClick("year"),
    },
    {
      title: "Cite",
      showText: (paper) => paper.citationCount,
      style: {
        width: "7%",
        display: "flex",
        justifyContent: "center",
        border: "none",
      },
      onClick: () => handleClick("citationCount"),
    },
  ];

  const allCount = analysisPapers.length;
  const highlightCount = anaHighPapers.length;
  const handleClickPaperRow = (paper) =>
    setAnaSelectHighlightPaperDoi(paper.doi);

  const handleHover = (e, doi) => {
    const { clientX, clientY } = e;
    setAnaHoverPaperDoi(clientX, clientY, doi);
  };

  return (
    <div className="papers-table-container">
      <div className="papers-table-title">
        <div>
          Paper List (
          {`${anaFilterType === "none" ? "" : `${highlightCount}/`}${allCount}`}
          )
        </div>
        {anaFilterType === "none" || (
          <div style={{ marginRight: 10 }}>
            {anaHighTag}
          </div>
        )}
      </div>
      <div className="papers-table-content">
        <div className="papers-table-header">
          {columns.map((column) => (
            <div
              className="papers-table-header-column"
              style={column.style}
              onClick={column.onClick}
            >
              {column.title}
            </div>
          ))}
        </div>
        <div className="papers-table-rows-container">
          {papers.map((paper) => (
            <div
              key={paper.doi}
              className={`papers-table-row ${
                anaSelectHighlightPaperDoi === paper.doi
                  ? "papers-table-row-active"
                  : ""
              }`}
              onClick={() => handleClickPaperRow(paper)}
              onMouseEnter={(e) => handleHover(e, paper.doi)}
              onMouseLeave={removeHoverPaperDoi}
            >
              {columns.map((column) => (
                <div className="papers-table-column" style={column.style}>
                  {column.showText(paper)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PapersTable;

import React, { memo, useState } from "react";
import "./index.scss";
import { Tabs } from "antd";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { anaSvgPadding } from "Common";

const { TabPane } = Tabs;

const TagFilter = memo(({ dataSource, anaFilterType, onChange }) => {
  return (
    <Tabs
    // defaultActiveKey={currentTab}
    // onChange={setCurrentTab}
    >
      {dataSource.map((data) => (
        <TabPane key={data.label} tab={data.label}>
          <HorizontalBar
            {...data}
            isHighlight={anaFilterType !== "none"}
            onChange={onChange}
          />
        </TabPane>
      ))}
    </Tabs>
  );
});

const HorizontalBar = ({ value, data, isHighlight, onChange }) => {
  // console.log(label, value, data);
  const divId = `tag-filter-${value}`;
  // const clientRect = useClientRect({ svgId: divId });
  // const { width = 0 } = clientRect;
  const barHeight = 16;

  data = data.filter((d) => d.all > 0).sort((a, b) => b.all - a.all);
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.all)])
    .nice()
    .range([0, 90]);

  return (
    <div id={divId}>
      {data.map((d) => (
        <div
          className="tag-bar-row"
          key={d.label}
          onClick={() =>
            onChange({
              anaHighCate: value,
              anaHighTag: d.label,
            })
          }
        >
          <div className="tag-label single-row">
            {d.label === "Usa" ? "USA" : d.label}
          </div>
          <div className="tag-bar-container">
            <div
              className="tag-bar bar"
              style={{ width: `${x(d.all)}%`, height: barHeight }}
            />
            {isHighlight && (
              <div
                className="active-tag-bar highlight-bar-blue bar"
                style={{ width: `${x(d.highlight)}%`, height: barHeight }}
              />
            )}
          </div>
          <div className="tag-count">
            {isHighlight && (
              <div className="tag-count-highlight highlight-blue">
                {d.highlight}
                &nbsp;/&nbsp;
              </div>
            )}
            <div>{d.all}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TagFilter;

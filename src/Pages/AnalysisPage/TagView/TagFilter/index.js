import React, {useEffect} from "react";
import "./index.scss";
import * as d3 from "d3";

const TagFilter = ({ title = "title", data = [], setHighTag = () => {} }) => {
  useEffect(() => {}, [])
  
  return <svg id={`ana-tag-filter-svg-${title}`} width="100%" height="100%" />;
};

export default TagFilter;

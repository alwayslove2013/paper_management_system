import React from "react";
import "./index.scss";
import { useGlobalStore } from "../../Store";
import { debounce } from "lodash";
import {SearchOutlined} from '@ant-design/icons'

const SearchView = ({ searchAttr }) => {
  const handleInput = debounce((e) => {
    console.log("===>", e.target.value);
  }, 200);
  return (
    <div>
      <input onInput={handleInput} />
      <SearchOutlined />
    </div>
  );
};

export default SearchView;

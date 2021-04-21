import React from "react";
import "./index.scss";
import { useGlobalStore } from "../../../Store";
import { debounce } from "lodash";
import { SearchOutlined } from "@ant-design/icons";
// import {observer} from "mobx-react-lite";

const SearchView = () => {
  const store = useGlobalStore();
  // const { searchPaperDoiSet } = store;
  // console.log("=====> searchPaperDoiSet", searchPaperDoiSet);
  const handleInput = debounce((e) => {
    // console.log("===>", e.target.value);
    store.setTitleSearch(e.target.value);
  }, 200);
  return (
    <div className="search-view">
      <div className="search-view-input">
        <input onInput={handleInput} />
      </div>

      <div className="search-view-icon">
        <SearchOutlined />
      </div>
    </div>
  );
};

export default SearchView;

import React, { useState, useEffect } from "react";
import "./index.scss";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

const ControlView = observer(() => {
  const store = useGlobalStore();
  const { controlTagNameList } = store;
  return (
    <div className="control-view">
      {controlTagNameList.map((tag) => (
        <ControlItem key={tag.label} tagData={tag} />
      ))}
    </div>
  );
});

export default ControlView;

const ControlItem = observer(({ tagData }) => {
  const store = useGlobalStore();
  const { tag2color } = store;

  const [tags, setTags] = useState([]);
  const handleClickOption = (value) => {
    const currentTags = [...tags];
    const index = currentTags.indexOf(value);
    if (index > -1) {
      currentTags.splice(index, 1);
      store.setTagColor(value, tagData.value);
      setTags(currentTags);
    } else {
      currentTags.push(value);
      store.setTagColor(value, tagData.value);
      setTags(currentTags);
    }
  };

  return (
    <div className="control-item">
      <div className="control-item-title">{tagData.label}</div>
      <div className="control-item-options">
        {tagData.list.map((item) => (
          <ControlOption
            key={item}
            value={item}
            clickOption={handleClickOption}
            isSelect={tags.indexOf(item) > -1 && tag2color[item]}
          />
        ))}
      </div>
    </div>
  );
});

const ControlOption = ({ value, clickOption, isSelect }) => {
  const className = ["control-item-option", isSelect && "option-active"]
    .filter((a) => a)
    .join(" ");
  const style = isSelect
    ? { background: isSelect, border: `1px solid ${isSelect}` }
    : {};
  return (
    <div className={className} onClick={() => clickOption(value)} style={style}>
      {value}
    </div>
  );
};

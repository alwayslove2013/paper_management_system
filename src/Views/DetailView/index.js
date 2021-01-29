import React, { useState, useRef } from "react";
import "./index.scss";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { get } from "lodash";
import { Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { Tag, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toJS } from "mobx";

const debug = true;

const DetailView = observer(() => {
  const store = useGlobalStore();
  const { currentSelectedPaper, setPaper } = store;
  const paper = currentSelectedPaper;
  debug && console.log("currentSelectedPaper", toJS(currentSelectedPaper));
  if (!currentSelectedPaper) {
    return <div></div>;
  }

  const doi = get(paper, "DOI", "");

  const editTags = [
    {
      title: "Private Tags",
      value: "privateTags",
      initTags: get(paper, "privateTags", []),
    },
    {
      title: "Public Tags",
      value: "publicTags",
      initTags: get(paper, "publicTags", []),
    },
  ];
  const handleChangeTags = (attr, value) => {
    doi && setPaper(doi, attr, value);
  };
  const handleChangeRead = (value) => {
    setPaper(doi, "read", value);
  };
  return (
    <div className="detail-view" key={doi}>
      {paper && (
        <>
          <div className="detail-title">{paper.Title}</div>
          <div className="detail-authors">
            {get(paper, "authors", []).join("; ")} ({paper.Year})
          </div>
          <div className="detail-edit-tags">
            <div className="detail-edit-read">
              <div className="detail-edit-title">Read</div>
              <Switch
                size="small"
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked={get(paper, "read", false)}
                onChange={handleChangeRead}
              />
            </div>
            {editTags.map((editTag) => (
              <DetailEditTags
                key={editTag.value}
                title={editTag.title}
                initTags={editTag.initTags}
                handleChangeTags={(value) =>
                  handleChangeTags(editTag.value, value)
                }
              />
            ))}
          </div>
          <div className="detail-attrs">
            <DetailItem paper={paper} label={"AuthorKeywords"} />
            <DetailItem paper={paper} label={"DOI"} />
            <DetailItem paper={paper} label={"AuthorAffiliation"} />
            <DetailItem paper={paper} label={"Abstract"} />
          </div>
        </>
      )}
    </div>
  );
});

export default DetailView;

const DetailItem = ({ paper, label }) => (
  <div className="detail-attr">
    <div className="detail-key">{label}:</div>
    <div className="detail-content">{get(paper, label, "")}</div>
  </div>
);

const DetailEditTags = ({ title, initTags, handleChangeTags }) => {
  const [tags, _setTags] = useState(initTags);
  const setTags = (newTags) => {
    handleChangeTags(newTags);
    _setTags(newTags);
  };
  const [editInputIndex, setEditInputIndex] = useState(-1);
  // const [editInput, setEditInput] = useState();
  // const saveEditInputRef = (input) => setEditInput(input);
  const input = useRef();
  // const saveInputRef = (input) => setInput(input);

  const [editInputValue, setEditInputValue] = useState("");
  const handleEditInputConfirm = () => {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    setTags(newTags);
    setEditInputIndex(-1);
    setEditInputValue("");
  };

  const [inputValue, setInputValue] = useState("");
  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) < 0) {
      setTags([...tags, inputValue]);
      setInputVisible(false);
      setInputValue("");
    }
  };

  const handleClose = (removeTag) => {
    setTags(tags.filter((tag) => tag !== removeTag));
  };

  const [inputVisible, setInputVisible] = useState(false);
  const showInput = () => {
    setInputVisible(true);
    // input.focus();
  };
  return (
    <div className="detail-edit-tag">
      <div className="detail-edit-title">{title}:</div>
      <div className="detail-edit-tags">
        <>
          {tags.map((tag, index) => {
            if (editInputIndex === index) {
              return (
                <Input
                  // ref={saveEditInputRef}
                  key={tag}
                  size="small"
                  className="tag-input"
                  value={editInputValue}
                  onchange={(e) => setEditInputValue(e.target.value)}
                  onBlur={handleEditInputConfirm}
                  onPressEnter={handleEditInputConfirm}
                />
              );
            }

            const tagElem = (
              <Tag
                className="edit-tag"
                key={tag}
                closable={true}
                onClose={() => handleClose(tag)}
              >
                <span
                // onDoubleClick={(e) => {
                //   setEditInputIndex(index);
                //   setEditInputValue(tag);
                //   editInput.focus();
                //   e.preventDefault();
                // }}
                >
                  {tag}
                </span>
              </Tag>
            );
            return tagElem;
          })}
          {inputVisible && (
            <Input
              ref={input}
              type="text"
              size="small"
              className="tag-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <Tag className="site-tag-plus" onClick={showInput}>
              <PlusOutlined /> New Tag
            </Tag>
          )}
        </>
      </div>
    </div>
  );
};

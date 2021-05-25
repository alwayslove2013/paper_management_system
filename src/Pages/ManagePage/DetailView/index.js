import React, { useState, useRef, useEffect } from "react";
import "./index.scss";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { get } from "lodash";
import { Switch, Modal, Tag, Input } from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { toJS } from "mobx";

const debug = true;

const keys = [
  "title",
  "doi",
  "year",
  "conferenceName",
  "authors",
  "citationCount",
  "affiliation",
  "countries",
  "abstract",
  "keywords",
  "refList",
];
const DetailView = observer(() => {
  const store = useGlobalStore();
  const { currentSelectedPaper, setPaper, updatePaper } = store;
  const paper = currentSelectedPaper;
  const [uploadModalShow, _setUploadModalShow] = useState(false);
  const [newPaper, setNewPaper] = useState({});
  const setUploadModalShow = () => {
    if (!uploadModalShow) {
      const _newPaper = {};
      keys.forEach(
        (key) =>
          (_newPaper[key] = Array.isArray(currentSelectedPaper[key])
            ? currentSelectedPaper[key].join("; ")
            : currentSelectedPaper[key])
      );
      setNewPaper(_newPaper);
    }
    _setUploadModalShow(!uploadModalShow);
  };

  if (!currentSelectedPaper) {
    return <div></div>;
  }

  const doi = get(paper, "doi", "");

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

  const handleSubmit = () => {
    updatePaper(currentSelectedPaper.doi, newPaper);
    setUploadModalShow();
  };

  return (
    <div className="detail-view" key={doi}>
      {paper && (
        <>
          <div className="detail-header">
            <div className="detail-header-content">
              <div className="detail-title">{paper.title}</div>
              <div className="detail-authors">
                {get(paper, "authors", []).join("; ")} ({paper.year})
              </div>
            </div>
            <div className="detail-header-icons">
              <SettingOutlined onClick={setUploadModalShow} />
            </div>
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
            <div className="detail-attr">
              <div className="detail-key">keywords:</div>
              <div className="detail-content">
                {get(paper, "keywords", []).join("; ")}
              </div>
            </div>
            <DetailItem paper={paper} label={"doi"} />
            <DetailItem
              paper={paper}
              label={"conference/journal"}
              value={"conferenceName"}
            />
            <DetailItem paper={paper} label={"affiliation"} />
            <DetailItem paper={paper} label={"abstract"} />
          </div>
          <Modal
            key={currentSelectedPaper.doi}
            title="Upload"
            visible={uploadModalShow}
            onOk={handleSubmit}
            onCancel={setUploadModalShow}
            centered
          >
            {keys.map((key) => (
              <div className="detail-new-paper-item" key={key}>
                <div className="detail-new-paper-label">{key}</div>
                <div className="detail-new-paper-input">
                  <Input
                    value={newPaper[key]}
                    onChange={(e) => {
                      const new_paper = { ...newPaper };
                      new_paper[key] = e.target.value;
                      setNewPaper(new_paper);
                    }}
                  />
                </div>
              </div>
            ))}
          </Modal>
        </>
      )}
    </div>
  );
});

export default DetailView;

const DetailItem = ({ paper, label, value = "" }) => {
  if (value.length === 0) value = label;
  return (
    <div className="detail-attr">
      <div className="detail-key">{label}:</div>
      <div className="detail-content">{get(paper, value, "")}</div>
    </div>
  );
};

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

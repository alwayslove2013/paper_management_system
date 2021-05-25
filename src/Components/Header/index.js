import React, { useState } from "react";
import "./index.scss";
import userList from "Common/userList";
import { useGlobalStore } from "Store";
import { batchUpdatePapers } from "Server";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Select, Modal, Input, Upload, Button } from "antd";
import { CloudUploadOutlined, UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const Header = observer(() => {
  const store = useGlobalStore();
  const handleChange = (userId) => {
    store.setUserId(userId);
  };
  const { currentPage, userId, initPapers } = store;
  const [uploadModalShow, _setUploadModalShow] = useState(false);
  const setUploadModalShow = () => _setUploadModalShow(!uploadModalShow);
  const title = `Literature ${currentPage} System`;
  const switchPage = currentPage === "Analysis" ? "management" : "analysis";
  const switchPageShowText = currentPage === "Analysis" ? "Manage" : "Analyze";
  const SwitchButton = () => (
    <Link to={switchPage} className="switch-button">
      {switchPageShowText}
    </Link>
  );

  const [conferenceName, setConferenceName] = useState("");
  const [publicTags, setPublicTags] = useState("");
  const [privateTags, setPrivateTags] = useState("");
  const batchUpdateItems = [
    {
      label: "Conference Name",
      setFunc: setConferenceName,
    },
    {
      label: "Public Tags",
      setFunc: setPublicTags,
    },
    {
      label: "Private Tags",
      setFunc: setPrivateTags,
    },
  ];

  // console.log("????", conferenceName, publicTags, privateTags);

  const [file, setFile] = useState("");

  const uploadProps = {
    maxCount: 1,
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
  };

  const handleSubmit = () => {
    batchUpdatePapers({
      file,
      conferenceName,
      publicTags,
      privateTags,
      userId,
    }).then(() => {
      initPapers(true);
    });
    setUploadModalShow();
  };

  return (
    <div className="header">
      <div className="title">{title}</div>
      <div className="user-selector">
        User: &nbsp;
        <Select
          value={store.userId}
          size="small"
          onChange={handleChange}
          style={{ width: 130 }}
          placeholder="Set User"
        >
          {userList.map((user) => (
            <Option value={user} key={user}>
              {user}
            </Option>
          ))}
        </Select>
        <SwitchButton />
        <div className="update-data-trigger" onClick={setUploadModalShow}>
          <CloudUploadOutlined style={{ fontSize: 24 }} />
        </div>
      </div>
      <Modal
        title="Upload"
        visible={uploadModalShow}
        onOk={handleSubmit}
        onCancel={setUploadModalShow}
        centered
      >
        {batchUpdateItems.map((item) => (
          <div key={item.label} className="update_item">
            <div className="update-item-label">{item.label}</div>
            <Input
              placeholder="Empty means no batch setting"
              onChange={(e) => item.setFunc(e.target.value)}
            />
          </div>
        ))}
        <Upload {...uploadProps} className="update_item">
          <Button icon={<UploadOutlined />}>bib/json/csv</Button>
        </Upload>
      </Modal>
    </div>
  );
});

export default Header;

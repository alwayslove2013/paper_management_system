import React, { useState } from "react";
import "./index.scss";
import userList from "Common/userList";
import { useGlobalStore } from "Store";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Select, Modal } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
const { Option } = Select;

const Header = observer(() => {
  const store = useGlobalStore();
  const handleChange = (userId) => {
    store.setUserId(userId);
  };
  const { currentPage } = store;
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
        onOk={setUploadModalShow}
        onCancel={setUploadModalShow}
        centered
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </div>
  );
});

export default Header;

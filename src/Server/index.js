import qs from "qs";

// const baseUrl = "http://vis.pku.edu.cn/vis4vis/";
const baseUrl = "http://127.0.0.1:12357/";

const fetchData = (url, params = "") => {
  const getUrl =
    baseUrl + url + (url.includes("?") ? "&" : "?") + qs.stringify(params);
  return new Promise((resolve, reject) => {
    fetch(getUrl)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

export const getPapers = async () => {
  return await fetchData("get_papers");
};

export const getPublicTags = async () => {
  return await fetchData("get_public_tags");
};

export const getPrivateTags = async ({ uid }) => {
  return await fetchData("get_private_tags", { uid });
};

export const setPublicTags = ({ pid, paper }) => {
  const tags = paper.publicTags;
  fetchData("set_public_tags", { pid, tags: tags.join(",") });
  return "OK";
};

export const setPrivateTags = ({ uid, pid, paper }) => {
  const { privateTags, read } = paper;
  uid &&
    fetchData("set_private_tags", {
      uid,
      pid,
      tags: [...privateTags, read && "read"].filter((a) => a).join(","),
    });
  return "OK";
};

function postData(url, data) {
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      "user-agent": "Mozilla/4.0 MDN Example",
      "content-type": "application/json",
    },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, cors, *same-origin
    // redirect: 'follow', // manual, *follow, error
    // referrer: 'no-referrer', // *client, no-referrer
  }).then((response) => response.json()); // parses response to JSON
}

export const getLdaRes = ({ dois, uid, num_topics = 3 }) => {
  return postData(baseUrl + "get_lda_results", { dois, num_topics, uid });
};

export const batchUpdatePapers = ({
  file,
  conferenceName,
  publicTags,
  privateTags,
  userId,
}) => {
  const form = new FormData();
  form.append("file", file);
  form.append("conferenceName", conferenceName);
  form.append("publicTags", publicTags);
  form.append("privateTags", privateTags);
  form.append("uid", userId);
  const fileType = file.name.split(".").slice(-1)[0];
  form.append("fileType", fileType);
  return fetch(baseUrl + "add_papers", {
    body: form, // must match 'Content-Type' header
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, same-origin, *omit
    // headers: {
    //   "user-agent": "Mozilla/4.0 MDN Example",
    //   "content-type": "application/json",
    // },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, cors, *same-origin
    // redirect: 'follow', // manual, *follow, error
    // referrer: 'no-referrer', // *client, no-referrer
  }).then((response) => response.json()); // parses response to JSON
};

import * as d3 from "d3";
import { toJS, runInAction } from "mobx";
import {
  setPublicTags,
  setPrivateTags,
  getPublicTags,
  getPrivateTags,
} from "../Server";
// import { get } from "lodash";
import mostCommon from "../Common/Counter";

const debug = true;

const attr2func = {
  publicTags: setPublicTags,
  privateTags: setPrivateTags,
  read: setPrivateTags,
};

const createStore = () => {
  return {
    papers: [],
    commonAuthors: [],
    commonCountries: [],
    commonPublicTags: [],
    commonPrivateTags: [],
    async setPapers(papers, compareAttr = "CitationCount") {
      debug && console.log("==> 初始化Papers");
      papers.forEach((paper, i) => {
        // 初始化，一些特殊处理，比如如果没有doi或者引用量，就安排一个
        if (paper.DOI === "#") paper.DOI = `tmp-${i}`;
        if (paper.CitationCount === "") paper.CitationCount = 0;
        if (paper.Countries === "#" || paper.Countries === "###")
          paper.Countries = "";
        paper.privateTags = [];
        paper.read = false;
        paper.publicTags = [];
        paper.colors = [];

        // 提取authors
        paper.authors = paper.AuthorNames.split(";").map((a) => a.trim());

        // 提取countries
        paper.countries = paper.Countries.split(";")
          .map((s) => {
            const part = s.trim().split(" ");
            return part.length === 0 ? "" : part[part.length - 1].trim();
          })
          .filter((a) => a);
      });

      this.commonAuthors = mostCommon(papers.map((paper) => paper.authors));
      this.commonCountries = mostCommon(papers.map((paper) => paper.countries));

      // 先按引用量排序，再去统计分组的排序，这个时间消耗其实还挺大的。
      papers.sort((a, b) => b[compareAttr] - a[compareAttr]);

      // 开始计算位置
      this.computedPosition(papers);
      await this.initPublicTags(papers);

      runInAction(() => {
        this.papers = papers;
      });
    },
    setPaper(doi, attr, value) {
      const paper = this.papers.find((p) => p.DOI === doi);
      paper[attr] = value;
      // if (attr === "read") {
      //   if (value) {
      //     paper.privateTags.push("read");
      //   } else {
      //     paper.privateTags = [...paper.privateTags].filter(
      //       (a) => a !== "read"
      //     );
      //   }
      // }
      debug && console.log("==> 更新paper数据 by doi:", doi, attr, value);
      // attr === "publicTags" && setPublicTags(doi, value);
      attr2func[attr]({
        uid: this.userId,
        pid: doi,
        paper: toJS(paper),
      });
      this.doiUpdateColors(doi);
    },
    unitXAttr: "Year",
    get unitXAttrList() {
      const xAttrSet = new Set();
      this.papers.forEach((paper) => {
        xAttrSet.add(paper[this.unitXAttr]);
      });
      const xAttrList = Array.from(xAttrSet);
      xAttrList.sort((a, b) => b - a);
      return xAttrList;
    },
    unitYAttr: "Conference",
    get unitYAttrList() {
      return ["SciVis", "InfoVis", "VAST", "PacificVis"];
      // const yAttrSet = new Set();
      // this.papers.forEach((paper) => {
      //   yAttrSet.add(paper[this.unitYAttr]);
      // });
      // const yAttrList = Array.from(yAttrSet);
      // yAttrList.sort();
      // return yAttrList;
    },
    maxUnitBlockPaperCount: 0,
    unitBlockCount: {},
    computedPosition(papers) {
      // 每一个block有多少单元
      const unitBlockCount = {};
      papers.forEach((paper) => {
        const xAttr = paper[this.unitXAttr];
        const yAttr = paper[this.unitYAttr];
        if (!(xAttr in unitBlockCount)) unitBlockCount[xAttr] = {};
        if (!(yAttr in unitBlockCount[xAttr])) unitBlockCount[xAttr][yAttr] = 0;
        paper.unitIndex = unitBlockCount[xAttr][yAttr];
        unitBlockCount[xAttr][yAttr] += 1;
      });
      this.maxUnitBlockPaperCount =
        Math.max(...papers.map((paper) => paper.unitIndex)) * 0.6;
      this.unitBlockCount = unitBlockCount;
    },

    async initPublicTags(papers) {
      const publicTags = await getPublicTags();
      papers.forEach((paper) => {
        if (paper.DOI in publicTags) {
          paper.publicTags = publicTags[paper.DOI].filter((a) => a);
        }
      });
      runInAction(() => {
        this.commonPublicTags = mostCommon(Object.values(publicTags));
      });
    },
    async initPrivateTags() {
      const privateTags = await getPrivateTags({ uid: this.userId });

      runInAction(() => {
        this.papers.forEach((paper) => {
          if (paper.DOI in privateTags) {
            const readIndex = privateTags[paper.DOI].indexOf("read");
            if (readIndex > -1) {
              paper.read = true;
              privateTags[paper.DOI].splice(readIndex, 1);
            }
            paper.privateTags = privateTags[paper.DOI].filter((a) => a);
          }
        });
        this.commonPrivateTags = mostCommon(Object.values(privateTags));
      });

      this.batchUpdateColors();
    },

    userId: "",
    setUserId(userId) {
      if (userId !== this.userId) {
        this.userId = userId;
        debug && console.log("==> change userId:", this.userId);
        localStorage.setItem("paper-management-system-userId", userId);
        userId && this.initPrivateTags();
      }
    },
    initUserId() {
      const userId = localStorage.getItem("paper-management-system-userId");
      userId && this.setUserId(userId);
    },

    get controlTagNameList() {
      return [
        {
          label: "Country",
          value: "countries",
          list: this.commonCountries.slice(0, 8).concat(["Japan", "Korea"]),
        },
        {
          label: "Author",
          value: "authors",
          list: this.commonAuthors,
        },
        {
          label: "Private Tag",
          value: "privateTags",
          list: ["read"].concat(this.commonPrivateTags),
          // list: this.commonPrivateTags,
        },
        {
          label: "Public Tag",
          value: "publicTags",
          list: this.commonPublicTags,
        },
      ];
    },
    activeTags: {
      countries: [],
      authors: [],
      privateTags: [],
      publicTags: [],
    },
    // 判断 至少有一个控制器被激活
    get controlIsActive() {
      let ans = false;
      for (let key in this.activeTags) {
        if (this.activeTags[key].length > 0) {
          ans = true;
        }
      }
      return ans;
    },
    tag2color: {},
    colorUse: {},
    setTagColor(tag, category) {
      debug && console.log("==> 设置tag颜色:", category, tag);
      const fullTag = `${category}---${tag}`;
      if (fullTag in this.tag2color) {
        // 回收该颜色
        this.colorUse[this.tag2color[fullTag]] = false;
        delete this.tag2color[fullTag];
        this.activeTags[category] = [...this.activeTags[category]].filter(
          (a) => a !== tag
        );
      } else {
        // 分配一个新的颜色
        this.activeTags[category].push(tag);
        let i = 0;
        let _color = d3.schemeTableau10[i];
        while (this.colorUse[_color]) {
          i += 1;
          if (i === 10) {
            _color = "black";
            break;
          }
          _color = d3.schemeTableau10[i];
        }
        this.tag2color[fullTag] = _color;
        this.colorUse[_color] = true;
      }
      this.batchUpdateColors();
    },
    batchUpdateColors() {
      this.papers.forEach((paper) => {
        paper.colors = [];
        this.updateColor(paper);
      });
    },
    doiUpdateColors(doi) {
      const paper = this.papers.find((p) => p.DOI === doi);
      paper.colors = [];
      this.updateColor(paper);
    },
    updateColor(paper) {
      const isReadTagActive = this.activeTags.privateTags.indexOf("read") > -1;
      for (let category in this.activeTags) {
        const hightlightAttrs = this.activeTags[category];
        hightlightAttrs.forEach((attr) => {
          if (paper[category].indexOf(attr) > -1) {
            const fullTag = `${category}---${attr}`;
            paper.colors.push(this.tag2color[fullTag]);
          }
          if (isReadTagActive && paper.read) {
            paper.colors.push(this.tag2color["privateTags---read"]);
          }
        });
      }
    },
    maxCitationCount: 200,

    currentSelected: "",
    isSelected: false,
    setCurrentSelected(doi) {
      debug && console.log("==> 选中文章:", doi);
      this.currentSelected = doi;
      this.isSelected = !!doi
    },
    cancelSelect() {
      debug && console.log("==> 点击背景，取消论文选中状态");
      this.isSelected = false;
    },
    get currentSelectedPaper() {
      return this.papers.find((paper) => paper.DOI === this.currentSelected);
    },
  };
};

export default createStore;

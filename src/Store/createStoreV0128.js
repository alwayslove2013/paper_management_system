import * as d3 from "d3";
import { toJS, runInAction } from "mobx";
import {
  getPapers,
  setPublicTags,
  setPrivateTags,
  getPublicTags,
  getPrivateTags,
  getLdaRes,
  singleUpdatePaper,
} from "Server";
import { get } from "lodash";
import { mostCommon, mustInclude, find_d } from "Common";

const debug = true;

const attr2func = {
  publicTags: setPublicTags,
  privateTags: setPrivateTags,
  read: setPrivateTags,
};

const createStore = () => {
  return {
    currentPage: "Management",
    setCurrentPage() {
      this.currentPage = window.location.hash.includes("/analysis")
        ? "Analysis"
        : "Management";
    },
    tooltipX: 500,
    tooltipY: 500,
    setTooltipPos(x = -1, y = -1) {
      this.tooltipX = x;
      this.tooltipY = y;
    },
    titleSearch: "",
    setTitleSearch(text) {
      this.titleSearch = text.toLocaleLowerCase();
    },
    get searchPaperDoiSet() {
      const searchPaperDois = this.titleSearch
        ? this.papers
            .filter(
              (paper) =>
                paper.title.toLocaleLowerCase().indexOf(this.titleSearch) > -1
            )
            .map((paper) => paper.doi)
        : [];
      const searchPaperDoiSet = new Set(searchPaperDois);
      return searchPaperDoiSet;
    },
    papers: [],
    commonAuthors: [],
    commonCountries: [],
    commonPublicTags: [],
    commonPrivateTags: [],
    // 实际上干两件事，papers + publicTags
    async initPapers(update = false) {
      if (this.papers.length === 0 || update) {
        const papers = await getPapers();
        this.setPapers(papers);
      }
    },
    async setPapers(papers, compareAttr = "citationCount") {
      debug && console.log("==> 初始化Papers");
      const doi2paper = {};
      papers.forEach((paper) => {
        // 初始化，一些特殊处理，比如如果没有doi或者引用量，就安排一个
        // if (paper.doi === "#") paper.doi = `tmp-${i}`;
        // if (paper.CitationCount === "") paper.CitationCount = 0;
        // if (paper.Countries === "#" || paper.Countries === "###")
        //   paper.Countries = "";
        paper.privateTags = [];
        paper.projection = [5, 5];
        paper.topics = [];
        paper.read = false;
        paper.publicTags = [];
        // paper.keywords = [];
        paper.colors = [];
        paper.innerColors = [];
        paper.outerColors = [];
        paper.internalRefList = [];
        paper.internalCitedList = [];
        paper.topics = [[0, 1]];
        paper.isHighlight = false;
        paper.indexByYear = 0;
        paper.refList = paper.refList
          .toLowerCase()
          // .split(";")
          .split(/[,;]/)
          .map((a) => a.trim());
        paper.doi = paper.doi.toLowerCase();
        doi2paper[paper.doi] = paper;

        // 提取authors
        paper.authors = paper.authors
          .split(";")
          .map((a) => a.trim().replace(/\{(.*)\}/, "$1"));

        // 提取countries
        paper.countries = paper.countries
          .split(";")
          .map((s) => {
            const part = s
              .trim()
              .split(" ")
              .map((a) => a.trim())
              .filter((a) => a);
            if (part.length === 0) return "";
            let country = part[part.length - 1]
              .toLowerCase()
              .replace(/^\w/, (s) => s.toUpperCase());
            return country;
          })
          .filter((a) => a);

        paper.year = +paper.year;

        paper.keywords = paper.keywords
          .split(/[;,]/)
          .map((word) => word.trim().toLowerCase());
      });

      papers.forEach((paper) => {
        paper.refList.forEach((ref) => {
          if (ref in doi2paper) {
            const refPaper = doi2paper[ref];
            refPaper.internalCitedList.push(paper.doi);
            paper.internalRefList.push(ref);
          }
        });
      });

      this.commonAuthors = mostCommon(
        papers.map((paper) => paper.authors),
        30
      );
      // console.log(
      //   "Authors Tags: ",
      //   mostCommon(
      //     papers.map((paper) => paper.authors),
      //     100
      //   )
      // );
      this.commonCountries = mostCommon(
        papers.map((paper) => paper.countries),
        30
      );

      // 先按引用量排序，再去统计分组的排序，这个时间消耗其实还挺大的。
      papers.sort((a, b) => b[compareAttr] - a[compareAttr]);

      // 开始计算位置
      this.computedPosition(papers);
      await this.initPublicTags(papers);

      runInAction(() => {
        this.papers = papers;
        this.initPrivateTags();
      });
    },
    setPaper(doi, attr, value) {
      const paper = this.papers.find((p) => p.doi === doi);
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
    unitXAttr: "year",
    get unitXAttrList() {
      const xAttrSet = new Set();
      this.papers.forEach((paper) => {
        xAttrSet.add(paper[this.unitXAttr]);
      });
      const xAttrList = Array.from(xAttrSet);
      xAttrList.sort((a, b) => b - a);
      return xAttrList;
    },
    unitYAttr: "conferenceName",
    unitYAttrList: [
      "SciVis",
      "InfoVis",
      "EuroVis",
      "VAST",
      "PacificVis",
      "Others",
    ],
    maxUnitBlockPaperCount: 0,
    unitBlockCount: {},
    computedPosition(papers) {
      // 每一个block有多少单元
      const unitBlockCount = {};
      papers.forEach((paper) => {
        const xAttr = paper[this.unitXAttr];
        const yAttr = this.unitYAttrList.includes(paper[this.unitYAttr])
          ? paper[this.unitYAttr]
          : this.unitYAttrList[this.unitYAttrList.length - 1];
        if (!(xAttr in unitBlockCount)) unitBlockCount[xAttr] = {};
        if (!(yAttr in unitBlockCount[xAttr])) unitBlockCount[xAttr][yAttr] = 0;
        paper.unitIndex = unitBlockCount[xAttr][yAttr];
        unitBlockCount[xAttr][yAttr] += 1;
      });
      this.maxUnitBlockPaperCount =
        Math.max(...papers.map((paper) => paper.unitIndex)) * 0.7;
      this.unitBlockCount = unitBlockCount;
    },

    async initPublicTags(papers) {
      const publicTags = await getPublicTags();
      papers.forEach((paper) => {
        if (paper.doi in publicTags) {
          paper.publicTags = publicTags[paper.doi].filter((a) => a);
        }
      });
      runInAction(() => {
        this.commonPublicTags = mostCommon(Object.values(publicTags), 30);
      });
    },
    async initPrivateTags() {
      const privateTags = await getPrivateTags({ uid: this.userId });

      runInAction(() => {
        this.papers.forEach((paper) => {
          if (paper.doi in privateTags) {
            const readIndex = privateTags[paper.doi].indexOf("read");
            if (readIndex > -1) {
              paper.read = true;
              privateTags[paper.doi].splice(readIndex, 1);
            }
            paper.privateTags = privateTags[paper.doi].filter((a) => a);
          }
        });
        this.commonPrivateTags = mostCommon(Object.values(privateTags), 30);
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
      if (this.userId.length === 0) {
        const userId = localStorage.getItem("paper-management-system-userId");
        userId && this.setUserId(userId);
      }
    },

    get controlTagNameList() {
      return this.generateCategory(10);
    },
    // get anaCategories() {
    //   return this.generateCategory(18, true);
    // },
    get anaCategories() {
      const count = 50;
      const have_read = false;
      const countries = mustInclude(
        mostCommon(
          this.analysisPapers.map((paper) => paper.countries),
          30
        ),
        ["Japan", "Korea"],
        count
      );
      const authors = mostCommon(
        this.analysisPapers.map((paper) => paper.authors),
        30
      );
      const privateTags = mustInclude(
        this.commonPrivateTags,
        have_read ? ["read"] : [],
        count
      );
      const publicTags = mustInclude(this.commonPublicTags, [], count);
      const keywords = mustInclude(
        mostCommon(
          this.analysisPapers.map((paper) => paper.keywords),
          30
        ),
        [],
        count
      );
      return [
        {
          label: "Country",
          value: "countries",
          list: countries,
          highlightType: "outer",
        },
        {
          label: "Author",
          value: "authors",
          list: authors,
          highlightType: "inner",
        },
        {
          label: "Keywords",
          value: "keywords",
          list: keywords,
          highlightType: "inner",
        },
        {
          label: "Private Tag",
          value: "privateTags",
          list: privateTags,
          highlightType: "inner",
        },
        {
          label: "Public Tag",
          value: "publicTags",
          list: publicTags,
          highlightType: "inner",
        },
      ];
    },

    get commonKeywords() {
      return mostCommon(
        this.papers.map((paper) => paper.keywords),
        30
      );
    },
    generateCategory(count, have_read = false) {
      const countries = mustInclude(
        this.commonCountries,
        ["Japan", "Korea"],
        count
      );
      const authors = mustInclude(this.commonAuthors, ["Xiaoru Yuan"], count);
      const privateTags = mustInclude(
        this.commonPrivateTags,
        have_read ? ["read"] : [],
        count
      );
      const publicTags = mustInclude(this.commonPublicTags, [], count);
      const keywords = mustInclude(this.commonKeywords, [], count);
      return [
        {
          label: "Country",
          value: "countries",
          list: countries,
          highlightType: "outer",
        },
        {
          label: "Author",
          value: "authors",
          list: authors,
          highlightType: "inner",
        },
        {
          label: "Keywords",
          value: "keywords",
          list: keywords,
          highlightType: "inner",
        },
        {
          label: "Private Tag",
          value: "privateTags",
          list: privateTags,
          highlightType: "inner",
        },
        {
          label: "Public Tag",
          value: "publicTags",
          list: publicTags,
          highlightType: "inner",
        },
      ];
    },
    get category2highlightType() {
      const category2highlightType = {};
      this.controlTagNameList.forEach((category) => {
        category2highlightType[category.value] = category.highlightType;
      });
      return category2highlightType;
    },
    activeTags: {
      countries: [],
      authors: [],
      privateTags: [],
      publicTags: [],
      keywords: [],
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
    // 判断 至少有一个outer被激活
    get isUnitOuterHighlight() {
      const outerCategories = this.controlTagNameList
        .filter((category) => category.highlightType === "outer")
        .map((category) => category.value);
      let isUnitOuterHighlight = false;
      outerCategories.forEach((outerCategory) => {
        if (this.activeTags[outerCategory].length > 0)
          isUnitOuterHighlight = true;
      });
      return isUnitOuterHighlight;
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
        paper.innerColors = [];
        paper.outerColors = [];
        this.updateColor(paper);
      });
    },
    doiUpdateColors(doi) {
      const paper = this.papers.find((p) => p.doi === doi);
      paper.colors = [];
      paper.innerColors = [];
      paper.outerColors = [];
      this.updateColor(paper);
    },
    updateColor(paper) {
      const isReadTagActive = this.activeTags.privateTags.indexOf("read") > -1;
      if (isReadTagActive && paper.read) {
        paper.colors.push(this.tag2color["privateTags---read"]);
        paper.innerColors.push(this.tag2color["privateTags---read"]);
      }

      for (let category in this.activeTags) {
        const hightlightAttrs = this.activeTags[category];
        if (this.category2highlightType[category] === "inner") {
          hightlightAttrs.forEach((attr) => {
            if (paper[category].indexOf(attr) > -1) {
              const fullTag = `${category}---${attr}`;
              paper.innerColors.push(this.tag2color[fullTag]);
            }
          });
        } else {
          hightlightAttrs.forEach((attr) => {
            if (paper[category].indexOf(attr) > -1) {
              const fullTag = `${category}---${attr}`;
              paper.outerColors.push(this.tag2color[fullTag]);
            }
          });
        }
        hightlightAttrs.forEach((attr) => {
          if (paper[category].indexOf(attr) > -1) {
            const fullTag = `${category}---${attr}`;
            paper.colors.push(this.tag2color[fullTag]);
          }
        });
      }
    },
    maxCitationCount: 200,

    currentSelected: "",
    currentSelectedRefSet: new Set(),
    currentSelectedCitedSet: new Set(),
    isSelected: false,
    setCurrentSelected(doi) {
      debug && console.log("==> 选中文章:", doi);
      this.currentSelected = doi;
      this.isSelected = !!doi;

      const paper = this.papers.find((paper) => paper.doi === doi);
      this.currentSelectedRefSet = new Set(paper.internalRefList);
      this.currentSelectedCitedSet = new Set(paper.internalCitedList);
    },
    cancelSelect() {
      debug && console.log("==> 点击背景，取消论文选中状态");
      this.isSelected = false;
    },
    get currentSelectedPaper() {
      const currentSelectedPaper = this.papers.find(
        (paper) => paper.doi === this.currentSelected
      );
      debug && console.log("currentSelectedPaper", toJS(currentSelectedPaper));
      return currentSelectedPaper;
    },

    get analysisPapers() {
      return this.controlIsActive
        ? this.papers.filter(
            (paper) =>
              paper.innerColors.length > 0 || paper.outerColors.length > 0
          )
        : this.papers;
    },
    get anaTimeData() {
      const timeList = this.unitXAttrList.map((a) => +a).sort();
      return timeList.map((year) => ({
        x: year,
        all: this.analysisPapers.filter((paper) => +paper.year === year).length,
        highlight: this.anaHighPapers.filter((paper) => +paper.year === year)
          .length,
      }));
    },

    get minYearAna() {
      return d3.min(this.analysisPapers.map((paper) => +paper.year));
    },
    get maxYearAna() {
      return d3.max(this.analysisPapers.map((paper) => +paper.year));
    },
    get anaYearRange() {
      return d3.range(this.minYearAna, this.maxYearAna + 1, 1);
    },
    get anaTagViewData() {
      return this.anaCategories.map((category) => {
        const { label, value } = category;
        const data = category.list.map((tag) =>
          tag === "read"
            ? {
                label: "read",
                all: this.analysisPapers.filter((paper) => paper.read).length,
                highlight: this.anaHighPapers.filter((paper) => paper.read)
                  .length,
                all_timeDis: this.anaYearRange.map(
                  (year) =>
                    this.analysisPapers.filter(
                      (paper) => paper.read && paper.year == year
                    ).length
                ),
              }
            : {
                label: tag,
                all: this.analysisPapers.filter((paper) =>
                  paper[category.value].includes(tag)
                ).length,
                highlight: this.anaHighPapers.filter((paper) =>
                  paper[category.value].includes(tag)
                ).length,
                all_timeDis: this.anaYearRange.map(
                  (year) =>
                    this.analysisPapers.filter(
                      (paper) =>
                        paper[category.value].includes(tag) &&
                        paper.year == year
                    ).length
                ),
              }
        );
        return {
          label,
          value,
          data,
        };
      });
    },

    anaFilterType: "none", // "none", "year", "tag", "topic", "lasso"
    setAnaFilterType(type) {
      debug && console.log("setAnaFilterType", type);
      this.anaFilterType = type;
    },
    clearBrushTrigger: () => {},
    setClearBrushTrigger(fn) {
      this.clearBrushTrigger = fn;
    },

    anaHighCate: "",
    anaHighTag: "",
    anaHighTopic: "",
    anaHighPapers: [],
    setAnaHighPapersByTag({ anaHighCate, anaHighTag }) {
      debug && console.log("setAnaHighPapersByTag", anaHighCate, anaHighTag);
      this.clearBrushTrigger();
      // this.setAnaHighPapersByYear([0, 0])
      if (this.anaHighCate === anaHighCate && this.anaHighTag === anaHighTag) {
        this.anaHighTag = "none";
        this.setAnaFilterType("none");
        this.anaHighPapers = this.analysisPapers;
      } else {
        this.anaHighCate = anaHighCate;
        this.anaHighTag = anaHighTag;
        this.setAnaFilterType(anaHighCate);
        this.anaHighPapers = this.analysisPapers.filter((paper) =>
          get(paper, anaHighCate, []).includes(anaHighTag)
        );
      }
    },
    setAnaHighPapersByTopic(topic) {
      debug && console.log("setAnaHighPapersByTopic", topic);
      this.clearBrushTrigger();
      if (this.anaFilterType === "topic" && this.anaHighTopic === topic) {
        this.anaHighTopic = "none";
        this.anaHighEntityTopic = -1;
        this.setAnaFilterType("none");
        this.anaHighPapers = this.analysisPapers;
      } else {
        this.anaHighTopic = topic;
        this.anaHighEntityTopic = -1;
        this.anaHighTag = `topic ${topic + 1}`;
        this.setAnaFilterType("topic");
        this.anaHighPapers = this.analysisPapers.filter((paper) =>
          paper.topics.map((a) => a[0]).includes(topic)
        );
      }
    },
    startYear: 0,
    endYear: 0,
    setAnaHighPapersByYear(yearRange) {
      debug && console.log("setAnaHighPapersByYear", yearRange);
      // this.setAnaFilterType('year');
      const [yearStart, yearEnd] = yearRange;
      this.startYear = yearStart;
      this.endYear = yearEnd;
      this.anaHighTag = `${yearStart}-${yearEnd}`;
      this.anaHighPapers = this.analysisPapers.filter(
        (paper) => +paper.year >= yearStart && +paper.year <= yearEnd
      );
    },
    anaSelectHighlightPaperDoi: "",
    setAnaSelectHighlightPaperDoi(paperDoi) {
      debug && console.log("setAnaSelectHighlightPaper", paperDoi);
      if (this.anaSelectHighlightPaperDoi === paperDoi) {
        debug && console.log("reset anaSelectHighlightPaperDoi");
        this.anaSelectHighlightPaperDoi = "";
      } else {
        this.anaSelectHighlightPaperDoi = paperDoi;
      }
    },
    get anaSelectHighlightPaper() {
      return (
        this.analysisPapers.find(
          (paper) => paper.doi === this.anaSelectHighlightPaperDoi
        ) || {}
      );
    },
    topicColorScale: d3.schemeTableau10.slice(1),
    defaultHighColor: d3.schemeTableau10[0],
    drawProjectionFlag: false,
    resetProjectionFlag() {
      debug && console.log("reset drawProjectionFlag");
      this.drawProjectionFlag = false;
    },
    num_topics: 4,
    setNumTopics(num) {
      this.num_topics = num;
      this.tryLda();
    },
    topics_detail: [],
    tryLda() {
      const dois = this.analysisPapers.map((paper) => paper.doi);
      const uid = this.userId;
      const num_topics = this.num_topics;
      debug && console.log("try lda Start!", num_topics);
      getLdaRes({ dois, uid, num_topics }).then((data) => {
        debug && console.log("try lda OK!", data);
        runInAction(() => {
          // console.log("data", data);
          const { paper_lda_res, topics_detail, code = "success" } = data;
          if (code === "success") {
            this.analysisPapers.forEach((paper) => {
              if (paper.doi in paper_lda_res) {
                paper.projection = paper_lda_res[paper.doi].projection;
                paper.topics = paper_lda_res[paper.doi].topics.sort(
                  (a, b) => b[1] - a[1]
                );
              } else {
                paper.projection = [5, 5];
                paper.topics = [];
              }
            });
            this.drawProjectionFlag = true;
            this.topics_detail = topics_detail;
            // 初始化一下
            this.anaHighPapers = this.analysisPapers;
          }
        });
      });
    },

    anaHighEntityTopic: -1,
    setAnaHighEntityTopic(topicIndex) {
      if (this.anaHighEntityTopic === topicIndex) {
        debug && console.log("setAnaHighEntityTopic", false);
        this.anaHighEntityTopic = -1;
      } else {
        debug && console.log("setAnaHighEntityTopic", topicIndex);
        this.anaHighEntityTopic = topicIndex;
      }
    },
    anaHighEntityCitePaperDois: [],
    anaHighEntityCitedPaperDois: [],
    anaHighTopicIndenpentPaperDois: [],
    setHighEntityLinkData(
      citePaperDois,
      citedPaperDois,
      centralIndependentPaperDois
    ) {
      debug && console.log("citePaperDois", citePaperDois);
      debug && console.log("citedPaperDois", citedPaperDois);
      // debug &&
      //   console.log("centralIndependentPaperDois", centralIndependentPaperDois);
      this.anaHighEntityCitePaperDois = citePaperDois;
      this.anaHighEntityCitedPaperDois = citedPaperDois;
      this.anaHighTopicIndenpentPaperDois = centralIndependentPaperDois;
    },

    // upload
    uploadModalShow: false,
    setUploadModalShow() {
      debug && console.log("setUploadModalShow", !this.uploadModalShow);
      this.uploadModalShow = !this.uploadModalShow;
    },

    updatePaper(oriDoi, newPaper) {
      debug && console.log("update paper info", oriDoi, newPaper);
      // newPaper.authors = newPaper.authors.join(";")
      // newPaper.countries = newPaper.countries.join(";")
      // newPaper.keywords = newPaper.keywords.join(";")
      // newPaper.refList = newPaper.refList.join(";")
      singleUpdatePaper(oriDoi, newPaper).then(() => {
        runInAction(() => {
          console.log("singleUpdatePaper finished", oriDoi, newPaper);
          this.initPapers();
        });
      });
    },
  };
};

export default createStore;

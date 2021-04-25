import * as d3 from "d3";
import { toJS } from "mobx";
import {
  setPublicTags,
  setPrivateTags,
  getPublicTags,
  getPrivateTags,
} from "Server";
import { get } from "lodash";
import mostCommon from "../Common/Counter";

const debug = false;

const attr2func = {
  publicTags: setPublicTags,
  privateTags: setPrivateTags,
  read: setPrivateTags,
};

const createStore = () => {
  return {
    papers: [],
    unitBlockCount: {},
    maxUnitBlockPaperCount: 0,
    doi2paperBlockPos: {},
    author2Count: {},
    authorCountList: [],
    countryCountList: [],
    doi2papers: {},
    setPapers(papers, compareAttr = "CitationCount") {
      const author2Count = {};
      const country2Count = {};
      papers.forEach((paper, i) => {
        if (paper.DOI === "#") {
          paper.DOI = `tmp-${i}`;
        }

        if (paper.CitationCount === "") {
          paper.CitationCount = 0;
        }
        paper.authors = paper.AuthorNames.split(";").map((a) => a.trim());
        paper.authors.forEach((author) => {
          if (author in author2Count) {
            author2Count[author] += 1;
          } else {
            author2Count[author] = 1;
          }
        });
        paper.Countries = paper.Countries === "#" ? "" : paper.Countries;
        paper.Countries = paper.Countries === "###" ? "" : paper.Countries;
        paper.countries = paper.Countries.split(";")
          .map((s) => {
            const part = s.trim().split(" ");
            return part.length === 0 ? "" : part[part.length - 1].trim();
          })
          .filter((a) => a);
        paper.countries.forEach((country) => {
          if (country in country2Count) {
            country2Count[country] += 1;
          } else {
            country2Count[country] = 1;
          }
        });
        paper.privateTags = [];
        paper.publicTags = [];
        paper.colors = [];
        this.doi2papers[paper.DOI] = paper;
      });
      this.author2Count = author2Count;
      const authorCountList = [];
      for (let author in author2Count) {
        authorCountList.push({
          value: author,
          count: author2Count[author],
        });
      }
      authorCountList.sort((a, b) => b.count - a.count);
      const countryCountList = [];
      for (let country in country2Count) {
        countryCountList.push({
          value: country,
          count: country2Count[country],
        });
      }
      countryCountList.sort((a, b) => b.count - a.count);
      this.authorCountList = authorCountList;
      this.countryCountList = countryCountList;
      // 先按引用量排序，再去统计分组的排序，这个时间消耗其实还挺大的。
      papers.sort((a, b) => b[compareAttr] - a[compareAttr]);
      this.papers = papers;

      let unitBlockCount = {};
      let maxUnitBlockPaperCount = 0;
      this.papers.forEach((paper) => {
        const doi = paper.DOI;
        const xAttr = paper[this.unitXAttr];
        const yAttr = paper[this.unitYAttr];
        if (!(xAttr in unitBlockCount)) {
          unitBlockCount[xAttr] = {};
        }
        if (!(yAttr in unitBlockCount[xAttr])) {
          unitBlockCount[xAttr][yAttr] = 0;
        }
        this.doi2paperBlockPos[doi] = unitBlockCount[xAttr][yAttr];

        unitBlockCount[xAttr][yAttr] += 1;
        if (maxUnitBlockPaperCount < unitBlockCount[xAttr][yAttr]) {
          maxUnitBlockPaperCount = unitBlockCount[xAttr][yAttr];
        }
      });
      this.maxUnitBlockPaperCount = maxUnitBlockPaperCount * 0.6;
      this.unitBlockCount = unitBlockCount;
      // this.maxUnitBlockPaperCount = 90;

      this.initPublicTags();
    },
    setPaper(doi, attr, value) {
      const paper = this.doi2papers[doi];
      paper[attr] = value;
      console.log("attr", attr, value);
      // attr === "publicTags" && setPublicTags(doi, value);
      attr2func[attr]({
        uid: this.userId,
        pid: doi,
        paper: toJS(paper),
      });
      this.updateDoi2colors(doi);
    },
    async initPrivateTags() {
      const privateTags = this.userId
        ? await getPrivateTags({ uid: this.userId })
        : {};
      for (let doi in privateTags) {
        const paper = get(this.doi2papers, false);
        paper && (paper.privateTags = privateTags[doi]);
      }
      // this.initDoi2colors();
    },
    commonPublicTags: [],
    async initPublicTags() {
      const publicTags = await getPublicTags();
      // for (let doi in publicTags) {
      //   const paper = get(this.doi2papers, doi, false);
      //   paper && (paper.publicTags = publicTags[doi]);
      // }
      this.papers.forEach((paper) => {
        if (paper.DOI in publicTags) {
          paper.publicTags = publicTags[paper.DOI];
        }
      });
      this.commonPublicTags = mostCommon(Object.values(publicTags));
      // this.initDoi2colors();
    },
    get paperCount() {
      return this.papers.length;
    },

    unitXAttr: "Year",
    setUnitXAttr(attrName) {
      this.unitXAttr = attrName;
    },
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
    setUnitYAttr(attrName) {
      this.unitYAttr = attrName;
    },
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

    userId: "",
    setUserId(userId) {
      this.userId = userId;
      debug && console.log("change userId", this.userId);
      userId && this.initPrivateTags();
    },

    get controlTagNameList() {
      return [
        {
          label: "Country",
          value: "countries",
          // list: ["USA", "China", "Japan", "Korea"],
          list: this.countryCountList
            .slice(0, 6)
            .map((attr) => attr.value)
            .concat(["Japan", "Korea"]),
        },
        {
          label: "Author",
          value: "authors",
          list: this.authorCountList.slice(0, 8).map((attr) => attr.value),
        },
        {
          label: "Private Tag",
          value: "privateTags",
          list: ["Read", "literature", "influence"],
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
    tag2color: {},
    colorUse: {},
    setTagColor(tag, key) {
      console.log("======> setTagColor", tag, key, toJS(this.tag2color));
      if (tag in this.tag2color) {
        this.colorUse[this.tag2color[tag]] = false;
        delete this.tag2color[tag];
        this.activeTags[key] = [...this.activeTags[key]].filter(
          (a) => a !== tag
        );
      } else {
        if (this.activeTags[key]) {
          this.activeTags[key].push(tag);
        } else {
          this.activeTags[key] = [tag];
        }
        // console.log("activeTags", toJS(this.activeTags));
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
        this.tag2color[tag] = _color;
        this.colorUse[_color] = true;
      }
      this.initDoi2colors();
    },

    get controlIsActive() {
      let ans = false;
      for (let key in this.activeTags) {
        if (this.activeTags[key].length > 0) {
          ans = true;
        }
      }
      return ans;
    },
    doi2colors: {},
    initDoi2colors() {
      const doi2colors = {};
      console.log(
        "begin initDoi2colors",
        toJS(this.activeTags),
        toJS(this.tag2color)
      );
      this.papers.forEach((paper) => {
        paper.colors = [];
        paper.DOI === "10.1109/TVCG.2016.2599030" &&
          console.log("====>", toJS(paper), toJS(this.activeTags));
        for (let keyAttr in this.activeTags) {
          const hightlightAttrs = this.activeTags[keyAttr];
          hightlightAttrs.forEach((attr) => {
            if (paper[keyAttr].indexOf(attr) > -1) {
              paper.colors.push(this.tag2color[attr]);
              console.log(
                "==> initDoi2colors paper",
                toJS(paper),
                paper.colors
              );
              if (
                paper.DOI in doi2colors &&
                Array.isArray(doi2colors[paper.DOI])
              ) {
                doi2colors[paper.DOI].push(this.tag2color[attr]);
              } else {
                doi2colors[paper.DOI] = [this.tag2color[attr]];
              }
            }
          });
        }
      });
      this.doi2colors = doi2colors;
    },
    updateDoi2colors(doi) {
      const paper = this.papers.find((p) => (p.DOI = doi));
      for (let keyAttr in this.activeTags) {
        const hightlightAttrs = this.activeTags[keyAttr];
        hightlightAttrs.forEach((attr) => {
          console.log(
            keyAttr,
            this.activeTags,
            attr,
            paper[keyAttr],
            paper[keyAttr].indexOf(attr)
          );
          if (paper[keyAttr].indexOf(attr) > -1) {
            paper.colors.push(this.tag2color[attr]);
            if (
              paper.DOI in this.doi2colors &&
              Array.isArray(this.doi2colors[paper.DOI])
            ) {
              this.doi2colors[paper.DOI].push(this.tag2color[attr]);
            } else {
              this.doi2colors[paper.DOI] = [this.tag2color[attr]];
            }
          }
          console.log("this.doi2colors[paper.DOI]", this.doi2colors[paper.DOI]);
        });
      }
    },

    doi2privateTags: {},
    doi2publicTags: {},
    doi2comments: {},

    maxCitationCount: 200,

    currentSelected: "",
    setCurrentSelected(doi) {
      this.currentSelected = doi;
    },
    get currentSelectedPaper() {
      return this.doi2papers[this.currentSelected];
    },
  };
};

export default createStore;

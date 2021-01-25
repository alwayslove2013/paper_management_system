import * as d3 from "d3";
import { toJS } from "mobx";

const debug = false;

const createStore = () => {
  return {
    papers: [],
    unitBlockCount: {},
    maxUnitBlockPaperCount: 0,
    doi2paperBlockPos: {},
    author2Count: {},
    authorCountList: [],
    countryCountList: [],
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
          list: ["Classic", "China", "Japan", "Korea"],
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

    get doi2colors() {
      const doi2colors = {};
      this.papers.forEach((paper) => {
        for (let keyAttr in this.activeTags) {
          const hightlightAttrs = this.activeTags[keyAttr];
          hightlightAttrs.forEach((attr) => {
            if (paper[keyAttr].indexOf(attr) > -1) {
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
      return doi2colors;
    },

    doi2privateTags: {},
    doi2publicTags: {},
    doi2comments: {},

    maxCitationCount: 200,

    currentSelected: "",
    setCurrentSelected(doi) {
      this.currentSelected = doi;
    },
  };
};

export default createStore;

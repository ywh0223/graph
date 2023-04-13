<template>
  <div class="graph-container">
    <leftbar
      @showInGraph="showInGraph"
      @clearGraph="clearGraph"
      :activeItem="activeItem"
      ref="leftbar"
      @deletePlanEntity="deletePlanEntity"
      @updateItem="updateItem"
    ></leftbar>
    <div class="main">
      <headbar :nodes="showingNodes" :edges="showingEdges"></headbar>
      <div id="container">
        <div class="editbar">
          <!-- <el-button
            type="primary"
            plain
            size="small"
            v-if="$route.params.type == 'edit'"
            @click="newServiceCategory"
            >新建业务类别</el-button
          > -->
          <el-button style="width: 100%" size="small" @click="clearGraph"
            >清空图谱</el-button
          >
        </div>
      </div>
      <footbar
        :footItem="hoverItem"
        @changeColor="changeColor"
        @changeSize="changeSize"
      ></footbar>
    </div>
  </div>
</template>

<script>
import G6 from "@antv/g6";
import eventBus from "@/utils/eventBus";
// import { deepMix, isNumber, isArray } from "@antv/util";
import leftbar from "./leftbar";
import headbar from "./headbar";
import footbar from "./footbar";
import AddEntity from "./AddEntity";
import { eksApi } from "@/api";
// 过滤label长度
const fittingString = (str, maxWidth, fontSize) => {
  const ellipsis = "...";
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters
  str.split("").forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return;
    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize;
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth > maxWidth - ellipsisLength) {
      res = `${str.substr(0, i)}${ellipsis}`;
    }
  });
  return res;
};

const globalFontSize = 12;
const nodeSize = 60;
const menusize = 35;
const color = [
  "#C990C0",
  "#F79767",
  "#57C7E3",
  "#F16667",
  "#569480",
  "#90ee90",
];

export default {
  name: "graph",
  data() {
    return {
      editMode: false,
      graph: null,
      hoverItem: null,
      // 菜单展开的item
      activeItem: null,
      activeItemMenu: false,
      typeNodes: [],
      planNodes: [],
      nodes: [],
      edges: [],
    };
  },
  components: {
    leftbar,
    headbar,
    footbar,
    AddEntity,
  },
  computed: {
    showingNodes() {
      if (this.graph) {
        return this.graph.getNodes().filter((item) => {
          return item.isVisible();
        });
      }
    },
    showingEdges() {
      // return this.edges.filter((item) => {
      //   return item.isVisible();
      // });
      if (this.graph) {
        return this.graph.getEdges().filter((item) => {
          return item.isVisible();
        });
      }
    },
  },
  created() {
    this.editMode = this.$route.params.type == "edit" ? true : false;
    eventBus.$on("getNextNodes", (source) => {
      console.log("添加了");
      console.log(source);
      this.getNextNodes(source);
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
      if (this.$route.query.serviceCategory) {
        let _item = JSON.parse(this.$route.query.serviceCategory);
        this.showInGraph(_item);
      }
    });
  },
  watch: {
    $route(newVal) {
      console.log(this.editMode, newVal);
      this.editMode = newVal.params.type == "edit" ? true : false;
    },
  },
  methods: {
    // 创建业务类别
    async createPlanEntity() {},
    init() {
      G6.registerNode("customNode", {
        draw(cfg, group) {
          // console.log(group);
          const keyShape = group.addShape("circle", {
            attrs: {
              r: nodeSize / 2,
              fill: cfg.style.fill,
              cursor: "pointer",
            },
            name: "key-shape",
            draggable: true,
            zIndex: 1000,
          });
          const label = group.addShape("text", {
            // attrs: style
            attrs: {
              x: 0, // 居中
              y: 0,
              textAlign: "center",
              textBaseline: "middle",
              text: cfg.label,
              fill: "#666",
              cursor: "pointer",
            },
            name: "text-shape",
            // 设置 draggable 以允许响应鼠标的图拽事件
            draggable: true,
            zIndex: 1000,
          });
          return keyShape;
        },

        setState(name, value, item) {
          const group = item.getContainer();
          // const model = item.getModel()
          const shape = group.find((item) => {
            return item.cfg.name === "key-shape";
          }); // 顺序根据 draw 时确定
          // console.log("leave", shape);
          if (name === "hover") {
            if (value) {
              // shape.attr("stroke", "#CFEBFE");
              // shape.attr("lineWidth", 8);
              // shape.attr("r", shape.attr("r") + 4);
              // this.graph.updateItem(item,model)
              group.addShape("circle", {
                attrs: {
                  r: shape.attr("r") + 8,
                  fill: "rgba(106, 198, 255,0.3)",
                  cursor: "pointer",
                },
                name: "ring-shape",
                draggable: true,
                zIndex: 100,
              });
              group.sort();
            } else {
              const ringShape = group.find(
                (element) => element.get("name") === "ring-shape"
              );
              group.removeChild(ringShape);
              // this.graph.updateItem(item,model)
            }
          } else if (name === "menuState") {
            const menuGroup = group.findById("menuGroup");
            const lshape =
              menuGroup &&
              menuGroup.find((item) => {
                return item.cfg.name === "lshape";
              });
            const rshape =
              menuGroup &&
              menuGroup.find((item) => {
                return item.cfg.name === "rshape";
              });
            if (value === "lmenuActive") {
              lshape && lshape.attr("fill", "#B9B9B9");
              rshape && rshape.attr("fill", "#D2D5DA");
            } else if (value === "rmenuActive") {
              console.log("rmenuActive");
              lshape && lshape.attr("fill", "#D2D5DA");
              rshape && rshape.attr("fill", "#B9B9B9");
            } else {
              lshape && lshape.attr("fill", "#D2D5DA");
              rshape && rshape.attr("fill", "#D2D5DA");
            }
          } else if (name === "editMenuState") {
            const menuGroup = group.findById("menuGroup");
            const fanShape =
              menuGroup &&
              menuGroup.findAll((item) => {
                return item.cfg.name.indexOf("fan-shape") != -1;
              });
            console.log(fanShape);
            fanShape &&
              fanShape.forEach((item) => {
                item.attr("fill", "#D2D5DA");
              });
            console.log(value);
            if (value) {
              fanShape && fanShape[parseInt(value)].attr("fill", "#B9B9B9");
            }
          }
        },
      });
      const container = document.getElementById("container");
      const width = document.documentElement.clientWidth - 270 - 150;
      const height = document.documentElement.clientHeight - 170;
      const graph = new G6.Graph({
        container: "container",
        width,
        height,
        // renderer:'svg',
        // groupByTypes:false,
        defaultEdge: {
          type: "line",
          // 其他配置
          style: {
            startArrow: false,
            endArrow: {
              // path: 'M 0,0 L 8,4 L 8,-4 Z'
              path: G6.Arrow.triangle(10, 15, 10),
              d: 10,
            },
          },
          labelCfg: {
            autoRotate: true,
            refY: 12,
            style: {
              fontSize: 12,
            },
          },
        },
        // defaultNode: {
        //   nodeSize: 60
        // },
        // enabledStack: true,
        animate: true,
        layout: {
          type: "gForce",
          gravity: 15,
          preventOverlap: true,
          // 越小移动越久
          minMovement: 0.3,
          maxIteration: 500,
          // gatherDiscrete: true,
          nodeSize: 60,
          nodeSpacing: 100,
          nodeStrength: 1000,
          edgeStrength: 5000,
          damping: 0.99,
          maxSpeed: 1000000,
          // gpuEnabled: true,
          // workerEnabled:true,
          //gatherDiscreteCenter: [500, 100],
          // descreteGravity: 200,
          // coulombDisScale:0.004,
          // nodeCollideStrength:0.8,
          linkDistance: (e) => {
            // if (e.source === '0') return 10;
            return 100;
          },
          getMass: (d) => {
            if (d.entityCategory == "业务类别") {
              return 1000;
            } else if (d.entityCategory == "应急预案") {
              return 1000;
            } else if (d.entityCategory == "政府机构") {
              return 100;
            } else if (d.entityCategory == "处置要素") {
              return 50;
            } else {
              return 20;
            }
          },
          // getCenter:(d) => {
          //   if(d.entityCategory == "应急预案") {
          //     return [0,0,50]
          //   }

          // }
        },

        modes: {
          default: ["drag-canvas", "drag-node", "zoom-canvas"],
        },
      });

      graph.on("node:dragstart", function (e) {
        // graph.layout();
        refreshDragedNodePosition(e);
      });
      graph.on("node:drag", function (e) {
        refreshDragedNodePosition(e);
        // graph.layout();
        //   graph.paint()
        // graph.setAutoPaint(false)
      });
      graph.on("node:dragend", function (e) {
        // e.item.get("model").fx = null;
        // e.item.get("model").fy = null;

        // console.log(e.item);
        // graph.refreshItem(e.item)
        // graph.updateItem(e.item,e.item.getModel())
        //  graph.refresh()
        graph.layout();
        // graph.paint();
        // graph.setAutoPaint(true);
        // graph.layout()
        // graph.refreshPositions()
      });
      graph.on("node:click", (e) => {
        console.log(e.item);
        this.handleNodeClick(e);
      });
      graph.on("node:mouseenter", (e) => {
        this.hoverItem = e.item;
        graph.setItemState(e.item, "hover", true);
        // e.bubbles = false
        // e.propagationStopped = true
        console.log(e.item);
      });
      graph.on("node:mouseleave", (e) => {
        console.log("leave");
        this.hoverItem = null;
        // graph.refreshItem(e.item)
        graph.setItemState(e.item, "hover", false);
        graph.setItemState(e.item, "menuState", null);
        graph.setItemState(e.item, "editMenuState", null);

        graph.clearItemStates(e.item);
        if (this.activeItem) {
          // graph.setItemState(e.item, "hover", false);
          graph.setItemState(this.activeItem, "hover", true);
        } else {
          //  graph.clearItemStates(e.item)
        }
        // graph.refreshItem(e.item)
      });
      graph.on("node:mousemove", (e) => {
        console.log("move", e.target);
        const target = e.target;
        if (target.cfg.name === "lshape" || target.cfg.name === "licon") {
          // graph.clearItemStates(e.item,"menuState")
          graph.setItemState(e.item, "menuState", "lmenuActive");
        } else if (
          target.cfg.name === "rshape" ||
          target.cfg.name === "ricon"
        ) {
          console.log("rshape");
          // graph.clearItemStates(e.item)
          graph.setItemState(e.item, "menuState", "rmenuActive");
        } else if (target.cfg.name.indexOf("fan-shape") != -1) {
          console.log("edit", target.cfg.name);
          const length = target.cfg.name.length;
          graph.setItemState(
            e.item,
            "editMenuState",
            target.cfg.name.charAt(length - 1)
          );
        } else {
          // graph.clearItemStates(e.item)
          graph.setItemState(e.item, "menuState", null);
          graph.setItemState(e.item, "editMenuState", null);
        }
      });
      graph.on("canvas:click", (e) => {
        console.log(e);
        if (this.activeItem) {
          this.hideMenu(this.activeItem);
          this.graph.clearItemStates(this.activeItem);
          this.activeItem = null;
          this.graph.paint();
        }
      });
      // 画布自适应
      if (typeof window !== "undefined")
        window.onresize = () => {
          if (!graph || graph.get("destroyed")) return;
          if (!container || !container.scrollWidth || !container.scrollHeight)
            return;
          if (document.documentElement.clientWidth > 1200) {
            graph.changeSize(
              document.documentElement.clientWidth - 270,
              document.documentElement.clientHeight - 170
            );
          }
        };

      function refreshDragedNodePosition(e) {
        const model = e.item.get("model");
        model.fx = e.x;
        model.fy = e.y;
      }
      this.graph = graph;
    },
    drawNodesByList(source, list, color) {
      const nodes = list.map((item) => {
        // if (source) {
        //   const model = source.getModel();
        //   item.serviceCategory = model.serviceCategory;
        // }
        item.id = "node" + item.rowKey;
        item.type = "customNode";
        item.entityName =
          item.agencyName ||
          item.entityName ||
          item.planName ||
          item.elementContent ||
          item.organizationName ||
          item.serviceCategoryName ||
          item.entityCategory;
        item.label = fittingString(item.entityName, nodeSize, globalFontSize);
        // item.contextPlan = node.entityName;
        item.style = {
          fill: color,
        };
        return Object.assign({}, item);
      });
      nodes.forEach((item) => {
        if (this.isNodeExist(item.id) == 0) {
          this.graph.addItem("node", item);
        } else {
          const existNode = this.graph.findById(item.id);
          this.graph.showItem(existNode);
        }

        if (source) {
          const model = source.getModel();
          let relation;
          let edgeColor;
          let edgeWidth;
          if (model.entityCategory === "业务类别") {
            relation = "涵盖";
            edgeColor = "#569480";
            edgeWidth = 10;
          } else if (model.entityCategory === "应急预案") {
            relation = "指导";
            edgeColor = "#4C8EDA";
            edgeWidth = 5;
          } else if (model.entityCategory === "政府机构") {
            relation = "负责";
            edgeColor = "#604A0E";
            edgeWidth = 3;
            if (item.entityCategory == "业务组织") {
              relation = "汇报";
              edgeColor = "#FFC454";
            }
          } else if (model.entityCategory === "处置要素") {
            relation = "包含";
            edgeColor = "#ffd700";
            edgeWidth = 2;
          }
          this.graph.addItem("edge", {
            id: model.rowKey + "edge" + item.rowKey,
            source: model.id,
            target: item.id,
            label: relation,
            style: {
              stroke: edgeColor,
              lineWidth: edgeWidth,
            },
          });
        }

        // 重新布局
        this.graph.layout();
      });
    },
    showInGraph(item) {
      console.log(item);
      this.drawNodesByList(null, [item], color[0]);
      // this.getNodesByPlan(item, true);
      // this.getNodesByCategory(item, true);
    },
    handleNodeClick(e) {
      const name = e.target.cfg.name;
      if (this.activeItem) {
        // this.showNodeMenu(e.item)
        if (e.item === this.activeItem) {
          const target = e.target;
          // 发散按钮
          if (
            target.cfg.name === "lshape" ||
            target.cfg.name === "licon" ||
            name === "fan-shape-1"
          ) {
            this.handleNodeExpandClick(e.item);
            // 隐藏按钮
          } else if (
            target.cfg.name === "rshape" ||
            target.cfg.name === "ricon" ||
            name === "fan-shape-0"
          ) {
            this.graph.hideItem(e.item);
            const model = e.item.getModel();

            // 隐藏下级
            this.hideNextNodes(model.id);
            model.isExpand = false;
            // 判断上级的isExpand 可见节点为0 isExpand 设为false
            const sourceNodes = e.item.getNeighbors("source");
            sourceNodes.forEach((item) => {
              const targetNodes = item.getNeighbors("target");
              const visibleNodes = targetNodes.filter((node) => {
                return node.isVisible();
              });
              if (!visibleNodes.length) {
                item.getModel().isExpand = false;
              }
            });

            this.hideMenu(e.item);
            this.activeItem = null;
          } else if (name === "fan-shape-2") {
            const entityCategory = this.activeItem.getModel().entityCategory;
            if (entityCategory == "处置要素") {
              this.$message.warning("该节点没有下级实体");
              return;
            }
            this.$refs.leftbar.activeName = "third";
            eventBus.$emit("getSource", e.item);
            console.log("添加");
          } else {
            // this.showNodeMenu(e.item);
            // this.activeItemMenu = true;
            // this.activeItem = e.item;

            this.hideMenu(e.item);
            // this.activeItemMenu = false;
            this.activeItem = null;
          }
        } else {
          this.hideMenu(this.activeItem);
          this.graph.clearItemStates(this.activeItem);
          // this.activeItemMenu = false;
          this.activeItem = e.item;
          this.showMenu(e.item);
          // this.handleNodeClick(e);
        }
      } else {
        // this.hideNodeMenu(this.activeItem);
        this.showMenu(e.item);
        this.$refs.leftbar.activeName = "second";
        // this.showEditMenu(e.item);
        // const node = this.graph.findById(e.item.getModel().id)
        // node.refresh()
        // this.graph.refreshItem(node)
        this.activeItem = e.item;
      }
      eventBus.$emit("getSource", this.activeItem);
    },
    showMenu(node) {
      if (this.editMode) {
        this.showEditMenu(node);
      } else {
        this.showNodeMenu(node);
      }
    },
    hideMenu(node) {
      if (this.editMode) {
        this.hideEditMenu(node);
      } else {
        this.hideEditMenu(node);
      }
    },
    // 两个菜单
    // showNodeMenu(node) {
    //   const group = node.get("group");
    //   const r = group.getFirst().attr("r");

    //   console.log(r);
    //   const menuGroup = group.addGroup({
    //     id: "menuGroup",
    //     name: "menu-group",
    //     capture: true,
    //     zIndex: -1000,
    //   });
    //   // console.log(group);
    //   const gapshape = group.addShape("path", {
    //     attrs: {
    //       path: [
    //         ["M", 0, -r - menusize],
    //         ["L", 0, r + menusize],
    //       ],
    //       stroke: "#fff",
    //       lineWidth: 2,
    //     },
    //     name: "gap-shape",
    //     zIndex: -10,
    //   });
    //   const rshape = menuGroup.addShape("circle", {
    //     attrs: {
    //       x: 0,
    //       y: 0,
    //       r: r+8,
    //       fill: "#D2D5DA",
    //       cursor: "pointer",
    //     },
    //     // dragable:true,
    //     name: "rshape",
    //     zIndex: -2000,
    //   });
    //   const lshape = menuGroup.addShape("circle", {
    //     attrs: {
    //       x: 0,
    //       y: 0,
    //       r: r+8,
    //       fill: "#D2D5DA",
    //       cursor: "pointer",
    //     },
    //     // dragable:true,
    //     name: "lshape",
    //     zIndex: -2000,
    //   });
    //   // 图标
    //   const ricon = menuGroup.addShape("text", {
    //     attrs: {
    //       x: r + menusize / 2,
    //       y: 0,
    //       fontFamily: "iconfont",
    //       textAlign: "center",
    //       textBaseline: "middle",
    //       text: "\ue7d1",
    //       fontSize: 20,
    //       fill: "#2A2C34",
    //       opacity: 0,
    //       cursor: "pointer",
    //     },
    //     name: "ricon",
    //     zIndex: -2000,
    //   });
    //   const licon = menuGroup.addShape("text", {
    //     attrs: {
    //       x: -r - menusize / 2,
    //       y: 0,
    //       fontFamily: "iconfont",
    //       textAlign: "center",
    //       textBaseline: "middle",
    //       text: "\ue865",
    //       fontSize: 20,
    //       fill: "#2A2C34",
    //       opacity: 0,
    //       cursor: "pointer",
    //     },
    //     name: "licon",
    //     zIndex: -2000,
    //   });
    //   ricon.animate(
    //     { opacity: 1 },
    //     {
    //       repeat: false,
    //       duration: 200,
    //       easing: "easePolyIn",
    //     }
    //   );
    //   licon.animate(
    //     { opacity: 1 },
    //     {
    //       repeat: false,
    //       duration: 200,
    //       easing: "easePolyIn",
    //     }
    //   );
    //   rshape.setClip({
    //     type: "rect",
    //     show: "true",
    //     attrs: {
    //       x: 0,
    //       y: -r - menusize,
    //       width: r + menusize,
    //       height: r * 2 + menusize * 2,
    //     },
    //   });
    //   lshape.setClip({
    //     type: "rect",
    //     show: "true",
    //     attrs: {
    //       x: -r - menusize-8,
    //       y: -r - menusize-8,
    //       width: r + menusize,
    //       height: r * 2 + menusize * 2,
    //     },
    //   });
    //   rshape.animate(
    //     // const diff = ratio <= 0.5 ? ratio * 10 : (1 - ratio) * 10;
    //     {
    //       r: r + menusize+8,
    //     },
    //     {
    //       repeat: false,
    //       duration: 200,
    //       easing: "easePolyIn",
    //     }
    //   );
    //   lshape.animate(
    //     // const diff = ratio <= 0.5 ? ratio * 10 : (1 - ratio) * 10;
    //     {
    //       r: r + menusize+8,
    //     },
    //     {
    //       repeat: false,
    //       duration: 200,
    //       easing: "easePolyIn",
    //     }
    //   );
    //   group.sort();
    //   // return group
    //   // node.refresh()
    //   // this.graph.refreshItem(node)
    //   // this.activeItem = node
    // },
    // hideNodeMenu(node) {
    //   const group = node.get("group");
    //   const menuGroup = group.findById("menuGroup");
    //   const gapshape = group.getChildByIndex(1);
    //   // console.log(menuGroup);
    //   const menushape = menuGroup.get("children");
    //   console.log(menushape);
    //   menushape.forEach((item) => {
    //     const r = item.attr("r");
    //     console.log(r);
    //     if (!r) {
    //       return;
    //     }
    //     item.animate(
    //       // const diff = ratio <= 0.5 ? ratio * 10 : (1 - ratio) * 10;
    //       {
    //         r: r - menusize,
    //       },
    //       {
    //         repeat: false,
    //         duration: 200,
    //         easing: "easePolyIn",
    //       }
    //     );
    //   });
    //   setTimeout(() => {
    //     group.removeChild(menuGroup);
    //     group.removeChild(gapshape);
    //     this.graph.refreshItem(node);
    //     // this.graph.updateItem(node,node.getModel())
    //     this.graph.paint();
    //     this.graph.layout();
    //   }, 200);
    //   // console.log(group)
    // },

    showNodeMenu(node) {
      const group = node.get("group");
      console.log(group);
      const menuGroup = group.addGroup({
        id: "menuGroup",
        name: "menu-group",
        capture: true,
        zIndex: -2000,
      });
      // +4 加的key-shape描边宽度的一半
      const innerR = group.getFirst().attr("r");
      console.log(innerR);
      const donutR = innerR + menusize;
      let pathA = [
        ["M", 1, -donutR],
        ["A", donutR, donutR, 0, 0, 1, 1, donutR],
        ["L", 1, innerR],
        ["A", innerR - 1, innerR, 0, 0, 0, 1, -innerR],
        ["L", 1, -innerR],
      ];
      let pathB = [
        ["M", -1, -donutR],
        ["A", donutR, donutR, 0, 0, 0, -1, donutR],
        ["L", -1, innerR],
        ["A", innerR - 1, innerR, 0, 0, 1, -1, -innerR],
        ["L", -1, -innerR],
      ];
      const menuList = [pathA, pathB];
      menuList.forEach((item, i) => {
        let fanShape = menuGroup.addShape("path", {
          attrs: {
            path: item,
            fill: "#D2D5DA",
            cursor: "pointer",
            opacity: 0,
          },
          name: `fan-shape-${i}`,
          draggable: true,
          capture: true,
          zIndex: 2000,
        });
        // if(i == 0) {
        //   fanShape.translate(2,2)
        // } else if (i == 1) {
        //   fanShape.translate(-2,0)
        // } else {
        //   fanShape.translate(2,-2)
        // }

        fanShape.animate(
          {
            opacity: 1,
          },
          {
            repeat: false,
            duration: 200,
            easing: "easeLinear",
          }
        );
      });
      const ricon = menuGroup.addShape("text", {
        attrs: {
          x: innerR + menusize / 2,
          y: 0,
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue7d1",
          fontSize: 20,
          fill: "#2A2C34",
          opacity: 0,
          cursor: "pointer",
        },
        name: "ricon",
        zIndex: -2000,
      });
      const licon = menuGroup.addShape("text", {
        attrs: {
          x: -innerR - menusize / 2,
          y: 0,
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue865",
          fontSize: 20,
          fill: "#2A2C34",
          opacity: 0,
          cursor: "pointer",
        },
        name: "licon",
        zIndex: -2000,
      });
      ricon.animate(
        { opacity: 1 },
        {
          repeat: false,
          duration: 200,
          easing: "easeLinear",
        }
      );
      licon.animate(
        { opacity: 1 },
        {
          repeat: false,
          duration: 200,
          easing: "easeLinear",
        }
      );
      group.sort();
    },
    // 三个菜单
    showEditMenu(node) {
      console.log(node);
      const group = node.get("group");
      console.log(group);
      const menuGroup = group.addGroup({
        id: "menuGroup",
        name: "menu-group",
        capture: true,
        zIndex: -2000,
      });
      // +4 加的key-shape描边宽度的一半
      const innerR = group.getFirst().attr("r");
      console.log(innerR);
      const donutR = innerR + menusize;
      let pathA = [
        ["M", donutR, 0],
        [
          "A",
          donutR,
          donutR,
          0,
          0,
          1,
          -donutR / 2,
          donutR * Math.cos(Math.PI / 6),
        ],
        ["L", -innerR / 2, innerR * Math.cos(Math.PI / 6)],
        ["A", innerR, innerR, 0, 0, 0, innerR, 0],
        ["L", donutR, 0],
      ];
      let pathB = [
        ["M", -donutR / 2, donutR * Math.cos(Math.PI / 6)],
        [
          "A",
          donutR,
          donutR,
          0,
          0,
          1,
          -donutR / 2,
          -donutR * Math.cos(Math.PI / 6),
        ],
        ["L", -innerR / 2, -innerR * Math.cos(Math.PI / 6)],
        [
          "A",
          innerR,
          innerR,
          0,
          0,
          0,
          -innerR / 2,
          innerR * Math.cos(Math.PI / 6),
        ],
        ["L", -donutR / 2, donutR * Math.cos(Math.PI / 6)],
      ];
      let pathC = [
        ["M", -donutR / 2, -donutR * Math.cos(Math.PI / 6)],
        ["A", donutR, donutR, 0, 0, 1, donutR, 0],
        ["L", innerR, 0],
        [
          "A",
          innerR,
          innerR,
          0,
          0,
          0,
          -innerR / 2,
          -innerR * Math.cos(Math.PI / 6),
        ],
        ["L", -donutR / 2, -donutR * Math.cos(Math.PI / 6)],
      ];
      const menuList = [pathA, pathB, pathC];
      menuList.forEach((item, i) => {
        let fanShape = menuGroup.addShape("path", {
          attrs: {
            path: item,
            fill: "#D2D5DA",
            cursor: "pointer",
            opacity: 0,
          },
          name: `fan-shape-${i}`,
          draggable: true,
          capture: true,
          zIndex: 2000,
        });
        // if(i == 0) {
        //   fanShape.translate(2,2)
        // } else if (i == 1) {
        //   fanShape.translate(-2,0)
        // } else {
        //   fanShape.translate(2,-2)
        // }

        fanShape.animate(
          {
            opacity: 1,
          },
          {
            repeat: false,
            duration: 200,
            easing: "easeLinear",
          }
        );
      });
      //
      // 图标
      const ricon = menuGroup.addShape("text", {
        attrs: {
          x: donutR / 2,
          y: donutR / 2 + 5,
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue7d1",
          fontSize: 22,
          fill: "#2A2C34",
          opacity: 0,
          cursor: "pointer",
        },
        capture: false,
        name: "ricon",
        zIndex: -2000,
      });
      const uicon = menuGroup.addShape("text", {
        attrs: {
          x: donutR / 2,
          y: -donutR / 2 - 5,
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue67e",
          fontSize: 20,
          fill: "#2A2C34",
          opacity: 0,
          cursor: "pointer",
        },
        capture: false,
        name: "uicon",
        zIndex: -2000,
      });
      const licon = menuGroup.addShape("text", {
        attrs: {
          x: -innerR - menusize / 2,
          y: 0,
          fontFamily: "iconfont",
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue865",
          fontSize: 20,
          fill: "#2A2C34",
          opacity: 0,
          cursor: "pointer",
        },
        capture: false,
        name: "licon",
        zIndex: -2000,
      });
      ricon.animate(
        { opacity: 1 },
        {
          repeat: false,
          duration: 200,
          easing: "easeLinear",
        }
      );
      uicon.animate(
        { opacity: 1 },
        {
          repeat: false,
          duration: 200,
          easing: "easeLinear",
        }
      );
      licon.animate(
        { opacity: 1 },
        {
          repeat: false,
          duration: 200,
          easing: "easeLinear",
        }
      );
      menuGroup.addShape("path", {
        attrs: {
          path: [
            ["M", 0, 0],
            ["L", donutR, 0],
          ],
          stroke: "#fff",
          lineWidth: 2,
        },
        name: "gap-shape",
        zIndex: -2000,
        // cursor: "pointer"
      });
      menuGroup.addShape("path", {
        attrs: {
          path: [
            ["M", 0, 0],
            ["L", -donutR / 2, -donutR * Math.cos(Math.PI / 6)],
          ],
          stroke: "#fff",
          lineWidth: 2,
          // cursor: "pointer"
        },
        name: "gap-shape",
        zIndex: -2000,
      });
      menuGroup.addShape("path", {
        attrs: {
          path: [
            ["M", 0, 0],
            ["L", -donutR / 2, donutR * Math.cos(Math.PI / 6)],
          ],
          stroke: "#fff",
          lineWidth: 2,
          // cursor: "pointer"
        },
        name: "gap-shape",
        zIndex: -2000,
      });
      // menuGroup.sort()
      group.sort();
      // this.graph.paint();
      // node.refresh()
      // this.graph.refreshItem(node)
      // this.graph.layout();
    },
    hideEditMenu(node) {
      const group = node.get("group");
      const menuGroup = group.findById("menuGroup");
      const menushape = menuGroup.findAll((item) => {
        return item.get("name").indexOf("fan-shape") != -1;
      });
      const menuIcon = menuGroup.findAll((item) => {
        return item.get("name").indexOf("icon") != -1;
      });
      menushape.forEach((item) => {
        // if (!r) {
        //   return;
        // }
        item.animate(
          // const diff = ratio <= 0.5 ? ratio * 10 : (1 - ratio) * 10;
          {
            opacity: 0,
          },
          {
            repeat: false,
            duration: 200,
            easing: "easeLinear",
          }
        );
      });
      menuIcon.forEach((item) => {
        item.animate(
          {
            opacity: 0,
          },
          {
            repeat: false,
            duration: 200,
            easing: "easeLinear",
          }
        );
      });
      setTimeout(() => {
        group.removeChild(menuGroup);
        this.graph.paint();
        this.graph.layout();
        // group.removeChild(gapshape);
        // menuGroup.clear();
      }, 200);
    },
    handleNodeExpandClick(node) {
      console.log(node.getModel());
      const model = node.getModel();
      const nextNodes = node.getNeighbors("target");
      if (model.isExpand) {
        this.hideNextNodes(model.id);
        model.isExpand = false;
      } else {
        if (nextNodes.length) {
          this.showNextNodes(model.id);
          model.isExpand = true;
        } else {
          this.getNextNodes(node);
          model.isExpand = true;
        }
      }
    },
    hideNextNodes(id) {
      const node = this.graph.findById(id);
      const nextNodes = node.getNeighbors("target");
      nextNodes.forEach((item) => {
        this.graph.hideItem(item);
        // 隐藏下级的下级
        if (item.getNeighbors("target").length) {
          this.hideNextNodes(item.getModel().id);
          item.getModel().isExpand = false;
        }
      });
    },
    showNextNodes(id) {
      const node = this.graph.findById(id);
      const nextNodes = node.getNeighbors("target");
      // 显示下级的下级
      nextNodes.forEach((item) => {
        this.graph.showItem(item);
        if (item.getNeighbors("target").length) {
          this.showNextNodes(item.getModel().id);
          item.getModel().isExpand = true;
        }
      });
    },
    // 根据业务类别请求
    async getNodesByCategory(node) {
      const model = node.getModel();
      try {
        let res = await eksApi.getFirstDetailsWithServiceCategory({
          indexValue: model.rowKey,
          indexType: 1,
          // 业务类别肯定是根节点
          isRootNode: true,
        });
        if (
          res.data.data &&
          res.data.data.includeRelation &&
          res.data.data.includeRelation.length != 0
        ) {
          const list = res.data.data.includeRelation.map((item) => {
            item.serviceCategory = model.entityName;
            return item;
          });

          this.drawNodesByList(node, list, color[1]);
        } else {
          this.$message.warning("暂无下游节点");
        }
      } catch (error) {
        this.$message.error(error);
      }
      // this.$axios({
      //   method: "get",
      //   url: "/graph/EmergencyPlanKnowledgeService/getFirstDetailsWithServiceCategory",
      //   params: {
      //     indexValue: model.rowKey,
      //     indexType: 1,
      //     // 业务类别肯定是根节点
      //     isRootNode: true,
      //   },
      // })
      //   .then((res) => {
      //     if (res.data.data.includeRelation.length != 0) {
      //       const list = res.data.data.includeRelation.map((item) => {
      //         item.serviceCategory = model.entityName;
      //         return item;
      //       });

      //       this.drawNodesByList(node, list, color[1]);
      //     }
      //   })
      //   .catch((err) => {
      //     alert("请求出错");
      //   });
    },
    async getNodesByPlan(node, isRoot) {
      const model = node.getModel();
      try {
        let res = await eksApi.getFirstDetailsWithEmergencyPlan({
          indexValue: model.rowKey,
          indexType: 1,
          // serviceCategory: model.serviceCategory,
          isRootNode: isRoot,
        });
        if (
          res.data.data &&
          res.data.data.guidingRelation &&
          res.data.data.guidingRelation.length != 0
        ) {
          const list = res.data.data.guidingRelation.map((item) => {
            item.serviceCategory = model.serviceCategory;
            return item;
          });
          this.drawNodesByList(node, list, color[2]);
        } else {
          this.$message.warning("暂无下游节点");
        }
      } catch (error) {
        this.$message.error(error);
      }
      // this.$axios({
      //   method: "get",
      //   url: "/graph/EmergencyPlanKnowledgeService/getFirstDetailsWithEmergencyPlan",
      //   params: {
      //     indexValue: model.rowKey,
      //     indexType: 1,
      //     serviceCategory: model.serviceCategory,
      //     isRootNode: isRoot,
      //   },
      // })
      //   .then((res) => {
      //     if (
      //       res.data.data == null ||
      //       res.data.data.guidingRelation.length == 0
      //     ) {
      //       alert("暂无数据");
      //     } else {
      //       const list = res.data.data.guidingRelation.map((item) => {
      //         item.serviceCategory = model.serviceCategory;
      //         return item;
      //       });
      //       this.drawNodesByList(node, list, color[2]);
      //     }
      //   })
      //   .catch((err) => {
      //     alert("请求出错");
      //   });
    },
    async getNodesByAgency(node) {
      const model = node.getModel();

      //
      if (!model.serviceCategory) {
        return;
      }
      //
      // const serviceCategory = node
      //   .getNeighbors("source")[0]
      //   .getNeighbors("source")[0]
      //   .getModel().entityName;
      const serviceCategory = model.serviceCategory;
      const contextPlan = node.getNeighbors("source")[0].getModel().entityName;
      try {
        let res = await eksApi.getFirstDetailsWithGovernmentAgency({
          indexValue: model.rowKey,
          indexType: 1,
          serviceCategory: serviceCategory,
          contextPlan: contextPlan,
        });
        if (!res.data.data) {
          this.$message.warning("暂无下游节点");
        }
        if (
          res.data.data &&
          res.data.data.responsibleToRelation &&
          res.data.data.responsibleToRelation.length != 0
        ) {
          this.drawNodesByList(
            node,
            res.data.data.responsibleToRelation,
            color[3]
          );
        }
        if (
          res.data.data &&
          res.data.data.reportToRelation &&
          res.data.data.responsibleToRelation.length != 0
        ) {
          this.drawNodesByList(node, res.data.data.reportToRelation, color[4]);
        }
        if (
          res.data.data &&
          !res.data.data.responsibleToRelation &&
          !res.data.data.responsibleToRelation
        ) {
          this.$message.warning("暂无下游节点");
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    async getNodesByElement(node) {
      const model = node.getModel();
      try {
        let res = await eksApi.getFirstDetailsWithPlanElement({
          elementRowKey: model.rowKey,
        });

        if (
          res.data.data &&
          res.data.data.includingByRelation &&
          res.data.data.includingByRelation.length != 0
        ) {
          const list = res.data.data.includingByRelation.map((item) => {
            item.attributes = Object.assign({}, item);
            item.fatherEntityCategory = "责任事件";
            delete item.attributes.rowKey;
            delete item.attributes.entityCategory;
            return item;
          });
          this.drawNodesByList(node, list, color[5]);
        } else {
          this.$message.warning("暂无下游节点");
        }
      } catch (error) {
        // this.$message.warning("暂无下游节点");
        this.$message.error(error);
      }
    },
    getNextNodes(node) {
      const entityCategory = node.getModel().entityCategory;
      if (entityCategory === "业务类别") {
        this.getNodesByCategory(node);
      } else if (entityCategory === "应急预案") {
        if (node.getNeighbors("source").length) {
          console.log("不是根节点");
          this.getNodesByPlan(node, false);
        } else {
          console.log("是根节点");
          this.getNodesByPlan(node, true);
        }
      } else if (entityCategory === "政府机构") {
        console.log("getNodesByAgency");
        this.getNodesByAgency(node);
      } else if (entityCategory === "处置要素") {
        this.getNodesByElement(node); // 责任事件 包含
      } else {
        this.$message.warning("暂无下游节点");
      }
    },
    // 判断节点是否已存在
    isNodeExist(id) {
      const nodes = this.graph.getNodes();
      // console.log(nodes)
      // console.log(id)
      var res = nodes.filter((node) => {
        let _id = node.getModel().id;
        // 超过一行记得return！！
        return _id == id;
      });
      console.log(res.length);
      return res.length;
    },
    changeNodeSize(node, size) {
      const model = node.getModel();
      model.size = size;
      this.graph.updateItem(node, model);
      this.graph.refresh();
      this.graph.layout();
    },
    changeColor(color, type, category) {
      console.log(color, type, category);
      if (type === "node") {
        const nodes = this.graph.getNodes();
        nodes.forEach((node) => {
          const model = node.getModel();
          const keyShape = node.get("group").find((item) => {
            return item.cfg.name === "key-shape";
          });
          if (model.entityCategory === category) {
            keyShape.attr("fill", color);
            model.style.fill = color;
            // this.graph.updateItem(node, model);
          }
        });
        // this.graph.refresh();
        // this.graph.layout();
      } else {
        const edges = this.graph.getEdges();
        // const _edges = Array.from(edges)
        edges.forEach((edge) => {
          const model = edge.getModel();
          if (model.label === category) {
            console.log(model);
            // console.log(edge)
            model.style.stroke = color;
            this.graph.updateItem(edge, model);
            // this.graph.refresh();
          }
        });
      }

      this.graph.refresh();
      this.graph.layout();
    },
    changeSize(size, type, category) {
      if (type === "node") {
        const nodes = this.graph.getNodes();
        nodes.forEach((node) => {
          console.log(node);

          const keyShape = node.get("group").find((item) => {
            return item.cfg.name === "key-shape";
          });
          const model = node.getModel();
          if (model.entityCategory === category) {
            keyShape.attr("r", size / 2);
            // this.graph.updateItem(node, model);
          }
        });
        // this.graph.refresh();
        // this.graph.layout();
      } else {
        const edges = this.graph.getEdges();
        edges.forEach((edge) => {
          const model = edge.getModel();
          if (model.label === category) {
            model.style.lineWidth = size / 6;
            this.graph.updateItem(edge, model);
          }
        });
      }
      this.graph.refresh();
      this.graph.layout();
    },
    newServiceCategory() {
      this.$refs.leftbar.activeName = "third";
      eventBus.$emit("getsource", null);
    },
    updateItem(item, model) {
      this.graph.updateItem(item, model);
    },
    async deletePlanEntity() {
      try {
        let res = await eksApi.deletePlanEntity({
          rowKey: this.activeItem.getModel().rowKey,
        });
        if (res.data.code == "200") {
          this.$message.success(res.data.msg);
          this.graph.removeItem(this.activeItem);
          this.activeItem = null;
        } else {
          this.$message.error("删除失败");
        }
      } catch (error) {}
    },
    clearGraph() {
      console.log("清除");
      this.graph.clear();
      this.activeItem = null;
    },
  },
};
</script>
    
<style lang="scss" scoped>
.graph-container {
  background-color: #f0f0f0;
  // width: 100vw;
  // height: 100vh;
  overflow: hidden;
  // margin-right: 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  min-width: 1200px;
  // min-height: 600px;
}
.main {
  // width: 100%;
  // background-color: #f0f0f0;
  margin-left: 410px;
  padding-top: 10px;
  margin-right: 10px;
}
#container {
  background-color: #fff;
  margin-top: 10px;
  border-radius: 5px;
  box-shadow: 0px 1px 4px 0px #ccc;
  position: relative;
  .editbar {
    position: absolute;
    top: 20px;
    left: 20px;
  }
}
.graph-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: #f5f5f5;
}
.graph-container::-webkit-scrollbar-track {
  // -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}
.graph-container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  // -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #555;
}
</style>
    





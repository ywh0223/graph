<template>
  <div class="headbar">
    <ul class="nodes">
      <li :style="'background:#C990C0'">
        *({{ nodeTypeList.total + fatherNodeTypeList.total }})
      </li>
      <li
        v-for="(item, index) in nodeTypeList"
        :key="index"
        :style="'background:' + item.color"
        @click="showTool(item)"
      >
        {{ item.entityCategory }}({{ item.num }})
      </li>
      <!-- 责任事件 -->
      <el-popover
        placement="bottom"
        trigger="hover"
      >
        <li
          slot="reference"
          v-show="fatherNodeTypeList.length"
          :style="'background:#90ee90'"
        >
          责任事件({{ fatherNodeTypeList.total }})
        </li>
        <ul class="father-nodes">
          <li
            v-for="(item, index) in fatherNodeTypeList"
            :key="index"
            :style="'background:' + item.color"
            @click="showTool(item)"
          >
            {{ item.entityCategory }}({{ item.num }})
          </li>
        </ul>
      </el-popover>
    </ul>
    <ul class="edges">
      <li :style="'background:#C990C0'">*({{ edgeTypeList.total }})</li>
      <li
        v-for="(item, index) in edgeTypeList"
        :key="index"
        :style="'background:' + item.color"
        @click="showTool(item)"
      >
        {{ item.label }}({{ item.num }})
      </li>
    </ul>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
export default {
  name: "headbar",
  data() {
    return {
      // graph: null,
    };
  },
  mounted() {
    // console.log(this.nodes)
  },
  updated() {
    // console.log(this.nodes)
  },
  computed: {
    // 责任事件实体合并
    fatherNodeTypeList() {
      let nodeTypeList = [];
      this.nodes.forEach((item) => {
        if (item.getModel().fatherEntityCategory) {
          nodeTypeList.push(item.getModel().entityCategory);
        }
      });
      // 去重
      nodeTypeList = Array.from(new Set(nodeTypeList));
      nodeTypeList = nodeTypeList.map((item) => {
        let obj = {};
        obj.entityCategory = item;
        obj.num = this.nodes.filter((node) => {
          return node.getModel().entityCategory === item;
        }).length;
        obj.color = this.nodes
          .find((node) => {
            return node.getModel().entityCategory === item;
          })
          .getModel().style.fill;
        return obj;
      });
      let total = 0;
      nodeTypeList.forEach((item) => {
        total += item.num;
      });
      nodeTypeList.total = total;
      return nodeTypeList;
    },
    nodeTypeList() {
      let nodeTypeList = [];
      this.nodes.forEach((item) => {
        if (!item.getModel().fatherEntityCategory) {
          nodeTypeList.push(item.getModel().entityCategory);
        }
      });
      // 去重
      nodeTypeList = Array.from(new Set(nodeTypeList));
      nodeTypeList = nodeTypeList.map((item) => {
        let obj = {};
        obj.entityCategory = item;
        obj.num = this.nodes.filter((node) => {
          return node.getModel().entityCategory === item;
        }).length;
        obj.color = this.nodes
          .find((node) => {
            return node.getModel().entityCategory === item;
          })
          .getModel().style.fill;
        return obj;
      });
      let total = 0;
      nodeTypeList.forEach((item) => {
        total += item.num;
      });
      nodeTypeList.total = total;
      return nodeTypeList;
    },
    edgeTypeList() {
      let edgeTypeList = [];
      this.edges.forEach((item) => {
        edgeTypeList.push(item.getModel().label);
      });
      edgeTypeList = Array.from(new Set(edgeTypeList));
      edgeTypeList = edgeTypeList.map((item) => {
        let obj = {};
        obj.label = item;
        obj.num = this.edges.filter((edge) => {
          return edge.getModel().label === item;
        }).length;
        obj.color = this.edges
          .find((edge) => {
            return edge.getModel().label === item;
          })
          .getModel().style.stroke;
        return obj;
      });
      let total = 0;
      edgeTypeList.forEach((item) => {
        total += item.num;
      });
      edgeTypeList.total = total;
      return edgeTypeList;
    },
  },
  props: {
    nodes: {
      type: Array,
      default: () => [],
    },
    edges: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    showTool(item) {
      eventBus.$emit("showTool", item);
    },
  },
};
</script>

<style lang='scss' scoped>
.headbar {
  // height: 60px;
  line-height: 60px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0px 1px 4px 0px #ccc;
  padding-top: 10px;
  padding-bottom: 10px;
}
.headbar ul {
  display: flex;
  font-size: 12px;
  margin-left: 15px;

  li {
    // width: 80px;
    color: #fff;
    padding: 0 10px;
    height: 20px;
    line-height: 20px;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    // margin-top: 10px;
    margin-right: 15px;
  }
}
.father-nodes {
  font-size: 12px;
  margin-left: 15px;
  li {
    // width: 100px;
    // overflow:visible;
    color: #fff;
    // padding: 0 !important;
    height: 20px;
    line-height: 20px;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    margin-top: 10px;
    // margin-right: 15px;
  }
}
.headbar .edges {
  margin-top: 10px;
}
</style>
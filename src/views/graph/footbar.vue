<template>
  <div class="footbar">
    <div class="detail" v-if="footItem">
      <div class="category" :style="'background:' + footItem.getModel().style.fill">
        {{ model.entityCategory }}
      </div>
      <div class="label">{{ label }}</div>
    </div>
    <div class="tool" v-if="istoolShow && !footItem">
      <div class="category" :style="'background:' + currentColor">
        {{ currentCategory }}
      </div>
      <div class="colorpannel">
        <div>Color:</div>
        <div
          :style="'background-color:' + item"
          v-for="(item, index) in colorPannel"
          :key="index"
          class="color-pot"
          @click="changeColor(item)"
          :class="{ active: item === currentColor }"
        ></div>
      </div>
      <div class="sizepannel">
        <div>Size:</div>
        <div
          class="size-pot"
          v-for="(item, index) in sizePot"
          :key="index"
          :style="'width:' + item + 'px;height:' + item + 'px'"
          @click="changeSize(sizePannel[index])"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
export default {
  name: "footbar",
  data() {
    return {
      istoolShow: false,
      currentColor: "",
      currentItem:"",
      currentCategory: "",
      colorPannel: [
        "#604A0E",
        "#C990C0",
        "#F79767",
        "#57C7E3",
        "#F16667",
        "#D9C8AE",
        "#8DCC93",
        "#ECB5C9",
        "#4C8EDA",
        "#FFC454",
        "#DC7B9B",
        "#569480",
        "#90ee90"
      ],
      sizePannel: [20, 40, 60, 80, 100],
      sizePot: [10, 12, 14, 16, 18],
    };
  },
  props: {
    footItem: {
      type: Object,
      default: () => {},
    },
  },
  created() {
    eventBus.$on("showTool", (item) => {
      this.showTool(item);
    });
  },
  computed: {
    model() {
      if (this.footItem) {
        return this.footItem.getModel();
      }
    },
    category() {
      if (this.footItem) {
        return this.footItem.getModel().entityCategory;
      }
    },
    label() {
      if (this.footItem) {
        return (
          this.footItem.getModel().entityName
        );
      }
    },
  },
  methods: {
    changeColor(color) {
      this.$emit("changeColor", color, this.currentItem, this.currentCategory);
      this.currentColor = color
    },
    changeSize(size) {
      this.$emit("changeSize", size, this.currentItem,this.currentCategory)
    },
    showTool(item) {
      this.istoolShow = true;
      // 当前颜色高亮
      this.currentColor = this.colorPannel.find((color) => {
        return color === item.color;
      });
      if(item.entityCategory){
        this.currentCategory = item.entityCategory
        this.currentItem = "node"
      } else {
        this.currentCategory = item.label
        this.currentItem = "edge"
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.footbar {
  height: 60px;
  // line-height: 60px;
  font-size: 14px;
  text-align: center;
  // border-top: 1px solid;
  background-color: #fff;
  border-radius: 5px;
  // position: absolute;
  margin-top: 10px;
  // margin-bottom: 10px;
  // left: 260px;
  // right: 10px;
  // bottom: 10px;
  box-shadow: 0px 1px 4px 0px #ccc;
  .detail {
    height: 60px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    .category {
      padding: 0 10px;
      height: 20px;
      line-height: 20px;
      border-radius: 10px;
      margin-right: 15px;
      // 控制收缩比例
      flex-shrink: 0;
    }
    .label {
      text-align: left;
      line-height: 1.2;
    }
  }
  
  .tool {
    height: 60px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    .category {
      padding: 0 10px;
      height: 20px;
      line-height: 20px;
      border-radius: 10px;
      margin-right: 15px;
      // 控制收缩比例
      flex-shrink: 0;
      color: #fff;
    }
    .colorpannel {
      display: flex;
      align-items: center;
      .color-pot {
        width: 15px;
        height: 15px;
        opacity: 0.5;
        border-radius: 50%;
        cursor: pointer;
      }
    }
    .color-pot:hover {
      opacity: 1;
    }
    .active {
      opacity: 1 !important;
    }
    .sizepannel {
      display: flex;
      align-items: center;
      margin-left: 20px;
      .size-pot {
        background-color: #aaaaaa;
        border-radius: 50%;
        opacity: 0.5;
        cursor: pointer;
      }
    }
    .size-pot:hover {
      opacity: 1;
    }
    .color-pot, .size-pot {
      margin-left: 5px;
    }
  }
}
</style>
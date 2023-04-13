<template>
  <div class="leftbar-container">
    <div class="goback-btn">
      <el-button
        icon="el-icon-arrow-left"
        plain
        size="mini"
        @click="$router.go(-1)"
        >返回</el-button
      >
      <el-button
        icon="el-icon-plus"
        plain
        size="mini"
        @click="getEvents"
        v-if="$route.params.type == 'emergencyRecommend'"
        >订阅事件</el-button
      >
    </div>

    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="图索引" name="first">
        <!-- 默认 -->
        <div
          class="default"
          v-if="$route.params.type == 'default' || $route.params.type == 'edit'"
        >
          <el-input
            placeholder="请输入内容"
            v-model="input"
            class="input-with-select"
            clearable
          >
            <el-select v-model="radio" slot="prepend" placeholder="请选择">
              <el-option label="业务类别" value="SERVICE_CATEGORY"></el-option>
              <el-option label="应急预案" value="EMERGENCY_PLAN"></el-option>
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getCategoryOrPlanLikeKeyword"
            ></el-button>
          </el-input>
          <div class="search-result">
            <el-card
              shadow="hover"
              v-for="(item, index) in resultList"
              :key="index"
              @click.native="showInGraph(item)"
              >{{ item.entityName }}</el-card
            >
          </div>
        </div>
        <!-- 应急事件推荐 -->

        <div
          class="search-input"
          v-if="$route.params.type == 'emergencyRecommend'"
        >
          <el-input placeholder="请输入事件详情" v-model="eventInput" clearable>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getServiceCategoryByEmergencyEvent(eventInput)"
            ></el-button>
          </el-input>
        </div>
        <div
          class="emergencyRecommend"
          v-if="$route.params.type == 'emergencyRecommend'"
        >
          <el-card
            shadow="hover"
            v-for="(item, index) in emergencyRecommendList"
            :key="index"
            @click.native="getServiceCategoryByEmergencyEvent(item.content)"
            >{{ item.content }}</el-card
          >
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="$route.params.type == 'edit' ? '实体编辑' : '节点详情'"
        name="second"
        class="node-detail-pane"
      >
        <div v-if="!item">请选择实体</div>
        <el-card shadow="always" v-if="item">
          <!-- <el-row>
            <el-col :span="4" style="font-weight: bold"
              ><span>节点名称</span></el-col
            >
            <el-col :span="19" :offset="1"
              ><span>{{ itemModel.entityName||itemModel.planName||itemModel.agencyName || itemModel.elementContent }}</span></el-col
            >
          </el-row> -->
          <div class="node-detail">
            <div class="node-attr">
              <div style="font-weight: 500; font-size: 18px" class="title">
                节点详情
              </div>
              <el-row v-if="itemModel.rowKey" style="margin-bottom: 20px">
                <el-col :span="4" style="font-weight: bold"
                  ><span>节点ID</span></el-col
                >
                <el-col :span="19" :offset="1"
                  ><span>{{ itemModel.rowKey }}</span></el-col
                >
              </el-row>
              <el-row
                v-if="itemModel.entityCategory"
                style="margin-bottom: 20px"
              >
                <el-col :span="4" style="font-weight: bold"
                  ><span>节点类型</span></el-col
                >
                <el-col :span="19" :offset="1"
                  ><span>{{ itemModel.entityCategory }}</span></el-col
                >
              </el-row>
              <el-divider content-position="center" style="margin: 20px 0"
                >节点属性</el-divider
              >
              <el-row :gutter="20">
                <el-col :span="12"
                  ><el-input
                    style="width: 100%"
                    size="small"
                    disabled
                    value="节点名称"
                  ></el-input
                ></el-col>
                <el-col :span="12"
                  ><el-input
                    style="width: 100%"
                    size="small"
                    :disabled="$route.params.type != 'edit'"
                    v-model="attributeForm.entityName"
                  ></el-input
                ></el-col>
              </el-row>
              <div v-if="itemModel.entityCategory == '应急预案'">
                <el-row :gutter="20" v-if="itemModel.publishYear">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="发布年限"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.publishYear"
                    ></el-input
                  ></el-col>
                </el-row>
                <el-row :gutter="20" v-if="itemModel.planCategory">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="预案类型"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.planCategory"
                    ></el-input
                  ></el-col>
                </el-row>
              </div>
              <div v-else-if="itemModel.entityCategory == '政府机构'">
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="联系电话"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.contactInfo"
                    ></el-input
                  ></el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="机构地址"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.address"
                    ></el-input
                  ></el-col>
                </el-row>
              </div>
              <div v-else-if="itemModel.entityCategory == '处置要素'">
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="处置阶段"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.elementPhase"
                    ></el-input
                  ></el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="处置类型"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.elementType"
                    ></el-input
                  ></el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="业务类别"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      v-model="attributeForm.serviceCategory"
                    ></el-input
                  ></el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="应急预案"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      v-model="attributeForm.sourcePlan"
                    ></el-input
                  ></el-col>
                </el-row>
              </div>
              <div v-else-if="itemModel.entityCategory == '标准定义'">
                <el-row :gutter="20">
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      value="定义解释"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      v-model="attributeForm.explanation"
                    ></el-input
                  ></el-col>
                </el-row>
              </div>
              <div v-else>
                <el-row
                  :gutter="20"
                  v-for="(val, key, i) in itemModel.attributes"
                  :key="i"
                >
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      disabled
                      :value="key"
                    ></el-input
                  ></el-col>
                  <el-col :span="12"
                    ><el-input
                      style="width: 100%"
                      size="small"
                      :disabled="$route.params.type != 'edit'"
                      :value="val"
                    ></el-input
                  ></el-col>
                </el-row>
              </div>
              <el-row :gutter="20" v-if="$route.params.type == 'edit'">
                <el-col :span="12"
                  ><el-button
                    style="width: 100%"
                    size="small"
                    type="primary"
                    @click="updateEntity"
                    >修改</el-button
                  ></el-col
                >
                <el-col :span="12"
                  ><el-button
                    style="width: 100%"
                    size="small"
                    type="danger"
                    @click="deletePlanEntity"
                    >删除</el-button
                  ></el-col
                >
              </el-row>
            </div>
            <div class="node-relation">
              <el-tabs v-model="activeRelationName" @tab-click="handleClick">
                <el-tab-pane label="出边关系" name="first">
                  <div class="outedges">
                    <div v-for="(item, index) in itemOutEdges" :key="index">
                      <div class="edges-item">
                        <div class="left">{{ item.getModel().label }}</div>
                        <div class="right">
                          <el-popover
                            placement="right"
                            width="200"
                            trigger="hover"
                            :content="item.getTarget().getModel().entityName"
                            :disabled="
                              item.getTarget().getModel().entityCategory !=
                              '处置要素'
                            "
                          >
                            <div class="nodename" slot="reference">
                              {{ item.getTarget().getModel().entityName }}
                            </div>
                          </el-popover>
                        </div>
                      </div>
                      <el-divider></el-divider>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="入边关系" name="second">
                  <div class="inedges">
                    <div v-for="(item, index) in itemInEdges" :key="index">
                      <div class="edges-item"> 
                        <div class="left">
                          <el-popover
                            placement="right"
                            width="200"
                            trigger="hover"
                            :content="item.getSource().getModel().entityName"
                          >
                            <div class="nodename" slot="reference">
                              {{ item.getSource().getModel().entityName }}
                            </div>
                          </el-popover>
                        </div>
                        <div class="right">{{ item.getModel().label }}</div>
                      </div>
                      <el-divider></el-divider>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane
        label="创建实体"
        name="forth"
        v-if="$route.params.type == 'edit'"
      >
        <AddEntity />
      </el-tab-pane>
      <el-tab-pane
        label="创建关系"
        name="third"
        v-if="$route.params.type == 'edit'"
      >
        <AddRelation ref="AddRelation" @showInGraph="showInGraph" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { eksApi } from "@/api";
import AddEntity from "./AddEntity";
import AddRelation from "./AddRelation";
export default {
  name: "leftbar",
  components: {
    AddEntity,
    AddRelation,
  },
  data() {
    return {
      activeName: "first",
      activeRelationName: "first",
      radio: "SERVICE_CATEGORY",
      input: "",
      eventInput: "",
      resultList: [],
      emergencyRecommendList: [],
      entityType: "",
      attributeForm: {},
      item: null,
    };
  },

  props: {
    activeItem: {
      type: Object,
      default: null,
    },
  },

  watch: {
    activeItem(newVal) {
      if (!newVal) {
        return;
      } else {
        this.item = newVal;
      }
    },
    item(newVal) {
      if (!newVal) {
        this.attributeForm = {};
      } else {
        const itemModel = newVal.getModel();
        itemModel.entityName =
          // itemModel.serviceCategoryName ||
          itemModel.entityName ||
          itemModel.planName ||
          itemModel.agencyName ||
          itemModel.elementContent ||
          itemModel.term;
        this.attributeForm = Object.assign({}, itemModel);
      }
    },
  },
  computed: {
    itemModel() {
      return this.item.getModel();
    },
    itemOutEdges() {
      // console.log(this.item.getOutEdges())
      return this.item.getOutEdges();
    },
    itemInEdges() {
      return this.item.getInEdges();
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.query.planTitle) {
        this.radio = "EMERGENCY_PLAN";
        this.input = this.$route.query.planTitle;
        this.getCategoryOrPlanLikeKeyword();
      }
    });
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async getCategoryOrPlanLikeKeyword() {
      const entityCategory =
        this.radio === "SERVICE_CATEGORY" ? "业务类别" : "应急预案";
      if (this.input == "") {
        this.$message({
          message: "请输入搜索内容",
          type: "error",
        });
      } else {
        console.log(eksApi);
        try {
          let res = await eksApi.getCategoryOrPlanLikeKeyword({
            keyword: this.input,
            entityType: this.radio,
          });
          if (entityCategory == "应急预案") {
            if (res.data.data.length == 0) {
              this.$message.warning("暂无相关预案");
            } else {
              const promiseList = [];
              res.data.data.forEach((item) => {
                const promise = this.getCategoryByPlanName(item.entityName);
                promiseList.push(promise);
              });
              try {
                //  并发请求
                const resultList = await Promise.all(promiseList);
                this.resultList = res.data.data.map((item, index) => {
                  item.entityCategory = entityCategory;
                  item.serviceCategory = resultList[index].data.data;
                  return item;
                });
              } catch (error) {
                this.$message.error("暂无数据");
                console.log(error);
              }
            }
          } else {
            if (res.data.data.length == 0) {
              this.$message.warning("暂无相关业务类别");
            } else {
              this.resultList = res.data.data.map((item) => {
                item.entityCategory = entityCategory;
                return item;
              });
            }
          }
        } catch (error) {
          this.$message.error("暂无数据");
          console.log(error);
        }
      }
    },

    getCategoryByPlanName(name) {
      return eksApi.getCategoryByPlanName({
        emergencyPlanName: name,
      });
      // return this.$axios({
      //   method: "get",
      //   url: "/graph/EmergencyPlanKnowledgeService/getCategoryByPlanName",
      //   params: {
      //     emergencyPlanName: name,
      //   },
      // });
    },
    async getServiceCategoryByEmergencyEvent(content) {
      try {
        let res = await eksApi.getServiceCategoryByEmergencyEvent({
          emergencyEvent: content,
        });
        console.log(res);
        if (res.data.data.serviceCategory) {
          try {
            let _res = await eksApi.getFirstDetailsWithServiceCategory({
              indexValue: res.data.data.serviceCategory,
              indexType: 0,
              isRootNode: true,
            });
            if (_res.data.data) {
              _res.data.data.entityName = _res.data.data.serviceCategoryName;
              this.showInGraph(_res.data.data);
            } else {
              this.$message.warning("暂无相关业务类别");
            }
          } catch (error) {}
        } else {
          this.$confirm(
            `该事件类型为：${res.data.data.label},暂无相关预案，是否新增？`,
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "info",
            }
          )
            .then(() => {
              this.$emit("clearGraph");
              this.$router.push({
                name: "graph",
                params: {
                  type: "edit",
                },
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    async updateEntity() {
      const category = this.itemModel.entityCategory;
      const _params = {};
      _params.rowKey = this.itemModel.rowKey;
      // _params.entityCategory = category;
      if (category == "业务类别") {
        _params.serviceCategoryName = this.attributeForm.entityName;
        try {
          let res = await eksApi.updateServiceCategoryAttributes(_params);
          if (res.data.code == "200") {
            this.$message.success("修改成功");
            // const model = Object.assign(this.itemModel,res.data.data)
            // console.log(model)
            this.item.getModel().entityName = res.data.data.serviceCategoryName;
            // this.$emit('updateItem',this.item,model)
          } else {
            this.$message.error("修改失败");
          }
        } catch (error) {
          this.$message.error(error);
        }
      } else if (category == "应急预案") {
        _params.planName = this.attributeForm.entityName;
        _params.publishYear = this.attributeForm.publishYear;
        _params.planCategory = this.attributeForm.planCategory;
        let res = await eksApi.updateEmergencyPlanAttributes(_params);
        if (res.data.code == "200") {
          const data = res.data.data;
          const model = this.item.getModel();
          this.$message.success("修改成功");
          model.entityName = data.planName;
          model.publishYear = data.publishYear;
          model.planCategory = data.planCategory;
        } else {
          this.$message.error("修改失败");
        }
      } else if (category == "政府机构") {
        _params.agencyName = this.attributeForm.entityName;
        _params.entityCategory = this.attributeForm.entityCategory;
        _params.address = this.attributeForm.address;
        _params.contactInfo = this.attributeForm.contactInfo;
        let res = await eksApi.updateGovernmentAgencyAttributes(_params);
        if (res.data.code == "200") {
          const data = res.data.data;
          const model = this.item.getModel();
          this.$message.success("修改成功");
          model.entityName = data.agencyName;
          model.entityCategory = data.entityCategory;
          model.address = data.address;
          model.contactInfo = data.contactInfo;
        } else {
          this.$message.error("修改失败");
        }
      } else if (category == "处置要素") {
        _params.elementContent = this.attributeForm.entityName;
        _params.elementType = this.attributeForm.elementType;
        _params.elementPhase = this.attributeForm.elementPhase;
        let res = await eksApi.updateDisposalElementAttributes(_params);
        if (res.data.code == "200") {
          const data = res.data.data;
          const model = this.item.getModel();
          this.$message.success("修改成功");
          model.entityName = data.elementContent;
          model.elementType = data.elementType;
          model.elementPhase = data.elementPhase;
        } else {
          this.$message.error("修改失败");
        }
      } else if (category == "业务组织") {
        _params.organizationName = this.attributeForm.entityName;
        let res = await eksApi.updateServiceOrganizationAttributes(_params);
        if (res.data.code == "200") {
          const data = res.data.data;
          const model = this.item.getModel();
          this.$message.success("修改成功");
          model.entityName = data.organizationName;
        } else {
          this.$message.error("修改失败");
        }
      } else if (category == "标准定义") {
        _params.term = this.attributeForm.entityName;
        _params.explanation = this.attributeForm.explanation;
        let res = await eksApi.updateStandardDefinitionAttributes(_params);
        if (res.data.code == "200") {
          const data = res.data.data;
          const model = this.item.getModel();
          this.$message.success("修改成功");
          model.entityName = data.term;
          model.explanation = data.explanation;
        } else {
          this.$message.error("修改失败");
        }
      }
    },
    deletePlanEntity() {
      this.$emit("deletePlanEntity");
    },
    async getEvents() {},
    showInGraph(item) {
      console.log(item);
      this.$emit("showInGraph", item);
    },
    clearGraph() {
      this.$emit("clearGraph");
    },
  },
};
</script>

<style lang='scss' scoped>
.leftbar-container {
  background-color: #fff;
  position: absolute;
  left: 0;
  top: 0;
  // right: 0;
  bottom: 0;
  width: 400px;
  border-right: 1px solid #e6e9ed;
  overflow: hidden;
  font-size: 14px;
  padding: 10px;
  .goback-btn {
    margin: 10px;
    margin-left: 0;
    display: flex;
    justify-content: space-between;
  }
  .search-type {
    margin: 20px 0;
    // text-align: center;
  }
  .search-result,
  .emergencyRecommend {
    // margin-top: 30px;
    .el-card {
      // margin: 0 5px;
      margin-top: 10px;
    }
  }
}
// .first-tab {
//   position: absolute;
//   top: 100px;
//   bottom: 0;
//   overflow: scroll;
//   ::v-deep .el-tabs__content {
//   position: absolute;
//   top: 100px;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   overflow: scroll;
//   .node-relation {
//     position: absolute;
//     bottom: 0;
//     top: 300px;
//     left: 0;
//     overflow: scroll;
//   }
//   }

// }

.outedges {
  // overflow: auto;

  .edges-item {
    display: flex;
    // height: 20px;
    align-items: center;
    // justify-content: space-between;
    .left {
      flex-shrink: 0;
      margin-right: 20px;
      // height: 100%;
    }

    .nodename {
      width: 280px;
      overflow-x: hidden;
      // overflow-y: visible;
      text-overflow: ellipsis;
      white-space: nowrap;
      // height: 20px;
      line-height: 1.5;
    }
  }
}
.inedges {
  .edges-item {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    .left {
      flex-shrink: 0;
      margin-right: 20px;
    }
    .nodename {
      width: 280px;
      overflow-x: hidden;
      // overflow-y: visible;
      text-overflow: ellipsis;
      white-space: nowrap;
      // height: 20px;
      line-height: 1.5;
    }
  }
}

::v-deep .el-tabs__item {
  font-size: 16px;
}
.el-select {
  width: 120px;
}
::v-deep .el-input-group__prepend {
  background-color: #fff;
}
::v-deep .el-tabs {
  border: none;
}
// ::v-deep .el-popover__reference-wrapper {
//    overflow-y: visible;
// }
.node-detail {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  .node-attr {
    flex-shrink: 0;
    .el-divider {
      margin: 20px 0;
    }
  }
  .node-relation {
    flex: auto;
    overflow: scroll;
    line-height: 1.5;
    .el-divider {
      margin: 12px 0;
    }
    // overflow-y: visible;
    .outedges {
      overflow: scroll;
      // overflow-y: visible;
    }
  }
  .title {
    margin-bottom: 20px;
  }
}
.node-attr {
  .el-row {
    margin-bottom: 10px;
  }
}
</style>
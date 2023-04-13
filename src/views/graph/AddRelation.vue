<template>
  <div>
    <div v-if="!source">请选择起始实体</div>
    <el-form
      ref="form"
      :model="form"
      label-width="100px"
      :rules="rules"
      label-position="right"
      v-if="source"
    >
      <!-- <el-row> -->
      <el-form-item label="起始实体名称" v-if="source">
        <el-input
          :value="
            sourceModel.entityName ||
            sourceModel.planName ||
            sourceModel.agencyName ||
            sourceModel.elementContent
          "
          disabled
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="关系类型" prop="relationType" v-if="source != null">
        <el-select
          placeholder="请选择实体关系"
          v-model="form.relationType"
          size="small"
          @change="setEntityCategory"
          style="width: 100%"
        >
          <el-option
            :label="item.label"
            :value="item.value"
            v-for="(item, index) in relationList"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="目标实体类型" v-if="form.relationType">
        <el-input
          v-model="entityCategory.label"
          readonly
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item label="目标实体名称" v-if="entityCategory.label">
        <el-select
          v-model="target"
          value-key="rowKey"
          filterable
          remote
          clearable
          placeholder="请输入关键词查找"
          :remote-method="getEntityByKeywordAndCategory"
          :loading="loading"
          size="small"
          style="width: 100%"
        >
        <!-- select的value-key 对应 option的key-->
          <el-option
            v-for="item in targetList"
            :key="item.rowKey"
            :label="item.entityName"
            :value="item"
          >
          </el-option>
          <el-pagination
            layout="prev, pager, next"
            :page-count="totalPages"
            :page-size="pageSize"
            @next-click="nextPage"
            @prev-click="prevPage"
            @current-change="gotoPage"
          ></el-pagination>
        </el-select>
      </el-form-item>
      <div style="text-align: right">
        <el-button
          type="primary"
          @click="save"
          size="small"
          style="width: 100px"
          >创建关系</el-button
        >
      </div>
      <!-- <el-form-item label="实体名称" prop="entityName">
        <el-input v-model="form.entityName" placeholder="请输入实体名称">
        </el-input>
      </el-form-item> -->
      <!-- </el-row> -->
    </el-form>
    <!-- 属性表单 根据实体类别变化-->

    <!-- <el-button @click="cancel">取 消</el-button> -->
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import { eksApi } from "@/api";
export default {
  name: "AddRelation",
  data() {
    return {
      source: null,
      target: null,
      relationList: [],
      entityCategory: {},
      query:"",
      targetList: [],
      loading: false,
      currentPage: 0,
      pageSize: 10,
      totalPages:0,
      form: {},
      rules: {},
      attributesForm: {},
      attributesFormRules: {},
    };
  },
  created() {
    eventBus.$on("getSource", (node) => {
      Object.assign(this.$data, this.$options.data());
      this.source = node;
    });
  },
  mounted() {
    // console.log(this.nodes)
  },
  updated() {},
  watch: {
    source(newVal) {
      // 清空所有data
      // Object.assign(this.$data, this.$options.data());
      if (!newVal) {
        Object.assign(this.$data, this.$options.data());
      } else {
        this.form = {};
        this.entityCategory = {};
        this.attributesForm = {};
        const category = newVal.getModel().entityCategory;
        if (category == "业务类别") {
          this.relationList = [
            {
              label: "涵盖-应急预案",
              relationName: "涵盖",
              value: "INCLUDE_RELATION",
              target: { label: "应急预案", value: "EMERGENCY_PLAN" },
            },
          ];
        } else if (category == "应急预案") {
          this.relationList = [
            {
              label: "指导-政府机构",
              relationName: "指导",
              value: "GUIDING_RELATION",
              target: { label: "政府机构", value: "GOVERNMENT_AGENCY" },
            },
            {
              label: "来源-政府机构",
              relationName: "来源",
              value: "WRITTEN_BY_RELATION",
              target: { label: "政府机构", value: "GOVERNMENT_AGENCY" },
            },
            {
              label: "定义-标准定义",
              relationName: "定义",
              value: "DEFINING_RELATION",
              target: { label: "标准定义", value: "STANDARD_DEFINITION" },
            },
            {
              label: "定义-业务组织",
              relationName: "定义",
              value: "DEFINING_ORG_RELATION",
              target: { label: "业务组织", value: "SERVICE_ORGANIZATION" },
            },
          ];
        } else if (category == "政府机构") {
          this.relationList = [
            {
              label: "负责-处置要素",
              relationName: "负责",
              value: "RESPONSIBLE_TO_RELATION",
              target: { label: "处置要素", value: "DISPOSAL_ELEMENT" },
            },
            {
              label: "汇报-业务组织",
              relationName: "汇报",
              value: "REPORT_TO_RELATION",
              target: { label: "业务组织", value: "SERVICE_ORGANIZATION" },
            },
          ];
          console.log(newVal);
        } else {
          this.relationList = [];
        }
      }
    },
  },
  computed: {
    sourceModel() {
      return this.source.getModel();
    },
  },
  props: {
    relation: {
      type: String,
      default: () => "",
    },
  },
  methods: {
    setEntityCategory(val) {
      console.log(val);
      this.entityCategory = this.relationList.find((item) => {
        return item.value == val;
      }).target;
      console.log(this.entityCategory);
      if (this.entityCategory.label == "处置要素") {
        this.attributesForm.serviceCategory = this.source
          .getNeighbors("source")[0]
          .getNeighbors("source")[0]
          .getModel().entityName;
        this.attributesForm.emergencyPlan = this.source
          .getNeighbors("source")[0]
          .getModel().entityName;
      } else {
        this.attributesForm = {};
      }
    },
    selectEntity(item) {
      console.log(item);
      this.form.entityName = item;
      console.log(this.form.entityName);
    },
    setAttribute() {},
    async getEntityByKeywordAndCategory(query) {
      
      if (query !== "") {
        // 保存query 下一页用
        this.query = query 
        this.loading = true;
        const _params = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          keyword: query,
          entityType: this.entityCategory.value,
        };
        let res = await eksApi.getEntityByKeywordAndCategory(_params);
        if (res.data.code == "200") {
          this.loading = false;
          this.targetList = res.data.data.content;
          this.totalPages = res.data.data.totalPages
        }
      } else {
        this.targetList = [];
      }
    },
    async createPlanRelation(source, target) {
      const _params = {};
      _params.relationName = this.relationList.find((item) => {
        return item.value == this.form.relationType;
      }).relationName;
      _params.relationType = this.form.relationType;
      _params.sourceEntityId = source.rowKey;
      _params.sourceEntityName = source.entityName;
      _params.targetEntityName = target.entityName;
      _params.targetEntityId = target.rowKey;
      console.log(_params);
      console.log(target);
      try {
        let res = await eksApi.createPlanRelation(_params);
        if (res.data.code == "200" && res.data.data == true) {
          this.$message.success("创建成功");
          eventBus.$emit("getNextNodes", this.source);
          Object.assign(this.$data, this.$options.data());
        } else if ((res.data.code = "801")) {
          this.$message.warning(res.data.msg);
        }
      } catch (error) {
        console.log(error);
        this.$message.error("创建关系失败");
      }
      console.log(source, target);
    },
    save() {
      // this.createPlanEntity();
      if (!this.target) {
        this.$message.warning("请选择目标实体");
        return;
      }
      this.createPlanRelation(this.sourceModel, this.target);
    },
    cancel() {
      this.dialogFormVisible = false;
    },
    clearForm() {
      // 初始化全部的data
      this.source = null;
      Object.assign(this.$data, this.$options.data());
    },
    showTool(item) {
      eventBus.$emit("showTool", item);
    },
    nextPage() {
      this.currentPage = this.currentPage + 1;
      this.getEntityByKeywordAndCategory(this.query);
    },
    prevPage() {
      this.currentPage = this.currentPage - 1;
      this.getEntityByKeywordAndCategory(this.query);
    },
    gotoPage(arg) {
      this.currentPage = arg - 1
      this.getEntityByKeywordAndCategory(this.query)
    },
  },
};
</script>

<style lang='scss' scoped>
.el-pagination {
  text-align: center;
}
</style>
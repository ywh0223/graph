<template>
  <div>
    <el-form ref="form" :rules="rules" :model="form" label-width="80px" label-position="left" hide-required-asterisk>
      <el-form-item label="实体类型">
        <el-select v-model="entityCategory" size="small" style="width: 100%">
          <el-option
            v-for="item in categoryList"
            :key="item.value"
            :label="item.label"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="实体名称" prop="entityName" size="small">
        <el-input v-model="form.entityName" placeholder="请输入实体名称"> </el-input>
      </el-form-item>
    </el-form>
    <el-form
      ref="attributesForm"
      :model="attributesForm"
      label-width="80px"
      label-position="left"
      size="small"
    >
      
      <div v-if="entityCategory.value == 'EMERGENCY_PLAN'">
        <el-form-item label="发布年限" prop="publish">
          <el-date-picker
            type="year"
            placeholder="选择年份"
            v-model="attributesForm.publish"
            style="width: 100%"
            value-format="yyyy"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="预案类别" prop="planType">
          <el-select
            v-model="attributesForm.planType"
            placeholder="请选择预案类别"
            style="width: 100%"
          >
            <el-option label="总体预案" value="总体预案"></el-option>
            <el-option label="公共卫生" value="公共卫生"></el-option>
            <el-option label="事故灾难" value="事故灾难"></el-option>
            <el-option label="自然灾害" value="自然灾害"></el-option>
            <el-option label="应急保障" value="应急保障"></el-option>
            <el-option label="社会安全" value="社会安全"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div v-if="entityCategory.value == 'GOVERNMENT_AGENCY'">
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model="attributesForm.tel" placeholder="请输入联系电话">
          </el-input>
        </el-form-item>
        <el-form-item label="机构地址" prop="address">
          <el-input
            v-model="attributesForm.address"
            placeholder="请输入机构地址"
          >
          </el-input>
        </el-form-item>
      </div>
      <div v-if="entityCategory.value == 'STANDARD_DEFINITION'">
        <el-form-item label="定义解释" prop="definition">
          <el-input
            v-model="attributesForm.definition"
            placeholder="请输入定义解释"
          >
          </el-input>
        </el-form-item>
      </div>
      <div v-if="entityCategory.value == 'DISPOSAL_ELEMENT'">
        <el-form-item label="处置阶段" prop="stage">
          <el-input v-model="attributesForm.stage" placeholder="请输入处置阶段">
          </el-input>
        </el-form-item>
        <el-form-item label="处置类型" prop="type">
          <el-input v-model="attributesForm.type" placeholder="请输入处置类型">
          </el-input>
        </el-form-item>
        <el-form-item label="业务类别" prop="serviceCategory">
          <el-input
            v-model="attributesForm.serviceCategory"
            placeholder="请输入业务类别"
            
          >
          </el-input>
        </el-form-item>
        <el-form-item label="应急预案" prop="emergencyPlan">
          <el-input
            v-model="attributesForm.emergencyPlan"
            placeholder="请输入应急预案"
            
          >
          </el-input>
        </el-form-item>
      </div>
      <div style="text-align: right">
          <el-button
            type="primary"
            @click="submit"
            size="small"
            style="width: 100px"
            >创建实体</el-button
          >
        </div>
    </el-form>
  </div>
</template>

<script>
import { eksApi } from "@/api";
export default {
  name: "AddEntity",
  data() {
    return {
      categoryList: [
        { label: "业务类别", value: "SERVICE_CATEGORY" },
        { label: "应急预案", value: "EMERGENCY_PLAN" },
        { label: "政府机构", value: "GOVERNMENT_AGENCY" },
        { label: "标准定义", value: "STANDARD_DEFINITION" },
        { label: "业务组织", value: "SERVICE_ORGANIZATION" },
        { label: "处置要素", value: "DISPOSAL_ELEMENT" },
      ],
      entityCategory: { label: "业务类别", value: "SERVICE_CATEGORY" },
      form:{
        entityName:''
      },
      attributesForm: {},
      rules:{
        entityName: [
          { required: true, message: "请输入实体名称", trigger: "change" },
        ],
      }
    };
  },
  created() {
    
  },
  methods: {
    submit(){
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.createPlanEntity()
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async createPlanEntity() {
      const _params = {};
      _params.entityType = this.entityCategory.value;
      _params.category = this.entityCategory.label;
      _params.entityName = this.form.entityName;
      _params.attributes = JSON.stringify(this.attributesForm)
        .replace("publish", "发布年限")
        .replace("planType", "预案类型")
        .replace("tel", "联系电话")
        .replace("address", "机构地址")
        .replace("definition", "定义解释")
        .replace("stage", "处置阶段")
        .replace("type", "处置类型")
        .replace("serviceCategory", "业务类别")
        .replace("emergencyPlan", "应急预案");

      console.log(_params);
      try {
        let res = await eksApi.createPlanEntity(_params);
        if (res.data.code == "200") {
          res.data.data.entityCategory = res.data.data.category;
          this.$message.success(res.data.msg);
          this.$nextTick( ()=>{
            // Object.assign(this.$data, this.$options.data());
            this.$refs["form"].resetFields()

          })
          Object.assign(this.$data, this.$options.data());
          // this.$refs["form"].clearValidate
          // this.$emit("showInGraph", res.data.data);
        } else if (res.data.code == "801") {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.log(error);
        this.$message.error("创建节点失败");
      }
    },
  },
};
</script>

<style>
</style>